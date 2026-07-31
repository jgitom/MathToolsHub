(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const ui = {
    score: document.getElementById("score"),
    wave: document.getElementById("wave"),
    time: document.getElementById("time"),
    ammo: document.getElementById("ammo"),
    accuracy: document.getElementById("accuracy"),
    startOverlay: document.getElementById("startOverlay"),
    gameOverOverlay: document.getElementById("gameOverOverlay"),
    startBtn: document.getElementById("startBtn"),
    restartBtn: document.getElementById("restartBtn"),
    fullscreenBtn: document.getElementById("fullscreenBtn"),
    reloadNotice: document.getElementById("reloadNotice"),
    comboNotice: document.getElementById("comboNotice"),
    finalScore: document.getElementById("finalScore"),
    finalAccuracy: document.getElementById("finalAccuracy"),
    finalCombo: document.getElementById("finalCombo"),
    finalHits: document.getElementById("finalHits"),
    resultTitle: document.getElementById("resultTitle"),
    creditsValue: document.getElementById("creditsValue"),
    shopList: document.getElementById("shopList"),
    buyAmmoBtn: document.getElementById("buyAmmoBtn"),
    startBadge: document.getElementById("startBadge"),
    startTitle: document.getElementById("startTitle"),
    startDescription: document.getElementById("startDescription"),
    resultBadge: document.getElementById("resultBadge"),
    missionList: document.getElementById("missionList"),
    missionText: document.getElementById("missionText"),
    weatherNotice: document.getElementById("weatherNotice")
  };

  const state = {
    running: false,
    score: 0,
    wave: 1,
    timeLeft: 60,
    magazineSize: 5,
    ammo: 5,
    reserveAmmo: 20,
    shots: 0,
    hits: 0,
    combo: 0,
    bestCombo: 0,
    reloading: false,
    reloadEndsAt: 0,
    zoom: false,
    steady: false,
    recoil: 0,
    flash: 0,
    lastFrame: 0,
    targetSpawnTimer: 0,
    messageTimer: 0,
    missionIndex: -1,
    currentMission: null,
    weather: "clear",
    weatherTimer: 0,
    weatherIntensity: 0,
    weatherDrift: 0,
    weatherFlash: 0,
    weatherNoticeTimer: 0,
    credits: 0,
    upgrades: {
      magazine: 0,
      scope: 0,
      stability: 0,
      armor: 0
    }
  };

  const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
  const missions = [
    {
      id: 1,
      badge: "MISSION 01",
      title: "Mountain Relay Intercept",
      description: "Hit hostile steel targets before the timer reaches zero. Avoid civilian markers.",
      time: 60,
      ammo: 5,
      reserveAmmo: 20,
      magazineSize: 5,
      civilianChanceBase: 0.12,
      civilianChanceGrowth: 0.01,
      civilianChanceMax: 0.25,
      targetSpeedBase: 35,
      targetSpeedRange: 65,
      targetSpeedGrowth: 8,
      initialTargets: 5,
      spawnDelay: 1.1,
      spawnDecay: 0.07,
      armorChance: 0.2,
      scoreTarget: 2500,
      special: "Balanced opener",
      ancientBird: false
    },
    {
      id: 2,
      badge: "MISSION 02",
      title: "Night Ridge Sweep",
      description: "Clear a faster wave of targets and keep your combo alive under pressure.",
      time: 70,
      ammo: 6,
      reserveAmmo: 24,
      magazineSize: 6,
      civilianChanceBase: 0.1,
      civilianChanceGrowth: 0.01,
      civilianChanceMax: 0.22,
      targetSpeedBase: 42,
      targetSpeedRange: 70,
      targetSpeedGrowth: 9,
      initialTargets: 6,
      spawnDelay: 0.95,
      spawnDecay: 0.08,
      armorChance: 0.35,
      scoreTarget: 3000,
      special: "Faster targets",
      ancientBird: true
    },
    {
      id: 3,
      badge: "MISSION 03",
      title: "Harbor Siege",
      description: "Break through armored targets while keeping civilian casualties to zero.",
      time: 80,
      ammo: 5,
      reserveAmmo: 22,
      magazineSize: 5,
      civilianChanceBase: 0.08,
      civilianChanceGrowth: 0.01,
      civilianChanceMax: 0.18,
      targetSpeedBase: 30,
      targetSpeedRange: 55,
      targetSpeedGrowth: 8,
      initialTargets: 5,
      spawnDelay: 0.9,
      spawnDecay: 0.06,
      armorChance: 0.5,
      scoreTarget: 3200,
      special: "Armor plating",
      ancientBird: false
    },
    {
      id: 4,
      badge: "MISSION 04",
      title: "Ghost Valley Sniper",
      description: "A precision mission with tighter margins and fewer mistakes allowed.",
      time: 90,
      ammo: 4,
      reserveAmmo: 18,
      magazineSize: 4,
      civilianChanceBase: 0.06,
      civilianChanceGrowth: 0.008,
      civilianChanceMax: 0.16,
      targetSpeedBase: 38,
      targetSpeedRange: 60,
      targetSpeedGrowth: 7,
      initialTargets: 4,
      spawnDelay: 0.85,
      spawnDecay: 0.05,
      armorChance: 0.35,
      scoreTarget: 3600,
      special: "Precision focus",
      ancientBird: true
    }
  ];
  const targets = [];
  const particles = [];
  const popups = [];
  const upgrades = [
    {
      id: "magazine",
      label: "Extended Mag",
      description: "Adds extra magazine capacity and reserve ammo for the next mission.",
      costBase: 500,
      maxLevel: 3
    },
    {
      id: "scope",
      label: "Precision Scope",
      description: "Tightens your aim and reduces recoil for better accuracy.",
      costBase: 650,
      maxLevel: 3
    },
    {
      id: "stability",
      label: "Steady Grip",
      description: "Improves hold control and makes steady aim more effective.",
      costBase: 600,
      maxLevel: 3
    },
    {
      id: "armor",
      label: "Armor Piercer",
      description: "Improves damage against armored targets and increases reserve ammo.",
      costBase: 700,
      maxLevel: 3
    }
  ];

  const rng = (min, max) => Math.random() * (max - min) + min;

  function applyWeather(name, showNotice = true) {
    const presets = {
      clear: { label: "Clear Skies", intensity: 0, drift: 0 },
      fog: { label: "Dense Fog", intensity: 0.32, drift: 8 },
      rain: { label: "Rain Squall", intensity: 0.26, drift: 16 },
      storm: { label: "Storm Front", intensity: 0.4, drift: 24 }
    };
    const preset = presets[name] || presets.clear;

    state.weather = name;
    state.weatherIntensity = preset.intensity;
    state.weatherDrift = preset.drift;
    state.weatherFlash = name === "storm" ? 0.8 : 0;

    if (showNotice) {
      ui.weatherNotice.textContent = `Weather Shift: ${preset.label}`;
      state.weatherNoticeTimer = 2.2;
    }
  }

  function updateWeather(dt) {
    state.weatherTimer -= dt;
    state.weatherFlash = Math.max(0, state.weatherFlash - dt * 1.2);

    if (state.weatherNoticeTimer > 0) {
      state.weatherNoticeTimer -= dt;
      if (state.weatherNoticeTimer <= 0) ui.weatherNotice.textContent = "";
    }

    if (state.weatherTimer <= 0) {
      const next = ["clear", "fog", "rain", "storm"][Math.floor(Math.random() * 4)];
      applyWeather(next, true);
      state.weatherTimer = 8 + Math.random() * 6;
    }
  }

  function updateShopDisplay() {
    ui.creditsValue.textContent = state.credits.toLocaleString();
    ui.shopList.innerHTML = "";

    upgrades.forEach((upgrade) => {
      const level = state.upgrades[upgrade.id];
      const cost = upgrade.costBase + level * 140;
      const disabled = state.credits < cost || level >= upgrade.maxLevel;
      const card = document.createElement("button");
      card.className = "shop-card";
      card.disabled = disabled;
      card.innerHTML = `
        <strong>${upgrade.label}</strong>
        <span>${upgrade.description}</span>
        <div class="shop-cost">${level > 0 ? `Level ${level} • ` : ""}Cost ${cost.toLocaleString()}</div>
      `;
      card.addEventListener("click", () => purchaseUpgrade(upgrade.id));
      ui.shopList.appendChild(card);
    });
  }

  function purchaseUpgrade(id) {
    const upgrade = upgrades.find((entry) => entry.id === id);
    if (!upgrade) return;

    const level = state.upgrades[upgrade.id];
    const cost = upgrade.costBase + level * 140;

    if (state.credits < cost || level >= upgrade.maxLevel) return;

    state.credits -= cost;
    state.upgrades[upgrade.id] += 1;
    updateShopDisplay();
    ui.comboNotice.textContent = `${upgrade.label.toUpperCase()} UPGRADED`;
    state.messageTimer = 1.2;
  }

  function updateMissionDisplay() {
    const mission = state.currentMission || missions[0];
    ui.startBadge.textContent = mission.badge;
    ui.startTitle.textContent = mission.title;
    ui.startDescription.textContent = mission.description;
    ui.resultBadge.textContent = `${mission.badge} COMPLETE`;
    ui.missionText.textContent = `${mission.special} • ${mission.description}`;
    if (mission.ancientBird) {
      ui.comboNotice.textContent = mission.badge === "MISSION 02" ? "ANCIENT BIRD EVENT" : "ANCIENT BIRD EVENT";
      state.messageTimer = 1.2;
    }

    ui.missionList.innerHTML = "";
    missions.forEach((entry, index) => {
      const pill = document.createElement("div");
      pill.className = `mission-pill${index === state.missionIndex ? " active" : ""}`;
      pill.innerHTML = `<strong>${entry.badge}</strong><span>${entry.title}</span>`;
      ui.missionList.appendChild(pill);
    });
  }

  function resetGame() {
    state.missionIndex = (state.missionIndex + 1) % missions.length;
    state.currentMission = missions[state.missionIndex];

    Object.assign(state, {
      running: true,
      score: 0,
      wave: 1,
      timeLeft: state.currentMission.time,
      ammo: state.currentMission.ammo,
      reserveAmmo: state.currentMission.reserveAmmo,
      magazineSize: state.currentMission.magazineSize,
      shots: 0,
      hits: 0,
      combo: 0,
      bestCombo: 0,
      reloading: false,
      reloadEndsAt: 0,
      zoom: false,
      steady: false,
      recoil: 0,
      flash: 0,
      lastFrame: performance.now(),
      targetSpawnTimer: 0,
      messageTimer: 0,
      weather: "clear",
      weatherTimer: 4 + Math.random() * 3,
      weatherIntensity: 0,
      weatherDrift: 0,
      weatherFlash: 0,
      weatherNoticeTimer: 0
    });

    state.magazineSize = state.currentMission.magazineSize + state.upgrades.magazine;
    state.ammo = Math.min(state.magazineSize, state.currentMission.ammo + state.upgrades.magazine);
    state.reserveAmmo = state.currentMission.reserveAmmo + state.upgrades.magazine * 4 + state.upgrades.armor * 3;

    targets.length = 0;
    particles.length = 0;
    popups.length = 0;

    ui.startOverlay.classList.remove("visible");
    ui.gameOverOverlay.classList.remove("visible");
    ui.reloadNotice.style.display = "none";
    ui.comboNotice.textContent = "";
    ui.weatherNotice.textContent = "";
    applyWeather("clear", false);
    updateMissionDisplay();
    updateShopDisplay();

    for (let i = 0; i < state.currentMission.initialTargets; i++) spawnTarget();
    updateHud();
    requestAnimationFrame(loop);
  }

  function endGame() {
    state.running = false;
    const accuracy = state.shots ? Math.round((state.hits / state.shots) * 100) : 0;
    const mission = state.currentMission || missions[0];
    state.credits += state.score;
    ui.finalScore.textContent = state.score.toLocaleString();
    ui.finalAccuracy.textContent = `${accuracy}%`;
    ui.finalCombo.textContent = state.bestCombo;
    ui.finalHits.textContent = state.hits;
    ui.resultTitle.textContent = state.score >= mission.scoreTarget ? "Elite Performance" :
      state.score >= mission.scoreTarget * 0.55 ? "Mission Accomplished" : "Training Required";
    updateShopDisplay();
    ui.gameOverOverlay.classList.add("visible");
  }

  function updateHud() {
    ui.score.textContent = state.score.toLocaleString();
    ui.wave.textContent = state.wave;
    ui.time.textContent = Math.max(0, Math.ceil(state.timeLeft));
    ui.ammo.textContent = `${state.ammo} / ${state.reserveAmmo}`;
    const accuracy = state.shots ? Math.round((state.hits / state.shots) * 100) : 0;
    ui.accuracy.textContent = `${accuracy}%`;

    const ammoCost = 300;
    const canAfford = state.running && state.score >= ammoCost;
    ui.buyAmmoBtn.disabled = !canAfford;
    ui.buyAmmoBtn.textContent = canAfford ? `Buy 5 - ${ammoCost}` : `Need ${ammoCost}`;
  }

  function buyAmmo() {
    if (!state.running) return;

    const ammoCost = 300;
    if (state.score < ammoCost) return;

    state.score -= ammoCost;
    state.reserveAmmo += 5;
    state.ammo = Math.min(state.magazineSize, state.ammo + 1);

    if (state.reloading) {
      state.reloading = false;
      state.reloadEndsAt = 0;
      ui.reloadNotice.style.display = "none";
    }

    ui.comboNotice.textContent = "AMMO PACK ACQUIRED";
    state.messageTimer = 1.1;
    updateHud();
  }

  function spawnTarget() {
    const mission = state.currentMission || missions[0];
    const civilianChance = Math.min(
      mission.civilianChanceBase + state.wave * mission.civilianChanceGrowth,
      mission.civilianChanceMax
    );
    const isCivilian = Math.random() < civilianChance;
    const size = rng(30, 58);
    const x = rng(120, canvas.width - 120);
    const horizonY = rng(canvas.height * 0.37, canvas.height * 0.72);
    const speedBase = mission.targetSpeedBase + state.wave * mission.targetSpeedGrowth;
    const speed = rng(speedBase, speedBase + mission.targetSpeedRange) * (Math.random() < 0.5 ? -1 : 1);
    const isAncientBird = mission.ancientBird && state.wave >= 3 && Math.random() < 0.12;

    const target = {
      x,
      y: horizonY,
      size,
      speed,
      isCivilian,
      isAncientBird,
      hp: isAncientBird ? 3 : (state.wave >= 4 && !isCivilian && Math.random() < mission.armorChance ? 2 : 1),
      maxHp: 1,
      active: true,
      age: 0,
      bob: rng(0, Math.PI * 2),
      depth: rng(0.75, 1.15),
      wingFlap: rng(0, Math.PI * 2)
    };

    targets.push(target);
    target.maxHp = target.hp;
  }

  function fire() {
    if (!state.running || state.reloading) return;

    if (state.ammo <= 0) {
      beginReload();
      return;
    }

    state.ammo--;
    state.shots++;
    const recoilBase = state.steady ? 3 : 8;
    state.recoil = Math.max(1, recoilBase - state.upgrades.scope * 0.8 - state.upgrades.stability * 0.4);
    state.flash = 1;

    const aimSpread = state.steady ? 1.5 - state.upgrades.stability * 0.18 : (state.zoom ? 2.5 - state.upgrades.scope * 0.35 : 5.5 - state.upgrades.scope * 0.26);
    const shotX = mouse.x + rng(-aimSpread, aimSpread);
    const shotY = mouse.y + rng(-aimSpread, aimSpread);

    let hitTarget = null;
    let closestDistance = Infinity;

    for (const target of targets) {
      if (!target.active) continue;
      const dx = shotX - target.x;
      const dy = shotY - target.y;
      const hitRadius = target.size * 0.58;
      const distance = Math.hypot(dx, dy);

      if (distance <= hitRadius && distance < closestDistance) {
        closestDistance = distance;
        hitTarget = target;
      }
    }

    if (hitTarget) {
      processHit(hitTarget, shotX, shotY, closestDistance);
    } else {
      state.combo = 0;
      createImpact(shotX, shotY, false);
    }

    if (state.ammo === 0 && state.reserveAmmo > 0) {
      setTimeout(beginReload, 250);
    }

    updateHud();
  }

  function processHit(target, x, y, distance) {
    state.hits++;

    if (target.isCivilian) {
      target.active = false;
      state.score = Math.max(0, state.score - 400);
      state.combo = 0;
      addPopup(x, y, "-400 CIVILIAN", "#ff6969");
      createImpact(x, y, true, "#ff6969");
      return;
    }

    if (target.isAncientBird) {
      target.hp--;
      if (target.hp > 0) {
        state.score += 140;
        addPopup(x, y, "ANCIENT BIRD +140", "#ffd166");
        createImpact(x, y, true, "#ffd166");
        return;
      }
    } else {
      target.hp--;

      if (target.hp > 0) {
        state.score += 35;
        addPopup(x, y, "ARMOR HIT +35", "#f1ff8a");
        createImpact(x, y, true, "#f1ff8a");
        return;
      }
    }

    target.active = false;
    state.combo++;
    state.bestCombo = Math.max(state.bestCombo, state.combo);

    const normalized = distance / Math.max(1, target.size * 0.58);
    const precisionBonus = Math.round((1 - normalized) * 120);
    const comboBonus = Math.min(state.combo - 1, 10) * 20;
    const base = 100 + state.wave * 15 + state.upgrades.armor * 18;
    const total = target.isAncientBird
      ? base + 320 + precisionBonus + comboBonus
      : base + precisionBonus + comboBonus;

    state.score += total;

    const label = target.isAncientBird
      ? `ANCIENT TAKEN +${total}`
      : (precisionBonus > 90 ? `BULLSEYE +${total}` : `TARGET DOWN +${total}`);

    if (target.isAncientBird) {
      ui.comboNotice.textContent = "ANCIENT BIRD DOWN";
      state.messageTimer = 1.5;
    }

    addPopup(x, y, label, precisionBonus > 90 ? "#d4ff44" : "#86ffab");
    createImpact(x, y, true);

    if (state.combo >= 2) {
      ui.comboNotice.textContent = `${state.combo}× COMBO`;
      state.messageTimer = 1.3;
    }
  }

  function beginReload() {
    if (!state.running || state.reloading || state.ammo === state.magazineSize || state.reserveAmmo <= 0) return;

    state.reloading = true;
    state.reloadEndsAt = performance.now() + 1550;
    ui.reloadNotice.style.display = "block";
  }

  function finishReload() {
    const needed = state.magazineSize - state.ammo;
    const loaded = Math.min(needed, state.reserveAmmo);
    state.ammo += loaded;
    state.reserveAmmo -= loaded;
    state.reloading = false;
    ui.reloadNotice.style.display = "none";
    updateHud();
  }

  function addPopup(x, y, text, color) {
    popups.push({ x, y, text, color, life: 1.1 });
  }

  function createImpact(x, y, strong, color = "#86ffab") {
    const count = strong ? 18 : 8;
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx: rng(-110, 110),
        vy: rng(-110, 40),
        life: rng(0.25, 0.75),
        size: rng(1.5, 4),
        color
      });
    }
  }

  function update(dt, now) {
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      updateHud();
      endGame();
      return;
    }

    const mission = state.currentMission || missions[0];
    state.wave = Math.min(10, 1 + Math.floor((mission.time - state.timeLeft) / 10));

    state.targetSpawnTimer -= dt;
    const activeCount = targets.filter(t => t.active).length;
    const desired = mission.initialTargets + state.wave - 1;

    if (state.targetSpawnTimer <= 0 && activeCount < desired) {
      spawnTarget();
      state.targetSpawnTimer = Math.max(0.3, mission.spawnDelay - state.wave * mission.spawnDecay);
    }

    updateWeather(dt);

    for (const target of targets) {
      if (!target.active) continue;
      target.age += dt;
      target.bob += dt * 2.1;
      if (target.isAncientBird) {
        target.wingFlap += dt * 6;
      }
      const gust = Math.sin(target.age * 1.8 + state.weatherDrift * 0.2) * state.weatherDrift * 0.25;
      target.x += target.speed * dt + gust;

      if (target.x < -100) target.x = canvas.width + 100;
      if (target.x > canvas.width + 100) target.x = -100;
    }

    for (const p of particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
    }

    for (const p of popups) {
      p.life -= dt;
      p.y -= 34 * dt;
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].life <= 0) particles.splice(i, 1);
    }

    for (let i = popups.length - 1; i >= 0; i--) {
      if (popups[i].life <= 0) popups.splice(i, 1);
    }

    for (let i = targets.length - 1; i >= 0; i--) {
      if (!targets[i].active && targets[i].age > 0.2) targets.splice(i, 1);
    }

    if (state.reloading && now >= state.reloadEndsAt) finishReload();

    state.recoil = Math.max(0, state.recoil - dt * 34);
    state.flash = Math.max(0, state.flash - dt * 9);

    if (state.messageTimer > 0) {
      state.messageTimer -= dt;
      if (state.messageTimer <= 0) ui.comboNotice.textContent = "";
    }

    updateHud();
  }

  function drawBackground() {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    const skyTop = state.weather === "storm" ? "#4b5d6c" : state.weather === "rain" ? "#6c8692" : state.weather === "fog" ? "#7f96a2" : "#7da0ad";
    const skyMid = state.weather === "storm" ? "#344552" : state.weather === "rain" ? "#536a72" : state.weather === "fog" ? "#647a83" : "#587783";
    g.addColorStop(0, skyTop);
    g.addColorStop(0.48, skyMid);
    g.addColorStop(0.49, "#243f42");
    g.addColorStop(1, "#081618");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMountain(0.32, "#49666a", 90, 0.11);
    drawMountain(0.46, "#304f50", 150, 0.17);
    drawMountain(0.58, "#173638", 210, 0.22);

    ctx.fillStyle = "#102a28";
    ctx.fillRect(0, canvas.height * 0.67, canvas.width, canvas.height * 0.33);

    for (let i = 0; i < 42; i++) {
      const x = (i * 151) % canvas.width;
      const y = canvas.height * 0.62 + ((i * 73) % 180);
      const h = 25 + ((i * 47) % 95);
      ctx.fillStyle = i % 3 === 0 ? "#112f2a" : "#0b241f";
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - h * 0.25, y + h);
      ctx.lineTo(x + h * 0.25, y + h);
      ctx.closePath();
      ctx.fill();
    }

    // Atmospheric haze
    const haze = ctx.createLinearGradient(0, canvas.height * 0.35, 0, canvas.height * 0.76);
    haze.addColorStop(0, state.weather === "storm" ? "rgba(225,242,244,0.09)" : "rgba(210,230,226,0.05)");
    haze.addColorStop(1, "rgba(210,230,226,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, canvas.height * 0.35, canvas.width, canvas.height * 0.4);

    if (state.weather === "fog") {
      ctx.fillStyle = `rgba(225, 235, 238, ${0.16 + state.weatherIntensity * 0.5})`;
      ctx.fillRect(0, canvas.height * 0.28, canvas.width, canvas.height * 0.3);
    }

    if (state.weather === "rain" || state.weather === "storm") {
      ctx.strokeStyle = state.weather === "storm" ? "rgba(205,225,232,0.28)" : "rgba(176,199,211,0.22)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 120; i++) {
        const x = (i * 83) % canvas.width;
        const y = (i * 29) % canvas.height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 8, y + 16);
        ctx.stroke();
      }
    }

    if (state.weather === "storm" && state.weatherFlash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${state.weatherFlash * 0.18})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);
    }
  }

  function drawMountain(baseRatio, color, amplitude, frequency) {
    const base = canvas.height * baseRatio;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(0, base);
    for (let x = 0; x <= canvas.width; x += 40) {
      const y = base - Math.sin(x * frequency * 0.05) * amplitude * 0.35
        - Math.abs(Math.sin(x * frequency * 0.023 + 1.7)) * amplitude;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();
  }

  function drawTargets() {
    for (const target of targets) {
      if (!target.active) continue;

      const bobY = Math.sin(target.bob) * 3;
      const s = target.size * target.depth;
      const x = target.x;
      const y = target.y + bobY;

      ctx.save();
      ctx.translate(x, y);

      if (target.isAncientBird) {
        ctx.save();
        ctx.scale(1.15, 1.15);
        ctx.strokeStyle = "#7b4dff";
        ctx.lineWidth = Math.max(3, s * 0.08);
        ctx.beginPath();
        ctx.arc(0, -s * 0.2, s * 0.42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#f7c948";
        ctx.beginPath();
        ctx.arc(0, -s * 0.2, s * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-s * 0.05, -s * 0.24, s * 0.05, 0, Math.PI * 2);
        ctx.arc(s * 0.05, -s * 0.24, s * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#d4ff44";
        ctx.beginPath();
        ctx.moveTo(-s * 0.22, -s * 0.04);
        ctx.quadraticCurveTo(-s * 0.5, -s * 0.2 + Math.sin(target.wingFlap) * 8, -s * 0.42, -s * 0.42);
        ctx.moveTo(s * 0.22, -s * 0.04);
        ctx.quadraticCurveTo(s * 0.5, -s * 0.2 + Math.sin(target.wingFlap + 0.6) * 8, s * 0.42, -s * 0.42);
        ctx.stroke();
        ctx.restore();
      }

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.beginPath();
      ctx.ellipse(0, s * 0.75, s * 0.55, s * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Target stand
      ctx.strokeStyle = "#1e2425";
      ctx.lineWidth = Math.max(3, s * 0.08);
      ctx.beginPath();
      ctx.moveTo(0, s * 0.28);
      ctx.lineTo(0, s * 0.86);
      ctx.moveTo(0, s * 0.7);
      ctx.lineTo(-s * 0.35, s * 0.98);
      ctx.moveTo(0, s * 0.7);
      ctx.lineTo(s * 0.35, s * 0.98);
      ctx.stroke();

      // Plate
      ctx.fillStyle = target.isCivilian ? "#e8f0f2" : "#4c595a";
      ctx.strokeStyle = target.isCivilian ? "#44c8ff" : "#d4564e";
      ctx.lineWidth = Math.max(4, s * 0.09);
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.52, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = target.isCivilian ? "#44c8ff" : "#d4564e";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f5f7ef";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.09, 0, Math.PI * 2);
      ctx.fill();

      if (target.hp > 1) {
        ctx.fillStyle = "#f1ff8a";
        ctx.font = `bold ${Math.max(12, s * 0.25)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("ARMOR", 0, -s * 0.72);
      }

      if (target.isCivilian) {
        ctx.fillStyle = "#e7fbff";
        ctx.font = `bold ${Math.max(12, s * 0.28)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("CIV", 0, -s * 0.72);
      }

      ctx.restore();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (const p of popups) {
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.font = "800 22px sans-serif";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 8;
      ctx.fillText(p.text, p.x, p.y);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }

  function drawScope() {
    const scopeRadius = state.zoom ? Math.min(canvas.width, canvas.height) * 0.43 : 70;
    const cx = mouse.x;
    const cy = mouse.y + state.recoil;

    if (state.zoom) {
      ctx.save();
      ctx.fillStyle = "rgba(0,0,0,0.88)";
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, canvas.height);
      ctx.arc(cx, cy, scopeRadius, 0, Math.PI * 2, true);
      ctx.fill("evenodd");
      ctx.restore();

      ctx.strokeStyle = "rgba(10,10,10,0.95)";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, scopeRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.strokeStyle = state.steady ? "#d4ff44" : "#e6f4ee";
    ctx.lineWidth = state.zoom ? 2 : 1.5;
    ctx.globalAlpha = 0.92;

    ctx.beginPath();
    ctx.arc(cx, cy, state.zoom ? 52 : 24, 0, Math.PI * 2);
    ctx.moveTo(cx - (state.zoom ? 180 : 55), cy);
    ctx.lineTo(cx - 10, cy);
    ctx.moveTo(cx + 10, cy);
    ctx.lineTo(cx + (state.zoom ? 180 : 55), cy);
    ctx.moveTo(cx, cy - (state.zoom ? 180 : 55));
    ctx.lineTo(cx, cy - 10);
    ctx.moveTo(cx, cy + 10);
    ctx.lineTo(cx, cy + (state.zoom ? 180 : 55));
    ctx.stroke();

    ctx.fillStyle = state.steady ? "#d4ff44" : "#e6f4ee";
    ctx.beginPath();
    ctx.arc(cx, cy, 2.6, 0, Math.PI * 2);
    ctx.fill();

    if (state.zoom) {
      ctx.font = "14px monospace";
      ctx.fillText("8×", cx + 64, cy + 18);
      ctx.fillText(state.steady ? "BREATH HELD" : "HOLD SHIFT TO STEADY", cx - 95, cy + scopeRadius - 22);
    }

    ctx.globalAlpha = 1;
  }

  function drawWeaponOverlay() {
    ctx.fillStyle = "rgba(3,7,8,0.72)";
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.62, canvas.height);
    ctx.lineTo(canvas.width * 0.72, canvas.height * 0.78);
    ctx.lineTo(canvas.width * 0.88, canvas.height * 0.78);
    ctx.lineTo(canvas.width, canvas.height * 0.91);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#182426";
    ctx.fillRect(canvas.width * 0.75, canvas.height * 0.82, canvas.width * 0.28, 22);
    ctx.fillStyle = "#0a0e0f";
    ctx.fillRect(canvas.width * 0.83, canvas.height * 0.79, canvas.width * 0.13, 18);

    if (state.flash > 0) {
      const fx = canvas.width * 0.75;
      const fy = canvas.height * 0.83;
      const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 70);
      grad.addColorStop(0, `rgba(255,245,160,${state.flash})`);
      grad.addColorStop(1, "rgba(255,120,20,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(fx, fy, 70, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawTargets();
    drawParticles();
    drawWeaponOverlay();
    drawScope();
  }

  function loop(now) {
    if (!state.running) return;
    const dt = Math.min(0.033, (now - state.lastFrame) / 1000);
    state.lastFrame = now;
    update(dt, now);
    draw();
    if (state.running) requestAnimationFrame(loop);
  }

  function canvasCoordinates(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener("mousemove", (event) => {
    const p = canvasCoordinates(event);
    mouse.x = p.x;
    mouse.y = p.y;
  });

  canvas.addEventListener("mousedown", (event) => {
    if (event.button === 0) fire();
    if (event.button === 2) state.zoom = true;
  });

  canvas.addEventListener("mouseup", (event) => {
    if (event.button === 2) state.zoom = false;
  });

  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  canvas.addEventListener("touchstart", (event) => {
    event.preventDefault();
    const touch = event.changedTouches[0];
    const p = canvasCoordinates(touch);
    mouse.x = p.x;
    mouse.y = p.y;
    fire();
  }, { passive: false });

  document.addEventListener("keydown", (event) => {
    if (event.code === "KeyR") beginReload();
    if (event.code === "KeyB") buyAmmo();
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") state.steady = true;
    if (event.code === "Space") state.zoom = true;
  });

  document.addEventListener("keyup", (event) => {
    if (event.code === "ShiftLeft" || event.code === "ShiftRight") state.steady = false;
    if (event.code === "Space") state.zoom = false;
  });

  ui.startBtn.addEventListener("click", resetGame);
  ui.restartBtn.addEventListener("click", resetGame);
  ui.buyAmmoBtn.addEventListener("click", buyAmmo);

  ui.fullscreenBtn.addEventListener("click", async () => {
    try {
      const wrap = document.getElementById("canvas-wrap");
      if (!document.fullscreenElement) {
        await wrap.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn("Fullscreen is not available:", error);
    }
  });

  updateMissionDisplay();
  updateShopDisplay();
  drawBackground();
  drawWeaponOverlay();
  drawScope();
})();
