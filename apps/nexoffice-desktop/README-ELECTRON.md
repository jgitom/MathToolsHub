# NexOffice — Aplikasi Desktop (Electron .exe)

NexOffice kini turut disediakan sebagai **aplikasi desktop sebenar** menggunakan Electron —
dengan **pemasang Windows (.exe)** yang dibina menggunakan electron-builder (NSIS).
Berbeza daripada PWA, ini memberikan wizard pemasangan, ikon desktop, dan berjalan tanpa pelayar.

> Semua fungsi (staf, gaji, cuti, kehadiran, laporan) dan data dalam **IndexedDB** berfungsi
> seperti biasa. Data disimpan dalam folder data aplikasi, bukan pelayar.

---

## Cara membina pemasang Windows (.exe)

Prasyarat: **Node.js 18+** dan **npm** (https://nodejs.org). Boleh dibina pada **Windows**
atau **macOS** (electron-builder menyokong binaan silang-platform untuk NSIS).

```bash
# 1. Masuk ke folder projek
cd NEXOFFICE

# 2. Pasang kebergantungan (sekali sahaja)
npm install

# 3. Bina pemasang Windows (.exe)
npm run dist:win
```

Hasilnya dalam folder `dist/`:

```
dist/
└─ NexOffice-Setup-1.0.0.exe     ← pemasang Windows (klik dua kali untuk pasang)
```

> Untuk menguji tanpa memasang: `npm run start` (jalankan terus) atau
> `npm run dist:win:dir` (folder `dist/win-unpacked/NexOffice.exe`).

### Semasa pemasangan
- Pilih direktori pemasangan (boleh ditukar semasa wizard)
- Pintasan dibuat di Desktop dan Menu Mula
- Data aplikasi disimpan di `%APPDATA%\NexOffice` (IndexedDB + localStorage)

### Dwi-bahasa & pemilihan bahasa (language selector)
Pada kali pertama dijalankan, pemasang memaparkan dialog **pemilihan bahasa**. Bahasa disokong:
**Bahasa Melayu · English · Bahasa Indonesia · 简体中文 (Cina Ringkas) · Español · 日本語 ·
العربية (RTL) · 한국어**. Keseluruhan pemasang — halaman Welcome, License, pilihan pengguna
(install-mode), Install dan Finish — mengikut bahasa yang dipilih.

Di dalam aplikasi itu sendiri, bahasa boleh ditukar bila-bila masa melalui **Tetapan → Bahasa**
(8 bahasa disokong; Arabic akan bertukar ke susun atur kanan-ke-kiri / RTL secara automatik).

- Teks halaman khas (Welcome / Finish): `build/installer.nsh` (tukar teks ikut `$LANGUAGE`)
- Lesen dwi-bahasa: `build/license.txt`
- Terjemahan Bahasa Melayu, Indonesia & Arab untuk mesej standard electron-builder dan plugin NSIS
  **MultiUser** disuntik oleh **`nsis-ms-patch.js`** (dijalankan automatik melalui `postinstall`).

> **Penting:** selepas `npm install` (jika `node_modules` atau cache electron-builder dibuang),
> jalankan semula `node nsis-ms-patch.js` sebelum `npm run dist:win`, supaya pemasang bahasa
> Melayu/Indonesia/Arab tidak kembali kepada teks English pada halaman install-mode.

### Tandatangan digital (pilihan)
Pemasang asal tidak ditandatangani (SmartScreen akan memberi amaran). Untuk menghilangkan
amaran tersebut, ikuti panduan dalam **`README-SIGNING.md`**.

### Nyahpasang
- Gunakan *Add/Remove Programs* (Tetapan → Aplikasi) atau uninstaller dari Menu Mula.
- Pilihan: padam folder `%APPDATA%\NexOffice` jika mahu buang semua data.

---

## Binaan lain

| Perintah | Hasil |
|---|---|
| `npm run start` | Jalankan aplikasi dalam mod pembangunan |
| `npm run dist:win` | Pemasang Windows `.exe` (NSIS) |
| `npm run dist:win:dir` | Folder aplikasi Windows tanpa pemasang (portable) |
| `npm run dist:mac` | DMG untuk macOS |

## Struktur berkaitan Electron

```
NEXOFFICE/
├─ electron/
│  ├─ main.js        ← proses utama Electron (tetingkap & pemuatan aplikasi)
│  └─ preload.js     ← preload selamat (contextIsolation)
├─ electron-builder.yml  ← konfigurasi binaan (NSIS, ikon, metadata)
├─ package.json          ← skrip & kebergantungan Electron
├─ build/
│  ├─ icon.png           ← ikon tetingkap (256px)
│  └─ icon.ico           ← ikon pemasang Windows
└─ nexoffice_office_management_system.html  ← aplikasi utama (dimuatkan oleh Electron)
```
