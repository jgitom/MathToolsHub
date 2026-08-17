# NexOffice — Pemasangan di Windows

NexOffice kini merupakan **Progressive Web App (PWA)** — boleh dipasang pada Windows sebagai
aplikasi desktop dengan ikon sendiri, berjalan dalam tetingkap sendiri, dan berfungsi
**sepenuhnya luar talian** selepas dipasang. Data disimpan dalam **IndexedDB** pada komputer anda.

---

## Pilihan 1 — Paling mudah: Host secara tempatan & pasang

1. Salin keseluruhan folder `NEXOFFICE` ke komputer Windows anda.
2. Buka folder tersebut, kemudian **klik dua kali** fail `serve.bat` (Windows).
   - Ini akan menjalankan pelayan kecil di `http://localhost:8000`.
3. Buka **Microsoft Edge** atau **Google Chrome**, pergi ke `http://localhost:8000`.
4. Klik butang **"Pasang Aplikasi"** di dalam NexOffice (halaman Laporan)
   **atau** gunakan menu pelayar:
   - **Edge:** menu `⋯` → *Apps* → *Install this site as an app* → nama "NexOffice" → *Install*
   - **Chrome:** ikon `+` di hujung bar alamat / menu `⋯` → *Install NexOffice...*
5. Selesai! Ikon NexOffice muncul di Desktop / Menu Mula. Ia berjalan dalam tetingkap sendiri
   dan berfungsi walaupun tanpa internet.

## Pilihan 2 — Host di pelayan web (untuk kegunaan beberapa komputer)

Muat naik folder `NEXOFFICE` ke mana-mana hosting HTTPS (GitHub Pages, Netlify, Vercel, dll).
Pengguna melawat URL, kemudian pasang seperti langkah 4 di atas.

> Nota: Pemasangan (butang Install) dan mod luar talian memerlukan protokol `http://`/`https://`
> (bukan `file://`). Jika anda hanya buka fail HTML terus, semua fungsi lain tetap berjalan seperti biasa.

---

## Sediakan sekali (untuk pembangun)

- **Ikon:** jalankan `node make-icons.js` untuk menjana semula ikon (tiada kebergantungan luar).
- **Muat semula cache service worker:** ikut proses biasa (buka DevTools → Application →
  Service Workers → Update), atau tunggu versi baharu automatik (cache `nexoffice-v1`).

## Struktur fail berkaitan PWA

```
NEXOFFICE/
├─ nexoffice_office_management_system.html   ← aplikasi utama
├─ manifest.json                             ← maklumat aplikasi untuk pemasangan
├─ sw.js                                     ← service worker (luar talian)
├─ icons/                                    ← ikon aplikasi (192, 512, maskable)
├─ make-icons.js                             ← penjana ikon
└─ serve.bat                                 ← pelancar pelayan tempatan (Windows)
```
