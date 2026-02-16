# ClawSync Research - OpenClaw Cloud Version

**Repo:** https://github.com/waynesutton/clawsync | **Stars:** 37 | **Stack:** Convex + React + Vite

---

## Architecture

| Layer | Tech |
|-------|------|
| Backend | Convex + @convex-dev/agent |
| Frontend | React 18 + Vite + TypeScript |
| AI | Vercel AI SDK |
| DB | Convex (PostgreSQL-backed) |

---

## Key Features

### Multi-Agent with Shared Souls
```typescript
// Reusable personality documents
souls table → shared across agents

// Per-agent tool scoping
agentSkillAssignments, agentMcpAssignments
```

### Skills Marketplace
- Template, webhook, code skill types
- External registry sync from GitHub URLs

### Real-Time Activity Feed
- Public/private visibility per entry
- Channel-based organization
- Per-agent filtering

---

## OpenClaw Package Ideas

| Package | Description |
|---------|-------------|
| `@openclaw/multi-agent` | Shared souls, per-agent tool scoping |
| `@openclaw/skills-marketplace` | Skill registry + external sync |
| `@openclaw/realtime-feed` | Activity log with visibility |
| `@openclaw/api-gateway` | API key management + rate limits |

---

## How Differs from Local OpenClaw

| Aspect | Local | ClawSync |
|--------|-------|----------|
| Runtime | Desktop (Electron) | Convex cloud |
| Storage | Local JSON | Convex DB |
| Multi-user | Single | Multi-tenant |

---

## Key Patterns

```typescript
// Convex Agent component
import { Agent } from '@convex-dev/agent';
export const clawsyncAgent = new Agent(components.agent, {
  name: 'ClawSync Agent',
  languageModel: anthropic('claude-sonnet-4-20250514'),
  tools: {}, // Loaded dynamically
});
```

---

## Source Files
- [`convex/schema.ts`](https://github.com/waynesutton/clawsync/blob/main/convex/schema.ts)
- [`convex/agent/clawsync.ts`](https://github.com/waynesutton/clawsync/blob/main/convex/agent/clawsync.ts)
