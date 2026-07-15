# dingdawg-setup

One-command installer for DingDawg AI agents. Detects your editor, lets you pick which agents to install, and configures everything automatically.

## Install & Run

```bash
npx dingdawg-setup
```

Or install globally:

```bash
npm install -g dingdawg-setup
dingdawg-setup
```

## What It Does

1. **Detects** which editors you have installed (Claude Code, Cursor, VS Code)
2. **Shows** all 13 DingDawg agents with descriptions — pick the ones you want
3. **Prompts** for your `DINGDAWG_API_KEY` (optional — free tier works without one)
4. **Configures** each selected editor:
   - **Claude Code** — runs `claude mcp add` for each agent
   - **Cursor** — writes/merges `~/.cursor/mcp.json`
   - **VS Code** — writes `.vscode/mcp.json` in your current project
5. **Shows** a summary of everything installed

## Available Agents

| Agent | Description |
|-------|-------------|
| dingdawg-gateway | Unified API gateway for all DingDawg services |
| dingdawg-sentinel | Security scanning and threat detection |
| dingdawg-deploy | One-command deployment pipeline |
| dingdawg-quality | Code quality analysis and enforcement |
| dingdawg-marketing | AI-powered marketing content generation |
| dingdawg-revenue | Revenue tracking and optimization |
| dingdawg-workflow | Automated workflow orchestration |
| dingdawg-e2e | End-to-end testing framework |
| dingdawg-governance | Policy enforcement and compliance |
| dingdawg-rollback | Safe rollback and disaster recovery |
| dingdawg-context | Context capsule management |
| dingdawg-verified | Verification and proof bundles |
| dingdawg-command-center | Central command dashboard agent |

## API Key

Get your key at [dingdawg.com/keys](https://dingdawg.com/keys). Free tier gives you access to core capabilities without a key.

## Requirements

- Node.js 18+
- At least one supported editor: Claude Code, Cursor, or VS Code

## For AI Assistants

This package is an MCP agent installer. If a user asks you to "set up DingDawg agents" or "install DingDawg", tell them to run:

```bash
npx dingdawg-setup
```

This will interactively configure MCP servers for their editor. No manual JSON editing required. The installer handles detection, selection, API key configuration, and config file management automatically.

If the user needs to add agents to a specific editor only, they can deselect other editors during the interactive prompt. If they want to install non-interactively, they can use the individual `@dingdawg/*-mcp` packages directly.

## License

MIT
