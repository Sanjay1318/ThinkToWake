/* ==================== INITIALIZATION ==================== */
document.addEventListener("DOMContentLoaded", function() {
  initApp();
});

function initApp() {
  updateTimerDisplayFromInputs();
  // BUG FIX: statusText has background styling - hide it when empty
  statusText.style.display = "none";
}

/* ==================== TOAST NOTIFICATION SYSTEM ==================== */
function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
    warning: "⚠"
  };
  
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add("hiding");
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ==================== ALARM HISTORY & STREAK ==================== */
const ALARM_HISTORY_KEY = "thinkToWake_alarmHistory";
const STREAK_KEY = "thinkToWake_streak";

function getAlarmHistory() {
  const history = localStorage.getItem(ALARM_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
}

function saveAlarmToHistory(alarmData) {
  const history = getAlarmHistory();
  history.unshift(alarmData);
  if (history.length > 30) history.pop();
  localStorage.setItem(ALARM_HISTORY_KEY, JSON.stringify(history));
}

function getStreakData() {
  const streak = localStorage.getItem(STREAK_KEY);
  return streak ? JSON.parse(streak) : { currentStreak: 0, lastActiveDate: null };
}

function updateStreak() {
  const streakData = getStreakData();
  const today = new Date().toDateString();
  const lastActive = streakData.lastActiveDate;
  
  if (lastActive === today) return streakData.currentStreak;
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  let newStreak;
  if (lastActive === yesterdayStr) {
    newStreak = streakData.currentStreak + 1;
  } else {
    newStreak = 1;
  }
  
  localStorage.setItem(STREAK_KEY, JSON.stringify({ currentStreak: newStreak, lastActiveDate: today }));
  return newStreak;
}

function getWeeklyStats() {
  const history = getAlarmHistory();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const weeklyHistory = history.filter(item => new Date(item.timestamp) >= weekAgo);
  
  if (weeklyHistory.length === 0) return { totalAlarms: 0, avgSolveTime: 0, avgAccuracy: 0 };
  
  const totalAlarms = weeklyHistory.length;
  const avgSolveTime = Math.round(weeklyHistory.reduce((sum, item) => sum + item.solveTime, 0) / totalAlarms);
  const avgAccuracy = Math.round(weeklyHistory.reduce((sum, item) => sum + item.accuracy, 0) / totalAlarms);
  
  return { totalAlarms, avgSolveTime, avgAccuracy };
}

function renderHistoryList() {
  const history = getAlarmHistory();
  const historyList = document.getElementById("historyList");
  
  if (history.length === 0) {
    historyList.innerHTML = '<p class="no-history">No alarms solved yet. Start your streak!</p>';
    return;
  }
  
  const recentHistory = history.slice(0, 10);
  historyList.innerHTML = recentHistory.map(item => {
    const date = new Date(item.timestamp);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    const difficultyLabel = item.difficulty ? item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1) : '';
    return `
      <div class="history-item">
        <span class="history-date">${dateStr}</span>
        <div class="history-details">
          <span class="history-difficulty ${item.difficulty || ''}">${difficultyLabel}</span>
          <span class="history-time">${item.solveTime}s</span>
          <span class="history-accuracy">${item.accuracy}%</span>
        </div>
      </div>
    `;
  }).join("");
}

function updateDashboard() {
  const streakData = getStreakData();
  const weeklyStats = getWeeklyStats();
  // BUG FIX: Read fresh from localStorage instead of stale module-level var
  const sprintBestVal = localStorage.getItem("mathSprintBest") || 0;
  
  document.getElementById("currentStreak").textContent = streakData.currentStreak;
  document.getElementById("totalAlarms").textContent = weeklyStats.totalAlarms;
  document.getElementById("avgSolveTime").textContent = `${weeklyStats.avgSolveTime}s`;
  document.getElementById("avgAccuracy").textContent = `${weeklyStats.avgAccuracy}%`;
  document.getElementById("mathSprintBest").textContent = sprintBestVal;
  
  renderHistoryList();
}

