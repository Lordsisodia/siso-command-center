# OpenClaw Studio - Islands Architecture Research

## Executive Summary

The current `page.tsx` (2763 lines) is a monolith with ~60 state variables, ~15 effects, and massive inline handlers. Rebuilding with **Domain-Based Islands Architecture** will:

1. **Isolate each domain** (Fleet, Chat, Settings, Brain, Connection)
2. **Single bridge to Gateway** (GatewayClient is already this - we lean into it)
3. **Event-driven inter-island communication** (no shared state)
4. **Independent deploy/maintain** (each island can change independently)

---

## Research Findings

### Islands Architecture Principles

1. **Render static content server-side, hydrate only interactive islands**
2. **Each island is independent** - has its own state, lifecycle, dependencies
3. **Communication via events** - islands don't share state, they emit/consume events
4. **Minimal parent orchestrator** - the shell holds layout only

### Domain-Driven Design Layers

```
┌─────────────────────────────────────────────┐
│           Presentation Layer                  │
│   (Islands: FleetPane, ChatPane, etc.)       │
├─────────────────────────────────────────────┤
│           Application Layer                   │
│   (Use cases, orchestration, workflows)      │
├─────────────────────────────────────────────┤
│              Domain Layer                     │
│   (Entities: Agent, Session, CronJob)        │
├─────────────────────────────────────────────┤
│          Infrastructure Layer                 │
│   (GatewayClient, Storage, HTTP)              │
└─────────────────────────────────────────────┘
```

### Key Insight: GatewayClient is Already the Bridge

The existing `GatewayClient.ts` is a well-designed WebSocket client that:
- Maintains connection state
- Handles request/response framing
- Emits events for state changes
- Is already used by all components

**We lean into this pattern** - GatewayClient is the *only* shared dependency.

---

## Proposed Architecture

### Domain Islands

```
┌─────────────────────────────────────────────────────────────┐
│                        Shell (page.tsx)                      │
│  - Layout (Header + 3-column flex)                          │
│  - MobilePane routing                                        │
│  - GatewayClient provider (context)                          │
│  - EventBus (pub/sub for inter-island)                      │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  FleetIsland  │    │   ChatIsland  │    │  SettingsIsland│
│               │    │               │    │               │
│ - Sidebar    │    │ - Messages    │    │ - Agent Config│
│ - Agent List │    │ - Input       │    │ - Cron Jobs   │
│ - Project Nav│    │ - Thinking    │    │ - Heartbeats  │
│ - Filtering  │    │ - Models      │    │ - Brain Files │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌───────────────┐
                    │  BrainIsland  │
                    │               │
                    │ - File Browser│
                    │ - Upload      │
                    └───────────────┘
```

### Event Types (Inter-Island Communication)

```typescript
// Events emitted by islands
type StudioEvent =
  | { type: "agent:selected"; agentId: string }
  | { type: "agent:created"; agent: Agent }
  | { type: "agent:deleted"; agentId: string }
  | { type: "agent:renamed"; agentId: string; name: string }
  | { type: "settings:opened"; agentId: string }
  | { type: "settings:closed" }
  | { type: "brain:opened"; agentId: string }
  | { type: "brain:closed" }
  | { type: "connection:status"; status: GatewayStatus }
  | { type: "message:sent"; agentId: string; message: string };
```

### Each Island Receives

```typescript
// FleetIsland props (conceptual)
interface FleetIslandProps {
  gatewayClient: GatewayClient;  // The only shared dependency
  eventBus: EventBus;            // Publish/subscribe
}

// ChatIsland props
interface ChatIslandProps {
  agentId: string;               // Which agent to show
  gatewayClient: GatewayClient;
  eventBus: EventBus;
}
```

---

## Folder Structure

