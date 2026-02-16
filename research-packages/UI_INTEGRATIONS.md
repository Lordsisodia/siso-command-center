# OpenClaw Studio UI Integration Research

**Purpose:** Document UI components from other OpenClaw projects that can be integrated into OpenClaw Studio
**Research Date:** 2026-02-16
**Target:** Mac Mini deployment via agents

---

## Your Current Studio (What's Already Built)

**Location:** `/Users/shaansisodia/blackbox5/openclaw-studio/` (local MacBook)

### Existing UI Components

| Component | File | Purpose |
|-----------|------|---------|
| `AgentChatPanel.tsx` | 43KB | Main chat interface |
| `AgentInspectPanels.tsx` | 60KB | Agent inspection/inventory |
| `AgentCreateModal.tsx` | 34KB | Agent creation wizard |
| `FleetSidebar.tsx` | 7KB | Fleet navigation |
| `AgentPipelinePanel.tsx` | 8KB | React Flow pipeline viz |
| Header/Connection panels | - | Various UI |

### What Exists
- ✅ Agent fleet management
- ✅ Chat interface  
- ✅ Agent creation wizard
- ✅ Human-in-the-loop approvals
- ✅ React Flow pipeline visualization
- ✅ State management

---

## Research: UI Integrations from Other Projects

### 1. Token Budget / Context Window Health

**Source:** OpenClaw OPS-Suite (`fm9394/OpenClaw-OPS-Suite`)

**What it does:**
- Real-time token consumption monitoring
- Context window utilization
- Cost estimation (Claude pricing)
- Compaction counter tracking

---

### 2. Activity Feed

**Source:** ClawSync (`waynesutton/clawsync`)

**What it does:**
- Real-time agent action feed
- Public/private visibility
- Channel-based organization

---

### 3. Fleet Visualization (D3 Force-Graph)

**Source:** OpenOrca (`ianpilon/OpenOrca`)

**What it does:**
- D3.js force-graph showing agents as nodes
- Color-coded by domain
- Status indicators

---

### 4. Full-Featured Dashboard (tugcantopaloglu)

**Source:** `tugcantopaloglu/openclaw-dashboard` (20 stars)

**What it does:**
- Session management with real-time status
- Rate limit tracking (5-hour rolling)
- Cost analysis by model/session
- **Activity heatmap** (30-day usage)
- **Streak tracking**
- System health: CPU, RAM, disk, temperature with sparklines
- Memory viewer, files manager, log viewer
- Glassmorphic dark theme
- Keyboard shortcuts
- **Security:** Auth, TOTP MFA, rate limiting

---

### 5. Zero-Dependency Dashboard (mudrii)

**Source:** `mudrii/openclaw-dashboard` (36 stars)

**What it does:**
- **Zero-backend** - reads JSON files directly
- **Agent Strip** - horizontal bar showing all agents + status
- **Kanban Board** - drag-and-drop tasks
- **Token tracking** - input/output, model breakdowns
- **Metrics panel** - charts for throughput
- Command palette (Cmd+K)
- **8 accent colors, 10 logo icons** - personalization
- Next.js 16, React 19, Tailwind, Framer Motion, Recharts

---

## Implementation Priority

| Priority | Component | Effort | Value |
|----------|-----------|--------|-------|
| 1 | Token Budget Card | Low | High |
| 2 | Activity Feed | Medium | High |
| 3 | Integration Panel | Medium | Medium |
| 4 | Fleet Viz (D3) | High | Medium |

---

## How to Implement

### For Mac Mini Agent:

1. **Token Budget Card**
   - Check OpenClaw gateway for existing metrics endpoints
   - Or add metrics collection to gateway
   - Build React component for Studio

2. **Activity Feed**
   - Use existing event system in OpenClaw
   - Create WebSocket stream for real-time
   - Build feed UI component

3. **Integration Panel**
   - Use existing extension system
   - Create status checking for each channel
   - Build connection UI

---

## Reference Repositories

| Project | GitHub | Stars | Purpose |
|---------|--------|-------|---------|
| OPS-Suite | `fm9394/OpenClaw-OPS-Suite` | 66 | Token tracking, integrations |
| OpenOrca | `ianpilon/OpenOrca` | 17 | Fleet visualization |
| ClawSync | `waynesutton/clawsync` | 37 | Cloud, activity feed |
| webclaw | `ibelick/webclaw` | 475 | Fast web client |
| AgentBase | `AgentOrchestrator/AgentBase` | 214 | Orchestration patterns |

---

## Notes

- Mac Mini runs OpenClaw via `openclaw studio run`
- Extensions live in `~/Projects/openclaw-studio/` as separate modules
- UI should connect via gateway WebSocket (port 18789)
