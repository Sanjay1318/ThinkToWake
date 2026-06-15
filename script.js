/* ============================================================
   ThinkToWake — script.js v2.0
   ============================================================ */

/* ==================== SETTINGS ==================== */
const APP_VERSION = "3.3";
const SETTINGS_KEY = "ttw_settings";

const defaultSettings = {
  sound: "assets/alarm.mp3",
  soundName: "Classic",
  customSoundBase64: "",
  customSoundName: "",
  vibrateDefault: true,
  difficulty: "medium",
  timerSound: true,
  notifications: false,
  theme: "forest",
  autoTheme: false
};

let appSettings = { ...defaultSettings };
const colorSchemeMedia = window.matchMedia("(prefers-color-scheme: dark)");

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    if (saved) appSettings = { ...defaultSettings, ...saved };
  } catch { appSettings = { ...defaultSettings }; }

  if (appSettings.autoTheme) {
    applyThemeFromSystem();
    colorSchemeMedia.addEventListener("change", applyThemeFromSystem);
  } else {
    applyTheme(appSettings.theme);
  }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
}

function applyThemeFromSystem() {
  document.body.dataset.theme = colorSchemeMedia.matches ? "night" : "forest";
}

/* ==================== INITIALIZATION ==================== */
document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  loadAlarms();
  renderAlarms();
  initTimerDisplay();
  initSettingsUI();
  startAlarmChecker();
  // sync difficulty buttons with saved setting
  document.querySelectorAll(".challenge-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.difficulty === appSettings.difficulty);
  });
  currentDifficulty = appSettings.difficulty;
  // init sprint best display
  document.getElementById("sprintBest").textContent = parseInt(localStorage.getItem("mathSprintBest")) || 0;

  // ── Register Service Worker (PWA offline support) ──────────────
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js")
      .then(reg => {
        console.log("SW registered, scope:", reg.scope);
        if (reg.waiting) {
          showToast("New version ready. Refresh to update.", "info", 5000);
        }
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              showToast("Update ready. Reload to apply the newest version.", "info", 6000);
            }
          });
        });
      })
      .catch(err => console.warn("SW registration failed:", err));
  }
});

/* ==================== TOAST ==================== */
function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icons = { success: "✓", error: "✕", info: "ℹ", warning: "⚠" };
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-message">${message}</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add("hiding"); setTimeout(() => toast.remove(), 300); }, duration);
}

function sendNotification(title, body) {
  if (!appSettings.notifications || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: "assets/icons/icon-192.png"
    });
  } catch (e) {
    console.warn("Notification failed", e);
  }
}

/* ==================== ALARM DATA ==================== */
const ALARMS_KEY = "ttw_alarms";
let alarms = [];
let editingAlarmId = null;

function loadAlarms() {
  try { alarms = JSON.parse(localStorage.getItem(ALARMS_KEY)) || []; } catch { alarms = []; }
}
function saveAlarms() { localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms)); }
function generateId() { return Date.now() + Math.floor(Math.random() * 1000); }

/* ==================== ALARM LIST ==================== */
const DAY_LABELS = { mon:"Mon", tue:"Tue", wed:"Wed", thu:"Thu", fri:"Fri", sat:"Sat", sun:"Sun" };

function getNextAlarmInfo(list = alarms) {
  const activeAlarms = list.filter(a => a.active);
  if (!activeAlarms.length) return null;

  const now = new Date();
  let soonest = null;
  let soonestMins = Infinity;

  activeAlarms.forEach(alarm => {
    const [h, m] = alarm.time.split(":").map(Number);
    let target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const mins = Math.max(0, Math.round((target - now) / 60000));
    if (mins < soonestMins) {
      soonestMins = mins;
      soonest = alarm;
    }
  });

  if (!soonest) return null;
  const hours = Math.floor(soonestMins / 60);
  const minutes = soonestMins % 60;
  const inLabel = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return { alarm: soonest, minutes: soonestMins, label: inLabel };
}

function updateAlarmOverview() {
  const nextEl = document.getElementById("nextAlarmSummary");
  const countEl = document.getElementById("activeAlarmCount");
  if (!nextEl || !countEl) return;

  const activeCount = alarms.filter(a => a.active).length;
  const next = getNextAlarmInfo();
  countEl.textContent = activeCount;
  nextEl.textContent = next ? `${next.alarm.time} (${next.label})` : "None scheduled";
}

function renderAlarms() {
  const list  = document.getElementById("alarmList");
  const noMsg = document.getElementById("noAlarmsMsg");
  updateAlarmOverview();
  if (!alarms.length) { list.innerHTML = ""; noMsg.classList.remove("hidden"); return; }
  noMsg.classList.add("hidden");

  const sorted = [...alarms].sort((a, b) => a.time.localeCompare(b.time));

  // Next alarm badge
  const activeAlarms = sorted.filter(a => a.active);
  let badgeHtml = "";
  if (activeAlarms.length) {
    const next = getNextAlarmInfo(sorted);
    if (next) {
      badgeHtml = `<div class="next-alarm-badge">⏰ <strong>${next.alarm.name}</strong> rings in ${next.label}</div>`;
    }
  }

  list.innerHTML = badgeHtml + sorted.map(alarm => {
    const repeatLabel = alarm.repeat === "once" ? "Once"
      : alarm.repeat === "everyday" ? "Every day"
      : (alarm.days || []).map(d => DAY_LABELS[d]).join(" · ");
    const soundLabel = alarm.soundName || "Classic";
    return `
      <div class="alarm-card ${alarm.active ? "" : "alarm-card--off"}" data-id="${alarm.id}">
        <div class="alarm-card-main">
          <div class="alarm-card-info">
            <p class="alarm-card-name">${alarm.name || "Alarm"}</p>
            <p class="alarm-card-time">${alarm.time}</p>
            <p class="alarm-card-meta">${repeatLabel} · ${soundLabel}${alarm.vibrate ? " · Vibrate" : ""}</p>
            ${alarm.reminder ? `<p class="alarm-card-reminder">${alarm.reminder}</p>` : ""}
          </div>
          <label class="toggle-switch">
            <input type="checkbox" class="alarm-toggle" data-id="${alarm.id}" ${alarm.active ? "checked" : ""}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="alarm-card-actions">
          <button class="alarm-edit-btn secondary" data-id="${alarm.id}">Edit</button>
          <button class="alarm-delete-btn secondary" data-id="${alarm.id}">Delete</button>
        </div>
      </div>`;
  }).join("");

  list.querySelectorAll(".alarm-toggle").forEach(cb =>
    cb.addEventListener("change", () => toggleAlarm(parseInt(cb.dataset.id))));
  list.querySelectorAll(".alarm-edit-btn").forEach(btn =>
    btn.addEventListener("click", () => openEditForm(parseInt(btn.dataset.id))));
  list.querySelectorAll(".alarm-delete-btn").forEach(btn =>
    btn.addEventListener("click", () => deleteAlarm(parseInt(btn.dataset.id))));
}

function toggleAlarm(id) {
  const a = alarms.find(x => x.id === id); if (!a) return;
  a.active = !a.active; saveAlarms(); renderAlarms();
  showToast(a.active ? `"${a.name}" on` : `"${a.name}" off`, "info");
}

