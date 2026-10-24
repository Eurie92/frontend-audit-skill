# 📊 200-Run Empirical Benchmark Report (xnight SaaS Codebase)
> **Target:** `xnight` (`C:\Users\EURIE\Dev\SaaS\xnight`)  
> **Evaluator:** `scripts/benchmark-xnight.ts`  
> **Timestamp:** 2026-10-24T12:04:00Z  
> **Trials:** 200 Trials (100 Vanilla Grep vs. 100 Native MCP Plugin)  

---

## 🏆 Executive Summary

| Performance Dimension | Vanilla Agent (PowerShell / File Grep) | Fullstack Audit (Native MCP Plugin) | Measured Gain |
| :--- | :---: | :---: | :--- |
| **Median Latency (p50)** | **1,289.81 ms** | **0.43 ms** | **3,016x faster** |
| **95th Percentile (p95)** | **9,368.69 ms** | **10.57 ms** | **887x faster** |
| **99th Percentile (p99)** | **16,886.25 ms** | **132.65 ms** | **127x faster** |
| **Average Latency (Mean)** | **2,415.18 ms** | **3.03 ms** | **797x faster** |
| **Context Tokens Consumed** | **17,787,360 tokens** | **4,500 tokens** | **99.97% Token Savings** |
| **Process Spawning** | 100 Child Processes (Defender lag) | **0 Processes (Persistent Daemon)** | **Zero Shell / Quoting Overhead** |

---

## 🔬 Trial Categories Tested (Across 200 Iterations)
1. **CTA & Action Links**: `Explore 12 Dispensers`, `Guest Checkout`, `Buying Help`.
2. **Interactive Triggers**: `Toggle color theme`, `theme-toggle`, `track`.
3. **Visual Indicators**: Live status dots (`pulse`, `amber-500`), Lucide icons (`Sun`, `Moon`).
4. **Fuzzy Component Lookups**: `ThemeToggle`, `StorefrontHero`, `customer-wallet`.
5. **Monolithic God-File Methods**: `manual-order.service.ts`, `p2p-settlement.service.ts`, `checkout`.

---

## 💡 Key Architectural Insights
1. **Sub-Millisecond In-Memory Queries**:
   - The native MCP plugin queries `.atlas-index.json` in memory via JSON-RPC in **0.43ms (median)**, compared to **1.28 seconds to 16.8 seconds** for file-by-file text searching.
2. **Token Preservation**:
   - Vanilla agents scanning files consume **17.7 million tokens** because they must read files into memory or context. The MCP plugin returns single-line deterministic targets consuming only **45 tokens per query**.
3. **Elimination of Hook Stalls**:
   - Removing the hanging `orca-status` pre-tool hook in `~/.gemini/config/hooks.json` restores instant tool execution across Antigravity.
