(() => {
  "use strict";

  const STORAGE_KEY = "mathToolsHubLanguage";
  const languages = {
    en: {
      back:"← Back", home:"🏠 Home", soundOn:"🔊 Sound", soundOff:"🔇 Muted", reset:"↺ Reset",
      start:"🚀 Choose Level", read:"🔊 Read question", levels:"← Choose Level", next:"Next Question →",
      results:"View Results →", retry:"Try Again", nextLevel:"Next Level", allLevels:"All Levels",
      print:"Print Results", name:"Enter student name", select:"Interface language"
    },
    ms: {
      back:"← Kembali", home:"🏠 Utama", soundOn:"🔊 Suara", soundOff:"🔇 Senyap", reset:"↺ Set Semula",
      start:"🚀 Pilih Tahap", read:"🔊 Baca soalan", levels:"← Pilih Tahap", next:"Soalan Seterusnya →",
      results:"Lihat Keputusan →", retry:"Cuba Lagi", nextLevel:"Tahap Seterusnya", allLevels:"Semua Tahap",
      print:"Cetak Keputusan", name:"Masukkan nama murid", select:"Bahasa antara muka"
    },
    zh: {
      back:"← 返回", home:"🏠 主页", soundOn:"🔊 声音", soundOff:"🔇 静音", reset:"↺ 重置",
      start:"🚀 选择级别", read:"🔊 朗读题目", levels:"← 选择级别", next:"下一题 →",
      results:"查看成绩 →", retry:"再试一次", nextLevel:"下一级", allLevels:"所有级别",
      print:"打印成绩", name:"输入学生姓名", select:"界面语言"
    }
  };

  function normalise(value) {
    if (String(value).startsWith("ms")) return "ms";
    if (String(value).startsWith("zh")) return "zh";
    return "en";
  }

  let selector = document.getElementById("languageSelect");
  if (!selector) {
    selector = document.createElement("select");
    selector.id = "languageSelect";
    selector.className = document.querySelector(".mini-btn") ? "mini-btn" : "mini";
    document.querySelector(".actions")?.prepend(selector);
  }

  selector.innerHTML = `
    <option value="en-MY">English</option>
    <option value="ms-MY">Bahasa Melayu</option>
    <option value="zh-CN">中文（普通话）</option>`;

  function setText(id, key, language) {
    const element = document.getElementById(id);
    if (element) element.textContent = languages[language][key];
  }

  function applyInterface(languageValue) {
    const language = normalise(languageValue);
    const t = languages[language];
    document.documentElement.lang = language === "zh" ? "zh-CN" : language;
    selector.value = language === "en" ? "en-MY" : language === "ms" ? "ms-MY" : "zh-CN";
    selector.setAttribute("aria-label", t.select);
    localStorage.setItem(STORAGE_KEY, language);

    const back = document.getElementById("backBtn") || document.querySelector("button[onclick*=\"quizzes.html\"]");
    if (back) back.textContent = t.back;
    setText("homeBtn", "home", language);
    setText("resetBtn", "reset", language);
    setText("startBtn", "start", language);
    setText("readBtn", "read", language);
    setText("backLevelsBtn", "levels", language);
    setText("allLevelsBtn", "allLevels", language);
    setText("retryBtn", "retry", language);
    setText("nextLevelBtn", "nextLevel", language);
    setText("printBtn", "print", language);

    const sound = document.getElementById("soundBtn");
    if (sound) sound.textContent = /senyap|muted|off|静音/i.test(sound.textContent) ? t.soundOff : t.soundOn;
    const next = document.getElementById("nextBtn");
    if (next) next.textContent = /keputusan|result|成绩/i.test(next.textContent) ? t.results : t.next;
    const name = document.getElementById("studentName");
    if (name) name.placeholder = t.name;
    document.dispatchEvent(new CustomEvent("quizLanguageChanged", { detail: { language } }));
  }

  const contentSelectors = [
    "#questionVisual", "#questionText", "#options", "#feedback", "#levelLabel",
    "#questionCounter", "#scoreBadge", "#welcomeText", "#overallText",
    "#resultTitle", "#resultMessage", "#reviewList", ".level-card h3",
    ".level-card p", ".best"
  ].join(",");

  function translateTree(root, language) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const source = node.nodeValue;
      if (source.trim()) node.nodeValue = window.getQuizTranslation?.(source, language) || source;
    });
  }

  function translateQuizContent() {
    const language = selector.value;
    document.querySelectorAll(contentSelectors).forEach(element => {
      const current = element.innerHTML;
      const previousRendered = element.dataset.i18nRendered;
      if (!element.dataset.i18nSource || (previousRendered && current !== previousRendered)) {
        element.dataset.i18nSource = current;
      }
      const preview = element.cloneNode(false);
      preview.innerHTML = element.dataset.i18nSource;
      translateTree(preview, language);
      const rendered = preview.innerHTML;
      if (element.innerHTML !== rendered) element.innerHTML = rendered;
      element.dataset.i18nRendered = rendered;
      element.dataset.translationStatus = rendered === element.dataset.i18nSource ? "fallback" : "translated";
    });
  }

  const contentObserver = new MutationObserver(() => setTimeout(translateQuizContent, 0));
  contentObserver.observe(document.body, { childList: true, subtree: true, characterData: true });
  document.addEventListener("quizLanguageChanged", () => setTimeout(translateQuizContent, 0));

  const saved = localStorage.getItem(STORAGE_KEY) || "en";
  selector.addEventListener("change", event => applyInterface(event.target.value));
  document.addEventListener("click", () => setTimeout(() => applyInterface(selector.value), 0));
  applyInterface(saved);
  translateQuizContent();
})();