/* ==================== ALARM FUNCTIONALITY ==================== */
let isLocked = false;
let lockSeconds = 10;
let lockInterval = null;
let totalQuestions = 3;
let currentQuestionIndex = 0;
let correctAnswers = 0;
let askedQuestionHashes = [];

let alarmStartTime = null;
let totalAttempts = 0;

const difficultySettings = {
  easy: { questions: 2, lockTime: 5, showCategory: true },
  medium: { questions: 3, lockTime: 10, showCategory: true },
  hard: { questions: 5, lockTime: 15, showCategory: false }
};
let currentDifficulty = "medium";

const alarmTimeInput = document.getElementById("alarmTime");
const setAlarmBtn = document.getElementById("setAlarmBtn");
const statusText = document.getElementById("statusText");
const setupScreen = document.getElementById("setupScreen");
const alarmScreen = document.getElementById("alarmScreen");
const alarmCompletedScreen = document.getElementById("alarmCompletedScreen");
const alarmMainScreen = document.getElementById("alarmMainScreen");

let currentQuestion = null;
let alarmTime = null;
let alarmInterval = null;
let alarmDateTarget = null;
let alarmActive = false;

/* ==================== DIFFICULTY SELECTOR ==================== */
const diffButtons = document.querySelectorAll(".diff-btn");
diffButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    diffButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentDifficulty = btn.dataset.difficulty;
    
    const settings = difficultySettings[currentDifficulty];
    totalQuestions = settings.questions;
    lockSeconds = settings.lockTime;
  });
});

/* ==================== SET ALARM ==================== */
setAlarmBtn.addEventListener("click", () => {
  if (!alarmTimeInput.value) {
    setStatusText("Please select a time.", true);
    return;
  }

  alarmTime = alarmTimeInput.value;
  
  const now = new Date();
  const [hours, minutes] = alarmTime.split(":");
  alarmDateTarget = new Date();
  alarmDateTarget.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  
  // If time is in the past, schedule for tomorrow
  if (alarmDateTarget <= now) {
    alarmDateTarget.setDate(alarmDateTarget.getDate() + 1);
  }

  setStatusText(`Alarm set for ${alarmTime}`);
  
  document.getElementById("cancelAlarmBtn").classList.remove("hidden");

  const settings = difficultySettings[currentDifficulty];
  totalQuestions = settings.questions;
  lockSeconds = settings.lockTime;
  askedQuestionHashes = [];

  alarmInterval = setInterval(checkTime, 1000);
});

// BUG FIX: Helper to manage statusText visibility
function setStatusText(message, isError = false) {
  statusText.textContent = message;
  statusText.style.display = message ? "block" : "none";
  statusText.style.borderColor = isError ? "rgba(239, 68, 68, 0.3)" : "rgba(59, 130, 246, 0.15)";
  statusText.style.color = isError ? "#f87171" : "#60a5fa";
  statusText.style.background = isError ? "rgba(239, 68, 68, 0.1)" : "rgba(59, 130, 246, 0.1)";
}

function cancelAlarm() {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  alarmTime = null;
  alarmDateTarget = null;
  document.getElementById("cancelAlarmBtn").classList.add("hidden");
  setStatusText("Alarm cancelled");
  
  setTimeout(() => {
    statusText.style.display = "none";
  }, 2000);
}

document.getElementById("cancelAlarmBtn").addEventListener("click", cancelAlarm);

