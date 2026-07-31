const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");
const gameArea = document.getElementById("gameArea");
const targetLayer = document.getElementById("targetLayer");
const scope = document.getElementById("scope");
const shotFlash = document.getElementById("shotFlash");
const enemyHitFlash = document.getElementById("enemyHitFlash");

const scoreEl = document.getElementById("score");
const ammoEl = document.getElementById("ammo");
const timerEl = document.getElementById("timer");
const accuracyEl = document.getElementById("accuracy");
const threatStatusEl = document.getElementById("threatStatus");
const healthEl = document.getElementById("health");
const healthFillEl = document.getElementById("healthFill");
const rangeValue = document.getElementById("rangeValue");
const windValue = document.getElementById("windValue");
const difficultyValueEl = document.getElementById("difficultyValue");
const ammoValueEl = document.getElementById("ammoValue");
const timeValueEl = document.getElementById("timeValue");
const difficultyButtons = document.querySelectorAll(".difficulty-btn");

const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const reloadBtn = document.getElementById("reloadBtn");
const backBtn = document.getElementById("backBtn");
const abortBtn = document.getElementById("abortBtn");
const soundBtn = document.getElementById("soundBtn");

let score = 0;
let ammo = 8;
let timeLeft = 60;
let shots = 0;
let hostileHits = 0;
let civilianHits = 0;
let soundOn = true;
let gameActive = false;
let spawnTimer = null;
let countdownTimer = null;
let alienFireTimer = null;
let targets = new Set();
let windowSlots = [];
let hardModeActive = false;
let playerHealth = 100;
let scopeX = 0;
let scopeY = 0;
let activePointerId = null;

const DIFFICULTIES = {
  easy: {
    label: "Easy",
    ammo: 10,
    time: 70,
    spawnInterval: 1150,
    maxTargets: 4,
    hostileChance: 0.67,
    hardModeStart: 20,
    decoyChanceHard: 0.18,
    normalVisibleMin: 2200,
    normalVisibleMax: 3900,
    hardVisibleMin: 900,
    hardVisibleMax: 1700,
    headshotScore: 220,
    bodyScore: 140,
    civilianPenalty: 380,
    missPenalty: 15,
    winHits: 6
  },
  normal: {
    label: "Normal",
    ammo: 8,
    time: 60,
    spawnInterval: 900,
    maxTargets: 6,
    hostileChance: 0.73,
    hardModeStart: 30,
    decoyChanceHard: 0.38,
    normalVisibleMin: 1800,
    normalVisibleMax: 3500,
    hardVisibleMin: 650,
    hardVisibleMax: 1550,
    headshotScore: 250,
    bodyScore: 150,
    civilianPenalty: 500,
    missPenalty: 25,
    winHits: 8
  },
  hard: {
    label: "Hard",
    ammo: 7,
    time: 55,
    spawnInterval: 720,
    maxTargets: 7,
    hostileChance: 0.76,
    hardModeStart: 40,
    decoyChanceHard: 0.55,
    normalVisibleMin: 1300,
    normalVisibleMax: 2500,
    hardVisibleMin: 500,
    hardVisibleMax: 1100,
    headshotScore: 290,
    bodyScore: 170,
    civilianPenalty: 620,
    missPenalty: 35,
    winHits: 10
  },
  nightmare: {
    label: "Nightmare",
    ammo: 7,
    time: 50,
    spawnInterval: 650,
    maxTargets: 8,
    hostileChance: 0.79,
    hardModeStart: 45,
    decoyChanceHard: 0.62,
    normalVisibleMin: 1050,
    normalVisibleMax: 2100,
    hardVisibleMin: 450,
    hardVisibleMax: 980,
    headshotScore: 320,
    bodyScore: 185,
    civilianPenalty: 700,
    missPenalty: 40,
    winHits: 11,
    alienCounterfire: true,
    counterfireInterval: 780,
    counterfireChance: 0.62,
    boltDamage: 18
  }
};

let selectedDifficulty = "normal";
let currentDifficulty = DIFFICULTIES[selectedDifficulty];

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playTone(frequency, duration, type = "sine", volume = 0.05) {
  if (!soundOn) return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = volume;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
  oscillator.stop(audioContext.currentTime + duration);
}

