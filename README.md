<div align="center">

# ⏰ ThinkToWake

**A brain-training alarm clock that forces you to solve puzzles before you can silence it.**

Installable PWA · No frameworks · No server · No account

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-brightgreen?style=for-the-badge)](https://Sanjay1318.github.io/ThinkToWake/)
[![Version](https://img.shields.io/badge/Version-2.0-blue?style=for-the-badge)](https://github.com/Sanjay1318/ThinkToWake/releases)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge)](https://Sanjay1318.github.io/ThinkToWake/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[🚀 Live Demo](https://Sanjay1318.github.io/ThinkToWake/) · [📱 Install as App](#install-as-an-app-pwa) · [📖 How It Works](#how-it-works) · [🛠 Features](#features)

</div>

---

## What is ThinkToWake?

Most people hit snooze without even waking up. ThinkToWake forces your brain to actually engage — you have to correctly solve math, logic, English, science, or geography questions before the alarm stops. Wrong answer? Buttons disappear, a lockout timer runs, then you try again with reshuffled options.

It's a web app. No install required. Works on any device with a browser.

---

## Features

### ⏰ Alarm
- **Multiple named alarms** — each with its own time, sound, repeat schedule, vibration, and reminder note
- **Repeat modes** — Once / Every day / Custom days of the week
- **Reliable alarm checker** — per-day fire-key system, fires exactly once regardless of tab throttling
- **3 difficulty levels:**

  | Difficulty | Questions | Wrong-answer lockout | Category hints |
  |---|---|---|---|
  | Easy | 2 | 5 seconds | ✅ Shown |
  | Medium | 3 | 10 seconds | ✅ Shown |
  | Hard | 5 | 15 seconds | ❌ Hidden |

- **Wrong answer = lockout** — options disappear, countdown runs, reshuffle on retry
- **5 question categories** — Math, English, Logic, Science, Geography (98+ questions)
- **Infinite math problems** — dynamic generator kicks in when static bank exhausted
- **Sound fallback** — Web Audio API synthesised beep if no MP3 found; never silent
- **Alarm banner** — pulsing banner if you switch tabs while alarm rings

### ⏱️ Stopwatch
- Large split display `MM:SS` + superscript centiseconds
- Lap tracking with per-lap delta times; fastest lap highlighted green

### ⏳ Timer
- Animated SVG ring drains as countdown runs
- Pause / Resume · Presets: 1m · 5m · 10m · 15m · 25m · 30m
- Separate audio from alarm — no conflicts

### 🧮 Math Sprint
- 60-second speed-math challenge with adaptive difficulty
- Persistent high score

### 📊 Dashboard
- Day streak with motivational messages
- 7-day bar chart · weekly solve time, accuracy, alarm count
- Session history with difficulty, time, accuracy

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
├── script.js               ← All logic (~1 070 lines)
├── style.css               ← CSS variables + themes (~1 913 lines)
├── questions.js            ← 98+ questions + dynamic generator
├── manifest.json           ← PWA manifest
├── service-worker.js       ← Offline cache (cache-first strategy)
├── README.md
├── .gitignore
└── assets/
    ├── alarm.mp3
    ├── icons/
    │   ├── icon-192.png    ← PWA home screen icon
    │   └── icon-512.png    ← PWA splash icon
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
6.  ⏳  "Start 5-min Focus Timer" → jumps to Timer, pre-filled, ready to go
7.  📊  Dashboard auto-updates streak + weekly stats
```

---

## Deployment

### Option 1 — Live now (GitHub Pages)
```
https://Sanjay1318.github.io/ThinkToWake/
```

### Option 2 — Run locally
```bash
# Simple open (no PWA)
open index.html

# Full PWA locally (service worker needs a server)
npx serve .
# then open http://localhost:3000
```

### Option 3 — Netlify Drop (10 seconds)
1. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)**
2. Drag the `ThinkToWake/` folder onto the page
3. Get a live URL instantly

### Option 4 — Any static host
Upload folder as-is. No server config needed. Works on Cloudflare Pages, Vercel, Firebase Hosting, Surge.sh, shared hosting.

---

## Install as an App (PWA)

ThinkToWake is a **Progressive Web App** — install it on any device like a native app, no app store required.

### Android (Chrome)
1. Open the live URL in Chrome
2. Tap **⋮ menu → "Add to Home Screen"**
3. Tap **Install** — appears on home screen with its own icon

### iPhone / iPad (Safari)
1. Open the URL in Safari
2. Tap **Share (□↑) → "Add to Home Screen"**
3. Tap **Add** — opens full-screen like a native app

### Desktop (Chrome / Edge)
1. Open the URL
2. Click the **⊕ install icon** in the address bar

### After installing
- Opens full-screen, no browser UI
- Works **completely offline** after first load
- Loads instantly every time

---

## Alarm Behaviour Reference

| Situation | Behaviour |
|---|---|
| Alarm fires on a different tab | Pulsing banner — tap **Solve** to return |
| "Once" alarm fires | Auto-disables — won't ring again tomorrow |
| No alarm.mp3 found | Falls back to Web Audio API beep — never silent |
| Timer finishes while alarm rings | Separate `<audio>` element — no conflict |
| Tab throttled by browser | Fire-key system ensures alarm fires exactly once |
| Wrong answer clicked | Options hidden → lockout → shuffled retry |
| All static questions used | Dynamic math generator produces infinite fresh problems |

---

## Question Bank

| Category | Count | Notes |
|---|---|---|
| Math | 30 static + ∞ dynamic | Easy/Medium/Hard tiers |
| English | 24 | Antonyms, synonyms, word meanings |
| Logic | 19 | Number sequences, letter patterns |
| Science | 13 | Biology, physics, chemistry, astronomy |
| Geography | 12 | Capitals, rivers, continents, currencies |
| **Total** | **98 static + ∞** | |

---

## Data & Privacy

All data stored in `localStorage`. Nothing sent anywhere, ever.

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
| Firefox 88+ | ✅ Full (no PWA install prompt) |
| Safari 14+ | ✅ Full (iOS PWA via Add to Home Screen) |
| Mobile Chrome (Android) | ✅ Full including vibration + install |
| Mobile Safari (iOS 15+) | ✅ Full (no vibration) |
| Internet Explorer | ❌ Not supported |

---

## Known Limitations

- **Tab must be open** — browser limitation, not fixable without push notifications
- **No cloud sync** — data lives in one browser on one device
- **iOS vibration** — Vibration API not supported on iOS

---

## Roadmap

- [ ] Android app via Android Studio + WebView
- [ ] Firebase integration — cloud sync + push notifications
- [ ] Web Push Notifications (alarm when tab is hidden)
- [ ] Export / import alarms and history as JSON
- [ ] More question categories

---

## Changelog

### v2.0 — Current
- ✅ PWA support — installable on Android, iOS, Desktop
- ✅ Service worker — full offline support
- ✅ 5 question categories (added Science + Geography)
- ✅ 98 static questions + infinite dynamic math generator
- ✅ Alarm checker rewritten — fire-key system, no missed alarms
- ✅ Bug fixes: timer picker toggle, audio hoisting, sound conflicts

### v1.0
- ✅ Multi-alarm system with localStorage
- ✅ Stopwatch, Timer, Math Sprint, Dashboard
- ✅ Difficulty modes, question deduplication
- ✅ Web Audio API fallback, theme system

---

## Tech Stack

Vanilla HTML5 · CSS3 · ES2020 JavaScript · Web Audio API · Service Worker  
**Zero dependencies. Zero build tools. Zero frameworks.**

---

*MIT License — Sanjay1318*
