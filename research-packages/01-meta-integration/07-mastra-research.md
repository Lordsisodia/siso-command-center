# Mastra Framework Research - AI Framework from Gatsby Team

**Repo:** https://github.com/mastra-ai/mastra | **Stars:** 21K ⭐ | **Stack:** TypeScript + Vercel AI SDK

---

## What is Mastra?

The **Gatsby team's AI framework** - Production-ready (21K stars) TypeScript-first agent framework.

---

## Architecture

### Three Execution Models

| Pattern | Use Case |
|---------|----------|
| **Agent** | Open-ended tasks with iterative reasoning |
| **Workflow** | Explicit control with `.then()`, `.branch()`, `.parallel()` |
| **Network** | Multi-agent routing between primitives |

### Core Stack
- **AI SDK**: Vercel AI SDK (v4/v5)
- **TypeScript**: Native Zod schemas
- **40+ Model Providers**: Unified interface

---

## Key Features

### 1. Workspace (Unified Agent Environment)
```typescript
const workspace = new Workspace({
  filesystem: new LocalFilesystem({ basePath: './workspace' }),
  sandbox: new LocalSandbox({ workingDirectory: './workspace' }),
  bm25: true, // keyword search
});
```

### 2. Memory System (Three Types)
- **Message History** - Full conversation
- **Working Memory** - Structured user info (template-based)
- **Semantic Recall** - Vector search retrieval
- **Observational Memory** - 5-40x conversation compression

### 3. Tool System (Zod-based)
```typescript
const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get weather for a location',
  inputSchema: z.object({
    location: z.string(),
    units: z.enum(['celsius', 'fahrenheit']).optional()
  }),
  execute: async (inputData) => { /* ... */ }
});
```

### 4. Human-in-the-Loop
- `requireApproval` for dangerous ops
- Suspend/resume workflows

---

## OpenClaw Package Ideas

| Package | Priority | Description |
|---------|----------|-------------|
| `@openclaw/mastra-agent` | P0 | Wrapper for OpenClaw-optimized Mastra agents |
| `@openclaw/mastra-tools` | P0 | Pre-built tools (file, git, terminal) |
| `@openclaw/mastra-memory` | P1 | Supabase vector storage for semantic recall |
| `@openclaw/mastra-workflows` | P1 | Common workflow templates |

---

## Feasibility: HIGH

- Production-ready (21K stars)
- TypeScript throughout
- Clean API design
- Workspace feature is killer for agents

---

## Source Files
- [`packages/core/src/agent/agent.ts`](https://github.com/mastra-ai/mastra/blob/main/packages/core/src/agent/agent.ts)
- [`packages/core/src/workspace/`](https://github.com/mastra-ai/mastra/blob/main/packages/core/src/workspace/)
- [`packages/core/src/memory/memory.ts`](https://github.com/mastra-ai/mastra/blob/main/packages/core/src/memory/memory.ts)
