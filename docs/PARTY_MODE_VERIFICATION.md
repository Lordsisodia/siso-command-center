# Party Mode Verification & Implementation Guide

**Status**: Verified - Architecture supports party mode with minimal changes
**Date**: 2026-02-14

## Executive Summary

Party mode (multiple AI agents sharing a conversation) is **architecturally supported** by OpenClaw today. The gateway already broadcasts all events to all clients, and Studio already receives and routes events for all agents. We just need a new UI view.

## Verification Findings

### ✅ 1. Gateway Broadcasts ALL Events to ALL Clients

**File**: `/openclaw/src/gateway/server-broadcast.ts`

```typescript
// Line 73-97
for (const c of params.clients) {
  if (targetConnIds && !targetConnIds.has(c.connId)) {
    continue;
  }
  // ... sends event frame to every connected client
  c.socket.send(frame);
}
```

**Implication**: Every Studio instance receives `event:agent` and `event:chat` frames for **all agents**, not just the selected one.

---

### ✅ 2. Studio Already Routes Events by Agent

**File**: `/openclaw-studio/src/features/agents/state/gatewayRuntimeEventHandler.ts`

```typescript
// Line 75-83
const findAgentBySessionKey = (agents: AgentState[], sessionKey: string): string | null => {
  const exact = agents.find((agent) => isSameSessionKey(agent.sessionKey, sessionKey));
  return exact ? exact.agentId : null;
};

// Line 897-919 - handleEvent routes to correct agent
const handleEvent = (event: EventFrame) => {
  const eventKind = classifyGatewayEventKind(event.event);
  // Routes chat/agent events to the correct agent by sessionKey/runId
  if (eventKind === "runtime-chat") {
    handleRuntimeChatEvent(payload);  // Looks up agent, dispatches output
  }
  if (eventKind === "runtime-agent") {
    handleRuntimeAgentEvent(payload);  // Looks up agent, dispatches output
  }
};
```

**Implication**: Studio's state management already supports multiple agents with independent output streams. Each agent has its own:
- `outputLines[]` - chat transcript
- `streamText` - live streaming text
- `thinkingTrace` - reasoning traces
- `status` - running/idle/error

---

### ✅ 3. Chat Send is Per-Agent (Easy to Broadcast)

**File**: `/openclaw-studio/src/features/agents/operations/chatSendOperation.ts`

```typescript
// Line 124-129
await params.client.call("chat.send", {
  sessionKey: params.sessionKey,  // One agent at a time
  message: buildAgentInstruction({ message: trimmed }),
  deliver: false,
  idempotencyKey: runId,
});
```

**Implication**: To broadcast a message to N agents, we loop this call N times with different `sessionKey` values.

---

### ✅ 4. AgentChatPanel is Self-Contained

**File**: `/openclaw-studio/src/features/agents/components/AgentChatPanel.tsx`

```typescript
type AgentChatPanelProps = {
  agent: AgentRecord;
  isSelected: boolean;
  canSend: boolean;
  models: GatewayModelChoice[];
  // ... each panel renders one agent's chat
};
```

**Implication**: We can render multiple `AgentChatPanel` components side-by-side. Each manages its own state via `agent` prop.

---

## What Needs to Change

### UI Layer (New Component)

Create `PartyView.tsx` that:
1. Shows multiple `AgentChatPanel` components in a grid (2-4 columns)
2. Has a single shared message input
3. Broadcasts messages to all party members
4. Shows all agents' responses in real-time

```tsx
// Conceptual implementation
function PartyView({ partyAgents }: { partyAgents: AgentState[] }) {
  const [message, setMessage] = useState("");
  
  const handleSend = async (msg: string) => {
    // Broadcast to all agents
    await Promise.all(
      partyAgents.map(agent => 
        sendChatMessageViaStudio({
          client,
          agentId: agent.agentId,
          sessionKey: agent.sessionKey,
          message: msg,
        })
      )
    );
  };

  return (
    <div className="party-grid">
      {partyAgents.map(agent => (
        <AgentChatPanel
          key={agent.agentId}
          agent={agent}
          canSend={false}  // Use shared input instead
          // ... other props
        />
      ))}
      <SharedMessageInput onSend={handleSend} />
    </div>
  );
}
```

### Agent Configuration (Prompts)

Each party member needs to know they're in a party. Add to their `AGENTS.md`:

```markdown
## Party Mode

You are in a party with other AI agents. Each agent can see the conversation
and respond when they have something valuable to add.

Party members: ArchitectBot, PMBot, DevOpsBot

Guidelines:
- Listen to other agents' responses
- Build on their ideas when relevant
- Don't repeat what others have said
- Be concise - others will also respond
- Jump in when your expertise is relevant
```

---

## No Protocol Changes Needed

The existing protocol already supports party mode:

| Current | Party Mode |
|---------|------------|
| `chat.send` to one sessionKey | `chat.send` to N sessionKeys (parallel) |
| Events broadcast to all clients | Same - events already broadcast |
| Studio routes by sessionKey | Same - just render multiple panels |

---

## Implementation Plan

### Phase 1: MVP (1-2 days)

1. **Add Party Mode Toggle** to Studio header
2. **Create `PartyView.tsx`** with 2-column grid
3. **Create `SharedMessageInput.tsx`** for broadcast sending
4. **Wire up broadcasting logic** - loop `sendChatMessageViaStudio`

