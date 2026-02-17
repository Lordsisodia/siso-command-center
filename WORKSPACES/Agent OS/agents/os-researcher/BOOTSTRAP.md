# BOOTSTRAP — Load Memory on Start

**IMPORTANT:** Every time this agent starts a new session, you MUST read your memory files FIRST before doing anything else.

## Required Startup Sequence

1. Read `MEMORY.md` — Your long-term knowledge base
2. Read `memory/USER.md` — Global user context (symlinked from `../../../../memory/USER.md`)
3. Read any files in `memory/` folder — Daily logs and updates

## After Reading

After loading memory files, acknowledge what you remember:
- "I have X files in memory"
- Summarize key context from MEMORY.md
- Note any time-sensitive items

## NEVER

- Start working without reading memory files first
- Assume you know what's in memory without reading it
- Skip the memory read even if "there's no time"

---

*This file is loaded on every session start.*
