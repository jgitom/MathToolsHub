# MathToolsHub SME POS — Desktop installer

Windows desktop build of the SME POS System app, packaged with Electron + electron-builder (NSIS installer).

## What's inside

- `index.html` — the SME POS app (single self-contained file: sales, products, barcode scanner, receipts, reports, IndexedDB storage, 4-tier Ed25519 licensing).
- `main.cjs` — Electron main process (window shell + native "Save As" dialog IPC).
- `preload.cjs` — sandboxed bridge exposing `window.desktopAPI` (version + `saveFile`).

> `index.html` is a copy of `../sme-pos-system/index.html` plus a small desktop-only
> script block (guarded by `window.desktopAPI`). **Keep it in sync** when you change
> the web app: `Copy-Item ../sme-pos-system/index.html index.html` then re-apply the
> desktop block at the bottom.

## Build locally

```powershell
npm ci
npm run dist:win        # NSIS installer in dist/
npm start               # run unpackaged (dev)
```

Installer output: `dist/MathToolsHub-SME-POS-<version>-x64.exe` (one-click off, user can
choose install dir, desktop + Start Menu shortcuts).

## Smoke test (dev)

Launch the app headlessly and verify the renderer boots with `desktopAPI` exposed:

```powershell
.\node_modules\.bin\electron.cmd smoke.cjs
```

Expect `APP_LOADED: true`, `DESKTOP_API: true`, `RENDERER_ERRORS: none`.

## Build via CI

Push a tag `sme-pos-v*` (e.g. `sme-pos-v1.0.0`) and the workflow
`.github/workflows/build-sme-pos.yml` builds on `windows-latest` and uploads the
installer as an action artifact.

## Releasing (after CI artifact is produced)

1. Download the `sme-pos-windows` artifact from the Actions run.
2. Upload the `.exe` to the R2 bucket for SME POS installers, e.g.:
   ```
   node C:\Docker\mathtoolshub\.node-portable\node_modules\wrangler\bin\wrangler.js r2 object put mathtoolshub-sme-pos-installers/windows/MathToolsHub-SME-POS-<version>-x64.exe --file <path> --remote
   ```
3. Wire the licence-signing + download flow (Supabase function `sme-pos-download`,
   live Stripe Payment Links, download page) — currently pending.

## Versioning

Bump `version` in `package.json`, commit, tag `sme-pos-vX.Y.Z`, push. The installer
filename embeds the version automatically.