function playSniperShot() {
  if (!soundOn) return;

  const now = audioContext.currentTime;

  const crack = audioContext.createOscillator();
  const crackGain = audioContext.createGain();
  crack.type = "sawtooth";
  crack.frequency.setValueAtTime(420, now);
  crack.frequency.exponentialRampToValueAtTime(120, now + 0.09);
  crackGain.gain.setValueAtTime(0.16, now);
  crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
  crack.connect(crackGain);
  crackGain.connect(audioContext.destination);
  crack.start(now);
  crack.stop(now + 0.12);

  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.25, audioContext.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }

  const noise = audioContext.createBufferSource();
  const noiseFilter = audioContext.createBiquadFilter();
  const noiseGain = audioContext.createGain();
  noise.buffer = noiseBuffer;
  noiseFilter.type = "highpass";
  noiseFilter.frequency.value = 650;
  noiseGain.gain.setValueAtTime(0.18, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioContext.destination);
  noise.start(now);
  noise.stop(now + 0.17);

  const tail = audioContext.createOscillator();
  const tailGain = audioContext.createGain();
  tail.type = "triangle";
  tail.frequency.setValueAtTime(95, now + 0.02);
  tail.frequency.exponentialRampToValueAtTime(48, now + 0.38);
  tailGain.gain.setValueAtTime(0.04, now + 0.02);
  tailGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
  tail.connect(tailGain);
  tailGain.connect(audioContext.destination);
  tail.start(now + 0.02);
  tail.stop(now + 0.42);
}

function updateHUD() {
  scoreEl.textContent = score;
  ammoEl.textContent = ammo;
  timerEl.textContent = timeLeft;
  healthEl.textContent = playerHealth;

  const clampedHealth = Math.max(0, Math.min(100, playerHealth));
  healthFillEl.style.width = `${clampedHealth}%`;
  healthFillEl.classList.toggle("warn", clampedHealth <= 55 && clampedHealth > 25);
  healthFillEl.classList.toggle("critical", clampedHealth <= 25);

  const accuracy = shots === 0 ? 100 : Math.round(((hostileHits + civilianHits) / shots) * 100);
  accuracyEl.textContent = `${accuracy}%`;
}

function showEnemyHitFlash() {
  enemyHitFlash.classList.remove("active");
  void enemyHitFlash.offsetWidth;
  enemyHitFlash.classList.add("active");
}

function fireAlienBolt() {
  if (!gameActive || !currentDifficulty.alienCounterfire) return;

  const hostileTargets = [...targets].filter(target => target.dataset.type === "hostile");
  if (hostileTargets.length === 0) return;
  if (Math.random() > currentDifficulty.counterfireChance) return;

  const shooter = hostileTargets[Math.floor(Math.random() * hostileTargets.length)];
  const areaRect = gameArea.getBoundingClientRect();
  const shooterRect = shooter.getBoundingClientRect();
  const startX = shooterRect.left - areaRect.left + shooterRect.width / 2;
  const startY = shooterRect.top - areaRect.top + shooterRect.height * 0.3;
  const aimedX = scopeX;
  const aimedY = scopeY;
  const duration = 260 + Math.random() * 240;

  const bolt = document.createElement("div");
  bolt.className = "enemy-bolt";
  bolt.style.left = `${startX}px`;
  bolt.style.top = `${startY}px`;
  bolt.style.setProperty("--dx", `${aimedX - startX}px`);
  bolt.style.setProperty("--dy", `${aimedY - startY}px`);
  bolt.style.animationDuration = `${duration}ms`;
  gameArea.appendChild(bolt);

  playTone(290 + Math.random() * 40, 0.08, "sawtooth", 0.028);

  setTimeout(() => {
    bolt.remove();
    if (!gameActive) return;

    const evadeDistance = Math.hypot(scopeX - aimedX, scopeY - aimedY);
    if (evadeDistance < 45) {
      playerHealth = Math.max(0, playerHealth - currentDifficulty.boltDamage);
      showEnemyHitFlash();
      playTone(95, 0.2, "square", 0.045);

      if (playerHealth <= 0) {
        endMission(false, true);
        return;
      }
    }

    updateHUD();
  }, duration);
}

