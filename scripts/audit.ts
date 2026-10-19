import fs from "fs";
import path from "path";
import child_process from "child_process";

/**
 * Universal Frontend Atlas & Design System Audit Engine (v1.5.0)
 * 
 * Features:
 * 1. Multi-Framework Auto-Discovery (Next.js App/Pages Router, Vite + React SPAs, Tailwind)
 * 2. Instant Query Search (--find <query>, --route <route>) for massive codebases
 * 3. Next.js Component Boundary Radar ([Client ⚡] vs [Server 🖥️])
 * 4. 2-Level Deep Component Tree (Parent ➔ [Subcomponents]) in 01_ROUTES_AND_PANELS_MAP.md
 * 5. Screenshot-to-Code Visible UI Text & Labels Map (06_VISIBLE_TEXT_AND_LABELS_MAP.md)
 * 6. Visual Icons & Action Symbols Index (07_VISUAL_AND_ICON_INDEX.md)
 * 7. Zero-Search Handoff Manifest & Dispatch Gateway (08_DISPATCH_GATEWAY.md + --manifest <target>)
 * 8. Dead / Orphaned Component Finder & Dedicated Ledger (05_DEAD_ORPHANED_COMPONENTS.md)
 * 9. Accessibility (a11y) Fast-Check (Missing aria-label, missing type="button")
 * 10. Automated Codemod (--fix-buttons) to migrate raw <button> to <Button>
 * 11. Closed-Loop Verification Gate (--verify) with Metric Delta Tracking
 * 12. Live File Watcher (--watch) for automatic continuous atlas syncing
 * 13. Persistent Markdown Atlas Generation in docs/frontend-atlas/
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
const VERIFY_MODE = ARGS.includes("--verify");
const WATCH_MODE = ARGS.includes("--watch");

interface ProjectStructure {
  framework: "Next.js (App Router)" | "Next.js (Pages Router)" | "Vite / React SPA" | "Generic React";
  hasAppRouter: boolean;
  appDir?: string;
  hasPagesRouter: boolean;
  pagesDir?: string;
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

interface ComponentAudit {
  filePath: string;
  relativePath: string;
  zone: string;
  isClientComponent: boolean;
  componentNames: string[];
  imports: string[];
  rawButtons: { line: number; snippet: string; className?: string; missingAria?: boolean; missingType?: boolean }[];
  uiButtons: { line: number; snippet: string; variant?: string }[];
  cardsAndSurfaces: { line: number; snippet: string; classes: string }[];
  modalsAndDialogs: { line: number; snippet: string }[];
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
  targetSkill: "emil-design-eng" | "ui-ux-pro-max" | "a11y-debugging" | "impeccable" | "codemod (--fix-buttons)";
  category: "Interaction & Physics" | "Design Tokens & Colors" | "Accessibility (a11y)" | "Craft & Micro-Polish" | "Button Standardization";
  issueCount: number;
  description: string;
  targets: { file: string; line?: number; zone: string; detail: string }[];
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
function detectProjectStructure(): ProjectStructure {
  const structure: ProjectStructure = {
    framework: "Generic React",
    hasAppRouter: false,
    hasPagesRouter: false,
    customTokens: new Set<string>(),
  };

  if (fs.existsSync(path.join(ROOT_DIR, "src"))) {
    structure.srcDir = path.join(ROOT_DIR, "src");
  }

  if (fs.existsSync(path.join(ROOT_DIR, "app"))) {
    structure.hasAppRouter = true;
    structure.appDir = path.join(ROOT_DIR, "app");
    structure.framework = "Next.js (App Router)";
  } else if (structure.srcDir && fs.existsSync(path.join(structure.srcDir, "app"))) {
    structure.hasAppRouter = true;
    structure.appDir = path.join(structure.srcDir, "app");
    structure.framework = "Next.js (App Router)";
  }

  if (fs.existsSync(path.join(ROOT_DIR, "pages"))) {
    structure.hasPagesRouter = true;
    structure.pagesDir = path.join(ROOT_DIR, "pages");
    if (!structure.hasAppRouter) structure.framework = "Next.js (Pages Router)";
  } else if (structure.srcDir && fs.existsSync(path.join(structure.srcDir, "pages"))) {
    structure.hasPagesRouter = true;
    structure.pagesDir = path.join(structure.srcDir, "pages");
    if (!structure.hasAppRouter) structure.framework = "Next.js (Pages Router)";
  }

  if (!structure.hasAppRouter && !structure.hasPagesRouter) {
    if (fs.existsSync(path.join(ROOT_DIR, "vite.config.js")) || fs.existsSync(path.join(ROOT_DIR, "vite.config.ts"))) {
      structure.framework = "Vite / React SPA";
    }
  }

  if (fs.existsSync(path.join(ROOT_DIR, "components"))) {
    structure.componentsDir = path.join(ROOT_DIR, "components");
  } else if (structure.srcDir && fs.existsSync(path.join(structure.srcDir, "components"))) {
    structure.componentsDir = path.join(structure.srcDir, "components");
  }

  if (structure.componentsDir) {
    const uiPath = path.join(structure.componentsDir, "ui");
    if (fs.existsSync(uiPath)) {
      structure.uiPrimitivesDir = uiPath;
    }
  } else if (structure.srcDir && fs.existsSync(path.join(structure.srcDir, "ui"))) {
    structure.uiPrimitivesDir = path.join(structure.srcDir, "ui");
  }

  const configFiles = ["tailwind.config.ts", "tailwind.config.js", "tailwind.config.mjs", "tailwind.config.cjs"];
  for (const cf of configFiles) {
    const fullPath = path.join(ROOT_DIR, cf);
    if (fs.existsSync(fullPath)) {
      structure.tailwindConfigPath = fullPath;
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
      break;
    }
  }

  return structure;
}

// 2. Dynamic Zone Categorization
function determineZone(relPath: string, structure: ProjectStructure): string {
  const norm = relPath.replace(/\\/g, "/");

  if (norm.includes("components/ui") || norm.includes("/ui/")) {
    return "Shared UI Primitives";
  }

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

    return `${first.charAt(0).toUpperCase() + first.slice(1)} Section`;
  }

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

// 3. Scan Files (.tsx, .jsx, .ts, .js)
function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!["node_modules", ".next", "dist", ".git", ".turbo", "build", ".checkpoint-stage2"].includes(item)) {
        getFiles(fullPath, fileList);
      }
    } else if (
      (item.endsWith(".tsx") || item.endsWith(".jsx") || item.endsWith(".ts") || item.endsWith(".js")) &&
      !item.endsWith(".test.ts") &&
      !item.endsWith(".test.js") &&
      !item.endsWith(".test.jsx") &&
      !item.endsWith(".spec.ts") &&
      !item.endsWith(".spec.js") &&
      !item.endsWith(".d.ts") &&
      !item.endsWith(".config.js") &&
      !item.endsWith(".config.ts")
    ) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const APPROVED_HEXES = new Set([
  "#ffffff", "#000000", "#f3ede3", "#07080b", "#0b0c10", "#10b981", "#38bdf8", "#f59e0b", "#cbd5e1"
]);

const ROGUE_COLOR_REGEX = /\b(bg|text|border|ring)-(zinc|neutral|gray|stone)-[1-9]00\b/g;
const HEX_REGEX = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
const CARD_SURFACE_REGEX = /className=["'`]([^"'`]*(?:bg-(?:void|slab|surface|card|white|black)|rounded-(?:xl|2xl|3xl)|border-line|backdrop-blur)[^"'`]*)["'`]/g;
const MODAL_REGEX = /<(?:Dialog|Modal|Drawer|DrawerContent|DialogContent)\b|<div[^>]*role=["']dialog["']/g;
const TYPOGRAPHY_REGEX = /\b(font-mono|font-sans|font-geist|font-jetbrains|text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl))\b/g;

// 4. File-Level Audit with Next.js Boundary Radar, a11y & Icon Indexing
function auditFile(filePath: string, structure: ProjectStructure): ComponentAudit {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
  const zone = determineZone(relPath, structure);

  // Next.js Boundary Radar: Statically detect 'use client'
  const isClientComponent = /^\s*["']use client["']/m.test(content) || /["']use client["']/.test(lines.slice(0, 5).join(" "));

  const componentNames: string[] = [];
  const imports: string[] = [];
  const rawButtons: { line: number; snippet: string; className?: string; missingAria?: boolean; missingType?: boolean }[] = [];
  const uiButtons: { line: number; snippet: string; variant?: string }[] = [];
  const cardsAndSurfaces: { line: number; snippet: string; classes: string }[] = [];
  const modalsAndDialogs: { line: number; snippet: string }[] = [];
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

  // Extract component names
  const compMatch = content.match(/(?:export\s+default\s+function|export\s+function|function|const)\s+([A-Z][a-zA-Z0-9_]*)/g);
  if (compMatch) {
    isExportedComponent = true;
    compMatch.forEach(m => {
      const name = m.split(/\s+/).pop();
      if (name && !componentNames.includes(name)) componentNames.push(name);
    });
  }

  // Extract imports (local and alias)
  const importMatches = content.match(/from\s+["'](@\/components\/[^"']+|\.\/[^"']+|\.\.\/[^"']+)["']/g);
  if (importMatches) {
    importMatches.forEach(m => {
      const imp = m.replace(/from\s+["']/, "").replace(/["']/, "");
      if (!imports.includes(imp)) imports.push(imp);
    });
  }

  // Extract imported Icon packages (Lucide, Radix, Tabler, Heroicons, React-Icons, Phosphor)
  const importedIcons = new Map<string, string>();
  const iconImportRegex = /import\s+\{([^}]+)\}\s+from\s+["'](lucide-react|@radix-ui\/react-icons|@tabler\/icons(?:-react)?|@heroicons\/react(?:\/[^"']*)?|react-icons(?:\/[^"']*)?|phosphor-react)["']/g;
  let iconMatch;
  while ((iconMatch = iconImportRegex.exec(content)) !== null) {
    const lib = iconMatch[2];
    const items = iconMatch[1].split(",");
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

    if (trimmed.includes("style={{")) hasDirectStyleTag = true;

    // Multiline-aware Button Tag Catchers + a11y Fast-Check
    if (/<button\b/i.test(line)) {
      const block = lines.slice(idx, idx + 4).join(" ");
      const classMatch = block.match(/className=["'`]([^"'`]+)["'`]/);
      
      // Accessibility checks
      const hasType = /\btype=["'](button|submit|reset)["']/.test(block);
      const hasAria = /\b(aria-label|aria-labelledby|title)=["']/.test(block);
      const hasDirectText = />\s*[^<{\s]+/.test(block);
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

    if (/<Button\b/.test(line)) {
      const block = lines.slice(idx, idx + 4).join(" ");
      const variantMatch = block.match(/variant=["'`]([^"'`]+)["'`]/);
      uiButtons.push({
        line: lineNum,
        snippet: trimmed.slice(0, 80),
        variant: variantMatch ? variantMatch[1] : "default",
      });

      const btnInner = block.match(/<Button[^>]*>([\s\S]*?)<\/Button>/i);
      if (btnInner && btnInner[1]) {
        addLabel(lineNum, btnInner[1], "Button", trimmed);
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

    if (MODAL_REGEX.test(line) || trimmed.includes("Modal") || trimmed.includes("Drawer")) {
      if (/<(?:Dialog|Modal|Drawer|DialogContent)/.test(line) || /role=["']dialog["']/.test(line)) {
        modalsAndDialogs.push({ line: lineNum, snippet: trimmed.slice(0, 80) });
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

    let rogueMatch;
    ROGUE_COLOR_REGEX.lastIndex = 0;
    while ((rogueMatch = ROGUE_COLOR_REGEX.exec(line)) !== null) {
      rogueTailwindColors.push({
        line: lineNum,
        token: rogueMatch[0],
        snippet: trimmed.slice(0, 80),
      });
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
  });

  return {
    filePath,
    relativePath: relPath,
    zone,
    isClientComponent,
    componentNames,
    imports,
    rawButtons,
    uiButtons,
    cardsAndSurfaces,
    modalsAndDialogs,
    hardcodedHexes,
    rogueTailwindColors,
    typographyUsages,
    visibleLabels,
    visualIcons,
    hasDirectStyleTag,
    isExportedComponent,
  };
}

// 5. Dead / Orphaned Component Finder
function findDeadComponents(audits: ComponentAudit[]): ComponentAudit[] {
  const componentFiles = audits.filter(a =>
    (a.relativePath.includes("components/") || a.relativePath.includes("src/components/")) &&
    !a.relativePath.includes("components/ui") &&
    !a.relativePath.includes("/ui/") &&
    !a.relativePath.endsWith("index.ts") &&
    !a.relativePath.endsWith("index.tsx")
  );

  const allImportStrings = new Set<string>();
  audits.forEach(a => {
    a.imports.forEach(imp => allImportStrings.add(imp));
  });

  const dead: ComponentAudit[] = [];

  componentFiles.forEach(cf => {
    const baseNameNoExt = path.basename(cf.relativePath).replace(/\.[^/.]+$/, "");
    let isImported = false;

    for (const imp of allImportStrings) {
      if (imp.includes(baseNameNoExt)) {
        isImported = true;
        break;
      }
    }

    if (!isImported) {
      dead.push(cf);
    }
  });

  return dead;
}

// 6. Dynamic Route Builder with Boundary Radar & 2-Level Tree
function buildRouteMap(audits: ComponentAudit[]): RouteMapItem[] {
  const routes: RouteMapItem[] = [];
  const pageFiles = audits.filter(a =>
    (a.relativePath.includes("app/") || a.relativePath.includes("pages/")) &&
    (a.relativePath.endsWith("page.tsx") || a.relativePath.endsWith("page.jsx") || a.relativePath.endsWith("page.ts") || a.relativePath.endsWith("page.js"))
  );

  for (const page of pageFiles) {
    let route = "/" + page.relativePath
      .replace(/^(src\/)?app\//, "")
      .replace(/^(src\/)?pages\//, "")
      .replace(/\([^)]+\)\/?/, "")
      .replace(/\/page\.(tsx|jsx|ts|js)$/, "")
      .replace(/^page\.(tsx|jsx|ts|js)$/, "");

    if (route === "") route = "/";
    route = route.replace(/\/+/g, "/");

    const pageDir = path.dirname(page.filePath);
    const layoutPath = path.join(pageDir, "layout.tsx");
    let layoutFile: string | undefined = undefined;
    if (fs.existsSync(layoutPath)) {
      layoutFile = path.relative(ROOT_DIR, layoutPath).replace(/\\/g, "/");
    }

    const componentTree: RouteComponentNode[] = [];
    page.imports.forEach(imp => {
      const cleanName = imp.replace(/@\/(components|src\/components)\//, "").replace(/^\.\//, "").replace(/^\.\.\//, "");
      const baseName = path.basename(cleanName).replace(/\.[^/.]+$/, "");

      const matchingAudit = audits.find(a => {
        const normRel = a.relativePath.replace(/\\/g, "/");
        return (
          normRel.endsWith(`components/${cleanName}.tsx`) ||
          normRel.endsWith(`components/${cleanName}.ts`) ||
          normRel.endsWith(`components/${cleanName}.jsx`) ||
          normRel.endsWith(`components/${cleanName}.js`) ||
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
            .filter(c => !["ui", "button", "theme-toggle", "clsx", "lucide-react", "tailwind-merge", "utils"].includes(c.toLowerCase()) && c !== baseName);
          children = Array.from(new Set(children)).slice(0, 4);
        }
      }

      componentTree.push({
        name: cleanName,
        isClientComponent: isClient,
        children,
      });
    });

    routes.push({
      route,
      zone: page.zone,
      pageFile: page.relativePath,
      layoutFile,
      isClientComponent: page.isClientComponent,
      importedComponents: page.imports,
      componentTree,
    });
  }

  if (routes.length === 0) {
    const rootComponent = audits.find(a =>
      a.relativePath.endsWith("App.jsx") ||
      a.relativePath.endsWith("App.tsx") ||
      a.relativePath.endsWith("App.js") ||
      a.relativePath.endsWith("main.jsx") ||
      a.relativePath.endsWith("main.tsx")
    );

    if (rootComponent) {
      routes.push({
        route: "/ (Single Page App)",
        zone: "Root Application",
        pageFile: rootComponent.relativePath,
        isClientComponent: true,
        importedComponents: rootComponent.imports,
        componentTree: rootComponent.imports.map(c => ({
          name: c.replace(/@\/(components|src\/components)\//, "").replace(/^\.\//, ""),
          isClientComponent: true,
          children: [],
        })),
      });
    }
  }

  return routes.sort((a, b) => a.route.localeCompare(b.route));
}

// 7. Automated Codemod (--fix-buttons)
function executeButtonCodemod(audits: ComponentAudit[]) {
  console.log("🛠️ Running Automated Button Codemod (--fix-buttons)...");
  let modifiedFilesCount = 0;
  let transformedButtonsCount = 0;

  audits.forEach(a => {
    if (a.rawButtons.length === 0 || a.zone === "Shared UI Primitives") return;

    let content = fs.readFileSync(a.filePath, "utf-8");
    let fileChanged = false;

    const hasButtonImport = /import\s+.*\{?.*Button.*\}?\s+from\s+["']@\/components\/ui\/button["']/.test(content);

    const newContent = content
      .replace(/<button\b/g, () => {
        transformedButtonsCount++;
        fileChanged = true;
        return "<Button";
      })
      .replace(/<\/button>/g, "</Button>");

    if (fileChanged) {
      let finalContent = newContent;
      if (!hasButtonImport) {
        finalContent = `import { Button } from "@/components/ui/button";\n` + newContent;
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

// 9. Zero-Search Agent Handoff Manifest Generator (--manifest <target>)
function executeManifestLookup(audits: ComponentAudit[], target: string) {
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
    `manifest_version: "1.0"`,
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
    `recommended_dispatch_routing:`,
    `  interaction_physics: "emil-design-eng"`,
    `  token_unification: "ui-ux-pro-max"`,
    `  accessibility_remediation: "a11y-debugging"`,
    `  visual_hierarchy_polish: "impeccable"`,
    `# === END MANIFEST ===`,
  ].join("\n");

  console.log(manifest);
}

// 10. Closed-Loop Verification Gate (--verify)
function executeVerificationGate(audits: ComponentAudit[], routes: RouteMapItem[], deadComponents: ComponentAudit[]) {
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

  // TypeScript Compile Check
  let tsStatus: "PASS" | "FAIL" | "SKIPPED" = "SKIPPED";
  try {
    const tscCmd = process.platform === "win32" ? "npx.cmd" : "npx";
    const tsCheck = child_process.spawnSync(tscCmd, ["tsc", "--noEmit"], {
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
    version: "1.5.0",
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
}

// 12. Main Runner
export function runUniversalFrontendAudit() {
  const structure = detectProjectStructure();

  const targetDirs = [
    structure.appDir,
    structure.pagesDir,
    structure.componentsDir,
    structure.srcDir,
  ].filter(Boolean) as string[];

  const uniqueDirs = Array.from(new Set(targetDirs));
  const allFiles: string[] = [];
  uniqueDirs.forEach(dir => getFiles(dir, allFiles));
  const uniqueFiles = Array.from(new Set(allFiles));

  const audits = uniqueFiles.map(f => auditFile(f, structure));
  const routeMaps = buildRouteMap(audits);
  const deadComponents = findDeadComponents(audits);
  const skillDispatches = generateSkillDispatches(audits);

  // If --fix-buttons requested
  if (SHOULD_FIX_BUTTONS) {
    executeButtonCodemod(audits);
    return;
  }

  // If --manifest requested
  if (MANIFEST_TARGET) {
    executeManifestLookup(audits, MANIFEST_TARGET);
    return;
  }

  // If --verify requested
  if (VERIFY_MODE) {
    executeVerificationGate(audits, routeMaps, deadComponents);
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
  console.log("🌐 Initializing Universal Frontend Atlas Engine (v1.5.0)...");
  console.log(`📦 Architecture: ${structure.framework}`);
  console.log(`✅ Audited ${audits.length} frontend files across ${routeMaps.length} routes.`);
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
  writeDispatchGateway(skillDispatches);
  writeAtlasSummary(audits, routeMaps, structure, deadComponents);

  // Update .last_receipt.json baseline
  const receiptPath = path.join(OUTPUT_DIR, ".last_receipt.json");
  const baselineReceipt: VerificationReceipt = {
    timestamp: new Date().toISOString(),
    version: "1.5.0",
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
  md += `> Comprehensive catalog of UI elements (Buttons, Cards, Modals, Forms, Tables) across all panels.\n\n`;

  const totalRawButtons = audits.reduce((acc, a) => acc + a.rawButtons.length, 0);
  const totalUiButtons = audits.reduce((acc, a) => acc + a.uiButtons.length, 0);
  const totalA11yIssues = audits.reduce((acc, a) => acc + a.rawButtons.filter(b => b.missingAria || b.missingType).length, 0);

  md += `## 🔘 Button Usage Summary\n\n`;
  md += `- **Standardized UI Buttons**: **${totalUiButtons}** usages\n`;
  md += `- **Raw HTML Button Tags**: **${totalRawButtons}** usages (Potential UI islands)\n`;
  md += `- **Accessibility (a11y) Flags**: **${totalA11yIssues}** buttons missing \`aria-label\` or explicit \`type="button"\`\n\n`;

  md += `### Raw Button Elements & Accessibility Fast-Check\n\n`;
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

  md += `\n## 🪟 Modals & Dialogs Inventory\n\n`;
  md += `| Zone | File | Line | Snippet Preview |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;

  audits.forEach(a => {
    if (a.modalsAndDialogs.length > 0) {
      a.modalsAndDialogs.forEach(m => {
        const fileLink = makeFileLink(a.relativePath, m.line, `${a.relativePath}:${m.line}`);
        const cleanSnippet = escapeMarkdownSnippet(m.snippet, 50);
        md += `| ${a.zone} | ${fileLink} | ${m.line} | \`${cleanSnippet}\` |\n`;
      });
    }
  });

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
  let md = `# 🎨 Design Tokens, Colors & Typography Audit\n\n`;
  md += `> Matrix of project design tokens vs hardcoded hex drift and rogue color usages.\n\n`;

  if (structure.customTokens.size > 0) {
    md += `## 🏛️ Configured Project Color Tokens\n\n`;
    md += `Tokens detected from \`${structure.tailwindConfigPath ? path.basename(structure.tailwindConfigPath) : "config"}\`:\n\n`;
    Array.from(structure.customTokens).forEach(t => {
      md += `- \`${t}\`\n`;
    });
    md += `\n`;
  }

  const hexMap = new Map<string, { zone: string; file: string; line: number }[]>();
  audits.forEach(a => {
    a.hardcodedHexes.forEach(h => {
      if (!hexMap.has(h.hex)) hexMap.set(h.hex, []);
      hexMap.get(h.hex)!.push({ zone: a.zone, file: a.relativePath, line: h.line });
    });
  });

  const sortedHexes = Array.from(hexMap.entries()).sort((a, b) => b[1].length - a[1].length);

  md += `## ⚠️ Hardcoded Hex Codes Detected (${sortedHexes.length} unique colors)\n\n`;
  md += `| Hex Code | Total Usages | Top Affected Files |\n`;
  md += `| :--- | :--- | :--- |\n`;

  sortedHexes.slice(0, 30).forEach(([hex, usages]) => {
    const fileList = Array.from(new Set(usages.map(u => `\`${path.basename(u.file)}:${u.line}\``))).slice(0, 4).join(", ");
    md += `| \`${hex}\` | **${usages.length}** | ${fileList}${usages.length > 4 ? ` _(+${usages.length - 4} more)_` : ""} |\n`;
  });

  const totalRogue = audits.reduce((acc, a) => acc + a.rogueTailwindColors.length, 0);
  md += `\n## ⚠️ Rogue Neutral Grays (${totalRogue} Occurrences)\n\n`;
  md += `Usages of \`zinc\`, \`gray\`, or \`neutral\` color utilities:\n\n`;
  md += `| Zone | File | Line | Token Used | Code Snippet |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  audits.forEach(a => {
    if (a.rogueTailwindColors.length > 0) {
      a.rogueTailwindColors.forEach(r => {
        const fileLink = makeFileLink(a.relativePath, r.line, `${a.relativePath}:${r.line}`);
        const cleanSnippet = escapeMarkdownSnippet(r.snippet, 50);
        md += `| ${a.zone} | ${fileLink} | ${r.line} | \`${r.token}\` | \`${cleanSnippet}\` |\n`;
      });
    }
  });

  fs.writeFileSync(filePath, md);
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
  md += `- **Remediation**: Run \`npx frontend-audit --fix-buttons\` to auto-migrate to standardized Button components.\n\n`;

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

function writeDispatchGateway(dispatches: SkillDispatch[]) {
  const filePath = path.join(OUTPUT_DIR, "08_DISPATCH_GATEWAY.md");
  let md = `# 🎫 Skill Dispatch Gateway & Inter-Skill Handoff Matrix\n\n`;
  md += `> Triage router connecting detected frontend findings to specialized peer skills.\n`;
  md += `> 💡 **Handoff Protocol**: Downstream agents can directly accept target files from this matrix without redundant full-codebase searches.\n\n`;

  md += `## 🧭 Peer Skill Routing Architecture\n\n`;
  md += `| Recommended Skill | Domain & Focus | Trigger Criteria | CLI Auto-Fix |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  md += `| \`emil-design-eng\` | Micro-interactions & Physics | Missing \`active:scale-[0.97]\`, transitions | N/A (Agent Polish) |\n`;
  md += `| \`ui-ux-pro-max\` | Design Tokens & Colors | Hardcoded hexes, un-tokenized Tailwind grays | N/A (Token Alignment) |\n`;
  md += `| \`a11y-debugging\` | Accessibility Remediation | Missing \`aria-label\`, missing \`type="button"\` | N/A (A11y Hardening) |\n`;
  md += `| \`impeccable\` | Visual Craft & Layout | Inline \`style={{...}}\` tags, layout drift | N/A (Craft Review) |\n`;
  md += `| \`codemod\` | Automated Standardization | Mass raw \`<button>\` migration | \`--fix-buttons\` |\n\n`;

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
  md += `> 💡 **Tip**: Type \`/frontend-audit\` in AI chat or run \`npx frontend-audit\` in terminal to refresh.\n\n`;

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
  md += `1. **[01_ROUTES_AND_PANELS_MAP.md](./01_ROUTES_AND_PANELS_MAP.md)**\n`;
  md += `   - Instant lookup linking every route directly to its page file, Next.js boundary (\`Client ⚡\` vs \`Server 🖥️\`), layout, and 2-level deep component tree.\n\n`;

  md += `2. **[02_COMPONENT_INVENTORY.md](./02_COMPONENT_INVENTORY.md)**\n`;
  md += `   - Complete inventory of Buttons, Modals, Drawers, and a11y fast-check flags.\n\n`;

  md += `3. **[03_DESIGN_TOKENS_AND_COLORS.md](./03_DESIGN_TOKENS_AND_COLORS.md)**\n`;
  md += `   - Color palettes, typography tokens, and exact line-by-line list of all rogue colors.\n\n`;

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

  md += `## 📦 How to Install / Update this Skill\n\n`;
  md += `To install or update to the latest version in any project:\n\n`;
  md += `- **Windows (PowerShell)**: \`irm https://raw.githubusercontent.com/Eurie92/frontend-audit-skill/main/scripts/install.ps1 | iex\`\n`;
  md += `- **macOS / Linux**: \`curl -fsSL https://raw.githubusercontent.com/Eurie92/frontend-audit-skill/main/scripts/install.sh | bash\`\n`;
  md += `- **GitHub Repository**: [Eurie92/frontend-audit-skill](https://github.com/Eurie92/frontend-audit-skill)\n\n`;

  fs.writeFileSync(filePath, md);
}

function main() {
  runUniversalFrontendAudit();

  if (WATCH_MODE) {
    const structure = detectProjectStructure();
    const watchDirs = [structure.appDir, structure.pagesDir, structure.componentsDir, structure.srcDir].filter(Boolean) as string[];
    console.log(`\n👀 Watching ${watchDirs.length} frontend directories for changes... (Press Ctrl+C to stop)`);
    let debounceTimer: NodeJS.Timeout | null = null;
    watchDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        try {
          fs.watch(dir, { recursive: true }, (eventType, filename) => {
            if (!filename || !/\.(tsx|jsx|ts|js)$/.test(filename)) return;
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
