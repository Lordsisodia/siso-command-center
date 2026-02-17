# Memory System Setup Checklist

**Goal:** Fully integrated memory system across all agents
**Status:** In Progress

---

## Phase 1: Structure & Templates ✅

- [x] Folder structure defined
  - [x] `memory/` folder in COMMAND-CENTER
  - [x] Agent folders named (legacy, not main)

- [x] Templates created
  - [x] `memory/templates/agent/identity.md`
  - [x] `memory/templates/agent/soul.md`
  - [x] `memory/templates/agent/memory.md`
  - [x] `memory/templates/agent/tools.md`
  - [x] `memory/templates/agent/README.md` (setup guide)

---

## Phase 2: Global Memory ✅

- [x] USER.md
  - [x] Created at `memory/USER.md`
  - [x] Symlinked to ALL agent workspaces

- [x] Architecture documentation
  - [x] `memory/architecture.md`

---

## Phase 3: Workspace Memory ✅

- [x] Each workspace has Workspace.md
  - [x] PLAYGROUND/workspace/Workspace.md
  - [x] Agent OS/workspace/Workspace.md
  - [x] RESEARCH/workspace/Workspace.md
  - [x] INTERNAL/workspace/Workspace.md
  - [x] AGENCY/workspace/Workspace.md
  - [x] ECOMSAAS/workspace/Workspace.md

---

## Phase 4: Legacy Agent ✅

- [x] legacy/identity.md - created
- [x] legacy/soul.md - created
- [x] legacy/memory.md - created
- [x] legacy/tools.md - exists
- [x] legacy/USER.md - symlinked ✅

---

## Phase 5: All PM Agents ✅

- [x] USER.md symlinked for all agents:
  - [x] legacy (PLAYGROUND)
  - [x] strategy-lead (PLAYGROUND)
  - [x] power-gen (Agent OS)
  - [x] os-builder (Agent OS)
  - [x] os-researcher (Agent OS)
  - [x] research-pm (RESEARCH)
  - [x] siso-internal-pm (INTERNAL)
  - [x] siso-agency-pm (AGENCY)
  - [x] ecom-saas-pm (ECOMSAAS)

---

## Phase 6: OpenClaw Integration (TODO)

- [ ] Test that memory loads correctly
- [ ] Verify USER.md is read by agent
- [ ] Test symlinks resolve properly

---

## Phase 7: Swarm Protocol (TODO)

- [ ] Define when to create swarms
- [ ] Create folder structure
- [ ] Document protocol

---

## Current Structure

```
COMMAND-CENTER/
└── memory/
    ├── USER.md                 ✅ GLOBAL (symlinked everywhere)
    ├── architecture.md
    ├── SETUP-CHECKLIST.md
    └── templates/agent/
        ├── identity.md
        ├── soul.md
        ├── memory.md
        ├── tools.md
        └── README.md           ← How to create new agents

WORKSPACES/
└── [WORKSPACE]/
    ├── workspace/
    │   └── Workspace.md       ✅ Workspace info
    └── agents/
        └── [AGENT]/
            ├── identity.md
            ├── soul.md
            ├── memory.md
            ├── tools.md
            └── USER.md        → symlink → ../../../memory/USER.md
```

---

*Updated: 2026-02-17*
