# WebClaw Research - Fast OpenClaw Client

**Repo:** https://github.com/ibelick/webclaw | **Stars:** 475 | **Stack:** React 19 + TanStack Start

---

## What is WebClaw?

Fast web client for OpenClaw. **475 stars** - actively maintained.

---

## Architecture

| Layer | Tech |
|-------|------|
| Framework | React 19 + TanStack Start (SSR) |
| Routing | TanStack Router (file-based) |
| State | TanStack Query + Zustand |
| Styling | TailwindCSS 4 + CVA |
| WebSocket | ws (Node) + EventSource |
| Build | Vite 7 + Nitro |

---

## Gateway Connection

**Key:** `/apps/webclaw/src/server/gateway.ts` (775 lines)

```typescript
type GatewayFrame =
  | { type: 'req'; id: string; method: string; params?: unknown }
  | { type: 'res'; id: string; ok: boolean; payload?: unknown }
  | { type: 'event'; event: string; payload?: unknown; seq?: number };
```

**Auth**: ED25519 device keys (auto-generated)

**Patterns**:
- `gatewayRpc` - One-shot requests
- `acquireGatewayClient` - Persistent WS, reference counted
- `gatewayEventStream` - SSE for real-time

---

## UI Patterns

### Components
- 13 reusable UI components (button, dialog, tabs, etc.)
- Prompt-kit: markdown, tool, thinking displays
- Custom scroll with `use-stick-to-bottom`

### State
```typescript
// TanStack Query for server state
chatQueryKeys = {
  sessions: ['chat', 'sessions'],
  history: (friendlyId, sessionKey) => ['chat', 'history', friendlyId, sessionKey']
}
```

---

## OpenClaw Package Ideas

| Package | Description |
|---------|-------------|
| `@openclaw/gateway-client` | Reusable WS client |
| `@openclaw/ui` | Shared UI components |
| `@openclaw/react-hooks` | Chat hooks |

---

## Source Files
- [`apps/webclaw/src/server/gateway.ts`](https://github.com/ibelick/webclaw/blob/main/apps/webclaw/src/server/gateway.ts)
- [`apps/webclaw/src/routes/chat/`](https://github.com/ibelick/webclaw/blob/main/apps/webclaw/src/routes/chat/)