function checkTime() {
  const now = new Date();
  const diffMs = alarmDateTarget - now;
  
  if (diffMs <= 0) {
    triggerAlarm();
    clearInterval(alarmInterval);
    return;
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  setStatusText(`⏳ Alarm rings in ${diffHours}h ${diffMinutes}m ${diffSeconds}s`);
}

function triggerAlarm() {
  alarmActive = true;
  currentQuestionIndex = 0;
  correctAnswers = 0;
  totalAttempts = 0;
  alarmStartTime = Date.now();
  askedQuestionHashes = [];

  setupScreen.classList.add("hidden");
  alarmCompletedScreen.classList.add("hidden");
  alarmScreen.classList.remove("hidden");
  document.getElementById("cancelAlarmBtn").classList.add("hidden");

  // Show persistent banner if user is not currently on the alarm screen
  const alarmTab = document.querySelector('[data-screen="alarm"]');
  if (!alarmTab.classList.contains("active")) {
    document.getElementById("alarmBanner").classList.remove("hidden");
  }

  updateProgressDots();

  const alarmSound = document.getElementById("alarmSound");
  alarmSound.currentTime = 0;
  alarmSound.play().catch(() => {
    // Autoplay may be blocked; user interaction has occurred so this should be fine
  });

  loadQuestion();
}

function updateProgressDots() {
  const dots = document.querySelectorAll(".progress-dot");
  dots.forEach((dot, i) => {
    dot.style.display = i < totalQuestions ? "block" : "none";
  });
}

function loadQuestion(isRetry = false) {
  if (!isRetry) {
    if (currentQuestionIndex >= totalQuestions) {
      document.getElementById("alarmSound").pause();
      showCompletionScreen();
      return;
    }
    currentQuestion = getRandomQuestion(askedQuestionHashes);
  }
  renderQuestion();
}

function renderQuestion() {
  const questionBox = document.getElementById("questionBox");
  const optionsBox = document.getElementById("optionsBox");
  const categoryBadge = document.getElementById("categoryBadge");
  const questionText = document.getElementById("questionText");
  const feedbackText = document.getElementById("feedbackText");

  updateProgressIndicator();

  const settings = difficultySettings[currentDifficulty];
  
  if (settings.showCategory) {
    categoryBadge.innerHTML = `<span class="category-badge ${currentQuestion.category}">${currentQuestion.category}</span>`;
    categoryBadge.style.display = "inline-block";
  } else {
    categoryBadge.style.display = "none";
  }
  
  questionText.textContent = currentQuestion.question;

  // BUG FIX: Remove existing progress text before adding new one
  const existingProgressText = document.getElementById("progressText");
  if (existingProgressText) existingProgressText.remove();

  const progressText = document.createElement("p");
  progressText.id = "progressText";
  progressText.innerHTML = `<strong>Question ${currentQuestionIndex + 1} of ${totalQuestions}</strong>`;
  questionBox.insertBefore(progressText, categoryBadge.nextSibling);

  optionsBox.innerHTML = "";
  feedbackText.textContent = "";
  feedbackText.className = "";

  currentQuestion.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.onclick = () => handleOptionClick(option, btn);
    optionsBox.appendChild(btn);
  });
}

function updateProgressIndicator() {
  const dots = document.querySelectorAll(".progress-dot");
  dots.forEach((dot, index) => {
    dot.classList.remove("completed", "current");
    if (index >= totalQuestions) return;
    if (index < currentQuestionIndex) {
      dot.classList.add("completed");
    } else if (index === currentQuestionIndex) {
      dot.classList.add("current");
    }
  });
}

function handleOptionClick(selectedOption, btn) {
  if (isLocked) return;

  totalAttempts++;
  const feedbackText = document.getElementById("feedbackText");

  if (selectedOption === currentQuestion.answer) {
    correctAnswers++;
    btn.classList.add("correct-answer");
    feedbackText.className = "success";
    feedbackText.textContent = "Correct! 🎉";
    
    // BUG FIX: Disable all buttons to prevent double-clicking during transition
    document.querySelectorAll("#optionsBox button").forEach(b => b.disabled = true);
    
    setTimeout(() => {
      currentQuestionIndex++;
      loadQuestion();
    }, 800);
  } else {
    btn.classList.add("wrong-answer");
    feedbackText.className = "error";
    feedbackText.textContent = "Wrong! Try again after the cooldown.";
    
    setTimeout(() => {
      btn.classList.remove("wrong-answer");
      startLockTimer();
    }, 400);
  }
}

