## fullstack-audit v2.12.1: Opt-In Graph Generation & Repository Hygiene

### Summary
v2.12.1 refines knowledge graph generation by converting `docs/graph.json` into an opt-in CLI flag (`--graph`), ensuring consumer repositories remain free of 10,000-line Git bloat. It also empowers the `--path` tracer to execute in-memory without requiring any on-disk JSON file.

---

### What's Changed

1. **Opt-In Knowledge Graph Export (`--graph`)**:
   - `docs/graph.json` is no longer generated automatically during standard `/fullstack-audit` or `npm run audit` runs.
   - Developers utilizing Graphify or NetworkX explicitly pass `--graph` (e.g. `npx fullstack-audit --graph`) to emit the JSON graph.

2. **In-Memory Causal Path Tracing (No File Required)**:
   - `npx fullstack-audit --path <from> <to>` now synthesizes in-memory causal dependency graphs from `06_FULLSTACK_CROSS_REFERENCE_MAP.md` and `.atlas-index.json` in under 2ms if `docs/graph.json` is absent.
   - Users enjoy sub-5ms path tracing without committing large JSON files to Git.

3. **Git Hygiene & Windows CLI Buffer Protection**:
   - Added `docs/graph.json` to `.gitignore`.
   - Prevents IDE Git staging buffer overflow on Windows (*"Antigravity prompt is too large for the Windows command line"*).

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

**Full Changelog**: https://github.com/Eurie92/fullstack-audit-skill/compare/v2.12.0...v2.12.1