function applyDifficulty(level) {
  if (!DIFFICULTIES[level]) return;

  selectedDifficulty = level;
  currentDifficulty = DIFFICULTIES[level];

  difficultyValueEl.textContent = currentDifficulty.label;
  ammoValueEl.textContent = `${currentDifficulty.ammo} rounds`;
  timeValueEl.textContent = `${currentDifficulty.time} seconds`;

  difficultyButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.difficulty === level);
  });
}

function showDecoyPeek() {
  if (windowSlots.length === 0) return;

  const freeSlots = windowSlots.filter(slot => !slot.dataset.occupied);
  if (freeSlots.length === 0) return;

  const slot = freeSlots[Math.floor(Math.random() * freeSlots.length)];
  const decoy = document.createElement("div");
  decoy.className = "decoy-peek";
  slot.appendChild(decoy);

  setTimeout(() => decoy.remove(), 280 + Math.random() * 260);
}

function activateHardMode() {
  if (hardModeActive) return;

  hardModeActive = true;
  threatStatusEl.textContent = currentDifficulty.label === "Nightmare"
    ? "Counterfire"
    : (currentDifficulty.label === "Hard" ? "Critical" : "Hive Alert");
  playTone(710, 0.12, "triangle", 0.045);
  setTimeout(() => playTone(870, 0.1, "triangle", 0.045), 120);
}

function releaseSlot(target) {
  const slotId = target.dataset.slotId;
  if (!slotId) return;

  const slot = windowSlots.find(item => item.dataset.slotId === slotId);
  if (slot) {
    delete slot.dataset.occupied;
  }
}

function clearTargets() {
  targets.forEach(target => {
    releaseSlot(target);
    target.remove();
  });
  targets.clear();
}

function buildWindowSlots() {
  targetLayer.innerHTML = "";
  windowSlots = [];

  const areaRect = gameArea.getBoundingClientRect();
  const buildingLayouts = [
    { left: 0.08, width: 0.10, top: 0.53, height: 0.31, rows: 4, cols: 2 },
    { left: 0.24, width: 0.15, top: 0.50, height: 0.35, rows: 4, cols: 3 },
    { left: 0.48, width: 0.09, top: 0.56, height: 0.28, rows: 3, cols: 2 },
    { left: 0.63, width: 0.13, top: 0.50, height: 0.35, rows: 4, cols: 3 },
    { left: 0.84, width: 0.10, top: 0.52, height: 0.32, rows: 4, cols: 2 }
  ];

  let slotId = 0;

  buildingLayouts.forEach(layout => {
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.cols; col++) {
        const slot = document.createElement("div");
        const centerX = layout.left + ((col + 0.5) * layout.width) / layout.cols;
        const centerY = layout.top + ((row + 0.5) * layout.height) / layout.rows;
        const perspectiveScale = 0.72 + ((centerY - 0.5) / 0.35) * 0.32;
        const cellWidth = (areaRect.width * layout.width) / layout.cols;
        const width = Math.max(20, Math.min(42, cellWidth * 0.38 * perspectiveScale));
        const height = Math.round(width * 1.25);

        slot.className = "window-slot";
        slot.dataset.slotId = String(slotId++);
        slot.style.left = `${centerX * 100}%`;
        slot.style.top = `${centerY * 100}%`;
        slot.style.width = `${Math.round(width)}px`;
        slot.style.height = `${height}px`;
        slot.dataset.range = String(Math.round(220 + (centerY - 0.45) * 700));

        targetLayer.appendChild(slot);
        windowSlots.push(slot);
      }
    }
  });
}

function resetGame() {
  score = 0;
  ammo = currentDifficulty.ammo;
  timeLeft = currentDifficulty.time;
  shots = 0;
  hostileHits = 0;
  civilianHits = 0;
  playerHealth = 100;
  gameActive = true;
  hardModeActive = false;
  threatStatusEl.textContent = currentDifficulty.label === "Nightmare"
    ? "Hostile"
    : (currentDifficulty.label === "Hard" ? "Elevated" : "Low");

  clearTargets();
  buildWindowSlots();

  const rect = gameArea.getBoundingClientRect();
  scopeX = rect.width / 2;
  scopeY = rect.height * 0.58;

  updateHUD();
}

