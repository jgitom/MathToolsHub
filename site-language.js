(() => {
  "use strict";
  if (document.getElementById("languageSelect")) return;

  const STORAGE_KEY = "mathToolsHubLanguage";
  const translations = {
    ms: {
      "Return to home":"Kembali ke laman utama","Learning catalogue":"Katalog pembelajaran","Mathematics programmes":"Program matematik","Select a learning level to access its interactive mathematics quizzes and course materials.":"Pilih tahap pembelajaran untuk mengakses kuiz matematik interaktif dan bahan kursus.","Primary education":"Pendidikan rendah","Secondary education":"Pendidikan menengah","Foundation and primary mathematics quizzes":"Kuiz matematik asas dan sekolah rendah","Secondary mathematics course materials":"Bahan kursus matematik sekolah menengah","Preschool":"Pra Sekolah","Year 1":"Tahun 1","Year 2":"Tahun 2","Year 3":"Tahun 3","Year 4":"Tahun 4","Year 5":"Tahun 5","Year 6":"Tahun 6","Form 1":"Tingkatan 1","Form 2":"Tingkatan 2","Form 3":"Tingkatan 3","Form 4":"Tingkatan 4","Form 5":"Tingkatan 5","Primary programme":"Program sekolah rendah","Secondary programme":"Program sekolah menengah","The MathToolsHub ebook":"E-buku MathToolsHub","Mathematics Made Simple":"Matematik Dipermudah","Get the ebook":"Dapatkan e-buku","View contents":"Lihat kandungan","Start learning today":"Mulakan pembelajaran hari ini","Buy the ebook":"Beli e-buku","Return to home":"Kembali ke laman utama","How to play":"Cara bermain","Show Hint":"Tunjukkan Petunjuk","Shuffle":"Kocok","Restart Level":"Mulakan Semula Tahap","Sound On":"Suara Aktif","Home":"Utama","Select two adjacent tiles.":"Pilih dua jubin bersebelahan.","Start using NotebookLM ↗":"Mula Mengguna NotebookLM ↗"},
    zh: {
      "Return to home":"返回主页","Learning catalogue":"学习目录","Mathematics programmes":"数学课程","Select a learning level to access its interactive mathematics quizzes and course materials.":"选择学习阶段以访问互动数学测验和课程材料。","Primary education":"小学教育","Secondary education":"中学教育","Foundation and primary mathematics quizzes":"基础与小学数学测验","Secondary mathematics course materials":"中学数学课程材料","Preschool":"学前班","Year 1":"一年级","Year 2":"二年级","Year 3":"三年级","Year 4":"四年级","Year 5":"五年级","Year 6":"六年级","Form 1":"初中一年级","Form 2":"初中二年级","Form 3":"初中三年级","Form 4":"初中四年级","Form 5":"初中五年级","Primary programme":"小学课程","Secondary programme":"中学课程","The MathToolsHub ebook":"MathToolsHub 电子书","Mathematics Made Simple":"轻松学数学","Get the ebook":"获取电子书","View contents":"查看内容","Start learning today":"今天开始学习","Buy the ebook":"购买电子书","How to play":"游戏方法","Show Hint":"显示提示","Shuffle":"重新排列","Restart Level":"重新开始本级","Sound On":"开启声音","Home":"主页","Select two adjacent tiles.":"选择两个相邻的方块。","Start using NotebookLM ↗":"开始使用 NotebookLM ↗"}
  };

  Object.assign(translations.ms, {
    "14 PROGRAMMES":"14 PROGRAM","10 PROGRAMMES":"10 PROGRAM","Preschool Mathematics Quiz":"Kuiz Matematik Prasekolah","100 interactive foundation mathematics questions":"100 soalan matematik asas interaktif","Preschool Interactive Cartoon":"Kartun Interaktif Prasekolah","Counting, colours and animals in Happy Learning Forest":"Mengira, warna dan haiwan di Hutan Pembelajaran Ceria","100 interactive curriculum-based mathematics questions":"100 soalan matematik interaktif berasaskan kurikulum","Solve six island challenges and collect the keys":"Selesaikan enam cabaran pulau dan kumpulkan kunci","Form 1 Math Detective Academy":"Akademi Detektif Matematik Tingkatan 1","Investigate cases using integers, ratios and algebra":"Siasat kes menggunakan integer, nisbah dan algebra","Form 2 Geometry Architect Challenge":"Cabaran Arkitek Geometri Tingkatan 2","Design structures using patterns, coordinates and geometry":"Reka struktur menggunakan pola, koordinat dan geometri","Form 3 Math Business Simulator":"Simulator Perniagaan Matematik Tingkatan 3","Run a virtual business using finance and statistics":"Urus perniagaan maya menggunakan kewangan dan statistik","Form 4 Math City Rescue Mission":"Misi Menyelamat Bandar Matematik Tingkatan 4","Restore a city using functions, graphs and probability":"Pulihkan bandar menggunakan fungsi, graf dan kebarangkalian","Form 5 SPM Mathematics Challenge Arena":"Arena Cabaran Matematik SPM Tingkatan 5","Complete six high-impact SPM mathematics challenges":"Selesaikan enam cabaran Matematik SPM berimpak tinggi"
  });
  Object.assign(translations.zh, {
    "14 PROGRAMMES":"14 个课程","10 PROGRAMMES":"10 个课程","Preschool Mathematics Quiz":"学前数学测验","100 interactive foundation mathematics questions":"100道互动基础数学题","Preschool Interactive Cartoon":"学前互动卡通","Counting, colours and animals in Happy Learning Forest":"在快乐学习森林中学习数数、颜色和动物","100 interactive curriculum-based mathematics questions":"100道基于课程的互动数学题","Solve six island challenges and collect the keys":"完成六项岛屿挑战并收集钥匙","Form 1 Math Detective Academy":"中一数学侦探学院","Investigate cases using integers, ratios and algebra":"运用整数、比率和代数调查案件","Form 2 Geometry Architect Challenge":"中二几何建筑师挑战","Design structures using patterns, coordinates and geometry":"运用规律、坐标和几何设计结构","Form 3 Math Business Simulator":"中三数学商业模拟器","Run a virtual business using finance and statistics":"运用金融和统计经营虚拟企业","Form 4 Math City Rescue Mission":"中四数学城市救援任务","Restore a city using functions, graphs and probability":"运用函数、图表和概率修复城市","Form 5 SPM Mathematics Challenge Arena":"中五 SPM 数学挑战竞技场","Complete six high-impact SPM mathematics challenges":"完成六项重点 SPM 数学挑战"
  });
  Object.assign(translations.ms, {
    "Learn through play":"Belajar melalui permainan","Mathematics Games":"Permainan Matematik","Choose a game, practise essential mathematics skills, and challenge yourself through interactive play.":"Pilih permainan, latih kemahiran matematik penting dan cabar diri melalui permainan interaktif.","Choose your game":"Pilih permainan anda","Each game turns mathematics practice into a different kind of challenge.":"Setiap permainan mengubah latihan matematik menjadi cabaran yang berbeza.","Match mathematical expressions with equal answers to build speed, accuracy, and number sense.":"Padankan ungkapan matematik yang mempunyai jawapan sama untuk meningkatkan kepantasan, ketepatan dan deria nombor.","Play CJMath EquaGems":"Main CJMath EquaGems","Math Kingdom Defender":"Pertahanan Kerajaan Matematik","Solve equations, power your towers, earn upgrades, and protect the kingdom from approaching enemies.":"Selesaikan persamaan, kuasakan menara, dapatkan peningkatan dan lindungi kerajaan daripada musuh.","Play Math Kingdom Defender":"Main Pertahanan Kerajaan Matematik","Crypt of Equation":"Makam Persamaan","Build a hero, explore mathematical realms, and defeat monsters and bosses by solving equations.":"Bina wira, terokai alam matematik dan kalahkan raksasa serta ketua dengan menyelesaikan persamaan.","Play Crypt of Equation":"Main Makam Persamaan","Chess":"Catur","Plan your moves, develop strategic thinking, and challenge an opponent in a classic game of chess.":"Rancang langkah, kembangkan pemikiran strategik dan cabar lawan dalam permainan catur klasik.","Play Chess":"Main Catur","Enter the Escape Room":"Masuk ke Bilik Meloloskan Diri","Puzzle":"Teka-teki","Mental maths":"Matematik mental","Speed":"Kepantasan","Strategy":"Strategi","Operations":"Operasi","Defence":"Pertahanan","RPG":"RPG","Equations":"Persamaan","Adventure":"Pengembaraan","Logic":"Logik","Board game":"Permainan papan","Problem solving":"Penyelesaian masalah","Early maths":"Matematik awal","Advanced maths":"Matematik lanjutan","Explore a friendly island, solve Year 1 mathematics puzzles, collect keys, and escape before time runs out.":"Terokai pulau mesra, selesaikan teka-teki Matematik Tahun 1, kumpulkan kunci dan meloloskan diri sebelum masa tamat.","Explore a mysterious island, solve Year 6 mathematics puzzles, collect keys, and complete the final escape.":"Terokai pulau misteri, selesaikan teka-teki Matematik Tahun 6, kumpulkan kunci dan lengkapkan pelolosan terakhir."
  });
  Object.assign(translations.zh, {
    "Learn through play":"寓学于乐","Mathematics Games":"数学游戏","Choose a game, practise essential mathematics skills, and challenge yourself through interactive play.":"选择游戏，练习重要数学技能，并通过互动游戏挑战自己。","Choose your game":"选择你的游戏","Each game turns mathematics practice into a different kind of challenge.":"每个游戏都将数学练习转化为不同的挑战。","Match mathematical expressions with equal answers to build speed, accuracy, and number sense.":"配对答案相同的数学表达式，提高速度、准确度和数感。","Play CJMath EquaGems":"玩 CJMath EquaGems","Math Kingdom Defender":"数学王国保卫战","Solve equations, power your towers, earn upgrades, and protect the kingdom from approaching enemies.":"解方程、为防御塔充能、获得升级并保护王国免受敌人进攻。","Play Math Kingdom Defender":"玩数学王国保卫战","Crypt of Equation":"方程地穴","Build a hero, explore mathematical realms, and defeat monsters and bosses by solving equations.":"培养英雄，探索数学领域，通过解方程击败怪物和首领。","Play Crypt of Equation":"玩方程地穴","Chess":"国际象棋","Plan your moves, develop strategic thinking, and challenge an opponent in a classic game of chess.":"规划棋步、培养策略思维，并在经典国际象棋游戏中挑战对手。","Play Chess":"玩国际象棋","Enter the Escape Room":"进入密室逃脱","Puzzle":"益智","Mental maths":"心算","Speed":"速度","Strategy":"策略","Operations":"运算","Defence":"防御","RPG":"角色扮演","Equations":"方程","Adventure":"冒险","Logic":"逻辑","Board game":"棋盘游戏","Problem solving":"问题解决","Early maths":"启蒙数学","Advanced maths":"进阶数学","Explore a friendly island, solve Year 1 mathematics puzzles, collect keys, and escape before time runs out.":"探索友好的岛屿，解决一年级数学谜题，收集钥匙并在时间结束前逃脱。","Explore a mysterious island, solve Year 6 mathematics puzzles, collect keys, and complete the final escape.":"探索神秘岛屿，解决六年级数学谜题，收集钥匙并完成最终逃脱。"
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

  Object.assign(translations.ms, {
    "Useful utilities":"Utiliti berguna","MathToolsHub Tools":"Alatan MathToolsHub","Simple browser-based utilities designed to support teaching, learning, and document workflows.":"Utiliti berasaskan pelayar yang ringkas untuk menyokong pengajaran, pembelajaran dan aliran kerja dokumen.","Choose a tool":"Pilih alatan","Files are processed in your browser whenever possible.":"Fail diproses dalam pelayar anda apabila boleh.","CJ PDF to Word Converter":"Penukar PDF ke Word CJ","Extract readable text from a PDF and download it as an editable Microsoft Word document.":"Ekstrak teks yang boleh dibaca daripada PDF dan muat turun sebagai dokumen Microsoft Word yang boleh disunting.","Browser processing":"Pemprosesan pelayar","Open converter":"Buka penukar","CJ Quiz Prompt Builder":"Pembina Prom Kuiz CJ","Configure a quiz by subject, level, topic, format, and difficulty, then copy a complete prompt for your preferred AI assistant.":"Tetapkan kuiz mengikut subjek, tahap, topik, format dan kesukaran, kemudian salin prom lengkap untuk pembantu AI pilihan anda.","Quiz":"Kuiz","Prompt":"Prom","Teacher utility":"Utiliti guru","Open prompt builder":"Buka pembina prom","CJ AI Image Creator":"Pencipta Imej AI CJ","Build detailed image prompts, add an optional reference image, and preview the image-generation workflow in demo mode.":"Bina prom imej terperinci, tambah imej rujukan pilihan dan pratonton aliran kerja penjanaan imej dalam mod demo.","Images":"Imej","AI workflow":"Aliran kerja AI","Demo mode":"Mod demo","Open image creator":"Buka pencipta imej"
  });
  Object.assign(translations.zh, {
    "Useful utilities":"实用工具","MathToolsHub Tools":"MathToolsHub 工具","Simple browser-based utilities designed to support teaching, learning, and document workflows.":"简单的浏览器工具，用于支持教学、学习和文档工作流程。","Choose a tool":"选择工具","Files are processed in your browser whenever possible.":"文件会尽可能在您的浏览器中处理。","CJ PDF to Word Converter":"CJ PDF 转 Word 转换器","Extract readable text from a PDF and download it as an editable Microsoft Word document.":"从 PDF 提取可读文本，并下载为可编辑的 Microsoft Word 文档。","Browser processing":"浏览器处理","Open converter":"打开转换器","CJ Quiz Prompt Builder":"CJ 测验提示词生成器","Configure a quiz by subject, level, topic, format, and difficulty, then copy a complete prompt for your preferred AI assistant.":"按科目、级别、主题、格式和难度设置测验，然后复制完整提示词供您选择的 AI 助手使用。","Quiz":"测验","Prompt":"提示词","Teacher utility":"教师工具","Open prompt builder":"打开提示词生成器","CJ AI Image Creator":"CJ AI 图像创作器","Build detailed image prompts, add an optional reference image, and preview the image-generation workflow in demo mode.":"创建详细的图像提示词，添加可选参考图像，并在演示模式中预览图像生成流程。","Images":"图像","AI workflow":"AI 工作流程","Demo mode":"演示模式","Open image creator":"打开图像创作器"
  });
  function translateDynamicCatalogueName(source, language) {
    if (language === "ms") {
      source = source.replace(/Explore a mysterious island, solve Year ([2-5]) mathematics puzzles, collect keys, and escape before time runs out\./g, "Terokai pulau misteri, selesaikan teka-teki Matematik Tahun $1, kumpulkan kunci dan meloloskan diri sebelum masa tamat.");
      return source
        .replace(/\bYear ([1-6])\b/g, "Tahun $1")
        .replace(/\bForm ([1-5])\b/g, "Tingkatan $1");
    }
    if (language === "zh") {
      source = source.replace(/Explore a mysterious island, solve Year ([2-5]) mathematics puzzles, collect keys, and escape before time runs out\./g, (_, number) => `探索神秘岛屿，解决${["","一","二","三","四","五"][number]}年级数学谜题，收集钥匙并在时间结束前逃脱。`);
      const numbers = { "1":"一", "2":"二", "3":"三", "4":"四", "5":"五", "6":"六" };
      return source
        .replace(/\bYear ([1-6])\b/g, (_, number) => `${numbers[number]}年级`)
        .replace(/\bForm ([1-5])\b/g, (_, number) => `中${numbers[number]}`);
    }
    return source;
  }
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
      const translated=language === "en" ? clean : translations[language]?.[clean] || translateDynamicCatalogueName(clean, language);
      node.nodeValue=source.replace(clean,translated);
    });
    selector.value=language;
    localStorage.setItem(STORAGE_KEY,language);
  }
  selector.addEventListener("change",event=>apply(event.target.value));
  apply(localStorage.getItem(STORAGE_KEY) || "en");
})();
