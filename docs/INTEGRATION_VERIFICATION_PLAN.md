# Integration & Verification Plan for OpenClaw Studio + BlackBox5

**Date**: 2026-02-14
**Status**: Ready for Integration

---

## What's Already Built (Verification Results)

### ✅ 1. Agent Flow Visualizer (React Flow)

**Location**: `/agent-flow-visualizer/`

**Status**: WORKING - Dependencies installed, Vite + React Flow ready

**What it does**:
- Full React Flow visualization of the Lumelle e-commerce agent pipeline
- 7-step AntFarm pattern: Planner → Setup → Developer → Verifier → Tester → PR Creator → Reviewer
- Testing toolkit phases: Static → Browser → Visual → Responsive
- Code hygiene agents: Dead Code, Patterns, Linter, Dependencies
- Backend audit agents: Performance, Security, API Health
- Client support flow: Chat → Classifier → Solution Finder

**How to verify**:
```bash
cd /Users/shaansisodia/blackbox5/agent-flow-visualizer
npm run dev
# Open http://localhost:5173
```

---

### ✅ 2. OpenClaw Studio Workflow Panel (React Flow)

**Location**: `/openclaw-studio/src/features/workflows/`

**Status**: INTEGRATED - Already in Studio codebase

**What it does**:
- `WorkflowFlowPanel.tsx` - Renders workflow states as React Flow graph
- `workflowToNodes.ts` - Converts workflow definitions to nodes/edges
- Shows guided-create and config-mutation workflows
- Custom `WorkflowNode` component with phase status (pending/active/completed/error)

**How to verify**:
```bash
cd /Users/shaansisodia/blackbox5/openclaw-studio
npm run dev
# Create a new agent - the workflow panel shows the phases
```

---

### ✅ 3. Project-Agent Memory Structure

**Location**: `/5-project-memory/{project}/`

**Projects**:
- `blackbox5/` - Main BB5 project
- `lumelle/` - Lumelle e-commerce project
- `siso-internal/` - SISO Internal tasks
- `management/` - Management workflows

**What it tracks**:
```
5-project-memory/{project}/
├── .autonomous/agents/
│   ├── agent-registry.yaml     # All agents for this project
│   ├── communications/
│   │   ├── queue.yaml          # Task queue
│   │   └── events.yaml         # Event log
│   └── planner/runs/           # Planner execution history
├── INDEX.yaml                  # Project index
└── code_index.md              # Code structure map
```

**How to verify**:
```bash
cat /Users/shaansisodia/blackbox5/5-project-memory/blackbox5/.autonomous/agents/agent-registry.yaml
```

---

### ✅ 4. GitHub Research Folders

**Location**: `/6-roadmap/_research/external/GitHub/`

**Folders**:
| Folder | Contents |
|--------|----------|
| `Agents/` | Agent framework research, config patterns |
| `Claude-Code/` | Claude Code integration analysis |
| `Ralph-Frameworks/` | Ralph framework code, BB5 audits |
| `get-shit-done/` | GSD methodology research |

**How to verify**:
```bash
ls -la /Users/shaansisodia/blackbox5/6-roadmap/_research/external/GitHub/
```

---

## UI Improvements (Minimal Code Changes)

### Improvement 1: Agent → Project Badge

**What**: Show which project each agent belongs to in Studio

**Files to modify**:
- `openclaw-studio/src/features/agents/components/FleetSidebar.tsx` - Add project badge
- `openclaw-studio/src/features/agents/state/store.tsx` - Add `project` field to AgentState

**Code change**:
```tsx
// In FleetSidebar, add project badge
<div className="flex items-center gap-1">
  <span className="text-xs text-muted-foreground">
    {agent.project || 'blackbox5'}
  </span>
</div>
```

---

### Improvement 2: Integrate Agent Flow Visualizer

**What**: Add the agent-flow-visualizer as a tab in Studio

**Approach**: iframe embed or component port

**Files to create**:
- `openclaw-studio/src/features/flow/FlowVisualizerPanel.tsx`

**Code**:
```tsx
// Embed the existing visualizer
export function FlowVisualizerPanel() {
  return (
    <iframe 
      src="http://localhost:5173"  // Or build and serve static
      className="h-full w-full border-0"
    />
  );
}
```

---

### Improvement 3: Project Selector

**What**: Add project selector to Studio header

**Files to modify**:
- `openclaw-studio/src/features/agents/components/HeaderBar.tsx`

**Data source**: List directories in `5-project-memory/`

**Code**:
```tsx
const projects = ['blackbox5', 'lumelle', 'siso-internal', 'management'];

<Select value={selectedProject} onValueChange={setSelectedProject}>
  {projects.map(p => (
    <SelectItem key={p} value={p}>{p}</SelectItem>
  ))}
</Select>
```

---

### Improvement 4: Agent Status in Flow

**What**: Show live agent status on the flow diagram

