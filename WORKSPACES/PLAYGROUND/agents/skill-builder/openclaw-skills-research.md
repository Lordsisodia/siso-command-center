# Openclaw Skills - Complete Research Guide

> **TL;DR:** Openclaw skills are folders containing a `SKILL.md` file with YAML frontmatter + Markdown instructions. They teach the agent how to use tools, APIs, and workflows. Skills can include optional scripts, references, and assets.

---

## What Are Skills?

Skills are **modular, self-contained packages** that extend Openclaw's capabilities. Think of them as "onboarding guides" for specific domains or tasks — they transform a general-purpose agent into a specialized assistant with procedural knowledge.

### What Skills Provide:
1. **Specialized workflows** - Multi-step procedures for specific domains
2. **Tool integrations** - Instructions for working with specific CLIs, APIs, or file formats
3. **Domain expertise** - Company-specific knowledge, schemas, business logic
4. **Bundled resources** - Scripts, references, and assets for complex/repetitive tasks

---

## Core File Structure

```
skill-name/
├── SKILL.md              # Required: skill definition + instructions
├── scripts/              # Optional: executable scripts (bash/python/etc)
├── references/          # Optional: documentation loaded as needed
└── assets/             # Optional: files used in output (templates, etc)
```

### The Only Required File: SKILL.md

Every skill needs at minimum a `SKILL.md` with:
- **YAML frontmatter** - Metadata (name, description, requirements)
- **Markdown body** - Instructions for the agent

---

## SKILL.md Format

### Required Frontmatter Fields

```yaml
---
name: skill-name
description: What the skill does and when to use it.
---
```

### Full Frontmatter Example

```yaml
---
name: github
description: "Interact with GitHub using the `gh` CLI. Use `gh issue`, `gh pr`, `gh run`, and `gh api` for issues, PRs, CI runs, and advanced queries."
homepage: https://github.com
metadata:
  {
    "openclaw": {
      "emoji": "🐙",
      "requires": { "bins": ["gh"] },
      "install": [
        {
          "id": "brew",
          "kind": "brew",
          "formula": "gh",
          "bins": ["gh"],
          "label": "Install GitHub CLI (brew)"
        }
      ]
    }
  }
---
```

### All Frontmatter Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Unique skill identifier (kebab-case recommended) |
| `description` | string | What the skill does + when to use it (critical for triggering) |
| `homepage` | string | URL for "Website" in macOS Skills UI |
| `user-invocable` | boolean | If `true`, exposed as slash command (default: `true`) |
| `disable-model-invocation` | boolean | If `true`, excluded from model prompt |
| `command-dispatch` | string | Set to `"tool"` for direct tool dispatch |
| `command-tool` | string | Tool name when `command-dispatch: tool` |
| `command-arg-mode` | string | `"raw"` (default) for tool dispatch args |

### Metadata Fields (`metadata.openclaw`)

| Field | Type | Description |
|-------|------|-------------|
| `emoji` | string | Icon for macOS Skills UI |
| `os` | string[] | List of platforms (`darwin`, `linux`, `win32`) |
| `always` | boolean | Always include the skill (skip other gates) |
| `requires.bins` | string[] | CLI tools that must exist on PATH |
| `requires.anyBins` | string[] | At least one must exist on PATH |
| `requires.env` | string[] | Env vars that must exist or be in config |
| `requires.config` | string[] | Config paths that must be truthy |
| `primaryEnv` | string | Env var for `skills.entries.<name>.apiKey` |
| `install` | array | Installer specs (brew, node, go, download) |

---

## Skills Locations & Precedence

Skills are loaded from **three** places (highest to lowest precedence):

1. **Workspace skills**: `<workspace>/skills`
2. **Managed/local skills**: `~/.openclaw/skills`
3. **Bundled skills**: shipped with Openclaw install

If a skill name conflicts, higher precedence wins.

### Adding Extra Skill Folders

```json5
{
  skills: {
    load: {
      extraDirs: ["~/Projects/my-skills"]
    }
  }
}
```

---

## Gating & Environment Requirements

Openclaw **filters skills at load time** based on:

### Binary Requirements
```yaml
metadata:
  {
    "openclaw": {
      "requires": { "bins": ["ffmpeg", "curl"] }
    }
  }
```
Skill only loads if ALL binaries exist on PATH.

### Environment Variables
```yaml
metadata:
  {
    "openclaw": {
      "requires": { "env": ["GITHUB_TOKEN", "OPENAI_API_KEY"] }
    }
  }
```

### OS Filtering
```yaml
metadata:
  {
    "openclaw": {
      "os": ["darwin", "linux"]
    }
  }
```