function startLockTimer() {
  isLocked = true;
  let remaining = lockSeconds;

  const feedbackText = document.getElementById("feedbackText");
  const optionsBox = document.getElementById("optionsBox");
  optionsBox.innerHTML = "";

  feedbackText.className = "locked";
  
  const lockTimerDisplay = document.createElement("div");
  lockTimerDisplay.className = "lock-timer";
  lockTimerDisplay.textContent = `${remaining}s`;
  feedbackText.innerHTML = `Wrong answer! ⏳<br>`;
  feedbackText.appendChild(lockTimerDisplay);

  lockInterval = setInterval(() => {
    remaining--;
    lockTimerDisplay.textContent = `${remaining}s`;

    if (remaining <= 0) {
      clearInterval(lockInterval);
      isLocked = false;
      shuffleArray(currentQuestion.options);
      loadQuestion(true);
      feedbackText.textContent = "Try again! 😈";
      feedbackText.className = "locked";
    }
  }, 1000);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/* ==================== COMPLETION SCREEN ==================== */
function showCompletionScreen() {
  alarmActive = false;
  document.getElementById("alarmBanner").classList.add("hidden");
  const solveTimeMs = Date.now() - alarmStartTime;
  const solveTimeSeconds = Math.floor(solveTimeMs / 1000);
  const accuracy = totalAttempts > 0 ? Math.round((correctAnswers / totalAttempts) * 100) : 100;

  const alarmData = {
    timestamp: new Date().toISOString(),
    solveTime: solveTimeSeconds,
    accuracy: accuracy,
    difficulty: currentDifficulty
  };
  saveAlarmToHistory(alarmData);
  updateStreak();

  document.getElementById("solveTime").textContent = `${solveTimeSeconds}s`;
  document.getElementById("totalAttempts").textContent = totalAttempts;
  document.getElementById("accuracy").textContent = `${accuracy}%`;

  alarmScreen.classList.add("hidden");
  alarmCompletedScreen.classList.remove("hidden");
}

document.getElementById("startFocusBtn").addEventListener("click", () => {
  document.querySelector('[data-screen="timer"]').click();
  document.getElementById("hoursInput").value = 0;
  document.getElementById("minutesInput").value = 5;
  document.getElementById("secondsInput").value = 0;
  updateTimerDisplayFromInputs();
  resetAlarmToSetup();
  showToast("Timer ready! Press Start when you're ready.", "info");
});

document.getElementById("dismissCompletionBtn").addEventListener("click", () => {
  resetAlarmToSetup();
});

function resetAlarmToSetup() {
  alarmActive = false;
  alarmCompletedScreen.classList.add("hidden");
  alarmScreen.classList.add("hidden");
  setupScreen.classList.remove("hidden");
  statusText.style.display = "none";
  alarmTimeInput.value = "";
  document.getElementById("cancelAlarmBtn").classList.add("hidden");
}

function goToAlarmScreen() {
  document.getElementById("alarmBanner").classList.add("hidden");
  navTabs.forEach(t => t.classList.remove("active"));
  document.querySelector('[data-screen="alarm"]').classList.add("active");
  Object.keys(screens).forEach(key => screens[key].classList.add("hidden"));
  screens["alarm"].classList.remove("hidden");
}

/* ==================== NAVIGATION ==================== */
const navTabs = document.querySelectorAll(".nav-tab");
const screens = {
  alarm: document.getElementById("alarmMainScreen"),
  stopwatch: document.getElementById("stopwatchScreen"),
  timer: document.getElementById("timerScreen"),
  mathSprint: document.getElementById("mathSprintScreen"),
  dashboard: document.getElementById("dashboardScreen")
};

navTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const screenName = tab.dataset.screen;

    // If alarm is ringing and user clicks the alarm tab, take them straight to it
    if (screenName === "alarm") {
      goToAlarmScreen();
      return;
    }

    // Block switching away from the alarm screen to any other tab while alarm is ringing
    if (alarmActive && !alarmScreen.classList.contains("hidden")) {
      showToast("Solve the alarm first!", "warning");
      return;
    }

    navTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    Object.keys(screens).forEach(key => screens[key].classList.add("hidden"));
    screens[screenName].classList.remove("hidden");

    if (screenName === "dashboard") updateDashboard();
  });
});

