(() => {
  "use strict";
  if (document.getElementById("languageSelect")) return;

  const STORAGE_KEY = "mathToolsHubLanguage";
  const translations = {
    ms: {
      "Return to home":"Kembali ke laman utama","Learning catalogue":"Katalog pembelajaran","Mathematics programmes":"Program matematik","Select a learning level to access its interactive mathematics quizzes and course materials.":"Pilih tahap pembelajaran untuk mengakses kuiz matematik interaktif dan bahan kursus.","Primary education":"Pendidikan rendah","Secondary education":"Pendidikan menengah","Foundation and primary mathematics quizzes":"Kuiz matematik asas dan sekolah rendah","Secondary mathematics course materials":"Bahan kursus matematik sekolah menengah","Preschool":"Pra Sekolah","Year 1":"Tahun 1","Year 2":"Tahun 2","Year 3":"Tahun 3","Year 4":"Tahun 4","Year 5":"Tahun 5","Year 6":"Tahun 6","Form 1":"Tingkatan 1","Form 2":"Tingkatan 2","Form 3":"Tingkatan 3","Form 4":"Tingkatan 4","Form 5":"Tingkatan 5","Primary programme":"Program sekolah rendah","Secondary programme":"Program sekolah menengah","The MathToolsHub ebook":"E-buku MathToolsHub","Mathematics Made Simple":"Matematik Dipermudah","Get the ebook":"Dapatkan e-buku","View contents":"Lihat kandungan","Start learning today":"Mulakan pembelajaran hari ini","Buy the ebook":"Beli e-buku","Return to home":"Kembali ke laman utama","How to play":"Cara bermain","Show Hint":"Tunjukkan Petunjuk","Shuffle":"Kocok","Restart Level":"Mulakan Semula Tahap","Sound On":"Suara Aktif","Home":"Utama","Select two adjacent tiles.":"Pilih dua jubin bersebelahan."},
    zh: {
      "Return to home":"返回主页","Learning catalogue":"学习目录","Mathematics programmes":"数学课程","Select a learning level to access its interactive mathematics quizzes and course materials.":"选择学习阶段以访问互动数学测验和课程材料。","Primary education":"小学教育","Secondary education":"中学教育","Foundation and primary mathematics quizzes":"基础与小学数学测验","Secondary mathematics course materials":"中学数学课程材料","Preschool":"学前班","Year 1":"一年级","Year 2":"二年级","Year 3":"三年级","Year 4":"四年级","Year 5":"五年级","Year 6":"六年级","Form 1":"初中一年级","Form 2":"初中二年级","Form 3":"初中三年级","Form 4":"初中四年级","Form 5":"初中五年级","Primary programme":"小学课程","Secondary programme":"中学课程","The MathToolsHub ebook":"MathToolsHub 电子书","Mathematics Made Simple":"轻松学数学","Get the ebook":"获取电子书","View contents":"查看内容","Start learning today":"今天开始学习","Buy the ebook":"购买电子书","How to play":"游戏方法","Show Hint":"显示提示","Shuffle":"重新排列","Restart Level":"重新开始本级","Sound On":"开启声音","Home":"主页","Select two adjacent tiles.":"选择两个相邻的方块。"}
  };

  const style = document.createElement("style");
  style.textContent = ".site-language-picker{position:fixed;top:14px;right:14px;z-index:1000;min-height:38px;padding:0 30px 0 11px;border:1px solid #94a3b8;border-radius:8px;color:#172033;background:#fff;box-shadow:0 8px 22px #0f172a26;font:700 .78rem 'Segoe UI',Arial,sans-serif;cursor:pointer}.site-language-slot .site-language-picker{position:static;box-shadow:none}.site-language-picker:focus{outline:3px solid #93c5fd;outline-offset:2px}@media(max-width:560px){.site-language-picker{top:auto;right:12px;bottom:12px}.site-language-slot .site-language-picker{max-width:130px}}";
  document.head.appendChild(style);

  const selector = document.createElement("select");
  selector.id = "languageSelect";
  selector.className = "site-language-picker";
  selector.setAttribute("aria-label", "Select language");
  selector.innerHTML = '<option value="en">English</option><option value="ms">Bahasa Melayu</option><option value="zh">中文（普通话）</option>';
  (document.getElementById("siteLanguageSlot") || document.body).appendChild(selector);

  const originals = new WeakMap();
  function apply(language) {
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.parentElement?.closest("script,style,select")) return NodeFilter.FILTER_REJECT;
        return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (!originals.has(node)) originals.set(node,node.nodeValue);
      const source=originals.get(node), clean=source.trim();
      const translated=language === "en" ? clean : translations[language]?.[clean] || clean;
      node.nodeValue=source.replace(clean,translated);
    });
    selector.value=language;
    localStorage.setItem(STORAGE_KEY,language);
  }
  selector.addEventListener("change",event=>apply(event.target.value));
  apply(localStorage.getItem(STORAGE_KEY) || "en");
})();