function deleteAlarm(id) {
  const a = alarms.find(x => x.id === id); if (!a) return;
  if (!confirm(`Delete "${a.name}"?`)) return;
  alarms = alarms.filter(x => x.id !== id); saveAlarms(); renderAlarms();
  showToast(`"${a.name}" deleted`, "info");
}

/* ==================== ALARM FORM ==================== */
const alarmListScreen      = document.getElementById("alarmListScreen");
const alarmFormScreen      = document.getElementById("alarmFormScreen");
const alarmScreen          = document.getElementById("alarmScreen");
const alarmCompletedScreen = document.getElementById("alarmCompletedScreen");

document.getElementById("addAlarmBtn").addEventListener("click", openAddForm);
document.getElementById("backToListBtn").addEventListener("click", showAlarmList);

document.getElementById("repeatOption").addEventListener("change", function () {
  document.getElementById("customDaysSection").classList.toggle("hidden", this.value !== "custom");
});
document.querySelectorAll(".repeat-preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const days = btn.dataset.days.split(",");
    document.getElementById("repeatOption").value = "custom";
    document.getElementById("customDaysSection").classList.remove("hidden");
    document.querySelectorAll(".day-btn").forEach(b => b.classList.toggle("active", days.includes(b.dataset.day)));
  });
});
document.getElementById("alarmSoundSelect").addEventListener("change", function () {
  document.getElementById("customSoundSection").classList.toggle("hidden", this.value !== "custom");
});
document.querySelectorAll(".day-btn").forEach(btn =>
  btn.addEventListener("click", () => btn.classList.toggle("active")));
document.getElementById("customSoundFile").addEventListener("change", function () {
  const file = this.files[0]; if (!file) return;
  document.getElementById("customSoundName").textContent = file.name;
  const reader = new FileReader();
  reader.onload = e => { this.dataset.base64 = e.target.result; this.dataset.filename = file.name; };
  reader.readAsDataURL(file);
});
document.getElementById("alarmSoundPreviewBtn").addEventListener("click", () => {
  const select = document.getElementById("alarmSoundSelect");
  let src = select.value;
  if (src === "custom") {
    const cf = document.getElementById("customSoundFile");
    src = cf.dataset.base64 || "";
    if (!src) { showToast("Upload a custom sound to preview.", "warning"); return; }
  }
  const previewAudio = new Audio(src);
  previewAudio.play().catch(() => showToast("Unable to play preview.", "error"));
});

function openAddForm() {
  editingAlarmId = null;
  document.getElementById("formTitle").textContent = "New Alarm";
  document.getElementById("alarmName").value = "";
  document.getElementById("alarmTimeInput").value = "";
  document.getElementById("repeatOption").value = "once";
  document.getElementById("customDaysSection").classList.add("hidden");
  document.querySelectorAll(".day-btn").forEach(b => b.classList.remove("active"));
  document.getElementById("alarmReminder").value = "";
  // default to settings sound
  document.getElementById("alarmSoundSelect").value = appSettings.customSoundBase64 ? "custom" : appSettings.sound;
  document.getElementById("customSoundSection").classList.toggle("hidden", !appSettings.customSoundBase64);
  document.getElementById("customSoundFile").dataset.base64 = appSettings.customSoundBase64 || "";
  document.getElementById("customSoundFile").dataset.filename = appSettings.customSoundName || "";
  document.getElementById("customSoundName").textContent = appSettings.customSoundName || "";
  document.getElementById("vibrateToggle").checked = appSettings.vibrateDefault;
  alarmListScreen.classList.add("hidden");
  alarmFormScreen.classList.remove("hidden");
}

function openEditForm(id) {
  const alarm = alarms.find(a => a.id === id); if (!alarm) return;
  editingAlarmId = id;
  document.getElementById("formTitle").textContent = "Edit Alarm";
  document.getElementById("alarmName").value = alarm.name || "";
  document.getElementById("alarmTimeInput").value = alarm.time || "";
  document.getElementById("repeatOption").value = alarm.repeat || "once";
  document.getElementById("customDaysSection").classList.toggle("hidden", alarm.repeat !== "custom");
  document.querySelectorAll(".day-btn").forEach(b =>
    b.classList.toggle("active", (alarm.days || []).includes(b.dataset.day)));
  document.getElementById("alarmReminder").value = alarm.reminder || "";
  document.getElementById("vibrateToggle").checked = alarm.vibrate !== false;
  const soundVal = alarm.customSoundBase64 ? "custom" : (alarm.sound || "assets/alarm.mp3");
  document.getElementById("alarmSoundSelect").value = soundVal;
  document.getElementById("customSoundSection").classList.toggle("hidden", soundVal !== "custom");
  document.getElementById("customSoundFile").dataset.base64 = alarm.customSoundBase64 || "";
  document.getElementById("customSoundFile").dataset.filename = alarm.customSoundName || "";
  document.getElementById("customSoundName").textContent = alarm.customSoundName || "";
  alarmListScreen.classList.add("hidden");
  alarmFormScreen.classList.remove("hidden");
}

function showAlarmList() {
  alarmFormScreen.classList.add("hidden");
  alarmListScreen.classList.remove("hidden");
}

document.getElementById("saveAlarmBtn").addEventListener("click", () => {
  const name    = document.getElementById("alarmName").value.trim() || "Alarm";
  const time    = document.getElementById("alarmTimeInput").value;
  const repeat  = document.getElementById("repeatOption").value;
  const days    = [...document.querySelectorAll(".day-btn.active")].map(b => b.dataset.day);
  const reminder = document.getElementById("alarmReminder").value.trim();
  const soundSel = document.getElementById("alarmSoundSelect").value;
  const vibrate  = document.getElementById("vibrateToggle").checked;
  const cfEl     = document.getElementById("customSoundFile");
  const customB64 = cfEl.dataset.base64 || "";
  const customFn  = cfEl.dataset.filename || "";

  if (!time) { showToast("Please set a time.", "warning"); return; }
  if (repeat === "custom" && !days.length) { showToast("Select at least one day.", "warning"); return; }
  if (soundSel === "custom" && !customB64) { showToast("Please upload a sound file.", "warning"); return; }

  const soundSrc  = soundSel === "custom" ? customB64 : soundSel;
  const soundName = soundSel === "custom" ? (customFn || "Custom")
    : { "assets/alarm.mp3": "Classic", "assets/sounds/digital.mp3": "Digital", "assets/sounds/bell.mp3": "Bell" }[soundSel] || soundSel;

  if (editingAlarmId !== null) {
    const alarm = alarms.find(a => a.id === editingAlarmId);
    if (alarm) Object.assign(alarm, { name, time, repeat, days, reminder, sound: soundSrc, soundName, customSoundBase64: soundSel === "custom" ? customB64 : "", customSoundName: soundSel === "custom" ? customFn : "", vibrate });
    showToast(`"${name}" updated`, "success");
  } else {
    alarms.push({ id: generateId(), name, time, repeat, days, reminder, sound: soundSrc, soundName, customSoundBase64: soundSel === "custom" ? customB64 : "", customSoundName: soundSel === "custom" ? customFn : "", vibrate, active: true });
    showToast(`"${name}" set for ${time}`, "success");
  }
  saveAlarms(); renderAlarms(); showAlarmList();
});

