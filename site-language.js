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

  Object.assign(translations.ms, {
    "14 PROGRAMMES":"14 PROGRAM","10 PROGRAMMES":"10 PROGRAM","Preschool Mathematics Quiz":"Kuiz Matematik Prasekolah","100 interactive foundation mathematics questions":"100 soalan matematik asas interaktif","Preschool Interactive Cartoon":"Kartun Interaktif Prasekolah","Counting, colours and animals in Happy Learning Forest":"Mengira, warna dan haiwan di Hutan Pembelajaran Ceria","100 interactive curriculum-based mathematics questions":"100 soalan matematik interaktif berasaskan kurikulum","Solve six island challenges and collect the keys":"Selesaikan enam cabaran pulau dan kumpulkan kunci","Form 1 Math Detective Academy":"Akademi Detektif Matematik Tingkatan 1","Investigate cases using integers, ratios and algebra":"Siasat kes menggunakan integer, nisbah dan algebra","Form 2 Geometry Architect Challenge":"Cabaran Arkitek Geometri Tingkatan 2","Design structures using patterns, coordinates and geometry":"Reka struktur menggunakan pola, koordinat dan geometri","Form 3 Math Business Simulator":"Simulator Perniagaan Matematik Tingkatan 3","Run a virtual business using finance and statistics":"Urus perniagaan maya menggunakan kewangan dan statistik","Form 4 Math City Rescue Mission":"Misi Menyelamat Bandar Matematik Tingkatan 4","Restore a city using functions, graphs and probability":"Pulihkan bandar menggunakan fungsi, graf dan kebarangkalian","Form 5 SPM Mathematics Challenge Arena":"Arena Cabaran Matematik SPM Tingkatan 5","Complete six high-impact SPM mathematics challenges":"Selesaikan enam cabaran Matematik SPM berimpak tinggi"
  });
  Object.assign(translations.zh, {
    "14 PROGRAMMES":"14 个课程","10 PROGRAMMES":"10 个课程","Preschool Mathematics Quiz":"学前数学测验","100 interactive foundation mathematics questions":"100道互动基础数学题","Preschool Interactive Cartoon":"学前互动卡通","Counting, colours and animals in Happy Learning Forest":"在快乐学习森林中学习数数、颜色和动物","100 interactive curriculum-based mathematics questions":"100道基于课程的互动数学题","Solve six island challenges and collect the keys":"完成六项岛屿挑战并收集钥匙","Form 1 Math Detective Academy":"中一数学侦探学院","Investigate cases using integers, ratios and algebra":"运用整数、比率和代数调查案件","Form 2 Geometry Architect Challenge":"中二几何建筑师挑战","Design structures using patterns, coordinates and geometry":"运用规律、坐标和几何设计结构","Form 3 Math Business Simulator":"中三数学商业模拟器","Run a virtual business using finance and statistics":"运用金融和统计经营虚拟企业","Form 4 Math City Rescue Mission":"中四数学城市救援任务","Restore a city using functions, graphs and probability":"运用函数、图表和概率修复城市","Form 5 SPM Mathematics Challenge Arena":"中五 SPM 数学挑战竞技场","Complete six high-impact SPM mathematics challenges":"完成六项重点 SPM 数学挑战"
  });
  for (let year = 1; year <= 6; year += 1) {
    translations.ms[`Year ${year} Mathematics Quiz`] = `Kuiz Matematik Tahun ${year}`;
    translations.ms[`Year ${year} Mathematics Escape Room`] = `Bilik Meloloskan Diri Matematik Tahun ${year}`;
    const chineseYear = ["","一","二","三","四","五","六"][year];
    translations.zh[`Year ${year} Mathematics Quiz`] = `${chineseYear}年级数学测验`;
    translations.zh[`Year ${year} Mathematics Escape Room`] = `${chineseYear}年级数学密室逃脱`;
  }
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
