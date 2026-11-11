# Signal Sprint — Mobile Edition 5.2

A complete offline traffic-control game project for Android and iOS, plus its production web build. This is a new standalone mobile edition; existing publisher submissions are separate builds.

## Gameplay — 5.2 collision edition
- Four independently controlled traffic lights. Tap red to open; tap green to stop new cars through amber. Green stays on until you close it.
- Crossing greens really release crossing traffic. There is no vehicle conflict interlock. Actual contact causes a crash and ends the run.
- Each light shows its waiting queue's shortest remaining patience in seconds, labelled TO STRIKE. The bar drains, turns yellow, then flashes red below five seconds. Toggling a light never resets waiting time.
- Vertical red/amber/green lamps, direction arrows and large invisible touch targets sit off the roadway.
- Three patience strikes end the run; ambulance timeouts cost two. Campaign and Daily retain their goals and deadlines; Survival continues until failure.
- Same-lane following distances remain enforced. Cars already crossing continue after their signal closes. Pedestrian crossing requests still stop vehicle entry while pedestrians cross.
- Original dark Canvas/Vite/Capacitor game. Android and iOS web assets are synced. Native binaries are not compiled or signed in this update.

## Quick start
`npm ci`
`npm run dev`

## Build
`npm run build`
`npx cap sync`
`npm run android` or `npm run ios`

Read `docs/STORE-RELEASE.md` for exact signing and publishing steps. Your Apple/Google accounts and production signing are still required. Store acceptance and commercial success cannot be guaranteed.

## Tests and evidence
`npm test` runs the simulation and save tests. For browser tests, run `npm install --no-save playwright@1.62.1` and `npx playwright install chromium`, create a separate test build with `VITE_TEST_API=1 npx vite build --outDir test-dist`, then run the three `tests/mobile-*.cjs` scripts. On Windows PowerShell, set `$env:VITE_TEST_API="1"` for that build and remove it before `npm run build`. Production builds omit the debug API.

`validation/` contains verification results from this revision. `docs/COMPETITOR-RESEARCH.md` records the competitor evidence and resulting decisions. Tests are automated samples, not a guarantee that every generated dispatch is equally fun or bug-free. Native hardware and iOS compilation results must be distinguished from browser testing.

## Project
- `src/mobile-main.js`: complete application and tap feedback
- `src/simulation.js`: traffic physics and safe interlocks
- `src/levels.js`: introduction, daily/survival configuration and procedural dispatches
- `src/renderer.js`: original Canvas city, vehicles, signals and effects
- `src/mobile-store.js`: validated local/native saves
- `src/native.js`: mobile lifecycle, back navigation and haptics
- `android/`: Android Studio project (API 36)
- `ios/App/App.xcodeproj`: Xcode project (SPM)
- `dist/`: production build bundled by both native apps

Developer: Lunox. Support: rahmanik124@gmail.com.
