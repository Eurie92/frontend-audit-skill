#!/usr/bin/env node

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Instant Fast-Path for Version Check (<5ms exit without spawning tsx)
const args = process.argv.slice(2);
if (args.includes("-v") || args.includes("--version")) {
  try {
    const pkgPath = path.resolve(__dirname, "../package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    console.log(`fullstack-audit v${pkg.version} (engine: AST reactive graph v2)`);
  } catch {
    console.log("fullstack-audit v2.8.0 (engine: AST reactive graph v2)");
  }
  process.exit(0);
}

const scriptPath = path.resolve(__dirname, "../scripts/audit.ts");

const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(npxCmd, ["tsx", scriptPath, ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
