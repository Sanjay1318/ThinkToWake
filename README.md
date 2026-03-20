<div align="center">

# ⏰ ThinkToWake

**A brain-training alarm clock that forces you to solve puzzles before you can silence it.**

Installable PWA · No frameworks · No server · No account · Open `index.html` and go.

[🚀 Deploy](#deployment) · [📱 Install as App](#install-as-an-app-pwa) · [📖 How It Works](#how-it-works) · [🛠 Features](#features)

</div>

---

## Features

### ⏰ Alarm
- **Multiple named alarms** — each with its own time, sound, repeat schedule, vibration, and reminder note
- **Repeat modes** — Once / Every day / Custom days of the week
- **Reliable alarm checker** — uses a per-day fire-key system so each alarm fires exactly once regardless of tab throttling or lag
- **3 difficulty levels:**

  | Difficulty | Questions | Wrong-answer lockout | Category hints |
  |---|---|---|---|
  | Easy | 2 | 5 seconds | ✅ Shown |
  | Medium | 3 | 10 seconds | ✅ Shown |
  | Hard | 5 | 15 seconds | ❌ Hidden |

- **Wrong answer = lockout** — options disappear, countdown runs, options reshuffle on retry
- **5 question categories** — Math, English, Logic, Science, Geography (90+ questions)
- **Infinite math problems** — dynamic generator kicks in when the static bank is exhausted
- **Sound fallback** — Web Audio API synthesised beep if no MP3 file is found; never silent
- **Alarm banner** — pulsing red banner if you switch tabs while alarm rings

### ⏱️ Stopwatch
- Large split display `MM:SS` + superscript centiseconds
- Lap tracking with per-lap delta times; fastest lap highlighted green

### ⏳ Timer
- Animated SVG ring drains as countdown runs
- Pause / Resume · Presets: 1m · 5m · 10m · 15m · 25m · 30m
- Separate audio from alarm — no conflicts

### 🧮 Math Sprint
- 60-second speed-math: +, −, × with adaptive difficulty
- Persistent high score

### 📊 Dashboard
- Day streak with motivational messages
- 7-day bar chart · weekly solve time, accuracy, alarm count
- Session history: last 10 solves with difficulty, time, accuracy

### ⚙️ Settings
- 4 themes — Forest 🌲 / Ocean 🌊 / Dusk 🌇 / Midnight 🌙
- Default sound (Classic / Digital / Bell / Custom upload)
- Default vibration and difficulty for new alarms
- Clear history / reset streak

---

## Project Structure

```
ThinkToWake/
├── index.html              ← App shell — all screens
├── script.js               ← All logic  (~1 070 lines)
├── style.css               ← CSS variables + themes  (~1 913 lines)
├── questions.js            ← 90+ questions + dynamic generator
├── manifest.json           ← PWA manifest
├── service-worker.js       ← Offline cache (cache-first strategy)
├── README.md
├── .gitignore
└── assets/
    ├── alarm.mp3
    ├── icons/
    │   ├── icon-192.png    ← PWA home screen icon
    │   └── icon-512.png    ← PWA splash / store icon
    └── sounds/
        ├── digital.mp3
        └── bell.mp3
```

---

## How It Works

```
1.  ⏰  Tap "+ Add" → set time, sound, repeat, optional reminder → Save
2.  ⏰  At alarm time: sound plays + question screen appears
3.  🧠  Answer all questions correctly to dismiss
4.  ❌  Wrong answer → lockout timer → shuffled retry
5.  🎉  Completion screen: solve time · attempts · accuracy · reminder note
6.  ⏳  "Start 5-min Focus Timer" → jumps to Timer, pre-filled, doesn't auto-start
7.  📊  Dashboard auto-updates streak + weekly stats
```

---

## Deployment

### Option 1 — Local (zero setup)
```bash
open ThinkToWake/index.html       # macOS
start ThinkToWake/index.html      # Windows
xdg-open ThinkToWake/index.html   # Linux
```
> **Note:** Service worker requires a web server to register.  
> For full PWA locally: `npx serve ThinkToWake` or `python3 -m http.server 8080`

---

### Option 2 — GitHub Pages (free permanent URL)
```bash
cd ThinkToWake
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ThinkToWake.git
git push -u origin main
```
**GitHub → Settings → Pages → Source: `main / (root)` → Save**  
Live at `https://YOUR_USERNAME.github.io/ThinkToWake/` within ~60 seconds.

---

### Option 3 — Netlify Drop (10 seconds)
1. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)**
2. Drag the `ThinkToWake/` folder onto the page
3. Get a live URL instantly

