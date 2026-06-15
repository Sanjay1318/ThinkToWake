# ThinkToWake

> Brain-training alarm clock — solve questions before the alarm stops.

A browser-based alarm clock that makes you solve puzzles before the alarm stops.


ThinkToWake is a zero-dependency PWA: no framework, no backend, no account, and all data stays in `localStorage`.

## Highlights (v3.3)

- Multiple named alarms with repeat modes, custom days, reminder notes, vibration, and per-alarm sounds.
- Puzzle unlock flow with Easy, Medium, and Hard difficulty.
- Quick alarm presets for +15m, +30m, and +1h.
- Stopwatch with lap splits.
- Countdown timer with presets and animated progress ring.
- 60-second Math Sprint mini-game with persistent best score.
- Dashboard with streaks, weekly chart, recent activity, and Wake Score.
- Settings for themes (manual + auto), default sound, default difficulty, timer audio, push reminders, and local data controls.
- Export/import backup for alarms, settings, history, streak, and sprint best.
- Installable PWA with offline support after first load (service worker cache).


## Run Locally

Open `index.html` directly for a quick preview.

Tip: after changes, hard-refresh once to pick up the latest code while testing service-worker behavior.


For full PWA/service-worker behavior, serve the folder:

```bash
npx serve .
```

Then open the shown local URL.

## Project Structure

```text
ThinkToWake/
├── index.html
├── script.js
├── style.css
├── questions.js
├── manifest.json
├── service-worker.js
├── README.md
└── assets/
    ├── alarm.mp3
    ├── icons/
    └── sounds/
```

## Data Stored Locally

- `ttw_alarms`
- `ttw_settings`
- `ttw_alarmHistory`
- `ttw_streak`
- `mathSprintBest`

Use Settings -> Data -> Export to create a JSON backup.

## Version / Release Notes

### v3.3
- UI/UX refinements (calmer layout, improved flow consistency across screens).
- Keyboard accessibility shortcuts for faster interaction during alarms, Timer, and Math Sprint.
- Settings UX: added missing **Reset streak** action.

### v2.0 (historical)
- Installable PWA via `manifest.json` + `service-worker.js` with offline support after first load.
- Expanded 98-question bank + infinite dynamic math generator.
- Alarm checker rewrite (per-day fire-key system) to prevent missed alarms due to throttling.
- Audio/bug fixes and updated cache versioning.

> See `RELEASE_NOTES.md` for the full v2.0 changelog.

## Browser Support

Modern Chrome, Edge, Firefox, and Safari are supported.

Notes:
- **PWA installability** depends on browser/platform support.
- **Vibration** and **notifications** may require user permissions.

## Limitations

- **Browser-based alarms** require the page/tab to remain available for best reliability (background/tab throttling can affect timing).
- **Offline support** works after the service worker has cached the app once.

