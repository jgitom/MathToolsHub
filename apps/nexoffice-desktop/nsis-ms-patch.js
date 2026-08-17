// nsis-ms-patch.js — adds Malay (ms) translations to electron-builder's NSIS
// message templates so the Windows installer is fully localized when the user
// picks "Bahasa Melayu" in the language-selector dialog.
//
// electron-builder writes its own LangStrings from templates/nsis/messages.yml
// and assistedMessages.yml; if a language is missing it falls back to English.
// This script inserts an `ms:` entry into every message so electron-builder
// generates the Malay translations itself. It is idempotent and is run
// automatically via the "postinstall" npm script (re-run after `npm install`).
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const yaml = require('js-yaml');

const MS = {
  // assisted installer (install-mode page, uninstaller options, etc.)
  chooseInstallationOptions: 'Pilih Pilihan Pemasangan',
  chooseUninstallationOptions: 'Pilih Pilihan Nyahpasang',
  whichInstallationShouldBeRemoved: 'Pemasangan yang manakah ingin dibuang?',
  whoShouldThisApplicationBeInstalledFor: 'Aplikasi ini dipasang untuk siapa?',
  selectUserMode: 'Sila pilih sama ada aplikasi ini tersedia untuk semua pengguna atau hanya untuk anda',
  whichInstallationRemove: 'Perisian ini dipasang untuk semua pengguna dan juga pengguna semasa.\nPemasangan yang manakah ingin dibuang?',
  freshInstallForAll: 'Pemasangan baharu untuk semua pengguna (akan meminta kelayakan admin)',
  freshInstallForCurrent: 'Pemasangan baharu untuk pengguna semasa sahaja',
  onlyForMe: 'Hanya untuk &saya',
  forAll: 'Semua pengguna komputer ini (&semua)',
  loginWithAdminAccount: 'Anda perlu log masuk dengan akaun ahli kumpulan admin untuk meneruskan...',
  perUserInstallExists: 'Terdapat pemasangan untuk pengguna semasa.',
  perUserInstall: 'Pemasangan untuk pengguna semasa.',
  perMachineInstallExists: 'Terdapat pemasangan untuk semua pengguna.',
  perMachineInstall: 'Pemasangan untuk semua pengguna.',
  reinstallUpgrade: 'Akan dipasang semula / dinaik taraf.',
  uninstall: 'Akan dinyahpasang.',
  // one-click installer
  win7Required: 'Windows 7 dan ke atas diperlukan',
  x64WinRequired: 'Windows 64-bit diperlukan',
  appRunning: '${PRODUCT_NAME} sedang berjalan. / Klik OK untuk menutupnya. / Jika tidak tertutup, cuba tutup secara manual.',
  appCannotBeClosed: '${PRODUCT_NAME} tidak dapat ditutup. / Sila tutup secara manual dan klik Retry untuk meneruskan.',
  installing: 'Memasang, sila tunggu...',
  areYouSureToUninstall: 'Adakah anda pasti ingin menyahpasang ${PRODUCT_NAME}?',
  decompressionFailed: 'Gagal membuka fail. Sila cuba jalankan pemasang sekali lagi.',
  uninstallFailed: 'Gagal menyahpasang fail aplikasi lama. Sila cuba jalankan pemasang sekali lagi.'
};

