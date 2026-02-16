# DeerFlow Research for OpenClaw Integration

**Framework:** https://github.com/bytedance/deer-flow
**Stars:** ~20K | **Language:** Python + React/TypeScript

---

## Core Architecture

### Token Compression
| Technique | Implementation |
|-----------|---------------|
| **SummarizationMiddleware** | LangChain's built-in compression |
| **Subagent Truncation** | Caps parallel task calls (default: 3) |
| **Token Budgeting** | Trigger by messages count, token count, or context fraction |
| **Context Retention** | Keep last 20 messages or 3000 tokens |

### State Management
```python
class ThreadState(AgentState):
    sandbox: NotRequired[SandboxState | None]
    thread_data: NotRequired[ThreadDataState | None]
    title: NotRequired[str | None]
    artifacts: Annotated[list[str], merge_artifacts]
    todos: NotRequired[list | None]
```

### Middleware Pipeline (Ordered)
1. ThreadDataMiddleware
2. UploadsMiddleware
3. SandboxMiddleware
4. DanglingToolCallMiddleware
5. **SummarizationMiddleware** ← KEY
6. TodoListMiddleware
7. TitleMiddleware
8. MemoryMiddleware
9. ViewImageMiddleware
10. SubagentLimitMiddleware
11. ClarificationMiddleware

---

## Key Patterns to Adapt

### Skills System
```yaml
---
name: skill-name
description: When to use this skill
---
# Skill Documentation
## Overview
## When to Use
## Methodology
```

### Subagent Execution
- ThreadPoolExecutor for parallel execution
- Configurable timeout (default: 120s)
- Max turns limit per subagent
- Trace ID for distributed logging

---

## OpenClaw Package Ideas

| Package | Priority | Description |
|---------|----------|-------------|
| `@openclaw/context-manager` | HIGH | Token compression, summarization |
| `@openclaw/workflow-state` | HIGH | TypedDict schemas, middleware chain |
| `@openclaw/workflow-engine` | HIGH | Subagent executor, task tracking |
| `@openclaw/memory-vector-store` | MEDIUM | RAG-backed memory with Qdrant |
| `@openclaw/skill-registry` | MEDIUM | Skill loading, marketplace |

---

## Feasibility: HIGH

- Token compression: Mature (LangChain middleware)
- State management: TypedDict + custom reducers
- Multi-agent: LangGraph-powered
- Extension system: Skill-based, well-designed

---

## Source Files
- [`backend/src/config/summarization_config.py`](https://github.com/bytedance/deer-flow/blob/main/backend/src/config/summarization_config.py)
- [`backend/src/agents/thread_state.py`](https://github.com/bytedance/deer-flow/blob/main/backend/src/agents/thread_state.py)
- [`backend/src/agents/lead_agent/agent.py`](https://github.com/bytedance/deer-flow/blob/main/backend/src/agents/lead_agent/agent.py)
