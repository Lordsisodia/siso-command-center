# TOOLS.md — OS Builder

_Tool notes and preferences_

---

## Available Skills

- None configured directly (uses skill lookup when needed)

---

## Notes

### Key Commands

```bash
# Antfarm
cd /Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/studio-ui
./antfarm-start.sh TASK-004
antfarm workflow runs
antfarm logs

# Gateway
openclaw gateway restart
openclaw gateway status

# Dev Server
cd /Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/openclaw-studio
rm -f .next/dev/lock
PORT=3001 node server/index.js --dev

# Logs
tail -f /tmp/openclaw/openclaw-2026-02-17.log

# Ports
lsof -i -P | grep LISTEN
```

### URLs

- Production Studio: https://shaans-mac-mini.tail100d11.ts.net
- Dev Studio: https://shaans-mac-mini.tail100d11.ts.net:3443
- Antfarm Dashboard: https://shaans-mac-mini.tail100d11.ts.net:3333

### File Locations

- Gateway Config: `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/state/openclaw.json`
- OS Builder: `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/agents/os-builder/`
- TASKS.md: `/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/Agent OS/studio-ui/TASKS.md`

### Agent IDs

- os-builder (main)
- os-builder-2, os-builder-3, os-builder-4 (additional instances)
- task-setter

### Antfarm Workflows

- feature-dev (6 agents)
- bug-fix (6 agents)  
- security-audit (7 agents)

All using Kimi 2.5 (kimi-coding/k2p5)
