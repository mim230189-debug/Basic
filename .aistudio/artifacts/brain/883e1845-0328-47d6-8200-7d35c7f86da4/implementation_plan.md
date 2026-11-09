# WINK NETWORK ISP — Native Android APK (Kotlin & Jetpack Compose WebView)

A complete architectural implementation plan to package the existing WINK NETWORK ISP Billing & Management System into a production-grade native Android application using Kotlin, Jetpack Compose, and an enterprise Android WebView integration.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following key decisions were confirmed during Phase 1 clarification:
> - **Application Package Name**: `bd.winknetwork.app`
> - **Primary Target URL**: Configurable custom domain URL with direct fallback to the live AI Studio Cloud Run deployment (`https://ais-pre-bsfdfp4dyahhgoweztv463-276943874327.asia-northeast1.run.app`).
> - **Invoice & Receipt Downloads**: Native Android `DownloadManager` integration with download notifications and direct storage saving for PDF billing statements.
> - **Network Loss & Offline Resilience**: Custom native Jetpack Compose offline screen rendered in Bengali with an instant retry trigger and direct hotline dialer (`tel:+8809600998877`).
> - **Zero Web Disruption**: The existing web codebase, Firebase Firestore collections, security rules, and Authentication remain 100% untouched and functional.

---

## 1. Overview & Core Concept

- **What It Does**: Wraps the full WINK NETWORK ISP web application (Admin, Employee, and Customer self-service portals) into a modern native Android app built with Kotlin and Jetpack Compose.
- **Target Audience**: ISP network administrators, field billing agents/technicians, and broadband customers across Bangladesh.
- **Key Value**: Provides an app-store installable APK with full-screen immersive navigation, device hardware back-button support, native file-picker integration (for customer payment slip uploads), native PDF invoice downloads, and an instant Bengali offline screen with direct ISP hotline dialing.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **App Launch & Splash Screen**:
   - High-performance native Compose splash screen showing the WINK NETWORK ISP emblem (`#0052CC` royal blue, `#FF6B00` electric orange, crisp white), animated scale/fade, transitioning directly into the web application.
2. **Main Application Navigation**:
   - Immersive edge-to-edge Android container.
   - Hardware / gesture back-button navigates back within the WebView browser history before prompting app exit.
   - Pull-to-refresh gesture triggers a clean refresh of the current ISP dashboard view.
3. **File Uploads & Receipt Viewing**:
   - When customers upload payment confirmation slips (bKash/Nagad/Rocket transaction screenshots), the Android `WebChromeClient` triggers the native Android photo/file picker (`ActivityResultLauncher`).
   - When invoices or receipts are downloaded, the native Android `DownloadManager` intercepts the request and saves the PDF into the device's public `Download/` directory with a system download notification.
4. **Offline Loss & Recovery Flow**:
   - When cellular/Wi-Fi connection drops, the app smoothly swaps to a native Bengali offline state screen with:
     - Clear Bengali message: "ইন্টারনেট সংযোগ বিচ্ছিন্ন রয়েছে"
     - "পুনরায় চেষ্টা করুন" (Retry) button
     - One-tap hotline call button to dial `+880 9600-998877` directly in the Android phone dialer.

### Visual Identity & Theme
- **Color Tokens**:
  - Dominant Blue: `#0B4FD8` (Wink ISP Royal Blue)
  - Accent Orange: `#FF6E14` (Wink Energy Orange)
  - Canvas / Surface: `#FFFFFF` (Light) / `#0F172A` (Dark slate matching web portal)
- **Typography**:
  - Matching the web portal with clean sans-serif display typography and Bengali Unicode support.

---

## 3. Key Product Decisions & Trade-Offs

- **Architecture Choice: Jetpack Compose + Modern Android WebView**:
  - *Chosen Approach*: Host an enterprise-configured `WebView` inside a Jetpack Compose `AndroidView`, layered with native Compose UI for splash, offline handling, and loading progress.
  - *Why*: Allows 100% feature preservation of the live ISP dashboards (Firebase Firestore real-time listeners, billing engine, reports) without maintaining two duplicate business logic engines or diverging database schemas.
- **Handling Android Downloads**:
  - *Chosen Approach*: Intercept `DownloadListener` and trigger native Android `DownloadManager`.
  - *Why*: Default WebView ignores blob/download URLs or opens them in blank screens. Using `DownloadManager` gives users real system download progress, status bar notifications, and files in their Android Files app.
- **Secure File Uploads**:
  - *Chosen Approach*: Implement `WebChromeClient.onShowFileChooser` using Compose `rememberLauncherForActivityResult`.
  - *Why*: Ensures payment screenshot attachments in customer payment requests function seamlessly on Android 10 through Android 15+.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                   ANDROID HARDWARE LAYER                    │
│   Back Gestures  │  Storage / Files  │  Phone Dialer / Net  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│            JETPACK COMPOSE ROOT (MainActivity.kt)            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ State Machine: [SPLASH] ──► [ONLINE] ◄──► [OFFLINE]   │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              │                              │
│       ┌──────────────────────┴──────────────────────┐       │
│       ▼                                             ▼       │
│  ┌─────────────────────────┐          ┌───────────────────┐ │
│  │   OfflineScreen.kt      │          │ WinkWebView.kt    │ │
│  │  • Bengali error card   │          │ • Chrome Client   │ │
│  │  • Retry trigger        │          │ • File Chooser    │ │
│  │  • tel: Intent dialer   │          │ • Download Inter. │ │
│  └─────────────────────────┘          └─────────┬─────────┘ │
└─────────────────────────────────────────────────┼───────────┘
                                                  │ HTTPS
┌─────────────────────────────────────────────────▼───────────┐
│        WINK NETWORK ISP WEB APP (React 19 / Vite SPA)       │
│  • Firebase Auth (Google / Email)  • Live Cloud Firestore   │
│  • Admin Panel  • Employee Panel   • Customer OTP Portal    │
└─────────────────────────────────────────────────────────────┘
```

### Proposed Android Project Structure (`/android/`)
- `android/build.gradle.kts`: Project-level build script with Kotlin 2.x and Android Gradle Plugin 8.x.
- `android/settings.gradle.kts`: Repository and plugin management.
- `android/gradle.properties`: AndroidX and JVM optimizations.
- `android/app/build.gradle.kts`: Jetpack Compose BOM, Material3, Accompanist WebView, Activity-Compose.
- `android/app/src/main/AndroidManifest.xml`: Declarations for `INTERNET`, `ACCESS_NETWORK_STATE`, queries, hardware acceleration, file provider.
- `android/app/src/main/java/bd/winknetwork/app/`:
  - `MainActivity.kt`: Compose Activity hosting back-handler and permission flows.
  - `ui/components/WinkWebView.kt`: Production WebView wrapper with file upload and download listeners.
  - `ui/components/OfflineScreen.kt`: Bengali error state with instant phone dialer.
  - `ui/components/SplashScreen.kt`: Branded boot animation.
  - `util/NetworkMonitor.kt`: `ConnectivityManager` listener exposing reactive online state.
  - `util/DownloadHandler.kt`: `DownloadManager` helper for invoice and payment PDFs.
  - `Constants.kt`: Centralized configuration for custom URL, fallback URL, and hotlines.
- `android/app/src/main/res/`: Vector drawables for Wink ISP logo, notification icons, and app launcher mipmaps.
- `android/README.md`: Step-by-step instructions on compiling via Gradle CLI (`./gradlew assembleDebug`), importing into Android Studio, and generating a signed release APK/AAB.
