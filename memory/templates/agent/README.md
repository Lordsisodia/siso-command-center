# Agent Template

When creating a new agent, set up this structure:

## Folder Structure

```
agents/[AGENT-NAME]/
├── identity.md      ← from template
├── soul.md          ← from template
├── memory.md        ← from template
├── tools.md         ← from template
└── USER.md         → symlink to memory/USER.md
```

## Setup Commands

```bash
# Create folder
mkdir -p WORKSPACES/[WORKSPACE]/agents/[AGENT-NAME]

# Copy templates
cp memory/templates/agent/identity.md WORKSPACES/[WORKSPACE]/agents/[AGENT-NAME]/
cp memory/templates/agent/soul.md WORKSPACES/[WORKSPACE]/agents/[AGENT-NAME]/
cp memory/templates/agent/memory.md WORKSPACES/[WORKSPACE]/agents/[AGENT-NAME]/
cp memory/templates/agent/tools.md WORKSPACES/[WORKSPACE]/agents/[AGENT-NAME]/

# Create symlink to global USER.md
ln -sf "../../../../memory/USER.md" "WORKSPACES/[WORKSPACE]/agents/[AGENT-NAME]/USER.md"
```

## OpenClaw Config

Add to `state/openclaw.json`:

```json
{
  "id": "[AGENT-NAME]",
  "name": "[Agent Name]",
  "workspace": "/path/to/WORKSPACES/[WORKSPACE]/agents/[AGENT-NAME]"
}
```

---

*Template for new agents - copy this file when creating agents*
