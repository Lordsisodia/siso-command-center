# OpenClaw Extension Package Template

Use this template to create new OpenClaw extensions based on research.

## Package Structure

```
@openclaw/extension-{name}/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # Main entry point
│   ├── config.ts         # Configuration schema
│   ├── types.ts         # TypeScript types
│   └── {module}.ts      # Feature modules
├── dist/                 # Compiled JS
├── README.md            # Integration guide
└── CLAUDE.md           # Agent instructions
```

## package.json Template

```json
{
  "name": "@openclaw/extension-{name}",
  "version": "0.1.0",
  "description": "{Description from research}",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  },
  "peerDependencies": {
    "openclaw": ">=0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

## Integration Checklist

- [ ] Research analysis complete
- [ ] Adaptation plan created
- [ ] Package structure scaffolded
- [ ] Core functionality implemented
- [ ] OpenClaw extension interface implemented
- [ ] Configuration schema defined
- [ ] README with installation instructions
- [ ] Tested on Mac Mini
- [ ] Deployed to production

---

## For Research Agent

Fill this out after research completion:

```yaml
framework:
  name: ""
  repo: ""
  stars: 0
  language: ""

what_we_need:
  - ""

adaptation_plan:
  - step: ""
    file: ""
    changes: ""

package:
  name: "@openclaw/extension-"
  description: ""
  key_files: []
```
