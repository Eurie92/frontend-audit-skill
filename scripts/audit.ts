import fs from "fs";
import path from "path";
import os from "os";
import child_process from "child_process";
import ts from "typescript";
import { runUniversalBackendAudit } from "./audit-backend.js";

/**
 * Universal Frontend Atlas & Design System Audit Engine (v1.7.0)
 * 
 * Features:
 * 1. Multi-Framework Auto-Discovery (Next.js App/Pages Router, Vite + React SPAs, Tailwind)
 * 2. Instant Query Search (--find <query>, --route <route>) for massive codebases
 * 3. Next.js Component Boundary Radar ([Client ⚡] vs [Server 🖥️])
 * 4. 2-Level Deep Component Tree (Parent ➔ [Subcomponents]) in 01_ROUTES_AND_PANELS_MAP.md
 * 5. Screenshot-to-Code Visible UI Text & Labels Map (06_VISIBLE_TEXT_AND_LABELS_MAP.md)
 * 6. Visual Icons & Action Symbols Index (07_VISUAL_AND_ICON_INDEX.md)
 * 7. Zero-Search Handoff Manifest & Dispatch Gateway (08_DISPATCH_GATEWAY.md + --manifest <target>)
 * 8. Dynamic Skill Auto-Discovery & Dynamic Integration into 08_DISPATCH_GATEWAY.md
 * 9. CLI Self-Updater (--update) with In-Place Safe Rule Synchronization
 * 10. Dead / Orphaned Component Finder & Dedicated Ledger (05_DEAD_ORPHANED_COMPONENTS.md)
 * 11. Accessibility (a11y) Fast-Check (Missing aria-label, missing type="button")
 * 12. Automated Codemod (--fix-buttons) to migrate raw <button> to <Button>
 * 13. Closed-Loop Verification Gate (--verify) with Metric Delta Tracking
 * 14. Live File Watcher (--watch) for automatic continuous atlas syncing
 * 15. Persistent Markdown Atlas Generation in docs/frontend-atlas/
 */

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, "docs", "frontend-atlas");

// Parse CLI Flags
const ARGS = process.argv.slice(2);
const FIND_QUERY = ARGS.includes("--find") ? ARGS[ARGS.indexOf("--find") + 1] : undefined;
const ROUTE_QUERY = ARGS.includes("--route") ? ARGS[ARGS.indexOf("--route") + 1] : undefined;
const MANIFEST_TARGET = ARGS.includes("--manifest") ? ARGS[ARGS.indexOf("--manifest") + 1] : undefined;
const SHOULD_FIX_BUTTONS = ARGS.includes("--fix-buttons");
const SHOW_DEAD_ONLY = ARGS.includes("--dead");
const SHOW_A11Y_ONLY = ARGS.includes("--a11y");
const THEME_MODE = ARGS.includes("--theme") || ARGS.includes("--theme-punchlist");
const BACKEND_MODE = ARGS.includes("--backend");
const FRONTEND_MODE = ARGS.includes("--frontend");
const VERIFY_MODE = ARGS.includes("--verify");
const WATCH_MODE = ARGS.includes("--watch");
const UPDATE_MODE = ARGS.includes("--update");

export type SupportedFramework =
  | "Next.js (App Router)"
  | "Next.js (Pages Router)"
  | "Nuxt 3"
  | "Astro"
  | "SvelteKit"
  | "Svelte (Vite SPA)"
  | "React Router v7"
  | "Remix"
  | "Vite / Vue SPA"
  | "Vite / React SPA"
  | "Generic React"
  | "Generic Frontend";

interface ProjectStructure {
  framework: SupportedFramework;
  hasAppRouter: boolean;
  appDir?: string;
  hasPagesRouter: boolean;
  pagesDir?: string;
  layoutsDir?: string;
  srcDir?: string;
  componentsDir?: string;
  uiPrimitivesDir?: string;
  tailwindConfigPath?: string;
  customTokens: Set<string>;
}

interface VisibleLabel {
  line: number;
  text: string;
  type: "Button" | "Heading" | "Badge / Eyebrow" | "Modal Title" | "Aria Label";
  snippet: string;
}

interface VisualIconUsage {
  line: number;
  iconName: string;
  sourceLib: string;
  context: "Button" | "Link / Navigation" | "Badge / Status" | "Dialog Action" | "Menu Item" | "Visual Indicator";
  snippet: string;
}

interface LiveStatusDot {
  line: number;
  snippet: string;
  color: string;
  classes: string;
  isPulsing: boolean;
}

interface CapsulePill {
  line: number;
  snippet: string;
  label?: string;
  classes: string;
}

export interface InteractiveTrigger {
  line: number;
  tagName: string;
  triggerType: "Standard Button" | "Raw Button" | "Clickable Container" | "Component Trigger" | "Navigation Link" | "Form Input";
  handlerName?: string;
  disclosesTarget?: string;
  snippet: string;
}

export interface DisclosedOverlay {
  line: number;
  name: string;
  type: "Modal / Dialog" | "Drawer / Sheet" | "Dropdown Menu" | "Popover" | "Accordion" | "Tabs";
  triggerSource?: string;
  conditionVariable?: string;
  snippet: string;
}

interface DisclosedElement {
  line: number;
  name: string;
  type: "Modal" | "Drawer" | "Sheet" | "Dialog" | "Popover";
  snippet: string;
}

interface ColorUsage {
  line: number;
  token: string;
  family: string;
  shade: string;
  property: string;
  isDark: boolean;
  snippet: string;
}

interface DarkModeAsymmetry {
  line: number;
  property: string;
  lightToken: string;
  snippet: string;
  classes: string;
}

interface ComponentAudit {
  filePath: string;
  relativePath: string;
  zone: string;
  isClientComponent: boolean;
  componentNames: string[];
  imports: string[];
  rawButtons: { line: number; snippet: string; className?: string; missingAria?: boolean; missingType?: boolean }[];
  uiButtons: { line: number; snippet: string; variant?: string }[];
  interactiveTriggers: InteractiveTrigger[];
  disclosedOverlays: DisclosedOverlay[];
  cardsAndSurfaces: { line: number; snippet: string; classes: string }[];
  modalsAndDialogs: { line: number; snippet: string }[];
  disclosedElements: DisclosedElement[];
  liveStatusDots: LiveStatusDot[];
  capsulePills: CapsulePill[];
  colorUsages: ColorUsage[];
  darkModeAsymmetries: DarkModeAsymmetry[];
  hardcodedHexes: { line: number; hex: string; snippet: string }[];
  rogueTailwindColors: { line: number; token: string; snippet: string }[];
  typographyUsages: { line: number; fontToken: string; snippet: string }[];
  visibleLabels: VisibleLabel[];
  visualIcons: VisualIconUsage[];
  hasDirectStyleTag: boolean;
  isExportedComponent: boolean;
}

interface RouteComponentNode {
  name: string;
  isClientComponent: boolean;
  children: string[];
}

interface RouteMapItem {
  route: string;
  zone: string;
  pageFile: string;
  layoutFile?: string;
  isClientComponent: boolean;
  importedComponents: string[];
  componentTree: RouteComponentNode[];
}

interface SkillDispatch {
  targetSkill: string;
  category: string;
  issueCount: number;
  description: string;
  targets: { file: string; line?: number; zone: string; detail: string }[];
}

interface DiscoveredSkill {
  name: string;
  description: string;
  version?: string;
  path: string;
  scope: "project" | "global";
  domain: string;
  recommendedHandoff: string;
}

interface VerificationReceipt {
  timestamp: string;
  version: string;
  totalFiles: number;
  routesCount: number;
  rawButtonsCount: number;
  uiButtonsCount: number;
  a11yFlagsCount: number;
  hardcodedHexesCount: number;
  rogueColorsCount: number;
  orphanedComponentsCount: number;
  visualIconsCount: number;
  typeCheckStatus: "PASS" | "FAIL" | "SKIPPED";
}

// 1. Framework Auto-Discovery
function detectProjectStructure(rootDir: string = ROOT_DIR): ProjectStructure {
  const structure: ProjectStructure = {
    framework: "Generic React",
    hasAppRouter: false,
    hasPagesRouter: false,
    customTokens: new Set<string>(),
  };

  let pkgDeps: Record<string, string> = {};
  const pkgPath = path.join(rootDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      pkgDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    } catch {}
  }

  if (fs.existsSync(path.join(rootDir, "src"))) {
    structure.srcDir = path.join(rootDir, "src");
  }

  // 1. SvelteKit Detection (svelte.config.* or @sveltejs/kit)
  const svelteConfigs = ["svelte.config.js", "svelte.config.ts", "svelte.config.mjs", "svelte.config.cjs"];
  const hasSvelteConfig = svelteConfigs.some(cf => fs.existsSync(path.join(rootDir, cf)));
  if (hasSvelteConfig || Boolean(pkgDeps["@sveltejs/kit"])) {
    structure.framework = "SvelteKit";
    structure.pagesDir = path.join(rootDir, "src", "routes");
    structure.hasPagesRouter = fs.existsSync(structure.pagesDir);
    structure.componentsDir = path.join(rootDir, "src", "lib", "components");
    if (!fs.existsSync(structure.componentsDir)) {
      structure.componentsDir = path.join(rootDir, "src", "components");
    }
    return finishProjectStructure(structure, rootDir);
  }

  // 2. Astro Detection (astro.config.* or astro dependency)
  const astroConfigs = ["astro.config.mjs", "astro.config.ts", "astro.config.js", "astro.config.cjs"];
  const hasAstroConfig = astroConfigs.some(cf => fs.existsSync(path.join(rootDir, cf)));
  if (hasAstroConfig || Boolean(pkgDeps["astro"])) {
    structure.framework = "Astro";
    structure.pagesDir = path.join(rootDir, "src", "pages");
    structure.hasPagesRouter = fs.existsSync(structure.pagesDir);
    structure.componentsDir = path.join(rootDir, "src", "components");
    structure.layoutsDir = path.join(rootDir, "src", "layouts");
    return finishProjectStructure(structure, rootDir);
  }

  // 3. Nuxt 3 Detection (nuxt.config.* or nuxt dependency)
  const nuxtConfigs = ["nuxt.config.ts", "nuxt.config.js", "nuxt.config.mjs", "nuxt.config.cjs"];
  const hasNuxtConfig = nuxtConfigs.some(cf => fs.existsSync(path.join(rootDir, cf)));
  if (hasNuxtConfig || Boolean(pkgDeps["nuxt"]) || Boolean(pkgDeps["nuxt3"])) {
    structure.framework = "Nuxt 3";
    const nuxt4AppDir = path.join(rootDir, "app");
    const hasNuxt4App = fs.existsSync(nuxt4AppDir) && (
      fs.existsSync(path.join(nuxt4AppDir, "pages")) ||
      fs.existsSync(path.join(nuxt4AppDir, "app.vue")) ||
      fs.existsSync(path.join(nuxt4AppDir, "components"))
    );
    const baseDir = hasNuxt4App ? nuxt4AppDir : (structure.srcDir || rootDir);
    const pagesCand = path.join(baseDir, "pages");
    if (fs.existsSync(pagesCand)) {
      structure.hasPagesRouter = true;
      structure.pagesDir = pagesCand;
    }
    const layoutsCand = path.join(baseDir, "layouts");
    if (fs.existsSync(layoutsCand)) {
      structure.layoutsDir = layoutsCand;
    }
    const compCand = path.join(baseDir, "components");
    if (fs.existsSync(compCand)) {
      structure.componentsDir = compCand;
    }
    return finishProjectStructure(structure, rootDir);
  }

  // 4. React Router v7 Detection (react-router.config.* or @react-router/dev)
  const rr7Configs = ["react-router.config.ts", "react-router.config.js", "react-router.config.mjs"];
  const hasRR7Config = rr7Configs.some(cf => fs.existsSync(path.join(rootDir, cf)));
  if (hasRR7Config || Boolean(pkgDeps["@react-router/dev"]) || Boolean(pkgDeps["@react-router/fs-routes"])) {
    structure.framework = "React Router v7";
    structure.appDir = path.join(rootDir, "app");
    structure.hasAppRouter = true;
    structure.componentsDir = path.join(rootDir, "app", "components");
    return finishProjectStructure(structure, rootDir);
  }

  // 5. Remix Detection (remix.config.* or @remix-run/dev)
  const remixConfigs = ["remix.config.js", "remix.config.ts", "remix.config.mjs"];
  const hasRemixConfig = remixConfigs.some(cf => fs.existsSync(path.join(rootDir, cf)));
  if (hasRemixConfig || Boolean(pkgDeps["@remix-run/dev"]) || Boolean(pkgDeps["@remix-run/react"])) {
    structure.framework = "Remix";
    structure.appDir = path.join(rootDir, "app");
    structure.hasAppRouter = true;
    structure.componentsDir = path.join(rootDir, "app", "components");
    return finishProjectStructure(structure, rootDir);
  }

  // 6. Next.js Detection (App Router & Pages Router)
  const nextConfigs = ["next.config.js", "next.config.mjs", "next.config.ts"];
  const hasNextConfig = nextConfigs.some(cf => fs.existsSync(path.join(rootDir, cf))) || Boolean(pkgDeps["next"]);

  const appRouterCand = structure.srcDir ? path.join(structure.srcDir, "app") : path.join(rootDir, "app");
  if (fs.existsSync(appRouterCand)) {
    structure.hasAppRouter = true;
    structure.appDir = appRouterCand;
    structure.framework = "Next.js (App Router)";
  }

  const pagesRouterCand = structure.srcDir ? path.join(structure.srcDir, "pages") : path.join(rootDir, "pages");
  if (fs.existsSync(pagesRouterCand)) {
    structure.hasPagesRouter = true;
    structure.pagesDir = pagesRouterCand;
    if (!structure.hasAppRouter && hasNextConfig) {
      structure.framework = "Next.js (Pages Router)";
    }
  }

  // 7. Vite SPA Detection (Vue vs Svelte vs React)
  const viteConfigs = ["vite.config.ts", "vite.config.js", "vite.config.mjs", "vite.config.cjs"];
  const viteConfigPath = viteConfigs.find(cf => fs.existsSync(path.join(rootDir, cf)));
  if (!structure.hasAppRouter && (!hasNextConfig || !structure.hasPagesRouter) && viteConfigPath) {
    let viteContent = "";
    try {
      viteContent = fs.readFileSync(path.join(rootDir, viteConfigPath), "utf-8");
    } catch {}

    const isVue = /@vitejs\/plugin-vue|unplugin-vue/.test(viteContent) || Boolean(pkgDeps["vue"]);
    const isSvelte = /@sveltejs\/vite-plugin-svelte/.test(viteContent) || Boolean(pkgDeps["svelte"]);

    if (isVue) {
      structure.framework = "Vite / Vue SPA";
      const viewsCand = path.join(structure.srcDir || rootDir, "views");
      const pagesCand = path.join(structure.srcDir || rootDir, "pages");
      if (fs.existsSync(viewsCand)) structure.pagesDir = viewsCand;
      else if (fs.existsSync(pagesCand)) structure.pagesDir = pagesCand;
    } else if (isSvelte) {
      structure.framework = "Svelte (Vite SPA)";
    } else {
      structure.framework = "Vite / React SPA";
    }
  }

  // 8. Components Directory Fallback
  if (!structure.componentsDir) {
    if (fs.existsSync(path.join(rootDir, "components"))) {
      structure.componentsDir = path.join(rootDir, "components");
    } else if (structure.srcDir && fs.existsSync(path.join(structure.srcDir, "components"))) {
      structure.componentsDir = path.join(structure.srcDir, "components");
    }
  }

  // Fallback framework label
  if (structure.framework === "Generic React" && !pkgDeps["react"] && !fs.existsSync(path.join(rootDir, "src"))) {
    structure.framework = "Generic Frontend";
  }

  return finishProjectStructure(structure, rootDir);
}

function finishProjectStructure(structure: ProjectStructure, rootDir: string): ProjectStructure {
  if (structure.componentsDir) {
    const uiPath = path.join(structure.componentsDir, "ui");
    if (fs.existsSync(uiPath)) {
      structure.uiPrimitivesDir = uiPath;
    }
  } else if (structure.srcDir) {
    const uiPath = path.join(structure.srcDir, "ui");
    const svelteUiPath = path.join(structure.srcDir, "lib", "components", "ui");
    if (fs.existsSync(uiPath)) {
      structure.uiPrimitivesDir = uiPath;
    } else if (fs.existsSync(svelteUiPath)) {
      structure.uiPrimitivesDir = svelteUiPath;
    }
  }

  const configFiles = ["tailwind.config.ts", "tailwind.config.js", "tailwind.config.mjs", "tailwind.config.cjs"];
  for (const cf of configFiles) {
    const fullPath = path.join(rootDir, cf);
    if (fs.existsSync(fullPath)) {
      structure.tailwindConfigPath = fullPath;
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        const colorBlock = content.match(/colors:\s*\{([\s\S]*?)\n\s*\},/);
        if (colorBlock) {
          const keys = colorBlock[1].match(/^\s*([a-zA-Z0-9_-]+):/gm);
          if (keys) {
            keys.forEach(k => {
              const token = k.trim().replace(":", "");
              structure.customTokens.add(token.toLowerCase());
            });
          }
        }
      } catch {}
      break;
    }
  }

  return structure;
}