function startMission() {
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  currentDifficulty = DIFFICULTIES[selectedDifficulty];

  resetGame();

  startScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");

  spawnTarget();
  spawnTimer = setInterval(spawnTarget, currentDifficulty.spawnInterval);

  if (currentDifficulty.alienCounterfire) {
    alienFireTimer = setInterval(fireAlienBolt, currentDifficulty.counterfireInterval);
  }

  countdownTimer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = timeLeft;

    if (timeLeft <= currentDifficulty.hardModeStart) {
      activateHardMode();
    }

    if (timeLeft <= 0) {
      endMission();
    }
  }, 1000);
}

function endMission(aborted = false, sniperDown = false) {
  if (!gameActive) return;

  gameActive = false;
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  clearInterval(alienFireTimer);
  alienFireTimer = null;

  clearTargets();

  gameScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  const accuracy = shots === 0 ? 0 : Math.round(((hostileHits + civilianHits) / shots) * 100);

  document.getElementById("finalScore").textContent = score;
  document.getElementById("finalAccuracy").textContent = `${accuracy}%`;
  document.getElementById("finalHits").textContent = hostileHits;
  document.getElementById("civilianHits").textContent = civilianHits;

  const badge = document.getElementById("resultBadge");
  const title = document.getElementById("resultTitle");

  if (aborted) {
    badge.textContent = "MISSION ABORTED";
    badge.style.background = "#e74c3c";
    title.textContent = "Operation terminated.";
  } else if (sniperDown) {
    badge.textContent = "MISSION FAILED";
    badge.style.background = "#e74c3c";
    title.textContent = "You were neutralized by alien counterfire.";
  } else if (civilianHits > 0) {
    badge.textContent = "MISSION FAILED";
    badge.style.background = "#e74c3c";
    title.textContent = "Civilian casualties detected.";
  } else if (hostileHits >= currentDifficulty.winHits) {
    badge.textContent = "MISSION COMPLETE";
    badge.style.background = "#38d996";
    title.textContent = `${currentDifficulty.label} protocol cleared.`;
  } else {
    badge.textContent = "MISSION INCOMPLETE";
    badge.style.background = "#ffb000";
    title.textContent = "Alien infiltrators escaped.";
  }
}

function backToMenu() {
  clearInterval(spawnTimer);
  clearInterval(countdownTimer);
  clearInterval(alienFireTimer);
  alienFireTimer = null;

  gameActive = false;
  clearTargets();

  gameScreen.classList.add("hidden");
  resultScreen.classList.add("hidden");
  startScreen.classList.remove("hidden");

  reloadBtn.disabled = false;
  reloadBtn.textContent = "Reload";
}

function spawnTarget() {
  if (!gameActive || targets.size >= currentDifficulty.maxTargets || windowSlots.length === 0) return;

  if (hardModeActive && Math.random() < currentDifficulty.decoyChanceHard) {
    showDecoyPeek();
  }

  const freeSlots = windowSlots.filter(slot => !slot.dataset.occupied);
  if (freeSlots.length === 0) return;

  const slot = freeSlots[Math.floor(Math.random() * freeSlots.length)];
  slot.dataset.occupied = "1";

  const target = document.createElement("div");
  const isHostile = Math.random() < currentDifficulty.hostileChance;

  target.className = `target ${isHostile ? "hostile" : "civilian"}`;
  target.dataset.type = isHostile ? "hostile" : "civilian";
  target.dataset.slotId = slot.dataset.slotId;
  target.dataset.range = slot.dataset.range;

  const frameScale = 0.9 + Math.random() * 0.28;
  target.style.scale = frameScale.toFixed(2);

  slot.appendChild(target);
  targets.add(target);

  const visibleDuration = hardModeActive
    ? currentDifficulty.hardVisibleMin + Math.random() * (currentDifficulty.hardVisibleMax - currentDifficulty.hardVisibleMin)
    : currentDifficulty.normalVisibleMin + Math.random() * (currentDifficulty.normalVisibleMax - currentDifficulty.normalVisibleMin);

  setTimeout(() => {
    if (targets.has(target)) {
      releaseSlot(target);
      targets.delete(target);
      target.remove();
    }
  }, visibleDuration);
}