document.querySelectorAll(".quick-alarm-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const offset = parseInt(btn.dataset.offsetMinutes, 10);
    if (!offset) return;

    const target = new Date(Date.now() + offset * 60000);
    const time = `${String(target.getHours()).padStart(2, "0")}:${String(target.getMinutes()).padStart(2, "0")}`;
    const soundName = appSettings.customSoundName || appSettings.soundName || "Classic";
    alarms.push({
      id: generateId(),
      name: `${offset}-minute alarm`,
      time,
      repeat: "once",
      days: [],
      reminder: "",
      sound: appSettings.customSoundBase64 || appSettings.sound || "assets/alarm.mp3",
      soundName,
      customSoundBase64: appSettings.customSoundBase64 || "",
      customSoundName: appSettings.customSoundName || "",
      vibrate: appSettings.vibrateDefault,
      active: true
    });
    saveAlarms();
    renderAlarms();
    showToast(`Quick alarm set for ${time}`, "success");
  });
});

/* ==================== ALARM CHECKER ==================== */
let alarmActive       = false;
let currentAlarm      = null;
let timerSoundPlaying = false; // declared here so triggerAlarm can reference it safely

// _firedKeys stores "alarmId:YYYY-MM-DD" strings so each alarm fires at most once per day
// regardless of how many times checkAlarms() runs during that minute.
const _firedKeys = new Set();

function _todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function startAlarmChecker() {
  // Run every second; also clear stale fired-keys at midnight
  setInterval(checkAlarms, 1000);
  setInterval(() => {
    // Prune keys from previous days to keep the Set lean
    const today = _todayStr();
    _firedKeys.forEach(k => { if (!k.endsWith(today)) _firedKeys.delete(k); });
  }, 60_000);
}

function checkAlarms() {
  if (alarmActive) return;
  const now   = new Date();
  const hhmm  = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  const today = _todayStr();
  const dow   = ["sun","mon","tue","wed","thu","fri","sat"][now.getDay()];

  for (const alarm of alarms) {
    if (!alarm.active || alarm.time !== hhmm) continue;

    // Build a unique fire-key: alarmId + calendar date
    const key = `${alarm.id}:${today}`;
    if (_firedKeys.has(key)) continue;           // already fired today

    const shouldFire =
      alarm.repeat === "once"     ||
      alarm.repeat === "everyday" ||
      (alarm.repeat === "custom" && (alarm.days || []).includes(dow));

    if (shouldFire) {
      _firedKeys.add(key);
      triggerAlarm(alarm);
      return;
    }
  }
}

/* ==================== QUESTION STATE ==================== */
let isLocked           = false;
let lockSeconds        = 10;
let lockInterval       = null;
let totalQuestions     = 3;
let currentQuestionIndex = 0;
let correctAnswers     = 0;
let askedQuestionHashes = [];
let alarmStartTime     = null;
let totalAttempts      = 0;
let currentQuestion    = null;

const difficultySettings = {
  easy:   { questions: 2, lockTime: 5,  showCategory: true  },
  medium: { questions: 3, lockTime: 10, showCategory: true  },
  hard:   { questions: 5, lockTime: 15, showCategory: false }
};
let currentDifficulty = "medium";

document.querySelectorAll(".challenge-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".challenge-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentDifficulty = btn.dataset.difficulty;
    appSettings.difficulty = currentDifficulty;
    saveSettings();
  });
});

/* ==================== TRIGGER ALARM ==================== */
async function triggerAlarm(alarm) {
  alarmActive   = true;
  currentAlarm  = alarm;
  if (alarm.repeat === "once") { alarm.active = false; saveAlarms(); }

  // Stop any timer sound that might be playing
  const ta = document.getElementById("timerSound");
  ta.pause(); ta.currentTime = 0; timerSoundPlaying = false;

  currentQuestionIndex = 0; correctAnswers = 0; totalAttempts = 0;
  alarmStartTime = Date.now(); askedQuestionHashes = [];

  const s = difficultySettings[currentDifficulty];
  totalQuestions = s.questions; lockSeconds = s.lockTime;

  document.getElementById("ringingAlarmName").textContent = alarm.name || "Wake Up!";
  document.getElementById("ringingAlarmTime").textContent = alarm.time;

  alarmListScreen.classList.add("hidden");
  alarmFormScreen.classList.add("hidden");
  alarmCompletedScreen.classList.add("hidden");
  alarmScreen.classList.remove("hidden");

  if (!document.querySelector('[data-screen="alarm"]').classList.contains("active"))
    document.getElementById("alarmBanner").classList.remove("hidden");

  updateProgressDots();
  playAlarmSound(alarm);
  if (alarm.vibrate && navigator.vibrate) navigator.vibrate([500,200,500,200,500]);
  sendNotification("Alarm ringing", `${alarm.name || "Alarm"} is ready to solve.`);
  await loadQuestion();
}

/* ==================== WEB AUDIO BEEP FALLBACK ==================== */
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

let _beepInterval = null;

function startBeepFallback() {
  stopBeepFallback();
  function beep() {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch(e) {}
  }
  beep();
  _beepInterval = setInterval(beep, 1200);
}

function stopBeepFallback() {
  if (_beepInterval) { clearInterval(_beepInterval); _beepInterval = null; }
}

function playAlarmSound(alarm) {
  stopBeepFallback();
  const audio = document.getElementById("alarmSound");
  const src = alarm.sound || appSettings.sound || "assets/alarm.mp3";

  // If it's a base64 data URL, play directly — no 404 risk
  if (src.startsWith("data:")) {
    audio.src = src;
    audio.currentTime = 0;
    audio.play().catch(() => startBeepFallback());
    return;
  }

  // For file paths, try to load and fall back to beep on error
  audio.src = src;
  audio.currentTime = 0;
  audio.onerror = () => { startBeepFallback(); };
  const playPromise = audio.play();
  if (playPromise) {
    playPromise.catch(() => startBeepFallback());
  }
}

function stopAlarmSound() {
  stopBeepFallback();
  const audio = document.getElementById("alarmSound");
  audio.pause();
  audio.currentTime = 0;
}

/* ==================== QUESTION FLOW ==================== */
function updateProgressDots() {
  document.querySelectorAll(".progress-dot").forEach((d, i) => {
    d.style.display = i < totalQuestions ? "block" : "none";
  });
}

async function loadQuestion(isRetry = false) {
  if (!isRetry) {
    if (currentQuestionIndex >= totalQuestions) {
      stopAlarmSound();
      showCompletionScreen(); return;
    }
    showQuestionLoading();
    currentQuestion = await getRandomQuestion(askedQuestionHashes, currentDifficulty);
  }
  renderQuestion();
}

function showQuestionLoading() {
  document.getElementById("questionText").textContent = "";
  document.getElementById("categoryBadge").style.display = "none";
  document.getElementById("optionsBox").innerHTML = `<div class="question-loading"><div class="loading-spinner"></div><span>Waking your brain...</span></div>`;
}