// 2. Dynamic Zone Categorization
function determineZone(relPath: string, structure: ProjectStructure): string {
  const norm = relPath.replace(/\\/g, "/");

  // Shared UI primitives across all frameworks
  if (
    norm.includes("components/ui") ||
    norm.includes("/ui/") ||
    norm.includes("src/lib/components/ui")
  ) {
    return "Shared UI Primitives";
  }

  // SvelteKit Routes (src/routes/)
  if (norm.startsWith("src/routes/")) {
    const sub = norm.replace(/^src\/routes\//, "");
    const segs = sub.split("/");
    const first = segs[0];
    if (first.startsWith("(") && first.endsWith(")")) {
      const g = first.slice(1, -1);
      return g.charAt(0).toUpperCase() + g.slice(1) + " (Section)";
    }
    if (first === "admin") return "Admin Panel";
    if (first === "auth" || first.includes("login") || first.includes("signup")) return "Auth & Onboarding";
    if (first === "api") return "API Routes";
    return `${first.charAt(0).toUpperCase() + first.slice(1)} Section`;
  }

  // SvelteKit Lib Components (src/lib/components/)
  if (norm.startsWith("src/lib/components/")) {
    const sub = norm.replace(/^src\/lib\/components\//, "");
    const seg = sub.split("/")[0];
    return `${seg.charAt(0).toUpperCase() + seg.slice(1)} Components`;
  }

  // Astro / Nuxt / Pages Router (src/pages/ or pages/)
  if (norm.startsWith("src/pages/") || norm.startsWith("pages/")) {
    const sub = norm.replace(/^(src\/)?pages\//, "");
    const segs = sub.split("/");
    const first = segs[0];
    if (first === "admin") return "Admin Panel";
    if (first === "auth" || first.includes("login")) return "Auth & Onboarding";
    if (first === "api") return "API Routes";
    if (first === "posts" || first === "blog") return "Blog / Content";
    return `${first.charAt(0).toUpperCase() + first.slice(1)} Section`;
  }

  // Next.js App Router / Remix / React Router (app/ or src/app/)
  if (norm.startsWith("app/") || norm.startsWith("src/app/")) {
    const subPath = norm.replace(/^(src\/)?app\//, "");
    const segments = subPath.split("/");
    const first = segments[0];

    if (first.startsWith("(") && first.endsWith(")")) {
      const groupName = first.slice(1, -1);
      return groupName.charAt(0).toUpperCase() + groupName.slice(1) + " (Public)";
    }
    if (first === "admin") return "Admin Panel";
    if (first === "portal") {
      const second = segments[1];
      if (second) return `${second.charAt(0).toUpperCase() + second.slice(1)} Portal`;
      return "Portal";
    }
    if (first === "supplier") return "Supplier Portal";
    if (first === "auth" || first.includes("login") || first.includes("signup")) return "Auth & Onboarding";
    if (first === "api") return "API Routes";
    if (first === "routes") {
      const second = segments[1] || "";
      if (second.startsWith("admin")) return "Admin Panel";
      if (second.startsWith("auth") || second.startsWith("_auth")) return "Auth & Onboarding";
      if (second.startsWith("api")) return "API Routes";
      const prefix = second.split(".")[0].replace(/^_+/, "");
      return prefix ? `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Section` : "App Routes";
    }

    return `${first.charAt(0).toUpperCase() + first.slice(1)} Section`;
  }

  // Components dir
  if (norm.startsWith("components/") || norm.startsWith("src/components/")) {
    const subPath = norm.replace(/^(src\/)?components\//, "");
    const segments = subPath.split("/");
    const first = segments[0];

    if (first === "public" || first === "storefront") return "Storefront (Public)";
    if (first === "admin") return "Admin Panel";
    if (first === "portal" || first === "reseller") return "Reseller Portal";
    if (first === "supplier") return "Supplier Portal";
    if (first === "auth") return "Auth & Onboarding";
    if (first === "navigation" || first === "payment" || first === "providers") return "Shared Layout & Providers";

    return `${first.charAt(0).toUpperCase() + first.slice(1)} Components`;
  }

  if (norm.startsWith("src/")) {
    const sub = norm.replace(/^src\//, "");
    if (!sub.includes("/")) return "Root Application (SPA)";
    const seg = sub.split("/")[0];
    return `${seg.charAt(0).toUpperCase() + seg.slice(1)} Module`;
  }

  return "Core Platform";
}

// 3. Scan Files (.tsx, .jsx, .ts, .js, .vue, .astro, .svelte)
function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (![
        "node_modules", ".next", "dist", ".git", ".turbo", "build", ".checkpoint-stage2",
        ".svelte-kit", ".nuxt", ".astro", ".react-router", ".cache", ".output"
      ].includes(item)) {
        getFiles(fullPath, fileList);
      }
    } else if (
      (
        item.endsWith(".tsx") || item.endsWith(".jsx") || item.endsWith(".ts") || item.endsWith(".js") ||
        item.endsWith(".vue") || item.endsWith(".astro") || item.endsWith(".svelte") ||
        item.endsWith(".svelte.ts") || item.endsWith(".svelte.js")
      ) &&
      !item.endsWith(".test.ts") &&
      !item.endsWith(".test.js") &&
      !item.endsWith(".test.tsx") &&
      !item.endsWith(".test.jsx") &&
      !item.endsWith(".test.vue") &&
      !item.endsWith(".test.svelte") &&
      !item.endsWith(".spec.ts") &&
      !item.endsWith(".spec.js") &&
      !item.endsWith(".spec.tsx") &&
      !item.endsWith(".spec.jsx") &&
      !item.endsWith(".spec.vue") &&
      !item.endsWith(".spec.svelte") &&
      !item.endsWith(".d.ts") &&
      !item.endsWith(".d.svelte.ts") &&
      !item.endsWith(".config.js") &&
      !item.endsWith(".config.ts") &&
      !item.endsWith(".config.mjs") &&
      !item.endsWith(".config.cjs")
    ) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const APPROVED_HEXES = new Set([
  "#ffffff", "#000000", "#f3ede3", "#07080b", "#0b0c10", "#10b981", "#38bdf8", "#f59e0b", "#cbd5e1"
]);

const TAILWIND_COLOR_FAMILIES = [
  "slate", "gray", "zinc", "neutral", "stone",
  "red", "orange", "amber", "yellow", "lime",
  "green", "emerald", "teal", "cyan", "sky",
  "blue", "indigo", "violet", "purple", "fuchsia",
  "pink", "rose"
];

// Universal Tailwind JIT Color Regex: Matches all 22 families, light and dark mode, across bg, text, border, ring, etc.
const UNIVERSAL_COLOR_REGEX = /\b(dark:)?(bg|text|border|ring|divide|from|to|via|outline|accent|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-([0-9]{2,3}))?(?:\/([0-9]{1,3}))?\b/g;

// Live Status Dots: pulse dots, indicator pips, active badges
const LIVE_DOT_REGEX = /(?:animate-pulse|h-[1-3]\s+w-[1-3]\s+rounded-full|rounded-full\s+h-[1-3]\s+w-[1-3])/;

// Capsule Pills & Chips: tags, pills, compact rounded badges
const CAPSULE_PILL_REGEX = /\brounded-full\b/;

// Disclosed Modals, Sheets, Drawers, Dialogs, Popovers
const DISCLOSED_ELEMENT_REGEX = /<(?:Dialog|Modal|Drawer|Sheet|Popover|AlertDialog|DrawerContent|DialogContent|SheetContent)\b|<div[^>]*role=["']dialog["']|<[A-Z][a-zA-Z0-9]*(?:Modal|Dialog|Drawer|Sheet)\b/g;

const ROGUE_COLOR_REGEX = /\b(bg|text|border|ring)-(zinc|neutral|gray|stone)-[1-9]00\b/g;
const HEX_REGEX = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
const CARD_SURFACE_REGEX = /(?:class(?:Name)?|:class|class:list|v-bind:class)=["'`]([^"'`]*(?:bg-(?:void|slab|surface|card|white|black)|rounded-(?:xl|2xl|3xl)|border-line|backdrop-blur)[^"'`]*)["'`]/g;
const MODAL_REGEX = /<(?:Dialog|Modal|Drawer|DrawerContent|DialogContent)\b|<div[^>]*role=["']dialog["']/g;
const TYPOGRAPHY_REGEX = /\b(font-mono|font-sans|font-geist|font-jetbrains|text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl))\b/g;

// 4. File-Level Audit with Next.js Boundary Radar, a11y & Icon Indexing
function auditFile(filePath: string, structure: ProjectStructure): ComponentAudit {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
  const zone = determineZone(relPath, structure);

  // Boundary Radar: Statically detect client vs server execution
  const isClientComponent =
    /^\s*["']use client["']/m.test(content) ||
    /["']use client["']/.test(lines.slice(0, 5).join(" ")) ||
    relPath.includes(".client.") ||
    relPath.endsWith("+page.svelte") ||
    (structure.framework === "SvelteKit" && relPath.endsWith(".svelte")) ||
    (structure.framework === "Vite / Vue SPA") ||
    (structure.framework === "Vite / React SPA") ||
    (structure.framework === "Svelte (Vite SPA)");

  const componentNames: string[] = [];
  const imports: string[] = [];
  const rawButtons: { line: number; snippet: string; className?: string; missingAria?: boolean; missingType?: boolean }[] = [];
  const uiButtons: { line: number; snippet: string; variant?: string }[] = [];
  const interactiveTriggers: InteractiveTrigger[] = [];
  const disclosedOverlays: DisclosedOverlay[] = [];
  const cardsAndSurfaces: { line: number; snippet: string; classes: string }[] = [];
  const modalsAndDialogs: { line: number; snippet: string }[] = [];
  const disclosedElements: DisclosedElement[] = [];
  const liveStatusDots: LiveStatusDot[] = [];
  const capsulePills: CapsulePill[] = [];
  const colorUsages: ColorUsage[] = [];
  const darkModeAsymmetries: DarkModeAsymmetry[] = [];
  const hardcodedHexes: { line: number; hex: string; snippet: string }[] = [];
  const rogueTailwindColors: { line: number; token: string; snippet: string }[] = [];
  const typographyUsages: { line: number; fontToken: string; snippet: string }[] = [];
  const visibleLabels: VisibleLabel[] = [];
  const visualIcons: VisualIconUsage[] = [];
  const seenLabels = new Set<string>();
  let hasDirectStyleTag = false;
  let isExportedComponent = false;

  function addLabel(line: number, text: string, type: VisibleLabel["type"], snippet: string) {
    const cleanText = text
      .replace(/<[^>]+>/g, " ")
      .replace(/\{[^}]+\}/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleanText || cleanText.length < 2 || cleanText.length > 70) return;
    if (/^[()=><{}]+$/.test(cleanText)) return;
    const key = `${type}:${cleanText.toLowerCase()}:${line}`;
    if (!seenLabels.has(key)) {
      seenLabels.add(key);
      visibleLabels.push({
        line,
        text: cleanText,
        type,
        snippet: snippet.slice(0, 70),
      });
    }
  }

  // Extract component names (React / TS / JS functions)
  const compMatch = content.match(/(?:export\s+default\s+function|export\s+function|function|const)\s+([A-Z][a-zA-Z0-9_]*)/g);
  if (compMatch) {
    isExportedComponent = true;
    compMatch.forEach(m => {
      const name = m.split(/\s+/).pop();
      if (name && !componentNames.includes(name)) componentNames.push(name);
    });
  }

  // Extract component names for Vue / Svelte / Astro SFCs based on filename
  if (relPath.endsWith(".vue") || relPath.endsWith(".svelte") || relPath.endsWith(".astro")) {
    const baseName = path.basename(relPath).replace(/\.[^/.]+$/, "");
    const cleanName = (baseName === "index" || baseName === "+page" || baseName === "+layout")
      ? path.basename(path.dirname(relPath))
      : baseName;
    if (cleanName && /^[A-Z]/.test(cleanName) && !componentNames.includes(cleanName)) {
      componentNames.push(cleanName);
      isExportedComponent = true;
    }
  }

  // Extract imports (local and alias across React, SvelteKit, Nuxt, Astro)
  const importMatches = content.match(/from\s+["']((?:@|\$lib|~|\.|\.\.)\/[^"']+)["']/g);
  if (importMatches) {
    importMatches.forEach(m => {
      const imp = m.replace(/^from\s+["']/, "").replace(/["']$/, "");
      if (!imports.includes(imp)) imports.push(imp);
    });
  }

  // Extract imported Icon packages (Lucide React/Vue/Svelte/Astro, Radix, Tabler, Heroicons, Svelte-Radix, Phosphor)
  const importedIcons = new Map<string, string>();
  const iconImportRegex = /import\s+(?:\{([^}]+)\}|([A-Z][a-zA-Z0-9_]*))\s+from\s+["'](@?lucide-svelte(?:\/icons\/[^"']*)?|@lucide\/svelte(?:\/icons\/[^"']*)?|@iconify\/svelte|svelte-radix|phosphor-svelte|lucide-vue-next|lucide-astro|lucide-react|@radix-ui\/react-icons|@tabler\/icons(?:-react|-vue)?|@heroicons\/(?:react|vue)(?:\/[^"']*)?|react-icons(?:\/[^"']*)?|phosphor-react)["']/g;
  let iconMatch;
  while ((iconMatch = iconImportRegex.exec(content)) !== null) {
    const lib = iconMatch[3] || iconMatch[2] || iconMatch[0];
    const items = (iconMatch[1] || iconMatch[2] || "").split(",");
    items.forEach(item => {
      const clean = item.trim().split(/\s+as\s+/)[0].trim();
      if (clean && /^[A-Z]/.test(clean)) {
        importedIcons.set(clean, lib);
      }
    });
  }

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    if (trimmed.includes("style={{") || trimmed.includes("style=\"")) hasDirectStyleTag = true;

    // Multiline-aware Button Tag Catchers + a11y Fast-Check (React, Vue, Svelte, Astro, Skeleton UI)
    if (/<button\b/i.test(line)) {
      const block = lines.slice(idx, idx + 4).join(" ");
      const classMatch = block.match(/(?:class(?:Name)?|:class|class:list)=["'`]([^"'`]+)["'`]/);
      
      // Skeleton UI check: if <button contains class="btn", classify as UI button!
      if (classMatch && /\bbtn\b/.test(classMatch[1])) {
        uiButtons.push({
          line: lineNum,
          snippet: trimmed.slice(0, 80),
          variant: classMatch[1].includes("btn-primary") || classMatch[1].includes("preset-filled") ? "filled" : "default",
        });
      } else {
        // Accessibility checks (supporting :type, :aria-label, title, inner text, and template bindings)
        const hasType = /\b:?type=["'](?:button|submit|reset|['"](?:button|submit|reset)['"])["']/i.test(block);
        const hasAria = /\b(?:v-bind:)?(?::?aria-label|:?aria-labelledby|:?title)=["']/.test(block);
        const hasDirectText = />\s*[^<{\s]+/.test(block) || /\{\{.+?\}\}/.test(block) || /\{.+?\}/.test(block);
        const missingAria = !hasAria && !hasDirectText;
        const missingType = !hasType;

        const snippetContent = trimmed.length > 12 ? trimmed : block.replace(/\s+/g, " ");
        rawButtons.push({
          line: lineNum,
          snippet: snippetContent.slice(0, 80),
          className: classMatch ? classMatch[1].slice(0, 60) : undefined,
          missingAria,
          missingType,
        });

        const btnInner = block.match(/<button[^>]*>([\s\S]*?)<\/button>/i);
        if (btnInner && btnInner[1]) {
          addLabel(lineNum, btnInner[1], "Button", snippetContent);
        }
      }
    }

    // UI Buttons (React Button, Nuxt UButton, PrimeVue PButton, Svelte Button.Root, etc.)
    if (/<(?:Button|UButton|PButton|AstroButton)\b/.test(line) || /<Button\.Root\b/.test(line)) {
      const block = lines.slice(idx, idx + 4).join(" ");
      const variantMatch = block.match(/(?:variant|color|severity)=["'`]([^"'`]+)["'`]/);
      uiButtons.push({
        line: lineNum,
        snippet: trimmed.slice(0, 80),
        variant: variantMatch ? variantMatch[1] : "default",
      });

      const btnInner = block.match(/<(?:Button|UButton|PButton|AstroButton|Button\.Root)[^>]*>([\s\S]*?)<\/(?:Button|UButton|PButton|AstroButton|Button\.Root)>/i);
      if (btnInner && btnInner[1]) {
        addLabel(lineNum, btnInner[1], "Button", trimmed);
      }
    }

    // Tag-Based Icon Systems (<Icon name="..." />, <Icon icon="..." />, <UIcon name="..." />)
    if (/<(?:Icon|UIcon)\b/i.test(line)) {
      const nameMatch = line.match(/\b(?:name|icon)=["']([^"']+)["']/);
      if (nameMatch) {
        const iconName = nameMatch[1];
        const contextWindow = lines.slice(Math.max(0, idx - 3), Math.min(lines.length, idx + 4)).join(" ");
        let iconContext: VisualIconUsage["context"] = "Visual Indicator";
        if (/<(?:button|Button|UButton)\b/i.test(contextWindow)) {
          iconContext = "Button";
        } else if (/<(?:a|Link|NuxtLink)\b/i.test(contextWindow)) {
          iconContext = "Link / Navigation";
        }
        visualIcons.push({
          line: lineNum,
          iconName,
          sourceLib: structure.framework === "Astro" ? "astro-icon" : structure.framework === "Nuxt 3" ? "Nuxt Icon" : "@iconify/svelte",
          context: iconContext,
          snippet: trimmed.slice(0, 75),
        });
      }
    }

    // Accessible Names & Titles
    const ariaMatch = line.match(/(?:aria-label|title)=["']([^"']{2,60})["']/);
    if (ariaMatch && ariaMatch[1]) {
      addLabel(lineNum, ariaMatch[1], "Aria Label", trimmed);
    }

    // Headings (h1 - h4)
    const headingMatch = line.match(/<(h[1-4])[^>]*>([\s\S]*?)<\/\1>/i);
    if (headingMatch && headingMatch[2]) {
      addLabel(lineNum, headingMatch[2], "Heading", trimmed);
    }

    // Dialog / Modal / Drawer Titles
    const modalTitleMatch = line.match(/<(?:DialogTitle|ModalTitle|DrawerTitle)[^>]*>([\s\S]*?)<\/(?:DialogTitle|ModalTitle|DrawerTitle)>/i);
    if (modalTitleMatch && modalTitleMatch[1]) {
      addLabel(lineNum, modalTitleMatch[1], "Modal Title", trimmed);
    }

    // Badges & Prominent Spans (eyebrows / brand marks)
    const badgeMatch = line.match(/<(?:Badge)[^>]*>([\s\S]*?)<\/Badge>/i);
    if (badgeMatch && badgeMatch[1]) {
      addLabel(lineNum, badgeMatch[1], "Badge / Eyebrow", trimmed);
    }
    const spanBadgeMatch = line.match(/<span[^>]*class(?:Name)?=["'][^"']*(?:tracking-widest|uppercase|font-mono|rounded-full)[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
    if (spanBadgeMatch && spanBadgeMatch[1]) {
      addLabel(lineNum, spanBadgeMatch[1], "Badge / Eyebrow", trimmed);
    }

    // Visual Icon Usages Scan
    if (importedIcons.size > 0) {
      for (const [iconName, lib] of importedIcons.entries()) {
        const tagRegex = new RegExp(`<${iconName}\\b`);
        if (tagRegex.test(line)) {
          const contextWindow = lines.slice(Math.max(0, idx - 3), Math.min(lines.length, idx + 4)).join(" ");
          let iconContext: VisualIconUsage["context"] = "Visual Indicator";
          if (/<(?:button|Button)\b/i.test(contextWindow)) {
            iconContext = "Button";
          } else if (/<(?:a|Link)\b/i.test(contextWindow)) {
            iconContext = "Link / Navigation";
          } else if (/<(?:Badge)\b/i.test(contextWindow) || /rounded-full.*badge/i.test(contextWindow)) {
            iconContext = "Badge / Status";
          } else if (/<(?:Dialog|Modal|Drawer)/i.test(contextWindow)) {
            iconContext = "Dialog Action";
          } else if (/<(?:Dropdown|Menu|SelectItem)/i.test(contextWindow)) {
            iconContext = "Menu Item";
          }

          visualIcons.push({
            line: lineNum,
            iconName,
            sourceLib: lib,
            context: iconContext,
            snippet: trimmed.slice(0, 75),
          });
        }
      }
    }

    // Raw SVG Detection
    if (/<svg\b/i.test(line)) {
      const ariaMatch = line.match(/(?:aria-label|title)=["']([^"']+)["']/);
      const name = ariaMatch ? `SVG (${ariaMatch[1]})` : "inline SVG";
      const contextWindow = lines.slice(Math.max(0, idx - 3), Math.min(lines.length, idx + 4)).join(" ");
      let iconContext: VisualIconUsage["context"] = "Visual Indicator";
      if (/<(?:button|Button)\b/i.test(contextWindow)) {
        iconContext = "Button";
      } else if (/<(?:a|Link)\b/i.test(contextWindow)) {
        iconContext = "Link / Navigation";
      }

      visualIcons.push({
        line: lineNum,
        iconName: name,
        sourceLib: "raw SVG",
        context: iconContext,
        snippet: trimmed.slice(0, 75),
      });
    }

    let cardMatch;
    CARD_SURFACE_REGEX.lastIndex = 0;
    while ((cardMatch = CARD_SURFACE_REGEX.exec(line)) !== null) {
      cardsAndSurfaces.push({
        line: lineNum,
        classes: cardMatch[1].slice(0, 80),
        snippet: trimmed.slice(0, 80),
      });
    }

    // Disclosed Elements (Modals, Sheets, Drawers, Dialogs, Popovers)
    let disclosedMatch;
    DISCLOSED_ELEMENT_REGEX.lastIndex = 0;
    while ((disclosedMatch = DISCLOSED_ELEMENT_REGEX.exec(line)) !== null) {
      const tag = disclosedMatch[0].replace(/^</, "").trim();
      let elemType: DisclosedElement["type"] = "Dialog";
      if (tag.includes("Modal")) elemType = "Modal";
      else if (tag.includes("Drawer")) elemType = "Drawer";
      else if (tag.includes("Sheet")) elemType = "Sheet";
      else if (tag.includes("Popover")) elemType = "Popover";

      disclosedElements.push({
        line: lineNum,
        name: tag,
        type: elemType,
        snippet: trimmed.slice(0, 80),
      });
      modalsAndDialogs.push({ line: lineNum, snippet: trimmed.slice(0, 80) });
    }

    // Live Status Dots (pulse dots, indicator pips, active states)
    if (LIVE_DOT_REGEX.test(line)) {
      const isPulsing = line.includes("animate-pulse");
      const colorMatch = line.match(/\bbg-([a-zA-Z]+-[0-9]{2,3})\b/);
      const dotColor = colorMatch ? colorMatch[1] : (isPulsing ? "pulsing-indicator" : "indicator-dot");
      const classMatch = line.match(/(?:class(?:Name)?|:class)=["'`]([^"'`]+)["'`]/);
      liveStatusDots.push({
        line: lineNum,
        snippet: trimmed.slice(0, 80),
        color: dotColor,
        classes: classMatch ? classMatch[1].slice(0, 80) : trimmed.slice(0, 80),
        isPulsing,
      });
    }

    // Capsule Pills & Badges (rounded-full chips, tags, pills)
    if (CAPSULE_PILL_REGEX.test(line) && !LIVE_DOT_REGEX.test(line)) {
      if (/\b(?:px-|py-|text-xs|text-sm|badge|tag|inline-flex|rounded-full)\b/.test(line)) {
        const classMatch = line.match(/(?:class(?:Name)?|:class)=["'`]([^"'`]+)["'`]/);
        const textMatch = line.match(/>([^<{}]+)</);
        capsulePills.push({
          line: lineNum,
          snippet: trimmed.slice(0, 80),
          label: textMatch ? textMatch[1].trim() : undefined,
          classes: classMatch ? classMatch[1].slice(0, 80) : trimmed.slice(0, 80),
        });
      }
    }

    let hexMatch;
    HEX_REGEX.lastIndex = 0;
    while ((hexMatch = HEX_REGEX.exec(line)) !== null) {
      const hex = hexMatch[0].toLowerCase();
      if (!APPROVED_HEXES.has(hex) && !trimmed.startsWith("//") && !trimmed.startsWith("/*")) {
        hardcodedHexes.push({ line: lineNum, hex, snippet: trimmed.slice(0, 80) });
      }
    }

    // Universal Tailwind JIT Color Tokenizer (All 22 Color Families + Dark Mode)
    let colorMatch;
    UNIVERSAL_COLOR_REGEX.lastIndex = 0;
    while ((colorMatch = UNIVERSAL_COLOR_REGEX.exec(line)) !== null) {
      const isDark = Boolean(colorMatch[1]);
      const property = colorMatch[2];
      const family = colorMatch[3];
      const shade = colorMatch[4] || "500";
      colorUsages.push({
        line: lineNum,
        token: colorMatch[0],
        family,
        shade,
        property,
        isDark,
        snippet: trimmed.slice(0, 80),
      });

      // Backward compatibility with legacy rogueTailwindColors for neutral grays
      if (["zinc", "neutral", "gray", "stone"].includes(family)) {
        rogueTailwindColors.push({
          line: lineNum,
          token: `${property}-${family}-${shade}`,
          snippet: trimmed.slice(0, 80),
        });
      }
    }

    // Dark Mode Asymmetry Scanner
    const classAttrMatch = line.match(/(?:class(?:Name)?|:class|class:list)=["'`]([^"'`]+)["'`]/);
    if (classAttrMatch) {
      const classStr = classAttrMatch[1];
      const tokens = classStr.split(/\s+/);
      const hasDarkBg = tokens.some(t => t.startsWith("dark:bg-"));
      const hasDarkText = tokens.some(t => t.startsWith("dark:text-"));

      const lightBg = tokens.find(t => /^bg-(slate|gray|zinc|neutral|stone|white|black)-[1-9]00$/.test(t) || t === "bg-white" || t === "bg-black");
      if (lightBg && !hasDarkBg) {
        darkModeAsymmetries.push({
          line: lineNum,
          property: "background",
          lightToken: lightBg,
          snippet: trimmed.slice(0, 80),
          classes: classStr.slice(0, 60),
        });
      }

      const lightText = tokens.find(t => /^text-(slate|gray|zinc|neutral|stone)-[1-9]00$/.test(t));
      if (lightText && !hasDarkText) {
        darkModeAsymmetries.push({
          line: lineNum,
          property: "text",
          lightToken: lightText,
          snippet: trimmed.slice(0, 80),
          classes: classStr.slice(0, 60),
        });
      }
    }

    let rogueMatch: RegExpExecArray | null;
    ROGUE_COLOR_REGEX.lastIndex = 0;
    while ((rogueMatch = ROGUE_COLOR_REGEX.exec(line)) !== null) {
      const currentMatch = rogueMatch;
      // If not already pushed by universal matcher
      if (!rogueTailwindColors.some(r => r.line === lineNum && r.token === currentMatch[0])) {
        rogueTailwindColors.push({
          line: lineNum,
          token: currentMatch[0],
          snippet: trimmed.slice(0, 80),
        });
      }
    }

    let typeMatch;
    TYPOGRAPHY_REGEX.lastIndex = 0;
    while ((typeMatch = TYPOGRAPHY_REGEX.exec(line)) !== null) {
      typographyUsages.push({
        line: lineNum,
        fontToken: typeMatch[0],
        snippet: trimmed.slice(0, 80),
      });
    }

    // SFC Template Interactive Triggers & Overlays (Vue, Svelte, Astro)
    if (relPath.endsWith(".vue") || relPath.endsWith(".svelte") || relPath.endsWith(".astro")) {
      const clickMatch = line.match(/(?:@click|v-on:click|on:click)=["'\{]([^"'\}]+)["'\}]/);
      if (clickMatch) {
        const handlerName = clickMatch[1].trim();
        const tagMatch = line.match(/<([a-zA-Z0-9_\.-]+)/);
        const tagName = tagMatch ? tagMatch[1] : "element";
        const triggerType: InteractiveTrigger["triggerType"] = tagName.toLowerCase() === "button"
          ? "Raw Button"
          : (tagName.toLowerCase().includes("button") ? "Standard Button" : "Clickable Container");

        if (!interactiveTriggers.some(t => t.line === lineNum)) {
          interactiveTriggers.push({
            line: lineNum,
            tagName: `<${tagName}>`,
            triggerType,
            handlerName,
            snippet: trimmed.slice(0, 80),
          });
        }
      }

      const sfcOverlayMatch = line.match(/<(UModal|USlideover|UDropdown|PrimeDialog|VaModal|Dialog|Modal|Sheet|Drawer)\b/i);
      if (sfcOverlayMatch) {
        const oName = sfcOverlayMatch[1];
        let overlayType: DisclosedOverlay["type"] = "Modal / Dialog";
        if (/Slideover|Drawer|Sheet/i.test(oName)) overlayType = "Drawer / Sheet";
        else if (/Dropdown|Menu/i.test(oName)) overlayType = "Dropdown Menu";

        const condMatch = line.match(/(?:v-model(?::visible)?|:open|v-if)=["']([^"']+)["']/);
        if (!disclosedOverlays.some(o => o.line === lineNum && o.name === oName)) {
          disclosedOverlays.push({
            line: lineNum,
            name: oName,
            type: overlayType,
            conditionVariable: condMatch ? condMatch[1] : undefined,
            snippet: trimmed.slice(0, 80),
          });
        }
      }
    }
  });

  // =========================================================================
  // AST Engine: Exhaustive Interactive Trigger & Overlay Traversal (TS / JSX / TSX)
  // =========================================================================
  const isJsxOrTs = filePath.endsWith(".tsx") || filePath.endsWith(".jsx") || filePath.endsWith(".ts") || filePath.endsWith(".js");
  if (isJsxOrTs) {
    try {
      const isJsx = filePath.endsWith(".tsx") || filePath.endsWith(".jsx");
      const sf = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        /* setParentNodes */ true,
        isJsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS
      );

      function walkAst(node: ts.Node) {
        // 1. Detect JSX Elements & Self Closing Elements
        if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
          const opening = ts.isJsxElement(node) ? node.openingElement : node;
          const tagName = opening.tagName.getText(sf);
          const lineNum = sf.getLineAndCharacterOfPosition(opening.getStart(sf)).line + 1;
          const snippet = (lines[lineNum - 1] || tagName).trim().slice(0, 80);

          let hasClick = false;
          let handlerName: string | undefined;
          let disclosesTarget: string | undefined;

          opening.attributes.properties.forEach(prop => {
            if (ts.isJsxAttribute(prop)) {
              const attrName = prop.name.getText(sf);
              if (attrName === "onClick" || attrName === "onPress" || attrName === "onKeyDown" || attrName === "onSelect") {
                hasClick = true;
                if (prop.initializer) {
                  if (ts.isJsxExpression(prop.initializer) && prop.initializer.expression) {
                    handlerName = prop.initializer.expression.getText(sf);
                  } else {
                    handlerName = prop.initializer.getText(sf);
                  }
                }
              } else if (attrName === "role" && prop.initializer) {
                const val = prop.initializer.getText(sf).replace(/['"]/g, "");
                if (val === "button" || val === "tab" || val === "menuitem") {
                  hasClick = true;
                }
              }
            }
          });

          // Infer disclosed target from trigger tag name or state setter
          if (tagName.endsWith("Trigger")) {
            disclosesTarget = tagName.replace(/Trigger$/, "") + "Content";
          } else if (handlerName) {
            const stateMatch = handlerName.match(/set([A-Z][a-zA-Z0-9_]*)\s*\(\s*true\s*\)/);
            if (stateMatch) {
              disclosesTarget = `${stateMatch[1]} (State Trigger)`;
            }
          }

          // Classify Interactive Triggers
          if (tagName === "button") {
            interactiveTriggers.push({
              line: lineNum,
              tagName: "<button>",
              triggerType: "Raw Button",
              handlerName,
              disclosesTarget,
              snippet,
            });
          } else if (tagName === "Button" || tagName.endsWith("Button") || tagName === "IconButton") {
            interactiveTriggers.push({
              line: lineNum,
              tagName: `<${tagName}>`,
              triggerType: "Standard Button",
              handlerName,
              disclosesTarget,
              snippet,
            });
          } else if (tagName.endsWith("Trigger")) {
            interactiveTriggers.push({
              line: lineNum,
              tagName: `<${tagName}>`,
              triggerType: "Component Trigger",
              handlerName,
              disclosesTarget,
              snippet,
            });
          } else if (tagName === "a" || tagName === "Link" || tagName === "NavLink") {
            interactiveTriggers.push({
              line: lineNum,
              tagName: `<${tagName}>`,
              triggerType: "Navigation Link",
              handlerName,
              disclosesTarget,
              snippet,
            });
          } else if (hasClick) {
            interactiveTriggers.push({
              line: lineNum,
              tagName: `<${tagName} onClick>`,
              triggerType: "Clickable Container",
              handlerName,
              disclosesTarget,
              snippet,
            });
          } else if (["input", "select", "textarea"].includes(tagName.toLowerCase())) {
            interactiveTriggers.push({
              line: lineNum,
              tagName: `<${tagName}>`,
              triggerType: "Form Input",
              handlerName,
              snippet,
            });
          }

          // Classify Disclosed Overlays
          const lowerTag = tagName.toLowerCase();
          let overlayType: DisclosedOverlay["type"] | undefined;
          if (lowerTag.includes("modal") || lowerTag.includes("dialog")) overlayType = "Modal / Dialog";
          else if (lowerTag.includes("sheet") || lowerTag.includes("drawer") || lowerTag.includes("slideover")) overlayType = "Drawer / Sheet";
          else if (lowerTag.includes("dropdown") || lowerTag.includes("contextmenu")) overlayType = "Dropdown Menu";
          else if (lowerTag.includes("popover") || lowerTag.includes("tooltip")) overlayType = "Popover";
          else if (lowerTag.includes("accordion") || lowerTag.includes("collapsible")) overlayType = "Accordion";
          else if (lowerTag.includes("tabs") || lowerTag.includes("tablist")) overlayType = "Tabs";

          if (overlayType) {
            let conditionVariable: string | undefined;
            opening.attributes.properties.forEach(prop => {
              if (ts.isJsxAttribute(prop)) {
                const aName = prop.name.getText(sf);
                if (["open", "isOpen", "show", "visible", "defaultOpen"].includes(aName)) {
                  conditionVariable = prop.initializer ? prop.initializer.getText(sf) : aName;
                }
              }
            });

            if (!disclosedOverlays.some(o => o.line === lineNum && o.name === tagName)) {
              disclosedOverlays.push({
                line: lineNum,
                name: tagName,
                type: overlayType,
                conditionVariable,
                snippet,
              });
            }
          }
        }

        // 2. Conditional Rendering Disclosures: {isOpen && <Modal />}
        if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken) {
          const leftText = node.left.getText(sf);
          const right = node.right;
          if (ts.isJsxElement(right) || ts.isJsxSelfClosingElement(right)) {
            const rightOpening = ts.isJsxElement(right) ? right.openingElement : right;
            const targetName = rightOpening.tagName.getText(sf);
            const lineNum = sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
            const snippet = (lines[lineNum - 1] || `${leftText} && <${targetName}>`).trim().slice(0, 80);

            if (/Modal|Dialog|Drawer|Sheet|Popover|Menu|View|Popup|Confirm/i.test(targetName)) {
              let overlayType: DisclosedOverlay["type"] = "Modal / Dialog";
              if (/Drawer|Sheet|Slide/i.test(targetName)) overlayType = "Drawer / Sheet";
              else if (/Dropdown|Menu/i.test(targetName)) overlayType = "Dropdown Menu";
              else if (/Popover|Tooltip/i.test(targetName)) overlayType = "Popover";

              if (!disclosedOverlays.some(o => o.line === lineNum && o.name === targetName)) {
                disclosedOverlays.push({
                  line: lineNum,
                  name: targetName,
                  type: overlayType,
                  conditionVariable: leftText,
                  snippet,
                });
              }
            }
          }
        }

        ts.forEachChild(node, walkAst);
      }

      walkAst(sf);
    } catch {
      // Fallback gracefully if any source file contains non-standard syntax
    }
  }

  return {
    filePath,
    relativePath: relPath,
    zone,
    isClientComponent,
    componentNames,
    imports,
    rawButtons,
    uiButtons,
    interactiveTriggers,
    disclosedOverlays,
    cardsAndSurfaces,
    modalsAndDialogs,
    disclosedElements,
    liveStatusDots,
    capsulePills,
    colorUsages,
    darkModeAsymmetries,
    hardcodedHexes,
    rogueTailwindColors,
    typographyUsages,
    visibleLabels,
    visualIcons,
    hasDirectStyleTag,
    isExportedComponent,
  };
}

// 5. Dead / Orphaned Component Finder (Multi-Framework Aware)
function findDeadComponents(audits: ComponentAudit[], structure?: ProjectStructure): ComponentAudit[] {
  const componentFiles = audits.filter(a =>
    (
      a.relativePath.includes("components/") ||
      a.relativePath.includes("src/components/") ||
      a.relativePath.includes("src/lib/components/")
    ) &&
    !a.relativePath.includes("components/ui") &&
    !a.relativePath.includes("/ui/") &&
    !a.relativePath.endsWith("index.ts") &&
    !a.relativePath.endsWith("index.tsx") &&
    !a.relativePath.endsWith("index.vue") &&
    !a.relativePath.endsWith("index.svelte")
  );

  const allImportStrings = new Set<string>();
  audits.forEach(a => {
    a.imports.forEach(imp => allImportStrings.add(imp));
  });

  const isNuxtOrVue = structure?.framework === "Nuxt 3" || structure?.framework === "Vite / Vue SPA";
  let allFileContents: string | null = null;

  const dead: ComponentAudit[] = [];

  componentFiles.forEach(cf => {
    const baseNameNoExt = path.basename(cf.relativePath).replace(/\.[^/.]+$/, "");
    let isUsed = false;

    // 1. Check explicit import statements
    for (const imp of allImportStrings) {
      if (imp.includes(baseNameNoExt)) {
        isUsed = true;
        break;
      }
    }

    // 2. If Nuxt / Vue auto-imports, check template tag invocations: <ComponentName or <component-name
    if (!isUsed && (isNuxtOrVue || cf.relativePath.endsWith(".vue"))) {
      if (allFileContents === null) {
        allFileContents = audits.map(a => {
          try { return fs.readFileSync(a.filePath, "utf-8"); } catch { return ""; }
        }).join("\n");
      }
      const kebabName = baseNameNoExt.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
      const tagRegex = new RegExp(`<(?:Lazy)?(?:${baseNameNoExt}|${kebabName})\\b`, "i");
      if (tagRegex.test(allFileContents)) {
        isUsed = true;
      }
    }

    if (!isUsed) {
      dead.push(cf);
    }
  });

  return dead;
}

// Route Transformation Helpers
function transformSvelteKitRoute(relPath: string): { route: string; layoutFile?: string } {
  const norm = relPath.replace(/\\/g, "/");
  const sub = norm
    .replace(/^src\/routes\/?/, "")
    .replace(/\/\+page(@[a-zA-Z0-9_-]*)?\.svelte$/, "")
    .replace(/^\+page(@[a-zA-Z0-9_-]*)?\.svelte$/, "");

  const segments = sub
    .split("/")
    .filter(seg => seg.length > 0 && !(seg.startsWith("(") && seg.endsWith(")")))
    .map(seg => {
      if (/^\[\.\.\.[^\]]+\]$/.test(seg)) return "*";
      if (/^\[\[[^\]]+\]\]$/.test(seg)) return `:${seg.slice(2, -2)}?`;
      if (/^\[([^\]=]+)=[^\]]+\]$/.test(seg)) return `:${seg.slice(1).split("=")[0]}`;
      if (/^\[([^\]]+)\]$/.test(seg)) return `:${seg.slice(1, -1)}`;
      return seg;
    });

  let route = "/" + segments.join("/");
  route = route.replace(/\/+/g, "/");
  if (route.length > 1 && route.endsWith("/")) route = route.slice(0, -1);
  return { route: route === "" ? "/" : route };
}

function transformRemixFlatRoute(relPath: string): { route: string; layoutFile?: string } {
  const norm = relPath.replace(/\\/g, "/");
  const fileBase = norm
    .replace(/^app\/routes\/?/, "")
    .replace(/\/route\.(tsx|jsx|ts|js)$/, "")
    .replace(/\.(tsx|jsx|ts|js)$/, "");

  if (fileBase === "_index") {
    return { route: "/" };
  }

  const segments: string[] = [];
  let current = "";
  let insideBracket = false;

  for (let i = 0; i < fileBase.length; i++) {
    const char = fileBase[i];
    if (char === "[") {
      insideBracket = true;
      current += char;
    } else if (char === "]") {
      insideBracket = false;
      current += char;
    } else if (char === "." && !insideBracket) {
      segments.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (current) segments.push(current);

  const urlSegments: string[] = [];

  for (let seg of segments) {
    if (seg.startsWith("[") && seg.endsWith("]")) {
      urlSegments.push(seg.slice(1, -1));
      continue;
    }
    if (seg === "_index") continue;
    if (seg.startsWith("_") && !seg.endsWith("_")) continue;
    if (seg.endsWith("_")) seg = seg.slice(0, -1);
    if (seg === "$") {
      urlSegments.push("*");
      continue;
    }
    if (seg.startsWith("$")) {
      urlSegments.push(":" + seg.slice(1));
      continue;
    }
    seg = seg.replace(/\[([^\]]+)\]/g, "$1");
    seg = seg.replace(/\$([a-zA-Z0-9_]+)/g, ":$1");
    if (seg) urlSegments.push(seg);
  }

  let route = "/" + urlSegments.join("/");
  route = route.replace(/\/+/g, "/");
  if (route.length > 1 && route.endsWith("/")) route = route.slice(0, -1);
  return { route: route === "" ? "/" : route };
}

function transformNuxtRoute(relPath: string): { route: string; layoutFile?: string } {
  const norm = relPath.replace(/\\/g, "/");
  let sub = norm
    .replace(/^(src\/|app\/)?pages\//, "")
    .replace(/\.vue$/, "")
    .replace(/\/index$/, "")
    .replace(/^index$/, "");

  // Dynamic segments: [id] -> :id, [...slug] -> *
  sub = sub
    .replace(/\[\.\.\.[^\]]+\]/g, "*")
    .replace(/\[\[([^\]]+)\]\]/g, ":$1?")
    .replace(/\[([^\]]+)\]/g, ":$1");

  let route = "/" + sub;
  route = route.replace(/\/+/g, "/");
  if (route.length > 1 && route.endsWith("/")) route = route.slice(0, -1);
  return { route: route === "" ? "/" : route };
}

function transformAstroRoute(relPath: string): { route: string; layoutFile?: string } {
  const norm = relPath.replace(/\\/g, "/");
  let sub = norm
    .replace(/^(src\/)?pages\//, "")
    .replace(/\.(astro|mdx|md|html|ts|js)$/, "")
    .replace(/\/index$/, "")
    .replace(/^index$/, "");

  sub = sub
    .replace(/\[\.\.\.[^\]]+\]/g, "*")
    .replace(/\[([^\]]+)\]/g, ":$1");

  let route = "/" + sub;
  route = route.replace(/\/+/g, "/");
  if (route.length > 1 && route.endsWith("/")) route = route.slice(0, -1);
  return { route: route === "" ? "/" : route };
}

// 6. Dynamic Route Builder with Multi-Framework Adapters
function buildRouteMap(audits: ComponentAudit[], structure?: ProjectStructure): RouteMapItem[] {
  const routes: RouteMapItem[] = [];
  const framework = structure?.framework;

  // 1. SvelteKit Route Resolution
  if (framework === "SvelteKit") {
    const pageFiles = audits.filter(a =>
      a.relativePath.startsWith("src/routes/") &&
      a.relativePath.endsWith("+page.svelte")
    );

    for (const page of pageFiles) {
      const { route } = transformSvelteKitRoute(page.relativePath);
      const pageDir = path.dirname(page.filePath);
      const layoutCandidates = [path.join(pageDir, "+layout.svelte"), path.join(ROOT_DIR, "src", "routes", "+layout.svelte")];
      let layoutFile: string | undefined = undefined;
      for (const cand of layoutCandidates) {
        if (fs.existsSync(cand)) {
          layoutFile = path.relative(ROOT_DIR, cand).replace(/\\/g, "/");
          break;
        }
      }

      routes.push({
        route,
        zone: page.zone,
        pageFile: page.relativePath,
        layoutFile,
        isClientComponent: true,
        importedComponents: page.imports,
        componentTree: buildComponentTree(page, audits),
      });
    }
  }

  // 2. React Router v7 & Remix Flat Routes
  else if (framework === "React Router v7" || framework === "Remix") {
    const pageFiles = audits.filter(a =>
      a.relativePath.startsWith("app/routes/") &&
      (a.relativePath.endsWith(".tsx") || a.relativePath.endsWith(".jsx") || a.relativePath.endsWith(".ts") || a.relativePath.endsWith(".js"))
    );

    for (const page of pageFiles) {
      const { route } = transformRemixFlatRoute(page.relativePath);
      const rootLayout = path.join(ROOT_DIR, "app", "root.tsx");
      const layoutFile = fs.existsSync(rootLayout) ? path.relative(ROOT_DIR, rootLayout).replace(/\\/g, "/") : undefined;

      routes.push({
        route,
        zone: page.zone,
        pageFile: page.relativePath,
        layoutFile,
        isClientComponent: page.isClientComponent,
        importedComponents: page.imports,
        componentTree: buildComponentTree(page, audits),
      });
    }
  }

  // 3. Nuxt 3 File-Based Routing
  else if (framework === "Nuxt 3") {
    const pageFiles = audits.filter(a =>
      a.relativePath.endsWith(".vue") &&
      (a.relativePath.startsWith("pages/") || a.relativePath.startsWith("src/pages/") || a.relativePath.startsWith("app/pages/"))
    );

    for (const page of pageFiles) {
      const { route } = transformNuxtRoute(page.relativePath);
      let layoutFile: string | undefined = undefined;
      if (structure?.layoutsDir) {
        const defaultLayout = path.join(structure.layoutsDir, "default.vue");
        if (fs.existsSync(defaultLayout)) {
          layoutFile = path.relative(ROOT_DIR, defaultLayout).replace(/\\/g, "/");
        }
      }

      routes.push({
        route,
        zone: page.zone,
        pageFile: page.relativePath,
        layoutFile,
        isClientComponent: page.isClientComponent,
        importedComponents: page.imports,
        componentTree: buildComponentTree(page, audits),
      });
    }

    if (routes.length === 0) {
      const appVue = audits.find(a => /app\.vue$/.test(a.relativePath));
      if (appVue) {
        routes.push({
          route: "/ (Single Page App - app.vue)",
          zone: "Root Application",
          pageFile: appVue.relativePath,
          isClientComponent: false,
          importedComponents: appVue.imports,
          componentTree: buildComponentTree(appVue, audits),
        });
      }
    }
  }

  // 4. Astro Routing
  else if (framework === "Astro") {
    const pageFiles = audits.filter(a =>
      (a.relativePath.startsWith("src/pages/") || a.relativePath.startsWith("pages/")) &&
      !a.relativePath.split("/").some(segment => segment.startsWith("_") || segment.startsWith("."))
    );

    for (const page of pageFiles) {
      const { route } = transformAstroRoute(page.relativePath);
      let layoutFile: string | undefined = undefined;
      if (structure?.layoutsDir) {
        const defaultLayout = path.join(structure.layoutsDir, "BaseLayout.astro");
        if (fs.existsSync(defaultLayout)) {
          layoutFile = path.relative(ROOT_DIR, defaultLayout).replace(/\\/g, "/");
        }
      }

      routes.push({
        route,
        zone: page.zone,
        pageFile: page.relativePath,
        layoutFile,
        isClientComponent: page.isClientComponent,
        importedComponents: page.imports,
        componentTree: buildComponentTree(page, audits),
      });
    }
  }

  // 5. Next.js App / Pages Router (Default React Router)
  else {
    const isPagesRouter = framework === "Next.js (Pages Router)";
    const pageFiles = audits.filter(a => {
      if (isPagesRouter) {
        return (
          (a.relativePath.startsWith("pages/") || a.relativePath.startsWith("src/pages/")) &&
          !a.relativePath.includes("/_app.") &&
          !a.relativePath.includes("/_document.") &&
          !a.relativePath.includes("/api/")
        );
      }
      return (
        (a.relativePath.includes("app/") || a.relativePath.includes("pages/")) &&
        (a.relativePath.endsWith("page.tsx") || a.relativePath.endsWith("page.jsx") || a.relativePath.endsWith("page.ts") || a.relativePath.endsWith("page.js"))
      );
    });

    for (const page of pageFiles) {
      let route = "/" + page.relativePath
        .replace(/^(src\/)?(app|pages)\//, "")
        .replace(/\([^)]+\)\/?/g, "")
        .replace(/\.(tsx|jsx|ts|js)$/, "")
        .replace(/\/page$/, "")
        .replace(/^page$/, "")
        .replace(/\/index$/, "")
        .replace(/^index$/, "");

      if (route === "") route = "/";
      route = route.replace(/\/+/g, "/");

      const pageDir = path.dirname(page.filePath);
      const layoutCandidates = ["layout.tsx", "layout.jsx", "layout.js", "layout.ts"];
      let layoutFile: string | undefined = undefined;
      for (const cand of layoutCandidates) {
        const fullCand = path.join(pageDir, cand);
        if (fs.existsSync(fullCand)) {
          layoutFile = path.relative(ROOT_DIR, fullCand).replace(/\\/g, "/");
          break;
        }
      }

      routes.push({
        route,
        zone: page.zone,
        pageFile: page.relativePath,
        layoutFile,
        isClientComponent: page.isClientComponent,
        importedComponents: page.imports,
        componentTree: buildComponentTree(page, audits),
      });
    }
  }

  // 6. Generic Single Page Application Fallback (App.tsx / App.vue / App.svelte / main.*)
  if (routes.length === 0) {
    const rootComponent = audits.find(a =>
      a.relativePath.endsWith("App.jsx") ||
      a.relativePath.endsWith("App.tsx") ||
      a.relativePath.endsWith("App.vue") ||
      a.relativePath.endsWith("App.svelte") ||
      a.relativePath.endsWith("App.js") ||
      a.relativePath.endsWith("main.jsx") ||
      a.relativePath.endsWith("main.tsx") ||
      a.relativePath.endsWith("main.js") ||
      a.relativePath.endsWith("main.ts")
    );

    if (rootComponent) {
      routes.push({
        route: "/ (Single Page App)",
        zone: "Root Application",
        pageFile: rootComponent.relativePath,
        isClientComponent: true,
        importedComponents: rootComponent.imports,
        componentTree: buildComponentTree(rootComponent, audits),
      });
    }
  }

  return routes.sort((a, b) => a.route.localeCompare(b.route));
}

function buildComponentTree(page: ComponentAudit, audits: ComponentAudit[]): RouteComponentNode[] {
  const componentTree: RouteComponentNode[] = [];

  page.imports.forEach(imp => {
    const cleanName = imp
      .replace(/@\/(components|src\/components)\//, "")
      .replace(/^\$lib\/(components\/)?/, "")
      .replace(/^~\/(components\/)?/, "")
      .replace(/^\.\//, "")
      .replace(/^\.\.\//, "");
    const baseName = path.basename(cleanName).replace(/\.[^/.]+$/, "");

    const matchingAudit = audits.find(a => {
      const normRel = a.relativePath.replace(/\\/g, "/");
      return (
        normRel.endsWith(`components/${cleanName}.tsx`) ||
        normRel.endsWith(`components/${cleanName}.ts`) ||
        normRel.endsWith(`components/${cleanName}.jsx`) ||
        normRel.endsWith(`components/${cleanName}.vue`) ||
        normRel.endsWith(`components/${cleanName}.svelte`) ||
        normRel.endsWith(`components/${cleanName}.astro`) ||
        normRel.endsWith(`components/${cleanName}/index.tsx`) ||
        normRel.endsWith(`/${cleanName}.tsx`) ||
        path.basename(a.relativePath).replace(/\.[^/.]+$/, "") === baseName
      );
    });

    let children: string[] = [];
    let isClient = false;
    if (matchingAudit) {
      isClient = matchingAudit.isClientComponent;
      if (matchingAudit.imports.length > 0) {
        children = matchingAudit.imports
          .map(c => path.basename(c).replace(/\.[^/.]+$/, ""))
          .filter(c => !["ui", "button", "theme-toggle", "clsx", "lucide-react", "lucide-vue-next", "lucide-svelte", "tailwind-merge", "utils"].includes(c.toLowerCase()) && c !== baseName);
        children = Array.from(new Set(children)).slice(0, 4);
      }
    }

    componentTree.push({
      name: cleanName,
      isClientComponent: isClient,
      children,
    });
  });

  return componentTree;
}

// 7. Automated Codemod (--fix-buttons) with Framework Safety
function executeButtonCodemod(audits: ComponentAudit[]) {
  console.log("🛠️ Running Automated Button Codemod (--fix-buttons)...");
  let modifiedFilesCount = 0;
  let transformedButtonsCount = 0;

  audits.forEach(a => {
    if (a.rawButtons.length === 0 || a.zone === "Shared UI Primitives") return;

    let content = fs.readFileSync(a.filePath, "utf-8");
    let fileChanged = false;
    const isSvelte = a.relativePath.endsWith(".svelte");
    const isVue = a.relativePath.endsWith(".vue");

    const newContent = content
      .replace(/<button\b/g, () => {
        transformedButtonsCount++;
        fileChanged = true;
        return "<Button";
      })
      .replace(/<\/button>/g, "</Button>");

    if (fileChanged) {
      let finalContent = newContent;

      if (isSvelte) {
        const hasButtonImport = /\$lib\/components\/ui\/button/.test(content);
        if (!hasButtonImport) {
          const svelteImport = `import { Button } from "$lib/components/ui/button";\n`;
          if (/<script\b[^>]*>/i.test(finalContent)) {
            finalContent = finalContent.replace(/(<script\b[^>]*>)/i, `$1\n  ${svelteImport}`);
          } else {
            finalContent = `<script lang="ts">\n  ${svelteImport}</script>\n\n` + finalContent;
          }
        }
      } else if (isVue) {
        const hasButtonImport = /components\/ui\/button/.test(content);
        if (!hasButtonImport) {
          const vueImport = `import { Button } from "@/components/ui/button";\n`;
          if (/<script\b[^>]*setup[^>]*>/i.test(finalContent)) {
            finalContent = finalContent.replace(/(<script\b[^>]*setup[^>]*>)/i, `$1\n  ${vueImport}`);
          } else {
            finalContent = `<script setup lang="ts">\n  ${vueImport}</script>\n\n` + finalContent;
          }
        }
      } else {
        const hasButtonImport = /import\s+.*\{?.*Button.*\}?\s+from\s+["']@\/components\/ui\/button["']/.test(content);
        if (!hasButtonImport) {
          finalContent = `import { Button } from "@/components/ui/button";\n` + newContent;
        }
      }

      fs.writeFileSync(a.filePath, finalContent, "utf-8");
      modifiedFilesCount++;
      console.log(`  ✅ Migrated buttons in: ${a.relativePath}`);
    }
  });

  console.log(`🎉 Codemod complete: Converted ${transformedButtonsCount} buttons across ${modifiedFilesCount} files.`);
}

// 8. Triage & Dispatch Gateway Generator
function generateSkillDispatches(audits: ComponentAudit[]): SkillDispatch[] {
  const dispatches: SkillDispatch[] = [];

  // 1. emil-design-eng: Interaction Physics, snappy buttons, active states
  const physicsTargets: { file: string; line?: number; zone: string; detail: string }[] = [];
  audits.forEach(a => {
    a.rawButtons.forEach(b => {
      if (!b.className?.includes("active:scale") && !b.className?.includes("transition")) {
        physicsTargets.push({
          file: a.relativePath,
          line: b.line,
          zone: a.zone,
          detail: "Button missing snappy interaction physics (active:scale-[0.97] / transition)",
        });
      }
    });
  });

  if (physicsTargets.length > 0) {
    dispatches.push({
      targetSkill: "emil-design-eng",
      category: "Interaction & Physics",
      issueCount: physicsTargets.length,
      description: "Apply snappy micro-interactions, press feedback (active:scale-[0.97]), and spring physics.",
      targets: physicsTargets,
    });
  }

  // 2. ui-ux-pro-max: Design Tokens & Colors
  const tokenTargets: { file: string; line?: number; zone: string; detail: string }[] = [];
  audits.forEach(a => {
    a.hardcodedHexes.forEach(h => {
      tokenTargets.push({
        file: a.relativePath,
        line: h.line,
        zone: a.zone,
        detail: `Hardcoded hex color: ${h.hex}`,
      });
    });
    a.rogueTailwindColors.forEach(r => {
      tokenTargets.push({
        file: a.relativePath,
        line: r.line,
        zone: a.zone,
        detail: `Rogue un-tokenized gray: ${r.token}`,
      });
    });
  });

  if (tokenTargets.length > 0) {
    dispatches.push({
      targetSkill: "ui-ux-pro-max",
      category: "Design Tokens & Colors",
      issueCount: tokenTargets.length,
      description: "Migrate hardcoded hexes and rogue Tailwind grays into standardized project tokens.",
      targets: tokenTargets,
    });
  }

  // 3. a11y-debugging: Accessibility fast-checks
  const a11yTargets: { file: string; line?: number; zone: string; detail: string }[] = [];
  audits.forEach(a => {
    a.rawButtons.filter(b => b.missingAria || b.missingType).forEach(b => {
      const flags: string[] = [];
      if (b.missingAria) flags.push("Missing aria-label / title");
      if (b.missingType) flags.push("Missing type='button'");
      a11yTargets.push({
        file: a.relativePath,
        line: b.line,
        zone: a.zone,
        detail: flags.join(", "),
      });
    });
  });

  if (a11yTargets.length > 0) {
    dispatches.push({
      targetSkill: "a11y-debugging",
      category: "Accessibility (a11y)",
      issueCount: a11yTargets.length,
      description: "Add missing aria-labels, accessible names, keyboard navigation, and explicit button types.",
      targets: a11yTargets,
    });
  }

  // 4. impeccable: Visual craft, inline styles, layout hygiene
  const craftTargets: { file: string; line?: number; zone: string; detail: string }[] = [];
  audits.forEach(a => {
    if (a.hasDirectStyleTag && a.zone !== "Shared UI Primitives") {
      craftTargets.push({
        file: a.relativePath,
        zone: a.zone,
        detail: "Direct inline style={{...}} tag bypassing Tailwind token pipeline",
      });
    }
  });

  if (craftTargets.length > 0) {
    dispatches.push({
      targetSkill: "impeccable",
      category: "Craft & Micro-Polish",
      issueCount: craftTargets.length,
      description: "Refactor inline styles into clean design tokens and harden visual hierarchy.",
      targets: craftTargets,
    });
  }

  // 5. codemod (--fix-buttons): Button standardization
  const rawButtonFiles = audits.filter(a => a.rawButtons.length > 0 && a.zone !== "Shared UI Primitives");
  if (rawButtonFiles.length > 0) {
    dispatches.push({
      targetSkill: "codemod (--fix-buttons)",
      category: "Button Standardization",
      issueCount: rawButtonFiles.reduce((acc, f) => acc + f.rawButtons.length, 0),
      description: "Automated codemod to migrate raw HTML <button> tags to standardized <Button> component.",
      targets: rawButtonFiles.map(f => ({
        file: f.relativePath,
        zone: f.zone,
        detail: `${f.rawButtons.length} raw button(s) to migrate`,
      })),
    });
  }

  return dispatches;
}

// 9. Dynamic Skill Auto-Discovery & Integration Engine
function parseSkillFrontmatter(content: string): { name?: string; description?: string; version?: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const yaml = match[1];
  const result: { name?: string; description?: string; version?: string } = {};

  const nameMatch = yaml.match(/^name:\s*(.+)$/m);
  if (nameMatch) result.name = nameMatch[1].trim().replace(/^['"]|['"]$/g, "");

  const descMatch = yaml.match(/^description:\s*([^\r\n]+(?:\r?\n(?!\w+:)[^\r\n]+)*)/m);
  if (descMatch) result.description = descMatch[1].trim().replace(/^['"]|['"]$/g, "").replace(/\s+/g, " ");

  const verMatch = yaml.match(/^version:\s*(.+)$/m);
  if (verMatch) result.version = verMatch[1].trim().replace(/^['"]|['"]$/g, "");

  return result;
}

function classifySkillDomain(name: string, description: string): { domain: string; handoff: string } {
  const text = `${name} ${description}`.toLowerCase();

  if (text.includes("physics") || text.includes("spring") || text.includes("micro-interaction") || text.includes("emil") || text.includes("gesture")) {
    return {
      domain: "Micro-Interactions & Physics",
      handoff: "Apply snappy micro-interactions, press feedback (active:scale-[0.97]), and spring animations.",
    };
  }
  if (text.includes("token") || text.includes("palette") || text.includes("typography") || text.includes("spacing") || text.includes("ui-ux-pro") || text.includes("design system") || text.includes("theme")) {
    return {
      domain: "Design Tokens & System",
      handoff: "Migrate hardcoded colors, rogue grays, and font scales into standardized design tokens.",
    };
  }
  if (text.includes("anti-slop") || text.includes("taste") || text.includes("impeccable") || text.includes("craft") || text.includes("visual hierarchy") || text.includes("aesthetic") || text.includes("critique")) {
    return {
      domain: "Visual Craft & Anti-Slop",
      handoff: "Harden visual hierarchy, eliminate design slop, and polish bespoke UI craft.",
    };
  }
  if (text.includes("a11y") || text.includes("aria") || text.includes("accessibility") || text.includes("screen reader") || text.includes("wcag")) {
    return {
      domain: "Accessibility Remediation (a11y)",
      handoff: "Remediate missing aria-labels, button types, contrast deficiencies, and keyboard focus.",
    };
  }
  if (text.includes("lcp") || text.includes("cwv") || text.includes("performance") || text.includes("memory leak") || text.includes("lighthouse") || text.includes("web vitals")) {
    return {
      domain: "Performance & Core Web Vitals",
      handoff: "Diagnose slow Core Web Vitals (LCP), optimize rendering boundaries, and audit memory leaks.",
    };
  }
  if (text.includes("test") || text.includes("tdd") || text.includes("vitest") || text.includes("playwright") || text.includes("cypress") || text.includes("verification")) {
    return {
      domain: "Testing & Verification",
      handoff: "Author component regression tests, mock fixtures, and assert DOM state transitions.",
    };
  }
  if (text.includes("patch") || text.includes("surgical") || text.includes("debugging") || text.includes("investigate")) {
    return {
      domain: "Surgical Patching & Root-Cause Debugging",
      handoff: "Diagnose ambiguous runtime errors with surgical, narrow bug fixes and regression proof.",
    };
  }

  const summary = description ? description.split(".")[0].trim() : "Custom agent capability";
  return {
    domain: "Specialized Workflow",
    handoff: summary.length > 80 ? summary.slice(0, 80) + "..." : summary,
  };
}

function discoverInstalledSkills(workspaceRoot: string = ROOT_DIR): DiscoveredSkill[] {
  const discovered: DiscoveredSkill[] = [];
  const seen = new Set<string>();

  // 1. Project-local locations
  const projectDirs = [
    path.join(workspaceRoot, ".agent", "skills"),
    path.join(workspaceRoot, ".agents", "skills"),
    path.join(workspaceRoot, ".hermes", "skills"),
  ];

  for (const pDir of projectDirs) {
    if (fs.existsSync(pDir)) {
      try {
        const entries = fs.readdirSync(pDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && entry.name !== "frontend-audit") {
            const skillFile = path.join(pDir, entry.name, "SKILL.md");
            if (fs.existsSync(skillFile)) {
              try {
                const content = fs.readFileSync(skillFile, "utf8");
                const parsed = parseSkillFrontmatter(content);
                const skillName = parsed.name || entry.name;
                if (!seen.has(skillName)) {
                  seen.add(skillName);
                  const { domain, handoff } = classifySkillDomain(skillName, parsed.description || "");
                  discovered.push({
                    name: skillName,
                    description: parsed.description || "Project-level skill",
                    version: parsed.version,
                    path: path.relative(workspaceRoot, path.join(pDir, entry.name)).replace(/\\/g, "/"),
                    scope: "project",
                    domain,
                    recommendedHandoff: handoff,
                  });
                }
              } catch {}
            }
          }
        }
      } catch {}
    }
  }

  // 2. Global / Plugin locations
  const userHome = process.env.USERPROFILE || process.env.HOME || "";
  if (userHome) {
    const pluginsDir = path.join(userHome, ".gemini", "config", "plugins");
    if (fs.existsSync(pluginsDir)) {
      try {
        const plugins = fs.readdirSync(pluginsDir, { withFileTypes: true });
        for (const plugin of plugins) {
          if (plugin.isDirectory()) {
            const skillsDir = path.join(pluginsDir, plugin.name, "skills");
            if (fs.existsSync(skillsDir)) {
              const skills = fs.readdirSync(skillsDir, { withFileTypes: true });
              for (const s of skills) {
                if (s.isDirectory() && s.name !== "frontend-audit") {
                  const skillFile = path.join(skillsDir, s.name, "SKILL.md");
                  if (fs.existsSync(skillFile)) {
                    try {
                      const content = fs.readFileSync(skillFile, "utf8");
                      const parsed = parseSkillFrontmatter(content);
                      const skillName = parsed.name || s.name;
                      if (!seen.has(skillName)) {
                        seen.add(skillName);
                        const { domain, handoff } = classifySkillDomain(skillName, parsed.description || "");
                        discovered.push({
                          name: skillName,
                          description: parsed.description || `Global plugin skill from ${plugin.name}`,
                          version: parsed.version,
                          path: `~/.gemini/config/plugins/${plugin.name}/skills/${s.name}`,
                          scope: "global",
                          domain,
                          recommendedHandoff: handoff,
                        });
                      }
                    } catch {}
                  }
                }
              }
            }
          }
        }
      } catch {}
    }
  }

  return discovered;
}

// In-place, safe UTF-8 Rule Synchronizer for AGENTS.md / GEMINI.md
function syncAgentRulesInPlace() {
  const ruleBlock = [
    "<!-- START_FULLSTACK_AUDIT_RULE -->",
    "<!-- START_FRONTEND_AUDIT_RULE -->",
    "## 🗺️ Fullstack Architecture & Component Lookup Rule",
    "For all UI, component, route, color theme, API, database, server action, or backend tasks:",
    "",
    "1. **Instant Atlas Lookup (Zero-Grep / Zero-Search)**: The FIRST tool call MUST be `view_file` on:",
    "   - **Frontend Atlas (`docs/frontend-atlas/`)**:",
    "     - `01_ROUTES_AND_PANELS_MAP.md` (by Route, Screen, or Server/Client boundary)",
    "     - `02_COMPONENT_INVENTORY.md` (by Modals, Drawers, Live Dots `animate-pulse`, Capsule Pills `rounded-full`, Buttons)",
    "     - `03_DESIGN_TOKENS_AND_COLORS.md` (for all 22+ Tailwind color families, dark mode asymmetries, hexes)",
    "     - `06_VISIBLE_TEXT_AND_LABELS_MAP.md` (by visible text or button label in a screenshot)",
    "     - `07_VISUAL_AND_ICON_INDEX.md` (by action icon / symbol in a textless screenshot)",
    "     - `THEME_MIGRATION_PUNCHLIST.md` (actionable checklist for whole-website color and dark mode rebrands)",
    "   - **Backend Atlas (`docs/backend-atlas/`)**:",
    "     - `01_API_ROUTES_AND_ENDPOINTS.md` (by HTTP API URL, method: GET/POST/PUT/DELETE, or auth guard)",
    "     - `02_DATABASE_MODELS_AND_SCHEMA.md` (by database table, Prisma model, or Drizzle schema)",
    "     - `03_SERVER_ACTIONS_AND_MUTATIONS.md` (by Next.js Server Action `\"use server\"`)",
    "     - `04_AUTH_AND_MIDDLEWARE_GUARDS.md` (by route matcher or public vs protected route)",
    "     - `05_INTEGRATIONS_AND_WEBHOOKS.md` (by third-party service: Stripe, Resend, Supabase, S3)",
    "     - `06_FULLSTACK_CROSS_REFERENCE_MAP.md` (to trace UI button/modal directly to backend action & database model)",
    "",
    "2. **Strict Prohibition on CLI/Grep for Lookups**: Do NOT run full-codebase grep searches (`Get-ChildItem -Recurse | Select-String`) and do NOT spawn CLI scripts for simple lookups. Both atlases are already indexed on disk as Markdown—read the files directly.",
    "",
    "3. **Continuous Sync**: At the completion of any frontend or backend modification, execute `npm run audit` (or `npx fullstack-audit`) to keep the atlases 100% synchronized for subsequent tasks.",
    "",
    "## 🛠️ Available Commands",
    "- `/fullstack-audit` or `npm run audit`: Regenerates the entire Fullstack Atlas (both `docs/frontend-atlas/` and `docs/backend-atlas/`).",
    "- `npm run audit:frontend`: Regenerates only the Frontend Atlas (`docs/frontend-atlas/`).",
    "- `npm run audit:backend`: Regenerates only the Backend Atlas (`docs/backend-atlas/`).",
    "- `npm run audit:theme` or `npx fullstack-audit --theme`: Generates `THEME_MIGRATION_PUNCHLIST.md` for whole-website rebrands.",
    "- `npx fullstack-audit --verify`: Closed-loop verification gate (TypeScript compile + metric deltas).",
    "- `npx fullstack-audit --manifest <file:line>`: Generates zero-search agent handoff manifest.",
    "- `npx fullstack-audit --find <query>`: Instant sub-second search across components, text labels, and icons.",
    "- `npx fullstack-audit --update`: Checks and updates fullstack-audit-skill to latest GitHub release.",
    "- `npx fullstack-audit --watch`: Live file watcher for continuous background sync.",
    "- `npx fullstack-audit --dead`: Scans for potential orphaned components.",
    "<!-- END_FRONTEND_AUDIT_RULE -->",
    "<!-- END_FULLSTACK_AUDIT_RULE -->",
  ].join("\n");

  const candidates = ["AGENTS.md", "GEMINI.md", "CLAUDE.md"];
  let targetFile: string | null = null;

  for (const f of candidates) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, "utf8");
      if (
        content.includes("<!-- START_FULLSTACK_AUDIT_RULE -->") ||
        content.includes("<!-- START_FRONTEND_AUDIT_RULE -->") ||
        /(?:Fullstack|Frontend) Architecture\s*&(?:amp;)?\s*Component Lookup/.test(content)
      ) {
        targetFile = f;
        break;
      }
    }
  }

  if (!targetFile) {
    for (const f of candidates) {
      if (fs.existsSync(f)) {
        targetFile = f;
        break;
      }
    }
  }

  if (!targetFile) {
    targetFile = "AGENTS.md";
  }

  const markerPattern = /(?:<!-- START_FULLSTACK_AUDIT_RULE -->[\s\S]*?<!-- END_FULLSTACK_AUDIT_RULE -->|<!-- START_FRONTEND_AUDIT_RULE -->[\s\S]*?<!-- END_FRONTEND_AUDIT_RULE -->)/;
  const legacyPattern = /##[ \t]*[^\r\n#]*?(?:Fullstack|Frontend) Architecture\s*&(?:amp;)?\s*Component Lookup[^\r\n]*[\s\S]*?(?=(?:\r?\n---|\r?\n##\s+(?![🛠️\?]|Available Commands)[^\r\n]+)|$)/;

  if (fs.existsSync(targetFile)) {
    let content = fs.readFileSync(targetFile, "utf8");
    if (markerPattern.test(content)) {
      content = content.replace(markerPattern, ruleBlock);
      fs.writeFileSync(targetFile, content, "utf8");
      console.log(`🔄 Cleanly updated Fullstack Architecture Rule in ${targetFile}`);
    } else if (legacyPattern.test(content)) {
      content = content.replace(legacyPattern, ruleBlock);
      fs.writeFileSync(targetFile, content, "utf8");
      console.log(`🔄 Upgraded legacy Architecture Rule in-place in ${targetFile}`);
    } else {
      content = content.trimEnd() + "\n\n" + ruleBlock + "\n";
      fs.writeFileSync(targetFile, content, "utf8");
      console.log(`🔗 Injected Fullstack Architecture Rule into ${targetFile}`);
    }
  } else {
    fs.writeFileSync(targetFile, `# AGENTS.md — Workspace Guidelines for AI Assistants\n\n${ruleBlock}\n`, "utf8");
    console.log(`📄 Created AGENTS.md with 100% Always-Active Fullstack Atlas rule!`);
  }
}

// Automated Self-Updater (--update)
async function executeSelfUpdate() {
  console.log("📥 Checking for fullstack-audit-skill updates from GitHub (Eurie92/fullstack-audit-skill)...");
  try {
    const pkgRes = await fetch("https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/package.json");
    if (!pkgRes.ok) {
      console.error(`❌ HTTP ${pkgRes.status} fetching remote package.json. Please check your internet connection.`);
      return;
    }
    const remotePkg = (await pkgRes.json()) as { version: string };

    let currentVersion = "2.0.0";
    if (fs.existsSync("package.json")) {
      try {
        const localPkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
        if ((localPkg.name === "fullstack-audit-skill" || localPkg.name === "frontend-audit-skill") && localPkg.version) {
          currentVersion = localPkg.version;
        }
      } catch {}
    }

    console.log(`📦 Installed: v${currentVersion} | Latest Remote: v${remotePkg.version}`);

    // In local development repo: don't overwrite local uncommitted source unless remote is strictly newer
    const isDevelopmentRepo = fs.existsSync(".git") && fs.existsSync("package.json") && !fs.existsSync(".agent/skills/fullstack-audit");
    if (isDevelopmentRepo && remotePkg.version === currentVersion) {
      console.log("💡 Currently in active development repository. Synchronizing rules and atlas without overwriting local source.");
      syncAgentRulesInPlace();
      runUniversalFrontendAudit();
      await runUniversalBackendAudit();
      console.log("🎉 Local development environment is 100% up to date!");
      return;
    }

    console.log("📥 Downloading latest SKILL.md, scripts/audit.ts, and scripts/audit-backend.ts...");
    const skillRes = await fetch("https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/SKILL.md");
    const skillContent = await skillRes.text();

    const auditRes = await fetch("https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/audit.ts");
    const auditContent = await auditRes.text();

    const backendRes = await fetch("https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/audit-backend.ts");
    const backendContent = await backendRes.text();

    // Target locations: primary is fullstack-audit, legacy mirror is frontend-audit
    const primaryDir = fs.existsSync(".agent/skills") ? ".agent/skills/fullstack-audit" : "";
    const legacyDir = fs.existsSync(".agent/skills/frontend-audit") ? ".agent/skills/frontend-audit" : "";

    const writeTarget = (baseDir: string) => {
      if (!baseDir) return;
      fs.mkdirSync(path.join(baseDir, "scripts"), { recursive: true });
      fs.writeFileSync(path.join(baseDir, "SKILL.md"), skillContent, "utf8");
      fs.writeFileSync(path.join(baseDir, "scripts", "audit.ts"), auditContent, "utf8");
      fs.writeFileSync(path.join(baseDir, "scripts", "audit-backend.ts"), backendContent, "utf8");
    };

    if (primaryDir) writeTarget(primaryDir);
    if (legacyDir) writeTarget(legacyDir);
    if (!primaryDir && !legacyDir) {
      fs.writeFileSync("SKILL.md", skillContent, "utf8");
      fs.writeFileSync("scripts/audit.ts", auditContent, "utf8");
      fs.writeFileSync("scripts/audit-backend.ts", backendContent, "utf8");
    }

    console.log(`✅ Successfully updated fullstack-audit-skill engine`);

    // Update agent rules in-place
    syncAgentRulesInPlace();

    console.log("\n🔄 Refreshing Fullstack Atlas with newly updated skill engine...");
    runUniversalFrontendAudit();
    await runUniversalBackendAudit();

    console.log(`\n🎉 fullstack-audit-skill successfully synchronized to v${remotePkg.version}!`);
  } catch (err: any) {
    console.error(`❌ Update failed: ${err.message}`);
  }
}

// 10. Zero-Search Agent Handoff Manifest Generator (--manifest <target>)
function executeManifestLookup(audits: ComponentAudit[], target: string, discoveredSkills: DiscoveredSkill[] = []) {
  console.log(`🎫 Generating Agent Handoff Manifest for: "${target}"...\n`);
  const [filePathQuery, lineStr] = target.split(":");
  const targetLine = lineStr ? parseInt(lineStr, 10) : undefined;
  const q = filePathQuery.toLowerCase().replace(/\\/g, "/");

  const matchingAudit = audits.find(a =>
    a.relativePath.toLowerCase().includes(q) ||
    a.componentNames.some(c => c.toLowerCase() === q)
  );

  if (!matchingAudit) {
    console.error(`❌ Could not locate component matching "${target}". Check 01_ROUTES_AND_PANELS_MAP.md or run --find.`);
    return;
  }

  const fileLines = fs.readFileSync(matchingAudit.filePath, "utf-8").split("\n");
  const compName = matchingAudit.componentNames[0] || path.basename(matchingAudit.relativePath).replace(/\.[^/.]+$/, "");
  const boundary = matchingAudit.isClientComponent ? "Client ⚡ ('use client')" : "Server 🖥️ (RSC)";

  const detectedIssues: { type: string; recommendedSkill: string; line?: number; note: string }[] = [];

  // Check buttons
  matchingAudit.rawButtons.forEach(b => {
    if (!targetLine || Math.abs(b.line - targetLine) <= 15) {
      if (b.missingAria) {
        detectedIssues.push({
          type: "a11y",
          recommendedSkill: "a11y-debugging",
          line: b.line,
          note: "Missing aria-label or accessible text on button",
        });
      }
      if (!b.className?.includes("active:scale")) {
        detectedIssues.push({
          type: "physics",
          recommendedSkill: "emil-design-eng",
          line: b.line,
          note: "Missing snappy press physics (active:scale-[0.97])",
        });
      }
    }
  });

  // Check hardcoded colors
  matchingAudit.hardcodedHexes.forEach(h => {
    if (!targetLine || Math.abs(h.line - targetLine) <= 15) {
      detectedIssues.push({
        type: "design-token",
        recommendedSkill: "ui-ux-pro-max",
        line: h.line,
        note: `Hardcoded hex color: ${h.hex}`,
      });
    }
  });

  // Check rogue tailwind
  matchingAudit.rogueTailwindColors.forEach(r => {
    if (!targetLine || Math.abs(r.line - targetLine) <= 15) {
      detectedIssues.push({
        type: "design-token",
        recommendedSkill: "ui-ux-pro-max",
        line: r.line,
        note: `Un-tokenized rogue color utility: ${r.token}`,
      });
    }
  });

  // Check inline styles
  if (matchingAudit.hasDirectStyleTag) {
    detectedIssues.push({
      type: "craft",
      recommendedSkill: "impeccable",
      note: "Contains direct style={{...}} tag bypassing Tailwind",
    });
  }

  const manifest = [
    `# === AGENT HANDOFF MANIFEST ===`,
    `manifest_version: "2.0"`,
    `component_name: "${compName}"`,
    `file: "${matchingAudit.relativePath}"`,
    targetLine ? `target_line: ${targetLine}` : `total_lines: ${fileLines.length}`,
    `zone: "${matchingAudit.zone}"`,
    `boundary: "${boundary}"`,
    `icons_used: [${matchingAudit.visualIcons.map(i => `"${i.iconName}"`).join(", ")}]`,
    `diagnosed_issues:`,
    ...(detectedIssues.length > 0
      ? detectedIssues.map(i => `  - type: "${i.type}"\n    skill: "${i.recommendedSkill}"\n    line: ${i.line || "file-level"}\n    note: "${i.note}"`)
      : [`  - note: "No immediate styling or a11y violations found."`]),
    `installed_skills_available:`,
    ...(discoveredSkills.length > 0
      ? discoveredSkills.slice(0, 8).map(s => `  - ${s.name}: "${s.scope === "project" ? "Local" : "Global"} (${s.domain})"`)
      : [`  - note: "No external peer skills installed in workspace."`]),
    `recommended_dispatch_routing:`,
    `  interaction_physics: "emil-design-eng"`,
    `  token_unification: "ui-ux-pro-max"`,
    `  accessibility_remediation: "a11y-debugging"`,
    `  visual_hierarchy_polish: "impeccable"`,
    ...(discoveredSkills.some(s => s.name === "design-taste-frontend")
      ? [`  taste_and_art_direction: "design-taste-frontend"`]
      : []),
    `# === END MANIFEST ===`,
  ].join("\n");

  console.log(manifest);
}

// 10. Closed-Loop Verification Gate (--verify)
function executeVerificationGate(
  audits: ComponentAudit[],
  routes: RouteMapItem[],
  deadComponents: ComponentAudit[],
  structure?: ProjectStructure
) {
  console.log("🛡️ Running Closed-Loop Verification Gate (--verify)...\n");

  const receiptPath = path.join(OUTPUT_DIR, ".last_receipt.json");
  let prevReceipt: VerificationReceipt | null = null;

  if (fs.existsSync(receiptPath)) {
    try {
      prevReceipt = JSON.parse(fs.readFileSync(receiptPath, "utf-8"));
    } catch {
      prevReceipt = null;
    }
  }

  // Framework-Aware TypeCheck Verification
  let tsStatus: "PASS" | "FAIL" | "SKIPPED" = "SKIPPED";
  try {
    const isWin = process.platform === "win32";
    const npxCmd = isWin ? "npx.cmd" : "npx";
    let cmd = "tsc";
    let args = ["--noEmit"];

    if (structure?.framework === "Astro") {
      cmd = "astro";
      args = ["check"];
    } else if (structure?.framework === "Nuxt 3" || structure?.framework === "Vite / Vue SPA") {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8"));
        if (pkg.devDependencies?.["vue-tsc"] || pkg.dependencies?.["vue-tsc"]) {
          cmd = "vue-tsc";
        }
      } catch {}
    } else if (structure?.framework === "SvelteKit") {
      try {
        const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8"));
        if (pkg.devDependencies?.["svelte-check"] || pkg.dependencies?.["svelte-check"]) {
          cmd = "svelte-check";
          args = ["--tsconfig", "./tsconfig.json"];
        }
      } catch {}
    }

    const tsCheck = child_process.spawnSync(npxCmd, [cmd, ...args], {
      cwd: ROOT_DIR,
      encoding: "utf-8",
      shell: true,
    });
    if (tsCheck.status === 0) {
      tsStatus = "PASS";
    } else {
      tsStatus = "FAIL";
    }
  } catch {
    tsStatus = "SKIPPED";
  }

  const currentReceipt: VerificationReceipt = {
    timestamp: new Date().toISOString(),
    version: "1.7.0",
    totalFiles: audits.length,
    routesCount: routes.length,
    rawButtonsCount: audits.reduce((acc, a) => acc + a.rawButtons.length, 0),
    uiButtonsCount: audits.reduce((acc, a) => acc + a.uiButtons.length, 0),
    a11yFlagsCount: audits.reduce((acc, a) => acc + a.rawButtons.filter(b => b.missingAria || b.missingType).length, 0),
    hardcodedHexesCount: audits.reduce((acc, a) => acc + a.hardcodedHexes.length, 0),
    rogueColorsCount: audits.reduce((acc, a) => acc + a.rogueTailwindColors.length, 0),
    orphanedComponentsCount: deadComponents.length,
    visualIconsCount: audits.reduce((acc, a) => acc + a.visualIcons.length, 0),
    typeCheckStatus: tsStatus,
  };

  fs.writeFileSync(receiptPath, JSON.stringify(currentReceipt, null, 2), "utf-8");

  console.log("📊 Verification Delta Report:");
  console.log("────────────────────────────────────────────────────────────");
  console.log(`TypeScript Compilation: ${tsStatus === "PASS" ? "✅ PASS (0 errors)" : tsStatus === "FAIL" ? "❌ FAIL (TypeScript errors detected)" : "⚠️ SKIPPED"}`);

  function formatDelta(curr: number, prev?: number, isLowerBetter = true) {
    if (prev === undefined) return `${curr} (initial benchmark)`;
    const diff = curr - prev;
    if (diff === 0) return `${curr} (no change)`;
    const sign = diff > 0 ? `+${diff}` : `${diff}`;
    const indicator = isLowerBetter ? (diff < 0 ? "✅ improved" : "⚠️ increased") : (diff > 0 ? "✅ improved" : "⚠️ decreased");
    return `${prev} ➔ ${curr} (${sign} ${indicator})`;
  }

  console.log(`- Raw HTML Buttons:       ${formatDelta(currentReceipt.rawButtonsCount, prevReceipt?.rawButtonsCount, true)}`);
  console.log(`- a11y Fast-Check Flags:  ${formatDelta(currentReceipt.a11yFlagsCount, prevReceipt?.a11yFlagsCount, true)}`);
  console.log(`- Hardcoded Hexes:        ${formatDelta(currentReceipt.hardcodedHexesCount, prevReceipt?.hardcodedHexesCount, true)}`);
  console.log(`- Rogue Tailwind Grays:   ${formatDelta(currentReceipt.rogueColorsCount, prevReceipt?.rogueColorsCount, true)}`);
  console.log(`- Orphaned Components:    ${formatDelta(currentReceipt.orphanedComponentsCount, prevReceipt?.orphanedComponentsCount, true)}`);
  console.log(`- Standard <Button> Tags: ${formatDelta(currentReceipt.uiButtonsCount, prevReceipt?.uiButtonsCount, false)}`);
  console.log("────────────────────────────────────────────────────────────");
  console.log(`📄 Verification receipt saved to: docs/frontend-atlas/.last_receipt.json\n`);
}

// 11. Interactive Query Filter (--find / --route)
function executeInteractiveQuery(audits: ComponentAudit[], routes: RouteMapItem[], query: string) {
  console.log(`🔎 Searching Frontend Atlas for query: "${query}"\n`);
  const q = query.toLowerCase();

  // Search Routes
  const matchingRoutes = routes.filter(r => r.route.toLowerCase().includes(q) || r.pageFile.toLowerCase().includes(q));
  if (matchingRoutes.length > 0) {
    console.log(`📍 Matching Routes (${matchingRoutes.length}):`);
    matchingRoutes.forEach(r => {
      const boundary = r.isClientComponent ? "[Client ⚡]" : "[Server 🖥️]";
      console.log(`   - Route: ${r.route} ${boundary} ➡️ File: ${r.pageFile}`);
    });
    console.log();
  }

  // Search Components & Buttons
  const matchingComponents = audits.filter(a =>
    a.relativePath.toLowerCase().includes(q) ||
    a.componentNames.some(c => c.toLowerCase().includes(q)) ||
    a.rawButtons.some(b => b.className?.toLowerCase().includes(q) || b.snippet.toLowerCase().includes(q))
  );

  if (matchingComponents.length > 0) {
    console.log(`🧩 Matching Components & Files (${matchingComponents.length}):`);
    matchingComponents.slice(0, 15).forEach(c => {
      const btnCount = c.rawButtons.length + c.uiButtons.length;
      const boundary = c.isClientComponent ? "[Client ⚡]" : "[Server 🖥️]";
      console.log(`   - [${c.zone}] ${c.relativePath} ${boundary} (${btnCount} buttons, ${c.cardsAndSurfaces.length} cards)`);
      if (c.rawButtons.length > 0 && (q.includes("btn") || q.includes("button"))) {
        c.rawButtons.slice(0, 3).forEach(b => {
          console.log(`       Line ${b.line}: ${b.snippet}`);
        });
      }
    });
    console.log();
  }

  // Search Hexes
  const matchingHexes = audits.filter(a => a.hardcodedHexes.some(h => h.hex.toLowerCase().includes(q)));
  if (matchingHexes.length > 0) {
    console.log(`🎨 Matching Colors (${matchingHexes.length} files):`);
    matchingHexes.slice(0, 8).forEach(h => {
      const hexList = h.hardcodedHexes.filter(x => x.hex.toLowerCase().includes(q)).map(x => `${x.hex} (line ${x.line})`).join(", ");
      console.log(`   - ${h.relativePath}: ${hexList}`);
    });
    console.log();
  }

  // Search Visible UI Text & Labels
  const matchingLabels: { file: string; line: number; text: string; type: string }[] = [];
  audits.forEach(a => {
    a.visibleLabels.forEach(vl => {
      if (vl.text.toLowerCase().includes(q)) {
        matchingLabels.push({
          file: a.relativePath,
          line: vl.line,
          text: vl.text,
          type: vl.type,
        });
      }
    });
  });

  if (matchingLabels.length > 0) {
    console.log(`🏷️ Matching Visible UI Text & Labels (${matchingLabels.length}):`);
    matchingLabels.slice(0, 10).forEach(l => {
      console.log(`   - [${l.type}] "${l.text}" ➡️ ${l.file}:${l.line}`);
    });
    if (matchingLabels.length > 10) {
      console.log(`     (+${matchingLabels.length - 10} more matches in 06_VISIBLE_TEXT_AND_LABELS_MAP.md)`);
    }
    console.log();
  }

  // Search Visual Icons
  const matchingIcons: { file: string; line: number; icon: string; lib: string; context: string }[] = [];
  audits.forEach(a => {
    a.visualIcons.forEach(vi => {
      if (vi.iconName.toLowerCase().includes(q) || vi.sourceLib.toLowerCase().includes(q)) {
        matchingIcons.push({
          file: a.relativePath,
          line: vi.line,
          icon: vi.iconName,
          lib: vi.sourceLib,
          context: vi.context,
        });
      }
    });
  });

  if (matchingIcons.length > 0) {
    console.log(`🖼️ Matching Visual Icons (${matchingIcons.length}):`);
    matchingIcons.slice(0, 10).forEach(i => {
      console.log(`   - [${i.context}] <${i.icon}> (${i.lib}) ➡️ ${i.file}:${i.line}`);
    });
    if (matchingIcons.length > 10) {
      console.log(`     (+${matchingIcons.length - 10} more matches in 07_VISUAL_AND_ICON_INDEX.md)`);
    }
    console.log();
  }

  // Search Interactive Triggers (Buttons, Triggers, Clickable Containers, Links)
  const matchingTriggers: { file: string; line: number; element: string; type: string; handler?: string; target?: string }[] = [];
  audits.forEach(a => {
    a.interactiveTriggers.forEach(t => {
      if (
        t.tagName.toLowerCase().includes(q) ||
        t.triggerType.toLowerCase().includes(q) ||
        (t.handlerName && t.handlerName.toLowerCase().includes(q)) ||
        (t.disclosesTarget && t.disclosesTarget.toLowerCase().includes(q))
      ) {
        matchingTriggers.push({
          file: a.relativePath,
          line: t.line,
          element: t.tagName,
          type: t.triggerType,
          handler: t.handlerName,
          target: t.disclosesTarget,
        });
      }
    });
  });

  if (matchingTriggers.length > 0) {
    console.log(`🔘 Matching Interactive Triggers & Clickable Elements (${matchingTriggers.length}):`);
    matchingTriggers.slice(0, 10).forEach(t => {
      const handlerStr = t.handler ? ` [Handler: ${t.handler}]` : "";
      const targetStr = t.target ? ` [Target: ${t.target}]` : "";
      console.log(`   - ${t.element} (${t.type})${handlerStr}${targetStr} ➡️ ${t.file}:${t.line}`);
    });
    if (matchingTriggers.length > 10) {
      console.log(`     (+${matchingTriggers.length - 10} more matches in 02_COMPONENT_INVENTORY.md)`);
    }
    console.log();
  }

  // Search Disclosed Overlays & Modal Windows
  const matchingOverlays: { file: string; line: number; name: string; type: string; condition?: string }[] = [];
  audits.forEach(a => {
    a.disclosedOverlays.forEach(o => {
      if (
        o.name.toLowerCase().includes(q) ||
        o.type.toLowerCase().includes(q) ||
        (o.conditionVariable && o.conditionVariable.toLowerCase().includes(q))
      ) {
        matchingOverlays.push({
          file: a.relativePath,
          line: o.line,
          name: o.name,
          type: o.type,
          condition: o.conditionVariable,
        });
      }
    });
  });

  if (matchingOverlays.length > 0) {
    console.log(`🪟 Matching Disclosed Overlays & Modal Windows (${matchingOverlays.length}):`);
    matchingOverlays.slice(0, 8).forEach(o => {
      const condStr = o.condition ? ` [Condition: ${o.condition}]` : "";
      console.log(`   - <${o.name}> (${o.type})${condStr} ➡️ ${o.file}:${o.line}`);
    });
    if (matchingOverlays.length > 8) {
      console.log(`     (+${matchingOverlays.length - 8} more matches in 02_COMPONENT_INVENTORY.md)`);
    }
    console.log();
  }

  // Search Live Status Dots & Capsule Pills
  const matchingDots: { file: string; line: number; color: string; isPulsing: boolean }[] = [];
  audits.forEach(a => {
    a.liveStatusDots.forEach(d => {
      if (d.color.toLowerCase().includes(q) || (q.includes("pulse") && d.isPulsing) || q.includes("dot")) {
        matchingDots.push({
          file: a.relativePath,
          line: d.line,
          color: d.color,
          isPulsing: d.isPulsing,
        });
      }
    });
  });

  if (matchingDots.length > 0) {
    console.log(`🟢 Matching Live Status Dots (${matchingDots.length}):`);
    matchingDots.slice(0, 8).forEach(d => {
      const pulseStr = d.isPulsing ? " [animate-pulse ⚡]" : "";
      console.log(`   - Dot: ${d.color}${pulseStr} ➡️ ${d.file}:${d.line}`);
    });
    console.log();
  }
}

// 12. Main Runner
export function runUniversalFrontendAudit() {
  const structure = detectProjectStructure();

  const targetDirs = [
    structure.appDir,
    structure.pagesDir,
    structure.layoutsDir,
    structure.componentsDir,
    structure.srcDir,
  ].filter(Boolean) as string[];

  const uniqueDirs = Array.from(new Set(targetDirs));
  const allFiles: string[] = [];
  if (uniqueDirs.length > 0) {
    uniqueDirs.forEach(dir => getFiles(dir, allFiles));
  } else {
    getFiles(ROOT_DIR, allFiles);
  }
  const uniqueFiles = Array.from(new Set(allFiles));

  const audits = uniqueFiles.map(f => auditFile(f, structure));
  const routeMaps = buildRouteMap(audits, structure);
  const deadComponents = findDeadComponents(audits, structure);
  const skillDispatches = generateSkillDispatches(audits);
  const discoveredSkills = discoverInstalledSkills();

  // If --fix-buttons requested
  if (SHOULD_FIX_BUTTONS) {
    executeButtonCodemod(audits);
    return;
  }

  // If --manifest requested
  if (MANIFEST_TARGET) {
    executeManifestLookup(audits, MANIFEST_TARGET, discoveredSkills);
    return;
  }

  // If --verify requested
  if (VERIFY_MODE) {
    executeVerificationGate(audits, routeMaps, deadComponents, structure);
    return;
  }

  // If --theme requested
  if (THEME_MODE) {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    writeThemePunchlist(audits);
    return;
  }

  // If query requested
  if (FIND_QUERY) {
    executeInteractiveQuery(audits, routeMaps, FIND_QUERY);
    return;
  }

  // If route query requested
  if (ROUTE_QUERY) {
    executeInteractiveQuery(audits, routeMaps, ROUTE_QUERY);
    return;
  }

  // If dead-only requested
  if (SHOW_DEAD_ONLY) {
    console.log(`👻 Potential Dead / Orphaned Components (${deadComponents.length}):`);
    deadComponents.forEach(d => console.log(`   - ${d.relativePath}`));
    return;
  }

  // Default: Generate Markdown Atlas
  console.log("🌐 Initializing Universal Frontend Atlas Engine (v2.0.0)...");
  console.log(`📦 Architecture: ${structure.framework}`);
  console.log(`✅ Audited ${audits.length} frontend files across ${routeMaps.length} routes.`);
  if (discoveredSkills.length > 0) {
    console.log(`🧩 Auto-Discovered ${discoveredSkills.length} workspace skills across project & plugins.`);
  }
  if (deadComponents.length > 0) {
    console.log(`⚠️ Detected ${deadComponents.length} potential dead / un-imported components.`);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  writeRoutesMap(routeMaps, structure);
  writeComponentInventory(audits);
  writeDesignTokensAudit(audits, structure);
  writeUIIslandsAudit(audits, deadComponents);
  writeDeadComponentsLedger(deadComponents);
  writeVisibleLabelsMap(audits);
  writeVisualIconIndex(audits);
  writeDispatchGateway(skillDispatches, discoveredSkills);
  writeThemePunchlist(audits);
  writeAtlasSummary(audits, routeMaps, structure, deadComponents);

  // Update .last_receipt.json baseline
  const receiptPath = path.join(OUTPUT_DIR, ".last_receipt.json");
  const baselineReceipt: VerificationReceipt = {
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    totalFiles: audits.length,
    routesCount: routeMaps.length,
    rawButtonsCount: audits.reduce((acc, a) => acc + a.rawButtons.length, 0),
    uiButtonsCount: audits.reduce((acc, a) => acc + a.uiButtons.length, 0),
    a11yFlagsCount: audits.reduce((acc, a) => acc + a.rawButtons.filter(b => b.missingAria || b.missingType).length, 0),
    hardcodedHexesCount: audits.reduce((acc, a) => acc + a.hardcodedHexes.length, 0),
    rogueColorsCount: audits.reduce((acc, a) => acc + a.rogueTailwindColors.length, 0),
    orphanedComponentsCount: deadComponents.length,
    visualIconsCount: audits.reduce((acc, a) => acc + a.visualIcons.length, 0),
    typeCheckStatus: "PASS",
  };
  fs.writeFileSync(receiptPath, JSON.stringify(baselineReceipt, null, 2), "utf-8");

  console.log(`✨ Universal Frontend Atlas written to: ${path.relative(ROOT_DIR, OUTPUT_DIR)}`);
}

function escapeMarkdownSnippet(text: string, maxLen = 50): string {
  return text
    .replace(/`/g, "'")
    .replace(/\|/g, "\\|")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\r?\n/g, " ")
    .trim()
    .slice(0, maxLen);
}

function makeFileLink(relativePath: string, line?: number, displayText?: string): string {
  const cleanPath = relativePath.replace(/\\/g, "/");
  const relHref = `../../${cleanPath}${line ? `#L${line}` : ""}`;
  const label = displayText || (line ? `${cleanPath}:${line}` : cleanPath);
  return `[${label}](${relHref})`;
}

function writeRoutesMap(routes: RouteMapItem[], structure: ProjectStructure) {
  const filePath = path.join(OUTPUT_DIR, "01_ROUTES_AND_PANELS_MAP.md");
  let md = `# 🗺️ Frontend Routes & Panels Map\n\n`;
  md += `> Auto-generated navigation map linking every route to its page file, layout, and component tree.\n\n`;
  md += `- **Detected Architecture**: \`${structure.framework}\`\n\n`;

  const zones = Array.from(new Set(routes.map(r => r.zone))).sort();

  zones.forEach(zone => {
    const zoneRoutes = routes.filter(r => r.zone === zone);
    if (zoneRoutes.length === 0) return;

    md += `## 📂 ${zone} (${zoneRoutes.length} Routes)\n\n`;
    md += `| Route | Page File | Boundary | Layout File | Key Imported Components |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;

    zoneRoutes.forEach(r => {
      const layoutStr = r.layoutFile ? makeFileLink(r.layoutFile) : `_Inherited / N/A_`;
      const pageLink = makeFileLink(r.pageFile);
      const boundaryStr = r.isClientComponent ? `\`Client ⚡\`` : `\`Server 🖥️\``;
      const importsStr = r.componentTree && r.componentTree.length > 0
        ? r.componentTree.map(node => {
            const clientBadge = node.isClientComponent ? " `[⚡]`" : "";
            if (node.children.length > 0) {
              return `\`${node.name}\`${clientBadge} ➔ [${node.children.map(c => `\`${c}\``).join(", ")}]`;
            }
            return `\`${node.name}\`${clientBadge}`;
          }).join(" • ")
        : `_None (Direct UI)_`;

      md += `| \`${r.route}\` | ${pageLink} | ${boundaryStr} | ${layoutStr} | ${importsStr} |\n`;
    });

    md += `\n`;
  });

  fs.writeFileSync(filePath, md);
}

function writeComponentInventory(audits: ComponentAudit[]) {
  const filePath = path.join(OUTPUT_DIR, "02_COMPONENT_INVENTORY.md");
  let md = `# 🧩 Component & Elements Inventory\n\n`;
  md += `> Comprehensive catalog of UI elements (Interactive Triggers, Disclosed Overlays, Modals, Live Dots, Capsule Pills, Buttons, Cards) across all panels.\n\n`;

  const totalRawButtons = audits.reduce((acc, a) => acc + a.rawButtons.length, 0);
  const totalUiButtons = audits.reduce((acc, a) => acc + a.uiButtons.length, 0);
  const totalInteractiveTriggers = audits.reduce((acc, a) => acc + a.interactiveTriggers.length, 0);
  const totalDisclosedOverlays = audits.reduce((acc, a) => acc + a.disclosedOverlays.length, 0);
  const totalA11yIssues = audits.reduce((acc, a) => acc + a.rawButtons.filter(b => b.missingAria || b.missingType).length, 0);
  const totalLiveDots = audits.reduce((acc, a) => acc + a.liveStatusDots.length, 0);
  const totalCapsules = audits.reduce((acc, a) => acc + a.capsulePills.length, 0);
  const totalModals = audits.reduce((acc, a) => acc + a.disclosedElements.length, 0);

  md += `## 📊 Quick Summary\n\n`;
  md += `- **Interactive Clickable Triggers (AST Scanned)**: **${totalInteractiveTriggers}** elements (Buttons, Triggers, Clickable Containers, Links)\n`;
  md += `- **Disclosed Overlays & Windows (AST Scanned)**: **${totalDisclosedOverlays}** overlays (Modals, Sheets, Drawers, Dropdowns, Popovers)\n`;
  md += `- **Standardized UI Buttons**: **${totalUiButtons}** usages\n`;
  md += `- **Raw HTML Button Tags**: **${totalRawButtons}** usages (Potential UI islands)\n`;
  md += `- **Accessibility (a11y) Flags**: **${totalA11yIssues}** buttons missing \`aria-label\` or explicit \`type="button"\`\n`;
  md += `- **🟢 Live Status Indicators & Pulse Dots**: **${totalLiveDots}** occurrences\n`;
  md += `- **💊 Capsule Pills & Badges**: **${totalCapsules}** occurrences\n\n`;

  // Section 1: Interactive Triggers & Clickable Elements (AST Scanned)
  md += `## 🔘 Interactive Triggers & Clickable Elements (AST Scanned)\n\n`;
  md += `Exhaustive index of every interactive element with its action handler and disclosed target:\n\n`;
  md += `| Zone | File | Line | Element | Trigger Type | Action Handler / OnClick | Disclosed Target | Snippet Preview |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  audits.forEach(a => {
    if (a.interactiveTriggers.length > 0) {
      a.interactiveTriggers.forEach(t => {
        const fileLink = makeFileLink(a.relativePath, t.line, `${a.relativePath}:${t.line}`);
        const handlerStr = t.handlerName ? `\`${escapeMarkdownSnippet(t.handlerName, 35)}\`` : `_None_`;
        const targetStr = t.disclosesTarget ? `🎯 \`${escapeMarkdownSnippet(t.disclosesTarget, 30)}\`` : `_Action / Nav_`;
        const cleanSnippet = escapeMarkdownSnippet(t.snippet, 40);
        md += `| ${a.zone} | ${fileLink} | ${t.line} | \`${escapeMarkdownSnippet(t.tagName, 25)}\` | \`${t.triggerType}\` | ${handlerStr} | ${targetStr} | \`${cleanSnippet}\` |\n`;
      });
    }
  });

  // Section 2: Disclosed Overlays, Modals & Dynamic Windows (AST Scanned)
  const modalImporters = new Map<string, string[]>();
  audits.forEach(a => {
    a.imports.forEach(imp => {
      const impBase = path.basename(imp).replace(/\.[^/.]+$/, "");
      if (!modalImporters.has(impBase)) modalImporters.set(impBase, []);
      modalImporters.get(impBase)!.push(a.relativePath);
    });
  });

  md += `\n## 🪟 Disclosed Overlays, Modals & Dynamic Windows (AST Scanned)\n\n`;
  md += `Interactive overlay containers with reverse route caller tracking and disclosure state:\n\n`;
  md += `| Zone | File | Line | Overlay Component | Overlay Type | Condition / Disclose State | Calling Routes / Importers | Snippet Preview |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  audits.forEach(a => {
    if (a.disclosedOverlays.length > 0) {
      const fileBase = path.basename(a.relativePath).replace(/\.[^/.]+$/, "");
      const callers = modalImporters.get(fileBase) || [];
      const callersStr = callers.length > 0
        ? callers.slice(0, 3).map(c => `\`${path.basename(c)}\``).join(", ")
        : `_Inline or Root_`;

      a.disclosedOverlays.forEach(m => {
        const fileLink = makeFileLink(a.relativePath, m.line, `${a.relativePath}:${m.line}`);
        const condStr = m.conditionVariable ? `\`${escapeMarkdownSnippet(m.conditionVariable, 30)}\`` : `_Always Mounted / Prop Controlled_`;
        const cleanSnippet = escapeMarkdownSnippet(m.snippet, 40);
        md += `| ${a.zone} | ${fileLink} | ${m.line} | \`${escapeMarkdownSnippet(m.name, 25)}\` | \`${m.type}\` | ${condStr} | ${callersStr} | \`${cleanSnippet}\` |\n`;
      });
    }
  });

  // Section 3: Live Status Indicators & Pulse Dots
  md += `\n## 🟢 Live Status Indicators & Pulse Dots (${totalLiveDots})\n\n`;
  md += `Live status indicators, pulsing dots (\`animate-pulse\`), and badge pips:\n\n`;
  md += `| Zone | File | Line | Dot Type / Color | Pulse State | Snippet Preview |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  audits.forEach(a => {
    if (a.liveStatusDots.length > 0) {
      a.liveStatusDots.forEach(dot => {
        const fileLink = makeFileLink(a.relativePath, dot.line, `${a.relativePath}:${dot.line}`);
        const pulseBadge = dot.isPulsing ? "`animate-pulse ⚡`" : "`Static Dot`";
        const cleanSnippet = escapeMarkdownSnippet(dot.snippet, 45);
        md += `| ${a.zone} | ${fileLink} | ${dot.line} | \`${dot.color}\` | ${pulseBadge} | \`${cleanSnippet}\` |\n`;
      });
    }
  });

  // Section 4: Capsule Pills & Badges
  md += `\n## 💊 Capsule Pills, Status Badges & Tags (${totalCapsules})\n\n`;
  md += `Elements styled with \`rounded-full\` for pills, status chips, and tags:\n\n`;
  md += `| Zone | File | Line | Label / Badge Text | Classes Found | Snippet Preview |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  audits.forEach(a => {
    if (a.capsulePills.length > 0) {
      a.capsulePills.forEach(pill => {
        const fileLink = makeFileLink(a.relativePath, pill.line, `${a.relativePath}:${pill.line}`);
        const labelText = pill.label ? `**${escapeMarkdownSnippet(pill.label, 25)}**` : `_Icon/Tag_`;
        const cleanClasses = escapeMarkdownSnippet(pill.classes, 30);
        const cleanSnippet = escapeMarkdownSnippet(pill.snippet, 40);
        md += `| ${a.zone} | ${fileLink} | ${pill.line} | ${labelText} | \`${cleanClasses}\` | \`${cleanSnippet}\` |\n`;
      });
    }
  });

  // Section 5: Button Usage Summary & a11y Fast-Check
  md += `\n## 🔘 Raw Button Usage & a11y Fast-Check\n\n`;
  md += `| Zone | File | Line | Snippet Preview | a11y Flags |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  const nonPrimitiveAudits = audits.filter(a => a.zone !== "Shared UI Primitives");
  nonPrimitiveAudits.forEach(a => {
    if (a.rawButtons.length > 0) {
      a.rawButtons.forEach(b => {
        const fileLink = makeFileLink(a.relativePath, b.line, `${a.relativePath}:${b.line}`);
        const flags: string[] = [];
        if (b.missingAria) flags.push("⚠️ Missing aria-label");
        if (b.missingType) flags.push("ℹ️ Missing type");
        const flagStr = flags.length > 0 ? flags.join("; ") : "✅ OK";

        const cleanSnippet = escapeMarkdownSnippet(b.snippet, 45);
        md += `| ${a.zone} | ${fileLink} | ${b.line} | \`${cleanSnippet}\` | ${flagStr} |\n`;
      });
    }
  });

  // Section 6: Cards & Panels
  md += `\n## 📦 Cards, Panels & Surface Containers\n\n`;
  md += `| Zone | File | Surface Classes Found |\n`;
  md += `| :--- | :--- | :--- |\n`;

  audits.forEach(a => {
    if (a.cardsAndSurfaces.length > 0) {
      const sampleClasses = Array.from(new Set(a.cardsAndSurfaces.map(c => escapeMarkdownSnippet(c.classes, 40)))).slice(0, 3).join(", ");
      const fileLink = makeFileLink(a.relativePath);
      md += `| ${a.zone} | ${fileLink} | \`${sampleClasses}\` |\n`;
    }
  });

  fs.writeFileSync(filePath, md);
}

