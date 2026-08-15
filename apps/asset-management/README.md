# MathToolsHub Asset Management

Offline desktop asset inventory for Windows and macOS. Records are stored as JSON inside Electron's per-user application-data directory.

## Development

```sh
npm ci
npm start
```

## Packaging

- Windows x64 NSIS installer: `npm run dist:win`
- macOS Intel/Apple Silicon DMG and ZIP: `npm run dist:mac`

DMG packages must be built on macOS. The repository workflow builds each platform on its native GitHub-hosted runner. Production distribution should add Apple Developer ID signing/notarisation and Windows code signing through repository secrets.

## Data and privacy

The application works offline and does not transmit asset records. Users can export/import JSON backups from the application.

## Licence enforcement

Stripe checkout returns a signed `.mthlic` licence. The private Ed25519 signing key remains in the payment-verification Edge Function; the desktop package contains only the public verification key. Users activate the downloaded licence from the application toolbar.

The Electron main process verifies the signature and enforces the purchased 1,000, 10,000, or 100,000 asset capacity when records are saved or a backup is imported. Renderer checks provide earlier feedback but are not the security boundary.

Run `npm test` to verify capacity boundaries and tamper rejection.
