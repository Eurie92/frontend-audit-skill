import fs from "fs";
import path from "path";

/**
 * Universal Frontend Atlas & Design System Audit Engine (v1.4.0)
 * 
 * Features:
 * 1. Multi-Framework Auto-Discovery (Next.js App/Pages Router, Vite + React SPAs, Tailwind)
 * 2. Instant Query Search (--find <query>, --route <route>) for massive codebases (now with text labels!)
 * 3. 2-Level Deep Component Tree (Parent ➔ [Subcomponents]) in 01_ROUTES_AND_PANELS_MAP.md
 * 4. Screenshot-to-Code Visible UI Text & Labels Map (06_VISIBLE_TEXT_AND_LABELS_MAP.md)
 * 5. Dead / Orphaned Component Finder & Dedicated Ledger (05_DEAD_ORPHANED_COMPONENTS.md)
 * 6. Accessibility (a11y) Fast-Check (Missing aria-label, missing type="button")
 * 7. Automated Codemod (--fix-buttons) to migrate raw <button> to <Button>
 * 8. Live File Watcher (--watch) for automatic continuous atlas syncing
 * 9. Persistent Markdown Atlas Generation in docs/frontend-atlas/
 */

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, "docs", "frontend-atlas");

// Parse CLI Flags
const ARGS = process.argv.slice(2);
const FIND_QUERY = ARGS.includes("--find") ? ARGS[ARGS.indexOf("--find") + 1] : undefined;
const ROUTE_QUERY = ARGS.includes("--route") ? ARGS[ARGS.indexOf("--route") + 1] : undefined;
const SHOULD_FIX_BUTTONS = ARGS.includes("--fix-buttons");
const SHOW_DEAD_ONLY = ARGS.includes("--dead");
const SHOW_A11Y_ONLY = ARGS.includes("--a11y");
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

interface ComponentAudit {
  filePath: string;
  relativePath: string;
  zone: string;
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
  hasDirectStyleTag: boolean;
  isExportedComponent: boolean;
}

interface RouteComponentNode {
  name: string;
  children: string[];
}

