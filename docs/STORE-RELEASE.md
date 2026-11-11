# Release Signal Sprint on Google Play and the App Store

This is the standalone mobile edition, not a Playgama/Yes2Games/YouTube bundle. All game assets are packaged locally. No publisher login, advertising account, backend or remote game service is needed to play.

## Identity
- App name: Signal Sprint
- Android package / iOS bundle identifier: `com.thelunox.signalsprint`
- Android version: 5.0, versionCode 50000
- iOS marketing version: 5.0
- New game listing: do not upload it as an update to Ghost Escape, which is a different app and package.

## Install tools once
Node.js 22.12+ (24 recommended). Run `npm ci` in this project folder. The lockfile pins all dependencies.
Android: Android Studio, Android SDK Platform 36, Build Tools 36 and JDK 21. iOS: a Mac with Xcode 26+ and your Apple Developer signing team. Windows cannot build/sign the iOS app locally.

## Android: generate the upload bundle
1. Run `npm run build`, then `npx cap sync android`.
2. Open the `android` folder in Android Studio, or run `npx cap open android`.
3. Test the game on your connected phone or an Android emulator.
4. Choose Build → Generate Signed App Bundle / APK → Android App Bundle.
5. Select your OWN upload keystore, or create one for this new listing. Keep it backed up. A debug key is not a production upload key.
6. Build the release variant and upload the signed AAB to the Signal Sprint Play Console listing. First use internal testing, then your account's production-access process.

The Gradle project targets API 36, which matches Google's requirement effective 31 August 2026. The included native project uses normal Google/Maven Central repositories; this workspace's private build-tool/cache configuration is not part of the project. Signing keys/passwords are never embedded in the source.

## iOS: archive and upload
1. On your Mac, run `npm ci`, `npm run build`, then `npx cap sync ios`.
2. Open `ios/App/App.xcodeproj` or run `npx cap open ios`. The project uses Swift Package Manager; let Xcode resolve dependencies.
3. Select your Apple Developer team under Signing & Capabilities; keep the bundle ID consistent with your App Store Connect listing.
4. Test on an iPhone and iPad. Verify safe areas, rotation, touch, audio, background pause and saved progress.
5. Choose a generic iOS device, Product → Archive, then Distribute App → App Store Connect. Use TestFlight before release.

An iOS privacy manifest declaring app-local UserDefaults use (CA92.1) is included and registered in Copy Bundle Resources. No tracking or third-party SDK data collection is declared because this release has no analytics/advertising SDK.

## Listing material
- Icon files: `store-assets/icon-512.png` (Google Play) and `icon-1024.png` (Apple).
- Privacy page: `public/privacy.html`. Host this publicly on your own site and put that live URL in both store forms. The bundled file alone is not a public policy URL.
- Capture final listing screenshots from the built app/device at the sizes requested by each console. Automated browser previews used during development are not physical native-device captures.
- In review notes: no login required; offline single-player game; tap the large directional switch or the road to change lights; amber clearance is intentional; the journey continues beyond level 12; no ads or purchases.
- Category: Games → Strategy or Arcade as the console permits. Secondary tags: traffic, casual, time management, single player, offline.

## Suggested store description
Signal Sprint puts a living city in your hands. Switch the lights, read the queues and keep the junction flowing through an endless journey of traffic challenges. Guide buses and ambulances, make room for pedestrians and adapt to rain and changing demand. Replay for cleaner runs, chase a Survival best, or take on the Daily Dispatch. Play offline with touch controls, sound options, reduced motion and high contrast.

## Data declarations for this release
The game has no accounts, external telemetry, ad SDK, purchases or third-party publishing services. Scores, progress and settings stay on device; system backup may include preferences. Native haptics and system lifecycle plugins are included. Recheck store declarations if you later add monetization, analytics, accounts or online features. The current build is English-only. Supply accurate age-rating and content answers for your final build.

## What this package cannot supply
Your developer accounts, app listing, upload key, Apple certificates/provisioning, policy hosting URL and store approval. Any supplied Android debug APK is an installable test build, not the signed Google Play release. A compiled unsigned AAB, if present, must be signed with your own upload key. The iOS project requires Xcode compilation; an IPA is not manufactured on Linux.

## Official references checked 19 October 2026
https://developer.android.com/google/play/requirements/target-sdk
https://capacitorjs.com/docs/getting-started/environment-setup
https://capacitorjs.com/docs/android
https://capacitorjs.com/docs/ios
https://capacitorjs.com/docs/apis/preferences
https://capacitorjs.com/docs/ios/privacy-manifest
https://developer.apple.com/app-store/review/guidelines/
