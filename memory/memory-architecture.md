# Agent Memory Architecture Specification

**Version:** 1.0
**Created:** 2026-02-17
**Author:** Legacy (based on research and SISO's design)

---

## Overview

This document defines the memory architecture for all agents in the SISO ecosystem. It establishes a hierarchical, multi-tier memory system that supports both individual agent autonomy and collaborative knowledge sharing.

---

## Core Principles

1. **Shared where logical, private where needed** — USER.md is global, identity is agent-specific
2. **Tiered by lifespan** — Session → Swarm → Agent → Workspace → Global
3. **Discoverable** — All memories are searchable and traceable
4. **Template-driven** — New agents get a consistent starting point

---

## Memory Types

### 1. USER.md (Global)
- **Scope:** All agents
- **Location:** `COMMAND-CENTER/USER.md`
- **Purpose:** Who the human is, preferences, context
- **Example:** Shaan's communication style, projects, timezone

### 2. Workspace Memory
- **Scope:** All agents in a workspace
- **Location:** `WORKSPACES/[WORKSPACE]/workspace/`
- **Contents:**
  - `README.md` — Workspace overview
  - `ARCHITECTURE.md` — How the workspace works
  - `TEAM.md` — All agents in the workspace
  - `SHARED.md` — Shared knowledge across agents
  - `PROJECTS.md` — Active projects

### 3. Agent Identity (Private)
- **Scope:** Single agent
- **Location:** `[AGENT]/`
- **Files:**
  - `IDENTITY.md` — Name, role, project, team
  - `SOUL.md` — How I think, values, boundaries

### 4. Agent Memory (Private)
- **Scope:** Single agent
- **Location:** `[AGENT]/`
- **Files:**
  - `MEMORY.md` — Long-term knowledge base
  - `TOOLS.md` — Tool configurations

### 5. Swarm Memory (Task Group)
- **Scope:** Agents working on a shared task
- **Location:** `WORKSPACES/[WORKSPACE]/swarms/[TASK-NAME]/`
- **Contents:**
  - `CONTEXT.md` — Task overview
  - `FINDINGS.md` — Collective discoveries
  - `PROGRESS.md` — What's been done
  - `NEXT.md` — Next steps

### 6. Session Memory (Ephemeral)
- **Scope:** Single conversation
- **Location:** `[AGENT]/sessions/`
- **Format:** JSONL files
- **Purpose:** Current interaction history

---

## File Structure

```
COMMAND-CENTER/
├── USER.md                          # Global user context
└── WORKSPACES/
    ├── PLAYGROUND/
    │   ├── workspace/
    │   │   ├── README.md
    │   │   ├── ARCHITECTURE.md
    │   │   ├── TEAM.md
    │   │   ├── SHARED.md
    │   │   └── PROJECTS.md
    │   └── agents/
    │       ├── main/
    │       │   ├── IDENTITY.md
    │       │   ├── SOUL.md
    │       │   ├── MEMORY.md
    │       │   ├── TOOLS.md
    │       │   └── sessions/
    │       └── strategy-lead/
    │           ├── IDENTITY.md
    │           ├── SOUL.md
    │           └── ...
    ├── Agent OS/
    │   ├── workspace/
    │   │   └── ...
    │   ├── swarms/
    │   │   └── github-research-2026/
    │   │       ├── CONTEXT.md
    │   │       ├── FINDINGS.md
    │   │       └── PROGRESS.md
    │   └── agents/
    │       ├── power-gen/
    │       ├── os-builder/
    │       └── os-researcher/
    └── [OTHER WORKSPACES]/
```

---

## Memory Loading Priority

When an agent starts or receives a heartbeat:

| Priority | File | Purpose |
|----------|------|---------|
| P0 | `USER.md` | Always know who you're helping |
| P1 | `workspace/TEAM.md` | Know your team |
| P2 | `IDENTITY.md` + `SOUL.md` | Know yourself |
| P3 | `workspace/SHARED.md` | Workspace context |
| P4 | `MEMORY.md` | Your knowledge |
| P5 | Active swarm context | Current task |

---

## Swarm Protocol

### Creating a Swarm
1. Define task scope
2. Create `WORKSPACES/[WS]/swarms/[TASK-NAME]/`
3. Add `CONTEXT.md` with task definition
4. Assign agents to swarm

### Swarm Memory Rules
- **Append-only** for findings
- **Daily sync** — agents update progress
- **Archive on complete** — move to workspace memory

---

## Agent Template

When creating a new agent, use:

```
[AGENT]/
├── IDENTITY.md      # Template: see /templates/agent/IDENTITY.md
├── SOUL.md         # Template: see /templates/agent/SOUL.md
├── MEMORY.md       # Template: see /templates/agent/MEMORY.md
├── TOOLS.md        # Template: see /templates/agent/TOOLS.md
└── sessions/      # Created automatically
```

---

## Implementation Status

- [x] Architecture defined
- [ ] Global USER.md created
- [ ] Workspace folders structured
- [ ] Legacy agent configured
- [ ] Templates created
- [ ] Swarm protocol defined

---

*This is a living document. Update as we learn.*