/* ==================== STOPWATCH FUNCTIONALITY ==================== */
let stopwatchInterval = null;
let stopwatchRunning = false;
let stopwatchTime = 0;
let lapCount = 0;

const stopwatchDisplay = document.getElementById("stopwatchDisplay");
const startStopBtn = document.getElementById("startStopBtn");
const lapBtn = document.getElementById("lapBtn");
const resetBtn = document.getElementById("resetBtn");
const lapTimesContainer = document.getElementById("lapTimes");

function formatStopwatchTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
}

startStopBtn.addEventListener("click", () => {
  if (stopwatchRunning) {
    clearInterval(stopwatchInterval);
    stopwatchRunning = false;
    startStopBtn.textContent = "Start";
  } else {
    stopwatchRunning = true;
    startStopBtn.textContent = "Stop";
    stopwatchInterval = setInterval(() => {
      stopwatchTime += 10;
      stopwatchDisplay.textContent = formatStopwatchTime(stopwatchTime);
    }, 10);
  }
});

lapBtn.addEventListener("click", () => {
  if (stopwatchRunning) {
    lapCount++;
    const lapTime = document.createElement("div");
    lapTime.className = "lap-time";
    lapTime.innerHTML = `
      <span class="lap-number">Lap ${lapCount}</span>
      <span class="lap-value">${formatStopwatchTime(stopwatchTime)}</span>
    `;
    lapTimesContainer.insertBefore(lapTime, lapTimesContainer.firstChild);
  }
});

resetBtn.addEventListener("click", () => {
  clearInterval(stopwatchInterval);
  stopwatchRunning = false;
  stopwatchTime = 0;
  lapCount = 0;
  stopwatchDisplay.textContent = "00:00:00.00";
  startStopBtn.textContent = "Start";
  lapTimesContainer.innerHTML = "";
});

/* ==================== TIMER FUNCTIONALITY ==================== */
let timerInterval = null;
let timerRunning = false;
let timerRemaining = 0;
let timerPaused = false;

const hoursInput = document.getElementById("hoursInput");
const minutesInput = document.getElementById("minutesInput");
const secondsInput = document.getElementById("secondsInput");
const timerDisplay = document.getElementById("timerDisplay");
const startTimerBtn = document.getElementById("startTimerBtn");
const pauseTimerBtn = document.getElementById("pauseTimerBtn");
const cancelTimerBtn = document.getElementById("cancelTimerBtn");
const presetBtns = document.querySelectorAll(".preset-btn");

// BUG FIX: Track whether timer sound is playing so we can stop it on cancel
let timerSoundPlaying = false;

function formatTimerDisplay(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function updateTimerDisplayFromInputs() {
  const hrs = parseInt(hoursInput.value) || 0;
  const mins = parseInt(minutesInput.value) || 0;
  const secs = parseInt(secondsInput.value) || 0;
  timerRemaining = hrs * 3600 + mins * 60 + secs;
  timerDisplay.textContent = formatTimerDisplay(timerRemaining);
}

function validateTimerInput(input, min, max) {
  let value = parseInt(input.value);
  if (isNaN(value)) value = min;
  if (value < min) value = min;
  if (value > max) value = max;
  input.value = value;
}

hoursInput.addEventListener("change", () => validateTimerInput(hoursInput, 0, 23));
minutesInput.addEventListener("change", () => validateTimerInput(minutesInput, 0, 59));
secondsInput.addEventListener("change", () => validateTimerInput(secondsInput, 0, 59));
hoursInput.addEventListener("input", updateTimerDisplayFromInputs);
minutesInput.addEventListener("input", updateTimerDisplayFromInputs);
secondsInput.addEventListener("input", updateTimerDisplayFromInputs);

presetBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const minutes = parseInt(btn.dataset.minutes);
    hoursInput.value = 0;
    minutesInput.value = minutes;
    secondsInput.value = 0;
    updateTimerDisplayFromInputs();
  });
});

