# Panduan Menandatangani Pemasang (Code Signing Guide)

Pemasang `NexOffice-Setup-1.0.0.exe` yang dibina secara lalai **tidak ditandatangani**.
Windows SmartScreen akan menunjukkan amaran *"Windows protected your PC"* pada kali pertama
dilancarkan (klik **More info → Run anyway**). Penandatanganan digital menghilangkan amaran ini
dan menambah kepercayaan pengguna.

> English: By default the installer is unsigned, so Windows SmartScreen shows a warning on first
> launch. Signing removes that warning.

---

## Pilihan 1 — Sijil komersial (disyorkan untuk pengedaran awam)

Beli sijil **Code Signing** daripada pembekal seperti DigiCert, Sectigo, GlobalSign, atau SSL.com
(OV/EV). Untuk EV, keperluan: token USB / cloud HSM. Setelah mendapat sijil (format `.pfx`/`.p12`):

```bash
# Windows
set CSC_LINK=C:\path\to\certificate.pfx
set CSC_KEY_PASSWORD=password_anda
npm run dist:win

# macOS / Linux
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=password_anda
CSC_IDENTITY_AUTO_DISCOVERY=false npm run dist:win
```

electron-builder akan menandatangani `NexOffice.exe` dan pemasang `.exe` secara automatik.

## Pilihan 2 — Azure Trusted Signing (murah, tanpa token)

Perkhidmatan Microsoft untuk penandatanganan cloud (sesuai untuk EV bersamaan).

```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false
export WIN_CSC_LINK="https://trustedsigning.azurewebsites.net/..."   # endpoint anda
export WIN_CSC_KEY_PASSWORD="<client_secret>"
npm run dist:win
```

(Rujuk dokumentasi Microsoft *Trusted Signing* untuk butiran setup akaun.)

## Pilihan 3 — Sijil sendiri (self-signed, untuk kegunaan dalaman sahaja)

Sesuai untuk kegunaan dalam organisasi sendiri (pekerja masih perlu "Run anyway" sekali sahaja,
atau anda boleh pasang sijil root ke *Trusted Root Certification Authorities*).

**Windows (PowerShell, sebagai admin):**
```powershell
New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=NexOffice" `
  -CertStoreLocation Cert:\CurrentUser\My -KeyExportPolicy Exportable
# Eksport ke .pfx (sertakan kata laluan), kemudian tetapkan CSC_LINK / CSC_KEY_PASSWORD
```

**Atau tandatangan selepas bina (tanpa ubah electron-builder) menggunakan signtool (Windows SDK):**
```bat
signtool sign /fd SHA256 /f certificate.pfx /p PASSWORD ^
  /tr http://timestamp.digicert.com /td SHA256 ^
  dist\NexOffice-Setup-1.0.0.exe
```

---

## Mengesahkan tandatangan

```powershell
Get-AuthenticodeSignature dist\NexOffice-Setup-1.0.0.exe
# Status: Valid bermakna ditandatangani & kunci sah
```

Atau GUI: klik kanan `.exe` → Properties → tab *Digital Signatures*.

## Nota penting
- **Jangan dedahkan** `CSC_KEY_PASSWORD` dalam kod / git. Gunakan pemboleh ubah persekitaran.
- Tandatangan mesti menyertakan **timestamp** (`/tr ... /td SHA256`) supaya tidak luput selepas sijil tamat tempoh.
- Jika bina pada macOS untuk Windows, gunakan fail `.pfx` (bukan kunci keychain) bersama `CSC_LINK`.
- Versi aplikasi (`version` dalam `package.json`) — naikkan sebelum setiap keluaran supaya Windows Update / updater dapat membezakan versi.