// Indonesian (id) — Chinese (zh_CN) is already provided by electron-builder.
const ID = {
  chooseInstallationOptions: 'Pilih Pilihan Pemasangan',
  chooseUninstallationOptions: 'Pilih Pilihan Pencopotan',
  whichInstallationShouldBeRemoved: 'Pemasangan mana yang ingin dihapus?',
  whoShouldThisApplicationBeInstalledFor: 'Aplikasi ini dipasang untuk siapa?',
  selectUserMode: 'Silakan pilih apakah perangkat lunak ini tersedia untuk semua pengguna atau hanya untuk Anda',
  whichInstallationRemove: 'Perangkat lunak ini dipasang untuk semua pengguna dan juga pengguna saat ini.\nPemasangan mana yang ingin dihapus?',
  freshInstallForAll: 'Pemasangan baru untuk semua pengguna (akan meminta kredensial admin)',
  freshInstallForCurrent: 'Pemasangan baru hanya untuk pengguna saat ini',
  onlyForMe: 'Hanya untuk &saya',
  forAll: 'Semua pengguna komputer ini (&semua)',
  loginWithAdminAccount: 'Anda perlu masuk dengan akun anggota grup admin untuk melanjutkan...',
  perUserInstallExists: 'Sudah ada pemasangan untuk pengguna saat ini.',
  perUserInstall: 'Pemasangan untuk pengguna saat ini.',
  perMachineInstallExists: 'Sudah ada pemasangan untuk semua pengguna.',
  perMachineInstall: 'Pemasangan untuk semua pengguna.',
  reinstallUpgrade: 'Akan dipasang ulang / ditingkatkan.',
  uninstall: 'Akan dicopot.',
  win7Required: 'Windows 7 ke atas diperlukan',
  x64WinRequired: 'Windows 64-bit diperlukan',
  appRunning: '${PRODUCT_NAME} sedang berjalan. / Klik OK untuk menutupnya. / Jika tidak tertutup, tutup secara manual.',
  appCannotBeClosed: '${PRODUCT_NAME} tidak dapat ditutup. / Silakan tutup secara manual dan klik Retry untuk melanjutkan.',
  installing: 'Memasang, harap tunggu...',
  areYouSureToUninstall: 'Apakah Anda yakin ingin mencopot ${PRODUCT_NAME}?',
  decompressionFailed: 'Gagal membuka file. Silakan coba jalankan pemasang lagi.',
  uninstallFailed: 'Gagal mencopot file aplikasi lama. Silakan coba jalankan pemasang lagi.'
};

// Arabic (ar) — Spanish (es), Japanese (ja) and Korean (ko) are already
// provided by electron-builder; Arabic is missing, so it is injected here.
const AR = {
  chooseInstallationOptions: 'اختيار خيارات التثبيت',
  chooseUninstallationOptions: 'اختيار خيارات إلغاء التثبيت',
  whichInstallationShouldBeRemoved: 'أي تثبيت تريد إزالته؟',
  whoShouldThisApplicationBeInstalledFor: 'لمن يجب تثبيت هذا التطبيق؟',
  selectUserMode: 'يرجى اختيار ما إذا كان هذا التطبيق متاحًا لجميع المستخدمين أم لك فقط',
  whichInstallationRemove: 'هذا التطبيق مثبت لجميع المستخدمين وللمستخدم الحالي أيضًا.\nأي تثبيت تريد إزالته؟',
  freshInstallForAll: 'تثبيت جديد لجميع المستخدمين (سيطلب بيانات اعتماد المدير)',
  freshInstallForCurrent: 'تثبيت جديد للمستخدم الحالي فقط',
  onlyForMe: 'لي فقط',
  forAll: 'أي شخص يستخدم هذا الكمبيوتر',
  loginWithAdminAccount: 'تحتاج إلى تسجيل الدخول بحساب عضو في مجموعة المديرين للمتابعة...',
  perUserInstallExists: 'يوجد بالفعل تثبيت للمستخدم الحالي.',
  perUserInstall: 'تثبيت للمستخدم الحالي.',
  perMachineInstallExists: 'يوجد بالفعل تثبيت لجميع المستخدمين.',
  perMachineInstall: 'تثبيت لجميع المستخدمين.',
  reinstallUpgrade: 'سيتم إعادة التثبيت / الترقية.',
  uninstall: 'سيتم إلغاء التثبيت.',
  win7Required: 'مطلوب Windows 7 أو أحدث',
  x64WinRequired: 'مطلوب إصدار 64-بت من Windows',
  appRunning: '${PRODUCT_NAME} قيد التشغيل. / انقر فوق موافق لإغلاقه. / إذا لم يُغلق، فحاول إغلاقه يدويًا.',
  appCannotBeClosed: 'تعذر إغلاق ${PRODUCT_NAME}. / يرجى إغلاقه يدويًا ثم النقر فوق إعادة المحاولة للمتابعة.',
  installing: 'جارٍ التثبيت، يرجى الانتظار...',
  areYouSureToUninstall: 'هل أنت متأكد من رغبتك في إلغاء تثبيت ${PRODUCT_NAME}؟',
  decompressionFailed: 'فشل فك ضغط الملفات. يرجى محاولة تشغيل المثبت مرة أخرى.',
  uninstallFailed: 'فشل إلغاء تثبيت ملفات التطبيق القديمة. يرجى محاولة تشغيل المثبت مرة أخرى.'
};

