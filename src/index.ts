#!/usr/bin/env node

import prompts from "prompts";
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

// ── Agent Registry ──────────────────────────────────────────────────────────

interface AgentDef {
  name: string;
  package: string;
  description: string;
}

const AGENTS: AgentDef[] = [
  { name: "dingdawg-gateway",        package: "@dingdawg/gateway-mcp",        description: "Unified API gateway for all DingDawg services" },
  { name: "dingdawg-sentinel",       package: "@dingdawg/sentinel-mcp",       description: "Security scanning and threat detection" },
  { name: "dingdawg-deploy",         package: "@dingdawg/deploy-mcp",         description: "One-command deployment pipeline" },
  { name: "dingdawg-quality",        package: "@dingdawg/quality-mcp",        description: "Code quality analysis and enforcement" },
  { name: "dingdawg-marketing",      package: "@dingdawg/marketing-mcp",      description: "AI-powered marketing content generation" },
  { name: "dingdawg-revenue",        package: "@dingdawg/revenue-mcp",        description: "Revenue tracking and optimization" },
  { name: "dingdawg-workflow",       package: "@dingdawg/workflow-mcp",       description: "Automated workflow orchestration" },
  { name: "dingdawg-e2e",            package: "@dingdawg/e2e-mcp",            description: "End-to-end testing framework" },
  { name: "dingdawg-governance",     package: "@dingdawg/governance-mcp",     description: "Policy enforcement and compliance" },
  { name: "dingdawg-rollback",       package: "@dingdawg/rollback-mcp",       description: "Safe rollback and disaster recovery" },
  { name: "dingdawg-context",        package: "@dingdawg/context-mcp",        description: "Context capsule management" },
  { name: "dingdawg-verified",       package: "@dingdawg/verified-mcp",       description: "Verification and proof bundles" },
  { name: "dingdawg-command-center", package: "@dingdawg/command-center-mcp", description: "Central command dashboard agent" },
];

// ── Detection ───────────────────────────────────────────────────────────────

interface DetectedEditor {
  name: string;
  available: boolean;
}

