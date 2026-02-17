# OpenClaw UI Analysis Agent

> Use this prompt to analyze OpenClaw's UI code and identify elements to integrate into SISO Command Center.

---

## Your Mission

You are an AI agent tasked with exploring the OpenClaw UI codebase to identify:
1. Useful UI components we can steal
2. Patterns and patterns we can adapt
3. Architecture decisions we can learn from

---

## Context

We have two codebases:

| Repo | Location | Purpose |
|------|----------|---------|
| OpenClaw (original) | `/Users/shaansisodia/blackbox5/openclaw/` | Source of UI to analyze |
| SISO Command Center | `/Users/shaansisodia/blackbox5/openclaw-studio/` | Our custom fork |

---

## Where to Look

### 1. OpenClaw UI (`/openclaw/ui/src/`)

This is the **original OpenClaw UI** built with vanilla TypeScript (not React).

```
openclaw/ui/src/
├── ui/
│   ├── views/           # Page views (agents, chat, config, etc.)
│   ├── components/       # Reusable components
│   ├── controllers/      # Business logic
│   ├── app.ts          # Main app entry
│   ├── app-gateway.ts  # Gateway connection
│   ├── presenter.ts    # UI presentation logic
│   └── theme.ts        # Theming
├── main.ts             # Entry point
└── styles.css         # Global styles
```

### 2. Key Files to Explore

**Views** (what pages exist):
- `ui/views/agents.ts` - Agent management
- `ui/views/chat.ts` - Chat interface
- `ui/views/config.ts` - Configuration
- `ui/views/sessions.ts` - Sessions
- `ui/views/cron.ts` - Cron jobs
- `ui/views/usage.ts` - Usage analytics
- `ui/views/channels.ts` - Channel management

**Components** (reusable UI):
- `ui/components/` - Look for interesting components

**Controllers** (logic):
- `ui/controllers/agents.ts` - Agent operations
- `ui/controllers/chat.ts` - Chat logic

---

## What to Look For

### UI Patterns to Steal

1. **Dashboard widgets** - Usage graphs, stats displays
2. **Agent cards** - How agents are displayed
3. **Chat components** - Message bubbles, input fields
4. **Forms** - Configuration forms, settings
5. **Navigation** - Sidebars, tabs, menus

### Architecture Patterns

1. **State management** - How does it handle state?
2. **Event handling** - How does it communicate with Gateway?
3. **Component structure** - How are components organized?
4. **Styling** - CSS approach, theming

---

## Your Task

### Step 1: Explore the UI Structure

Run these commands to understand the structure:

```bash
# List all TypeScript files in UI
find /Users/shaansisodia/blackbox5/openclaw/ui/src -name "*.ts" -o -name "*.tsx" | head -50

# Look at views
ls -la /Users/shaansisodia/blackbox5/openclaw/ui/src/ui/views/

# Look at components
ls -la /Users/shaansisodia/blackbox5/openclaw/ui/src/ui/components/
```

### Step 2: Read Key Files

Pick 3-5 interesting files and read them:

```bash
# Example: Read the main app
cat /Users/shaansisodia/blackbox5/openclaw/ui/src/ui/app.ts

# Example: Read agents view
cat /Users/shaansisodia/blackbox5/openclaw/ui/src/ui/views/agents.ts
```

### Step 3: Identify Elements to Steal

For each element you find, note:

```
## Element: [Name]

**File**: [path/to/file.ts]
**What it does**: [1-2 sentences]
**How it works**: [brief technical description]
**Steal potential**: [high/medium/low]
**How to adapt**: [how we'd use it in React]
```

### Step 4: Create a Report

After exploring, create a report with:

```markdown
# OpenClaw UI Analysis Report

## Elements to Steal

### 1. [Element Name]
- **File**: ...
- **Steal potential**: HIGH
- **Adaptation**: ...

## Patterns to Learn

### 1. [Pattern Name]
- **Where**: ...
- **What we can learn**: ...

## Recommended Integration

Based on our SISO Command Center needs:
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]
```

---

## Important Notes

- The OpenClaw UI uses vanilla TypeScript (not React) - you'll need to adapt to React
- Look for visual components, not just logic
- Focus on dashboard-like elements since that's our main enhancement area
- Note any CSS or styling approaches

---

## Deliverable

Create a file at `docs/OPENCLAW_UI_ANALYSIS.md` in the SISO Command Center repo with your findings.

---

*Use with Claude Code or any AI agent*
