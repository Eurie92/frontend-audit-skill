## fullstack-audit v2.11.2: Idempotent CI/CD Release Pipeline

### Summary
v2.11.2 fixes a race condition in the GitHub Actions release workflow that caused releases to fail with HTTP 422 `already_exists` when releases were published or drafted concurrently. It replaces the third-party `softprops/action-gh-release` action with native, idempotent `gh` CLI management.

---

### Bug Fixes and Reliability

- **Idempotent GitHub Actions Release Workflow (`.github/workflows/release.yml`)**:
  - Replaced `softprops/action-gh-release@v2` with GitHub's native `gh` CLI.
  - Implemented proactive release detection using `gh release view`. If a release already exists for the tag, the workflow synchronizes notes if available and exits cleanly with code 0 instead of throwing `Validation Failed: {"resource":"Release","code":"already_exists","field":"tag_name"}` and retrying to failure.
  - Automatically picks up corresponding `RELEASE_NOTES_v*.md` files or falls back to standard GitHub notes generation.

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

**Full Changelog**: https://github.com/Eurie92/fullstack-audit-skill/compare/v2.11.1...v2.11.2