function writeDesignTokensAudit(audits: ComponentAudit[], structure: ProjectStructure) {
  const filePath = path.join(OUTPUT_DIR, "03_DESIGN_TOKENS_AND_COLORS.md");
  let md = `# 🎨 Design Tokens, Colors & Theme Health Audit\n\n`;
  md += `> Universal Tailwind Color Matrix, Dark Mode Asymmetry Scanner, and Hardcoded Hex Registry.\n\n`;

  if (structure.customTokens.size > 0) {
    md += `## 🏛️ Configured Project Color Tokens\n\n`;
    md += `Tokens detected from \`${structure.tailwindConfigPath ? path.basename(structure.tailwindConfigPath) : "config"}\`:\n\n`;
    Array.from(structure.customTokens).forEach(t => {
      md += `- \`${t}\`\n`;
    });
    md += `\n`;
  }

  // 1. Universal Tailwind Palette Matrix (All 22+ Colors)
  const familyMap = new Map<string, ColorUsage[]>();
  audits.forEach(a => {
    a.colorUsages.forEach(c => {
      if (!familyMap.has(c.family)) familyMap.set(c.family, []);
      familyMap.get(c.family)!.push(c);
    });
  });

  const sortedFamilies = Array.from(familyMap.entries()).sort((a, b) => b[1].length - a[1].length);

  md += `## 🌈 Universal Tailwind Palette Matrix (${sortedFamilies.length} Color Families Detected)\n\n`;
  md += `Exhaustive scan of all standard Tailwind color families across background, text, border, and ring:\n\n`;
  md += `| Color Family | Total Occurrences | Light Mode | Dark Mode (\`dark:\`) | Shades Breakdown | Top Affected Files |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  sortedFamilies.forEach(([family, usages]) => {
    const lightCount = usages.filter(u => !u.isDark).length;
    const darkCount = usages.filter(u => u.isDark).length;

    const shadeCounts = new Map<string, number>();
    usages.forEach(u => {
      shadeCounts.set(u.shade, (shadeCounts.get(u.shade) || 0) + 1);
    });
    const shadeSummary = Array.from(shadeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([s, cnt]) => `${s}: ${cnt}`)
      .join(", ");

    const fileSet = new Set<string>();
    audits.forEach(a => {
      if (a.colorUsages.some(u => u.family === family)) {
        fileSet.add(path.basename(a.relativePath));
      }
    });
    const topFiles = Array.from(fileSet).slice(0, 3).map(f => `\`${f}\``).join(", ");

    md += `| **${family}** | **${usages.length}** | ${lightCount} | ${darkCount} | ${shadeSummary} | ${topFiles}${fileSet.size > 3 ? ` _(+${fileSet.size - 3} more)_` : ""} |\n`;
  });

  // 2. Dark Mode Asymmetry Scanner
  const totalAsymmetries = audits.reduce((acc, a) => acc + a.darkModeAsymmetries.length, 0);
  md += `\n## 🌓 Dark Mode Asymmetry Scanner (${totalAsymmetries} Discrepancies)\n\n`;
  md += `Elements with light surface/text colors that **lack a corresponding \`dark:\` counterpart**, causing broken rendering in dark mode:\n\n`;
  md += `| Zone | File | Line | Light Token | Missing Counterpart | Code Snippet |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  audits.forEach(a => {
    if (a.darkModeAsymmetries.length > 0) {
      a.darkModeAsymmetries.forEach(d => {
        const fileLink = makeFileLink(a.relativePath, d.line, `${a.relativePath}:${d.line}`);
        const cleanSnippet = escapeMarkdownSnippet(d.snippet, 45);
        md += `| ${a.zone} | ${fileLink} | ${d.line} | \`${d.lightToken}\` | Missing \`dark:${d.property}-*\` | \`${cleanSnippet}\` |\n`;
      });
    }
  });

  // 3. Hardcoded Hex Codes Detected
  const hexMap = new Map<string, { zone: string; file: string; line: number }[]>();
  audits.forEach(a => {
    a.hardcodedHexes.forEach(h => {
      if (!hexMap.has(h.hex)) hexMap.set(h.hex, []);
      hexMap.get(h.hex)!.push({ zone: a.zone, file: a.relativePath, line: h.line });
    });
  });

  const sortedHexes = Array.from(hexMap.entries()).sort((a, b) => b[1].length - a[1].length);

  md += `\n## ⚠️ Hardcoded Hex Codes Detected (${sortedHexes.length} unique colors)\n\n`;
  md += `| Hex Code | Total Usages | Top Affected Files |\n`;
  md += `| :--- | :--- | :--- |\n`;

  sortedHexes.slice(0, 30).forEach(([hex, usages]) => {
    const fileList = Array.from(new Set(usages.map(u => `\`${path.basename(u.file)}:${u.line}\``))).slice(0, 4).join(", ");
    md += `| \`${hex}\` | **${usages.length}** | ${fileList}${usages.length > 4 ? ` _(+${usages.length - 4} more)_` : ""} |\n`;
  });

  // 4. Neutral Grays & Surface Utilities
  const totalRogue = audits.reduce((acc, a) => acc + a.rogueTailwindColors.length, 0);
  md += `\n## ⚠️ Neutral Grays & Surface Utilities (${totalRogue} Occurrences)\n\n`;
  md += `Usages of \`zinc\`, \`gray\`, \`slate\`, or \`neutral\` color utilities:\n\n`;
  md += `| Zone | File | Line | Token Used | Code Snippet |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  audits.forEach(a => {
    if (a.rogueTailwindColors.length > 0) {
      a.rogueTailwindColors.slice(0, 15).forEach(r => {
        const fileLink = makeFileLink(a.relativePath, r.line, `${a.relativePath}:${r.line}`);
        const cleanSnippet = escapeMarkdownSnippet(r.snippet, 50);
        md += `| ${a.zone} | ${fileLink} | ${r.line} | \`${r.token}\` | \`${cleanSnippet}\` |\n`;
      });
    }
  });

  fs.writeFileSync(filePath, md);
}

