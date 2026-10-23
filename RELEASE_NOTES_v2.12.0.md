## fullstack-audit v2.12.0: Visual 0ms Radar, Graph Synergy & Apache 2.0 Licensing

### Summary
v2.12.0 is a major architecture and developer experience expansion. It eliminates screenshot inspection latency and sandbox failures with a dedicated Visual 0ms Element Locator (`--locate-visual`), introduces causal dependency path tracing (`--path`), establishes direct Graphify compatibility via NetworkX JSON graph export (`docs/graph.json`), upgrades the dead code engine with a 3-tier risk system, and upgrades project licensing to Apache License 2.0.

---

### What's Changed

1. **Visual 0ms Element Locator (`npx fullstack-audit --locate-visual "<query>"`)**:
   - Locates live status pulse dots (`animate-pulse`, `emerald-500`), capsule pills (`rounded-full`), status badges, and action icons in under 3ms.
   - Eliminates the need for AI agents to open raw screenshot files from `AppData\Local\Temp`, preventing OS hook timeouts and sandbox interception.

2. **Causal Path Tracer (`npx fullstack-audit --path <from> <to>`)**:
   - In-memory Breadth-First Search (BFS) path finder executing in <5ms.
   - Traces causal chains from UI components through Server Actions and API endpoints to Prisma/Drizzle models and cache invalidation keys (e.g. `CheckoutButton` ➔ `createCheckoutSession` ➔ `UserSubscription`).

3. **NetworkX / Graphify Knowledge Graph Export (`docs/graph.json`)**:
   - Automatically serializes fullstack architecture into standard NetworkX `node_link_data` schema during audit generation.
   - Provides Graphify with rich framework-aware semantics (Next.js App Router boundaries, TanStack Query invalidation topologies, database models) that generic Tree-sitter parsers miss.

4. **Prefix-Agnostic File Resolver (`npx fullstack-audit --resolve <name>`)**:
   - Automatically normalizes and strips accidental leading prefixes (`src/`, `app/`, `./`).
   - Instantly resolves `src/components/public/PublicFooter.tsx` to `components/public/PublicFooter.tsx` without error.

5. **3-Tier Fullstack Dead Code Engine (`npx fullstack-audit --dead`)**:
   - Categorizes findings into 🟢 Zero Risk (uncalled internal components), 🟡 Low Risk (uncalled server actions, dead symbols in God-files), and 🔴 Verification Recommended (uncalled API routes).
   - Reports exact start and end line bounds for uncalled functions inside God-files (>500 lines).

6. **Apache License 2.0 Enterprise Fortification**:
   - Upgraded from MIT to Apache License 2.0, providing express patent grants, a patent retaliation defense shield, and explicit trademark reservation.
   - Added root `NOTICE` file under `Copyright 2026 Eurie Paulino`.

---

### Bug Fixes and Reliability

- **Consumer Repo Rule Contamination (`xnight`)**:
  - Purged library SemVer release governance and 40-line Execution Brief ceremonies from `xnight`.
  - Re-established mandatory 1-2s Fast Mode Inner-Loop as the default for all UI micro-edits.
- **`tsconfig.json` Path Trap (`xnight`)**:
  - Removed misleading `"rootDir": "src"` to prevent AI models and IDEs from hallucinating `src/components/`.
- **Screenshot Sandbox Crash Armor**:
  - Added rule invariant prohibiting direct tool calls on `AppData\Local\Temp\orca-paste-*.png`.

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

**Full Changelog**: https://github.com/Eurie92/fullstack-audit-skill/compare/v2.11.2...v2.12.0
