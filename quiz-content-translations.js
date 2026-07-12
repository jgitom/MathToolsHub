/*
 * Reviewed quiz translations.
 * Add entries as: "Original Bahasa Melayu text": "Translated text"
 * Missing entries intentionally fall back to the original text.
 */
window.QUIZ_TRANSLATIONS = window.QUIZ_TRANSLATIONS || {
  en: {},
  ms: {},
  zh: {}
};
window.QUIZ_TRANSLATION_REVIEW = window.QUIZ_TRANSLATION_REVIEW || { en: new Set(), zh: new Set() };

window.getQuizTranslation = function (text, languageValue) {
  const language = String(languageValue || "en").startsWith("ms") ? "ms"
    : String(languageValue || "en").startsWith("zh") ? "zh" : "en";
  const source = String(text ?? "");
  if (language === "ms") return source;
  const clean = source.trim();
  const translated = window.QUIZ_TRANSLATIONS[language]?.[clean];
  if (!translated) {
    if (clean) window.QUIZ_TRANSLATION_REVIEW[language].add(clean);
    return source;
  }
  return source.replace(clean, translated);
};
