(() => {
  "use strict";

  if (window.__MTH_STUDENT_NOTEPAD_LOADED__) return;
  window.__MTH_STUDENT_NOTEPAD_LOADED__ = true;

  const CONFIG = {
    storageKey: "mth_student_notepad_v1",
    settingsKey: "mth_student_notepad_settings_v1",
    defaultTitle: "My Notes"
  };

  const saved = readJson(CONFIG.storageKey, {
    title: CONFIG.defaultTitle,
    body: "",
    updatedAt: null
  });

  const settings = readJson(CONFIG.settingsKey, {
    open: false,
    minimized: false,
    theme: "light",
    fontSize: 16,
    x: null,
    y: null,
    width: 380,
    height: 500
  });

  const style = document.createElement("style");
  style.id = "mth-student-notepad-style";
  style.textContent = `
    #mth-note-launcher,
    #mth-note-panel,
    #mth-note-panel * { box-sizing: border-box; }

    #mth-note-launcher {
      position: fixed;
      right: 22px;
      bottom: 22px;
      z-index: 2147483000;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border: 0;
      border-radius: 999px;
      color: #fff;
      background: linear-gradient(135deg, #2563eb, #0ea5e9);
      box-shadow: 0 14px 35px rgba(15,23,42,.28);
      font: 700 14px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      cursor: pointer;
      user-select: none;
      transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
    }

    #mth-note-launcher:hover,
    #mth-note-launcher:focus-visible {
      transform: translateY(-3px);
      box-shadow: 0 18px 40px rgba(15,39,71,.36);
      outline: 3px solid #bfdbfe;
      outline-offset: 2px;
    }

    #mth-note-launcher.mth-note-above-assistant {
      left: 24px;
      right: auto;
      bottom: 24px;
    }

    #mth-note-panel.mth-note-above-assistant {
      left: 22px;
      right: auto;
    }

    #mth-note-launcher .mth-note-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #86efac;
      box-shadow: 0 0 0 4px rgba(134,239,172,.18);
    }

    #mth-note-panel {
      position: fixed;
      right: 22px;
      bottom: 82px;
      z-index: 2147483001;
      display: none;
      flex-direction: column;
      width: 380px;
      height: 500px;
      min-width: 290px;
      min-height: 220px;
      max-width: calc(100vw - 20px);
      max-height: calc(100dvh - 20px);
      overflow: hidden;
      border: 1px solid rgba(15,23,42,.18);
      border-radius: 16px;
      background: #fff;
      box-shadow: 0 24px 70px rgba(15,23,42,.34);
      resize: both;
      font-family: system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    }

    #mth-note-panel.mth-open { display: flex; }
    #mth-note-panel.mth-dark {
      color: #f8fafc;
      background: #0f172a;
      border-color: rgba(255,255,255,.15);
    }

    #mth-note-panel.mth-minimized {
      height: auto !important;
      min-height: 0;
      resize: none;
    }

    #mth-note-panel.mth-minimized .mth-note-body,
    #mth-note-panel.mth-minimized .mth-note-toolbar,
    #mth-note-panel.mth-minimized .mth-note-footer { display: none; }

    .mth-note-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 10px 10px 12px;
      color: #0f172a;
      background: #f8fafc;
      border-bottom: 1px solid rgba(15,23,42,.10);
      cursor: move;
      user-select: none;
    }

    #mth-note-panel.mth-dark .mth-note-header {
      color: #f8fafc;
      background: #111827;
      border-bottom-color: rgba(255,255,255,.12);
    }

    .mth-note-title-input {
      flex: 1;
      min-width: 0;
      padding: 6px 8px;
      border: 0;
      border-radius: 8px;
      color: inherit;
      background: transparent;
      font: 700 14px/1.2 system-ui,sans-serif;
      outline: none;
      cursor: text;
    }

    .mth-note-title-input:focus { background: rgba(37,99,235,.08); }

    .mth-note-icon-btn {
      display: inline-grid;
      place-items: center;
      width: 32px;
      height: 32px;
      flex: 0 0 auto;
      border: 0;
      border-radius: 9px;
      color: inherit;
      background: transparent;
      font-size: 16px;
      cursor: pointer;
    }

    .mth-note-icon-btn:hover { background: rgba(100,116,139,.15); }

    .mth-note-toolbar {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 10px;
      background: #fff;
      border-bottom: 1px solid rgba(15,23,42,.08);
      overflow-x: auto;
      scrollbar-width: thin;
    }

    #mth-note-panel.mth-dark .mth-note-toolbar {
      background: #0f172a;
      border-bottom-color: rgba(255,255,255,.10);
    }

    .mth-note-tool-btn {
      flex: 0 0 auto;
      padding: 7px 9px;
      border: 1px solid rgba(15,23,42,.10);
      border-radius: 8px;
      color: #334155;
      background: #f8fafc;
      font: 700 12px/1 system-ui,sans-serif;
      cursor: pointer;
    }

    #mth-note-panel.mth-dark .mth-note-tool-btn {
      color: #e2e8f0;
      background: #1e293b;
      border-color: rgba(255,255,255,.10);
    }

    .mth-note-tool-btn:hover { border-color: #60a5fa; }

    .mth-note-body {
      position: relative;
      display: flex;
      flex: 1;
      min-height: 0;
      background: linear-gradient(#fff 31px,#dbeafe 32px);
      background-size: 100% 32px;
    }

    #mth-note-panel.mth-dark .mth-note-body {
      background: linear-gradient(#0f172a 31px,rgba(96,165,250,.18) 32px);
      background-size: 100% 32px;
    }

    .mth-note-textarea {
      width: 100%;
      height: 100%;
      min-height: 0;
      padding: 8px 14px 18px 42px;
      border: 0;
      resize: none;
      color: #0f172a;
      background: transparent;
      font-family: "Segoe UI",Arial,sans-serif;
      font-size: 16px;
      line-height: 32px;
      outline: none;
      tab-size: 4;
    }

    #mth-note-panel.mth-dark .mth-note-textarea { color: #f8fafc; }

    .mth-note-margin {
      position: absolute;
      left: 31px;
      top: 0;
      bottom: 0;
      width: 1px;
      background: rgba(239,68,68,.38);
      pointer-events: none;
    }

    .mth-note-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 7px 10px;
      color: #64748b;
      background: #f8fafc;
      border-top: 1px solid rgba(15,23,42,.08);
      font: 600 11px/1.3 system-ui,sans-serif;
    }

    #mth-note-panel.mth-dark .mth-note-footer {
      color: #94a3b8;
      background: #111827;
      border-top-color: rgba(255,255,255,.10);
    }

    .mth-note-save-status { color: #15803d; }
    #mth-note-panel.mth-dark .mth-note-save-status { color: #86efac; }

    .mth-note-toast {
      position: absolute;
      left: 50%;
      bottom: 46px;
      z-index: 5;
      transform: translate(-50%,10px);
      padding: 8px 12px;
      border-radius: 999px;
      color: #fff;
      background: rgba(15,23,42,.92);
      font: 700 12px/1 system-ui,sans-serif;
      opacity: 0;
      pointer-events: none;
      transition: .18s ease;
    }

    .mth-note-toast.mth-show { opacity: 1; transform: translate(-50%,0); }

    @media (max-width: 640px) {
      #mth-note-launcher { right: 14px; bottom: 14px; min-height: 44px; padding: 11px 14px; }
      #mth-note-launcher.mth-note-above-assistant { left: 14px; right: auto; bottom: 14px; }
      .mth-note-icon-btn { width: 44px; height: 44px; }
      .mth-note-tool-btn { min-height: 44px; }
      #mth-note-panel {
        left: 8px !important;
        right: 8px !important;
        bottom: 68px !important;
        top: auto !important;
        width: auto !important;
        height: min(68dvh,540px);
        max-width: none;
        resize: vertical;
      }
    }

    @media print {
      #mth-note-launcher,#mth-note-panel { display: none !important; }
    }
  `;
  document.head.appendChild(style);

  const launcher = document.createElement("button");
  launcher.id = "mth-note-launcher";
  launcher.type = "button";
  launcher.title = "Open writing pad (Ctrl+Shift+N)";
  launcher.setAttribute("aria-label", "Open writing pad");
  launcher.setAttribute("aria-controls", "mth-note-panel");
  launcher.setAttribute("aria-expanded", "false");
  launcher.classList.toggle("mth-note-above-assistant", Boolean(document.querySelector(".ai-assistant")));
  launcher.innerHTML = '<span class="mth-note-dot"></span><span>Notes</span>';

  const panel = document.createElement("section");
  panel.id = "mth-note-panel";
  panel.setAttribute("aria-label", "Student writing pad");
  panel.setAttribute("role", "dialog");
  panel.classList.toggle("mth-note-above-assistant", Boolean(document.querySelector(".ai-assistant")));
  panel.innerHTML = `
    <header class="mth-note-header" id="mth-note-drag-handle">
      <span aria-hidden="true">📝</span>
      <input class="mth-note-title-input" id="mth-note-title" maxlength="80" aria-label="Note title">
      <button class="mth-note-icon-btn" id="mth-note-minimize" type="button" title="Minimize" aria-label="Minimize">—</button>
      <button class="mth-note-icon-btn" id="mth-note-close" type="button" title="Close" aria-label="Close">✕</button>
    </header>
    <div class="mth-note-toolbar" aria-label="Notepad tools">
      <button class="mth-note-tool-btn" id="mth-note-copy" type="button">Copy</button>
      <button class="mth-note-tool-btn" id="mth-note-download" type="button">Download TXT</button>
      <button class="mth-note-tool-btn" id="mth-note-font-down" type="button">A−</button>
      <button class="mth-note-tool-btn" id="mth-note-font-up" type="button">A+</button>
      <button class="mth-note-tool-btn" id="mth-note-theme" type="button">Dark Mode</button>
      <button class="mth-note-tool-btn" id="mth-note-clear" type="button">Clear</button>
    </div>
    <div class="mth-note-body">
      <div class="mth-note-margin"></div>
      <textarea class="mth-note-textarea" id="mth-note-text" spellcheck="true" placeholder="Write your notes here...\n\nYour work is saved automatically in this browser." aria-label="Writing pad"></textarea>
    </div>
    <footer class="mth-note-footer">
      <span id="mth-note-count">0 words · 0 characters</span>
      <span class="mth-note-save-status" id="mth-note-status">Saved locally</span>
    </footer>
    <div class="mth-note-toast" id="mth-note-toast" role="status" aria-live="polite"></div>
  `;

  document.body.append(launcher, panel);

  const titleInput = panel.querySelector("#mth-note-title");
  const textarea = panel.querySelector("#mth-note-text");
  const status = panel.querySelector("#mth-note-status");
  const count = panel.querySelector("#mth-note-count");
  const toast = panel.querySelector("#mth-note-toast");
  const minimizeBtn = panel.querySelector("#mth-note-minimize");
  const closeBtn = panel.querySelector("#mth-note-close");
  const copyBtn = panel.querySelector("#mth-note-copy");
  const downloadBtn = panel.querySelector("#mth-note-download");
  const fontDownBtn = panel.querySelector("#mth-note-font-down");
  const fontUpBtn = panel.querySelector("#mth-note-font-up");
  const themeBtn = panel.querySelector("#mth-note-theme");
  const clearBtn = panel.querySelector("#mth-note-clear");
  const dragHandle = panel.querySelector("#mth-note-drag-handle");

  titleInput.value = saved.title || CONFIG.defaultTitle;
  textarea.value = saved.body || "";

  applySettings();
  updateCount();

  let saveTimer = null;
  let dragState = null;

  launcher.addEventListener("click", () => {
    settings.open = !settings.open;
    settings.minimized = false;
    applySettings();
    persistSettings();
    if (settings.open) setTimeout(() => textarea.focus(), 50);
  });

  closeBtn.addEventListener("click", () => {
    settings.open = false;
    applySettings();
    persistSettings();
  });

  minimizeBtn.addEventListener("click", () => {
    settings.minimized = !settings.minimized;
    applySettings();
    persistSettings();
  });

  titleInput.addEventListener("input", queueSave);
  textarea.addEventListener("input", () => {
    updateCount();
    queueSave();
  });

  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.setRangeText("    ", start, end, "end");
      updateCount();
      queueSave();
    }
  });

  copyBtn.addEventListener("click", async () => {
    const text = buildExportText();
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied to clipboard");
    } catch {
      textarea.select();
      const ok = document.execCommand("copy");
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      showToast(ok ? "Copied to clipboard" : "Copy failed");
    }
  });

  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([buildExportText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = (titleInput.value || "student-notes")
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .slice(0, 60);
    link.href = url;
    link.download = `${safeTitle || "student-notes"}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("TXT file downloaded");
  });

  fontDownBtn.addEventListener("click", () => {
    settings.fontSize = Math.max(12, settings.fontSize - 1);
    applySettings();
    persistSettings();
    showToast(`Font size ${settings.fontSize}px`);
  });

  fontUpBtn.addEventListener("click", () => {
    settings.fontSize = Math.min(28, settings.fontSize + 1);
    applySettings();
    persistSettings();
    showToast(`Font size ${settings.fontSize}px`);
  });

  themeBtn.addEventListener("click", () => {
    settings.theme = settings.theme === "dark" ? "light" : "dark";
    applySettings();
    persistSettings();
  });

  clearBtn.addEventListener("click", () => {
    if (!textarea.value.trim() && titleInput.value === CONFIG.defaultTitle) return;
    if (!window.confirm("Clear this note? This cannot be undone.")) return;
    titleInput.value = CONFIG.defaultTitle;
    textarea.value = "";
    updateCount();
    saveNow();
    showToast("Note cleared");
    textarea.focus();
  });

  dragHandle.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button,input")) return;
    if (window.matchMedia("(max-width: 640px)").matches) return;
    const rect = panel.getBoundingClientRect();
    dragState = { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    dragHandle.setPointerCapture(event.pointerId);
  });

  dragHandle.addEventListener("pointermove", (event) => {
    if (!dragState) return;
    const maxX = window.innerWidth - panel.offsetWidth - 6;
    const maxY = window.innerHeight - panel.offsetHeight - 6;
    const x = Math.max(6, Math.min(maxX, event.clientX - dragState.offsetX));
    const y = Math.max(6, Math.min(maxY, event.clientY - dragState.offsetY));
    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
    settings.x = x;
    settings.y = y;
  });

  dragHandle.addEventListener("pointerup", (event) => {
    if (!dragState) return;
    dragState = null;
    dragHandle.releasePointerCapture(event.pointerId);
    persistSettings();
  });

  window.addEventListener("resize", keepPanelVisible);

  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toUpperCase() === "N") {
      event.preventDefault();
      settings.open = !settings.open;
      settings.minimized = false;
      applySettings();
      persistSettings();
      if (settings.open) textarea.focus();
    }
    if (event.key === "Escape" && settings.open) {
      settings.open = false;
      applySettings();
      persistSettings();
    }
  });

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => {
      if (!settings.minimized && panel.offsetWidth > 0) {
        settings.width = Math.round(panel.offsetWidth);
        settings.height = Math.round(panel.offsetHeight);
        persistSettings();
      }
    });
    resizeObserver.observe(panel);
  }

  function queueSave() {
    status.textContent = "Saving...";
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 350);
  }

  function saveNow() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify({
      title: titleInput.value.trim() || CONFIG.defaultTitle,
      body: textarea.value,
      updatedAt: new Date().toISOString()
    }));
    status.textContent = "Saved locally";
  }

  function updateCount() {
    const text = textarea.value;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    count.textContent = `${words} word${words === 1 ? "" : "s"} · ${text.length} character${text.length === 1 ? "" : "s"}`;
  }

  function buildExportText() {
    const heading = titleInput.value.trim() || CONFIG.defaultTitle;
    return `${heading}\n${"=".repeat(Math.min(heading.length,60))}\n\n${textarea.value}`;
  }

  function applySettings() {
    panel.classList.toggle("mth-open", Boolean(settings.open));
    launcher.setAttribute("aria-expanded", String(Boolean(settings.open)));
    panel.classList.toggle("mth-minimized", Boolean(settings.minimized));
    panel.classList.toggle("mth-dark", settings.theme === "dark");
    textarea.style.fontSize = `${settings.fontSize}px`;
    themeBtn.textContent = settings.theme === "dark" ? "Light Mode" : "Dark Mode";
    minimizeBtn.textContent = settings.minimized ? "□" : "—";
    minimizeBtn.title = settings.minimized ? "Restore" : "Minimize";

    if (!window.matchMedia("(max-width: 640px)").matches) {
      panel.style.width = `${settings.width}px`;
      if (!settings.minimized) panel.style.height = `${settings.height}px`;
      if (Number.isFinite(settings.x) && Number.isFinite(settings.y)) {
        panel.style.left = `${settings.x}px`;
        panel.style.top = `${settings.y}px`;
        panel.style.right = "auto";
        panel.style.bottom = "auto";
      }
    }
  }

  function keepPanelVisible() {
    if (window.matchMedia("(max-width: 640px)").matches) {
      panel.style.left = "";
      panel.style.top = "";
      panel.style.right = "";
      panel.style.bottom = "";
      return;
    }
    const rect = panel.getBoundingClientRect();
    const x = Math.max(6, Math.min(window.innerWidth - rect.width - 6, rect.left));
    const y = Math.max(6, Math.min(window.innerHeight - rect.height - 6, rect.top));
    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
    settings.x = x;
    settings.y = y;
    persistSettings();
  }

  function persistSettings() {
    localStorage.setItem(CONFIG.settingsKey, JSON.stringify(settings));
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("mth-show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("mth-show"), 1500);
  }

  function readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? { ...fallback, ...JSON.parse(value) } : fallback;
    } catch {
      return fallback;
    }
  }
})();
