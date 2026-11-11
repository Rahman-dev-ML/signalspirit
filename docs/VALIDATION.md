# Verification — Mobile Edition 5.0

## Passed
- Production Vite build and Capacitor sync for Android and iOS. Every bundled production asset was byte-compared with dist on both native projects.
- 21 automated simulation/save tests: all 12 introductory levels, level 12 to 13 transition, 200 consecutive generated levels (13–212), and levels 500, 1,000, 10,000 and 1,000,000 completed using ordinary signal/crosswalk controls. Deterministic restore, traffic spacing, junction interlocks, scoring and storage denial covered.
- Headless Chromium touch and layout checks: 320×568, 360×640, 390×844, 412×915, 667×375, 844×390, 1024×768 and 768×1024.
- Simulated safe areas at four phone sizes including portrait and landscape notches; generated-level status and controls do not overlap.
- Tap acknowledgement, repeated-tap explanation, one queued cooldown input, actual signal transition, pause, reload/resume, level 12→13 UI flow and persistent settings.
- Production-only smoke test: debug API absent even with ?debug; actual lights change on touch; timer freezes while paused; no page errors or external game requests observed.
- Production files contain no Playgama, Yes2SDK or YouTube publisher SDK. Native icons, launch images and iOS privacy manifest included.

## Limits and release gates
These are sampled automated tests, not proof of flawless play or retention for every generated level. Difficulty parameters grow with safety bounds; individual random layouts and weather cycles vary in perceived difficulty.

Android native compilation was attempted in this workspace but dependency resolution encountered network download failures. No verified installable APK or signed release AAB is supplied unless separately identified with a successful build record. The project must be compiled and tested in Android Studio before store submission.

iOS compilation requires macOS/Xcode and was not run here. Physical Android/iPhone/iPad behavior, long-session performance, OS interruptions, device vibration, native save restoration and final signing must be verified on the native builds. Browser safe-area simulations are not a substitute for those tests.

The project is a playable game implementation and native source kit, not evidence of store certification. Read STORE-RELEASE.md for signing, privacy hosting, TestFlight/internal testing and console steps.
