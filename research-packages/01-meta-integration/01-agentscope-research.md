# AgentScope Research for OpenClaw Integration

**Framework:** https://github.com/modelscope/agentscope
**Stars:** 16K+ | **Language:** Python | **Status:** v1.0.16

---

## Core Architecture

| Component | Purpose |
|-----------|---------|
| **Agent** | ReActAgent, UserAgent, RealtimeAgent, A2AAgent |
| **Memory** | Working memory (InMemory, Redis, SQLAlchemy) + Long-term (Mem0, ReMe) |
| **Pipeline** | MsgHub, Sequential/Fanout pipelines, ChatRoom |
| **Model** | Multi-model support (OpenAI, Anthropic, DashScope, Gemini, Ollama) |
| **Tools** | Toolkit, MCP integration, Agent Skills |
| **State** | StateModule with serialization |

---

## Key Patterns to Adapt

### 1. StateModule for Serialization
```python
class StateModule:
    def register_state(self, attr_name: str, custom_to_json=None, custom_from_json=None):
        # Tracks state for JSON serialization
        
    def state_dict(self) -> dict:
        # Returns serializable state
```

### 2. MsgHub (Multi-Agent Broadcasting)
```python
async with MsgHub(
    participants=[agent1, agent2, agent3],
    announcement=Msg("system", "Start conversation", "system"),
    enable_auto_broadcast=True
) as hub:
    await sequential_pipeline([agent1, agent2, agent3])
```

### 3. Pipeline Primitives
```python
# Sequential: Output of agent N → Input of agent N+1
await sequential_pipeline([agent1, agent2, agent3], msg)

# Fanout: Same input → Multiple agents
results = await fanout_pipeline([agent1, agent2, agent3], msg, enable_gather=True)
```

---

## OpenClaw Package Ideas

| Package | Description |
|--------|-------------|
| `openclaw-agentscope-bridge` | Connect OpenClaw to AgentScope backend |
| `openclaw-memory-adapter` | Supabase-backed memory layer |
| `openclaw-pipeline-ops` | Workflow orchestration UI |
| `openclaw-agent-studio` | Tracing dashboard, memory inspector |

---

## Feasibility: HIGH

- MsgHub/pipelines are Python-async; can expose via REST/WebSocket
- StateModule provides JSON serialization; easily persist to Supabase
- Already supports MCP; can add OpenClaw-specific tools

---

## Source Files
- [`agentscope/module/_state_module.py`](https://github.com/agentscope-ai/agentscope/blob/main/src/agentscope/module/_state_module.py)
- [`agentscope/pipeline/_msghub.py`](https://github.com/agentscope-ai/agentscope/blob/main/src/agentscope/pipeline/_msghub.py)
- [`agentscope/memory/_working_memory/_base.py`](https://github.com/agentscope-ai/agentscope/blob/main/src/agentscope/memory/_working_memory/_base.py)
