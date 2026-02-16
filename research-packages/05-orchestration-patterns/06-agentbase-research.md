# AgentBase Research - Multi-Agent Orchestrator

**Repo:** https://github.com/AgentOrchestrator/AgentBase | **Stars:** 214 | **Stack:** Electron + TypeScript

---

## What is AgentBase?

Multi-agent orchestrator for tracking and analyzing AI coding assistant conversations (Claude Code, Cursor, Windsurf). Visual canvas-based desktop app with isolated edits via git worktrees.

---

## Architecture

```
apps/desktop/          # Electron app
packages/shared/       # Shared types
  ├── readers/        # Claude Code, Cursor, Codex readers
  ├── hooks/         # Event system + adapters
  └── loaders/       # Chat history interfaces
```

### Core Components

| Component | Purpose |
|-----------|---------|
| **EventRegistry** | Pub/sub hub for agent events |
| **ClaudeCodeAgent** | SDK wrapper for Claude Code |
| **SessionFileWatcher** | File-based session monitoring |
| **Loaders** | Chat history readers for each IDE |

---

## Key Patterns

### 1. Vendor-Agnostic Event System
```typescript
export type AgentEventType =
  | 'session:start' | 'session:end'
  | 'user_input:complete'
  | 'tool:begin' | 'tool:complete' | 'tool:error'
  | 'permission:request' | 'permission:approve' | 'permission:deny'
  | 'delegation:start' | 'delegation:end'
  | 'context:compact';
```

### 2. Claude Code SDK Hook Bridge
```
SDK Hook           → Vendor-Neutral Event
─────────────────────────────────────
PreToolUse        → tool:begin
PostToolUse       → tool:complete
PermissionRequest → permission:request
SessionStart      → session:start
SubagentStart     → delegation:start
```

### 3. Session File Watching
```typescript
// Uses fs.watch on ~/.claude/projects/<path>/<session>.jsonl
interface SessionFileChangeEvent {
  type: 'created' | 'updated' | 'deleted';
  sessionId: string;
  projectPath: string;
  agentType: CodingAgentType;
}
```

---

## OpenClaw Package Ideas

| Package | Priority | Description |
|---------|----------|-------------|
| `@openclaw/claude-code-hooks` | HIGH | Pre-built hook handlers |
| `@openclaw/session-tracker` | HIGH | Real-time session watcher |
| `@openclaw/canvas-core` | MEDIUM | React node graph for visualization |
| `@openclaw/multi-agent` | HIGH | Parallel agent orchestration |

---

## Key Technical Insights

- **Session forking** uses git worktrees for parallel edits
- **Permission handling** can be intercepted with allow/deny/modify actions
- **Claude Code SDK hooks**: 11 hooks available

---

## Source Files
- [`packages/shared/src/hooks/registry.ts`](https://github.com/AgentOrchestrator/AgentBase/blob/main/packages/shared/src/hooks/registry.ts)
- [`packages/shared/src/hooks/adapters/claude-code-sdk.ts`](https://github.com/AgentOrchestrator/AgentBase/blob/main/packages/shared/src/hooks/adapters/claude-code-sdk.ts)