function commandExists(cmd: string): boolean {
  try {
    execSync(`which ${cmd}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function detectEditors(): DetectedEditor[] {
  return [
    { name: "Claude Code", available: commandExists("claude") },
    { name: "Cursor",      available: existsSync(join(homedir(), ".cursor")) },
    { name: "VS Code",     available: commandExists("code") },
  ];
}

// ── Installers ──────────────────────────────────────────────────────────────

function installClaudeCode(agents: AgentDef[], apiKey: string): number {
  let installed = 0;
  for (const agent of agents) {
    try {
      const envFlag = apiKey ? `-e DINGDAWG_API_KEY=${apiKey}` : "";
      const cmd = `claude mcp add ${agent.name} ${envFlag} -- npx ${agent.package}`.replace(/\s+/g, " ").trim();
      execSync(cmd, { stdio: "inherit" });
      installed++;
      console.log(`  ✓ ${agent.name}`);
    } catch {
      console.error(`  ✗ ${agent.name} — failed to add`);
    }
  }
  return installed;
}

function installCursor(agents: AgentDef[], apiKey: string): number {
  const configPath = join(homedir(), ".cursor", "mcp.json");
  let config: { mcpServers: Record<string, unknown> } = { mcpServers: {} };

  if (existsSync(configPath)) {
    try {
      const raw = readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        config = { mcpServers: {}, ...parsed };
      }
    } catch {
      // Corrupt file — start fresh
    }
  }

  let installed = 0;
  for (const agent of agents) {
    const env: Record<string, string> = {};
    if (apiKey) env["DINGDAWG_API_KEY"] = apiKey;

    config.mcpServers[agent.name] = {
      command: "npx",
      args: [agent.package],
      ...(apiKey ? { env } : {}),
    };
    installed++;
    console.log(`  ✓ ${agent.name}`);
  }

  mkdirSync(join(homedir(), ".cursor"), { recursive: true });
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  console.log(`\n  Config written to ${configPath}`);
  return installed;
}

function installVSCode(agents: AgentDef[], apiKey: string): number {
  const vsDir = join(process.cwd(), ".vscode");
  const configPath = join(vsDir, "mcp.json");
  let config: { mcpServers: Record<string, unknown> } = { mcpServers: {} };

  if (existsSync(configPath)) {
    try {
      const raw = readFileSync(configPath, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        config = { mcpServers: {}, ...parsed };
      }
    } catch {
      // Corrupt file — start fresh
    }
  }

  let installed = 0;
  for (const agent of agents) {
    const env: Record<string, string> = {};
    if (apiKey) env["DINGDAWG_API_KEY"] = apiKey;

    config.mcpServers[agent.name] = {
      command: "npx",
      args: [agent.package],
      ...(apiKey ? { env } : {}),
    };
    installed++;
    console.log(`  ✓ ${agent.name}`);
  }

  mkdirSync(vsDir, { recursive: true });
  writeFileSync(configPath, JSON.stringify(config, null, 2) + "\n");
  console.log(`\n  Config written to ${configPath}`);
  return installed;
}

// ── Banner ──────────────────────────────────────────────────────────────────

function showBanner(): void {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║       DingDawg Agent Setup     v1.0      ║
  ║                                          ║
  ║   One command. All your AI agents.       ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  showBanner();

  // Detect available editors
  const editors = detectEditors();
  const availableEditors = editors.filter((e) => e.available);

  if (availableEditors.length === 0) {
    console.error("  No supported editors detected.");
    console.error("  Supported: Claude Code (claude), Cursor (~/.cursor/), VS Code (code)");
    process.exit(1);
  }

  console.log("  Detected editors:");
  for (const editor of availableEditors) {
    console.log(`    ✓ ${editor.name}`);
  }
  console.log();

  // Select target editor(s)
  const editorResponse = await prompts({
    type: "multiselect",
    name: "targets",
    message: "Install agents for which editors?",
    choices: availableEditors.map((e) => ({
      title: e.name,
      value: e.name,
      selected: true,
    })),
    min: 1,
  });

  if (!editorResponse.targets || editorResponse.targets.length === 0) {
    console.log("  Setup cancelled.");
    process.exit(0);
  }

  const targets: string[] = editorResponse.targets;

  // Select agents
  const agentResponse = await prompts({
    type: "multiselect",
    name: "agents",
    message: "Select agents to install (space to toggle, enter to confirm)",
    choices: AGENTS.map((a) => ({
      title: `${a.name} — ${a.description}`,
      value: a.name,
      selected: true,
    })),
    min: 1,
  });

  if (!agentResponse.agents || agentResponse.agents.length === 0) {
    console.log("  Setup cancelled.");
    process.exit(0);
  }

  const selectedAgents = AGENTS.filter((a) => agentResponse.agents.includes(a.name));

  // API key
  const keyResponse = await prompts({
    type: "text",
    name: "apiKey",
    message: "DINGDAWG_API_KEY (press Enter to skip for free tier)",
    initial: "",
  });

  const apiKey: string = keyResponse.apiKey?.trim() || "";

  console.log("\n  ─── Installing ───\n");

  // Track results
  const results: { editor: string; count: number }[] = [];

  for (const target of targets) {
    console.log(`  → ${target}`);

    let count = 0;
    switch (target) {
      case "Claude Code":
        count = installClaudeCode(selectedAgents, apiKey);
        break;
      case "Cursor":
        count = installCursor(selectedAgents, apiKey);
        break;
      case "VS Code":
        count = installVSCode(selectedAgents, apiKey);
        break;
    }

    results.push({ editor: target, count });
    console.log();
  }

  // Summary
  console.log("  ╔══════════════════════════════════════════╗");
  console.log("  ║            Setup Complete                ║");
  console.log("  ╠══════════════════════════════════════════╣");

  for (const r of results) {
    const line = `  ║  ${r.editor}: ${r.count} agent${r.count !== 1 ? "s" : ""} installed`;
    console.log(line.padEnd(46) + "║");
  }

  if (!apiKey) {
    console.log("  ║                                          ║");
    console.log("  ║  Running in FREE TIER mode.              ║");
    console.log("  ║  Get an API key at dingdawg.com/keys     ║");
  }

  console.log("  ╚══════════════════════════════════════════╝");
  console.log();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