### Phase 2: Polish (1 day)

1. **Responsive grid** - 2/3/4 columns based on agent count
2. **Agent status indicators** - show which are thinking/speaking
3. **Turn coordination hints** - visual cues for who's responding
4. **Party configuration UI** - select which agents are in the party

### Phase 3: Advanced (optional)

1. **AI Moderator** - use a fast model to pick who speaks next
2. **Shared context** - agents see each other's full responses (via prompt)
3. **Party persistence** - save/load party configurations
4. **Party history** - shared transcript across all agents

---

## Mac Mini Setup Instructions

### Prerequisites

```bash
# 1. Install OpenClaw
npm install -g openclaw@latest

# 2. Run initial setup
openclaw onboard --install-daemon
```

### Start the Gateway

```bash
# Option A: Foreground (for testing)
openclaw gateway run --bind loopback --port 18789 --verbose

# Option B: Background daemon (recommended for production)
openclaw config set gateway.mode local
openclaw config set gateway.auth.mode token
openclaw config set gateway.auth.token "$(openssl rand -hex 16)"
# Gateway starts automatically via launchd
```

### Start Studio

```bash
# Clone and install
cd /path/to/blackbox5/openclaw-studio
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Configure Studio

1. Open Studio in browser
2. Go to Settings
3. Set Gateway URL: `ws://localhost:18789`
4. Set Token: `openclaw config get gateway.auth.token`

### Create Party Agents

```bash
# Create 3 agents with different personalities
openclaw agent create --id architect --name "Architect"
openclaw agent create --id pm --name "Product Manager"  
openclaw agent create --id devops --name "DevOps Engineer"
```

### Verify Events Flow

```bash
# In one terminal, watch gateway logs
tail -f ~/.openclaw/logs/gateway.log

# In Studio, send a message to one agent
# You should see events for ALL agents in the gateway logs
```

---

## Testing Checklist

- [ ] Gateway starts and accepts connections
- [ ] Studio connects to gateway successfully
- [ ] All 3 agents appear in fleet sidebar
- [ ] Sending message to one agent shows events in gateway logs
- [ ] Each agent has independent chat history
- [ ] Multiple `AgentChatPanel` components can render simultaneously

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MAC MINI                                 │
│                                                                  │
│  ┌─────────────┐     WebSocket      ┌────────────────────────┐ │
│  │   Studio    │◄──────────────────►│    OpenClaw Gateway    │ │
│  │  (Next.js)  │   ws://localhost    │    (port 18789)        │ │
│  │             │                     │                        │ │
│  │  PartyView  │                     │  Broadcasts ALL events │ │
│  │  ┌────────┐ │                     │  to ALL clients        │ │
│  │  │Agent A │ │                     │                        │ │
│  │  ├────────┤ │                     │  ┌──────────────────┐  │ │
│  │  │Agent B │ │                     │  │ chat.send(agentA)│  │ │
│  │  ├────────┤ │                     │  │ chat.send(agentB)│  │ │
│  │  │Agent C │ │                     │  │ chat.send(agentC)│  │ │
│  │  └────────┘ │                     │  └──────────────────┘  │ │
│  └─────────────┘                     └────────────────────────┘ │
│                                               │                  │
│                                               ▼                  │
│                                    ┌────────────────────┐       │
│                                    │   Pi Agent Engine  │       │
│                                    │   (runs agents)    │       │
│                                    └────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Concrete Implementation

### Current Layout (Single Agent)

```tsx
// page.tsx line 2756
<AgentChatPanel
  agent={focusedAgent}          // ONE agent at a time
  canSend={status === "connected"}
  onSend={(message) => handleSend(focusedAgent.agentId, focusedAgent.sessionKey, message)}
  // ...
/>
```

### Party Mode Layout (Multiple Agents)

```tsx
// New component: PartyView.tsx
<div className="party-grid grid grid-cols-3 gap-2 h-full">
  {partyAgents.map(agent => (
    <AgentChatPanel
      key={agent.agentId}
      agent={agent}
      canSend={false}              // Disable individual send
      isSelected={false}
      // ... same props as current, but per-agent
    />
  ))}
</div>

// Shared input at bottom
<div className="party-input border-t p-2">
  <input 
    placeholder="Send to all party members..."
    onKeyPress={(e) => {
      if (e.key === "Enter") {
        // Broadcast to all party agents
        partyAgents.forEach(agent => 
          handleSend(agent.agentId, agent.sessionKey, message)
        );
      }
    }}
  />
</div>
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/features/agents/components/PartyView.tsx` | **NEW** - Multi-panel grid view |
| `src/features/agents/components/PartyMessageInput.tsx` | **NEW** - Shared broadcast input |
| `src/features/agents/operations/broadcastSendOperation.ts` | **NEW** - Send to multiple agents |
| `src/app/page.tsx` | Add party mode toggle + integrate PartyView |
| `src/features/agents/state/store.tsx` | Add `partyMode: boolean`, `partyAgentIds: string[]` |

---

## Conclusion

Party mode requires **UI work only** - no protocol changes, no gateway modifications. The architecture already supports it. Estimated implementation: **2-3 days** for a working prototype.

The key insight: **Studio already receives events for all agents**. We just need to render multiple chat panels side-by-side and broadcast messages to all party members.
