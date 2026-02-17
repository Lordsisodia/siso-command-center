#!/bin/bash
# Auto-commit and push for SISO Command Center
# Runs on file changes

cd "/Volumes/SISO-STORAGE-VAULT/SISO-VAULT/COMMAND-CENTER"

# Check if there are changes
if [ -n "$(git status --porcelain)" ]; then
    # Add all changes
    git add -A
    
    # Commit with timestamp
    git commit -m "Auto-backup: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Push to GitHub
    git push origin master
fi
