# UI Changes Handoff Document

**Date**: 2026-02-14
**Author**: Sisyphus (AI Agent)
**Target**: Mac Mini deployment

---

## Summary

Added a **full agent pipeline visualization** to OpenClaw Studio's Flow tab using React Flow. The visualization shows the complete BlackBox5 agent architecture with project badges.

---

## Files Changed

### New Files Created

| File | Purpose |
|------|---------|
| `src/features/workflows/components/AgentPipelinePanel.tsx` | Main React Flow visualization of BB5 agent pipeline |
| `src/features/workflows/nodes/PipelineNode.tsx` | Custom node component with project badges, status indicators |

### Modified Files

| File | Change |
|------|--------|
| `src/features/workflows/index.ts` | Added exports for AgentPipelinePanel, PipelineNode, bb5Pipeline |
| `src/app/page.tsx` | Replaced WorkflowFlowPanel with AgentPipelinePanel in Flow tab |

---

## Code Details

### 1. PipelineNode.tsx

**Location**: `src/features/workflows/nodes/PipelineNode.tsx`

**What it does**:
- Custom React Flow node with 5 types: `agent`, `team`, `hub`, `external`, `label`
- Shows label + optional sublabel
- Shows project badge (e.g., "blackbox5", "lumelle", "siso-internal")
- Supports status indicators (idle/running/error) - ready for live status

**Node type colors**:
```typescript
agent:   blue border    (#3b82f6)
team:    green border   (#10b981)
hub:     amber border   (#f59e0b)
external: gray border   (#64748b)
label:   transparent (section headers)
```

**Status styles**:
- `idle`: no effect
- `running`: pulsing ring (ready for live agent status)
- `error`: red ring

---

### 2. AgentPipelinePanel.tsx

**Location**: `src/features/workflows/components/AgentPipelinePanel.tsx`

**What it does**:
- Full React Flow canvas with the BB5 agent pipeline
- MiniMap, Controls, Background included
- Legend panel showing node types
- Ready to receive live agent status via `agentStatuses` prop

**Pipeline structure** (defined in `bb5Pipeline` object):

```
TOP LEVEL:
  User → Orchestrator → Task Setter → Task Queue

DEV PIPELINE (column 1):
  Planner → Developer → Tester → Reviewer
  Project: blackbox5

TESTING TOOLKIT (column 2):
  Static → E2E → Visual
  Project: lumelle

CODE HYGIENE (column 3):
  Dead Code → Deps
  Project: siso-internal

RESEARCH (column 4):
  Scout → Librarian
  Project: blackbox5
```

**Props**:
```typescript
type AgentPipelinePanelProps = {
  agentStatuses?: Record<string, "idle" | "running" | "error">;
};
```

**Future enhancement**: Wire `agentStatuses` to live agent state from the store to show running agents pulsing on the diagram.

---

### 3. index.ts (exports)

**Location**: `src/features/workflows/index.ts`

**Added exports**:
```typescript
export { AgentPipelinePanel, bb5Pipeline } from "./components/AgentPipelinePanel";
export { PipelineNode } from "./nodes/PipelineNode";
```

---

### 4. page.tsx (integration)

**Location**: `src/app/page.tsx`

**Import change** (line ~158):
```typescript
// Before
import { WorkflowFlowPanel, WorkflowFlowPanelEmpty } from "@/features/workflows";

// After
import { WorkflowFlowPanel, WorkflowFlowPanelEmpty, AgentPipelinePanel } from "@/features/workflows";
```

**Flow tab change** (line ~2862):
```typescript
// Before
<div className={`${mobilePane === "flow" ? "flex" : "hidden"} ...`}>
  <WorkflowFlowPanel
    guidedCreatePhase={createAgentBusy ? "creating" : null}
    configMutationPhase={...}
  />
</div>

// After
<div className={`${mobilePane === "flow" ? "flex" : "hidden"} ...`}>
  <AgentPipelinePanel />
</div>
```

---

## Dependencies

**Already installed** - no new dependencies needed:
- `@xyflow/react` (React Flow v12+) - already in package.json
- React 18 - already in package.json