---

### Option 4 — Vercel
```bash
npm i -g vercel && cd ThinkToWake && vercel
```

---

### Option 5 — Any static host
Upload the folder as-is. No `.htaccess`, no environment variables, no server config.  
Works on Cloudflare Pages, Surge.sh, Firebase Hosting, Railway, shared hosting.

---

## Install as an App (PWA)

ThinkToWake is a **Progressive Web App** — install it on any device like a native app,
no app store required.

### Android (Chrome)
1. Open the deployed URL in Chrome
2. Tap the **⋮ menu → "Add to Home Screen"** (or the install banner that appears)
3. Tap **Install** — it appears on your home screen with its own icon

### iPhone / iPad (Safari)
1. Open the URL in Safari
2. Tap the **Share button (□↑) → "Add to Home Screen"**
3. Tap **Add** — appears on home screen, opens full-screen like a native app

### Desktop (Chrome / Edge)
1. Open the URL
2. Click the **install icon (⊕)** in the address bar, or **⋮ menu → "Install ThinkToWake"**

### What you get after installing
- Opens full-screen with no browser chrome
- Works **completely offline** after first load (service worker caches all assets)
- App icon on home screen / desktop
- Loads instantly on every subsequent open

---

## Alarm Behaviour Reference

| Situation | Behaviour |
|---|---|
| Alarm fires on a different tab | Red pulsing banner — tap **Solve** to return |
| "Once" alarm fires | Auto-disables — won't ring again tomorrow |
| No alarm.mp3 found | Falls back to Web Audio API beep — never silent |
| Timer finishes while alarm rings | Uses a separate `<audio>` element — no conflict |
| Tab throttled by browser | Fire-key system ensures alarm fires exactly once even if checker runs late |
| Wrong answer clicked | Options hidden → lockout countdown → shuffled retry |
| All static questions used | Dynamic math generator produces infinite fresh problems |

---

## Question Bank

| Category | Count | Notes |
|---|---|---|
| Math | 30 static + ∞ dynamic | Easy/Medium/Hard tiers; dynamic generator never repeats |
| English | 24 | Antonyms, synonyms, word meanings |
| Logic | 19 | Number sequences, letter patterns, series completion |
| Science | 13 | Biology, physics, chemistry, astronomy |
| Geography | 12 | Capitals, rivers, continents, currencies |
| **Total** | **98 static + ∞** | |

---

## Data & Privacy

All data stored locally in `localStorage`. Nothing ever sent anywhere.

| Key | Contents |
|---|---|
| `ttw_alarms` | Saved alarms |
| `ttw_settings` | Theme, default sound/difficulty/vibrate |
| `ttw_alarmHistory` | Last 60 solved sessions |
| `ttw_streak` | Streak + last active date |
| `mathSprintBest` | Math Sprint high score |

---

## Browser Support

| Browser | Support |
|---|---|
| Chrome / Edge 90+ | ✅ Full including PWA install |
| Firefox 88+ | ✅ Full (no PWA install prompt, but works as a web app) |
| Safari 14+ | ✅ Full (iOS PWA via "Add to Home Screen") |
| Mobile Chrome (Android) | ✅ Full including vibration + install |
| Mobile Safari (iOS 15+) | ✅ Full (no vibration) |
| Internet Explorer | ❌ Not supported |

---

## Known Limitations

- **Tab must be open** for alarm to fire (web limitation — not fixable without push notifications)
- **No cloud sync** — data lives in one browser on one device
- **iOS vibration** — Vibration API not supported on iOS; silently ignored

---

## Roadmap

- [ ] Web Push Notifications (alarm even when tab hidden)
- [ ] Export / import alarms and history as JSON
- [ ] More question categories (trivia, general knowledge)
- [ ] Shareable Math Sprint scores

---

## Tech Stack

Vanilla HTML5 · CSS3 (custom properties, SVG) · ES2020 JavaScript · Web Audio API · Service Worker  
**Zero dependencies. Zero build tools. Zero frameworks.**

---

*MIT License — do whatever you want with it.*
