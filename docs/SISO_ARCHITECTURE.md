# SISO Command Center - Architecture

## Overview

**SISO Command Center** is a custom fork of OpenClaw Studio with enhanced UI features for managing AI agents. It connects to OpenClaw Gateway via WebSocket and provides a modern React-based interface.

## Directory Structure

```
openclaw-studio/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── page.tsx             # Main app (3109 lines - needs refactor)
│   │   ├── layout.tsx            # Root layout
│   │   └── api/                 # API routes
│   │
│   ├── lib/                     # Core logic (mostly from OpenClaw)
│   │   ├── gateway/             # Gateway connection (KEEP - works great)
│   │   │   ├── GatewayClient.ts        # WebSocket client
│   │   │   ├── openclaw/               # Browser client
│   │   │   ├── agentConfig.ts          # Agent CRUD
│   │   │   ├── models.ts               # Gateway models
│   │   │   └── errors.ts               # Error types
│   │   │
│   │   ├── hooks/               # OUR custom hooks
│   │   │   ├── useAgents.ts            # Agent fetching
│   │   │   ├── useModalState.ts         # Modal state
│   │   │   └── types.ts                # Shared types
│   │   │
│   │   ├── studio/              # Studio settings
│   │   ├── cron/                 # Cron job types
│   │   ├── text/                # Text utilities
│   │   └── ...
│   │
│   ├── features/                # Feature modules
│   │   ├── agents/              # Agent management (from OpenClaw)
│   │   │   ├── components/       # FleetSidebar, ChatPanel, etc.
│   │   │   ├── state/            # AgentStore (Context + Reducer)
│   │   │   ├── operations/       # Agent actions (create, delete, etc.)
│   │   │   └── ...
│   │   │
│   │   ├── projects/             # OUR custom - Project Dashboard
│   │   │   └── components/
│   │   │       └── ProjectDashboard.tsx  # Enhanced dashboard
│   │   │
│   │   ├── dashboard/            # Dashboard features
│   │   ├── orca/                 # Orca visualization
│   │   └── workflows/            # Workflow features
│   │
│   └── components/              # Shared UI components
│       └── theme-toggle.tsx
│
├── docs/                        # Documentation
│   └── SISO_ARCHITECTURE.md     # This file
│
└── public/                     # Static assets
```

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│  UI LAYER (src/features/, src/components/)                          │
│  - React components                                                 │
│  - Tailwind styling                                                 │
│  - Custom features in src/features/projects                         │
├─────────────────────────────────────────────────────────────────────┤
│  HOOKS LAYER (src/lib/hooks/) - OUR CUSTOM                         │
│  - useAgents.ts: Fetch agents via Gateway                          │
│  - useModalState.ts: Modal management                              │
├─────────────────────────────────────────────────────────────────────┤
│  STATE LAYER (src/features/agents/state/)                         │
│  - AgentStore: Context + useReducer (from OpenClaw)               │
│  - Event handlers for WebSocket events                             │
├─────────────────────────────────────────────────────────────────────┤
│  GATEWAY LAYER (src/lib/gateway/) - KEEP DON'T TOUCH              │
│  - GatewayClient.ts: WebSocket connection                           │
│  - Agent operations: create, delete, update                         │
│  - Auth: Token + device authentication                             │
└─────────────────────────────────────────────────────────────────────┘
```

## What Came From Where

### From OpenClaw Gateway (Keep - Don't Touch)

| File/Folder | Purpose |
|-------------|---------|
| `src/lib/gateway/*` | WebSocket client, auth, retry logic |
| `src/features/agents/state/store.tsx` | Agent state management |
| `src/features/agents/components/FleetSidebar.tsx` | Agent list sidebar |
| `src/features/agents/components/AgentChatPanel.tsx` | Chat interface |
| `src/features/agents/components/AgentInspectPanels.tsx` | Settings panels |
| `src/app/page.tsx` | Main app (needs refactor) |

### Custom SISO Enhancements (Our Code)

| File/Folder | Purpose |
|-------------|---------|
| `src/lib/hooks/useAgents.ts` | Custom hook for agent fetching |
| `src/lib/hooks/useModalState.ts` | Custom hook for modal state |
| `src/features/projects/components/ProjectDashboard.tsx` | Enhanced dashboard |
| `src/features/dashboard/components/CommandPalette.tsx` | Cmd+K palette |

## Key Components

### Gateway Connection Flow

```
Browser ──WebSocket──> Gateway (ws://localhost:18789)
   │                    │
   │── agents.list ───>│
   │<-- agents[] ----──│
   │                    │
   │<-- runtime.chat ──│ (real-time events)
   │<-- runtime.agent ─│
```

### Agent State Management

```
useAgentStore() ──> AgentStoreContext ──> Reducer
      │                                    │
      └── dispatch({ type, payload }) ───> │
```

### Our Custom Hooks

```typescript
// Use these for new components
import { useAgents, createMockGatewayClient } from '@/lib/hooks/useAgents';
import { useModalState } from '@/lib/hooks/useModalState';
```

## Custom Features

### 1. Project Dashboard (`src/features/projects/`)

Enhanced dashboard with:
- Glassmorphism cards with gradient backgrounds
- Arc gauge resources (CPU, Memory, API)
- Animated stat cards with hover effects
- Sparkline trend charts
- Drag-and-drop Kanban board
- Command palette (Cmd+K)
- Floating action button (FAB)
- Project color theming (BlackBox5=blue, Lumelle=purple, SISO=orange)

### 2. Command Palette

- Opens with Cmd+K
- Fuzzy search
- Keyboard navigation
- Quick actions

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- tests/unit/useAgents.test.ts

# Build
npm run build

# Dev server
npm run dev
```

## Deployment

### Local Development

```bash
npm install
npm run dev
```

### Mac Mini Deployment

```bash
# On Mac Mini
git clone https://github.com/Lordsisodia/siso-command-center.git
cd siso-command-center
npm install
npm run build

# Start production
npm start
```

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_GATEWAY_URL=ws://localhost:18789
```

## Extending the Codebase

### Adding New Features

1. **Use existing hooks** when possible:
   ```typescript
   const { agents, loading, error } = useAgents(client);
   const { modals, openCreateAgent } = useModalState();
   ```

2. **Create new hooks** in `src/lib/hooks/` for reusable logic

3. **Add components** in `src/features/` following the existing pattern

4. **Test** new hooks with the same pattern as `tests/unit/useAgents.test.ts`

### Integration Process

When scraping/integrating external code:

1. **Wrap** in a thin adapter component
2. **Use** our hooks for data
3. **Style** with Tailwind
4. **Test** thoroughly

## Known Issues

- `src/app/page.tsx` is 3109 lines - too monolithic
- Event handlers are tightly coupled (can't easily extract)
- Need more custom hooks for common patterns

## Future Plans

- [ ] Extract more hooks (useConnection, useAgentActions)
- [ ] Create component library for scraped UI code
- [ ] Refactor page.tsx into smaller components
- [ ] Add more dashboard widgets
- [ ] Implement activity heatmap
- [ ] Add agent detail modal

## References

- [OpenClaw Studio](https://github.com/grp06/openclaw-studio)
- [OpenClaw Gateway](https://docs.openclaw.ai/gateway)
- [Original OpenClaw UI](https://github.com/openclaw/openclaw/tree/main/ui)

---

*Last Updated: 2026-02-17*
*Version: 0.1.0*