function patch(file) {
  const data = yaml.load(fs.readFileSync(file, 'utf8'));
  let changed = false;
  for (const msgId of Object.keys(data)) {
    const hasMs = MS[msgId] != null;
    const hasId = ID[msgId] != null;
    const hasAr = AR[msgId] != null;
    if (!hasMs && !hasId && !hasAr) continue;
    const cur = data[msgId];
    if (cur && cur.ms !== undefined && cur.id !== undefined && cur.ar !== undefined) continue; // already patched
    const out = {};
    for (const k of Object.keys(cur)) {
      out[k] = cur[k];
      if (k === 'en') { // keep 'en' first, insert translations right after
        if (hasMs) out.ms = MS[msgId];
        if (hasId) out.id = ID[msgId];
        if (hasAr) out.ar = AR[msgId];
      }
    }
    if (out.ms === undefined && hasMs) out.ms = MS[msgId];
    if (out.id === undefined && hasId) out.id = ID[msgId];
    if (out.ar === undefined && hasAr) out.ar = AR[msgId];
    data[msgId] = out;
    changed = true;
  }
  if (changed) fs.writeFileSync(file, yaml.dump(data, { lineWidth: -1 }));
  return changed;
}

// Add the MultiUser plugin's install-mode strings to NSIS's Malay.nsh language
// file. NSIS warns (which electron-builder turns into an error) whenever
// English.nsh defines a string missing from the active language file, so these
// are appended unconditionally to Malay.nsh to avoid the English fallback.
const MULTIUSER_MS = [
  '  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "Pilih Pengguna"',
  '  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "Pilih untuk pengguna yang mana anda ingin memasang $(^NameDA)."',
  '  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "Pilih sama ada anda ingin memasang $(^NameDA) untuk anda sahaja atau untuk semua pengguna komputer ini. $(^ClickNext)"',
  '  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "Pasang untuk sesiapa yang menggunakan komputer ini"',
  '  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "Pasang hanya untuk saya"'
].join('\n');

function patchMalayNsh() {
  const roots = [];
  const add = p => { if (p) roots.push(p); };
  // Windows: %LOCALAPPDATA%\electron-builder\Cache\nsis
  add(process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'electron-builder', 'Cache', 'nsis') : null);
  add(process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'electron-builder', 'Cache') : null);
  // macOS: ~/Library/Caches/electron-builder/nsis
  add(path.join(os.homedir(), 'Library', 'Caches', 'electron-builder', 'nsis'));
  add(path.join(os.homedir(), 'Library', 'Caches', 'electron-builder'));
  for (const root of roots) {
    let nsisDir = null;
    try {
      const sub = fs.readdirSync(root);
      const d = sub.find(x => x.startsWith('nsis-'));
      if (d) nsisDir = path.join(root, d);
    } catch (e) { continue; }
    if (!nsisDir) continue;
    const malay = path.join(nsisDir, 'Contrib', 'Language files', 'Malay.nsh');
    if (!fs.existsSync(malay)) continue;
    let txt = fs.readFileSync(malay, 'utf8');
    if (txt.includes('MULTIUSER_TEXT_INSTALLMODE_TITLE')) return false; // already patched
    txt = txt.trimEnd() + '\n\n' + MULTIUSER_MS + '\n';
    fs.writeFileSync(malay, txt);
    return true;
  }
  console.log('WARN: could not locate NSIS Malay.nsh (electron-builder cache). Install-mode page may fall back to English in Malay.');
  return false;
}

// ---- run ----
const base = path.join(__dirname, 'node_modules', 'app-builder-lib', 'templates', 'nsis');
let any = false;
for (const f of ['messages.yml', 'assistedMessages.yml']) {
  any = patch(path.join(base, f)) || any;
}
any = patchMalayNsh() || any;
console.log(any
  ? 'NSIS Malay (ms) + Indonesian (id) + Arabic (ar) translations applied to electron-builder templates + NSIS Malay.nsh.'
  : 'NSIS Malay/Indonesian/Arabic translations already present — no change.');