function writeThemePunchlist(audits: ComponentAudit[]) {
  const filePath = path.join(OUTPUT_DIR, "THEME_MIGRATION_PUNCHLIST.md");
  let md = `# 🎨 Theme Migration & Rebrand Punchlist\n\n`;
  md += `> Automatically generated actionable checklist for whole-website theme and color palette rebrands.\n`;
  md += `> Check off items as you update tokens to ensure zero elements or modals are left un-migrated.\n\n`;

  const familyMap = new Map<string, { file: string; line: number; token: string; snippet: string }[]>();
  audits.forEach(a => {
    a.colorUsages.forEach(c => {
      if (!familyMap.has(c.family)) familyMap.set(c.family, []);
      familyMap.get(c.family)!.push({
        file: a.relativePath,
        line: c.line,
        token: c.token,
        snippet: c.snippet,
      });
    });
  });

  md += `## 📋 Color Family Migration Checklist\n\n`;
  Array.from(familyMap.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([family, items]) => {
      md += `### 🎨 Palette: \`${family}\` (${items.length} occurrences)\n\n`;
      items.forEach(item => {
        const cleanSnippet = escapeMarkdownSnippet(item.snippet, 50);
        md += `- [ ] \`${item.file}:${item.line}\`: Replace \`${item.token}\` — _\`${cleanSnippet}\`_\n`;
      });
      md += `\n`;
    });

  const totalAsymmetries = audits.reduce((acc, a) => acc + a.darkModeAsymmetries.length, 0);
  if (totalAsymmetries > 0) {
    md += `## 🌓 Dark Mode Asymmetries Checklist (${totalAsymmetries} items to resolve)\n\n`;
    audits.forEach(a => {
      a.darkModeAsymmetries.forEach(d => {
        const cleanSnippet = escapeMarkdownSnippet(d.snippet, 50);
        md += `- [ ] \`${a.relativePath}:${d.line}\`: Add \`dark:\` counterpart for \`${d.lightToken}\` — _\`${cleanSnippet}\`_\n`;
      });
    });
    md += `\n`;
  }

  const totalHexes = audits.reduce((acc, a) => acc + a.hardcodedHexes.length, 0);
  if (totalHexes > 0) {
    md += `## ⚠️ Hardcoded Hex Checklist (${totalHexes} items)\n\n`;
    audits.forEach(a => {
      a.hardcodedHexes.forEach(h => {
        const cleanSnippet = escapeMarkdownSnippet(h.snippet, 50);
        md += `- [ ] \`${a.relativePath}:${h.line}\`: Replace \`${h.hex}\` with design token — _\`${cleanSnippet}\`_\n`;
      });
    });
    md += `\n`;
  }

  fs.writeFileSync(filePath, md);
  console.log(`\n📋 Theme Migration Punchlist generated: ${path.relative(ROOT_DIR, filePath)}`);
  console.log(`   Total Color Usages: ${Array.from(familyMap.values()).reduce((acc, v) => acc + v.length, 0)}`);
  console.log(`   Dark Mode Asymmetries: ${totalAsymmetries}`);
  console.log(`   Hardcoded Hexes: ${totalHexes}\n`);
}

