# StudyGoblin (iOS via Capacitor)

A local-first student planner. Tasks, classes and notes live on the device. An optional AI assistant runs through
a small server you control, so **no API key ever ships in the app**.

```
www/          the app (index.html, app.css, app.js) + platform.js (replaces the Claude artifact runtime) + config.js
server/       AI proxy (Node, no dependencies). Holds ANTHROPIC_API_KEY.
scripts/      check.js, serve.js (browser preview), patch-ios.sh
assets/       icon-only.png, splash.png (optional generation, see step 7)
```

## Requirements (Mac)
Node 22+ (`node -v`), Xcode 26+ with an iOS Simulator runtime, and Xcode command line tools (`xcode-select --install`).
Capacitor 8 uses Swift Package Manager, so CocoaPods is not needed.

## Run it in the iOS Simulator

```bash
# 1. Unzip and install
unzip studygoblin-ios.zip && cd studygoblin
npm install

# 2. (Optional but recommended) enable real AI. Skip to run in labeled demo mode.
cp .env.example .env          # then edit .env and paste ANTHROPIC_API_KEY=...

# 3. Terminal A: start the AI server and leave it running
npm run server                # prints "API key loaded" or "NO API KEY: app will run in demo mode"

# 4. Terminal B: check, create the iOS project (first time only), sync web files
npm run check
npm run ios:add               # first time only: cap add ios + allow local-network http in Info.plist
npm run build                 # check + cap sync ios   (re-run after ANY change in www/)

# 5. Launch
npm run ios:run               # pick a simulator when prompted (or: npx cap run ios --list, then --target <ID>)
#    or: npm run ios:open     # opens Xcode; choose a simulator, press Run

# 6. Optional: preview in a desktop browser instead
npm run web                   # http://localhost:8080

# 7. Optional: generate icons/splash from assets/
npx @capacitor/assets generate --ios
```

If the AI server is not running (or has no key), the app starts in **Demo mode** and says so in the Goblin tab.
Start the server and relaunch the app to switch to real AI. The server is checked at app launch.

## Calendar (data model)
Calendar items are derived, not duplicated: task due dates come from `tasks[].due` (plus optional `dueTime`), and `S.events` holds only
user-entered, timed records: `{id,type:'class'|'session'|'event',date,start,end,...}`. Sessions link to a task by `taskId`; moving or deleting a
session never touches the task's deadline. Classes repeat weekly (`days`, optional `until`). Deleting a task also deletes its sessions.

## Assignment extraction (on-device, no AI needed)
"Dump It Here" is read by `www/extract.js`: rules plus a hand-written date parser. It is the default everywhere (web, iPhone, and the Claude page). It needs
no key, no network and no setup, and nothing leaves the device unless the student taps **Improve with AI** on the review screen (only shown when an AI server is
configured, and only after a consent prompt). Every result goes through the review screen: dates worked out from wording ("Thursday", "tomorrow") are flagged as
inferred; ambiguous ones ("next Friday", "Oct 20 or 21", "end of the month", "the Friday after") are left empty with a question; a date is never copied onto an item
that did not state one (except a date in a list header, like "Due tomorrow: ..."); durations are read only when stated, never guessed, and ranges ("30-45 min") and
talk lengths ("5 minute presentation") are not turned into an estimate.

Run the tests with `npm test` (149 cases in 5 sets). Measured accuracy (Node, fixed "today" of 2026-10-14):
- Phase 1 set (43 cases), first run before any phase 1 code change: 86.7% of checked fields correct, 66% of tasks fully correct, 3 junk tasks, 5 wrong or invented dates.
- Phase 1b set (20 fresh cases), first run before further tuning: 88.2% of fields, 63% of tasks fully correct, 0 junk tasks, 0 invented dates.
- After fixing what those runs exposed, all five sets pass. Those sets are now tuned-on, so 100% is NOT a real-world accuracy figure; expect lower on real student
  messages. Add real examples to `tests/` as you collect them.
- Known limits: book titles do not imply a subject; lowercase "pride and prejudice" splits at "and"; US month/day dates and English only; items with no recognizable
  keyword, subject or date are missed; very long rambling prose may produce junk or nothing. The review screen is the safety net.

## What stays the same
Every screen, the data model (`localStorage` key `jarvis.v1`, kept so old data still loads), dump/review/duplicate
checks, breakdowns, session planner, confirm-before-changes for AI actions, consent prompt before any AI use,
export and delete-everything.

## What could not work outside Claude, and what replaced it
| Was (Claude artifact runtime) | Now |
|---|---|
| `claude.use('sample')`: AI through the viewer's Claude account | `platform.js` calls your server (`POST /api/ai`), which calls the Anthropic API with a key kept in `.env`. Same interface, so `app.js` is unchanged. |
| Consent handled by the artifact viewer | The app's own consent dialog (already present) is the only gate. Keep it. |
| `claude.use('downloads')` | Native: Filesystem + Share sheet. Browser: normal file download. |
| Artifact-private browser storage | WebView `localStorage`, mirrored to native Preferences because iOS can evict WebView storage. Delete-everything clears both. |
| Hosted page and share link | Not applicable. |
| Google Fonts | Still loaded from Google when online; offline falls back to system fonts. To bundle them, download the two families as woff2 into `www/fonts/` and add `@font-face` rules to `app.css`. |

Routing: the app is a single page with in-memory tab state, so no router is needed (the open tab is not remembered across launches).

## Before real devices or the App Store
- **Simulator** reaches `http://localhost:8787` directly. A **physical iPhone** cannot: set `API_BASE` in `www/config.js` to your Mac's LAN
  address (iOS will show a Local Network permission prompt; add `NSLocalNetworkUsageDescription` to Info.plist) or, better, a deployed HTTPS URL.
- The bundled server has **no user accounts**. It only limits origin, request size and rate (`RATE_PER_MIN`, `DAILY_LIMIT`). `APP_TOKEN` in
  `config.js` is visible to anyone who unpacks the app, so it is a deterrent, not security. Before public release, add real authentication
  and per-user quotas, deploy it behind HTTPS, and tighten `connect-src` in the CSP meta tag in `www/index.html` to your API host.
- The app can send student-written text to an AI provider. Before shipping, review App Store privacy disclosures and rules for minors.
- Model names default to `claude-sonnet-5-5` / `claude-haiku-5-5`; confirm they exist for your account (`MODEL_DEFAULT`, `MODEL_QUICK` in `.env`).
- Secrets: `.env` is git-ignored; `npm run check` fails if a key-like string appears under `www/`.

## Troubleshooting
- Blank screen: run `npm run build` again, then check `ios/App/App/public` contains `index.html`.
- "Demo mode" although the server runs: confirm the key loaded in the server log, `API_BASE` in `www/config.js`, then `npm run build` and relaunch.
- Xcode "No such module Capacitor": `npx cap sync ios`, then clean build (Shift+Cmd+K).
