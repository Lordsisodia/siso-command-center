# MEMORY.md — OS Builder

_Long-term knowledge and insights_

---

## Current Projects

- **Task Setter Agent** — Dedicated agent for creating tasks in TASKS.md and triggering Antfarm
- **CISO Command Center** — Rebranding OpenClaw Studio to gray/orange theme (TASK-004, queued)
- **Multiple OS Builder Instances** — 4 concurrent agents sharing same workspace
- **Antfarm Pipelines** — Configured all 3 workflows with Kimi 2.5

---

## Architecture Decisions

- **Separate component library**: Created `studio-ui/` folder for custom components
- **Task queue system**: TASKS.md with tagging for Antfarm to process
- **Default to feature-dev**: 7-agent pipeline for most tasks
- **Shared workspace**: All 4 OS Builder instances point to same files

---

## Systems Built

1. **Task Setter Agent** (`agents/task-setter/`)
   - Turns ideas into actionable TASKS.md entries
   - Clarifies scope, drafts tasks, suggests priority/workflow
   - Can trigger Antfarm workflows

2. **Antfarm Configuration**
   - Updated all workflows to use Kimi 2.5 (kimi-coding/k2p5)
   - 21 total agents across feature-dev, bug-fix, security-audit

3. **Multiple OS Builder Instances**
   - os-builder, os-builder-2, os-builder-3, os-builder-4
   - All share `/agents/os-builder/` workspace
   - Enables 4 concurrent sessions

4. **ProjectsView UI** (`studio-ui/src/projects/`)
   - React components for grouping agents by workspace
   - 6 projects: Agent OS, Agency, Research, Internal, Ecom SaaS, Playground

---

## Key Locations

| System | Path |
|--------|------|
| OpenClaw Studio | `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/openclaw-studio/` |
| OS Builder Agent | `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/agents/os-builder/` |
| Task Setter Agent | `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/agents/task-setter/` |
| TASKS.md | `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/studio-ui/TASKS.md` |
| Gateway Config | `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/state/openclaw.json` |
| Antfarm | `~/.openclaw/workspace/antfarm/` |

---

## URLs & Ports

- Production Studio: https://shaans-mac-mini.tail100d11.ts.net (port 3000)
- Dev Studio: https://shaans-mac-mini.tail100d11.ts.net:3443 (port 3001)
- Antfarm Dashboard: https://shaans-mac-mini.tail100d11.ts.net:3333
- Gateway API: http://100.66.34.21:18789

---

## Bugs Fixed

- **ProjectsSidebar.tsx**: Duplicate `selectedProjectId` variable — fixed by using prop callbacks instead of local state

---

## Known Issues

- Gateway LaunchAgent not loading (service shows as "not loaded")
- Model errors: "model not allowed: zai/glm-4.7-flash" in logs
- Antfarm branches not creating in expected location
- Dev server lock conflicts — fix with `rm -f .next/dev/lock`

---

## Lessons Learned

- Gateway uses different config than CLI (`state/openclaw.json`)
- Check `lsof -i :PORT` for port conflicts
- Gateway binds to tailnet IP, not localhost
- Logs in `/tmp/openclaw/openclaw-*.log` — look for "tool start/end"
- Agents ARE working (tools complete in 20-80ms)

---

*OS Builder remembers*
