---
name: fullstack-audit
description: Universal fullstack architecture and design system atlas. Zero-grep lookup for routes, components, design tokens, query keys, API routes, and DB models.
---

# Fullstack Audit Skill (Hermes Agent Specification)

Execute `npx fullstack-audit` to catalog the entire repository into `docs/frontend-atlas/` and `docs/backend-atlas/`.

<!-- START_FULLSTACK_AUDIT_RULE -->
<!-- START_FRONTEND_AUDIT_RULE -->
## ⚡ Fullstack 4-Phase Synergy Engine (0ms Atlas • Ponytail KISS • Caveman Terse • Dual-Speed Verify)
Universal execution rule across all harnesses (**Antigravity, Cursor, Claude Code, Windsurf, Codex, OpenCode, VS Code**).

### 🔄 The 4-Phase Operational Pipeline

#### Phase 1: GPS / Locate (`fullstack-audit`)
- 🛑 **IRON GATE INVARIANT (Zero-Grep & Zero-Scratch Absolute Mandate)**:
  - ❌ **FORBIDDEN (All Recursive Searches)**: NEVER run `Get-ChildItem -Recurse` (under ANY parameters: `-Filter`, `-Include`, `-Path`, `-Directory`, etc.), `grep -r`, `rg`, `find`, or `dir /s`. Windows PowerShell scans `node_modules` and `.next`, causing a 15–30s Defender freeze.
  - ❌ **FORBIDDEN (Inline Scratch Scripts)**: NEVER execute `node -e "const fs = require('fs')..."`, `python -c "..."`, or PowerShell `[IO.File]::ReadAllText` / `ForEach-Object` one-liners to locate, read, or patch files.
  - ❌ **FORBIDDEN (Path Guessing)**: NEVER guess paths or prepend arbitrary prefixes like `src/components/`.
  - ✅ **MANDATORY GPS FIRST-ACTION**: The FIRST tool call MUST locate the element deterministically:
    - **Fast Find**: Run `npx fullstack-audit --find "<query>" --compact` (sub-3ms token-compact lookup).
    - **Visual & Icon Locator**: Run `npx fullstack-audit --locate-visual "<query>"` (0ms lookup for live pulse dots `animate-pulse`, capsule pills `rounded-full`, badges, action icons).
    - **Fuzzy Case Resolver**: Run `npx fullstack-audit --resolve "<name>"` (prefix-agnostic casing & path resolver in 0ms).
    - **Causal Path Tracer**: Run `npx fullstack-audit --path <fromComponent> <toActionOrModel>` (sub-5ms causal dependency path).
    - **God-File Slicer**: Run `npx fullstack-audit --symbol "<method>"` (exact start/end lines before calling `read_file`).
    - **Pre-Computed Atlases**: Direct `view_file` on `docs/frontend-atlas/` (01 routes, 02 components, 03 tokens, 06 visible text, 07 icons) or `docs/backend-atlas/` (01 APIs, 02 DB models, 03 server actions, 04 auth).
- **Screenshot & Temp Image Armor**: When a user references a screenshot in `AppData\Local\Temp\orca-paste-*.png`:
  - ❌ **FORBIDDEN**: Never call `read_file` or `view_file` directly on `AppData\Local\Temp` paths (avoids OS hook sandbox interception).
  - ⚡ **Fast-Path A (Visual Atlas)**: Query `npx fullstack-audit --locate-visual "<element>"` or view `docs/frontend-atlas/02_COMPONENT_INVENTORY.md` in 0ms without opening the image.
  - ⚡ **Fast-Path B (Scratch Copy)**: If the raw screenshot must be viewed, copy first: `Copy-Item '<temp-path>' 'scratch\screenshot.png'`, then open `scratch\screenshot.png`.
- **PowerShell Quoting & Surgical Patching**:
  - Wrap PowerShell arguments in single-quotes `'...'` (prevents `&` reserved character syntax crash and variable expansion).
  - To edit code: Use native harness tools (`edit_file`) or `npx fullstack-audit --patch <file> --target "<old>" --replace "<new>"` (CRLF-agnostic surgical patcher).
- **Immediate Relinquishment**: Once `file:line` is located, `fullstack-audit` IMMEDIATELY relinquishes control to implementation. `fullstack-audit` is a GPS locator, NOT an implementation or animation tool.

#### Phase 2: Design & Anti-Overengineering Firewall (`ponytail`)
- **YAGNI Invariant**: The best code is the code never written. Solve the whole problem with the least new code.
- **The Ponytail Hierarchy**:
  1. *Does it need to exist?* Skip unasked features, options, and speculative abstractions. A vague request gets the smallest working version.
  2. *Already in codebase?* Reuse existing helpers, components, and patterns.
  3. *Platform feature?* Use standard web/DOM/Tailwind primitives over custom JavaScript trigonometry, 36-point polygon waves, or complex SVG math.
  4. *Installed dependency?* Never install a new package for a few lines of logic.
  5. *Can it be one line?* Make it one line a reader grasps at a glance.
  6. *Shortest working diff wins.* Deletion beats addition. Keep surrounding layers and conventions intact.