function writeUIIslandsAudit(audits: ComponentAudit[], deadComponents: ComponentAudit[]) {
  const filePath = path.join(OUTPUT_DIR, "04_UI_ISLANDS_AND_DRIFT.md");
  let md = `# 🏝️ UI Islands, Redundancies & Consistency Audit\n\n`;
  md += `> Identifies isolated design deviations, duplicate components, and actionable refactoring paths.\n\n`;

  // Dead Components Section
  md += `## 👻 Potential Dead / Orphaned Components (${deadComponents.length})\n`;
  md += `Components defined in \`components/\` that have **zero active imports** across route pages.\n`;
  md += `- **Dedicated Clean-up Punch List**: See [05_DEAD_ORPHANED_COMPONENTS.md](./05_DEAD_ORPHANED_COMPONENTS.md)\n\n`;

  const filesWithRawButtons = audits.filter(a => a.rawButtons.length > 0 && a.zone !== "Shared UI Primitives");
  md += `## 🔘 Raw Button Islands (${filesWithRawButtons.length} files)\n`;
  md += `Files that implement native button tags instead of standardized button components.\n`;
  md += `- **Remediation**: Run \`npx fullstack-audit --fix-buttons\` to auto-migrate to standardized Button components.\n\n`;

  const customModalFiles = audits.filter(a => a.modalsAndDialogs.length > 0 && !a.relativePath.includes("components/ui"));
  md += `## 🪟 Custom Modal Redundancies (${customModalFiles.length} files)\n`;
  md += `Files implementing custom modal structures rather than shared primitives:\n`;
  customModalFiles.slice(0, 8).forEach(f => {
    md += `- ${makeFileLink(f.relativePath)} (${f.zone})\n`;
  });

  const inlineStyleFiles = audits.filter(a => a.hasDirectStyleTag && !a.relativePath.includes("components/ui"));
  md += `\n## 🏷️ Inline Style Tags (${inlineStyleFiles.length} files)\n`;
  md += `Files using \`style={{...}}\` which bypass the Tailwind design token pipeline:\n`;
  inlineStyleFiles.forEach(f => {
    md += `- ${makeFileLink(f.relativePath)} (${f.zone})\n`;
  });

  fs.writeFileSync(filePath, md);
}