```
src/
├── app/
│   └── page.tsx                  # Shell only (≈200 lines)
│
├── islands/                      # NEW: Domain islands
│   ├── FleetIsland/
│   │   ├── index.tsx            # Main component
│   │   ├── useFleetState.ts     # Fleet-specific state
│   │   ├── useAgentList.ts      # Agent list logic
│   │   └── types.ts
│   │
│   ├── ChatIsland/
│   │   ├── index.tsx
│   │   ├── useChatState.ts
│   │   ├── useMessageHistory.ts
│   │   ├── useThinking.ts
│   │   └── types.ts
│   │
│   ├── SettingsIsland/
│   │   ├── index.tsx
│   │   ├── useSettingsState.ts
│   │   ├── useCronJobs.ts
│   │   ├── useHeartbeats.ts
│   │   └── types.ts
│   │
│   ├── BrainIsland/
│   │   ├── index.tsx
│   │   ├── useBrainState.ts
│   │   └── types.ts
│   │
│   └── ConnectionIsland/
│       ├── index.tsx
│       └── useConnectionState.ts
│
├── infrastructure/               # NEW: Shared infrastructure
│   ├── gateway/
│   │   ├── GatewayClient.ts     # Existing - unchanged
│   │   ├── types.ts
│   │   └── events.ts
│   │
│   └── event-bus/
│       ├── EventBus.ts
│       └── useEventBus.ts
│
├── domain/                      # NEW: Domain models
│   ├── agent/
│   │   ├── types.ts
│   │   └── validation.ts
│   │
│   ├── session/
│   │   └── types.ts
│   │
│   ├── cron/
│   │   └── types.ts
│   │
│   └── heartbeat/
│       └── types.ts
│
└── features/                    # EXISTING: Keep, migrate later
    ├── agents/
    └── projects/
```

---

## Migration Path

### Phase 1: Shell Extraction (Low Risk)
1. Create shell in `page.tsx` that renders islands
2. Pass GatewayClient via React Context
3. Set up EventBus
4. **No behavioral changes** - islands just wrap existing components

### Phase 2: Island Creation
1. Create each island folder with `index.tsx`
2. Move relevant state from page.tsx into island
3. Connect to EventBus for communication
4. Existing components become island children

### Phase 3: Cleanup
1. Remove unused state from page.tsx
2. Delete unused imports
3. Extract domain types to `/domain`
4. Document each island's API

---

## Why This Works for OpenClaw Studio

### 1. Gateway is the Integration Point
- All islands talk to GatewayClient
- GatewayClient is already the single source of truth
- No shared state between islands needed

### 2. Natural Domain Boundaries
- **Fleet**: List/select agents
- **Chat**: Message send/receive for one agent
- **Settings**: Agent configuration (cron, heartbeats)
- **Brain**: File management
- **Connection**: Gateway connection UI

### 3. Independent Evolution
- Add new features to one island without touching others
- Different teams could own different islands
- Easier to test (each island in isolation)

### 4. Mobile Responsiveness
- Islands can have mobile-specific implementations
- Shell handles pane routing
- Islands just render their content

---

## Key Principles

1. **GatewayClient is the only shared dependency**
   - Islands never import each other directly
   - All state flows through GatewayClient + events

2. **Event-driven, not state-driven**
   - No global store (Zustand/Redux needed)
   - Islands emit events, other islands react

3. **Props in, events out**
   - Each island is a function: `(props) => JSX`
   - No implicit dependencies

4. **Domain types are shared, not island logic**
   - `Agent` type can be imported everywhere
   - Island implementations stay isolated

---

## Estimated Impact

| Metric | Current | After |
|--------|---------|-------|
| page.tsx lines | 2763 | ~200 |
| State variables in page | 60+ | 3 (shell state) |
| Direct imports in page | 90+ | 6 (islands + infra) |
| Islands | 0 | 5 |
| Shared dependencies | Many | 1 (GatewayClient) |

---

## Next Steps

1. **Approve architecture** - Confirm this approach
2. **Create shell** - Extract page.tsx to minimal layout
3. **Build EventBus** - Simple pub/sub implementation
4. **Migrate one island** - Start with FleetIsland (simplest)
5. **Iterate** - Adjust based on learnings
