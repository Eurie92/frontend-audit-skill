#!/usr/bin/env node

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.resolve(__dirname, "../scripts/audit.ts");

const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(npxCmd, ["tsx", scriptPath, ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