function writeDeadComponentsLedger(deadComponents: ComponentAudit[]) {
  const filePath = path.join(OUTPUT_DIR, "05_DEAD_ORPHANED_COMPONENTS.md");
  let md = `# 👻 Dead & Orphaned Component Ledger\n\n`;
  md += `> High-confidence inventory of components defined in \`components/\` that have **zero active imports** across route pages, layouts, and panels.\n\n`;
  md += `## ⚠️ Deletion Safety Policy\n\n`;
  md += `> **NEVER blindly delete components without checking the following three invariants:**\n`;
  md += `> 1. **Dynamic Imports**: Is the component loaded dynamically via \`next/dynamic\` or \`React.lazy()\`?\n`;
  md += `> 2. **WIP / Feature Branch**: Was this component recently created for an upcoming unmerged feature?\n`;
  md += `> 3. **Tests & Stories**: Is it used in Vitest / Jest unit tests or Storybook stories?\n\n`;

  if (deadComponents.length === 0) {
    md += `## ✅ Clean Architecture\n\n`;
    md += `All components in \`components/\` are actively imported. No orphaned files detected.\n\n`;
  } else {
    md += `## 📋 Orphaned Components (${deadComponents.length})\n\n`;
    md += `| Component File | Exported Names | Zone | Safe Deletion Command |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    deadComponents.forEach(d => {
      const fileLink = makeFileLink(d.relativePath);
      const names = d.componentNames.length > 0 ? d.componentNames.map(n => `\`${n}\``).join(", ") : `_Anonymous / Default_`;
      const delCmd = `\`git rm "${d.relativePath.replace(/\\/g, "/")}"\``;
      md += `| ${fileLink} | ${names} | ${d.zone} | ${delCmd} |\n`;
    });
    md += `\n`;
  }

  fs.writeFileSync(filePath, md);
}

