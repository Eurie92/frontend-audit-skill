## fullstack-audit v2.11.1: Prominent Installation & AI Chat-First Cheat Sheet

### Summary
v2.11.1 delivers a developer experience and documentation refinement designed to eliminate confusion around terminal CLI commands versus AI assistant chat usage. It introduces a prominent, top-level Installation block directly in `README.md`, adds an AI Chat-First Prompt Cheat Sheet, and resolves a PowerShell remote installer parsing issue.

---

### What's Changed

1. **Prominent Top-Level Installation Section**:
   - Placed directly beneath the project Overview in `README.md` for immediate discovery.
   - Provides one-line copy-paste commands for Windows PowerShell, macOS/Linux Bash, and one-off zero-install `npx`.

2. **AI Chat-First Prompt Cheat Sheet**:
   - Eliminates the misconception that developers must memorize or type complex `npx` commands while coding.
   - Maps natural language developer prompts (e.g., *"Find the export button from this screenshot"*, *"Trace checkout to database"*, *"Verify before commit"*) directly to the autonomous primitives the AI assistant executes under the hood.

3. **CLI Scope Boundary Clarification**:
   - Relegates terminal CLI execution (`npx fullstack-audit`) to an optional section, clarifying that it is strictly intended for manual file inspection outside an AI assistant or automated CI/CD pipelines.

4. **100-Run Benchmark Integration**:
   - Links the verified 100-run test suite report (`docs/BENCHMARK_100_REPORT.md`), demonstrating 0.18ms median lookup latency, 99% accuracy, and 98% token reduction.

---

### Bug Fixes and Reliability

- **PowerShell Remote Script Parser Syntax (`scripts/install.ps1`)**:
  - Replaced backtick-escaped double-quoted strings with PowerShell single-quoted Here-Strings (`@' ... '@`).
  - Completely eliminates `ExpectedValueExpression` parser failures when running `iex (irm ...)` from fresh PowerShell terminals.
- **Dynamic Framework Test Version Assertion (`scripts/test-frameworks.ts`)**:
  - Made version assertions dynamic via `package.json`, ensuring automated CI smoke tests pass cleanly across version bumps.

---

### Installation & Upgrade

#### Windows (PowerShell)
```powershell
iex (irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1)
```

#### macOS / Linux (Bash)
```bash
curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash
```

#### Zero-Install (Run once via npx)
```powershell
# Windows PowerShell / CMD:
npx.cmd fullstack-audit

# macOS / Linux:
npx fullstack-audit
```

---

**Full Changelog**: https://github.com/Eurie92/fullstack-audit-skill/compare/v2.11.0...v2.11.1