---

## How to Test

1. Start Studio: `npm run dev`
2. Open http://localhost:3000 (or your port)
3. Connect to gateway (or skip - Flow tab works without gateway)
4. Click **"Flow"** tab in bottom navigation
5. Should see the full BB5 agent pipeline

---

## Known Issues

1. **Local MacBook connection issues**: Multiple gateway processes, port conflicts, token config issues. Recommend testing on Mac Mini where environment is clean.

2. **Live status not wired**: The `agentStatuses` prop is ready but not connected to the agent store. To add:
   ```typescript
   // In page.tsx, pass live status
   const agentStatuses = useMemo(() => {
     const map: Record<string, "idle" | "running" | "error"> = {};
     agents.forEach(a => {
       map[a.agentId] = a.status === "running" ? "running" : "idle";
     });
     return map;
   }, [agents]);

   <AgentPipelinePanel agentStatuses={agentStatuses} />
   ```

---

## Additional Research Documents

Also created these verification documents:

| Document | Location | Purpose |
|----------|----------|---------|
| Party Mode Verification | `docs/PARTY_MODE_VERIFICATION.md` | Multi-agent conversation architecture |
| Integration Plan | `docs/INTEGRATION_VERIFICATION_PLAN.md` | Full integration checklist, Mac Mini setup |

---

## Party Mode Architecture (Not Implemented, Documented Only)

**Key finding**: OpenClaw already supports multi-agent conversations. No protocol changes needed.

**What's needed for Party Mode**:
1. New `PartyView.tsx` - render multiple `AgentChatPanel` side-by-side
2. New `PartyMessageInput.tsx` - broadcast message to all party members
3. Loop `sendChatMessageViaStudio()` to all agents in party
4. Add party context to agent prompts (in their `AGENTS.md` files)

**Current state**: Documented in `PARTY_MODE_VERIFICATION.md`, not implemented.

---

## Deployment Steps for Mac Mini

**Note**: `openclaw-studio` has its own git repo inside the blackbox5 repo.

```bash
# 1. On MacBook, commit changes in openclaw-studio
cd /Users/shaansisodia/blackbox5/openclaw-studio
git status
git add src/features/workflows/
git add docs/
git add src/app/page.tsx
git commit -m "Add agent pipeline visualization to Flow tab"
git push

# 2. On Mac Mini, pull changes
cd /path/to/blackbox5/openclaw-studio
git pull

# 3. Rebuild Studio
npm run build

# 4. Restart Studio service
# (depends on how you run it - pm2, systemd, etc.)
```

**Git status shows**:
```
 M src/app/page.tsx
?? docs/
?? src/features/workflows/
```

---

## Visual Preview

The Flow tab now shows:

```
┌────────────────────────────────────────────────────────────────┐
│  BlackBox5 Pipeline                                            │
│  ● Agent  ● Team  ● Hub                                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      [User]                                     │
│                        ↓                                        │
│              [Orchestrator] ──→ [Task Setter]                   │
│                        ↓                                        │
│                  [Task Queue]                                   │
│                   ↙   ↓   ↘                                     │
│                  ↙    ↓    ↘                                    │
│    DEV PIPELINE   TESTING   RESEARCH                            │
│    ────────────   ───────   ────────                            │
│    [Planner]      [Static]   [Scout]                            │
│        ↓              ↓         ↓                               │
│    [Developer]    [E2E]     [Librarian]                         │
│        ↓              ↓                                         │
│    [Tester]       [Visual]                                      │
│        ↓                                                        │
│    [Reviewer]                                                   │
│                                                                 │
│  Drag to pan • Scroll to zoom                                   │
└────────────────────────────────────────────────────────────────┘
```

Each node shows:
- Label (e.g., "Planner")
- Sublabel (e.g., "Stories & Branch")
- Project badge (e.g., "blackbox5")

---

## Questions for Next Agent

1. Should we wire live agent status to the pipeline visualization?
2. Should we restore the old WorkflowFlowPanel alongside the new AgentPipelinePanel (tabs or toggle)?
3. Do you want Party Mode implemented? Architecture is documented and ready to build.