### Auto-Install Support
```yaml
metadata:
  {
    "openclaw": {
      "requires": { "bins": ["gh"] },
      "install": [
        {
          "id": "brew",
          "kind": "brew",
          "formula": "gh",
          "bins": ["gh"],
          "label": "Install GitHub CLI (brew)"
        }
      ]
    }
  }
```

Installer kinds: `brew`, `node`, `go`, `apt`, `download`

---

## Progressive Disclosure Design

Skills use a **three-level loading system** to manage context efficiently:

1. **Metadata (name + description)** — Always in context (~100 chars)
2. **SKILL.md body** — When skill triggers (<5k words)  
3. **Bundled resources** — As needed (scripts execute without loading into context)

### Best Practices

- **Be concise** — Default assumption: the model is already smart. Only add context it doesn't have.
- **Put triggering info in description** — The body loads AFTER triggering, so "when to use" goes in frontmatter.
- **Keep SKILL.md under 500 lines** — Split into references/ when needed.
- **Use references for detailed docs** — Keep SKILL.md lean; load detailed docs only when needed.

### Example: Organizing Long Content

```
pdf-editor/
├── SKILL.md (overview + navigation)
└── references/
    ├── forms.md      # Form filling details
    ├── api.md        # API reference
    └── examples.md   # Common patterns
```

---

## Writing Effective SKILL.md Body

### Use Imperative/Infinitive Form

❌ Don't: "You should use curl to fetch weather"
✅ Do: "Use curl to fetch weather"

### Checklist Style Works Well

```markdown
When the user asks for log triage:
- Ask for service name and time window if missing.
- Fetch logs (journalctl or docker logs).
- Group repeated errors.
- Show the exact command used.
- If logs are empty, say so and suggest next checks.
```

### Include Concrete Examples

```markdown
**Example**: "What's the weather in Tokyo?"

Fetch via API, display temperature, conditions, and forecast.
```

### Use {baseDir} for Script Paths

```bash
{baseDir}/scripts/frame.sh /path/to/video.mp4 --out /tmp/frame.jpg
```

---

## Example Skills (Real-World)

### Simplest: Weather Skill

```
---
name: weather
description: Get current weather and forecasts (no API key required).
metadata: { "openclaw": { "emoji": "🌤️", "requires": { "bins": ["curl"] } } }
---

# Weather

Two free services, no API keys needed.

## wttr.in (primary)

Quick one-liner:
curl -s "wttr.in/London?format=3"
```

### With Scripts: Video Frames

```
---
name: video-frames
description: Extract frames or short clips from videos using ffmpeg.
metadata: { "openclaw": { "requires": { "bins": ["ffmpeg"] } }
---

# Video Frames (ffmpeg)

First frame:
{baseDir}/scripts/frame.sh /path/to/video.mp4 --out /tmp/frame.jpg
```

### With Full Metadata: GitHub

```yaml
---
name: github
description: "Interact with GitHub using the `gh` CLI..."
metadata:
  {
    "openclaw": {
      "emoji": "🐙",
      "requires": { "bins": ["gh"] },
      "install": [
        { "id": "brew", "kind": "brew", "formula": "gh", "bins": ["gh"] },
        { "id": "apt", "kind": "apt", "package": "gh", "bins": ["gh"] }
      ]
    }
  }
---
```

---

## Configuration (`~/.openclaw/openclaw.json`)

```json5
{
  skills: {
    entries: {
      "skill-name": {
        enabled: true,
        apiKey: "API_KEY_HERE",
        env: {
          VAR_NAME: "value"
        },
        config: {
          customOption: "value"
        }
      }
    }
  }
}
```

### Per-Skill Settings

- `enabled: false` — Disable a skill
- `env` — Injected only if not already set
- `apiKey` — Convenience for `primaryEnv` skills
- `config` — Custom per-skill configuration

---

## Security Considerations

⚠️ **Important:**
- Treat third-party skills as **untrusted code**
- 26% of 31,000 agent skills across platforms contained vulnerabilities
- Over 230 malicious skills uploaded to ClawHub in early 2026
- Always audit skills before enabling

### Best Practices:
1. Read skill source before installing
2. Prefer sandboxed runs for untrusted skills
3. Keep secrets out of prompts/logs
4. Use `skills.entries.*.env` for secrets (injected into host process)

---

## Publishing to ClawHub

1. Create a skill following the format above
2. Test locally in your workspace
3. Publish to ClawHub (see `clawhub` CLI)

---

## Quick Reference: Creating a Skill

```bash
# 1. Create directory
mkdir -p ~/.openclaw/workspace/skills/my-skill

# 2. Create SKILL.md
cat > ~/.openclaw/workspace/skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: A description of what this skill does.
metadata: { "openclaw": { "emoji": "✨" } }
---

# My Skill

Instructions for the agent...
EOF

# 3. Refresh skills (or restart gateway)
```

