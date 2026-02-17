# AI Agent Handoff - SISO Command Center

> Read this to start working on SISO Command Center

---

## What is This?

SISO Command Center is a custom UI for OpenClaw Gateway. It shows agents, dashboards, and lets you manage AI agents.

## Quick Start

```bash
git clone https://github.com/Lordsisodia/siso-command-center.git
cd siso-command-center
npm install
npm run dev
```

Open http://localhost:3000

---

## Where to Work

### YOUR CODE (modify freely)

| Path | What It Is |
|------|-------------|
| `src/features/dashboard/` | Dashboard views |
| `src/ui/charts/` | Chart components (ArcGauge, Sparkline) |
| `src/hooks/` | React hooks |

### THEIR CODE (don't touch)

| Path | What It Is |
|------|-------------|
| `src/lib/gateway/` | WebSocket connection to OpenClaw |
| `src/features/fleet/` | Agent management |

---

## Key Files

### Dashboard (Your Main Work Area)

```
src/features/dashboard/
├── ProjectDashboard.tsx   ← Main dashboard with stats, gauges, kanban
├── CommandPalette.tsx     ← Opens with ⌘K
├── MainDashboard.tsx     ← Overview page
└── ProjectWidget.dart    ← Project info widget
```

### Custom Hooks

```
src/hooks/
├── useAgents.ts         ← Fetch agents from Gateway
├── useModalState.ts     ← Modal open/close
└── types.ts            ← Shared types
```

### UI Components

```
src/ui/
├── charts/
│   ├── ArcGauge.tsx    ← Circular gauge
│   └── Sparkline.tsx   ← Trend line
└── components/
    └── theme-toggle.tsx
```

---

## How to Add a New Feature

### 1. New Dashboard View

Create `src/features/dashboard/MyNewView.tsx`:

```tsx
"use client";
import { useAgents } from '@/hooks/useAgents';

export function MyNewView({ client }) {
  const { agents, loading } = useAgents(client);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="p-6">
      {agents.map(agent => (
        <div key={agent.id}>{agent.name}</div>
      ))}
    </div>
  );
}
```

Then add to `src/app/page.tsx`

### 2. New Chart

Create `src/ui/charts/MyChart.tsx`:

```tsx
export function MyChart({ data, color = "blue" }) {
  return (
    <svg>
      {/* Your chart implementation */}
    </svg>
  );
}
```

### 3. New Hook

Create `src/hooks/useMyFeature.ts`:

```tsx
"use client";
import { useState, useEffect } from 'react';

export function useMyFeature(param) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // Your logic here
  }, [param]);
  
  return { data };
}
```

---

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- tests/unit/useAgents.test.ts
```

---

## Building

```bash
# Production build
npm run build

# Dev server
npm run dev
```

---

## Common Tasks

### Add a new stat card to dashboard
→ Edit `src/features/dashboard/ProjectDashboard.tsx`
→ Add `<StatCard ... />` component

### Add a new chart
→ Create in `src/ui/charts/`
→ Import in your view

### Connect to Gateway
→ Use `useAgents(client)` hook
→ Pass `client` from page.tsx

### Style with Tailwind
→ Use standard Tailwind classes
→ Check docs: https://tailwindcss.com

---

## Architecture Rules

1. **Gateway is sacred** - Don't modify `src/lib/gateway/`
2. **Fleet is mostly sacred** - Don't modify `src/features/fleet/` unless needed
3. **Dashboard is yours** - Modify `src/features/dashboard/` freely
4. **UI components** - Put reusable stuff in `src/ui/`
5. **Hooks** - Put logic in `src/hooks/`

---

## If Something Breaks

1. Check build: `npm run build`
2. Check tests: `npm test`
3. Check Gateway: is it running?
4. Check imports: are paths correct?

---

## Docs

- Full docs: `docs/COMPLETE_DOCUMENTATION.md`
- Architecture: `docs/SISO_ARCHITECTURE.md`

---

*For AI Agent Use - Version 0.2.0*
