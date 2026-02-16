# SISO Command Center Dashboard - Improvement Plan

## Current State Assessment

### What's Already Built

| Component | Status | Description |
|----------|--------|-------------|
| `MainDashboard.tsx` | ✅ Working | Project grid, quick stats, recent agents |
| `ProjectWidget.tsx` | ✅ Working | Expandable project cards with status dots |
| `ProjectDashboard.tsx` | ✅ Working | Detailed project view with stats, swarms, kanban |
| Navigation | ✅ Working | Mobile pane system with dashboard/project/chat modes |
| Mock Data | ⚠️ Static | PROJECTS array hardcoded, mock agent data |

### Issues to Address

1. **Hardcoded Projects** - Only 3 projects (BlackBox5, Lumelle, SISO Internal)
2. **Mock Data** - No real integration with BlackBox5 task system
3. **Expand/Collapse** - Widgets don't truly expand in-place
4. **Missing Widgets** - No weather, clock, system status, notifications
5. **Not Functional** - Click actions don't actually work (just navigates)
6. **No Real-time** - Stats are static, no WebSocket updates

---

## Improvement Phases

### Phase 1: Make It Functional (MVP)

**Goal:** Connect dashboard to real data sources

#### 1.1 Dynamic Project Loading

```typescript
// Replace hardcoded PROJECTS with dynamic loading from BlackBox5
// Sources: BlackBox5 task system, Supabase, file system

type ProjectSource = 
  | { type: "blackbox5"; tasksPath: string }
  | { type: "supabase"; table: string }
  | { type: "manual"; projects: Project[] }
```

#### 1.2 Real Agent Integration

- Connect to OpenClaw Gateway for real agent status
- Use existing `GatewayClient` for live data
- Remove mock MOCK_AGENTS

#### 1.3 Task Queue Integration

- Connect to BlackBox5 `5-project-memory/` 
- Read task files: `tasks/*.json`
- Display real task queue from projects

#### 1.4 Click-to-Expand Widgets

```
Main Dashboard View:
┌─────────────────────────────────────────────────┐
│  [≡]  SISO Command Center        [Search] [⚙]  │
├─────────────────────────────────────────────────┤
│  Projects (click to expand)                      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ BlackBox5│ │ Lumelle │ │SISO Intl│  [+Add]  │
│  │ ●●●○○   │ │ ●●○○   │ │ ●○○    │           │
│  └─────────┘ └─────────┘ └─────────┘           │
│                                                  │
│  ┌──────────────┐ ┌──────────────┐              │
│  │ System Status│ │ Notifications│              │
│  │ ● Running   │ │ 3 new        │              │
│  └──────────────┘ └──────────────┘              │
└─────────────────────────────────────────────────┘
```

Expanded Widget:
```
┌─────────────────────────────────────────────────┐
│  ▼ BlackBox5 (8 agents, 3 running)             │
│  ├─ Tasks: 24 pending, 156 done                │
│  ├─ Recent: PR #247 merged, Story completed    │
│  └─ [View All →] [Create Agent]                │
└─────────────────────────────────────────────────┘
```

---

### Phase 2: Add Missing Widgets

#### 2.1 System Status Widget

```typescript
type SystemStatusWidget = {
  type: "system";
  data: {
    openclawGateway: "running" | "stopped" | "error";
    vpsConnection: "connected" | "disconnected";
    macMini: "online" | "offline";
    lastSync: Date;
    cpu: number;
    memory: number;
  }
}
```

#### 2.2 Quick Actions Widget

- Start/Stop agents
- Run heartbeat
- Create new agent
- Trigger task

#### 2.3 Notifications Widget

- Real-time alerts from agents
- Error notifications
- Task completions

#### 2.4 Activity Timeline Widget

- Unified activity across all projects
- Filterable by project/agent

---

### Phase 3: UX Improvements

#### 3.1 Drag-and-Drop Widget Layout

- Allow users to rearrange widgets
- Save layout preferences

#### 3.2 Widget Grid System

