# Research Pipeline

## Overview

Automated research pipeline using Antfarm multi-agent workflows.

## Setup

```bash
# Install Antfarm
curl -fsSL https://raw.githubusercontent.com/snarktank/antfarm/v0.5.1/scripts/install.sh | bash

# Or tell OpenClaw
install github.com/snarktank/antfarm
```

## Run Pipeline

```bash
# Full pipeline
antfarm workflow run research-pipeline "Analyze all SISO projects"

# Check status
antfarm workflow status <run-id>

# Dashboard
antfarm dashboard
```

## Workflows

- **research-pipeline**: Multi-step research analysis
- **project-scan**: Quick project inventory
- **insight-extraction**: Extract actionable items
