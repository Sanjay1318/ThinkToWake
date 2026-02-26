# ⏰ ThinkToWake

A brain-training alarm clock web app that makes you solve puzzles to silence the alarm — so you actually wake up!

## Features

- **🧠 Smart Alarm** — Solve math, logic, or English questions to dismiss the alarm
- **🎯 Difficulty Levels** — Easy (2 questions), Medium (3), Hard (5) with increasing lock times
- **⏱️ Stopwatch** — Full-featured stopwatch with lap tracking
- **⏳ Timer** — Countdown timer with presets, pause/resume support
- **🧮 Math Sprint** — 60-second speed math challenge with high score tracking
- **📊 Dashboard** — Weekly stats, accuracy tracking, day streak, and alarm history

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ThinkToWake.git
   cd ThinkToWake
   ```

2. Add your alarm sound:
   - Place an `alarm.mp3` file in the `assets/` directory

3. Open `index.html` in your browser — no build step needed!

## Project Structure

```
ThinkToWake/
├── index.html        # App shell & all screens
├── script.js         # App logic (alarm, timer, stopwatch, math sprint)
├── style.css         # Dark theme styling
├── questions.js      # Question bank (math, english, logic)
├── assets/
│   └── alarm.mp3     # Alarm sound (add your own)
└── README.md
```

## How It Works

1. Set an alarm time and choose a difficulty
2. When the alarm rings, answer questions correctly to dismiss it
3. Wrong answers trigger a cooldown lock timer before you can try again
4. Complete all questions to silence the alarm and see your stats

## Data & Privacy

All data (alarm history, streaks, high scores) is stored locally in your browser's `localStorage`. No data is sent to any server.

## Browser Support

Works in any modern browser (Chrome, Firefox, Safari, Edge). No dependencies or build tools required.