```
┌──────────────────────────────────────────────────────┐
│  [Widget 1     ]  [Widget 2     ]  [Widget 3     ]  │
│  2 cols        │  1 col         │  1 col         │
├────────────────┼────────────────┼─────────────────┤
│  [Widget 4                     ]  [Widget 5      ]  │
│  2 cols                         │  1 col         │
└──────────────────────────────────────────────────────┘
```

#### 3.3 Dark/Light Theme Polish

- Ensure all widgets look good in both modes
- Consistent color scheme

---

## Implementation Priority

| Priority | Widget | Effort | Impact |
|----------|--------|--------|--------|
| P0 | Dynamic projects | 2h | High |
| P0 | Real agent data | 2h | High |
| P1 | Expandable widgets | 3h | High |
| P1 | System status | 2h | Medium |
| P1 | Task queue sync | 3h | High |
| P2 | Drag-drop layout | 4h | Medium |
| P2 | Quick actions | 3h | Medium |
| P3 | Notifications | 4h | Low |

---

## Data Sources to Connect

### 1. BlackBox5 Project Memory
```
5-project-memory/
├── blackbox5/
│   ├── tasks/           # Task files
│   ├── runs/            # Execution runs
│   └── state.json      # Project state
├── lumelle/
│   └── ...
└── siso-internal/
    └── ...
```

### 2. OpenClaw Gateway
- Agent status (running/idle/error)
- Session history
- Cron jobs
- Exec approvals

### 3. Supabase (optional)
- Task database
- Agent metrics
- Historical data

---

## File Changes Required

### New Files
- `src/features/dashboard/components/SystemStatusWidget.tsx`
- `src/features/dashboard/components/ExpandableWidget.tsx`
- `src/features/dashboard/hooks/useProjectData.ts`
- `src/features/dashboard/hooks/useSystemStatus.ts`
- `src/lib/projects/projectLoader.ts`

### Modified Files
- `src/features/dashboard/components/MainDashboard.tsx` - Add expandable widgets
- `src/features/dashboard/components/ProjectWidget.tsx` - Make truly expandable
- `src/app/page.tsx` - Remove mock data, connect real sources

---

## Visual Reference - Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  SISO Command Center                              [Search] [⚙]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ 🟦 BlackBox5        │  │ 🟣 Lumelle           │              │
│  │ ●●●●○○ (4 running) │  │ ●●○○○ (2 running)   │              │
│  │ 8 agents            │  │ 5 agents             │              │
│  │ ▶ Expand           │  │ ▶ Expand             │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ 🟧 SISO Internal    │  │ ⚙ System Status    │              │
│  │ ●○○○○ (1 running)  │  │ ● Gateway: Running │              │
│  │ 3 agents            │  │ ● VPS: Connected   │              │
│  │ ▶ Expand           │  │                     │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                  │
│  [+ Add Project]                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Expanded Project:
┌─────────────────────────────────────────────────────────────────┐
│  ▼ BlackBox5 (8 agents)                           [Create Agent]│
├─────────────────────────────────────────────────────────────────┤
│  ┌─ Tasks ─────────────────────────────────────────────────┐    │
│  │ To Do: 12 │ In Progress: 3 │ Done: 156               │    │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │    │
│  │ │Task card│ │Task card│ │Task card│ │ ...     │     │    │
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─ Recent Activity ──────────────────────────────────────┐    │
│  │ • PR #247 merged (Reviewer · 5m ago)                  │    │
│  │ • Story completed: Auth flow (Developer · 15m ago)     │    │
│  │ • E2E tests passed (Tester · 30m ago)                 │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1 Complete ✅

| Feature | Status |
|---------|--------|
| Expandable project widgets | ✅ Done |
| System Status widget | ✅ Done |
| Notifications widget | ✅ Done |
| Improved layout | ✅ Done |

---

## Phase 2: Enhanced Widgets (In Progress)

### 2.1 Activity Timeline Widget
- Unified activity feed across all projects
- Filter by: agent, project, type (info/warning/error)
- Time-based filtering (1h, 24h, 7d)
- Click to navigate to agent

### 2.2 Quick Actions Widget
- One-click buttons for common actions:
  - Run heartbeat on all agents
  - Create new agent
  - Restart failed agents
  - Sync project data

