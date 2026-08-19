# GovProject PMIS — Desktop Installer

This packages the single-file web app (`govproject_pmis.html`) into a **cross-platform
desktop application** using [Electron](https://www.electronjs.org/) and
[electron-builder](https://www.electron.build/).

The app keeps working exactly as before — its data lives in the browser **IndexedDB**
database (per-OS user profile), and all modules, languages and backups are unchanged.

> Built by **Juil Gitom**.

## Quick start

```bash
# 1) Install dependencies (Node.js 18+ required)
npm install

# 2) Run the app in a desktop window (development)
npm start

# 3) Generate / regenerate the app icon (optional)
npm run icon
```

## Build installers

```bash
# Build for the CURRENT platform (whatever OS you're on)
npm run dist

# Or build for a specific platform:
npm run dist:mac    # macOS  → release/GovProject PMIS-3.0.0-arm64.dmg (+ .zip)
npm run dist:win    # Windows → release/GovProject PMIS Setup 3.0.0.exe
npm run dist:linux  # Linux  → release/GovProject PMIS-3.0.0.AppImage (+ .deb)
```

Build output appears in the **`release/`** folder.

### Platform notes
- **macOS**: build the `.dmg`/`.zip` on a Mac. `arm64` (Apple Silicon) and `x64`
  (Intel) builds are both configured.
- **Unsigned builds**: without a Developer ID cert, add `-c.mac.identity=null`
  (or set `CSC_IDENTITY_AUTO_DISCOVERY=false`) so electron-builder skips codesigning:
  ```bash
  npx electron-builder --mac -c.mac.identity=null   # unsigned .dmg + .zip
  ```
  A valid unsigned macOS installer (`GovProject PMIS-3.0.0-arm64-mac.zip`) has
  already been produced in `release/` and can be used as-is.
- **Windows**: the `.exe` (NSIS installer) is best built on Windows. Building a
  Windows installer from macOS requires **Wine** to be installed.
- **Linux**: `.AppImage` and `.deb` can be built on macOS or Linux.

> Tip: for reliable cross-platform builds, use a CI service (GitHub Actions etc.)
> and build each platform on its native OS.

## Project layout

```
Project Management/
├── govproject_pmis.html   # the app itself (single file)
├── main.js                # Electron main process (window + security)
├── preload.js             # isolated preload (minimal)
├── package.json           # app metadata + electron-builder config
├── build/
│   └── icon.png           # app icon (auto-converted to .icns/.ico)
├── scripts/
│   └── make-icon.js       # regenerates build/icon.png (no deps)
└── release/               # generated installers (git-ignored)
```

## Troubleshooting

- **`Electron failed to install correctly`** — newer npm versions block package
  install scripts by default, so the Electron binary isn't downloaded. Fix with:
  ```bash
  npm rebuild electron          # or: node node_modules/electron/install.js
  npm start
  ```
- **`x509: failed to load system roots` / TLS errors during build** — only seen
  inside sandboxed shells (certificate store inaccessible). Run the build from a
  normal terminal; if it persists, set `SSL_CERT_FILE` to your system CA bundle.
- **Windows installer from macOS** requires **Wine** (`brew install --cask
  wine-stable`). Building on native Windows is recommended.
- **Codesigning/notarization** — these installers are unsigned. To distribute
  publicly on macOS, set `CSC_LINK` / `CSC_KEY_PASSWORD` (Developer ID) and add
  a `notarize` config; on Windows, configure a code-signing cert.

## First-run behaviour
- The app opens in a desktop window (1440×900, resizable).
- Data is stored in the OS user profile (IndexedDB), so it survives app restarts
  and is kept separate from the browser version.
- Use **Reports → Backup** to export a JSON backup, and **Reports → Import** to
  restore it on another machine.