interface RouteMapItem {
  route: string;
  zone: string;
  pageFile: string;
  layoutFile?: string;
  importedComponents: string[];
  componentTree: RouteComponentNode[];
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

// 4. File-Level Audit with a11y & Export checks
function auditFile(filePath: string, structure: ProjectStructure): ComponentAudit {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
  const zone = determineZone(relPath, structure);

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
      // If button has no visible text inside tag or next line (e.g. icon button)
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

// 6. Dynamic Route Builder
function buildRouteMap(audits: ComponentAudit[]): RouteMapItem[] {
  const routes: RouteMapItem[] = [];
  const pageFiles = audits.filter(a =>
    (a.relativePath.includes("app/") || a.relativePath.includes("pages/")) &&
    (a.relativePath.endsWith("page.tsx") || a.relativePath.endsWith("page.jsx") || a.relativePath.endsWith("page.ts") || a.relativePath.endsWith("page.js"))
  );

  for (const page of pageFiles) {
    let route = "/" + page.relativePath
      .replace(/^(src\/)?app\//, "")
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
      if (matchingAudit && matchingAudit.imports.length > 0) {
        children = matchingAudit.imports
          .map(c => path.basename(c).replace(/\.[^/.]+$/, ""))
          .filter(c => !["ui", "button", "theme-toggle", "clsx", "lucide-react", "tailwind-merge", "utils"].includes(c.toLowerCase()) && c !== baseName);
        children = Array.from(new Set(children)).slice(0, 4);
      }

      componentTree.push({
        name: cleanName,
        children,
      });
    });

    routes.push({
      route,
      zone: page.zone,
      pageFile: page.relativePath,
      layoutFile,
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
        importedComponents: rootComponent.imports,
        componentTree: rootComponent.imports.map(c => ({
          name: c.replace(/@\/(components|src\/components)\//, "").replace(/^\.\//, ""),
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

    // Check if Button is already imported
    const hasButtonImport = /import\s+.*\{?.*Button.*\}?\s+from\s+["']@\/components\/ui\/button["']/.test(content);

    // Replace <button with <Button and </button> with </Button>
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

// 8. Interactive Query Filter (--find / --route)
function executeInteractiveQuery(audits: ComponentAudit[], routes: RouteMapItem[], query: string) {
  console.log(`🔎 Searching Frontend Atlas for query: "${query}"\n`);
  const q = query.toLowerCase();

  // Search Routes
  const matchingRoutes = routes.filter(r => r.route.toLowerCase().includes(q) || r.pageFile.toLowerCase().includes(q));
  if (matchingRoutes.length > 0) {
    console.log(`📍 Matching Routes (${matchingRoutes.length}):`);
    matchingRoutes.forEach(r => {
      console.log(`   - Route: ${r.route} ➡️ File: ${r.pageFile}`);
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
      console.log(`   - [${c.zone}] ${c.relativePath} (${btnCount} buttons, ${c.cardsAndSurfaces.length} cards)`);
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
}

// 9. Main Runner
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

  // If --fix-buttons requested
  if (SHOULD_FIX_BUTTONS) {
    executeButtonCodemod(audits);
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
  console.log("🌐 Initializing Universal Frontend Atlas Engine (v1.4.0)...");
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
  writeAtlasSummary(audits, routeMaps, structure, deadComponents);

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
  md += `> Auto-generated navigation map linking every route to its page file, layout, and imported components.\n\n`;
  md += `- **Detected Architecture**: \`${structure.framework}\`\n\n`;

  const zones = Array.from(new Set(routes.map(r => r.zone))).sort();

  zones.forEach(zone => {
    const zoneRoutes = routes.filter(r => r.zone === zone);
    if (zoneRoutes.length === 0) return;

    md += `## 📂 ${zone} (${zoneRoutes.length} Routes)\n\n`;
    md += `| Route | Page File | Layout File | Key Imported Components |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    zoneRoutes.forEach(r => {
      const layoutStr = r.layoutFile ? makeFileLink(r.layoutFile) : `_Inherited / N/A_`;
      const pageLink = makeFileLink(r.pageFile);
      const importsStr = r.componentTree && r.componentTree.length > 0
        ? r.componentTree.map(node => {
            if (node.children.length > 0) {
              return `\`${node.name}\` ➔ [${node.children.map(c => `\`${c}\``).join(", ")}]`;
            }
            return `\`${node.name}\``;
          }).join(" • ")
        : `_None (Direct UI)_`;

      md += `| \`${r.route}\` | ${pageLink} | ${layoutStr} | ${importsStr} |\n`;
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

function writeAtlasSummary(audits: ComponentAudit[], routes: RouteMapItem[], structure: ProjectStructure, deadComponents: ComponentAudit[]) {
  const filePath = path.join(OUTPUT_DIR, "README.md");
  const totalFiles = audits.length;
  const totalRawButtons = audits.reduce((acc, a) => acc + a.rawButtons.length, 0);
  const totalUiButtons = audits.reduce((acc, a) => acc + a.uiButtons.length, 0);
  const totalHexes = audits.reduce((acc, a) => acc + a.hardcodedHexes.length, 0);
  const totalRogue = audits.reduce((acc, a) => acc + a.rogueTailwindColors.length, 0);

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
  md += `- **Rogue Color Classes**: **${totalRogue}**\n\n`;

  md += `## 📑 Atlas Documents Guide\n\n`;
  md += `1. **[01_ROUTES_AND_PANELS_MAP.md](./01_ROUTES_AND_PANELS_MAP.md)**\n`;
  md += `   - Instant lookup for all pages and routes across all panels.\n\n`;

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

  md += `## 📦 How to Install / Update this Skill\n\n`;
  md += `To install or update to the latest version in any project:\n\n`;
  md += `- **Windows (PowerShell)**: \`irm https://raw.githubusercontent.com/Eurie92/frontend-audit-skill/main/scripts/install.ps1 | iex\`\n`;
  md += `- **macOS / Linux**: \`curl -fsSL https://raw.githubusercontent.com/Eurie92/frontend-audit-skill/main/scripts/install.sh | bash\`\n`;
  md += `- **GitHub Repository**: [Eurie92/frontend-audit-skill](https://github.com/Eurie92/frontend-audit-skill)\n\n`;

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