function resetTimerUI() {
  timerRunning = false;
  timerPaused = false;
  startTimerBtn.textContent = "Start";
  startTimerBtn.disabled = false;
  pauseTimerBtn.classList.add("hidden");
  pauseTimerBtn.textContent = "Pause";
}

function startTimerTick() {
  timerRemaining--;
  timerDisplay.textContent = formatTimerDisplay(timerRemaining);
  
  if (timerRemaining <= 0) {
    clearInterval(timerInterval);
    resetTimerUI();
    
    // BUG FIX: Stop any existing alarm sound before playing timer sound
    const alarmSound = document.getElementById("alarmSound");
    alarmSound.currentTime = 0;
    alarmSound.play().catch(() => {});
    timerSoundPlaying = true;
    
    showToast("⏰ Timer complete! Click Cancel to stop the alarm.", "success", 6000);
  }
}

startTimerBtn.addEventListener("click", () => {
  if (timerRunning) return;
  
  // BUG FIX: Stop timer sound if it was playing from previous completion
  if (timerSoundPlaying) {
    document.getElementById("alarmSound").pause();
    timerSoundPlaying = false;
  }
  
  if (timerRemaining <= 0) {
    updateTimerDisplayFromInputs();
  }
  
  if (timerRemaining <= 0) {
    showToast("Please set a time first!", "warning");
    return;
  }
  
  timerRunning = true;
  timerPaused = false;
  startTimerBtn.textContent = "Running...";
  startTimerBtn.disabled = true;
  pauseTimerBtn.classList.remove("hidden");
  pauseTimerBtn.textContent = "Pause";
  
  timerInterval = setInterval(startTimerTick, 1000);
});

pauseTimerBtn.addEventListener("click", () => {
  if (timerPaused) {
    timerPaused = false;
    pauseTimerBtn.textContent = "Pause";
    timerInterval = setInterval(startTimerTick, 1000);
  } else {
    timerPaused = true;
    pauseTimerBtn.textContent = "Resume";
    clearInterval(timerInterval);
  }
});

cancelTimerBtn.addEventListener("click", () => {
  clearInterval(timerInterval);
  
  // BUG FIX: Stop the timer alarm sound when cancelled
  if (timerSoundPlaying) {
    document.getElementById("alarmSound").pause();
    document.getElementById("alarmSound").currentTime = 0;
    timerSoundPlaying = false;
  }
  
  timerRemaining = 0;
  resetTimerUI();
  // BUG FIX: Reset inputs to defaults and sync display
  hoursInput.value = 0;
  minutesInput.value = 5;
  secondsInput.value = 0;
  updateTimerDisplayFromInputs();
});

/* ==================== MATH SPRINT FUNCTIONALITY ==================== */
let sprintTime = 60;
let sprintScore = 0;
let sprintInterval = null;
let currentProblem = null;
// BUG FIX: Read from localStorage each time to stay in sync with dashboard updates
let sprintBest = parseInt(localStorage.getItem("mathSprintBest")) || 0;

