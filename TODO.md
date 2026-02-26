# ThinkToWake - TODO & Changelog

## ✅ Completed Features

### Core App
- [x] Alarm setup with time picker
- [x] Cancel alarm button
- [x] Alarm fires correctly (handles past times → schedules next day)
- [x] Question-based alarm dismissal (math, english, logic)
- [x] Difficulty selector — Easy (2q), Medium (3q), Hard (5q)
- [x] Wrong answer cooldown lock timer
- [x] Question deduplication within a session
- [x] Progress dots indicator
- [x] Category badges (hidden on Hard difficulty)
- [x] Completion screen with solve time, attempts, accuracy

### Stopwatch
- [x] Start / Stop / Reset
- [x] Lap tracking

### Timer
- [x] Countdown with hours/minutes/seconds inputs
- [x] Pause / Resume
- [x] Preset buttons (1, 5, 10, 15 min)
- [x] Input validation (min/max clamping)
- [x] Alarm sound on completion
- [x] Sound stops when Cancel is pressed

### Math Sprint
- [x] 60-second speed math challenge
- [x] Adaptive difficulty (gets harder as score increases)
- [x] High score tracking via localStorage

### Dashboard
- [x] Day streak tracking
- [x] Weekly stats (alarms, avg solve time, avg accuracy)
- [x] Math Sprint best score
- [x] Recent alarm history with difficulty badges

### UX
- [x] Toast notification system (success, error, info, warning)
- [x] Persistent alarm banner when alarm rings on another screen
- [x] Clicking ⏰ Alarm nav tab dismisses banner and goes to alarm
- [x] Free navigation between non-alarm tabs while alarm is pending
- [x] Body padding so banner never overlaps content

---

## 🐛 Bug Fixes Applied

| # | Bug | Fix |
|---|-----|-----|
| 1 | Progress dots showed all 5 regardless of difficulty | Only render dots up to `totalQuestions` |
| 2 | Duplicate timer tick logic | Extracted into `startTimerTick()` |
| 3 | Wrong feedback class in lock timer | Changed to `locked` class consistently |
| 4 | Alarm missed by ~1 min (string comparison) | Switched to proper `Date` object comparison |
| 5 | Repeated questions in same alarm session | Added `askedQuestionHashes` deduplication |
| 6 | Math Sprint used alarm sound | Removed — Sprint has its own end behavior |
| 7 | `statusText` box always visible (empty but styled) | Hidden by default, shown via `setStatusText()` |
| 8 | Timer alarm sound couldn't be stopped | Added `timerSoundPlaying` flag, Cancel stops sound |
| 9 | 0% accuracy when all answers correct | Fallback to 100% when `totalAttempts === 0` |
| 10 | Double-click during correct answer transition | Disabled all option buttons immediately on correct |
| 11 | `sprintBest` stale after new high score | Dashboard always reads fresh from `localStorage` |
| 12 | `checkAnswer()` fired on empty input | Added `isNaN` guard |
| 13 | Missing `history-difficulty` CSS badges | Added color-coded easy/medium/hard styles |
| 14 | `innerText` used throughout | Replaced with `textContent` (correct, no reflow) |
| 15 | Timer cancel reset inputs but display stayed wrong | `updateTimerDisplayFromInputs()` called on cancel |
| 16 | Alarm fired immediately if time already passed | Adds 1 day if target time is in the past |
| 17 | Focus Session auto-started timer | Now just sets inputs, user presses Start manually |
| 18 | Nav blocked all tab switching when alarm rang | Only blocks leaving the alarm screen; other tabs freely accessible |
| 19 | Alarm banner covered page content/buttons | Added `padding-bottom: 100px` to body |
| 20 | Clicking ⏰ Alarm tab didn't dismiss banner | Alarm tab always calls `goToAlarmScreen()` directly |

---

## 🚀 Future Ideas

- [ ] Multiple alarms support
- [ ] Custom alarm sound upload
- [ ] Snooze with penalty (harder questions after snooze)
- [ ] PWA support (installable, works offline)
- [ ] Push notifications for alarm (Web Notifications API)
- [ ] More question categories (science, geography, trivia)
- [ ] Themes / colour customisation
- [ ] Export history as CSV
- [ ] Shareable Math Sprint scores