function renderQuestion() {
  const questionBox   = document.getElementById("questionBox");
  const optionsBox    = document.getElementById("optionsBox");
  const categoryBadge = document.getElementById("categoryBadge");
  const questionText  = document.getElementById("questionText");
  const feedbackText  = document.getElementById("feedbackText");
  updateProgressIndicator();
  const s = difficultySettings[currentDifficulty];
  if (s.showCategory) {
    const aiBadge = currentQuestion.source === "ai" ? `<span class="ai-badge">AI</span>` : "";
    categoryBadge.innerHTML = `<span class="category-badge ${currentQuestion.category}">${currentQuestion.category}</span>${aiBadge}`;
    categoryBadge.style.display = "inline-block";
  } else { categoryBadge.style.display = "none"; }
  questionText.textContent = currentQuestion.question;
  const ep = document.getElementById("progressText"); if (ep) ep.remove();
  const pt = document.createElement("p"); pt.id = "progressText";
  pt.innerHTML = `<strong>Question ${currentQuestionIndex + 1} of ${totalQuestions}</strong>`;
  questionBox.insertBefore(pt, categoryBadge.nextSibling);
  optionsBox.innerHTML = ""; feedbackText.textContent = ""; feedbackText.className = "";
  currentQuestion.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.onclick = () => handleOptionClick(option, btn);
    optionsBox.appendChild(btn);
  });
}

function updateProgressIndicator() {
  document.querySelectorAll(".progress-dot").forEach((dot, i) => {
    dot.classList.remove("completed", "current");
    if (i >= totalQuestions) return;
    if (i < currentQuestionIndex) dot.classList.add("completed");
    else if (i === currentQuestionIndex) dot.classList.add("current");
  });
}

async function handleOptionClick(selected, btn) {
  if (isLocked) return;
  totalAttempts++;
  const ft = document.getElementById("feedbackText");
  if (selected === currentQuestion.answer) {
    correctAnswers++;
    btn.classList.add("correct-answer");
    ft.className = "success"; ft.textContent = "Correct!";
    document.querySelectorAll("#optionsBox button").forEach(b => b.disabled = true);
    setTimeout(async () => { currentQuestionIndex++; await loadQuestion(); }, 800);
  } else {
    btn.classList.add("wrong-answer");
    ft.className = "error"; ft.textContent = "Incorrect — cooldown starting...";
    setTimeout(() => { btn.classList.remove("wrong-answer"); startLockTimer(); }, 400);
  }
}

function startLockTimer() {
  isLocked = true; let remaining = lockSeconds;
  const ft = document.getElementById("feedbackText");
  const ob = document.getElementById("optionsBox");
  ob.innerHTML = ""; ft.className = "locked";
  const ltd = document.createElement("div"); ltd.className = "lock-timer";
  ltd.textContent = `${remaining}s`;
  ft.innerHTML = `Incorrect answer.<br>`; ft.appendChild(ltd);
  lockInterval = setInterval(async () => {
    remaining--; ltd.textContent = `${remaining}s`;
    if (remaining <= 0) {
      clearInterval(lockInterval); isLocked = false;
      shuffleArray(currentQuestion.options);
      await loadQuestion(true);
      ft.textContent = "Try again!"; ft.className = "locked";
    }
  }, 1000);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* ==================== COMPLETION ==================== */
function showCompletionScreen() {
  alarmActive = false;
  stopAlarmSound(); // stop both audio and beep fallback
  document.getElementById("alarmBanner").classList.add("hidden");
  const secs = Math.floor((Date.now() - alarmStartTime) / 1000);
  const acc  = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 100;
  const rb = document.getElementById("reminderBox");
  const rt = document.getElementById("reminderText");
  if (currentAlarm?.reminder) { rt.textContent = currentAlarm.reminder; rb.classList.remove("hidden"); }
  else rb.classList.add("hidden");
  saveAlarmToHistory({ timestamp: new Date().toISOString(), solveTime: secs, accuracy: acc, difficulty: currentDifficulty, alarmName: currentAlarm?.name || "" });
  updateStreak();
  document.getElementById("solveTime").textContent    = `${secs}s`;
  document.getElementById("totalAttempts").textContent = totalAttempts;
  document.getElementById("accuracy").textContent      = `${acc}%`;
  alarmScreen.classList.add("hidden");
  alarmCompletedScreen.classList.remove("hidden");
}

document.getElementById("startFocusBtn").addEventListener("click", () => {
  document.querySelector('[data-screen="timer"]').click();
  document.getElementById("hoursInput").value   = 0;
  document.getElementById("minutesInput").value = 5;
  document.getElementById("secondsInput").value = 0;
  initTimerDisplay();
  resetAlarmToList();
  showToast("Timer ready — press Start when you're ready.", "info");
});
document.getElementById("dismissCompletionBtn").addEventListener("click", resetAlarmToList);
document.getElementById("snoozeAlarmBtn").addEventListener("click", snoozeAlarm);
document.getElementById("dismissAlarmBtn").addEventListener("click", () => {
  stopAlarmSound();
  resetAlarmToList();
});

function resetAlarmToList() {
  alarmActive = false; currentAlarm = null;
  alarmCompletedScreen.classList.add("hidden");
  alarmScreen.classList.add("hidden");
  alarmListScreen.classList.remove("hidden");
  renderAlarms();
}

function snoozeAlarm() {
  if (!currentAlarm) return;
  stopAlarmSound();
  alarmActive = false;
  const next = new Date(Date.now() + 5 * 60_000);
  const nextTime = `${String(next.getHours()).padStart(2, "0")}:${String(next.getMinutes()).padStart(2, "0")}`;
  currentAlarm.time = nextTime;
  currentAlarm.active = true;
  saveAlarms();
  renderAlarms();
  showToast("Alarm snoozed for 5 minutes", "info");
  resetAlarmToList();
}

/* ==================== NAVIGATION ==================== */
function goToAlarmScreen() {
  document.getElementById("alarmBanner").classList.add("hidden");
  navTabs.forEach(t => t.classList.remove("active"));
  document.querySelector('[data-screen="alarm"]').classList.add("active");
  Object.values(screens).forEach(s => s.classList.add("hidden"));
  screens["alarm"].classList.remove("hidden");
  // If alarm is actively ringing, make sure the ringing sub-screen is visible
  if (alarmActive) {
    alarmListScreen.classList.add("hidden");
    alarmFormScreen.classList.add("hidden");
    alarmCompletedScreen.classList.add("hidden");
    alarmScreen.classList.remove("hidden");
  }
}

const navTabs = document.querySelectorAll(".nav-tab");
const screens = {
  alarm:      document.getElementById("alarmMainScreen"),
  stopwatch:  document.getElementById("stopwatchScreen"),
  timer:      document.getElementById("timerScreen"),
  mathSprint: document.getElementById("mathSprintScreen"),
  dashboard:  document.getElementById("dashboardScreen"),
  settings:   document.getElementById("settingsScreen")
};

navTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const name = tab.dataset.screen;
    if (name === "alarm") { goToAlarmScreen(); return; }
    if (alarmActive && !alarmScreen.classList.contains("hidden")) {
      showToast("Solve the alarm first!", "warning"); return;
    }
    navTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    Object.values(screens).forEach(s => s.classList.add("hidden"));
    screens[name].classList.remove("hidden");
    if (name === "dashboard") updateDashboard();
    if (name === "settings")  syncSettingsUI();
  });
});

