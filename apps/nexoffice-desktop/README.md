# NexOffice — Desktop installer

Windows desktop build of NexOffice (Office Management System), packaged with Electron + electron-builder (NSIS installer).

## What's inside

- `nexoffice_office_management_system.html` — the full NexOffice app (single self-contained file: staf, gaji/payroll, cuti, kehadiran, laporan; IndexedDB storage; Malay/English i18n; **Manual OT** — admin can add OT date + hours into salary).
- `electron/main.js` — Electron main process (window shell).
- `electron/preload.js` — sandboxed preload bridge.
- `nsis-ms-patch.js` — adds Malay (`ms`) + Indonesian (`id`) translations to electron-builder's NSIS installer templates (runs via `postinstall`).

> `nexoffice_office_management_system.html` is a copy of the live demo at
> `../nexoffice-demo/nexoffice_office_management_system.html` (plus a small
> desktop-only script block). **Keep it in sync** when you change the web app.

## Build locally

```powershell
npm ci
npm run dist:win        # NSIS installer in dist/
npm start               # run unpackaged (dev)
```

Installer output: `dist/NexOffice-Setup-<version>.exe` (assisted installer, user
can choose install dir, desktop + Start Menu shortcuts, multi-language).

> Note: electron-builder needs to extract `winCodeSign` (creates symlinks).
> On Windows, run with Developer Mode enabled or from an elevated terminal,
> otherwise you may see "Cannot create symbolic link".

## Build via CI

Push a tag `nexoffice-v*` (e.g. `nexoffice-v1.0.0`) and the workflow
`.github/workflows/build-nexoffice.yml` builds on `windows-latest` and uploads
the installer as an artifact. Download it and upload to R2
(`mathtoolshub-nexoffice-installers/windows/NexOffice-Setup-<version>.exe`).
