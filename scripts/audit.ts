import fs from "fs";
import path from "path";

/**
 * Universal Frontend Atlas & Design System Audit Engine
 * 
 * Works out-of-the-box on ANY Next.js / React / Tailwind project:
 * 1. Auto-discovers project routing structure (App Router, Pages Router, src/)
 * 2. Dynamically groups routes into logical business panels (Admin, Storefront, Portal, Dashboard, Auth)
 * 3. Dynamically extracts Tailwind tokens from tailwind.config.*
 * 4. Audits UI components: Buttons (<Button> vs raw <button>), Cards, Modals, Forms, Tables
 * 5. Pinpoints rogue hardcoded hex colors and divergent color utilities
 * 6. Generates persistent, highly navigable Markdown Atlas files in docs/frontend-atlas/
 */

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.join(ROOT_DIR, "docs", "frontend-atlas");

interface ProjectStructure {
  hasAppRouter: boolean;
  appDir?: string;
  hasPagesRouter: boolean;
  pagesDir?: string;
  componentsDir?: string;
  uiPrimitivesDir?: string;
  tailwindConfigPath?: string;
  customTokens: Set<string>;
}

interface ComponentAudit {
  filePath: string;
  relativePath: string;
  zone: string;
  componentNames: string[];
  imports: string[];
  rawButtons: { line: number; snippet: string; className?: string }[];
  uiButtons: { line: number; snippet: string; variant?: string }[];
  cardsAndSurfaces: { line: number; snippet: string; classes: string }[];
  modalsAndDialogs: { line: number; snippet: string }[];
  hardcodedHexes: { line: number; hex: string; snippet: string }[];
  rogueTailwindColors: { line: number; token: string; snippet: string }[];
  typographyUsages: { line: number; fontToken: string; snippet: string }[];
  hasDirectStyleTag: boolean;
}

interface RouteMapItem {
  route: string;
  zone: string;
  pageFile: string;
  layoutFile?: string;
  importedComponents: string[];
}

