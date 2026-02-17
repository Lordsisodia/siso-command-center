# Architecture Decision: UI Layer Strategy

## Context

We want to build a "Command Center" UI that can:
1. Integrate code from anywhere (scrape internet, steal patterns)
2. Be easily debuggable and improvable
3. Keep the data layer stable (Gateway connection)

## Current State Analysis

### Two Codebases Compared

| Aspect | OpenClaw Original (`/openclaw/ui`) | OpenClaw Studio (`/openclaw-studio`) |
|--------|-------------------------------------|--------------------------------------|
| **Framework** | Preact-like vanilla TS | React + Next.js |
| **State** | `@state` decorators | Context + useReducer |
| **Architecture** | Presenters + Controllers | Components + Hooks |
| **File Count** | ~200 focused files | ~100+ files, 1 giant page.tsx (3109 lines) |
| **Gateway Connection** | WebSocket client | GatewayClient.ts (works great) |

### The Gateway Layer (KEEP - Works Perfectly)

```
src/lib/gateway/
├── GatewayClient.ts          # WebSocket connection, retry logic
├── openclaw/GatewayBrowserClient.ts  # Low-level WS client
├── agentConfig.ts           # Agent CRUD operations
├── models.ts               # Gateway models/policies
└── errors.ts               # Error types
```

**Verdict**: This is battle-tested. Don't touch it.

---

## Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    UI LAYER (your playground)                │
│  - React components                                        │
│  - Hooks for state                                         │
│  - Tailwind styling                                        │
│  - Scraped/integrated code goes here                       │
├─────────────────────────────────────────────────────────────┤
│                    STATE LAYER (keep, minimal changes)      │
│  - AgentStore (Context + useReducer)                       │
│  - Event handlers                                          │
├─────────────────────────────────────────────────────────────┤
│                    GATEWAY LAYER (KEEP - don't touch)       │
│  - GatewayClient.ts                                        │
│  - WebSocket connection                                    │
│  - All agent operations                                    │
└─────────────────────────────────────────────────────────────┘
```

### How Integration Works

**Scraped Code → Your UI:**
```
[External Component]
         │
         ▼
┌─────────────────────┐
│  Adapter Layer      │  ← Thin wrapper to fit your patterns
│  (useAgents, etc)   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Your UI Shell      │  ← Uses your hooks, your state
└─────────────────────┘
```

---

## Current Implementation Status

### What's Done Well ✓

| Component | Status | Notes |
|-----------|--------|-------|
| GatewayClient | ✅ KEEP | WebSocket, auth, retry - works |
| useAgents hook | ✅ Created | Fetches agents via `agents.list` |
| useModalState | ✅ Created | Modal open/close state |
| ProjectDashboard | ✅ Enhanced | Sparklines, drag-drop, animations |

### What's Not Done Yet ⚠️

| Component | Status | Notes |
|-----------|--------|-------|
| page.tsx monolith | ⚠️ 3109 lines | Too big, hard to modify |
| Event handlers | ⚠️ Coupled | 15+ refs, can't easily extract |
| UI component library | ❌ None | No place for scraped components |

---

## Recommendations

### Phase 1: Stabilize (Current)
- ✅ Keep GatewayClient
- ✅ Keep AgentStore  
- ✅ Add useAgents, useModalState hooks

### Phase 2: Modularize (Next)
- Create `src/components/` for scraped/integrated code
- Extract more hooks as needed (useAgentActions, useConnection)
- Build new UI features on top of existing hooks

### Phase 3: Scale (Later)
- Establish component library pattern
- Document integration process
- Automate scraping → wrapping workflow

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| page.tsx too coupled | Don't refactor deeply - build new components instead |
| Gateway changes break UI | Keep Gateway layer isolated - test against stub |
| Too much scraped code | Use thin adapters - always wrap, never paste directly |

---

*Decision Date: 2026-02-17*
*Status: APPROVED - Proceed with Phase 2*
