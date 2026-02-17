# SISO Command Center Analysis Agent

> Use this prompt to analyze SISO Command Center and identify what we've built.

---

## Your Mission

Analyze the current SISO Command Center codebase to understand:
1. What UI components we've created
2. What custom features we've added
3. What patterns we use
4. What's worth keeping vs improving

---

## Where to Look

### Directory Structure

```
src/
├── app/                    # Next.js pages
│   └── page.tsx           # Main entry
│
├── features/
│   ├── dashboard/         # Custom dashboard views (OUR CODE)
│   │   ├── ProjectDashboard.tsx
│   │   ├── CommandPalette.tsx
│   │   ├── MainDashboard.tsx
│   │   └── ...
│   │
│   ├── fleet/             # Agent management (FROM OPENCLAW)
│   │   ├── components/
│   │   ├── state/
│   │   └── operations/
│   │
│   └── orca/              # Orca visualization
│
├── ui/
│   ├── charts/           # Our chart components
│   ├── components/       # Shared UI components
│   └── patterns/         # Reusable patterns
│
├── hooks/                # Our custom hooks
│   ├── useAgents.ts
│   └── useModalState.ts
│
└── lib/
    └── gateway/           # OpenClaw Gateway connection
```

---

## Your Task

### Step 1: Explore the Features/Dashboard

This is **OUR CODE** - the custom stuff we added:

```bash
# List dashboard files
ls -la src/features/dashboard/

# Read ProjectDashboard - our main custom view
cat src/features/dashboard/ProjectDashboard.tsx

# Read CommandPalette - our keyboard shortcut
cat src/features/dashboard/CommandPalette.tsx
```

### Step 2: Explore the UI Components

These are **STEALABLE** - reusable components:

```bash
# List UI files
ls -la src/ui/
ls -la src/ui/charts/
ls -la src/ui/components/
ls -la src/ui/patterns/
```

### Step 3: Read Key Custom Files

Read these files to understand what we've built:

1. **ProjectDashboard.tsx** - Main dashboard with stats, gauges, kanban
2. **CommandPalette.tsx** - ⌘K quick actions
3. **ArcGauge.tsx** - Circular resource gauge (if exists)
4. **Sparkline.tsx** - Trend line chart (if exists)

### Step 4: Analyze What's There

For each component, note:

```
## Component: [Name]

**File**: src/features/dashboard/[Name].tsx
**What it does**: [1-2 sentences]
**Key features**: [list the main features]
**How it works**: [brief technical description]
**Quality**: [production-ready/needs work/prototype]
```

---

## What to Look For

### Custom UI Elements

- Glassmorphism cards
- Arc gauges
- Sparklines
- Drag-and-drop
- Command palette
- Animations
- Hover effects

### Custom Hooks

- useAgents
- useModalState
- Any other custom hooks

### Patterns

- How we structure dashboard views
- How we handle state
- How we style components

---

## Create a Report

After analyzing, create `docs/CURRENT_CODEBASE_ANALYSIS.md` with:

```markdown
# SISO Command Center - Current Codebase Analysis

## Custom Components We've Built

### 1. ProjectDashboard
- **File**: src/features/dashboard/ProjectDashboard.tsx
- **Features**: glassmorphism, arc gauges, sparklines, kanban, command palette
- **Quality**: Production-ready

### 2. CommandPalette
- **File**: src/features/dashboard/CommandPalette.tsx
- **Features**: fuzzy search, keyboard navigation
- **Quality**: Production-ready

## Custom Hooks

### 1. useAgents
- **File**: src/hooks/useAgents.ts
- **Purpose**: Fetch agents from Gateway
- **Quality**: Tested, production-ready

## Elements Worth Keeping

1. [list]
2. [list]

## Elements That Need Work

1. [list]
2. [list]

## Recommended Improvements

1. [priority]
2. [priority]
```

---

## Important

- This is our custom code - be critical but fair
- Focus on what's worth keeping vs what needs improvement
- Look for patterns we can replicate

---

*Use with Claude Code or any AI agent*
