# Agent Memory Architecture Specification

**Version:** 1.1 (Revised)
**Created:** 2026-02-17
**Status:** Planning

---

## Overview

This document defines the memory architecture for all agents in the SISO ecosystem.

## Core Principles

1. **Shared where logical, private where needed**
2. **Tiered by lifespan** — Session → Swarm → Agent → Workspace → Global
3. **All memory in `/memory/` folder** — no loose files at root
4. **Agent-named folders** — use "legacy" not "main"

---

## Folder Structure

```
COMMAND-CENTER/
└── memory/
    ├── USER.md                    # Global: Who the human is
    ├── architecture.md            # This spec
    ├── SETUP-CHECKLIST.md        # Implementation tracker
    ├── templates/
    │   └── agent/
    │       ├── identity.md
    │       ├── soul.md
    │       ├── memory.md
    │       └── tools.md
    └── WORKSPACES/
        └── [WORKSPACE]/
            ├── workspace/        # Shared workspace memory
            │   ├── README.md
            │   ├── TEAM.md
            │   ├── SHARED.md
            │   └── PROJECTS.md
            ├── swarms/           # Task group memory
            │   └── [TASK]/
            │       ├── CONTEXT.md
            │       ├── FINDINGS.md
            │       └── PROGRESS.md
            └── agents/
                └── [AGENT]/
                    ├── identity.md   # Who I am
                    ├── soul.md       # How I think
                    ├── memory.md     # My knowledge
                    ├── tools.md      # My tools
                    └── sessions/     # Ephemeral
```

---

## Memory Types

| Type | Location | Scope | Example |
|------|----------|-------|---------|
| **Global** | `memory/USER.md` | All agents | Shaan's preferences |
| **Workspace** | `[WS]/workspace/` | All agents in workspace | Team docs |
| **Agent Identity** | `[AGENT]/identity.md` | Single agent | Role, name |
| **Agent Soul** | `[AGENT]/soul.md` | Single agent | Values, thinking |
| **Agent Memory** | `[AGENT]/memory.md` | Single agent | Knowledge base |
| **Swarm** | `swarms/[TASK]/` | Task group | Shared findings |
| **Session** | `sessions/*.jsonl` | Conversation | Chat history |

---

## Loading Priority

When agent starts:

| Priority | Load | Source |
|----------|------|--------|
| P0 | Always | `memory/USER.md` |
| P1 | Workspace | `[WS]/workspace/TEAM.md` |
| P2 | Agent | `identity.md` + `soul.md` |
| P3 | Workspace | `workspace/SHARED.md` |
| P4 | Agent | `memory.md` |
| P5 | Task | Active swarm context |

---

## File Purposes

### identity.md
- Agent name and ID
- Role and project
- Team membership
- Created date

### soul.md
- How the agent thinks
- Core values
- Communication style
- Boundaries

### memory.md
- Long-term knowledge
- Decisions and rationale
- Research findings
- Lessons learned

### tools.md
- Tool configurations
- Skill preferences
- Custom tool notes

---

## Swarm Protocol

**When to create:**
- Multiple agents working on shared task
- Research spanning multiple areas
- Collaborative project

**Swarm folder:**
```
swarms/[TASK-NAME]/
├── CONTEXT.md      # What the task is
├── FINDINGS.md     # What we've discovered
├── PROGRESS.md    # What's done
└── NEXT.md        # What next
```

**Rules:**
- Append-only for findings
- Daily sync
- Archive on completion → workspace memory

---

## Current Status

- [x] Architecture defined
- [x] Templates created
- [x] Legacy identity/soul/memory created
- [ ] Workspace memory populated
- [ ] Swarm protocol documented
- [ ] Other agents configured

---

## Notes

- Use lowercase filenames (identity.md not IDENTITY.md)
- Keep USER.md in memory/ folder (global)
- Each agent folder named after agent (legacy, not main)
- Session files stay in agent's sessions/ folder

---

*Updated: 2026-02-17*
