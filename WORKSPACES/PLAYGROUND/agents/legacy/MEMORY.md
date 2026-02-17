# MEMORY.md — Legacy's Knowledge Base

**Last Updated:** 2026-02-17

---

## Today — System Recovery

**Problem:** Mac Mini server went down. Needed to reconnect OpenClaw to correct workspace.

**What Happened:**
1. Found all data on external drive (SISO-STORAGE-VAULT)
2. Discovered workspace structure in COMMAND-CENTER
3. Copied session data from `state/agents/` to `WORKSPACES/[WS]/agents/`
4. Found only os-researcher had full MD files — rest were lost
5. Identified 6 workspaces: PLAYGROUND, Agent OS, RESEARCH, INTERNAL, AGENCY, ECOMSAAS

**Sessions Recovered:**
- main: 129 sessions
- strategy-lead: 2 sessions
- Other PM agents: 1 session each

---

## Architecture Decision — Memory System

**Date:** 2026-02-17

**Decision:** Implement hierarchical memory system

**Structure:**
```
COMMAND-CENTER/
├── USER.md                    # Global (shared by all)
└── WORKSPACES/
    └── [WORKSPACE]/
        ├── workspace/        # Workspace memory (shared)
        │   ├── README.md
        │   ├── TEAM.md
        │   └── SHARED.md
        ├── swarms/         # Task group memory
        └── agents/
            └── [AGENT]/
                ├── IDENTITY.md   # Agent-specific
                ├── SOUL.md       # Agent-specific
                ├── MEMORY.md     # Agent-specific
                └── sessions/     # Ephemeral
```

**Rationale:**
- USER.md shared because human context is same for all
- Workspace memory shared because team knowledge should be accessible
- Agent identity/soul private because each agent is unique
- Swarm memory for temporary task collaboration

---

## Key Files Locations

| File | Path |
|------|------|
| Global USER.md | `COMMAND-CENTER/USER.md` |
| Memory Architecture Spec | `COMMAND-CENTER/memory-architecture.md` |
| Main Workspace | `WORKSPACES/PLAYGROUND/` |
| Agent OS Workspace | `WORKSPACES/Agent OS/` |
| State (sessions) | `COMMAND-CENTER/state/agents/` |

---

## OpenClaw Notes

- Config: `COMMAND-CENTER/state/openclaw.json`
- Session files: `state/agents/[AGENT]/sessions/`
- Skills: Located in OpenClaw install directory

---

*This memory grows with each session.*