/* ==================== ALARM HISTORY & STREAK ==================== */
const ALARM_HISTORY_KEY = "ttw_alarmHistory";
const STREAK_KEY        = "ttw_streak";

function getAlarmHistory() {
  try { return JSON.parse(localStorage.getItem(ALARM_HISTORY_KEY)) || []; } catch { return []; }
}
function saveAlarmToHistory(data) {
  const h = getAlarmHistory(); h.unshift(data);
  if (h.length > 60) h.pop();
  localStorage.setItem(ALARM_HISTORY_KEY, JSON.stringify(h));
}
function getStreakData() {
  try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || { currentStreak: 0, lastActiveDate: null }; } catch { return { currentStreak: 0, lastActiveDate: null }; }
}
function updateStreak() {
  const d = getStreakData(), today = new Date().toDateString();
  if (d.lastActiveDate === today) return;
  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  const ns = d.lastActiveDate === yd.toDateString() ? d.currentStreak + 1 : 1;
  localStorage.setItem(STREAK_KEY, JSON.stringify({ currentStreak: ns, lastActiveDate: today }));
}
function getWeeklyStats() {
  const h   = getAlarmHistory();
  const wAgo = new Date(Date.now() - 7 * 864e5);
  const w   = h.filter(i => new Date(i.timestamp) >= wAgo);
  if (!w.length) return { totalAlarms: 0, avgSolveTime: 0, avgAccuracy: 0 };
  const n = w.length;
  return { totalAlarms: n, avgSolveTime: Math.round(w.reduce((s,i) => s+i.solveTime,0)/n), avgAccuracy: Math.round(w.reduce((s,i) => s+i.accuracy,0)/n) };
}

/* ==================== DASHBOARD ==================== */
function updateDashboard() {
  const streak = getStreakData();
  const stats  = getWeeklyStats();
  const best   = localStorage.getItem("mathSprintBest") || 0;

  document.getElementById("currentStreak").textContent = streak.currentStreak;
  document.getElementById("streakMessage").textContent =
    streak.currentStreak === 0 ? "Set an alarm to start!" :
    streak.currentStreak < 3  ? "Good start!" :
    streak.currentStreak < 7  ? "You're on a roll!" :
    streak.currentStreak < 14 ? "Impressive streak! 🔥" : "Unstoppable! 🏆";
  document.getElementById("totalAlarms").textContent  = stats.totalAlarms;
  document.getElementById("avgSolveTime").textContent = `${stats.avgSolveTime}s`;
  document.getElementById("avgAccuracy").textContent  = `${stats.avgAccuracy}%`;
  document.getElementById("mathSprintBest").textContent = best;

  renderWeekChart();
  renderHistoryList();
  renderWakeScore(stats, streak);
}

function renderWakeScore(stats, streak) {
  const scoreEl = document.getElementById("wakeScore");
  const labelEl = document.getElementById("wakeScoreLabel");
  if (!scoreEl || !labelEl) return;

  if (!stats.totalAlarms) {
    scoreEl.textContent = "--";
    labelEl.textContent = "Solve an alarm to calculate it";
    return;
  }

  const accuracyPoints = Math.min(40, Math.round(stats.avgAccuracy * 0.4));
  const speedPoints = Math.max(0, 30 - Math.floor(stats.avgSolveTime / 5));
  const streakPoints = Math.min(30, streak.currentStreak * 5);
  const score = Math.min(100, accuracyPoints + speedPoints + streakPoints);

  scoreEl.textContent = score;
  labelEl.textContent =
    score >= 85 ? "Sharp mornings lately" :
    score >= 65 ? "Solid wake-up rhythm" :
    score >= 40 ? "Building consistency" :
    "Start with one solved alarm";
}

function renderWeekChart() {
  const h    = getAlarmHistory();
  const chart = document.getElementById("weekChart");
  const labels = document.getElementById("weekChartLabels");
  const days  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const now   = new Date();
  // Build last 7 days buckets
  const buckets = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return { label: days[d.getDay()], dateStr: d.toDateString(), count: 0, totalTime: 0 };
  });
  h.forEach(item => {
    const ds = new Date(item.timestamp).toDateString();
    const b  = buckets.find(b => b.dateStr === ds);
    if (b) { b.count++; b.totalTime += item.solveTime; }
  });
  const maxTime = Math.max(...buckets.map(b => b.totalTime), 1);
  chart.innerHTML = buckets.map(b => {
    const pct = Math.round((b.totalTime / maxTime) * 100);
    const tip = b.count ? `${b.count} alarm${b.count>1?"s":""}, ${b.totalTime}s total` : "No alarms";
    return `<div class="chart-bar-wrap" title="${tip}">
      <div class="chart-bar" style="height:${Math.max(pct,4)}%">${b.count > 0 ? b.count : ""}</div>
    </div>`;
  }).join("");
  labels.innerHTML = buckets.map(b => `<span>${b.label}</span>`).join("");
}

function renderHistoryList() {
  const h  = getAlarmHistory();
  const el = document.getElementById("historyList");
  if (!h.length) { el.innerHTML = '<p class="no-history">No alarms solved yet. Start your streak!</p>'; return; }
  el.innerHTML = h.slice(0, 10).map(item => {
    const ds   = new Date(item.timestamp).toLocaleDateString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
    const diff = item.difficulty || "";
    const dl   = diff ? diff[0].toUpperCase() + diff.slice(1) : "";
    const name = item.alarmName ? `<span class="history-alarm-name">${item.alarmName}</span>` : "";
    return `<div class="history-item">
      <div><span class="history-date">${ds}</span>${name}</div>
      <div class="history-details">
        <span class="history-difficulty ${diff}">${dl}</span>
        <span class="history-time">${item.solveTime}s</span>
        <span class="history-accuracy">${item.accuracy}%</span>
      </div>
    </div>`;
  }).join("");
}