### 2.3 Task Queue Mini-Widget
- Compact task overview in sidebar
- Show: pending, running, completed counts
- Click to expand full kanban

### 2.4 Resource Monitor Widget
- Real-time CPU/Memory graphs
- Per-agent resource usage
- Historical charts (sparklines)

### 2.5 Time Range Selector
- Global time filter: 1h, 24h, 7d, 30d
- Affects all widgets consistently

---

## Phase 3: UX Polish

### 3.1 Drag-and-Drop Widget Reordering
- Use `@dnd-kit` or similar
- Save layout to localStorage
- Reset to default option

### 3.2 Keyboard Shortcuts
- `n` - New agent
- `d` - Dashboard
- `p` - Projects
- `/` - Search
- `esc` - Close modals

### 3.3 Command Palette (⌘K)
- Quick search across agents, projects, actions
- Recent items
- Fuzzy matching

### 3.4 Dark/Light Theme Enhancements
- Improved color consistency
- Better contrast ratios
- Smooth transitions

---

## Phase 4: Advanced Features

### 4.1 Agent Health Scores
- Calculate health based on:
  - Success rate
  - Error frequency
  - Response time
- Visual indicators (color-coded)

### 4.2 Scheduled Tasks Preview
- Show upcoming cron jobs
- Next run times
- Quick enable/disable

### 4.3 Quick Chat Widget
- Send message to any agent directly from dashboard
- Start new session

### 4.4 Agent Templates Panel
- Browse/create agent templates
- One-click agent creation

---

## Implementation Priority (Updated)

| Priority | Widget | Effort | Status |
|----------|--------|--------|--------|
| P0 | Expandable projects | - | ✅ Done |
| P0 | System Status | - | ✅ Done |
| P0 | Notifications | - | ✅ Done |
| P1 | Activity Timeline | 3h | Pending |
| P1 | Quick Actions | 2h | Pending |
| P1 | Task Queue Mini | 2h | Pending |
| P2 | Time Range Selector | 1h | Pending |
| P2 | Resource Monitor | 3h | Pending |
| P2 | Drag-drop reordering | 4h | Pending |
| P3 | Command Palette | 4h | Pending |
| P3 | Agent Health Scores | 3h | Pending |
| P3 | Quick Chat | 2h | Pending |

---

## Visual Reference - Phase 2 Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│  Dashboard                              [1h|24h|7d|30d] [⌘K] [⚙]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐ │
│  │ ▼ BlackBox5 (4/8 running) │  │ ▼ Lumelle (2/5 running)        │ │
│  │ ●●●●○○○○                   │  │ ●●○○○                          │ │
│  ├─ Running: Agent1, Agent2  │  ├─ Running: E2E, Static        │ │
│  │ [▶ Start] [■ Stop]        │  │ [▶ Start] [■ Stop]            │ │
│  └─────────────────────────────┘  └─────────────────────────────────┘ │
│                                                                         │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────┐ │
│  │ ▼ SISO Internal (1/3)      │  │ [+ Add Project]               │ │
│  │ ●○○                        │  │                                │ │
│  └─────────────────────────────┘  └─────────────────────────────────┘ │
│                                                                         │
├────────────────────────────────────────────────────────────────────────┤
│  QUICK ACTIONS                                                        │
│  [▶ Run All Heartbeats] [✦ New Agent] [↻ Restart Failed] [⟳ Sync]  │
├────────────────────────────────────────────────────────────────────────┤
│  ACTIVITY TIMELINE         │  SYSTEM STATUS    │  TASK QUEUE        │
│  • 5m ago: PR #247 merged  │  ● Gateway 95%   │  Pending: 12       │
│  • 15m ago: Story done     │  ● VPS    OK     │  Running: 3        │
│  • 30m ago: Tests passed   │  ● MacMini Online│  Done: 156          │
│  [View All →]              │                   │  [View Kanban →]    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Next Steps

**Ready to implement Phase 2:**

1. **Activity Timeline Widget** - Unified activity feed
2. **Quick Actions Bar** - One-click common actions  
3. **Task Queue Mini** - Compact task overview
4. **Time Range Selector** - Filter all widgets

Which would you like me to tackle first?