**Integration**:
- Use Studio's existing agent state (`status: 'running' | 'idle' | 'error'`)
- Map agent IDs to flow nodes
- Color-code nodes based on status

**Code** (in flow visualizer):
```tsx
const nodeStatus = useAgentStore(state => state.agents.find(a => a.id === nodeId)?.status);

const nodeClassName = {
  running: 'node-active',
  idle: 'node-idle',
  error: 'node-error',
}[nodeStatus];
```

---

## Party Mode Integration (UI Only)

The party mode verification found that the architecture already supports multi-agent conversations. Here's how to integrate with existing flow:

### Party Mode + Flow Visualization

1. **Party View**: Multiple `AgentChatPanel` components side-by-side
2. **Flow Overlay**: Show which agents are in the party on the flow diagram
3. **Broadcast Input**: Single input that sends to all party members

**Files to create**:
```
openclaw-studio/src/features/party/
├── PartyView.tsx           # Multi-panel view
├── PartyInput.tsx          # Broadcast message input
├── PartyFlowOverlay.tsx    # Flow diagram with party highlights
└── hooks/
    └── usePartyBroadcast.ts # Send to multiple agents
```

---

## Verification Checklist

### On MacBook (Local)

- [x] Agent flow visualizer runs (`cd agent-flow-visualizer && npm run dev`)
- [x] OpenClaw Studio runs (`cd openclaw-studio && npm run dev`)
- [x] Workflow panel shows phases during agent creation
- [x] Project memory structure exists at `5-project-memory/`
- [x] GitHub research folders exist at `6-roadmap/_research/external/GitHub/`

### On Mac Mini (Server)

- [ ] Gateway starts: `openclaw gateway run --bind loopback --port 18789`
- [ ] Studio connects: Set `ws://localhost:18789` in settings
- [ ] Agents appear in fleet sidebar
- [ ] Events flow (send message → see response)
- [ ] Flow visualizer accessible from Studio (iframe or static serve)

---

## Quick Start Commands

### Start Everything (MacBook)

```bash
# Terminal 1: Gateway
cd /Users/shaansisodia/blackbox5/openclaw
pnpm gateway:dev

# Terminal 2: Studio
cd /Users/shaansisodia/blackbox5/openclaw-studio
npm run dev

# Terminal 3: Flow Visualizer
cd /Users/shaansisodia/blackbox5/agent-flow-visualizer
npm run dev
```

### Verify Integration

```bash
# 1. Check gateway is running
curl http://localhost:18789/health

# 2. Check Studio is serving
curl http://localhost:3000

# 3. Check flow visualizer is serving
curl http://localhost:5173

# 4. Check project memory
ls /Users/shaansisodia/blackbox5/5-project-memory/
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MACBOOK (Dev)                                 │
│                                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │ Agent Flow     │  │ OpenClaw       │  │ OpenClaw       │            │
│  │ Visualizer     │  │ Studio         │  │ Gateway        │            │
│  │ (port 5173)    │  │ (port 3000)    │  │ (port 18789)   │            │
│  │                │  │                │  │                │            │
│  │ React Flow     │◄─┤ iframe embed   │◄─┤ WebSocket      │            │
│  │ Pipeline view  │  │ Party View     │  │ Events         │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
│                              │                  │                       │
│                              │                  │                       │
│                              ▼                  ▼                       │
│                    ┌─────────────────────────────────┐                  │
│                    │     5-project-memory/           │                  │
│                    │  ├── blackbox5/                 │                  │
│                    │  ├── lumelle/                   │                  │
│                    │  ├── siso-internal/             │                  │
│                    │  └── management/                │                  │
│                    └─────────────────────────────────┘                  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

                                    │
                                    │ Deploy
                                    ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                           MAC MINI (Server)                             │
│                                                                         │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐            │
│  │ OpenClaw       │  │ OpenClaw       │  │ OpenClaw       │            │
│  │ Studio         │  │ Gateway        │  │ Agents         │            │
│  │ (production)   │  │ (daemon)       │  │ (running)      │            │
│  └────────────────┘  └────────────────┘  └────────────────┘            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Files Summary

| Category | Path | Use |
|----------|------|-----|
| Flow Visualizer | `agent-flow-visualizer/` | Pipeline visualization |
| Studio Workflows | `openclaw-studio/src/features/workflows/` | React Flow components |
| Project Memory | `5-project-memory/{project}/` | Agent-project relationships |
| GitHub Research | `6-roadmap/_research/external/GitHub/` | Framework code to integrate |
| Party Mode Docs | `openclaw-studio/docs/PARTY_MODE_VERIFICATION.md` | Multi-agent architecture |

---

## Next Steps

1. **Start the flow visualizer** alongside Studio to see both
2. **Add project badges** to the fleet sidebar (simple UI change)
3. **Embed flow visualizer** in Studio as a new tab
4. **Build party view** using existing AgentChatPanel components
5. **Deploy to Mac Mini** once verified on MacBook
