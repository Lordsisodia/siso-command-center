# SISO Command Center - Complete Documentation

> This document describes everything needed to recreate SISO Command Center from scratch.
> An AI agent should be able to build this by following these docs alone.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Views & Components](#views--components)
4. [Custom Code Changes](#custom-code-changes)
5. [Integration Patterns](#integration-patterns)
6. [Development Guide](#development-guide)
7. [Deployment](#deployment)

---

## Overview

**SISO Command Center** is a custom fork of OpenClaw Studio with enhanced UI features for managing AI agents. It connects to OpenClaw Gateway via WebSocket and provides a modern React-based interface.

### Key Features Added

- Glassmorphism dashboard with gradient cards
- Arc gauge resource monitors (CPU, Memory, API)
- Sparkline trend charts
- Drag-and-drop Kanban board
- Command palette (⌘K)
- Floating action button (FAB)
- Project color theming
- Staggered page load animations

---

## Architecture

### Directory Structure

```
src/
├── app/                      # Next.js App Router
│   └── page.tsx             # Main entry - wires everything
│
├── lib/
│   └── gateway/             # OpenClaw Gateway connection
│       ├── GatewayClient.ts
│       ├── openclaw/
│       ├── agentConfig.ts
│       ├── models.ts
│       └── errors.ts
│
├── features/
│   ├── fleet/               # Agent management (from OpenClaw)
│   │   ├── components/     # FleetSidebar, ChatPanel, etc.
│   │   ├── state/         # AgentStore
│   │   ├── operations/    # CRUD
│   │   ├── creation/      # Agent creation
│   │   └── approvals/     # Exec approvals
│   │
│   ├── dashboard/          # Custom dashboard views
│   │   ├── ProjectDashboard.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── MainDashboard.tsx
│   │   └── ...
│   │
│   ├── orca/              # Orca visualization
│   └── settings/          # Settings
│
├── ui/
│   ├── components/        # Basic UI components
│   ├── charts/           # Chart components (ArcGauge, Sparkline)
│   └── patterns/         # Reusable patterns
│
└── hooks/                # Custom React hooks
    ├── useAgents.ts
    └── useModalState.ts
```

### Layer Model

```
┌─────────────────────────────────────────┐
│         FEATURES (Views)                │
│  src/features/dashboard/                 │
│  src/features/fleet/                    │
├─────────────────────────────────────────┤
│         UI COMPONENTS                   │
│  src/ui/charts/, src/ui/components/     │
├─────────────────────────────────────────┤
│         HOOKS (Logic)                   │
│  src/hooks/                              │
├─────────────────────────────────────────┤
│         LIB (Infrastructure)              │
│  src/lib/gateway/                       │
└─────────────────────────────────────────┘
```

### Domain Ownership

| Domain | Path | Source | Modify? |
|--------|------|--------|---------|
| Gateway | `lib/gateway/` | OpenClaw | NEVER |
| Fleet | `features/fleet/` | OpenClaw | RARELY |
| Dashboard | `features/dashboard/` | **OURS** | OFTEN |
| UI | `ui/` | **OURS** | OFTEN |
| Hooks | `hooks/` | **OURS** | OFTEN |

---

## Views & Components

### 1. ProjectDashboard (`src/features/dashboard/ProjectDashboard.tsx`)

**Purpose**: Main dashboard view with stats, resources, and kanban

**Features**:
- Stat cards with sparkline trends
- Arc gauge resource monitors
- Drag-and-drop Kanban board
- Project selector
- Time range filter

**Key Components Inside**:
- `StatCard` - Animated stat display
- `ArcGauge` - Circular resource gauge
- `KanbanBoard` - Drag-drop task board
- `Sparkline` - Mini trend chart

**Data Source**: Mock data + Gateway via hooks

---

### 2. CommandPalette (`src/features/dashboard/CommandPalette.tsx`)

**Purpose**: Quick actions via keyboard (⌘K)

**Features**:
- Fuzzy search
- Keyboard navigation (arrow keys + Enter)
- ESC to close
- Quick agent creation
- Navigation

**Data Source**: Static actions list

---

### 3. FleetSidebar (`src/features/fleet/components/FleetSidebar.tsx`)

**Purpose**: Agent list sidebar

**Features** (enhanced):
- Keyboard navigation
- Pinned agents (localStorage)
- Collapsible
- Quick status toggle
- Project filtering
- Current task preview

**Data Source**: Gateway via `agents.list`

---

### 4. AgentChatPanel (`src/features/fleet/components/AgentChatPanel.tsx`)

**Purpose**: Chat interface with agent

**Features**:
- Real-time messaging
- Code syntax highlighting
- File attachments
- Exec approval handling

**Data Source**: Gateway WebSocket events

---

### 5. ArcGauge (`src/ui/charts/`)

**Purpose**: Circular gauge for resources

**Implementation**:
- SVG-based
- Animated fill
- Color-coded thresholds
- Customizable size

```tsx
// Usage
<ArcGauge value={75} max={100} label="CPU" color="blue" />
```

---

### 6. Sparkline (`src/ui/charts/`)

**Purpose**: Mini trend chart for stats

**Implementation**:
- SVG polyline
- Gradient fill
- Responsive

```tsx
// Usage
<Sparkline data={[10, 20, 15, 30, 25]} color="green" />
```

---

## Custom Code Changes

### Summary of Changes from Original OpenClaw Studio

| Change | File | Description |
|--------|------|-------------|
| Added | `src/hooks/useAgents.ts` | Hook to fetch agents via Gateway |
| Added | `src/hooks/useModalState.ts` | Hook for modal state |
| Added | `src/hooks/types.ts` | Shared types |
| Modified | `src/features/dashboard/ProjectDashboard.tsx` | Added glassmorphism, sparklines, kanban |
| Added | `src/features/dashboard/CommandPalette.tsx` | Cmd+K palette |
| Modified | `src/features/fleet/components/FleetSidebar.tsx` | Enhanced sidebar features |
| Added | `src/ui/components/theme-toggle.tsx` | Theme toggle |
| Added | `src/ui/charts/` | Chart components directory |

---

### Hook: useAgents

**Location**: `src/hooks/useAgents.ts`

**Purpose**: Fetch and manage agents from Gateway

**API**:
```typescript
const { agents, loading, error, refetch } = useAgents(client);
```

**Implementation Details**:
- Calls `client.call("agents.list", {})`
- Transforms agent data (id, name, avatarUrl, emoji)
- Handles loading/error states
- Provides refetch function

---

### Hook: useModalState

**Location**: `src/hooks/useModalState.ts`

**Purpose**: Manage modal open/close state

**API**:
```typescript
const { modals, openCreateAgent, closeCreateAgent, ... } = useModalState();
```

**Available Actions**:
- `openCreateAgent` / `closeCreateAgent`
- `openPipeline` / `closePipeline`
- `openSettings` / `closeSettings`
- `openConnection` / `closeConnection`
- `openBrain` / `closeBrain`

---

### Component: ProjectDashboard

**Location**: `src/features/dashboard/ProjectDashboard.tsx`

**Enhancements Made**:
1. **Glassmorphism Cards**: backdrop-blur, gradient backgrounds, hover scale
2. **Arc Gauges**: CPU, Memory, API usage with color coding
3. **Sparklines**: Mini trend charts on stat cards
4. **Drag-and-Drop Kanban**: HTML5 drag API for task management
5. **Command Palette**: ⌘K trigger
6. **Floating Action Button**: Bottom-right expandable menu
7. **Staggered Animations**: Fade-in on page load

---

## Integration Patterns

### Pattern 1: Adding New Dashboard View

```
1. Create file in src/features/dashboard/
2. Import hooks from src/hooks/
3. Use UI components from src/ui/
4. Export as component
5. Add to page.tsx routing
```

Example:
```tsx
// src/features/dashboard/NewView.tsx
import { useAgents } from '@/hooks/useAgents';
import { StatCard } from '@/ui/components/StatCard';

export function NewView({ client }) {
  const { agents, loading } = useAgents(client);
  
  return (
    <div>
      {agents.map(agent => <StatCard {...} />)}
    </div>
  );
}
```

---

### Pattern 2: Adding New Chart Component

```
1. Create file in src/ui/charts/MyChart.tsx
2. Build with SVG or canvas
3. Accept data as props
4. Style with Tailwind
5. Document in README
```

---

### Pattern 3: Adding New Hook

```
1. Create file in src/hooks/useMyHook.ts
2. Use existing types from src/hooks/types.ts
3. Follow React hooks rules
4. Add tests in tests/unit/
5. Export for use in components
```

---

## Development Guide

### Setup

```bash
# Clone
git clone https://github.com/Lordsisodia/siso-command-center.git
cd siso-command-center

# Install
npm install

# Dev
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
# All tests
npm test

# Specific
npm test -- tests/unit/useAgents.test.ts
```

### Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npm run lint` | Lint code |

---

## Deployment

### Local Development

```bash
npm run dev
# Open http://localhost:3000
```

### Mac Mini

```bash
# Push to GitHub
git push origin main

# On Mac Mini:
git pull
npm install
npm run build
npm start
```

### Environment

```bash
# .env.local
NEXT_PUBLIC_GATEWAY_URL=ws://localhost:18789
```

---

## Gateway API Reference

### Key Methods Used

| Method | Purpose |
|--------|---------|
| `agents.list` | Get all agents |
| `agents.create` | Create new agent |
| `agents.delete` | Delete agent |
| `agents.patch` | Update agent |
| `config.get` | Get gateway config |
| `config.patch` | Update gateway config |

### WebSocket Events

| Event | Description |
|-------|-------------|
| `runtime.chat` | Chat message received |
| `runtime.agent` | Agent state change |
| `lifecycle` | Agent lifecycle event |
| `summary.refresh` | Summary updated |

---

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next
npm run build
```

### Tests Fail

```bash
# Check pre-existing failures
npm test 2>&1 | grep -E "(FAIL|passed|failed)"
```

### Gateway Connection Issues

- Check Gateway is running: `openclaw gateway probe`
- Verify URL: `ws://localhost:18789` or `wss://...`
- Check token: `openclaw config get gateway.auth.token`

---

## Future Enhancements

Planned features:
- [ ] Activity heatmap (GitHub-style)
- [ ] Agent detail modal
- [ ] Real-time resource streaming
- [ ] More chart types
- [ ] Plugin system for new features

---

## Credits

- Base: [OpenClaw Studio](https://github.com/grp06/openclaw-studio)
- Gateway: [OpenClaw](https://github.com/openclaw/openclaw)
- Fork: [SISO Command Center](https://github.com/Lordsisodia/siso-command-center)

---

*Last Updated: 2026-02-17*
*Version: 0.2.0*
*Documentation Status: Complete*