/* ==================== SETTINGS UI ==================== */
function initSettingsUI() {
  // Sound select
  const ss = document.getElementById("settingsSoundSelect");
  ss.value = appSettings.customSoundBase64 ? "custom" : appSettings.sound;
  ss.addEventListener("change", function () {
    document.getElementById("settingsCustomSoundSection").classList.toggle("hidden", this.value !== "custom");
    if (this.value !== "custom") {
      appSettings.sound = this.value;
      appSettings.customSoundBase64 = "";
      appSettings.customSoundName = "";
      const names = { "assets/alarm.mp3":"Classic","assets/sounds/digital.mp3":"Digital","assets/sounds/bell.mp3":"Bell" };
      appSettings.soundName = names[this.value] || this.value;
      document.getElementById("defaultSoundName").textContent = appSettings.soundName;
      saveSettings();
    }
  });
  // Custom sound upload
  document.getElementById("settingsCustomSoundFile").addEventListener("change", function () {
    const f = this.files[0]; if (!f) return;
    document.getElementById("settingsCustomSoundName").textContent = f.name;
    const r = new FileReader();
    r.onload = e => {
      appSettings.customSoundBase64 = e.target.result;
      appSettings.customSoundName   = f.name;
      appSettings.sound = e.target.result;
      appSettings.soundName = f.name;
      document.getElementById("defaultSoundName").textContent = f.name;
      saveSettings(); showToast("Custom sound saved", "success");
    };
    r.readAsDataURL(f);
  });
  // Vibrate default
  const vd = document.getElementById("settingsVibrateDefault");
  vd.checked = appSettings.vibrateDefault;
  vd.addEventListener("change", () => { appSettings.vibrateDefault = vd.checked; saveSettings(); });
  // Difficulty
  const sd = document.getElementById("settingsDifficultySelect");
  sd.value = appSettings.difficulty;
  sd.addEventListener("change", () => {
    appSettings.difficulty = sd.value; currentDifficulty = sd.value;
    document.querySelectorAll(".challenge-btn").forEach(b => b.classList.toggle("active", b.dataset.difficulty === sd.value));
    saveSettings();
  });
  // Notifications
  const ns = document.getElementById("settingsNotifications");
  ns.checked = appSettings.notifications;
  ns.addEventListener("change", () => {
    appSettings.notifications = ns.checked;
    if (ns.checked && "Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
        if (permission !== "granted") {
          ns.checked = false;
          appSettings.notifications = false;
          showToast("Notifications not enabled.", "warning");
        }
        saveSettings();
      });
    } else {
      saveSettings();
    }
  });
  // Auto theme
  const at = document.getElementById("settingsAutoTheme");
  at.checked = appSettings.autoTheme;
  at.addEventListener("change", () => {
    appSettings.autoTheme = at.checked;
    saveSettings();
    if (at.checked) applyThemeFromSystem(); else applyTheme(appSettings.theme);
  });
  // Timer sound
  const ts = document.getElementById("settingsTimerSound");
  ts.checked = appSettings.timerSound;
  ts.addEventListener("change", () => { appSettings.timerSound = ts.checked; saveSettings(); });
  // Theme
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === appSettings.theme);
    btn.addEventListener("click", () => {
      document.querySelectorAll(".theme-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      appSettings.theme = btn.dataset.theme;
      if (appSettings.autoTheme) {
        applyThemeFromSystem();
      } else {
        applyTheme(btn.dataset.theme);
      }
      saveSettings();
      showToast(`Theme: ${btn.title}`, "info");
    });
  });
  // Clear history
  document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    localStorage.removeItem(ALARM_HISTORY_KEY);
    showToast("History cleared", "info");
  });
  // Delete all alarms
  document.getElementById("deleteAlarmsBtn").addEventListener("click", () => {
    if (!confirm("Delete all alarms? This cannot be undone.")) return;
    alarms = [];
    saveAlarms();
    renderAlarms();
    showToast("All alarms deleted", "warning");
  });
  // Reset defaults
  document.getElementById("resetDefaultsBtn").addEventListener("click", () => {
    if (!confirm("Reset all settings to defaults?")) return;
    appSettings = { ...defaultSettings };
    saveSettings();
    loadSettings();
    syncSettingsUI();
    renderAlarms();
    showToast("Settings reset to defaults", "info");
  });
  // Reset streak
  document.getElementById("resetStreakBtn").addEventListener("click", () => {
    if (!confirm("Reset your current day streak?")) return;
    localStorage.removeItem(STREAK_KEY);
    // Update UI if user is currently on dashboard
    if (!document.getElementById("dashboardScreen").classList.contains("hidden")) {
      updateDashboard();
    }
    showToast("Streak reset", "info");
  });

  // Data export/import
  document.getElementById("exportDataBtn").addEventListener("click", exportAppData);
  document.getElementById("importDataBtn").addEventListener("click", () => {
    document.getElementById("importDataFile").click();
  });
  document.getElementById("importDataFile").addEventListener("change", importAppData);
  // Default sound name
  document.getElementById("defaultSoundName").textContent = appSettings.soundName || "Classic";
}

function exportAppData() {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    alarms,
    settings: appSettings,
    alarmHistory: getAlarmHistory(),
    streak: getStreakData(),
    mathSprintBest: localStorage.getItem("mathSprintBest") || "0"
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `thinktowake-backup-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Backup exported", "success");
}

function importAppData(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data || !Array.isArray(data.alarms) || typeof data.settings !== "object") {
        throw new Error("Invalid backup");
      }
      if (!confirm("Import this backup? Current local alarms and settings will be replaced.")) return;

      alarms = data.alarms;
      appSettings = { ...defaultSettings, ...data.settings };
      localStorage.setItem(ALARMS_KEY, JSON.stringify(alarms));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(appSettings));
      localStorage.setItem(ALARM_HISTORY_KEY, JSON.stringify(Array.isArray(data.alarmHistory) ? data.alarmHistory : []));
      localStorage.setItem(STREAK_KEY, JSON.stringify(data.streak || { currentStreak: 0, lastActiveDate: null }));
      localStorage.setItem("mathSprintBest", String(data.mathSprintBest || "0"));

      if (appSettings.autoTheme) applyThemeFromSystem(); else applyTheme(appSettings.theme);
      renderAlarms();
      syncSettingsUI();
      document.getElementById("sprintBest").textContent = parseInt(localStorage.getItem("mathSprintBest")) || 0;
      showToast("Backup imported", "success");
    } catch {
      showToast("That backup file could not be imported.", "error");
    }
  };
  reader.readAsText(file);
}

function syncSettingsUI() {
  document.getElementById("settingsSoundSelect").value = appSettings.customSoundBase64 ? "custom" : appSettings.sound;
  document.getElementById("settingsCustomSoundSection").classList.toggle("hidden", !appSettings.customSoundBase64);
  document.getElementById("settingsVibrateDefault").checked = appSettings.vibrateDefault;
  document.getElementById("settingsDifficultySelect").value = appSettings.difficulty;
  document.getElementById("settingsTimerSound").checked = appSettings.timerSound;
  document.getElementById("settingsNotifications").checked = appSettings.notifications;
  document.getElementById("settingsAutoTheme").checked = appSettings.autoTheme;
  document.querySelectorAll(".theme-btn").forEach(b => b.classList.toggle("active", b.dataset.theme === appSettings.theme));
  document.getElementById("defaultSoundName").textContent = appSettings.soundName || "Classic";
}

/* ==================== STOPWATCH ==================== */
let swInterval = null, swRunning = false, swTime = 0, lapCount = 0;
let lapTimes = []; // store raw ms for delta

const swDisplay = document.getElementById("stopwatchDisplay");
const swHMEl    = document.getElementById("swHM");
const swCSEl    = document.getElementById("swCS");

function formatSW(ms) {
  const h  = Math.floor(ms / 3600000);
  const m  = Math.floor((ms % 3600000) / 60000);
  const s  = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  const hm = h > 0
    ? `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`
    : `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  return { hm, cs: String(cs).padStart(2,"0") };
}