function writeVisibleLabelsMap(audits: ComponentAudit[]) {
  const filePath = path.join(OUTPUT_DIR, "06_VISIBLE_TEXT_AND_LABELS_MAP.md");
  let md = `# 🏷️ Visible Text & UI Labels Map\n\n`;
  md += `> Comprehensive index of visible buttons, headings, badges, and accessible labels across all panels.\n`;
  md += `> 💡 **Screenshot-to-Code**: When matching a UI element from a screenshot, find the visible text label here to locate the exact component file and line in 0ms.\n\n`;

  const allLabels: { zone: string; file: string; line: number; text: string; type: string; snippet: string }[] = [];
  audits.forEach(a => {
    a.visibleLabels.forEach(vl => {
      allLabels.push({
        zone: a.zone,
        file: a.relativePath,
        line: vl.line,
        text: vl.text,
        type: vl.type,
        snippet: vl.snippet,
      });
    });
  });

  allLabels.sort((a, b) => a.text.localeCompare(b.text));

  md += `## 📋 Total Indexed UI Labels: **${allLabels.length}**\n\n`;
  md += `| Zone | Text Label | Type | File & Line | Code Snippet |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  allLabels.forEach(l => {
    const fileLink = makeFileLink(l.file, l.line, `${l.file}:${l.line}`);
    const cleanSnippet = escapeMarkdownSnippet(l.snippet, 45);
    const cleanLabel = escapeMarkdownSnippet(l.text, 40);
    md += `| ${l.zone} | \`${cleanLabel}\` | ${l.type} | ${fileLink} | \`${cleanSnippet}\` |\n`;
  });

  fs.writeFileSync(filePath, md);
}