---

## Token Impact

When skills are eligible, Openclaw injects a compact XML list:
- **Base overhead**: 195 characters (when ≥1 skill)
- **Per skill**: 97 characters + name/description/length

Rough estimate: **~24 tokens per skill** + actual content length.

---

## Summary

| Aspect | Key Points |
|--------|------------|
| **Required file** | `SKILL.md` with YAML frontmatter + Markdown |
| **Frontmatter** | `name`, `description` required; `metadata.openclaw` for gating |
| **Body** | Agent instructions; keep concise; use checklists |
| **Optional** | `scripts/`, `references/`, `assets/` |
| **Locations** | `<workspace>/skills` > `~/.openclaw/skills` > bundled |
| **Gating** | `requires.bins`, `requires.env`, `os` filter at load time |
| **Security** | Audit third-party skills; sandbox untrusted inputs |

---

## References

- [Openclaw Docs - Skills](https://docs.openclaw.ai/tools/skills)
- [Openclaw Docs - Creating Skills](https://docs.openclaw.ai/tools/creating-skills)
- [Openclaw Docs - Skills Config](https://docs.openclaw.ai/tools/skills-config)
- [ClawHub](https://clawhub.com) - Public skills registry
- [Openclaw CLI - Skills](https://docs.openclaw.ai/cli/skills)

---

# Advanced: Using Coding Agents (OpenCode/Codex/Claude Code)

Openclaw can orchestrate coding agents like **OpenCode**, **Codex**, **Claude Code**, and **Pi** via the `coding-agent` skill.

## The Skill

```yaml
---
name: coding-agent
description: Run Codex CLI, Claude Code, OpenCode, or Pi Coding Agent via background process for programmatic control.
metadata:
  {
    "openclaw": { "emoji": "🧩", "requires": { "anyBins": ["claude", "codex", "opencode", "pi"] } },
  }
---
```

## Critical: PTY Mode Required!

Coding agents are **interactive terminal apps** that need a pseudo-terminal (PTY). Without it, output breaks or the agent hangs.

**Always use `pty:true`:**

```bash
# ✅ Correct - with PTY
bash pty:true command:"codex exec 'Your prompt'"

# ❌ Wrong - no PTY, agent may break
bash command:"codex exec 'Your prompt'"
```

## Quick Start

```bash
# One-shot with Codex
bash pty:true workdir:~/project command:"codex exec --full-auto 'Build a dark mode toggle'"

# With OpenCode
bash pty:true workdir:~/project command:"opencode run 'Your task'"

# With Claude Code
bash pty:true workdir:~/project command:"claude 'Your task'"

# Background for longer tasks
bash pty:true workdir:~/project background:true command:"codex exec --full-auto 'Build a REST API'"
```

## Background Process Pattern

```bash
# Start agent
bash pty:true workdir:~/project background:true command:"codex 'Your exec --full-auto task'"
# Returns sessionId

# Monitor progress
process action:log sessionId:XXX
process action:poll sessionId:XXX

# Send input if needed
process action:submit sessionId:XXX data:"yes"

# Kill if needed
process action:kill sessionId:XXX
```

## Key Flags for Codex

| Flag | Effect |
|------|--------|
| `exec "prompt"` | One-shot execution |
| `--full-auto` | Sandboxed but auto-approves in workspace |
| `--yolo` | NO sandbox, NO approvals (fastest, most dangerous) |

## Important Rules

1. **Always use pty:true** - coding agents need a terminal!
2. **Git repo required** - Codex refuses to run outside a git directory
3. **Never start in ~/clawd/** - it'll read your soul docs!
4. **Keep user updated** - send messages on start, milestones, and completion

---

# Advanced: Seeing Which Skills Are Used

## CLI Commands

```bash
# List all skills (bundled + workspace + overrides)
openclaw skills list

# Filter to eligible skills (meeting requirements)
openclaw skills list --eligible

# Get details on a specific skill
openclaw skills info <skill-name>
```

## In the System Prompt

Skills are listed in the **system prompt** under a dedicated section. The agent sees:
- Eligible skills' names and descriptions
- Usage instructions from each skill's SKILL.md

The agent **selects which skill to use** based on reasoning about the task.

## Debug Logging

To see skill activity in logs:

```json5
{
  logging: {
    level: "debug"  // or "trace" for more detail
  }
}
```

Then tail logs:
```bash
openclaw logs --follow
```

## Skill Eligibility

Skills become **eligible** when:
- All `requires.bins` are on PATH
- All `requires.env` are set (or in config)
- All `requires.config` paths are truthy
- OS matches (if specified)

Only eligible skills appear in the system prompt.
- [Openclaw CLI - Skills](https://docs.openclaw.ai/cli/skills)