function updateSWDisplay() {
  const { hm, cs } = formatSW(swTime);
  swHMEl.textContent = hm; swCSEl.textContent = cs;
}

document.getElementById("startStopBtn").addEventListener("click", () => {
  const btn = document.getElementById("startStopBtn");
  if (swRunning) {
    clearInterval(swInterval); swRunning = false;
    btn.textContent = "Start"; btn.classList.remove("running");
  } else {
    swRunning = true; btn.textContent = "Stop"; btn.classList.add("running");
    swInterval = setInterval(() => { swTime += 10; updateSWDisplay(); }, 10);
  }
});

document.getElementById("lapBtn").addEventListener("click", () => {
  if (!swRunning) return;
  lapCount++;
  const prev  = lapTimes.length ? lapTimes[lapTimes.length - 1] : 0;
  const delta = swTime - prev;
  lapTimes.push(swTime);
  const container = document.getElementById("lapTimes");
  // Remove empty message
  const empty = container.querySelector(".lap-empty");
  if (empty) empty.remove();
  const { hm: lapHM, cs: lapCS } = formatSW(swTime);
  const { hm: dHM, cs: dCS }     = formatSW(delta);
  const faster = lapTimes.length > 1 && delta < (lapTimes[lapTimes.length - 2] - (lapTimes[lapTimes.length - 3] || 0));
  const el = document.createElement("div");
  el.className = "lap-time";
  el.innerHTML = `
    <span class="lap-number">Lap ${lapCount}</span>
    <span class="lap-delta ${faster ? "lap-delta--fast" : ""}">+${dHM}.${dCS}</span>
    <span class="lap-value">${lapHM}.${lapCS}</span>`;
  container.insertBefore(el, container.firstChild);
});

document.getElementById("resetBtn").addEventListener("click", () => {
  clearInterval(swInterval); swRunning = false; swTime = 0; lapCount = 0; lapTimes = [];
  updateSWDisplay();
  const btn = document.getElementById("startStopBtn");
  btn.textContent = "Start"; btn.classList.remove("running");
  const c = document.getElementById("lapTimes");
  c.innerHTML = '<p class="lap-empty">Press Lap while running to record splits</p>';
});

/* ==================== TIMER ==================== */
let timerInterval  = null;
let timerRunning   = false;
let timerPaused    = false;
let timerRemaining = 0;
let timerTotal     = 0;
// timerSoundPlaying declared near top with alarmActive

const hoursInput     = document.getElementById("hoursInput");
const minutesInput   = document.getElementById("minutesInput");
const secondsInput   = document.getElementById("secondsInput");
const timerDisplay   = document.getElementById("timerDisplay");
const timerLabel     = document.getElementById("timerDisplayLabel");
const startTimerBtn  = document.getElementById("startTimerBtn");
const pauseTimerBtn  = document.getElementById("pauseTimerBtn");
const cancelTimerBtn = document.getElementById("cancelTimerBtn");
const ringFill       = document.getElementById("timerRingFill");
const RING_CIRC      = 2 * Math.PI * 88;

function formatTimer(s) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function setRingProgress(fraction) {
  const offset = RING_CIRC * (1 - fraction);
  ringFill.style.strokeDasharray  = RING_CIRC;
  ringFill.style.strokeDashoffset = offset;
}

function initTimerDisplay() {
  const h = parseInt(hoursInput.value)||0, m = parseInt(minutesInput.value)||0, s = parseInt(secondsInput.value)||0;
  timerRemaining = timerTotal = h*3600 + m*60 + s;
  timerDisplay.textContent = formatTimer(timerRemaining);
  timerLabel.textContent   = "tap to set";
  setRingProgress(1);
}

function validateTimerInput(inp, min, max) {
  let v = parseInt(inp.value); if (isNaN(v)) v = min;
  inp.value = Math.min(max, Math.max(min, v));
}

[hoursInput, minutesInput, secondsInput].forEach((inp, i) => {
  inp.addEventListener("input",  initTimerDisplay);
  inp.addEventListener("change", () => validateTimerInput(inp, 0, [23,59,59][i]));
});

document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    hoursInput.value = 0; minutesInput.value = parseInt(btn.dataset.minutes); secondsInput.value = 0;
    initTimerDisplay();
  });
});

function timerTick() {
  timerRemaining--;
  timerDisplay.textContent = formatTimer(timerRemaining);
  timerLabel.textContent   = "remaining";
  setRingProgress(timerTotal > 0 ? timerRemaining / timerTotal : 0);
  if (timerRemaining <= 0) {
    clearInterval(timerInterval); resetTimerUI();
    if (appSettings.timerSound) {
      const soundSrc = appSettings.customSoundBase64 || appSettings.sound || null;
      const timerAudio = document.getElementById("timerSound");
      if (soundSrc) {
        timerAudio.src = soundSrc;
        timerAudio.currentTime = 0;
        timerAudio.play().catch(() => playTimerBeep());
        timerAudio.onerror = () => playTimerBeep();
      } else {
        playTimerBeep();
      }
      timerSoundPlaying = true;
    }
    timerDisplay.textContent = "Done!"; timerLabel.textContent = "timer complete";
    setRingProgress(0);
    sendNotification("Timer complete", "Your countdown has finished.");
    showToast("Timer complete. Tap Cancel to stop.", "success", 6000);
  }
}

function playTimerBeep() {
  // Single beep for timer end (not looping)
  try {
    const ctx = getAudioCtx();
    const notes = [880, 1100, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.2;
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.start(t); osc.stop(t + 0.2);
    });
  } catch(e) {}
}

function resetTimerUI() {
  timerRunning = false; timerPaused = false;
  startTimerBtn.textContent = "Start"; startTimerBtn.disabled = false;
  pauseTimerBtn.classList.add("hidden"); pauseTimerBtn.textContent = "Pause";
  document.getElementById("timerPicker").classList.remove("hidden");
}

startTimerBtn.addEventListener("click", () => {
  if (timerRunning) return;
  if (timerSoundPlaying) {
    document.getElementById("timerSound").pause();
    document.getElementById("timerSound").currentTime = 0;
    timerSoundPlaying = false;
  }
  if (timerRemaining <= 0) initTimerDisplay();
  if (timerRemaining <= 0) { showToast("Set a time first!", "warning"); return; }
  timerTotal    = timerRemaining;
  timerRunning  = true;
  startTimerBtn.textContent = "Running…"; startTimerBtn.disabled = true;
  pauseTimerBtn.classList.remove("hidden");
  document.getElementById("timerPicker").classList.add("hidden");
  timerInterval = setInterval(timerTick, 1000);
  setRingProgress(1); timerLabel.textContent = "remaining";
});

pauseTimerBtn.addEventListener("click", () => {
  if (timerPaused) {
    timerPaused = false; pauseTimerBtn.textContent = "Pause";
    timerInterval = setInterval(timerTick, 1000);
  } else {
    timerPaused = true; pauseTimerBtn.textContent = "Resume";
    clearInterval(timerInterval);
  }
});

cancelTimerBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  if (timerSoundPlaying) {
    const ta = document.getElementById("timerSound");
    ta.pause(); ta.currentTime = 0;
    timerSoundPlaying = false;
  }
  timerRemaining = 0; resetTimerUI();
  hoursInput.value=0; minutesInput.value=5; secondsInput.value=0;
  initTimerDisplay();
});

