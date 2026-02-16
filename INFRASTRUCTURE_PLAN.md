# OpenClaw Studio - UX Hierarchy & Infrastructure Plan

**Created:** 2026-02-16
**Status:** Planning

---

## The Vision

A hierarchical dashboard system where users can:

```
┌─────────────────────────────────────────────────────────────┐
│  MAIN DASHBOARD                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │ BlackBox5   │ │  Lumelle    │ │SISO Internal│         │
│  │   Widget    │ │   Widget    │ │   Widget    │         │
│  │ 3 agents    │ │ 2 agents    │ │  5 agents   │         │
│  │ ●●○         │ │ ●○          │ │ ●●●○○       │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│  PROJECT DASHBOARD: BlackBox5                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Agents                                                │   │
│  │ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │   │
│  │ │ dev-agent-01 │ │test-agent-02 │ │ deploy-03  │ │   │
│  │ │ Running ●   │ │ Idle ○       │ │ Running ●  │ │   │
│  │ └──────────────┘ └──────────────┘ └────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Recent Activity Feed                                 │   │
│  │ • dev-agent-01 started flow "deploy-web"          │   │
│  │ • test-agent-02 completed 3 tests                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  AGENT VIEW: dev-agent-01                                   │
│  ┌─────────────────────────┬───────────────────────────┐   │
│  │ Chat Panel             │ Agent Inspector            │   │
│  │ [Conversation]         │ • Status: Running          │   │
│  │                         │ • Current Task: deploy   │   │
│  │                         │ • Memory: 45% used       │   │
│  └─────────────────────────┴───────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Task List                                           │   │
│  │ ┌───────────────────────────────────────────────┐   │   │
│  │ │ ✓ Completed: Set up CI/CD pipeline          │   │   │
│  │ │ ⟳ In Progress: Deploy to staging (65%)      │   │   │
│  │ │ ○ Next: Run integration tests                │   │   │
│  │ │ ○ Planned: Deploy to production             │   │   │
│  │ └───────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Level 1: Main Dashboard

### Purpose
High-level overview of all projects and their status.

### Features
- **Project Widgets:** Each project as a card/widget
  - Project name + color
  - Agent count (running/idle/error)
  - Status indicators (colored dots)
  - Quick stats (optional): tasks today, errors
  
- **Global Activity Feed:** Recent events across all projects
- **Quick Actions:** Create new project, add agent

### Interactions
- **Click project widget** → Opens Project Dashboard
- **Hover** → Shows quick stats tooltip

### Data Sources
- Gateway: list all agents, filter by project tag
- Store: aggregate by project

---

## Level 2: Project Dashboard

### Purpose
Deep dive into a specific project - see all agents and their activity.

### Features
- **Agent List:** Grid or list of all agents in project
  - Agent name + avatar
  - Status (running/idle/error)
  - Current task (if running)
  - Last activity timestamp
  
- **Project Activity Feed:** Filtered to this project
  - Chronological list
  - Event types: started, completed, error, task
  
- **Project Settings:** (optional)
  - Edit project name/color
  - Add/remove agents
  - Project-specific config

### Interactions
- **Click agent** → Opens Agent View
- **Click "Pipeline"** → Opens React Flow pipeline view (existing)

### Data Sources
- Gateway: agents filtered by project tag
- Runtime events: filtered by agent project

---

## Level 3: Agent View

### Purpose
Detailed view of a single agent - conversation + tasks.

### Features
- **Chat Panel:** (existing AgentChatPanel)
  - Full conversation history
  - Send messages
  - Human-in-loop approvals
  
- **Agent Inspector Panel:** (existing AgentInspectPanels)
  - Status, model, memory
  - Settings
  
- **Task List Panel:** (NEW)
  - Planned tasks
  - In-progress task (with progress)
  - Completed tasks
  - Add new task

### Interactions
- **Type in chat** → Send to agent
- **Approve/Deny** → Human-in-loop
- **Task checkbox** → Mark complete (optional)

### Data Sources
- Gateway: agent state, messages
- Local store: task list (persisted per agent)

---

## Level 4: Task List (Per Agent)

### Purpose
Track what an agent is supposed to do, has done, and will do.

### Task States
```
┌────────────────────────────────────────────┐
│ ✓ COMPLETED                               │
│   "Set up CI/CD pipeline"                 │
│   Completed 10 min ago                     │
├────────────────────────────────────────────┤
│ ⟳ IN PROGRESS                             │
│   "Deploy to staging"                     │
│   ████████░░░░░░░░ 65%                   │
│   Step 3 of 5: Running tests...          │
├────────────────────────────────────────────┤
│ ○ NEXT (upcoming)                         │
│   "Run integration tests"                  │
│   Depends on: Deploy to staging            │
├────────────────────────────────────────────┤
│ ○ PLANNED                                 │
│   "Deploy to production"                  │
│   "Set up monitoring"                     │
└────────────────────────────────────────────┘
```

### Features
- **Task States:** completed / in_progress / planned
- **Progress Bar:** For in-progress tasks (manual or auto)
- **Dependencies:** Optional "depends on" linking
- **Timestamps:** Created, started, completed
- **Add Task:** Quick add via chat command or UI

### Task Input Methods
1. **Chat:** Agent says "I'll do X, Y, Z" → Parse into tasks
2. **Manual:** User clicks "Add Task"
3. **Template:** Pre-defined task templates

### Persistence
- Store in local state (Zustand)
- Optional: Persist to file per agent

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GATEWAY                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ Agent State │  │   Events    │  │   Messages  │           │
│  │ (WebSocket)│  │   (SSE)     │  │  (WebSocket)│           │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘           │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STUDIO FRONTEND                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Zustand Store                         │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│  │  │ agents[] │  │ events[] │  │ tasks{}  │           │   │
│  │  │          │  │          │  │ [agentId] │           │   │
│  │  └──────────┘  └──────────┘  └──────────┘           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       UI LAYERS                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ Main        │  │ Project     │  │ Agent       │           │
│  │ Dashboard   │  │ Dashboard   │  │ View        │           │
│  │             │  │             │  │             │           │
│  │ •Widgets   │  │ •AgentList  │  │ •Chat       │           │
│  │ •GlobalFeed│  │ •ProjFeed  │  │ •Inspector │           │
│  │             │  │             │  │ •TaskList   │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Main Dashboard (Week 1)
- [ ] Create main dashboard page/route
- [ ] Build project widget component
- [ ] Aggregate agents by project
- [ ] Show status indicators

### Phase 2: Project Dashboard (Week 2)
- [ ] Create project dashboard route (`/project/:id`)
- [ ] List agents filtered by project
- [ ] Add project activity feed
- [ ] Add navigation between dashboards

### Phase 3: Activity Feed (Week 3)
- [ ] Capture gateway events
- [ ] Build event buffer (last 100)
- [ ] Add feed to Project Dashboard
- [ ] Add global feed to Main Dashboard

### Phase 4: Task List (Week 4-5)
- [ ] Design task data structure
- [ ] Build TaskList component
- [ ] Add to Agent View
- [ ] Task creation (manual + parse from chat)
- [ ] Progress tracking

### Phase 5: Enhancements (Ongoing)
- [ ] Task dependencies
- [ ] Task templates
- [ ] Progress automation (auto-detect from agent)
- [ ] Persistence improvements

---

## File Structure

```
src/
├── app/
│   ├── page.tsx                    # Main Dashboard (existing)
│   ├── project/
│   │   └── [projectId]/
│   │       └── page.tsx           # Project Dashboard (new)
│   └── agent/
│       └── [agentId]/
│           └── page.tsx            # Agent View (new)
├── features/
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── ProjectWidget.tsx
│   │   │   ├── GlobalActivityFeed.tsx
│   │   │   └── StatusIndicator.tsx
│   │   └── page.tsx
│   ├── project/
│   │   ├── components/
│   │   │   ├── AgentGrid.tsx
│   │   │   └── ProjectActivityFeed.tsx
│   │   └── page.tsx
│   ├── agents/
│   │   ├── components/
│   │   │   ├── TaskList.tsx          # NEW
│   │   │   ├── TaskItem.tsx          # NEW
│   │   │   └── TaskProgress.tsx      # NEW
│   │   └── state/
│   │       └── taskStore.ts          # NEW - Zustand store
│   │   └── ...
│   └── ...
```

---

## Research Sources

| Feature | Source |
|---------|--------|
| Project Widgets | tugcantopaloglu/openclaw-dashboard |
| Activity Feed | Mission Control `LiveFeed.tsx` |
| Task List | Custom (inspired by Vibe Kanban) |
| Status Indicators | Mission Control `AgentsSidebar.tsx` |

---

## Open Questions

1. **Task Persistence:** Should tasks persist across restarts? (File-based?)
2. **Task Auto-Detection:** Should we parse tasks from agent messages automatically?
3. **Project Definition:** Hard-coded projects or dynamic from agent tags?
4. **Activity Retention:** How many events to keep? (100? 1000?)

---

*Document created: 2026-02-16*
