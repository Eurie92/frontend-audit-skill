import fs from "fs";
import path from "path";

/**
 * Universal Backend Atlas & Full-Stack Audit Engine (v2.0.0)
 * 
 * Generates docs/backend-atlas/:
 * 1. 01_API_ROUTES_AND_ENDPOINTS.md (Next.js App/Pages Router API, Express, Hono, Remix)
 * 2. 02_DATABASE_MODELS_AND_SCHEMA.md (Prisma schema.prisma & Drizzle schema.ts)
 * 3. 03_SERVER_ACTIONS_AND_MUTATIONS.md ("use server" actions, mutation functions)
 * 4. 04_AUTH_AND_MIDDLEWARE_GUARDS.md (middleware.ts, public vs protected routes)
 * 5. 05_INTEGRATIONS_AND_WEBHOOKS.md (Stripe, Resend, Supabase, S3, Webhooks)
 * 6. 06_FULLSTACK_CROSS_REFERENCE_MAP.md (Bi-directional UI Trigger ➔ Backend Action / API ➔ Database Model)
 */

const ROOT_DIR = process.cwd();
const BACKEND_OUTPUT_DIR = path.join(ROOT_DIR, "docs", "backend-atlas");

// Data Interfaces
export interface ApiEndpoint {
  urlPath: string;
  framework: string;
  filePath: string;
  relativePath: string;
  line: number;
  methods: string[];
  isProtected: boolean;
  authGuard?: string;
  sourceSnippet: string;
}

export interface DbField {
  name: string;
  type: string;
  isId?: boolean;
  isUnique?: boolean;
  isOptional?: boolean;
  isArray?: boolean;
  relationTarget?: string;
}

export interface DbModel {
  name: string;
  orm: "Prisma" | "Drizzle" | "TypeORM" | "Mongoose" | "SQL / Supabase";
  filePath: string;
  relativePath: string;
  line: number;
  tableName: string;
  fields: DbField[];
}

export interface ServerAction {
  name: string;
  filePath: string;
  relativePath: string;
  line: number;
  params: string;
  dbOperations: string[];
  externalServices: string[];
  snippet: string;
}

export interface AuthGuard {
  filePath: string;
  relativePath: string;
  line: number;
  matcherPatterns: string[];
  authProvider: string;
  protectedRoutes: string[];
  publicRoutes: string[];
}

export interface IntegrationService {
  name: string;
  category: "Payment" | "Email" | "Database / BaaS" | "Storage" | "AI / LLM" | "SMS / Auth";
  clientImports: string[];
  webhookRoutes: string[];
  detectedFiles: { file: string; line: number; snippet: string }[];
}

export interface FullstackBridgeItem {
  frontendFile: string;
  frontendLine: number;
  uiTriggerSnippet: string;
  backendTarget: string; // e.g. "/api/checkout" or "createCheckoutSession"
  targetType: "API Route" | "Server Action";
  httpMethod?: string;
  connectedModels: string[];
  externalService?: string;
}

export interface BackendAuditResult {
  endpoints: ApiEndpoint[];
  models: DbModel[];
  serverActions: ServerAction[];
  authGuards: AuthGuard[];
  integrations: IntegrationService[];
  bridgeItems: FullstackBridgeItem[];
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

function getSourceFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (
      item === "node_modules" ||
      item.startsWith(".next") ||
      item === ".git" ||
      item === "dist" ||
      item === "build" ||
      item === ".turbo" ||
      item === ".cache" ||
      item === "coverage" ||
      item === "docs" ||
      item === "evidence" ||
      item === "screenshots"
    ) {
      continue;
    }
    const fullPath = path.join(dir, item);
    try {
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        getSourceFiles(fullPath, fileList);
      } else if (/\.(tsx|jsx|ts|js|mjs|cjs|prisma|sql)$/.test(item)) {
        fileList.push(fullPath);
      }
    } catch {
      continue;
    }
  }
  return fileList;
}

