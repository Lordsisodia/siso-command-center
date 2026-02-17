# Task System Design — OpenClaw Studio

**Date:** 2026-02-17
**Status:** Draft
**Author:** OS Builder

---

## TL;DR

A simplified, agent-native task hierarchy stored as flat JSON files that OpenClaw agents can read/write directly, with a real-time UI in OpenClaw Studio. Replaces the over-engineered BB5 system (YAML folders, timelines, journals) with something that actually ships.

---

## What BB5 Had (and What Was Wrong)

### BB5 Hierarchy

```
Core Goals (perpetual, never complete)
  └── Improvement Goals (specific initiatives)
        └── Sub-Goals (inline in goal.yaml, weighted)
              └── Plans (phases + dependencies)
                    └── Tasks (discrete work units)
                          └── Steps (inline in task)
```

### What Worked
- **Goal → Task linking** — tasks traced back to why they existed
- **Auto-calculated progress** — task completion rolled up to goals
- **Structured lifecycle** — clear states: created → active → completed
- **Separation of perpetual vs improvement goals** — avoids "100% complete" on things that never end

### What Was Wrong
- **Too many files** — each goal/task got its own folder with 3+ files (goal.yaml, timeline.yaml, journal/*.md)
- **YAML everywhere** — verbose, error-prone, agents fumble with it
- **Timeline AND journal** — redundant; pick one
- **Weights on sub-goals** — overcomplicates progress math for minimal value
- **Plans as separate entities** — unnecessary indirection between goals and tasks
- **No UI** — agents wrote to files but nobody could see the big picture
- **Manual ID management** — TASK-ARCH-010, IG-006, SG-006-1... fragile linking

---

## New Design: 3 Levels, Flat Storage, Live UI

### Hierarchy (simplified)

```
Goals           (what we want to achieve)
  └── Tasks     (what needs to be done)
        └── Steps   (how to do it — inline, auto-generated)
```

That's it. Three levels. Plans and sub-goals are gone — if a "sub-goal" is big enough to need its own tasks, make it a goal. Plans are just the ordered task list under a goal.

### Core Concepts

| Concept | Description | Example |
|---------|-------------|---------|
| **Goal** | A desired outcome with clear success criteria | "Ship task system UI in Studio" |
| **Task** | A discrete unit of work an agent can pick up | "Create TaskStore with Zustand" |
| **Step** | A checklist item within a task (inline) | "[ ] Define TypeScript interfaces" |

### Data Model

```typescript
// ---- Core Types ----

type Status = 'backlog' | 'ready' | 'active' | 'blocked' | 'done' | 'cancelled';
type Priority = 'critical' | 'high' | 'medium' | 'low';

interface Goal {
  id: string;              // auto: "goal-<nanoid>"
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  createdAt: string;       // ISO 8601
  updatedAt: string;
  completedAt?: string;
  
  // Success criteria — when is this done?
  criteria: string[];
  
  // Which agents/projects own this?
  owner?: string;          // agent id or "human"
  project?: string;        // workspace/project name
  tags: string[];
  
  // Computed
  taskIds: string[];       // ordered list
  progress: number;        // 0-100, auto-calculated from tasks
}

interface Task {
  id: string;              // auto: "task-<nanoid>"
  goalId: string;          // parent goal
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  
  // Assignment
  assignee?: string;       // agent id
  
  // Inline steps (checklist)
  steps: Step[];
  
  // Ordering
  order: number;           // position within goal
  
  // Dependencies
  blockedBy?: string[];    // task ids that must complete first
  
  // Context for the agent
  context?: string;        // markdown: what you need to know
  
  // Outcome
  result?: string;         // what actually happened (filled on completion)
}

interface Step {
  text: string;
  done: boolean;
}

// ---- Event Log (replaces BB5's timeline + journal) ----

interface TaskEvent {
  id: string;
  timestamp: string;
  goalId: string;
  taskId?: string;
  type: 'created' | 'started' | 'completed' | 'blocked' | 'unblocked' | 'comment' | 'step_done';
  actor: string;           // agent id or "human"
  message?: string;        // human-readable context
}
```

### Storage

**Single JSON file per workspace:**

```
<workspace>/tasks/
  goals.json       # { goals: Goal[] }
  tasks.json       # { tasks: Task[] }
  events.json      # { events: TaskEvent[] } — append-only log
```

Why JSON, not YAML:
- Native to TypeScript/Node — zero parsing friction
- Agents can `JSON.parse` / `JSON.stringify` without libraries
- No indentation ambiguity
- Faster reads

Why flat files, not a database:
- Agents can read/write directly with file tools
- Git-trackable (diffs show what changed)
- No server dependency
- Portable across machines

### Progress Calculation

Dead simple:

```typescript
function goalProgress(goal: Goal, tasks: Task[]): number {
  const goalTasks = tasks.filter(t => t.goalId === goal.id);
  if (goalTasks.length === 0) return 0;
  const done = goalTasks.filter(t => t.status === 'done').length;
  return Math.round((done / goalTasks.length) * 100);
}
```

No weights. Each task counts equally. If a task is bigger, break it into more tasks. Simplicity wins.

---

## Agent Interface

### How Agents Interact

Agents use standard file tools (read/write/edit) to interact with the task system. No special CLI needed.

**Picking up work:**
```
1. Read goals.json → find active goals
2. Read tasks.json → find 'ready' tasks for that goal, ordered
3. Set task status to 'active', set assignee to self
4. Work on it
5. Check off steps as they complete
6. Set status to 'done', write result
```

**Creating work:**
```
1. Agent identifies something that needs doing
2. Creates goal (or finds existing)
3. Creates tasks under it with ordered steps
4. Appends creation events to events.json
```

### Agent Conventions

- **Only one active task per agent** — focus, don't scatter
- **Write result on completion** — what actually happened
- **Append events, never delete** — events.json is append-only
- **Lock via status** — "active" + assignee = claimed

### OpenClaw Integration

We can add a skill or built-in tool that wraps the file operations:

```bash
# CLI-style (could be a skill)
tasks list --goal <id> --status ready
tasks pick <task-id>                    # sets active + assigns
tasks step-done <task-id> <step-index>  
tasks complete <task-id> --result "..."
tasks create-goal --title "..." --criteria "..."
tasks create-task --goal <id> --title "..." --steps "..."
```

Or agents just read/write the JSON directly. Both work.

---

## Studio UI

### Views

#### 1. Goals Board (default view)

Kanban-style columns:
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   BACKLOG   │ │    READY    │ │   ACTIVE    │ │    DONE     │
├─────────────┤ ├─────────────┤ ├─────────────┤ ├─────────────┤
│ ○ Ship v2   │ │ ● Task UI   │ │ ◉ Auth sys  │ │ ✓ Setup CI  │
│   0/5 tasks │ │   0/3 tasks │ │   2/4 tasks │ │   5/5 tasks │
│   ░░░░░░░░  │ │   ░░░░░░░░  │ │   ████░░░░  │ │   ████████  │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

Each goal card shows:
- Title + priority badge
- Progress bar (auto-calculated)
- Task count (done/total)
- Owner/assignee avatar
- Tags

#### 2. Goal Detail View

Click a goal → expand to see:
```
┌──────────────────────────────────────────┐
│ ◉ Build Task System UI          [ACTIVE] │
│ Ship a task management UI in Studio      │
│ ████████░░░░░░░░  50%   Owner: os-build  │
├──────────────────────────────────────────┤
│ Success Criteria:                        │
│ ☐ Goals board renders in Studio          │
│ ☐ Agents can create/complete tasks       │
│ ☑ Data model defined                     │
├──────────────────────────────────────────┤
│ Tasks:                                   │
│ ✓ 1. Define data model        os-builder │
│ ◉ 2. Create Zustand store     os-builder │
│   [ ] Define interfaces                  │
│   [x] Set up store boilerplate           │
│   [ ] Add CRUD operations                │
│ ○ 3. Build GoalsBoard component          │
│ ○ 4. Build GoalDetail component          │
│ ○ 5. Wire up file watching               │
│ ○ 6. Add agent write support             │
├──────────────────────────────────────────┤
│ Activity:                                │
│ 14:32 os-builder started task 2          │
│ 14:30 os-builder completed task 1        │
│ 13:00 human created goal                 │
└──────────────────────────────────────────┘
```

#### 3. Agent Tasks View

Per-agent view showing what each agent is working on:
```
┌─────────────────────────────────────────────┐
│ os-builder                                  │
│ Active: "Create Zustand store" (Task UI)    │
│ Queue:  3 ready tasks                       │
├─────────────────────────────────────────────┤
│ os-builder-2                                │
│ Active: "Set up auth middleware" (Auth)      │
│ Queue:  1 ready task                        │
├─────────────────────────────────────────────┤
│ task-setter                                 │
│ Idle — no active tasks                      │
└─────────────────────────────────────────────┘
```

#### 4. Activity Feed

Real-time stream of events.json — shows what's happening across all goals/tasks:
```
17:02  os-builder    completed  "Define data model"       Task UI goal
17:01  os-builder    step_done  "Set up store boiler..."  Task UI goal  
16:45  os-builder-2  started    "Set up auth middleware"   Auth goal
16:30  human         created    "Build Task System UI"     New goal
```

### UI Components (React)

```
src/features/tasks/
├── components/
│   ├── GoalsBoard.tsx          # Kanban view
│   ├── GoalCard.tsx            # Card in kanban column
│   ├── GoalDetail.tsx          # Expanded goal view
│   ├── TaskItem.tsx            # Task row with steps
│   ├── StepCheckbox.tsx        # Individual step
│   ├── AgentTasksView.tsx      # Per-agent view
│   ├── ActivityFeed.tsx        # Event stream
│   ├── CreateGoalModal.tsx     # New goal form
│   └── CreateTaskModal.tsx     # New task form
├── state/
│   └── taskStore.ts            # Zustand store
├── hooks/
│   └── useTaskFiles.ts         # File watching + sync
└── types.ts                    # TypeScript interfaces
```

### File Watching

Studio polls the JSON files (or uses fs.watch if available) to pick up agent writes in near-real-time. When an agent writes to tasks.json, the UI updates within seconds.

---

## Comparison: BB5 vs New System

| Aspect | BB5 | New |
|--------|-----|-----|
| **Levels** | 6 (goal → sub-goal → plan → task → step) | 3 (goal → task → step) |
| **Storage** | Folders + YAML files per entity | 3 JSON files per workspace |
| **Progress** | Weighted sub-goals, manual override | Simple task count ratio |
| **UI** | None | Kanban + detail + activity feed |
| **Agent interface** | Custom CLI + file writes | Standard file read/write |
| **Event tracking** | timeline.yaml + journal/*.md per goal | Single append-only events.json |
| **IDs** | Manual (TASK-ARCH-010, IG-006) | Auto (nanoid) |
| **Files per goal** | 3+ (yaml, timeline, journal/) | 0 (inline in goals.json) |
| **Linking** | Manual ID cross-references | goalId on task |

---

## Implementation Plan

### Phase 1: Data Layer (Day 1)
1. Define TypeScript interfaces in `types.ts`
2. Create Zustand store with CRUD operations
3. File read/write utilities (JSON ↔ store sync)
4. Seed with example data for testing

### Phase 2: Goals Board UI (Day 1-2)
1. GoalsBoard kanban component
2. GoalCard with progress bar
3. GoalDetail with task list and steps
4. CreateGoalModal + CreateTaskModal

### Phase 3: Agent Integration (Day 2)
1. Document agent conventions in a SKILL.md
2. Test agent creating goals and completing tasks
3. File watching for real-time sync
4. Activity feed from events.json

### Phase 4: Polish (Day 3)
1. AgentTasksView
2. Filtering and search
3. Drag-and-drop task reordering
4. Keyboard shortcuts

---

## Open Questions

1. **Multi-workspace** — Should goals be per-workspace or global? Leaning per-workspace with an aggregate view.
2. **Conflict resolution** — Two agents writing tasks.json simultaneously? Options: file locking, separate files per goal, or last-write-wins with event log as source of truth.
3. **Archival** — When goals complete, move to `archive/` folder or keep in goals.json with status=done? Leaning keep + periodic cleanup.
4. **Integration with Antfarm** — Should Antfarm workflows auto-create goals/tasks? Or stay separate?

---

## Implementation Status

### ✅ Phase 1: Data Layer (COMPLETE)
- [x] TypeScript interfaces in `types.ts`
- [x] Zustand store with CRUD operations in `state/taskStore.tsx`
- [x] File read/write utilities in `hooks/useTaskFiles.ts`
- [x] Seed data in `data/seed.ts`

### ✅ Phase 2: Goals Board UI (COMPLETE)
- [x] GoalsBoard kanban component
- [x] GoalCard with progress bar
- [x] GoalDetail with task list and steps
- [x] TaskItem with step checkboxes
- [x] ActivityFeed for event stream
- [x] Demo page at `/tasks-demo`

### ✅ Phase 3: Agent Integration (COMPLETE)
- [x] Connect store to file sync with polling (useTaskSync.ts)
- [x] Document agent conventions in SKILL.md
- [x] Seed files in workspace (`tasks/goals.json`, `tasks.json`, `events.json`)

### ✅ Phase 4: Polish (COMPLETE)
- [x] Filter by status
- [x] Search by title/description/tags
- [x] Board/List view toggle
- [x] Integration into main Studio UI at `/tasks`

---

## Integration Notes (For Later)

### Connecting to Workspace
The system reads from `<workspace>/tasks/goals.json`, `tasks.json`, `events.json`. 
Default workspace: `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/`

### Agent Conventions
When integrating with agents, document:
1. Read goals.json → find goals with status='ready' or 'active'
2. Pick a task: set status='active', assignee=agentId
3. Complete: set status='done', write result
4. Always append events, never delete

### File Watching
For real-time sync:
- Poll every 5 seconds via setInterval
- Compare mtime to detect changes
- Debounce writes to avoid thrashing
