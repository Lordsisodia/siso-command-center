# OS Agent Project — Complete Documentation

_Last updated: 2026-02-17_

---

## 🎯 Project Overview

**Goal:** Build an autonomous agent operating system with multiple specialized agents that can work concurrently on different tasks, sharing memory and knowledge.

**Current Status:** 
- Core infrastructure working
- Task queue system in place
- Multiple agent instances configured
- Dev environment functional

---

## ✅ Improvements & Features Built

### 1. Task Setter Agent

**Purpose:** Dedicated agent for turning ideas into actionable tasks that Antfarm can execute.

**Location:** `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/agents/task-setter/`

**Files:**
- `AGENTS.md` — Main instructions
- `SOUL.md` — Personality
- `USER.md` — Context about SISO
- `TOOLS.md` — File paths & commands
- `README.md` — Usage guide

**How it works:**
1. User describes an idea
2. Task Setter asks 2-3 clarifying questions
3. Drafts a TASKS.md entry with proper format
4. Adds to queue when approved
5. Can trigger Antfarm immediately

---

### 2. Antfarm Configuration (Kimi 2.5)

**What:** Updated all Antfarm workflows to use Kimi 2.5 model instead of defaults.

**Workflows Updated:**

| Workflow | Agents | Model |
|----------|--------|-------|
| feature-dev | 6 | kimi-coding/k2p5 |
| bug-fix | 6 | kimi-coding/k2p5 |
| security-audit | 7 | kimi-coding/k2p5 |

**Total:** 21 agents now using Kimi 2.5

**Files Modified:**
- `~/.openclaw/workspace/antfarm/workflows/feature-dev/workflow.yml`
- `~/.openclaw/workspace/antfarm/workflows/bug-fix/workflow.yml`
- `~/.openclaw/workspace/antfarm/workflows/security-audit/workflow.yml`

---

### 3. Multiple OS Builder Instances

**What:** Configured 4 instances of OS Builder pointing to the same workspace (for concurrent sessions).

**Agent IDs:**
- `os-builder` — Main instance
- `os-builder-2` — Instance 2
- `os-builder-3` — Instance 3
- `os-builder-4` — Instance 4

**Config Location:** `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/state/openclaw.json`

**All point to:** `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/agents/os-builder`

**Benefit:** Can run 4 concurrent sessions, all sharing the same MEMORY.md and files.

---

### 4. CISO Command Center Rebrand (TASK-004)

**What:** Task created to rebrand OpenClaw Studio to CISO Command Center with Notion-style gray theme.

**Task Location:** `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/studio-ui/TASKS.md`

**Requirements:**
- Rename "OpenClaw Studio" → "CISO Command Center"
- Change color palette: blue-tinted dark → Notion gray (#1a1a1a, #242424, #2f2f2f)
- Add orange accents (#f97316)
- Keep white text
- Update CSS variables

**Status:** Queued in Antfarm

---

### 5. Bug Fix: ProjectsSidebar.tsx

**Problem:** Duplicate `selectedProjectId` variable - declared as both prop and useState.

**Location:** `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/openclaw-studio/src/features/projects/components/ProjectsSidebar.tsx`

**Fix Applied:**
- Replaced duplicate state with `expandedProjects` useState
- Changed `setSelectedProjectId()` calls to use prop callbacks

---

### 6. Dev Environment Setup

**Ports:**
| Port | Service | URL |
|------|---------|-----|
| 3000 | Production Studio | https://shaans-mac-mini.tail100d11.ts.net |
| 3001 | Dev Studio | https://shaans-mac-mini.tail100d11.ts.net:3443 |
| 3333 | Antfarm Dashboard | https://shaans-mac-mini.tail100d11.ts.net:3333 |
| 18789 | Gateway | http://100.66.34.21:18789 |

**Starting Dev Server:**
```bash
cd /Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/openclaw-studio
rm -f .next/dev/lock
PORT=3001 node server/index.js --dev
```

---

## 🗂️ Key File Locations

| System | Path |
|--------|------|
| OpenClaw Studio | `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/openclaw-studio/` |
| OS Builder Agent | `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/agents/os-builder/` |
| Task Setter Agent | `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/agents/task-setter/` |
| TASKS.md | `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/studio-ui/TASKS.md` |
| Antfarm | `~/.openclaw/workspace/antfarm/` |
| Gateway Config | `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/state/openclaw.json` |

---

## 🔧 Commands Reference

**Start Antfarm workflow:**
```bash
cd /Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/studio-ui
./antfarm-start.sh TASK-004
```

**Check Antfarm status:**
```bash
antfarm workflow runs
antfarm logs
```

**Restart Gateway:**
```bash
openclaw gateway restart
```

**Check Gateway status:**
```bash
openclaw gateway status
```

**View logs:**
```bash
tail -f /tmp/openclaw/openclaw-2026-02-17.log
```

---

## 📝 Architecture Decisions

1. **Separate component library over direct modification** — Created `studio-ui/` folder for custom components instead of modifying OpenClaw Studio directly

2. **Task queue system** — TASKS.md with tagging ([feature], [bug], [security], [refactor]) for Antfarm to process

3. **Default to feature-dev workflow** — For most tasks including UI work, using the 7-agent feature development pipeline

4. **Shared workspace for multiple instances** — All 4 OS Builder instances point to the same workspace for shared memory

---

## ⚠️ Known Issues

1. **Gateway LaunchAgent not loading** — Service shows as "not loaded" in status. May cause intermittent connectivity.

2. **Dev server lock conflicts** — Sometimes `.next/dev/lock` causes issues. Fix: `rm -f .next/dev/lock`

3. **Model errors in logs** — Some requests failing with "model not allowed: zai/glm-4.7-flash" — likely misconfigured fallbacks

4. **Antfarm not creating branches** — Workflow started but branches not being created in expected location

---

## 💡 Lessons Learned

1. **Multiple config files** — Gateway uses different config than CLI (`state/openclaw.json` vs `.openclaw/openclaw.json`)

2. **Port conflicts** — Multiple services compete for ports. Check with `lsof -i :PORT`

3. **Tailscale vs localhost** — Gateway binds to tailnet IP, not localhost. Use `100.66.34.21:18789` for API calls

4. **Logs are detailed** — Check `/tmp/openclaw/openclaw-*.log` for debugging. Look for "tool start/end" to confirm agents are working

5. **Agents ARE running** — Tools complete in 20-80ms. Backend works, issue is likely in WebSocket/UI layer

---

## 🔄 Next Steps

1. **Fix Gateway service** — Install properly to avoid connectivity issues
2. **Complete TASK-004** — CISO Command Center rebrand
3. **Test multiple OS Builder instances** — Verify concurrent sessions work
4. **Debug model fallbacks** — Fix "model not allowed" errors
5. **Add more agents** — Create specialized agents (researcher, tester, etc.)

---

## 📊 Quick Stats

- **Total agents configured:** 33
- **OS Builder instances:** 4
- **Antfarm workflows:** 3
- **Tasks in queue:** 4
- **Active projects:** 6 (Agent OS, Agency, Research, Internal, Ecom SaaS, Playground)

---

*Documentation maintained by OS Builder agent*
