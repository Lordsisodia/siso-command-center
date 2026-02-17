# Migration Plan: Monolith → Islands

## The Approach: Strangler Fig Pattern

We'll **incrementally replace** the monolith, not rewrite it all at once. At each step, the app works. This avoids the "big bang" rewrite that breaks everything.

---

## The Plan (5 Phases)

### Phase 0: Preparation (Do First)

Create the folder structure. No code changes - just organization.

```
src/
├── islands/                    # NEW
│   ├── FleetIsland/
│   │   └── index.tsx          # Just re-exports existing components
│   ├── ChatIsland/
│   │   └── index.tsx
│   ├── SettingsIsland/
│   │   └── index.tsx
│   ├── BrainIsland/
│   │   └── index.tsx
│   └── ConnectionIsland/
│       └── index.tsx
│
├── infrastructure/             # NEW
│   ├── GatewayProvider.tsx    # React Context for GatewayClient
│   └── event-bus.ts           # Simple pub/sub (50 lines)
│
└── (existing structure unchanged)
```

**Goal:** Structure exists, nothing breaks.

---

### Phase 1: Shell Extraction (Safe)

Create the shell that renders islands, but wire it to render current components.

```
page.tsx (new):
  - Import GatewayProvider
  - Import islands (which currently just wrap existing components)
  - Pass gatewayClient to each island
  - Handle pane switching (mobile)
```

**What stays the same:** All state still in page.tsx
**What changes:** Components are wrapped in island containers

**Checkpoint:** App works exactly the same, but structured differently.

---

### Phase 2: State Migration - FleetIsland

Move Fleet-related state from page.tsx into FleetIsland.

From page.tsx, move:
- `workspaces` → FleetIsland
- `selectedProjectId` → FleetIsland  
- `focusFilter` → FleetIsland

Create hooks inside FleetIsland:
- `useAgentList(gatewayClient)` - fetches agents
- `useWorkspaces(gatewayClient)` - fetches workspaces

**Checkpoint:** Fleet sidebar works with its own state.

---

### Phase 3: State Migration - ChatIsland

Move chat-specific state into ChatIsland.

From page.tsx, move:
- `messages[agentId]` → ChatIsland (in-memory cache)
- `draft` → ChatIsland
- `stopBusyAgentId` → ChatIsland

Create hooks:
- `useMessages(gatewayClient, agentId)` - subscribes to messages
- `useSendMessage(gatewayClient, agentId)` - send logic

**Checkpoint:** Chat works with isolated state.

---

### Phase 4: State Migration - SettingsIsland + BrainIsland

Move settings + brain into their islands.

**Checkpoint:** Each pane has isolated state.

---

### Phase 5: Shell Simplification

Now that islands own their state, simplify page.tsx.

It should be ~200 lines:
- GatewayProvider setup
- Layout JSX
- Pane routing logic
- Nothing else

**Final state:** Clean separation achieved.

---

## Step-by-Step Commands

### Phase 0: Setup

```bash
cd openclaw-studio/src

# Create island wrappers (just re-export existing)
mkdir -p islands/FleetIsland
echo "export * from '@/features/projects/components/ProjectsSidebar';" > islands/FleetIsland/index.tsx

mkdir -p islands/ChatIsland  
echo "export * from '@/features/agents/components/AgentChatPanel';" > islands/ChatIsland/index.tsx

# (repeat for other islands)

# Create GatewayProvider
cat > infrastructure/GatewayProvider.tsx
# ... (see below)

# Create EventBus
cat > infrastructure/event-bus.ts
# ... (50 lines, see below)
```

### Phase 1: Shell

Edit `app/page.tsx`:
1. Wrap in `<GatewayProvider>`
2. Replace component imports with island imports
3. Add pane routing

### Phase 2-4: Move state

For each island:
1. Identify relevant state in page.tsx
2. Create `useXxxState` hook in island folder
3. Move state + effects into hook
4. Pass via island props

### Phase 5: Cleanup

Delete unused state from page.tsx.

---

## Code: GatewayProvider