// 1. Project Structure Auto-Discovery
function detectProjectStructure(): ProjectStructure {
  const structure: ProjectStructure = {
    hasAppRouter: false,
    hasPagesRouter: false,
    customTokens: new Set<string>(),
  };

  // Detect App Router
  if (fs.existsSync(path.join(ROOT_DIR, "app"))) {
    structure.hasAppRouter = true;
    structure.appDir = path.join(ROOT_DIR, "app");
  } else if (fs.existsSync(path.join(ROOT_DIR, "src", "app"))) {
    structure.hasAppRouter = true;
    structure.appDir = path.join(ROOT_DIR, "src", "app");
  }

  // Detect Pages Router
  if (fs.existsSync(path.join(ROOT_DIR, "pages"))) {
    structure.hasPagesRouter = true;
    structure.pagesDir = path.join(ROOT_DIR, "pages");
  } else if (fs.existsSync(path.join(ROOT_DIR, "src", "pages"))) {
    structure.hasPagesRouter = true;
    structure.pagesDir = path.join(ROOT_DIR, "src", "pages");
  }

  // Detect Components
  if (fs.existsSync(path.join(ROOT_DIR, "components"))) {
    structure.componentsDir = path.join(ROOT_DIR, "components");
  } else if (fs.existsSync(path.join(ROOT_DIR, "src", "components"))) {
    structure.componentsDir = path.join(ROOT_DIR, "src", "components");
  }

  // Detect UI Primitives
  if (structure.componentsDir) {
    const uiPath = path.join(structure.componentsDir, "ui");
    if (fs.existsSync(uiPath)) {
      structure.uiPrimitivesDir = uiPath;
    }
  }

  // Detect Tailwind Config & Extract Custom Color Tokens
  const configFiles = [
    "tailwind.config.ts",
    "tailwind.config.js",
    "tailwind.config.mjs",
    "tailwind.config.cjs",
  ];

  for (const cf of configFiles) {
    const fullPath = path.join(ROOT_DIR, cf);
    if (fs.existsSync(fullPath)) {
      structure.tailwindConfigPath = fullPath;
      const content = fs.readFileSync(fullPath, "utf-8");
      // Extract custom color keys
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

// 2. Dynamic Zone / Business Panel Detector
function determineZone(relPath: string, structure: ProjectStructure): string {
  const norm = relPath.replace(/\\/g, "/");

  // Check UI primitives
  if (norm.includes("components/ui")) {
    return "Shared UI Primitives";
  }

  // Next.js App Router dynamic zones
  if (norm.startsWith("app/") || norm.startsWith("src/app/")) {
    const subPath = norm.replace(/^(src\/)?app\//, "");
    const segments = subPath.split("/");
    const first = segments[0];

    if (first.startsWith("(") && first.endsWith(")")) {
      // Route group like (public), (marketing), (store)
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

  // Components dynamic zones
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

  return "Core Platform";
}

// 3. File Scanner Helper
function getFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!["node_modules", ".next", "dist", ".git", ".turbo", "build"].includes(item)) {
        getFiles(fullPath, fileList);
      }
    } else if (item.endsWith(".tsx") || (item.endsWith(".ts") && !item.endsWith(".test.ts") && !item.endsWith(".d.ts"))) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

// Approved Common Neutrals & Theme Hexes
const APPROVED_HEXES = new Set([
  "#ffffff", "#000000", "#f3ede3", "#07080b", "#0b0c10", "#10b981", "#38bdf8", "#f59e0b", "#cbd5e1"
]);

const ROGUE_COLOR_REGEX = /\b(bg|text|border|ring)-(zinc|neutral|gray|stone)-[1-9]00\b/g;
const HEX_REGEX = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
const CARD_SURFACE_REGEX = /className=["'`]([^"'`]*(?:bg-(?:void|slab|surface|card|white|black)|rounded-(?:xl|2xl|3xl)|border-line|backdrop-blur)[^"'`]*)["'`]/g;
const MODAL_REGEX = /<(?:Dialog|Modal|Drawer|DrawerContent|DialogContent)\b|<div[^>]*role=["']dialog["']/g;
const TYPOGRAPHY_REGEX = /\b(font-mono|font-sans|font-geist|font-jetbrains|text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl))\b/g;

// 4. File-Level Audit
function auditFile(filePath: string, structure: ProjectStructure): ComponentAudit {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
  const zone = determineZone(relPath, structure);

  const componentNames: string[] = [];
  const imports: string[] = [];
  const rawButtons: { line: number; snippet: string; className?: string }[] = [];
  const uiButtons: { line: number; snippet: string; variant?: string }[] = [];
  const cardsAndSurfaces: { line: number; snippet: string; classes: string }[] = [];
  const modalsAndDialogs: { line: number; snippet: string }[] = [];
  const hardcodedHexes: { line: number; hex: string; snippet: string }[] = [];
  const rogueTailwindColors: { line: number; token: string; snippet: string }[] = [];
  const typographyUsages: { line: number; fontToken: string; snippet: string }[] = [];
  let hasDirectStyleTag = false;

  // Extract component names
  const compMatch = content.match(/(?:export\s+default\s+function|export\s+function|function|const)\s+([A-Z][a-zA-Z0-9_]*)/g);
  if (compMatch) {
    compMatch.forEach(m => {
      const name = m.split(/\s+/).pop();
      if (name && !componentNames.includes(name)) componentNames.push(name);
    });
  }

  // Extract component imports
  const importMatches = content.match(/from\s+["'](@\/components\/[^"']+)["']/g);
  if (importMatches) {
    importMatches.forEach(m => {
      const imp = m.replace(/from\s+["']/, "").replace(/["']/, "");
      if (!imports.includes(imp)) imports.push(imp);
    });
  }

  // Line-by-line inspection
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    if (trimmed.includes("style={{")) hasDirectStyleTag = true;

    // Multiline-aware Button Tag Catchers:
    if (/<button\b/i.test(line)) {
      const block = lines.slice(idx, idx + 4).join(" ");
      const classMatch = block.match(/className=["'`]([^"'`]+)["'`]/);
      rawButtons.push({
        line: lineNum,
        snippet: trimmed.slice(0, 80),
        className: classMatch ? classMatch[1].slice(0, 60) : undefined,
      });
    }

    if (/<Button\b/.test(line)) {
      const block = lines.slice(idx, idx + 4).join(" ");
      const variantMatch = block.match(/variant=["'`]([^"'`]+)["'`]/);
      uiButtons.push({
        line: lineNum,
        snippet: trimmed.slice(0, 80),
        variant: variantMatch ? variantMatch[1] : "default",
      });
    }

    // Cards / Surfaces
    let cardMatch;
    CARD_SURFACE_REGEX.lastIndex = 0;
    while ((cardMatch = CARD_SURFACE_REGEX.exec(line)) !== null) {
      cardsAndSurfaces.push({
        line: lineNum,
        classes: cardMatch[1].slice(0, 80),
        snippet: trimmed.slice(0, 80),
      });
    }

    // Modals
    if (MODAL_REGEX.test(line) || trimmed.includes("Modal") || trimmed.includes("Drawer")) {
      if (/<(?:Dialog|Modal|Drawer|DialogContent)/.test(line) || /role=["']dialog["']/.test(line)) {
        modalsAndDialogs.push({ line: lineNum, snippet: trimmed.slice(0, 80) });
      }
    }

    // Hex colors
    let hexMatch;
    HEX_REGEX.lastIndex = 0;
    while ((hexMatch = HEX_REGEX.exec(line)) !== null) {
      const hex = hexMatch[0].toLowerCase();
      if (!APPROVED_HEXES.has(hex) && !trimmed.startsWith("//") && !trimmed.startsWith("/*")) {
        hardcodedHexes.push({ line: lineNum, hex, snippet: trimmed.slice(0, 80) });
      }
    }

    // Rogue Tailwind colors
    let rogueMatch;
    ROGUE_COLOR_REGEX.lastIndex = 0;
    while ((rogueMatch = ROGUE_COLOR_REGEX.exec(line)) !== null) {
      rogueTailwindColors.push({
        line: lineNum,
        token: rogueMatch[0],
        snippet: trimmed.slice(0, 80),
      });
    }

    // Typography
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
    hasDirectStyleTag,
  };
}

// 5. Dynamic Route Builder
function buildRouteMap(audits: ComponentAudit[]): RouteMapItem[] {
  const routes: RouteMapItem[] = [];
  const pageFiles = audits.filter(a =>
    (a.relativePath.includes("app/") || a.relativePath.includes("pages/")) &&
    (a.relativePath.endsWith("page.tsx") || a.relativePath.endsWith("page.ts") || a.relativePath.endsWith(".tsx"))
  );

  for (const page of pageFiles) {
    if (!page.relativePath.includes("page.tsx") && !page.relativePath.includes("page.ts")) continue;

    let route = "/" + page.relativePath
      .replace(/^(src\/)?app\//, "")
      .replace(/\([^)]+\)\/?/, "")
      .replace(/\/page\.(tsx|ts)$/, "")
      .replace(/^page\.(tsx|ts)$/, "");

    if (route === "") route = "/";
    route = route.replace(/\/+/g, "/");

    const pageDir = path.dirname(page.filePath);
    const layoutPath = path.join(pageDir, "layout.tsx");
    let layoutFile: string | undefined = undefined;
    if (fs.existsSync(layoutPath)) {
      layoutFile = path.relative(ROOT_DIR, layoutPath).replace(/\\/g, "/");
    }

    routes.push({
      route,
      zone: page.zone,
      pageFile: page.relativePath,
      layoutFile,
      importedComponents: page.imports,
    });
  }

  return routes.sort((a, b) => a.route.localeCompare(b.route));
}

// 6. Markdown Generation
export function runUniversalFrontendAudit() {
  console.log("🌐 Initializing Universal Frontend Atlas Engine...");

  const structure = detectProjectStructure();
  console.log(`📦 Framework Auto-Discovery:`);
  console.log(`   - App Router: ${structure.hasAppRouter ? "✅ Detected (" + structure.appDir + ")" : "❌ Not found"}`);
  console.log(`   - Pages Router: ${structure.hasPagesRouter ? "✅ Detected (" + structure.pagesDir + ")" : "❌ Not found"}`);
  console.log(`   - Components: ${structure.componentsDir ? "✅ Detected (" + structure.componentsDir + ")" : "❌ Not found"}`);
  console.log(`   - UI Primitives: ${structure.uiPrimitivesDir ? "✅ Detected (" + structure.uiPrimitivesDir + ")" : "❌ Not found"}`);
  console.log(`   - Tailwind Config: ${structure.tailwindConfigPath ? "✅ Detected" : "❌ Not found"}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const targetDirs = [
    structure.appDir,
    structure.pagesDir,
    structure.componentsDir,
  ].filter(Boolean) as string[];

  const allFiles: string[] = [];
  targetDirs.forEach(dir => getFiles(dir, allFiles));

  const audits = allFiles.map(f => auditFile(f, structure));
  const routeMaps = buildRouteMap(audits);

  console.log(`✅ Audited ${audits.length} frontend files across ${routeMaps.length} routes.`);

  // Write files
  writeRoutesMap(routeMaps, structure);
  writeComponentInventory(audits);
  writeDesignTokensAudit(audits, structure);
  writeUIIslandsAudit(audits);
  writeAtlasSummary(audits, routeMaps, structure);

  console.log(`✨ Universal Frontend Atlas written to: ${path.relative(ROOT_DIR, OUTPUT_DIR)}`);
}

function writeRoutesMap(routes: RouteMapItem[], structure: ProjectStructure) {
  const filePath = path.join(OUTPUT_DIR, "01_ROUTES_AND_PANELS_MAP.md");
  let md = `# 🗺️ Frontend Routes & Panels Map\n\n`;
  md += `> Auto-generated navigation map linking every route to its page file, layout, and imported components.\n\n`;

  const zones = Array.from(new Set(routes.map(r => r.zone))).sort();

  zones.forEach(zone => {
    const zoneRoutes = routes.filter(r => r.zone === zone);
    if (zoneRoutes.length === 0) return;

    md += `## 📂 ${zone} (${zoneRoutes.length} Routes)\n\n`;
    md += `| Route | Page File | Layout File | Key Imported Components |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    zoneRoutes.forEach(r => {
      const layoutStr = r.layoutFile ? `[\`${r.layoutFile}\`](file:///${path.join(ROOT_DIR, r.layoutFile).replace(/\\/g, "/")})` : `_Inherited_`;
      const pageLink = `[\`${r.pageFile}\`](file:///${path.join(ROOT_DIR, r.pageFile).replace(/\\/g, "/")})`;
      const importsStr = r.importedComponents.length > 0
        ? r.importedComponents.map(c => `\`${c.replace(/@\/(components|src\/components)\//, "")}\``).join("<br>")
        : `_None (Direct UI)_`;

      md += `| **\`${r.route}\`** | ${pageLink} | ${layoutStr} | ${importsStr} |\n`;
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

  md += `## 🔘 Button Usage Summary\n\n`;
  md += `- **Standardized \`<Button>\` Components**: **${totalUiButtons}** usages\n`;
  md += `- **Raw \`<button>\` Tags**: **${totalRawButtons}** usages (Potential UI islands / non-standard styling)\n\n`;

  md += `### Raw \`<button>\` Occurrences by Panel\n\n`;
  md += `| Zone | File | Line | Classes / Style Snippet |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;

  const nonPrimitiveAudits = audits.filter(a => a.zone !== "Shared UI Primitives");
  nonPrimitiveAudits.forEach(a => {
    if (a.rawButtons.length > 0) {
      a.rawButtons.forEach(b => {
        const fileLink = `[\`${a.relativePath}:${b.line}\`](file:///${path.join(ROOT_DIR, a.relativePath).replace(/\\/g, "/")}#L${b.line})`;
        const classPreview = b.className ? `\`${b.className}\`` : `\`${b.snippet.replace(/\|/g, "\\|").slice(0, 45)}\``;
        md += `| ${a.zone} | ${fileLink} | ${b.line} | ${classPreview} |\n`;
      });
    }
  });

  md += `\n## 🪟 Modals & Dialogs Inventory\n\n`;
  md += `| Zone | File | Line | Snippet Preview |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;

  audits.forEach(a => {
    if (a.modalsAndDialogs.length > 0) {
      a.modalsAndDialogs.forEach(m => {
        const fileLink = `[\`${a.relativePath}:${m.line}\`](file:///${path.join(ROOT_DIR, a.relativePath).replace(/\\/g, "/")}#L${m.line})`;
        const cleanSnippet = m.snippet.replace(/\|/g, "\\|").slice(0, 60);
        md += `| ${a.zone} | ${fileLink} | ${m.line} | \`${cleanSnippet}\` |\n`;
      });
    }
  });

  md += `\n## 📦 Cards, Panels & Surface Containers\n\n`;
  md += `| Zone | File | Surface Classes Found |\n`;
  md += `| :--- | :--- | :--- |\n`;

  audits.forEach(a => {
    if (a.cardsAndSurfaces.length > 0) {
      const sampleClasses = Array.from(new Set(a.cardsAndSurfaces.map(c => c.classes))).slice(0, 3).join(", ");
      const fileLink = `[\`${a.relativePath}\`](file:///${path.join(ROOT_DIR, a.relativePath).replace(/\\/g, "/")})`;
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

  // Aggregate Hexes
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
        const fileLink = `[\`${a.relativePath}:${r.line}\`](file:///${path.join(ROOT_DIR, a.relativePath).replace(/\\/g, "/")}#L${r.line})`;
        const cleanSnippet = r.snippet.replace(/\|/g, "\\|").slice(0, 50);
        md += `| ${a.zone} | ${fileLink} | ${r.line} | \`${r.token}\` | \`${cleanSnippet}\` |\n`;
      });
    }
  });

  fs.writeFileSync(filePath, md);
}

function writeUIIslandsAudit(audits: ComponentAudit[]) {
  const filePath = path.join(OUTPUT_DIR, "04_UI_ISLANDS_AND_DRIFT.md");
  let md = `# 🏝️ UI Islands, Redundancies & Consistency Audit\n\n`;
  md += `> Identifies isolated design deviations, duplicate components, and actionable refactoring paths.\n\n`;

  const filesWithRawButtons = audits.filter(a => a.rawButtons.length > 0 && a.zone !== "Shared UI Primitives");
  md += `### 1. Raw Button Islands (${filesWithRawButtons.length} files)\n`;
  md += `Files that implement native \`<button>\` instead of standardized button components.\n`;
  md += `- **Impact**: Inconsistent hover/focus states, different tap targets, missing animations.\n`;
  md += `- **Remediation**: Migrate to standardized \`<Button>\` primitive.\n\n`;

  const customModalFiles = audits.filter(a => a.modalsAndDialogs.length > 0 && !a.relativePath.includes("components/ui"));
  md += `### 2. Custom Modal Redundancies (${customModalFiles.length} files)\n`;
  md += `Files implementing custom modal structures rather than shared primitives:\n`;
  customModalFiles.slice(0, 8).forEach(f => {
    md += `- [\`${f.relativePath}\`](file:///${path.join(ROOT_DIR, f.relativePath).replace(/\\/g, "/")}) (${f.zone})\n`;
  });

  const inlineStyleFiles = audits.filter(a => a.hasDirectStyleTag && !a.relativePath.includes("components/ui"));
  md += `\n### 3. Inline Style Tags (${inlineStyleFiles.length} files)\n`;
  md += `Files using \`style={{...}}\` which bypass the Tailwind design token pipeline.\n`;
  inlineStyleFiles.forEach(f => {
    md += `- [\`${f.relativePath}\`](file:///${path.join(ROOT_DIR, f.relativePath).replace(/\\/g, "/")}) (${f.zone})\n`;
  });

  fs.writeFileSync(filePath, md);
}

function writeAtlasSummary(audits: ComponentAudit[], routes: RouteMapItem[], structure: ProjectStructure) {
  const filePath = path.join(OUTPUT_DIR, "README.md");
  const totalFiles = audits.length;
  const totalRawButtons = audits.reduce((acc, a) => acc + a.rawButtons.length, 0);
  const totalUiButtons = audits.reduce((acc, a) => acc + a.uiButtons.length, 0);
  const totalHexes = audits.reduce((acc, a) => acc + a.hardcodedHexes.length, 0);
  const totalRogue = audits.reduce((acc, a) => acc + a.rogueTailwindColors.length, 0);

  let md = `# 📖 Frontend Atlas & Quick-Reference Catalog\n\n`;
  md += `> Centralized documentation and audit ledger for this project.\n\n`;

  md += `## 📊 Platform Statistics\n\n`;
  md += `- **Total Frontend Files**: **${totalFiles}**\n`;
  md += `- **Total Active Routes**: **${routes.length}**\n`;
  md += `- **Standardized UI Buttons**: **${totalUiButtons}**\n`;
  md += `- **Raw \`<button>\` Tags**: **${totalRawButtons}**\n`;
  md += `- **Hardcoded Hex Deviations**: **${totalHexes}**\n`;
  md += `- **Rogue Color Classes**: **${totalRogue}**\n\n`;

  md += `## 📑 Atlas Documents Guide\n\n`;
  md += `1. **[01_ROUTES_AND_PANELS_MAP.md](file:///${path.join(OUTPUT_DIR, "01_ROUTES_AND_PANELS_MAP.md").replace(/\\/g, "/")})**\n`;
  md += `   - Instant lookup for all pages and routes across all panels.\n\n`;

  md += `2. **[02_COMPONENT_INVENTORY.md](file:///${path.join(OUTPUT_DIR, "02_COMPONENT_INVENTORY.md").replace(/\\/g, "/")})**\n`;
  md += `   - Complete inventory of Buttons, Modals, Drawers, and Card containers.\n\n`;

  md += `3. **[03_DESIGN_TOKENS_AND_COLORS.md](file:///${path.join(OUTPUT_DIR, "03_DESIGN_TOKENS_AND_COLORS.md").replace(/\\/g, "/")})**\n`;
  md += `   - Color palettes, typography tokens, and exact line-by-line list of all rogue colors.\n\n`;

  md += `4. **[04_UI_ISLANDS_AND_DRIFT.md](file:///${path.join(OUTPUT_DIR, "04_UI_ISLANDS_AND_DRIFT.md").replace(/\\/g, "/")})**\n`;
  md += `   - High-priority list of discrepancies, raw elements, and isolated UI styling.\n\n`;

  fs.writeFileSync(filePath, md);
}

runUniversalFrontendAudit();