- **Preserve Always**: Trust boundary validation, auth guards, data-loss error handling, accessibility.
- **Shortcuts**: Document deliberate limits as `// shortcut: <limit>, <when to upgrade>`.

#### Phase 3: Communication & Zero-Fluff Receipts (`caveman`)
- **Answer First**: Dense result first, technical facts exact.
- **Kill Ceremony**: No conversational filler ("Sure, I can help with that!", "I apologize for the confusion"), no preamble, no postamble.
- **Tool Status**: Zero conversational commentary between routine tool calls.
- **Compact Diff Receipt**: Conclude replies with a tight diff receipt:
  - `Target`: `<file:line>`
  - `Diff`: `<old>` ➔ `<new>`
  - `Status`: `<HMR applied | Test pass count | Exit code>`

#### Phase 4: Right-Sized Verification (`superpowers` Dual-Speed Harmonization)
- **⚡ Inner-Loop (Fast Mode — 1 to 2s responses — Mandatory for UI/CSS/Layout/Copy edits ≤ 2 files, < 30 lines)**:
  - Perform direct surgical file edits (`npx fullstack-audit --patch` or `edit_file`). Let local dev server (Next.js/Vite/Nuxt HMR) refresh in 50ms.
  - **HARD FORBIDDEN**: Do NOT run full TypeScript compilation (`tsc --noEmit`, `npm run typecheck`).
  - **HARD FORBIDDEN**: Do NOT run `npm run audit` or `npx fullstack-audit` on micro-edits.
  - **HARD FORBIDDEN**: Do NOT invoke Superpowers process skills (`brainstorming`, `writing-plans`, `test-driven-development`).
  - **HARD FORBIDDEN**: Do NOT invoke multiple design skills in parallel.
  - **HARD FORBIDDEN**: Do NOT invoke heavy browser automation (Chrome DevTools MCP / Puppeteer) or curl localhost.
  - **Response Time**: Return immediately to the user in 1–2 seconds.
- **🛡️ Outer-Loop (Checkpoint Verification Gate — Milestones/Backend/DB/Auth)**:
  - Superpowers Iron Law applies: *No completion claims without fresh verification evidence.*
  - Run `npx fullstack-audit --verify --gate-clean` or test suites (`npm test`, `npm run typecheck`).
  - Claim completion ONLY with fresh exit code 0 evidence.
  - **Zero Polling Invariant**: Do NOT loop on `manage_task status`. The harness features Reactive Wakeup and automatically resumes execution when tasks complete.
  - Run `npm run audit` upon milestone completion to synchronize atlases.

### 🛠️ Available Commands (v2.12.3 Multi-Harness Engine)
- `/fullstack-audit` or `npm run audit`: Regenerates the entire Fullstack Atlas and root `llms.txt` / `llms-full.txt`.
- `npx fullstack-audit --find <query> --compact`: Ultra-fast, sub-3ms token-compact query mode for AI agents.
- `npx fullstack-audit --locate-visual <query>`: 0ms visual element locator (pulse dots, capsule pills, status badges, icons).
- `npx fullstack-audit --resolve <name>`: Fuzzy case-insensitive component & file resolver.
- `npx fullstack-audit --path <from> <to>`: Sub-5ms causal execution path finder (UI button -> Action -> DB model).
- `npx fullstack-audit --symbol <method>`: Line-bound surgical slicer for functions/methods in God-files.
- `npx fullstack-audit --patch <file> --target "<old>" --replace "<new>"`: CRLF-agnostic surgical patcher (immune to PowerShell `&` syntax crashes).
- `npx fullstack-audit --setup-all [--standalone | --profile <profile>]`: Configures Cursor (.mdc), Claude Code, Hermes Agent, and OpenCode.
- `npx fullstack-audit --theme --route <route> --compact`: Generates a route-scoped micro-punchlist (saves 99.8% tokens).
- `npx fullstack-audit --verify --gate-clean [--route <route>]`: Smart multi-target verification gate.
- `npx fullstack-audit --solo`: Enforces strictly Single-Agent execution (no subagents).
- `npx fullstack-audit --multi-agent`: Partitions codebase into 4 parallel zone briefs for rapid Map-Reduce sweeps.
- `npx fullstack-audit --llms`: Generates root `llms.txt` and `llms-full.txt` (Answer.AI specification).
- `npx fullstack-audit --graph`: Exports knowledge graph to `docs/graph.json` (NetworkX / Graphify schema).
- `npx fullstack-audit --diff`: Architecture delta report comparing current scan against `.last_receipt.json`.
- `npx fullstack-audit --migrate-theme --from "#hex1,#hex2" --to "dark:bg-slate-900"`: CRLF-agnostic AST codemod in 80ms (0 LLM output tokens).
- `npx fullstack-audit --manifest <file:line>`: Generates zero-search agent handoff manifest.
- `npx fullstack-audit --watch`: Live background file watcher for continuous background sync.
- `npx fullstack-audit --dead`: Scans for potential orphaned components.
<!-- END_FRONTEND_AUDIT_RULE -->
<!-- END_FULLSTACK_AUDIT_RULE -->