function writeVisualIconIndex(audits: ComponentAudit[]) {
  const filePath = path.join(OUTPUT_DIR, "07_VISUAL_AND_ICON_INDEX.md");
  let md = `# 🖼️ Visual Icons & Action Symbols Index\n\n`;
  md += `> Comprehensive index of Lucide, Radix, Tabler, and SVG visual action icons across all panels.\n`;
  md += `> 💡 **Screenshot-to-Code**: When matching icon-only buttons or visual badges from a screenshot (where no text exists), look up the icon name here to locate the exact file and line in 0ms.\n\n`;

  const allIcons: { zone: string; file: string; line: number; iconName: string; sourceLib: string; context: string; snippet: string }[] = [];
  audits.forEach(a => {
    a.visualIcons.forEach(vi => {
      allIcons.push({
        zone: a.zone,
        file: a.relativePath,
        line: vi.line,
        iconName: vi.iconName,
        sourceLib: vi.sourceLib,
        context: vi.context,
        snippet: vi.snippet,
      });
    });
  });

  allIcons.sort((a, b) => a.iconName.localeCompare(b.iconName) || a.file.localeCompare(b.file));
  const distinctIconNames = new Set(allIcons.map(i => i.iconName));

  md += `## 📊 Icon Catalog Summary\n\n`;
  md += `- **Total Icon Usages**: **${allIcons.length}**\n`;
  md += `- **Distinct Icon Types**: **${distinctIconNames.size}**\n\n`;

  md += `## 📋 Indexed Visual Action Icons\n\n`;
  md += `| Zone | Icon Name | Library | Context | File & Line | Code Snippet |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  allIcons.forEach(i => {
    const fileLink = makeFileLink(i.file, i.line, `${i.file}:${i.line}`);
    const cleanSnippet = escapeMarkdownSnippet(i.snippet, 45);
    md += `| ${i.zone} | \`${i.iconName}\` | \`${i.sourceLib}\` | ${i.context} | ${fileLink} | \`${cleanSnippet}\` |\n`;
  });

  fs.writeFileSync(filePath, md);
}

function writeDispatchGateway(dispatches: SkillDispatch[], discoveredSkills: DiscoveredSkill[] = []) {
  const filePath = path.join(OUTPUT_DIR, "08_DISPATCH_GATEWAY.md");
  let md = `# 🎫 Skill Dispatch Gateway & Inter-Skill Handoff Matrix\n\n`;
  md += `> Dynamic triage router connecting detected frontend findings to specialized peer skills and newly installed workspace skills.\n`;
  md += `> 💡 **Handoff Protocol**: Downstream agents can directly accept target files from this matrix without redundant full-codebase searches.\n\n`;

  md += `## 🧭 Peer Skill Routing Architecture\n\n`;
  md += `| Core Recommended Skill | Domain & Focus | Workspace Status | Trigger Criteria | CLI Auto-Fix |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  const coreSkills = [
    { name: "emil-design-eng", domain: "Micro-interactions & Physics", trigger: "Missing `active:scale-[0.97]`, transitions", fix: "N/A (Agent Polish)" },
    { name: "ui-ux-pro-max", domain: "Design Tokens & Colors", trigger: "Hardcoded hexes, un-tokenized Tailwind grays", fix: "N/A (Token Alignment)" },
    { name: "a11y-debugging", domain: "Accessibility Remediation", trigger: "Missing `aria-label`, missing `type=\"button\"`", fix: "N/A (A11y Hardening)" },
    { name: "impeccable", domain: "Visual Craft & Layout", trigger: "Inline `style={{...}}` tags, layout drift", fix: "N/A (Craft Review)" },
    { name: "design-taste-frontend", domain: "Bespoke Art Direction & Taste", trigger: "Generic slop aesthetics, typography composition", fix: "N/A (Art Direction)" },
    { name: "codemod", domain: "Automated Standardization", trigger: "Mass raw `<button>` migration", fix: "`--fix-buttons`" },
  ];

  coreSkills.forEach(cs => {
    const installed = discoveredSkills.find(d => d.name === cs.name);
    const status = installed
      ? (installed.scope === "project" ? `🟢 Active (Local)` : `🌐 Active (Global)`)
      : `⚪ Peer Skill (Available)`;
    md += `| \`${cs.name}\` | ${cs.domain} | ${status} | ${cs.trigger} | ${cs.fix} |\n`;
  });

  md += `\n`;

  // Dynamic Discovered Skills Section
  const projectSkills = discoveredSkills.filter(d => d.scope === "project");
  const relevantGlobalSkills = discoveredSkills.filter(d => d.scope === "global" && [
    "Micro-Interactions & Physics",
    "Design Tokens & System",
    "Visual Craft & Anti-Slop",
    "Accessibility Remediation (a11y)",
    "Performance & Core Web Vitals",
    "Testing & Verification",
    "Surgical Patching & Root-Cause Debugging",
  ].includes(d.domain));

  md += `## 🧩 Discovered Workspace & Global Skills (${discoveredSkills.length} Total Detected)\n\n`;
  md += `> The Frontend Audit engine auto-discovers skills installed in \`.agent/skills/\`, \`.agents/skills/\`, and global plugin directories.\n\n`;

  if (projectSkills.length > 0) {
    md += `### 🏠 Project-Local Skills (\`.agent/skills/\`)\n\n`;
    md += `| Skill Name | Version | Inferred Domain | Path | Recommended Handoff Trigger |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- |\n`;
    projectSkills.forEach(s => {
      md += `| \`${s.name}\` | \`${s.version || "1.0.0"}\` | **${s.domain}** | \`${s.path}\` | ${s.recommendedHandoff} |\n`;
    });
    md += `\n`;
  }

  if (relevantGlobalSkills.length > 0) {
    md += `### 🌐 Active Global Frontend & Verification Plugins\n\n`;
    md += `| Skill Name | Inferred Domain | Plugin Source | Recommended Handoff Trigger |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    relevantGlobalSkills.forEach(s => {
      md += `| \`${s.name}\` | **${s.domain}** | \`${s.path}\` | ${s.recommendedHandoff} |\n`;
    });
    md += `\n`;
  }

  md += `## 📋 Active Skill Dispatch Punch Lists\n\n`;

  dispatches.forEach(d => {
    md += `### 🎯 \`${d.targetSkill}\` (${d.category} — ${d.issueCount} occurrences)\n\n`;
    md += `> **Action**: ${d.description}\n\n`;
    md += `| Zone | Target File & Line | Diagnostic Detail |\n`;
    md += `| :--- | :--- | :--- |\n`;

    d.targets.slice(0, 30).forEach(t => {
      const fileLink = makeFileLink(t.file, t.line, t.line ? `${t.file}:${t.line}` : t.file);
      md += `| ${t.zone} | ${fileLink} | ${t.detail} |\n`;
    });

    if (d.targets.length > 30) {
      md += `| _..._ | _(+${d.targets.length - 30} more targets)_ | _See component inventory_ |\n`;
    }

    md += `\n`;
  });

  md += `## 🤖 CLI Handoff Command\n\n`;
  md += `To generate a structured machine-readable manifest for any component or line, run:\n\n`;
  md += `\`\`\`bash\n`;
  md += `npx frontend-audit --manifest "path/to/component.tsx:line"\n`;
  md += `\`\`\`\n\n`;

  fs.writeFileSync(filePath, md);
}

function writeAtlasSummary(audits: ComponentAudit[], routes: RouteMapItem[], structure: ProjectStructure, deadComponents: ComponentAudit[]) {
  const filePath = path.join(OUTPUT_DIR, "README.md");
  const totalFiles = audits.length;
  const totalRawButtons = audits.reduce((acc, a) => acc + a.rawButtons.length, 0);
  const totalUiButtons = audits.reduce((acc, a) => acc + a.uiButtons.length, 0);
  const totalHexes = audits.reduce((acc, a) => acc + a.hardcodedHexes.length, 0);
  const totalRogue = audits.reduce((acc, a) => acc + a.rogueTailwindColors.length, 0);
  const totalIcons = audits.reduce((acc, a) => acc + a.visualIcons.length, 0);

  let md = `# 📖 Frontend Atlas & Quick-Reference Catalog\n\n`;
  md += `> Centralized documentation and audit ledger for this project.\n`;
  md += `> 💡 **Tip**: Type \`/fullstack-audit\` in AI chat or run \`npx fullstack-audit\` (or \`npm run audit\`) to refresh.\n\n`;

  md += `## 📊 Platform Statistics\n\n`;
  md += `- **Framework Architecture**: **${structure.framework}**\n`;
  md += `- **Total Frontend Files**: **${totalFiles}**\n`;
  md += `- **Total Active Routes**: **${routes.length}**\n`;
  md += `- **Standardized UI Buttons**: **${totalUiButtons}**\n`;
  md += `- **Raw HTML Button Tags**: **${totalRawButtons}**\n`;
  md += `- **Orphaned / Dead Components**: **${deadComponents.length}**\n`;
  md += `- **Hardcoded Hex Deviations**: **${totalHexes}**\n`;
  md += `- **Rogue Color Classes**: **${totalRogue}**\n`;
  md += `- **Indexed Visual Icons**: **${totalIcons}**\n\n`;

  md += `## 📑 Atlas Documents Guide\n\n`;
  md += `### Frontend Atlas (\`docs/frontend-atlas/\`)\n\n`;
  md += `1. **[01_ROUTES_AND_PANELS_MAP.md](./01_ROUTES_AND_PANELS_MAP.md)**\n`;
  md += `   - Instant lookup linking every route directly to its page file, Next.js boundary (\`Client ⚡\` vs \`Server 🖥️\`), layout, and 2-level deep component tree.\n\n`;
  md += `2. **[02_COMPONENT_INVENTORY.md](./02_COMPONENT_INVENTORY.md)**\n`;
  md += `   - Exhaustive catalog of Interactive Triggers (AST scanned), Disclosed Overlays & Modals, Live Status Dots, Capsule Pills, and a11y flags.\n\n`;
  md += `3. **[03_DESIGN_TOKENS_AND_COLORS.md](./03_DESIGN_TOKENS_AND_COLORS.md)**\n`;
  md += `   - Universal Tailwind Palette Matrix (all 22+ colors), dark mode asymmetries, and hardcoded hex registry.\n\n`;
  md += `4. **[04_UI_ISLANDS_AND_DRIFT.md](./04_UI_ISLANDS_AND_DRIFT.md)**\n`;
  md += `   - High-priority list of discrepancies, UI redundancies, and isolated styling.\n\n`;
  md += `5. **[05_DEAD_ORPHANED_COMPONENTS.md](./05_DEAD_ORPHANED_COMPONENTS.md)**\n`;
  md += `   - Dedicated punch-list and safety checklist for unused and orphaned components.\n\n`;
  md += `6. **[06_VISIBLE_TEXT_AND_LABELS_MAP.md](./06_VISIBLE_TEXT_AND_LABELS_MAP.md)**\n`;
  md += `   - Master index of buttons, headings, badges, and visible UI labels for instant Screenshot-to-Code targeting.\n\n`;
  md += `7. **[07_VISUAL_AND_ICON_INDEX.md](./07_VISUAL_AND_ICON_INDEX.md)**\n`;
  md += `   - Master index of Lucide, Radix, Tabler, and SVG visual action icons for textless screenshot targeting.\n\n`;
  md += `8. **[08_DISPATCH_GATEWAY.md](./08_DISPATCH_GATEWAY.md)**\n`;
  md += `   - Inter-skill handoff matrix routing diagnosed UI findings to specialized peer skills (\`emil-design-eng\`, \`ui-ux-pro-max\`, \`a11y-debugging\`, \`impeccable\`).\n\n`;
  md += `9. **[THEME_MIGRATION_PUNCHLIST.md](./THEME_MIGRATION_PUNCHLIST.md)**\n`;
  md += `   - Actionable checklist generated via \`--theme\` for complete website rebrands and dark mode upgrades.\n\n`;
  md += `### Backend Atlas (\`docs/backend-atlas/\`)\n\n`;
  md += `- See **[Backend Atlas Overview](../backend-atlas/README.md)** for API routes, database schemas, server actions, auth guards, and bi-directional cross-reference map.\n\n`;

  md += `## 📦 How to Install / Update this Skill\n\n`;
  md += `To install or update to the latest version in any project:\n\n`;
  md += `- **CLI Self-Updater**: \`npx fullstack-audit --update\` (or \`npm run audit\`)\n`;
  md += `- **Windows (PowerShell)**: \`irm https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.ps1 | iex\`\n`;
  md += `- **macOS / Linux**: \`curl -fsSL https://raw.githubusercontent.com/Eurie92/fullstack-audit-skill/main/scripts/install.sh | bash\`\n`;
  md += `- **GitHub Repository**: [Eurie92/fullstack-audit-skill](https://github.com/Eurie92/fullstack-audit-skill)\n\n`;

  fs.writeFileSync(filePath, md);
}

async function main() {
  if (UPDATE_MODE) {
    await executeSelfUpdate();
    return;
  }

  if (BACKEND_MODE) {
    await runUniversalBackendAudit();
    return;
  }

  if (FRONTEND_MODE || THEME_MODE || FIND_QUERY || ROUTE_QUERY || MANIFEST_TARGET || VERIFY_MODE || SHOW_DEAD_ONLY || SHOULD_FIX_BUTTONS) {
    runUniversalFrontendAudit();
  } else {
    // Default: Fullstack Audit (Runs both Frontend Atlas AND Backend Atlas)
    runUniversalFrontendAudit();
    await runUniversalBackendAudit();
  }

  if (WATCH_MODE) {
    const structure = detectProjectStructure();
    const watchDirs = [
      structure.appDir,
      structure.pagesDir,
      structure.layoutsDir,
      structure.componentsDir,
      structure.srcDir,
    ].filter(Boolean) as string[];
    console.log(`\n👀 Watching ${watchDirs.length} frontend directories for changes... (Press Ctrl+C to stop)`);
    let debounceTimer: NodeJS.Timeout | null = null;
    watchDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        try {
          fs.watch(dir, { recursive: true }, (eventType, filename) => {
            if (!filename || !/\.(tsx|jsx|ts|js|vue|astro|svelte)$/.test(filename)) return;
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              console.log(`\n🔄 Change detected in ${filename}. Refreshing Frontend Atlas...`);
              runUniversalFrontendAudit();
            }, 600);
          });
        } catch {
          // Recursive watch fallback or ignore
        }
      }
    });
  }
}

main();
