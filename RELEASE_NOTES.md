# ThinkToWake v2.0

> Brain-training alarm clock — solve puzzles to silence the alarm.

## What's New in v2.0

### 📱 PWA — Installable as an App
- Added `manifest.json` and `service-worker.js`
- Install directly on Android, iOS, or Desktop — no app store needed
- Works fully offline after first load (cache-first service worker)
- App icons included (192×192 and 512×512)

### 🧠 Expanded Question Bank
- **25 → 98 static questions** across 5 categories
- New categories: **Science** (13 questions) and **Geography** (12 questions)
- All questions tagged Easy / Medium / Hard for proper difficulty matching
- **Infinite dynamic math generator** — when the static bank runs out, fresh problems are generated on the fly. You will never see the same question twice in a session.

### 🔧 Alarm Checker Rewrite
- Replaced the fragile `seconds ≤ 2` guard with a **per-day fire-key system**
- Each alarm gets a unique key (`alarmId:YYYY-MM-DD`) — fires exactly once per day
- No more missed alarms due to tab throttling or browser lag
- Stale keys are pruned automatically at midnight

### 🐛 Bug Fixes
- `timerSoundPlaying` variable hoisting error fixed (was declared after first use)
- Timer input picker now correctly hides when countdown starts and reappears on cancel
- Alarm and timer now use separate `<audio>` elements — no more sound conflicts
- Service worker cache version bumped to `v2` — updates deploy cleanly
- Manifest `start_url` changed to `./` for better hosting compatibility

---

## Installation

**Web (no install needed):**
👉 https://Sanjay1318.github.io/ThinkToWake/

**As an app on Android:**
Open the link in Chrome → ⋮ menu → Add to Home Screen

**As an app on iPhone:**
Open in Safari → Share → Add to Home Screen

---

## Coming Next (v3.0 Plan)
- Android app via Android Studio + WebView
- Firebase — cloud sync + push notifications for background alarms
- Web Push Notifications
- Export / import alarms as JSON