```typescript
// infrastructure/GatewayProvider.tsx
"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { GatewayBrowserClient } from "@/lib/gateway/openclaw/GatewayBrowserClient";

interface GatewayContextValue {
  client: GatewayBrowserClient;
  status: "disconnected" | "connecting" | "connected";
}

const GatewayContext = createContext<GatewayContextValue | null>(null);

export function GatewayProvider({ 
  children,
  initialUrl = "ws://localhost:18789",
}: { 
  children: ReactNode;
  initialUrl?: string;
}) {
  const client = useMemo(() => new GatewayBrowserClient(initialUrl), [initialUrl]);
  
  // Connect on mount
  useEffect(() => {
    client.connect();
    return () => client.disconnect();
  }, [client]);

  const value = useMemo(() => ({
    client,
    status: client.getStatus(),
  }), [client]);

  return (
    <GatewayContext.Provider value={value}>
      {children}
    </GatewayContext.Provider>
  );
}

export function useGateway() {
  const ctx = useContext(GatewayContext);
  if (!ctx) throw new Error("useGateway must be used within GatewayProvider");
  return ctx;
}
```

---

## Code: EventBus (50 lines)

```typescript
// infrastructure/event-bus.ts
type EventListener<T = unknown> = (data: T) => void;

class EventBus {
  private listeners = new Map<string, Set<EventListener>>();

  subscribe<T>(event: string, fn: EventListener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn as EventListener);
    
    return () => {
      this.listeners.get(event)?.delete(fn as EventListener);
    };
  }

  publish<T>(event: string, data: T): void {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }
}

export const eventBus = new EventBus();

// Types for Studio
export type StudioEvents = 
  | { type: "agent:selected"; agentId: string }
  | { type: "settings:opened"; agentId: string }
  | { type: "settings:closed" }
  | { type: "brain:opened"; agentId: string }
  | { type: "brain:closed" };
```

---

## Code: Example Island Structure

```typescript
// islands/FleetIsland/index.tsx
"use client";

import { useGateway } from "@/infrastructure/GatewayProvider";
import { useAgentList } from "./useAgentList";
import { useEventBus } from "@/infrastructure/event-bus";

interface FleetIslandProps {
  onAgentSelect: (agentId: string) => void;
}

export function FleetIsland({ onAgentSelect }: FleetIslandProps) {
  const { client } = useGateway();
  const { agents, loading, error } = useAgentList(client);
  const eventBus = useEventBus();

  const handleSelect = (agentId: string) => {
    eventBus.publish("agent:selected", { agentId });
    onAgentSelect(agentId);
  };

  return (
    <div className="fleet-island">
      {/* Existing Sidebar code */}
    </div>
  );
}
```

---

## How Long Each Phase Takes

| Phase | Complexity | Estimated Time |
|-------|-----------|----------------|
| Phase 0: Setup | Low | 15 min |
| Phase 1: Shell | Medium | 30 min |
| Phase 2: Fleet | Medium | 45 min |
| Phase 3: Chat | High | 1 hour |
| Phase 4: Settings | Medium | 45 min |
| Phase 5: Cleanup | Low | 15 min |

**Total: ~4 hours** (can spread across multiple sessions)

---

## What Can Go Wrong + Mitigations

| Risk | Mitigation |
|------|------------|
| Break something | Each phase is reversible - commit after each |
| State sync issues | Islands subscribe to GatewayClient events, not each other |
| Context rerenders | GatewayProvider only wraps page, islands subscribe directly |
| Missing state | Migrate one piece at a time, test after each |

---

## Commit After Each Phase

```
git commit -m "Phase 0: Create island folder structure"

git commit -m "Phase 1: Extract shell, add GatewayProvider"

git commit -m "Phase 2: Migrate FleetIsland state"

# ... etc
```

This gives you restore points if something breaks.

---

## Summary

1. **Strangler Fig** - Replace piece by piece, not all at once
2. **Phase 0** - Just create folders
3. **Phase 1** - Shell that wraps current components
4. **Phase 2-4** - Move state into each island
5. **Phase 5** - Clean up the shell

At each step: app works, commit made.

Ready to start Phase 0?
