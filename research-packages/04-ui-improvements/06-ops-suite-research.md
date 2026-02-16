# OpenClaw OPS Suite Research - Operations Dashboard

**Repo:** https://github.com/fm9394/OpenClaw-OPS-Suite | **Stars:** 66 | **Stack:** Next.js 15 + Neon PostgreSQL

---

## What is OPS Suite?

Operations dashboard for monitoring AI agent activity - token tracking, memory/learning, relationships, goals.

---

## Core Operations

| Feature | Description |
|---------|-------------|
| **Token Budget** | Real-time token consumption, hourly/weekly tracking |
| **Memory & Learning** | Decision tracking, lessons learned, pattern recognition |
| **Relationship Tracker** | Mini-CRM with contacts, interactions, follow-ups |
| **Goal Tracking** | Goals with milestones, progress visualization |
| **Calendar** | Google Workspace sync |
| **Workflows/SOPs** | Document repeatable processes |

---

## Architecture

### API Layer
- `/api/settings` - Integration credentials
- `/api/tokens` - Token usage
- `/api/learning` - Decisions/lessons
- `/api/relationships` - Contacts
- `/api/goals` - Goal tracking
- `/api/calendar` - Events

### Security
- API key auth (`DASHBOARD_API_KEY`)
- Rate limiting (100 req/min)
- Encrypted credentials in Neon
- Security headers

---

## Integrations (30+)

| Category | Services |
|----------|----------|
| AI Providers | OpenAI, Anthropic, Groq, Together AI |
| Databases | Neon, Supabase, MongoDB, Redis, Pinecone |
| Communication | Telegram, Discord, Slack, Twilio |
| Productivity | Google Workspace, Notion, Linear |

---

## OpenClaw Package Ideas

| Package | Description |
|---------|-------------|
| `@openclaw/token-monitor` | Token budget widget |
| `@openclaw/credential-vault` | Encrypted API key storage |
| `@openclaw/learning-db` | Decision + lesson tracking |
| `@openclaw/ops-dashboard` | Full dashboard components |

---

## Source Files
- [`app/api/`](https://github.com/fm9394/OpenClaw-OPS-Suite/tree/main/app/api)
- [`app/dashboard/`](https://github.com/fm9394/OpenClaw-OPS-Suite/tree/main/app/dashboard)
