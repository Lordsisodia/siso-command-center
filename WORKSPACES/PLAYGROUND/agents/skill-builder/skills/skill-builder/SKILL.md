---
name: skill-builder
description: Create, update, and package Openclaw skills. Use when building new skills, fixing existing ones, or preparing skills for distribution. Covers SKILL.md format, YAML frontmatter, gating, scripts, references, and ClawHub publishing.
metadata:
  {
    "openclaw": {
      "emoji": "🛠️",
      "user-invocable": true
    }
  }
---

# Openclaw Skill Builder

Create modular skills that extend Openclaw's capabilities.

## What Is a Skill?

A skill is a folder containing a `SKILL.md` file with YAML frontmatter + Markdown instructions. Optional: `scripts/`, `references/`, `assets/`.

```
my-skill/
├── SKILL.md           # Required
├── scripts/           # Optional: executable scripts
├── references/       # Optional: docs loaded as needed
└── assets/           # Optional: templates, images
```

---

## SKILL.md Format

### Required Frontmatter

```yaml
---
name: skill-name
description: What the skill does and when to use it. Be specific!
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
      "os": ["darwin", "linux"],
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

| Field | Description |
|-------|-------------|
| `name` | Unique identifier (kebab-case) |
| `description` | What it does + when to use (critical for triggering!) |
| `homepage` | URL for "Website" in Skills UI |
| `user-invocable` | Expose as slash command (default: true) |
| `disable-model-invocation` | Exclude from model prompt |
| `metadata.openclaw` | See below |

### metadata.openclaw Fields

| Field | Type | Description |
|-------|------|-------------|
| `emoji` | string | Icon for UI |
| `os` | string[] | Platforms (darwin/linux/win32) |
| `always` | boolean | Always include |
| `requires.bins` | string[] | Required CLI tools |
| `requires.anyBins` | string[] | At least one must exist |
| `requires.env` | string[] | Required env vars |
| `requires.config` | string[] | Required config paths |
| `primaryEnv` | string | Env var for apiKey |
| `install` | array | Auto-install specs |

---

## Gating (Load-Time Filters)

Skills load only when requirements are met:

```yaml
metadata:
  {
    "openclaw": {
      "requires": {
        "bins": ["ffmpeg"],
        "env": ["API_KEY"],
        "config": ["browser.enabled"]
      },
      "os": ["darwin", "linux"]
    }
  }
```

### Installer Spec

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
          "label": "Install GitHub CLI"
        }
      ]
    }
  }
```

Kinds: `brew`, `node`, `go`, `apt`, `download`

---

## Progressive Disclosure

Keep SKILL.md lean. Three levels:

1. **Metadata** — name + description (always in context)
2. **Body** — instructions (loaded on trigger)
3. **References** — detailed docs (loaded as needed)

### Splitting Content

For long skills:

```
pdf-editor/
├── SKILL.md (overview + links)
└── references/
    ├── forms.md
    ├── api.md
    └── examples.md
```

---

## Writing SKILL.md Body

### Use Imperative Form

✅ Do: "Use curl to fetch weather"
❌ Don't: "You should use curl to fetch weather"

### Checklist Style Works Well

```markdown
When the user asks for log triage:
- Ask for service name and time window if missing.
- Fetch logs (journalctl or docker logs).
- Group repeated errors.
- Show the exact command used.
```

### Use {baseDir} for Scripts

```bash
{baseDir}/scripts/frame.sh /path/to/video.mp4 --out /tmp/frame.jpg
```

### Include Examples

```markdown
**Example**: "What's the weather in Tokyo?"

Fetch via API, display temperature, conditions, and forecast.
```

---

## Creating a Skill

### Step 1: Create Directory

```bash
mkdir -p ~/.openclaw/workspace/skills/my-skill
# or in workspace:
mkdir -p <workspace>/skills/my-skill
```

### Step 2: Create SKILL.md

```yaml
---
name: my-skill
description: A description of what this skill does.
metadata: { "openclaw": { "emoji": "✨" } }
---

# My Skill

Instructions for the agent...
```

### Step 3: Add Optional Resources

```bash
mkdir -p my-skill/scripts
mkdir -p my-skill/references
mkdir -p my-skill/assets
```

### Step 4: Test

Ask Openclaw to "refresh skills" or restart gateway.

---

## Skills Locations & Precedence

1. **Workspace skills**: `<workspace>/skills` (highest)
2. **Managed/local**: `~/.openclaw/skills`
3. **Bundled skills**: shipped with Openclaw

---

## Configuration

In `~/.openclaw/openclaw.json`:

```json5
{
  skills: {
    entries: {
      "my-skill": {
        enabled: true,
        env: {
          MY_VAR: "value"
        }
      }
    }
  }
}
```

---

## Debugging Skills

```bash
# List all skills
openclaw skills list

# List eligible skills
openclaw skills list --eligible

# Get skill details
openclaw skills info <name>
```

Enable debug logging:

```json5
{
  logging: {
    level: "debug"
  }
}
```

Then: `openclaw logs --follow`

---

## Best Practices

1. **Be concise** — model is smart, only add what it needs
2. **Description is critical** — put triggering info there
3. **Keep body under 500 lines** — use references for more
4. **Test locally first** — before publishing
5. **Audit third-party skills** — security risk!
6. **Use scripts for repeated tasks** — token efficient

---

## Publishing

1. Create skill following format above
2. Test in your workspace
3. Publish to ClawHub (see `clawhub` CLI)

---

## Quick Reference

| Aspect | Key Point |
|--------|-----------|
| Required file | `SKILL.md` |
| Frontmatter | `name`, `description` required |
| Body | Agent instructions |
| Scripts | Use `{baseDir}/scripts/` |
| Locations | workspace > managed > bundled |
| Gating | `requires.bins`, `requires.env`, `os` |