function shoot(clientX, clientY) {
  if (!gameActive) return;

  if (ammo <= 0) {
    playTone(120, 0.12, "square", 0.035);
    return;
  }

  ammo--;
  shots++;
  playSniperShot();

  shotFlash.classList.remove("active");
  void shotFlash.offsetWidth;
  shotFlash.classList.add("active");

  const rect = gameArea.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  const hitTarget = [...targets].find(target => {
    const tRect = target.getBoundingClientRect();
    const left = tRect.left - rect.left;
    const right = tRect.right - rect.left;
    const top = tRect.top - rect.top;
    const bottom = tRect.bottom - rect.top;

    return x >= left && x <= right && y >= top && y <= bottom;
  });

  if (hitTarget) {
    const type = hitTarget.dataset.type;
    const targetRect = hitTarget.getBoundingClientRect();
    const relativeY = clientY - targetRect.top;
    const headshot = relativeY < targetRect.height * 0.34;

    hitTarget.classList.add("hit");

    if (type === "hostile") {
      hostileHits++;
      score += headshot ? currentDifficulty.headshotScore : currentDifficulty.bodyScore;
      playTone(headshot ? 920 : 640, 0.12, "triangle", 0.06);
    } else {
      civilianHits++;
      score -= currentDifficulty.civilianPenalty;
      playTone(160, 0.35, "sawtooth", 0.07);
    }

    releaseSlot(hitTarget);
    targets.delete(hitTarget);
    setTimeout(() => hitTarget.remove(), 80);
  } else {
    score = Math.max(0, score - currentDifficulty.missPenalty);
  }

  updateHUD();

  if (ammo === 0) {
    reloadBtn.textContent = "Reload Required";
  }
}

function updateScopeFromEvent(event) {
  const rect = gameArea.getBoundingClientRect();
  scopeX = event.clientX - rect.left;
  scopeY = event.clientY - rect.top;
  scope.style.left = `${scopeX}px`;
  scope.style.top = `${scopeY}px`;

  rangeValue.textContent = Math.round(300 + (scopeY / rect.height) * 420);
  windValue.textContent = (1.2 + (scopeX / rect.width) * 3.6).toFixed(1);
}

function reload() {
  if (!gameActive || ammo === currentDifficulty.ammo) return;

  playTone(260, 0.07, "square", 0.025);
  reloadBtn.disabled = true;
  reloadBtn.textContent = "Reloading...";

  setTimeout(() => {
    ammo = currentDifficulty.ammo;
    reloadBtn.disabled = false;
    reloadBtn.textContent = "Reload";
    updateHUD();
    playTone(420, 0.08, "square", 0.025);
  }, 1100);
}

gameArea.addEventListener("pointermove", event => {
  if (!event.isPrimary) return;
  if (event.pointerType === "touch" && activePointerId !== event.pointerId) return;

  updateScopeFromEvent(event);
});

gameArea.addEventListener("pointerdown", event => {
  if (!event.isPrimary) return;

  updateScopeFromEvent(event);

  if (event.pointerType === "touch") {
    activePointerId = event.pointerId;
    gameArea.setPointerCapture(event.pointerId);
    return;
  }

  shoot(event.clientX, event.clientY);
});

gameArea.addEventListener("pointerup", event => {
  if (!event.isPrimary) return;

  if (event.pointerType === "touch" && activePointerId === event.pointerId) {
    updateScopeFromEvent(event);
    shoot(event.clientX, event.clientY);
    activePointerId = null;
  }
});

gameArea.addEventListener("pointercancel", event => {
  if (event.pointerType === "touch" && activePointerId === event.pointerId) {
    activePointerId = null;
  }
});

startBtn.addEventListener("click", startMission);
retryBtn.addEventListener("click", startMission);
reloadBtn.addEventListener("click", reload);
backBtn.addEventListener("click", backToMenu);
abortBtn.addEventListener("click", () => endMission(true));

difficultyButtons.forEach(button => {
  button.addEventListener("click", () => {
    applyDifficulty(button.dataset.difficulty);
  });
});

soundBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  soundBtn.textContent = `Sound: ${soundOn ? "ON" : "OFF"}`;
});

window.addEventListener("resize", () => {
  clearTargets();
  buildWindowSlots();
});

applyDifficulty(selectedDifficulty);