const sprintTimeEl = document.getElementById("sprintTime");
const sprintScoreEl = document.getElementById("sprintScore");
const sprintBestEl = document.getElementById("sprintBest");
const mathNum1El = document.getElementById("mathNum1");
const mathNum2El = document.getElementById("mathNum2");
const mathOperatorEl = document.getElementById("mathOperator");
const mathAnswerEl = document.getElementById("mathAnswer");
const submitAnswerBtn = document.getElementById("submitAnswerBtn");
const mathFeedbackEl = document.getElementById("mathFeedback");
const mathSprintGame = document.getElementById("mathSprintGame");
const mathSprintStart = document.getElementById("mathSprintStart");
const mathSprintOver = document.getElementById("mathSprintOver");
const startSprintBtn = document.getElementById("startSprintBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const finalScoreEl = document.getElementById("finalScore");
const newHighScoreEl = document.getElementById("newHighScore");

sprintBestEl.textContent = sprintBest;

function generateProblem() {
  const operators = ["+", "-", "×"];
  const operator = operators[Math.floor(Math.random() * operators.length)];
  let num1, num2, answer;
  
  const difficulty = Math.min(Math.floor(sprintScore / 5), 3);
  const maxNum = 10 + difficulty * 10;
  
  if (operator === "+") {
    num1 = Math.floor(Math.random() * maxNum) + 1;
    num2 = Math.floor(Math.random() * maxNum) + 1;
    answer = num1 + num2;
  } else if (operator === "-") {
    num1 = Math.floor(Math.random() * maxNum) + 1;
    num2 = Math.floor(Math.random() * num1) + 1;
    answer = num1 - num2;
  } else {
    num1 = Math.floor(Math.random() * (maxNum / 2)) + 1;
    num2 = Math.floor(Math.random() * 10) + 1;
    answer = num1 * num2;
  }
  
  currentProblem = { num1, num2, operator, answer };
  mathNum1El.textContent = num1;
  mathNum2El.textContent = num2;
  mathOperatorEl.textContent = operator;
  mathAnswerEl.value = "";
  mathAnswerEl.focus();
}

function startSprint() {
  sprintTime = 60;
  sprintScore = 0;
  sprintTimeEl.textContent = sprintTime;
  sprintScoreEl.textContent = sprintScore;
  mathFeedbackEl.textContent = "";
  mathFeedbackEl.className = "";
  
  mathSprintStart.classList.add("hidden");
  mathSprintGame.classList.remove("hidden");
  mathSprintOver.classList.add("hidden");
  
  generateProblem();
  
  sprintInterval = setInterval(() => {
    sprintTime--;
    sprintTimeEl.textContent = sprintTime;
    if (sprintTime <= 0) endSprint();
  }, 1000);
}

function endSprint() {
  clearInterval(sprintInterval);
  mathSprintGame.classList.add("hidden");
  mathSprintOver.classList.remove("hidden");
  finalScoreEl.textContent = sprintScore;
  
  if (sprintScore > sprintBest) {
    sprintBest = sprintScore;
    localStorage.setItem("mathSprintBest", sprintBest);
    sprintBestEl.textContent = sprintBest;
    newHighScoreEl.classList.remove("hidden");
  } else {
    newHighScoreEl.classList.add("hidden");
  }
}

function checkAnswer() {
  const userAnswer = parseInt(mathAnswerEl.value);
  if (isNaN(userAnswer)) return; // BUG FIX: Ignore empty/invalid submissions
  
  if (userAnswer === currentProblem.answer) {
    sprintScore++;
    sprintScoreEl.textContent = sprintScore;
    mathFeedbackEl.textContent = "✓";
    mathFeedbackEl.className = "correct";
    generateProblem();
  } else {
    mathFeedbackEl.textContent = "✗ Try again!";
    mathFeedbackEl.className = "wrong";
    mathAnswerEl.value = "";
    mathAnswerEl.focus();
  }
}

startSprintBtn.addEventListener("click", startSprint);
playAgainBtn.addEventListener("click", startSprint);
submitAnswerBtn.addEventListener("click", checkAnswer);
mathAnswerEl.addEventListener("keypress", (e) => {
  if (e.key === "Enter") checkAnswer();
});
