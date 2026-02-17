# 🔧 Antfarm + OpenClaw Integration Architecture

**Date:** 2026-02-17

---

## How OpenClaw Uses Antfarm

### Invocation Method

OpenClaw invokes Antfarm via the `exec` tool (shell commands):

```bash
# Via OpenClaw exec tool
antfarm workflow run research-pipeline "Analyze projects"

# Check status
antfarm workflow status <run-id>
```

**Flow:**
```
User Request → OpenClaw Session → exec tool → antfarm CLI → OpenClaw Sub-agents
```

### How Antfarm Creates Agents

Antfarm doesn't create agents itself - it uses OpenClaw's sub-agent system:

1. **Antfarm** defines workflows in YAML (agents + steps)
2. **Antfarm** invokes OpenClaw via `/tools/invoke` or `openclaw` CLI
3. **OpenClaw** creates isolated sub-agent sessions for each agent
4. **Each sub-agent** gets its own workspace and context
5. **Antfarm** coordinates the flow between agents

### Key Integration Point

```yaml
# In antfarm workflow YAML
agents:
  - id: researcher
    name: Researcher
    # This agent runs in an OpenClaw sub-session
    # Antfarm sends prompts via OpenClaw's agentTurn
```

---

## Data Flow Architecture

### Input → Output

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   INPUT     │────▶│  ANT FARM   │────▶│   OUTPUT    │
│  (Projects) │     │  PIPELINE   │     │ (Workspace) │
└─────────────┘     └─────────────┘     └─────────────┘
      │                   │                   │
      ▼                   ▼                   ▼
  /projects/         workflow run        objectives/
  README.md         agent sessions       knowledge/
  configs/          YAML definitions     memory/
```

### Workspace Paths

For SISO-Research-Base, here's where everything goes:

```
SISO-RESEARCH-BASE/
├── .antfarm/                    # Antfarm config
│   ├── config.yaml              # Antfarm settings
│   └── workflows/               # Your workflows
│       └── research-pipeline.yaml
│
├── projects/                    # INPUT: Projects to analyze
│   ├── openclaw-command-centers/
│   ├── agent-os-builds/
│   └── ... (14 projects)
│
├── objectives/                  # OUTPUT: By project
│   ├── openclaw-command-centers/
│   │   ├── tools.md
│   │   ├── techniques.md
│   │   └── integrations.md
│   └── ...
│
├── knowledge/                   # OUTPUT: Categorized insights
│   ├── tools/
│   ├── patterns/
│   └── integrations/
│
├── memory/                      # OUTPUT: Daily updates
│   ├── today.md
│   └── archive/
│
└── agents/
    └── research-pm/
        └── pipeline/           # Pipeline definitions
```

---

## Antfarm Workflow Configuration

### Define Workspaces in YAML

```yaml
# research-pipeline.yaml
id: research-pipeline
name: Research Pipeline

agents:
  - id: researcher
    name: Researcher
    workspace: /projects           # Reads from projects
    
  - id: analyzer
    name: Analyzer
    workspace: /objectives         # Writes analysis
    
  - id: extractor
    name: Extractor
    workspace: /knowledge          # Writes extracted items
    
  - id: synthesizer
    name: Synthesizer
    workspace: /memory             # Writes daily summary
```

### How Workspace Paths Map

| Agent | Workspace | Reads | Writes |
|-------|-----------|-------|--------|
| researcher | /projects | projects/* | - |
| analyzer | /objectives | - | objectives/<project>/ |
| extractor | /knowledge | objectives/ | knowledge/<type>/ |
| synthesizer | /memory | knowledge/ | memory/today.md |

---

## Complete Integration Example

### Step 1: Install Antfarm

```bash
# In workspace
curl -fsSL https://raw.githubusercontent.com/snarktank/antfarm/v0.5.1/scripts/install.sh | bash
```

### Step 2: Configure Workflow

```yaml
# .antfarm/workflows/research.yaml
id: research-pipeline
name: Research Pipeline

workspace:
  root: /Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER/WORKSPACES/SISO-RESEARCH-BASE

agents:
  - id: researcher
    workspace: projects/
    
  - id: analyzer  
    workspace: objectives/
    
  - id: extractor
    workspace: knowledge/
    
  - id: synthesizer
    workspace: memory/
```

### Step 3: Run from OpenClaw

```
User: "Run research pipeline"

OpenClaw Session:
  → exec: antfarm workflow run research-pipeline "Analyze 14 projects"
  
Antfarm:
  → Creates 4 sub-agent sessions in OpenClaw
  → researcher reads /projects
  → analyzer writes /objectives
  → extractor writes /knowledge
  → synthesizer writes /memory
```

### Step 4: View Results

```bash
# Check outputs
cat SISO-RESEARCH-BASE/memory/today.md
ls SISO-RESEARCH-BASE/objectives/
ls SISO-RESEARCH-BASE/knowledge/
```

---

## Summary: How It All Connects

| Component | Role | Connection |
|-----------|------|------------|
| **OpenClaw** | Agent execution | Runs sub-agents for Antfarm |
| **Antfarm** | Workflow orchestration | Invokes OpenClaw via CLI/tools |
| **Workflow YAML** | Definition | Defines agents + steps |
| **projects/** | Input | 14 projects to analyze |
| **objectives/** | Output | Per-project analysis |
| **knowledge/** | Output | Categorized insights |
| **memory/** | Output | Daily summaries |

---

## Next Steps

1. **Create workspace directories** (projects, objectives, knowledge, memory)
2. **Add 14 projects** to projects/ folder
3. **Configure Antfarm** with workspace paths
4. **Run pipeline** via OpenClaw
5. **Verify outputs** appear in correct folders
