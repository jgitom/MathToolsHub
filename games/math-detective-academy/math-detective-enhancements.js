(() => {
  "use strict";

  const script = document.currentScript;
  const progressKey = script?.dataset.progressKey;
  const level = script?.dataset.level || "Detective";
  if (!progressKey || document.getElementById("mthDetectiveTools")) return;

  const badgeRules = [
    { id:"first-case", icon:"🔎", name:"First Case", check:data => data.completed.length >= 1 },
    { id:"case-cracker", icon:"🧩", name:"Case Cracker", check:data => data.completed.length >= 3 },
    { id:"star-agent", icon:"⭐", name:"Star Agent", check:data => data.stars >= 5 },
    { id:"master-detective", icon:"🏆", name:"Master Detective", check:data => data.completed.length >= 5 }
  ];

  const style = document.createElement("style");
  style.textContent = `
    .mth-detective-tools{position:fixed;right:12px;top:12px;z-index:9998;width:min(310px,calc(100vw - 24px));padding:12px;border:1px solid #bfdbfe;border-radius:16px;color:#172033;background:#fffffff2;box-shadow:0 12px 32px #0f172a2b;font:700 13px "Segoe UI",Arial,sans-serif;backdrop-filter:blur(10px)}
    .mth-tools-head,.mth-tools-actions,.mth-progress-stats{display:flex;align-items:center;gap:8px}.mth-tools-head{justify-content:space-between}.mth-version{padding:4px 8px;border-radius:999px;color:#1d4ed8;background:#dbeafe;font-size:11px}.mth-progress-stats{margin:10px 0}.mth-progress-stat{flex:1;padding:8px;border-radius:10px;text-align:center;background:#f1f5f9}.mth-progress-stat strong{display:block;font-size:18px}.mth-tools-actions{flex-wrap:wrap}.mth-tool-button{min-height:34px;padding:7px 9px;border:1px solid #cbd5e1;border-radius:9px;color:#172033;background:#fff;font:inherit;cursor:pointer}.mth-tool-button:hover,.mth-tool-button:focus-visible{border-color:#2563eb;outline:2px solid #bfdbfe}.mth-badges{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:9px}.mth-badge{padding:7px;border-radius:9px;color:#64748b;background:#f1f5f9;font-size:11px;opacity:.58}.mth-badge.unlocked{color:#166534;background:#dcfce7;opacity:1}.mth-badge span{display:block;font-size:17px}.mth-contrast{filter:contrast(1.22)}.mth-contrast .mth-detective-tools{filter:contrast(.82)}
    @media(max-width:700px){.mth-detective-tools{position:relative;right:auto;top:auto;width:calc(100% - 24px);margin:12px}.mth-academy-back{bottom:8px!important}}
  `;
  document.head.appendChild(style);

  const panel = document.createElement("aside");
  panel.id = "mthDetectiveTools";
  panel.className = "mth-detective-tools";
  panel.setAttribute("aria-label", "Detective progress and accessibility tools");
  panel.innerHTML = `
    <div class="mth-tools-head"><strong>🕵️ ${level}</strong><span class="mth-version">Version 1.1</span></div>
    <div class="mth-progress-stats"><div class="mth-progress-stat"><strong id="mthCasesSolved">0</strong>Cases</div><div class="mth-progress-stat"><strong id="mthStarsEarned">0</strong>Stars</div><div class="mth-progress-stat"><strong id="mthBadgesEarned">0</strong>Badges</div></div>
    <div class="mth-tools-actions"><button class="mth-tool-button" id="mthReadPage" type="button">🔊 Read page</button><button class="mth-tool-button" id="mthContrast" type="button" aria-pressed="false">◐ Contrast</button><button class="mth-tool-button" id="mthToggleBadges" type="button" aria-expanded="false">🏅 Badges</button></div>
    <div class="mth-badges" id="mthBadgeList" hidden></div>`;
  document.body.prepend(panel);

  const casesNode = panel.querySelector("#mthCasesSolved");
  const starsNode = panel.querySelector("#mthStarsEarned");
  const badgesNode = panel.querySelector("#mthBadgesEarned");
  const badgeList = panel.querySelector("#mthBadgeList");
  let lastSnapshot = "";

  function readProgress() {
    try {
      const data = JSON.parse(localStorage.getItem(progressKey) || "{}");
      return { raw:data, completed:Array.isArray(data.completed) ? data.completed : [], stars:Number(data.stars) || 0, badges:Array.isArray(data.mthBadges) ? data.mthBadges : [] };
    } catch { return { raw:{}, completed:[], stars:0, badges:[] }; }
  }

  function renderProgress() {
    const data = readProgress();
    let changed = false;
    badgeRules.forEach(rule => { if (rule.check(data) && !data.badges.includes(rule.id)) { data.badges.push(rule.id); changed = true; } });
    if (changed) { data.raw.mthBadges = data.badges; localStorage.setItem(progressKey, JSON.stringify(data.raw)); }
    const snapshot = JSON.stringify([data.completed.length,data.stars,data.badges]);
    if (snapshot === lastSnapshot) return;
    lastSnapshot = snapshot;
    casesNode.textContent = String(data.completed.length); starsNode.textContent = String(data.stars); badgesNode.textContent = String(data.badges.length);
    badgeList.replaceChildren(...badgeRules.map(rule => { const item=document.createElement("div"); item.className="mth-badge"+(data.badges.includes(rule.id)?" unlocked":""); item.innerHTML=`<span>${data.badges.includes(rule.id)?rule.icon:"🔒"}</span>${rule.name}`; return item; }));
  }

  panel.querySelector("#mthToggleBadges").addEventListener("click", event => { const open=badgeList.hidden; badgeList.hidden=!open; event.currentTarget.setAttribute("aria-expanded",String(open)); });
  panel.querySelector("#mthContrast").addEventListener("click", event => { const active=document.body.classList.toggle("mth-contrast"); event.currentTarget.setAttribute("aria-pressed",String(active)); localStorage.setItem("mthDetectiveContrast",active?"1":"0"); });
  panel.querySelector("#mthReadPage").addEventListener("click", () => { speechSynthesis.cancel(); const main=document.querySelector("main,.game,.container") || document.body; const text=main.innerText.replace(/\s+/g," ").trim().slice(0,3500); if(text){const utterance=new SpeechSynthesisUtterance(text);utterance.lang=document.documentElement.lang||"en";speechSynthesis.speak(utterance);} });
  if (localStorage.getItem("mthDetectiveContrast") === "1") { document.body.classList.add("mth-contrast"); panel.querySelector("#mthContrast").setAttribute("aria-pressed","true"); }
  document.addEventListener("keydown", event => { if(event.altKey && event.key.toLowerCase()==="p") panel.querySelector("#mthToggleBadges").click(); });
  renderProgress(); setInterval(renderProgress, 1000);
})();