// 1. Static API Route Parser
export function parseApiRoutes(files: string[], rootDir: string = ROOT_DIR): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];

  files.forEach(filePath => {
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");

    // Next.js App Router Route Handlers: app/**/route.(ts|js|mjs)
    if (relPath.match(/(?:^|\/)(?:src\/)?app\/(.+?)\/route\.(ts|js|mjs)$/)) {
      const match = relPath.match(/(?:^|\/)(?:src\/)?app\/(.+?)\/route\.(ts|js|mjs)$/)!;
      let routePath = "/" + match[1];
      // Convert (group) syntax -> stripped
      routePath = routePath.replace(/\/\([^)]+\)/g, "");

      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      const methods: string[] = [];
      const httpVerbs = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

      let isProtected = false;
      let authGuard: string | undefined;

      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        httpVerbs.forEach(verb => {
          const regex = new RegExp(`export\\s+(?:async\\s+)?function\\s+${verb}\\b`);
          if (regex.test(line)) {
            methods.push(verb);
          }
        });

        if (/\b(?:auth|getServerSession|currentUser|verifyToken|requireAuth|authenticate)\b/.test(line)) {
          isProtected = true;
          authGuard = line.trim().slice(0, 40);
        }
      });

      if (methods.length > 0) {
        endpoints.push({
          urlPath: routePath,
          framework: "Next.js (App Router)",
          filePath,
          relativePath: relPath,
          line: 1,
          methods,
          isProtected,
          authGuard,
          sourceSnippet: `export function ${methods.join(", ")}`,
        });
      }
    }

    // Next.js Pages Router API: pages/api/**/*.(ts|js)
    if (relPath.match(/(?:^|\/)(?:src\/)?pages\/api\/(.+?)\.(ts|js|mjs)$/)) {
      const match = relPath.match(/(?:^|\/)(?:src\/)?pages\/api\/(.+?)\.(ts|js|mjs)$/)!;
      const sub = match[1];
      const routePath = "/api/" + (sub === "index" ? "" : sub.replace(/\/index$/, ""));

      const content = fs.readFileSync(filePath, "utf-8");
      const methods: string[] = [];
      if (/req\.method\s*===?\s*['"]GET['"]/i.test(content)) methods.push("GET");
      if (/req\.method\s*===?\s*['"]POST['"]/i.test(content)) methods.push("POST");
      if (/req\.method\s*===?\s*['"]PUT['"]/i.test(content)) methods.push("PUT");
      if (/req\.method\s*===?\s*['"]DELETE['"]/i.test(content)) methods.push("DELETE");
      if (/req\.method\s*===?\s*['"]PATCH['"]/i.test(content)) methods.push("PATCH");
      if (methods.length === 0) methods.push("ALL");

      const isProtected = /\b(?:auth|getSession|verifyToken|authenticate)\b/.test(content);

      endpoints.push({
        urlPath: routePath,
        framework: "Next.js (Pages Router API)",
        filePath,
        relativePath: relPath,
        line: 1,
        methods,
        isProtected,
        sourceSnippet: `default handler (${methods.join(", ")})`,
      });
    }

    // Express / Hono routes: app.get, router.post, etc.
    if (!relPath.includes("app/") && !relPath.includes("pages/")) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        const lineNum = idx + 1;
        const match = line.match(/\b(?:app|router|route)\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/i);
        if (match) {
          const method = match[1].toUpperCase();
          const routeUrl = match[2];
          const isProtected = /auth|verify|guard|protect/i.test(line);
          endpoints.push({
            urlPath: routeUrl,
            framework: "Express / Hono",
            filePath,
            relativePath: relPath,
            line: lineNum,
            methods: [method],
            isProtected,
            sourceSnippet: line.trim().slice(0, 60),
          });
        }
      });
    }
  });

  return endpoints;
}

// 2. Static Database Schema Parser (Prisma & Drizzle)
export function parseDatabaseModels(files: string[], rootDir: string = ROOT_DIR): DbModel[] {
  const models: DbModel[] = [];

  // 1. Prisma schema parser (schema.prisma)
  const prismaFiles = files.filter(f => f.endsWith(".prisma"));
  prismaFiles.forEach(filePath => {
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    let currentModel: DbModel | null = null;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      const modelMatch = trimmed.match(/^model\s+([A-Za-z0-9_]+)\s*\{/);
      if (modelMatch) {
        currentModel = {
          name: modelMatch[1],
          tableName: modelMatch[1],
          orm: "Prisma",
          filePath,
          relativePath: relPath,
          line: lineNum,
          fields: [],
        };
        models.push(currentModel);
        return;
      }

      if (currentModel && trimmed.startsWith("}")) {
        currentModel = null;
        return;
      }

      if (currentModel && trimmed && !trimmed.startsWith("//") && !trimmed.startsWith("@@")) {
        const parts = trimmed.split(/\s+/);
        if (parts.length >= 2) {
          const fieldName = parts[0];
          const rawType = parts[1];
          const isId = trimmed.includes("@id");
          const isUnique = trimmed.includes("@unique");
          const isOptional = rawType.endsWith("?");
          const isArray = rawType.endsWith("[]");
          const cleanType = rawType.replace(/[?\[\]]/g, "");

          let relationTarget: string | undefined;
          const relationMatch = trimmed.match(/@relation\([^)]*\)/);
          if (relationMatch || (!["String", "Int", "Boolean", "DateTime", "Float", "Json", "BigInt", "Bytes", "Decimal"].includes(cleanType))) {
            relationTarget = cleanType;
          }

          currentModel.fields.push({
            name: fieldName,
            type: rawType,
            isId,
            isUnique,
            isOptional,
            isArray,
            relationTarget,
          });
        }
      }
    });
  });

  // 2. Drizzle schema parser (schema.ts / db/schema.ts)
  const drizzleFiles = files.filter(f =>
    f.endsWith("schema.ts") ||
    f.endsWith("schema.js") ||
    f.includes("db/schema") ||
    f.includes("src/db/schema")
  );

  drizzleFiles.forEach(filePath => {
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const tableMatch = line.match(/(?:export\s+)?const\s+([a-zA-Z0-9_]+)\s*=\s*(?:pgTable|mysqlTable|sqliteTable)\s*\(\s*["']([^"']+)["']/);
      if (tableMatch) {
        const modelVarName = tableMatch[1];
        const tableName = tableMatch[2];
        models.push({
          name: modelVarName,
          tableName,
          orm: "Drizzle",
          filePath,
          relativePath: relPath,
          line: lineNum,
          fields: [],
        });
      }
    });
  });

  // 3. Raw SQL & Supabase Migration Schema Parser (*.sql)
  const sqlFiles = files.filter(f => f.endsWith(".sql"));
  const tableMap = new Map<string, DbModel>();

  // Helper to split SQL definitions inside CREATE TABLE (...) respecting nested parentheses and strings
  function splitSqlDefinitions(body: string): string[] {
    const defs: string[] = [];
    let depth = 0;
    let current = "";
    let inSingleQuote = false;
    for (let i = 0; i < body.length; i++) {
      const char = body[i];
      if (char === "'" && (i === 0 || body[i - 1] !== "\\")) {
        inSingleQuote = !inSingleQuote;
        current += char;
      } else if (!inSingleQuote && char === "(") {
        depth++;
        current += char;
      } else if (!inSingleQuote && char === ")") {
        depth--;
        current += char;
      } else if (!inSingleQuote && char === "," && depth === 0) {
        if (current.trim()) defs.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    if (current.trim()) defs.push(current.trim());
    return defs;
  }

  sqlFiles.forEach(filePath => {
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
    let rawContent = "";
    try {
      rawContent = fs.readFileSync(filePath, "utf-8");
    } catch {
      return;
    }

    // Strip comments
    const stripped = rawContent
      .replace(/\/\*[\s\S]*?\*\//g, "") // remove block comments
      .replace(/--[^\r\n]*/g, "");       // remove line comments

    // Match CREATE TABLE [IF NOT EXISTS] [schema.]<tableName> ( ... )
    const createTableRegex = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+(?:([a-zA-Z0-9_]+)\.)?([a-zA-Z0-9_"]+)\s*\(([\s\S]*?)\);/gi;
    let match: RegExpExecArray | null;

    while ((match = createTableRegex.exec(stripped)) !== null) {
      const rawTableName = match[2].replace(/"/g, "");
      const tableBody = match[3];
      const modelKey = rawTableName.toLowerCase();

      // Estimate line number in original file
      const offset = match.index;
      const lineNum = rawContent.slice(0, offset).split("\n").length;

      let model = tableMap.get(modelKey);
      if (!model) {
        model = {
          name: rawTableName,
          tableName: rawTableName,
          orm: "SQL / Supabase",
          filePath,
          relativePath: relPath,
          line: lineNum,
          fields: [],
        };
        tableMap.set(modelKey, model);
      }

      const definitions = splitSqlDefinitions(tableBody);
      definitions.forEach(def => {
        const trimmed = def.trim();
        if (!trimmed) return;

        // Check if table-level PRIMARY KEY constraint
        const pkMatch = trimmed.match(/^(?:CONSTRAINT\s+[a-zA-Z0-9_]+\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i);
        if (pkMatch) {
          const pkCols = pkMatch[1].split(",").map(c => c.trim().replace(/"/g, "").toLowerCase());
          model!.fields.forEach(f => {
            if (pkCols.includes(f.name.toLowerCase())) f.isId = true;
          });
          return;
        }

        // Check if table-level FOREIGN KEY constraint
        const fkMatch = trimmed.match(/^(?:CONSTRAINT\s+[a-zA-Z0-9_]+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)/i);
        if (fkMatch) {
          const fkCols = fkMatch[1].split(",").map(c => c.trim().replace(/"/g, "").toLowerCase());
          const targetTable = fkMatch[2].replace(/"/g, "");
          model!.fields.forEach(f => {
            if (fkCols.includes(f.name.toLowerCase())) f.relationTarget = targetTable;
          });
          return;
        }

        if (/^(?:CONSTRAINT\s+[a-zA-Z0-9_]+\s+)?(?:CHECK|UNIQUE)\b/i.test(trimmed)) {
          return;
        }

        // Standard column definition: <name> <type> [modifiers...]
        const colMatch = trimmed.match(/^"?([a-zA-Z0-9_]+)"?\s+([a-zA-Z0-9_]+(?:\s*\([^)]*\))?(?:\[\])?)([\s\S]*)$/i);
        if (colMatch) {
          const colName = colMatch[1];
          const colType = colMatch[2].trim();
          const rest = colMatch[3] || "";

          // Skip if reserved SQL keyword as column (e.g. PARTITION BY)
          if (/^(?:PARTITION|CONSTRAINT|INHERITS|PRIMARY|FOREIGN)\b/i.test(colName)) return;

          const isId = /\bPRIMARY\s+KEY\b/i.test(rest);
          const isUnique = /\bUNIQUE\b/i.test(rest);
          const isOptional = !/\bNOT\s+NULL\b/i.test(rest) && !isId;
          const isArray = colType.endsWith("[]") || /\bARRAY\b/i.test(rest);

          let relationTarget: string | undefined;
          const inlineRef = rest.match(/\bREFERENCES\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)/i);
          if (inlineRef) {
            relationTarget = inlineRef[1].replace(/"/g, "");
          }

          const existingField = model!.fields.find(f => f.name.toLowerCase() === colName.toLowerCase());
          if (!existingField) {
            model!.fields.push({
              name: colName,
              type: colType,
              isId,
              isUnique,
              isOptional,
              isArray,
              relationTarget,
            });
          }
        }
      });
    }

    // Also parse ALTER TABLE ... ADD COLUMN ...
    const alterTableRegex = /ALTER\s+TABLE(?:\s+IF\s+EXISTS)?\s+(?:([a-zA-Z0-9_]+)\.)?([a-zA-Z0-9_"]+)\s+ADD\s+COLUMN(?:\s+IF\s+NOT\s+EXISTS)?\s+"?([a-zA-Z0-9_]+)"?\s+([a-zA-Z0-9_]+(?:\s*\([^)]*\))?(?:\[\])?)([\s\S]*?);/gi;
    let alterMatch: RegExpExecArray | null;

    while ((alterMatch = alterTableRegex.exec(stripped)) !== null) {
      const rawTableName = alterMatch[2].replace(/"/g, "");
      const colName = alterMatch[3];
      const colType = alterMatch[4].trim();
      const rest = alterMatch[5] || "";
      const modelKey = rawTableName.toLowerCase();

      let model = tableMap.get(modelKey);
      if (!model) {
        const offset = alterMatch.index;
        const lineNum = rawContent.slice(0, offset).split("\n").length;
        model = {
          name: rawTableName,
          tableName: rawTableName,
          orm: "SQL / Supabase",
          filePath,
          relativePath: relPath,
          line: lineNum,
          fields: [],
        };
        tableMap.set(modelKey, model);
      }

      const existingField = model.fields.find(f => f.name.toLowerCase() === colName.toLowerCase());
      if (!existingField) {
        const isId = /\bPRIMARY\s+KEY\b/i.test(rest);
        const isUnique = /\bUNIQUE\b/i.test(rest);
        const isOptional = !/\bNOT\s+NULL\b/i.test(rest) && !isId;
        const isArray = colType.endsWith("[]") || /\bARRAY\b/i.test(rest);

        let relationTarget: string | undefined;
        const inlineRef = rest.match(/\bREFERENCES\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)/i);
        if (inlineRef) {
          relationTarget = inlineRef[1].replace(/"/g, "");
        }

        model.fields.push({
          name: colName,
          type: colType,
          isId,
          isUnique,
          isOptional,
          isArray,
          relationTarget,
        });
      }
    }
  });

  tableMap.forEach(m => models.push(m));

  return models;
}

// 3. Static Server Actions Parser ("use server")
export function parseServerActions(files: string[], rootDir: string = ROOT_DIR): ServerAction[] {
  const actions: ServerAction[] = [];

  files.forEach(filePath => {
    if (!/\.(tsx|ts|js|jsx)$/.test(filePath)) return;
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
    const content = fs.readFileSync(filePath, "utf-8");

    const hasFileLevelUseServer = /^\s*["']use server["']/m.test(content);
    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      // Check exported async functions
      const fnMatch = trimmed.match(/export\s+async\s+function\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
      if (fnMatch) {
        const actionName = fnMatch[1];
        const params = fnMatch[2].trim();

        // Check if file is "use server" or if function body starts with "use server"
        const nextLines = lines.slice(idx, idx + 5).join(" ");
        const isAction = hasFileLevelUseServer || /["']use server["']/.test(nextLines);

        if (isAction) {
          // Detect DB or service operations inside function body
          const fnBody = lines.slice(idx, Math.min(lines.length, idx + 35)).join("\n");
          const dbOperations: string[] = [];
          if (/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|find|upsert)/.test(fnBody)) dbOperations.push("Prisma ORM");
          if (/db\.(insert|update|delete|select)/.test(fnBody)) dbOperations.push("Drizzle ORM");

          const externalServices: string[] = [];
          if (/stripe\./i.test(fnBody)) externalServices.push("Stripe");
          if (/resend\./i.test(fnBody)) externalServices.push("Resend");
          if (/supabase\./i.test(fnBody)) externalServices.push("Supabase");

          actions.push({
            name: actionName,
            filePath,
            relativePath: relPath,
            line: lineNum,
            params: params || "()",
            dbOperations,
            externalServices,
            snippet: trimmed.slice(0, 60),
          });
        }
      }
    });
  });

  return actions;
}

// 4. Static Auth & Middleware Guards Parser
export function parseAuthGuards(files: string[], rootDir: string = ROOT_DIR): AuthGuard[] {
  const guards: AuthGuard[] = [];

  const middlewareFiles = files.filter(f =>
    f.endsWith("middleware.ts") ||
    f.endsWith("middleware.js") ||
    f.endsWith("src/middleware.ts")
  );

  middlewareFiles.forEach(filePath => {
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    let authProvider = "Custom Middleware";
    if (/@clerk\/nextjs/.test(content)) authProvider = "Clerk Auth";
    else if (/next-auth/.test(content)) authProvider = "NextAuth / Auth.js";
    else if (/@supabase\/auth/.test(content) || /@supabase\/ssr/.test(content)) authProvider = "Supabase Auth";
    else if (/lucia/.test(content)) authProvider = "Lucia Auth";

    const matcherPatterns: string[] = [];
    const matcherMatch = content.match(/matcher:\s*\[([\s\S]*?)\]/);
    if (matcherMatch) {
      const items = matcherMatch[1].match(/["']([^"']+)["']/g);
      if (items) {
        items.forEach(it => matcherPatterns.push(it.replace(/['"]/g, "")));
      }
    }

    guards.push({
      filePath,
      relativePath: relPath,
      line: 1,
      matcherPatterns,
      authProvider,
      protectedRoutes: matcherPatterns.filter(p => !p.includes("public") && !p.includes("favicon") && !p.includes("api/webhooks")),
      publicRoutes: matcherPatterns.filter(p => p.includes("public") || p.includes("api/webhooks")),
    });
  });

  return guards;
}

// 5. Integrations & Webhooks Parser
export function parseIntegrations(files: string[], rootDir: string = ROOT_DIR): IntegrationService[] {
  const serviceDefs: { name: string; category: IntegrationService["category"]; importRegex: RegExp }[] = [
    { name: "Stripe Payments", category: "Payment", importRegex: /["'](?:stripe|@stripe\/stripe-js)["']/ },
    { name: "Resend Emails", category: "Email", importRegex: /["']resend["']/ },
    { name: "Supabase BaaS", category: "Database / BaaS", importRegex: /["']@supabase\/(?:supabase-js|ssr)["']/ },
    { name: "AWS S3 Storage", category: "Storage", importRegex: /["']@aws-sdk\/client-s3["']/ },
    { name: "OpenAI AI SDK", category: "AI / LLM", importRegex: /["'](?:openai|ai)["']/ },
    { name: "Anthropic AI SDK", category: "AI / LLM", importRegex: /["']@anthropic-ai\/sdk["']/ },
    { name: "Twilio SMS", category: "SMS / Auth", importRegex: /["']twilio["']/ },
  ];

  const results: IntegrationService[] = [];

  serviceDefs.forEach(def => {
    const detectedFiles: { file: string; line: number; snippet: string }[] = [];
    const webhookRoutes: string[] = [];

    files.forEach(filePath => {
      const content = fs.readFileSync(filePath, "utf-8");
      if (def.importRegex.test(content)) {
        const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
        const lines = content.split("\n");
        lines.forEach((line, idx) => {
          if (def.importRegex.test(line)) {
            detectedFiles.push({
              file: relPath,
              line: idx + 1,
              snippet: line.trim().slice(0, 70),
            });
          }
        });

        if (relPath.includes("webhook") || relPath.includes("api/webhooks")) {
          webhookRoutes.push(relPath);
        }
      }
    });

    if (detectedFiles.length > 0) {
      results.push({
        name: def.name,
        category: def.category,
        clientImports: Array.from(new Set(detectedFiles.map(d => d.file))),
        webhookRoutes: Array.from(new Set(webhookRoutes)),
        detectedFiles,
      });
    }
  });

  return results;
}

// 6. Fullstack Cross-Reference Bridge (Frontend UI ➔ Backend Actions / APIs)
export function buildFullstackBridge(
  files: string[],
  endpoints: ApiEndpoint[],
  actions: ServerAction[],
  models: DbModel[],
  rootDir: string = ROOT_DIR
): FullstackBridgeItem[] {
  const bridgeItems: FullstackBridgeItem[] = [];
  const endpointContentCache = new Map<string, string>();

  function getEndpointContent(epPath: string): string {
    if (endpointContentCache.has(epPath)) return endpointContentCache.get(epPath)!;
    try {
      const c = fs.readFileSync(epPath, "utf-8");
      endpointContentCache.set(epPath, c);
      return c;
    } catch {
      endpointContentCache.set(epPath, "");
      return "";
    }
  }

  files.forEach(filePath => {
    // Only inspect UI components
    const relPath = path.relative(rootDir, filePath).replace(/\\/g, "/");
    if (!relPath.endsWith(".tsx") && !relPath.endsWith(".jsx") && !relPath.endsWith(".svelte") && !relPath.endsWith(".vue")) {
      return;
    }

    let content = "";
    try {
      content = fs.readFileSync(filePath, "utf-8");
    } catch {
      return;
    }

    const lines = content.split("\n");

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const trimmed = line.trim();

      // Check fetch("/api/...") or axios.post("/api/...")
      const fetchMatch = trimmed.match(/\b(?:fetch|axios\.(?:get|post|put|delete|patch))\s*\(\s*["'`]([^"'`]*\/api\/[^"'`]+)["'`]/);
      if (fetchMatch) {
        const rawTarget = fetchMatch[1];
        const matchingEndpoint = endpoints.find(e => rawTarget.startsWith(e.urlPath) || e.urlPath.startsWith(rawTarget));
        const method = trimmed.match(/method:\s*["'](GET|POST|PUT|DELETE|PATCH)["']/i)?.[1]?.toUpperCase() ||
          trimmed.match(/axios\.(get|post|put|delete|patch)/i)?.[1]?.toUpperCase() ||
          (matchingEndpoint?.methods[0] || "GET");

        let connectedModels: string[] = [];
        if (matchingEndpoint) {
          const epContent = getEndpointContent(matchingEndpoint.filePath);
          connectedModels = models
            .filter(m => {
              const nameRegex = new RegExp(`\\b${m.name}\\b|\\b${m.tableName}\\b`, "i");
              return matchingEndpoint.filePath.toLowerCase().includes(m.name.toLowerCase()) || nameRegex.test(epContent);
            })
            .map(m => m.name);
        }

        bridgeItems.push({
          frontendFile: relPath,
          frontendLine: lineNum,
          uiTriggerSnippet: trimmed.slice(0, 60),
          backendTarget: rawTarget,
          targetType: "API Route",
          httpMethod: method,
          connectedModels,
          externalService: rawTarget.includes("stripe") ? "Stripe" : rawTarget.includes("resend") ? "Resend" : undefined,
        });
      }

      // Check Server Action calls
      actions.forEach(action => {
        const actionCallRegex = new RegExp(`\\b${action.name}\\s*\\(`);
        if (actionCallRegex.test(trimmed) && relPath !== action.relativePath) {
          bridgeItems.push({
            frontendFile: relPath,
            frontendLine: lineNum,
            uiTriggerSnippet: trimmed.slice(0, 60),
            backendTarget: `${action.name}()`,
            targetType: "Server Action",
            httpMethod: "POST",
            connectedModels: action.dbOperations.length > 0 ? models.map(m => m.name).slice(0, 2) : [],
            externalService: action.externalServices[0],
          });
        }
      });
    });
  });

  return bridgeItems;
}

// Writers for docs/backend-atlas/
export function writeBackendAtlas(result: BackendAuditResult, rootDir: string = ROOT_DIR) {
  const outputDir = path.join(rootDir, "docs", "backend-atlas");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. 01_API_ROUTES_AND_ENDPOINTS.md
  let md01 = `# 🌐 Backend API Routes & HTTP Endpoints\n\n`;
  md01 += `> Complete registry of all API endpoints, route handlers, HTTP methods, and auth protection.\n\n`;
  md01 += `## 📊 Endpoints Summary: **${result.endpoints.length}** Endpoints Detected\n\n`;
  md01 += `| Route URL | HTTP Methods | Framework | Auth Guard | Source File |\n`;
  md01 += `| :--- | :--- | :--- | :--- | :--- |\n`;

  if (result.endpoints.length === 0) {
    md01 += `| _No API endpoints found_ | — | — | — | — |\n`;
  } else {
    result.endpoints.forEach(e => {
      const fileLink = makeFileLink(e.relativePath, e.line, `${e.relativePath}:${e.line}`);
      const methodsBadge = e.methods.map(m => `\`${m}\``).join(" ");
      const authBadge = e.isProtected ? `🔒 \`Protected\` (${e.authGuard || "Guarded"})` : `🔓 \`Public\``;
      md01 += `| \`${e.urlPath}\` | ${methodsBadge} | ${e.framework} | ${authBadge} | ${fileLink} |\n`;
    });
  }
  fs.writeFileSync(path.join(outputDir, "01_API_ROUTES_AND_ENDPOINTS.md"), md01);

  // 2. 02_DATABASE_MODELS_AND_SCHEMA.md
  let md02 = `# 🗄️ Database Models & Schema Registry\n\n`;
  md02 += `> Statically cataloged tables, fields, types, and foreign key relations from Prisma, Drizzle, and Raw SQL / Supabase Migrations.\n\n`;
  md02 += `## 📊 Models Summary: **${result.models.length}** Database Models Detected\n\n`;

  if (result.models.length === 0) {
    md02 += `_No database schema files detected (Prisma schema.prisma, Drizzle schema.ts, or SQL migrations)._\n`;
  } else {
    result.models.forEach(model => {
      const fileLink = makeFileLink(model.relativePath, model.line, `${model.relativePath}:${model.line}`);
      md02 += `### 📦 Model \`${model.name}\` (${model.orm})\n\n`;
      md02 += `- **Table Name**: \`${model.tableName}\`\n`;
      md02 += `- **Source**: ${fileLink}\n`;
      md02 += `- **Total Fields**: **${model.fields.length}**\n\n`;

      if (model.fields.length > 0) {
        md02 += `| Field Name | Type | Attributes | Relation Target |\n`;
        md02 += `| :--- | :--- | :--- | :--- |\n`;
        model.fields.forEach(f => {
          const attrs: string[] = [];
          if (f.isId) attrs.push("`@id`");
          if (f.isUnique) attrs.push("`@unique`");
          if (f.isOptional) attrs.push("`optional?`");
          if (f.isArray) attrs.push("`array[]`");
          const attrStr = attrs.length > 0 ? attrs.join(" ") : "_none_";
          const relStr = f.relationTarget ? `➔ \`${f.relationTarget}\`` : "—";
          md02 += `| \`${f.name}\` | \`${f.type}\` | ${attrStr} | ${relStr} |\n`;
        });
        md02 += `\n`;
      }
    });
  }
  fs.writeFileSync(path.join(outputDir, "02_DATABASE_MODELS_AND_SCHEMA.md"), md02);

  // 3. 03_SERVER_ACTIONS_AND_MUTATIONS.md
  let md03 = `# ⚡ Server Actions & Mutations Map\n\n`;
  md03 += `> Inventory of Next.js Server Actions (\`"use server"\`), parameter signatures, and DB mutations.\n\n`;
  md03 += `## 📊 Server Actions Summary: **${result.serverActions.length}** Actions Detected\n\n`;
  md03 += `| Action Function | Parameters | Connected ORM / DB | Services | File : Line |\n`;
  md03 += `| :--- | :--- | :--- | :--- | :--- |\n`;

  if (result.serverActions.length === 0) {
    md03 += `| _No server actions found_ | — | — | — | — |\n`;
  } else {
    result.serverActions.forEach(a => {
      const fileLink = makeFileLink(a.relativePath, a.line, `${a.relativePath}:${a.line}`);
      const dbStr = a.dbOperations.length > 0 ? a.dbOperations.join(", ") : "_Direct Mutation_";
      const srvStr = a.externalServices.length > 0 ? a.externalServices.join(", ") : "_None_";
      md03 += `| \`${a.name}()\` | \`${a.params}\` | ${dbStr} | ${srvStr} | ${fileLink} |\n`;
    });
  }
  fs.writeFileSync(path.join(outputDir, "03_SERVER_ACTIONS_AND_MUTATIONS.md"), md03);

  // 4. 04_AUTH_AND_MIDDLEWARE_GUARDS.md
  let md04 = `# 🛡️ Auth & Middleware Route Guards\n\n`;
  md04 += `> Audit of middleware matchers, route protection rules, and authentication providers.\n\n`;

  if (result.authGuards.length === 0) {
    md04 += `_No middleware.ts file detected in project root or src/._\n`;
  } else {
    result.authGuards.forEach(g => {
      const fileLink = makeFileLink(g.relativePath, g.line, `${g.relativePath}:${g.line}`);
      md04 += `## 🔐 Active Middleware: \`${g.authProvider}\`\n\n`;
      md04 += `- **Source**: ${fileLink}\n`;
      md04 += `- **Configured Matchers**: \`${g.matcherPatterns.join("`, `") || "All Routes"}\`\n\n`;

      md04 += `### 🔒 Protected Route Patterns\n\n`;
      if (g.protectedRoutes.length > 0) {
        g.protectedRoutes.forEach(r => md04 += `- \`${r}\` (Requires Authentication)\n`);
      } else {
        md04 += `_No explicitly protected patterns in matcher array._\n`;
      }
    });
  }
  fs.writeFileSync(path.join(outputDir, "04_AUTH_AND_MIDDLEWARE_GUARDS.md"), md04);

  // 5. 05_INTEGRATIONS_AND_WEBHOOKS.md
  let md05 = `# 🔌 External Integrations & Webhooks\n\n`;
  md05 += `> Map of third-party SDK clients (Stripe, Resend, Supabase, S3) and incoming webhook handlers.\n\n`;
  md05 += `## 📊 Integrations Summary: **${result.integrations.length}** Active Integrations\n\n`;

  if (result.integrations.length === 0) {
    md05 += `_No third-party client integrations detected in package dependencies or code._\n`;
  } else {
    result.integrations.forEach(i => {
      md05 += `### 🚀 ${i.name} (\`${i.category}\`)\n\n`;
      md05 += `- **Total Client Imports**: **${i.clientImports.length}** files\n`;
      if (i.webhookRoutes.length > 0) {
        md05 += `- **Incoming Webhook Handlers**: \`${i.webhookRoutes.join("`, `")}\`\n`;
      }
      md05 += `\n| File | Line | Snippet Preview |\n`;
      md05 += `| :--- | :--- | :--- |\n`;
      i.detectedFiles.slice(0, 8).forEach(d => {
        const fileLink = makeFileLink(d.file, d.line, `${d.file}:${d.line}`);
        md05 += `| ${fileLink} | ${d.line} | \`${escapeMarkdownSnippet(d.snippet, 55)}\` |\n`;
      });
      md05 += `\n`;
    });
  }
  fs.writeFileSync(path.join(outputDir, "05_INTEGRATIONS_AND_WEBHOOKS.md"), md05);

  // 6. 06_FULLSTACK_CROSS_REFERENCE_MAP.md
  let md06 = `# 🌉 Fullstack Cross-Reference Bridge\n\n`;
  md06 += `> Bi-directional bridge linking Frontend UI triggers directly to Backend APIs, Server Actions, and Database Models.\n\n`;
  md06 += `## 📊 Fullstack Connections: **${result.bridgeItems.length}** Linked Triggers\n\n`;
  md06 += `| Frontend UI Trigger | Action / API Target | Type | Method | Connected Database Models | Service |\n`;
  md06 += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  if (result.bridgeItems.length === 0) {
    md06 += `| _No direct cross-boundary triggers detected_ | — | — | — | — | — |\n`;
  } else {
    result.bridgeItems.forEach(b => {
      const fileLink = makeFileLink(b.frontendFile, b.frontendLine, `${path.basename(b.frontendFile)}:${b.frontendLine}`);
      const modelsStr = b.connectedModels.length > 0 ? b.connectedModels.map(m => `\`${m}\``).join(", ") : "_Direct / Dynamic_";
      const serviceStr = b.externalService ? `\`${b.externalService}\`` : "—";
      md06 += `| ${fileLink} | \`${b.backendTarget}\` | \`${b.targetType}\` | \`${b.httpMethod || "POST"}\` | ${modelsStr} | ${serviceStr} |\n`;
    });
  }
  fs.writeFileSync(path.join(outputDir, "06_FULLSTACK_CROSS_REFERENCE_MAP.md"), md06);

  // 7. README.md
  let mdReadme = `# 📖 Backend Atlas & Architecture Catalog\n\n`;
  mdReadme += `> Statically cataloged backend infrastructure for this project.\n`;
  mdReadme += `> Run \`npx fullstack-audit --backend\` or \`npm run audit:backend\` to refresh.\n\n`;
  mdReadme += `## 📊 Backend Statistics\n\n`;
  mdReadme += `- **HTTP API Endpoints**: **${result.endpoints.length}**\n`;
  mdReadme += `- **Database Models / Tables**: **${result.models.length}**\n`;
  mdReadme += `- **Server Actions ("use server")**: **${result.serverActions.length}**\n`;
  mdReadme += `- **Auth Middleware Guards**: **${result.authGuards.length > 0 ? result.authGuards[0].authProvider : "None"}**\n`;
  mdReadme += `- **External Integrations**: **${result.integrations.length}** services\n`;
  mdReadme += `- **Fullstack Cross-Reference Links**: **${result.bridgeItems.length}** connected triggers\n\n`;

  mdReadme += `## 📑 Backend Atlas Documents\n\n`;
  mdReadme += `1. **[01_API_ROUTES_AND_ENDPOINTS.md](./01_API_ROUTES_AND_ENDPOINTS.md)**: HTTP API routes, methods, and parameters.\n`;
  mdReadme += `2. **[02_DATABASE_MODELS_AND_SCHEMA.md](./02_DATABASE_MODELS_AND_SCHEMA.md)**: Prisma and Drizzle models, fields, and relations.\n`;
  mdReadme += `3. **[03_SERVER_ACTIONS_AND_MUTATIONS.md](./03_SERVER_ACTIONS_AND_MUTATIONS.md)**: Server Actions, parameters, and mutations.\n`;
  mdReadme += `4. **[04_AUTH_AND_MIDDLEWARE_GUARDS.md](./04_AUTH_AND_MIDDLEWARE_GUARDS.md)**: Middleware matchers and route protection.\n`;
  mdReadme += `5. **[05_INTEGRATIONS_AND_WEBHOOKS.md](./05_INTEGRATIONS_AND_WEBHOOKS.md)**: Stripe, Resend, Supabase, and S3 clients.\n`;
  mdReadme += `6. **[06_FULLSTACK_CROSS_REFERENCE_MAP.md](./06_FULLSTACK_CROSS_REFERENCE_MAP.md)**: Cross-boundary link from UI button to backend database.\n\n`;

  fs.writeFileSync(path.join(outputDir, "README.md"), mdReadme);

  console.log(`✨ Backend Atlas written to: ${path.relative(rootDir, outputDir)}`);
}

// Main execution function
export async function runUniversalBackendAudit(rootDir: string = ROOT_DIR): Promise<BackendAuditResult> {
  console.log("🛡️ Initializing Universal Backend Atlas Engine (v2.0.0)...");
  const allFiles: string[] = [];
  getSourceFiles(rootDir, allFiles);
  const uniqueFiles = Array.from(new Set(allFiles));

  const endpoints = parseApiRoutes(uniqueFiles, rootDir);
  const models = parseDatabaseModels(uniqueFiles, rootDir);
  const serverActions = parseServerActions(uniqueFiles, rootDir);
  const authGuards = parseAuthGuards(uniqueFiles, rootDir);
  const integrations = parseIntegrations(uniqueFiles, rootDir);
  const bridgeItems = buildFullstackBridge(uniqueFiles, endpoints, serverActions, models, rootDir);

  const result: BackendAuditResult = {
    endpoints,
    models,
    serverActions,
    authGuards,
    integrations,
    bridgeItems,
  };

  writeBackendAtlas(result, rootDir);
  return result;
}

// Standalone execution if invoked directly
if (process.argv[1] && process.argv[1].includes("audit-backend")) {
  runUniversalBackendAudit();
}
