# OpenOrca Research for OpenClaw Integration

**Framework:** https://github.com/ianpilon/OpenOrca
**Type:** Fleet Command Center for AI Agents | **Commit:** 49db645

---

## What is OpenOrca?

**"Claw Orchestrator"** - Command center for managing personal AI agent fleets.

NOT related to Orca ML models - it's a **fleet orchestration system**.

---

## Architecture

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS 4, Framer Motion, D3.js |
| Backend | Node.js, Express, Drizzle ORM |
| Database | PostgreSQL |
| Real-time | WebSocket (voice + streaming) |
| AI | Anthropic SDK, X.AI Realtime API |

---

## Key Features

### Agent Fleet Visualization
- D3.js force-graph showing agents as nodes
- Color-coded by domain (Communications=Pink, Development=Green)
- Status: active/idle/waiting/offline/intervention_required

### Domain-Based Organization
```typescript
type AgentDomain = 
  | 'communications'  // WhatsApp, Telegram, Discord, Slack, Email
  | 'productivity'    // Calendar, Notes, Files, Tasks
  | 'research'        // Browser, Web Search, Data Analysis
  | 'development'     // Terminal, GitHub, Code
  | 'automation';    // Scheduled Tasks, Workflows
```

### Human-in-the-Loop Intervention
```typescript
interface Intervention {
  type: 'approval_needed' | 'clarification' | 'permission' | 'error' | 'cost_limit';
  question: string;
  context: string;
  options?: string[];
  priority: TaskPriority;
}
```

### Swarm Coordination
```typescript
interface Swarm {
  name: string;
  objective: string;
  agents: string[];
  leadAgentId: string;
  status: 'forming' | 'active' | 'completed' | 'disbanded';
}
```

---

## OpenClaw Package Ideas

| Package | Priority | Description |
|---------|----------|-------------|
| `openclaw-macmini-connector` | **HIGH** | Bridge between Mac Mini and dashboard |
| `openclaw-agent-adapter` | HIGH | Generic adapter for agent registration |
| `openclaw-intervention-bridge` | MEDIUM | Webhook-based approvals |
| `openclaw-voice-gateway` | MEDIUM | Voice command support |
| `openclaw-persistence` | LOW | PostgreSQL schema + CRUD |

---

## Adaptation for OpenClaw Studio

```
OpenOrca Concept          →  OpenClaw Package
─────────────────────────────────────────────
Agent Visualization      →  Mac Mini status dashboard
Domain-based agents     →  Domain-specific runners
Intervention requests   →  Approval workflows
Swarm coordination      →  Multi-Mac orchestration
Action timeline        →  Activity audit log
```

---

## Recommended First Package

**OpenClaw-MacMini-Monitor**
- Agent that reports Mac Mini status to dashboard
- Shows CPU, memory, disk, running processes
- Simple, high-value starting point

---

## Source Files
- [`client/src/components/AgentVisualization.tsx`](https://github.com/ianpilon/OpenOrca/blob/main/client/src/components/AgentVisualization.tsx)
- [`client/src/lib/clawData.ts`](https://github.com/ianpilon/OpenOrca/blob/main/client/src/lib/clawData.ts)
- [`server/routes.ts`](https://github.com/ianpilon/OpenOrca/blob/main/server/routes.ts)