/* ==================== MATH SPRINT ==================== */
let sprintTime = 60, sprintScore = 0, sprintInterval = null, currentProblem = null;
let sprintBest = parseInt(localStorage.getItem("mathSprintBest")) || 0;

function generateProblem() {
  const ops = ["+","-","×"], op = ops[Math.floor(Math.random()*ops.length)];
  const diff = Math.min(Math.floor(sprintScore/5), 3);
  const max  = 10 + diff*10;
  let n1, n2, ans;
  if (op==="+") { n1=Math.floor(Math.random()*max)+1; n2=Math.floor(Math.random()*max)+1; ans=n1+n2; }
  else if (op==="-") { n1=Math.floor(Math.random()*max)+1; n2=Math.floor(Math.random()*n1)+1; ans=n1-n2; }
  else { n1=Math.floor(Math.random()*(max/2))+1; n2=Math.floor(Math.random()*10)+1; ans=n1*n2; }
  currentProblem = { n1, n2, op, ans };
  document.getElementById("mathNum1").textContent     = n1;
  document.getElementById("mathNum2").textContent     = n2;
  document.getElementById("mathOperator").textContent = op;
  document.getElementById("mathAnswer").value = "";
  document.getElementById("mathAnswer").focus();
}

function startSprint() {
  sprintTime = 60; sprintScore = 0;
  document.getElementById("sprintTime").textContent  = sprintTime;
  document.getElementById("sprintScore").textContent = sprintScore;
  document.getElementById("mathFeedback").textContent = "";
  document.getElementById("mathFeedback").className   = "math-feedback";
  document.getElementById("mathSprintStart").classList.add("hidden");
  document.getElementById("mathSprintGame").classList.remove("hidden");
  document.getElementById("mathSprintOver").classList.add("hidden");
  generateProblem();
  sprintInterval = setInterval(() => {
    sprintTime--;
    document.getElementById("sprintTime").textContent = sprintTime;
    // Add urgency visual when ≤10 seconds
    const timeEl = document.getElementById("sprintTime").closest(".sprint-stat") || document.getElementById("sprintTime").parentElement;
    if (timeEl) timeEl.classList.toggle("urgent", sprintTime <= 10);
    if (sprintTime <= 0) endSprint();
  }, 1000);
}

function endSprint() {
  clearInterval(sprintInterval);
  document.getElementById("mathSprintGame").classList.add("hidden");
  document.getElementById("mathSprintOver").classList.remove("hidden");
  document.getElementById("finalScore").textContent = sprintScore;
  if (sprintScore > sprintBest) {
    sprintBest = sprintScore;
    localStorage.setItem("mathSprintBest", sprintBest);
    document.getElementById("sprintBest").textContent = sprintBest;
    document.getElementById("newHighScore").classList.remove("hidden");
  } else { document.getElementById("newHighScore").classList.add("hidden"); }
}

function checkAnswer() {
  const ans = parseInt(document.getElementById("mathAnswer").value);
  if (isNaN(ans)) return;
  const fb = document.getElementById("mathFeedback");
  if (ans === currentProblem.ans) {
    sprintScore++; document.getElementById("sprintScore").textContent = sprintScore;
    fb.textContent = "✓"; fb.className = "math-feedback correct";
    generateProblem();
  } else {
    fb.textContent = "✗"; fb.className = "math-feedback wrong";
    document.getElementById("mathAnswer").value = "";
    document.getElementById("mathAnswer").focus();
  }
}

document.getElementById("startSprintBtn").addEventListener("click", startSprint);
document.getElementById("playAgainBtn").addEventListener("click",  startSprint);
document.getElementById("submitAnswerBtn").addEventListener("click", checkAnswer);
document.getElementById("mathAnswer").addEventListener("keypress", e => { if (e.key==="Enter") checkAnswer(); });

/* ==================== KEYBOARD SHORTCUTS ==================== */
function getVisibleScreenName() {
  for (const [name, el] of Object.entries(screens)) {
    if (el && !el.classList.contains("hidden")) return name;
  }
  return null;
}

function focusOptionByIndex(idx) {
  const options = Array.from(document.querySelectorAll("#optionsBox button"));
  const btn = options[idx];
  if (!btn) return false;
  btn.focus();
  return true;
}

function getSelectedOptionFromFocus() {
  const focused = document.activeElement;
  const buttons = Array.from(document.querySelectorAll("#optionsBox button"));
  if (buttons.includes(focused)) return focused.textContent;
  return null;
}

function isTypingInField() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName ? el.tagName.toLowerCase() : "";
  return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
}

document.addEventListener("keydown", (e) => {
  // Avoid stealing keys while user is typing (except when we're on an alarm screen)
  const screen = getVisibleScreenName();
  const allowWhenTyping = screen === "alarm" && !isLocked;
  if (!allowWhenTyping && isTypingInField()) return;

  // Alarm ringing screen shortcuts
  if (screen === "alarm" && alarmActive) {
    // Prevent browser defaults (e.g., number keys triggering something odd)
    if (["1","2","3","4"].includes(e.key) || e.key === "Enter" || e.key === "Escape") e.preventDefault();

    if (["1","2","3","4"].includes(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      focusOptionByIndex(idx);
      return;
    }

    if (e.key === "Enter") {
      const selected = getSelectedOptionFromFocus();
      const btn = document.activeElement && document.activeElement.tagName === "BUTTON" ? document.activeElement : null;
      if (selected && btn) {
        btn.click();
      }
      return;
    }

    if (e.key === "Escape") {
      // Shift+Esc: dismiss, otherwise snooze
      if (e.shiftKey) {
        document.getElementById("dismissAlarmBtn").click();
      } else {
        document.getElementById("snoozeAlarmBtn").click();
      }
      return;
    }
  }

  // Timer shortcuts
  if (screen === "timer") {
    // Space toggles pause/resume while running
    if (e.code === "Space" && timerRunning) {
      e.preventDefault();
      pauseTimerBtn.click();
      return;
    }
    // Enter starts when picker is visible
    if (e.key === "Enter" && !timerRunning) {
      const pickerHidden = document.getElementById("timerPicker").classList.contains("hidden");
      if (!pickerHidden) {
        e.preventDefault();
        startTimerBtn.click();
      }
      return;
    }
  }

  // Math Sprint shortcuts
  if (screen === "mathSprint") {
    // Space starts/plays again on the start screen
    if (e.code === "Space" && !document.getElementById("mathSprintGame").classList.contains("hidden")) {
      // game is active: treat Space as submit (browser may scroll otherwise)
      e.preventDefault();
      checkAnswer();
      return;
    }
    if (e.code === "Space" && document.getElementById("mathSprintStart") && !document.getElementById("mathSprintStart").classList.contains("hidden")) {
      e.preventDefault();
      startSprint();
      return;
    }
    if (e.key === "Enter" && !document.getElementById("mathSprintGame").classList.contains("hidden")) {
      e.preventDefault();
      checkAnswer();
      return;
    }
  }
});

