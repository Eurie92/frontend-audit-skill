# 🗺️ Frontend Audit Skill (`frontend-audit`)

> **Universal Frontend Architecture, Design System & UI Island Audit Engine**  
> Auto-discovers Next.js, Vite & React projects, maps routes to components, catalogs buttons, modals, and cards, audits design tokens, and detects UI islands into persistent Markdown documents (`docs/frontend-atlas/`).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Frameworks: Next.js | Vite | React](https://img.shields.io/badge/Frameworks-Next.js%20%7C%20Vite%20%7C%20React-black.svg)](https://react.dev/)
[![Styling: Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8.svg)](https://tailwindcss.com/)
[![Zero Config](https://img.shields.io/badge/Config-Zero%20Config-emerald.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Eurie92/frontend-audit-skill/pulls)

---

## 🎯 Bakit Kailangan Mo Ito? (The Problem It Solves)

Sa lumalaking web projects—lalo na kapag may **Storefront**, **Admin Panel**, **Portal**, o **Dashboard**—tatlong malalaking problema ang palaging nangyayari:

1. **"UI Islands" (Kanya-kanyang Styling)**:
   - May mga screens na gumagamit ng official `<Button>` component, pero may kalahati ng codebase na gumagamit ng native `<button className="...">` na may sariling border-radius, kulay, at padding. Nagiging magulo at hindi consistent ang website.
2. **Invisible Color & Theme Drift**:
   - Kapag nagpapalit ka ng color theme o nag-a-update ng brand palette, laging may **maiiwang panels o modals** dahil may mga hardcoded hex colors (`#1e293b`, `#27272a`) o ligaw na `zinc`/`gray` classes na nakatago sa 100+ files.
3. **Naliligaw ang AI Coding Assistants**:
   - Kapag sinabi mo sa AI: *"Ayusin mo yung checkout modal"* o *"Ayusin mo yung hero section"*, nag-aaksaya ang AI ng libo-libong tokens sa pag-hahanap sa maling folder bago pa man magsimulang mag-code.

**`frontend-audit`** ang solusyon: Sa loob ng **3 segundo**, gumagawa ito ng buong **Frontend Atlas** (GPS at blueprint) ng buong website mo nang may **Zero Config**.

---

## ⚡ Quickstart

### Gamit ang Slash Command sa AI Assistant:
I-type lang sa chat:
```text
/frontend-audit
```
Awtomatikong tatakbuhin ng AI ang audit engine at ihahanda ang updated atlas nang hindi nagti-trigger ng ibang hindi kaugnay na skills.

### Gamit ang CLI sa Terminal:
```bash
npx tsx .agent/skills/frontend-audit/scripts/audit.ts
```
*(Sa Windows PowerShell: `npx.cmd tsx .agent/skills/frontend-audit/scripts/audit.ts`)*

### O idagdag sa iyong `package.json`:
```json
{
  "scripts": {
    "audit:frontend": "tsx .agent/skills/frontend-audit/scripts/audit.ts"
  }
}
```
Tapos patakbuhin:
```bash
npm run audit:frontend
```

---

## 🧭 Ano ang Ginagawa ng Engine? (`docs/frontend-atlas/`)

Pagka-run ng audit, kusa itong lilikha ng 5 structured Markdown files sa folder na `docs/frontend-atlas/`:

```
your-project/
└── docs/
    └── frontend-atlas/
        ├── 01_ROUTES_AND_PANELS_MAP.md     # 🗺️ Bawat URL nakakabit sa Page file at Components
        ├── 02_COMPONENT_INVENTORY.md       # 🔘 Catalog ng lahat ng Buttons, Modals, at Cards
        ├── 03_DESIGN_TOKENS_AND_COLORS.md  # 🎨 Official Tokens vs Hardcoded Hex Drift
        ├── 04_UI_ISLANDS_AND_DRIFT.md      # 🏝️ Listahan ng mga lumilihis na custom styling
        └── README.md                       # 📊 Platform overview at statistics dashboard
```

### 1. `01_ROUTES_AND_PANELS_MAP.md` (Instant GPS)
* Nakalista ang bawat URL route (hal. `/`, `/admin/orders`, `/portal/wallet`), kung aling `page.tsx`/`App.jsx` ang nagpapatakbo nito, at kung aling components ang naka-import.
* **Tulong**: Kapag sinabi mong *"Ayusin ang Hero"*, alam agad ng AI kung aling file ang bubuksan sa 1 segundo lang.

### 2. `02_COMPONENT_INVENTORY.md` (Button & Element Catalog)
* Binibilang kung ilan ang standard `<Button>` components vs raw `<button>` HTML tags.
* May direct clickable links at line numbers (hal. `src/App.jsx:503`) para mabilis mai-standardize ang lahat ng interactive buttons.

### 3. `03_DESIGN_TOKENS_AND_COLORS.md` (Zero-Missed-Colors Ledger)
* Inaalam kung aling hex codes ang pinakamadalas lumitaw sa codebase na hindi nakatali sa Tailwind config.
* Kapag nagbago ka ng brand color, dito titingin para siguruhing **walang maiiwang file**.

### 4. `04_UI_ISLANDS_AND_DRIFT.md` (Actionable Fixes)
* Nililista ang mga duplicate modal structures, inline `style={{...}}` tags, at divergent styles na dapat unahin para maging 100% consistent ang frontend.

---

## 🌐 Universal Framework Compatibility

Gumagana ito kahit anong tech stack ang gamit mo:
* ✅ **Next.js App Router** (`app/**/page.tsx`)
* ✅ **Next.js Pages Router** (`pages/**/*.tsx`)
* ✅ **Vite + React SPAs** (`src/App.jsx`, `src/main.jsx`)
* ✅ **Tailwind CSS** (Auto-extracts custom palette tokens from `tailwind.config.*`)
* ✅ **TypeScript & JavaScript** (`.tsx`, `.jsx`, `.ts`, `.js`)

---

## 🤖 Paano Ito Nakikipagtulungan sa Ibang Skills

Nagsisilbi itong foundational index para sa iba pang popular frontend skills:

| Skill | Paano Sila Nagtutulungan |
| :--- | :--- |
| **`frontend-audit`** | **Ang GPS at Inventory**: Sinasabi kung *nasaan* ang bawat button, route, at kulay sa code. |
| **`ui-ux-pro-max`** | Ginagamit ang color audit list para mag-apply ng tamang design token hierarchy at typography scale. |
| **`emil-design-eng`** | Ginagamit ang button inventory para lagyan ng spring micro-interactions ang lahat ng buttons. |
| **`impeccable`** | Ginagamit ang UI islands list para i-harden ang form states at accessibility (a11y). |

---

## 🛡️ CI/CD & Safe Versioning (GitHub Actions)

Naka-setup ang repository na may:
1. **Automated CI Workflow (`.github/workflows/ci.yml`)**: Tumatakbo sa bawat Pull Request para masigurong pumapasa ang TypeScript compilation at smoke test bago i-merge.
2. **Automated GitHub Releases (`.github/workflows/release.yml`)**: Awtomatikong gumagawa ng release notes at tags (`v1.0.1`, `v1.1.0`) kapag nag-release ng bagong update sa `main`.
3. **Pull Request Template (`.github/pull_request_template.md`)**: Tinitiyak na may checklist bago i-merge ang anumang update para maiwasan ang regressions at madaling makapag-rollback kung kinakailangan.

---

## 📄 License

MIT License © 2026 EURIE
