# WINK NETWORK ISP — Android Application Project

This directory contains the complete native Android project for **WINK NETWORK ISP**, developed in **Kotlin** with **Jetpack Compose** and modern **Android WebView** integration.

---

## Features Implemented

1. **Jetpack Compose Architecture**: Modern reactive Android UI.
2. **Native Branded Splash Screen**: Animated brand reveal featuring WINK NETWORK ISP logo and colors.
3. **Seamless Web Engine**: Wraps the full ISP Billing & Management System (Admin, Employee, Customer OTP portals) with zero feature loss.
4. **Hardware Back Button Handling**: Navigates back through web pages smoothly before prompting to exit the app.
5. **Native Download Manager**: Direct system downloads for customer PDF invoices and payment receipts with notifications.
6. **Native File Chooser**: Allows customers to attach payment slips and screenshots (bKash/Nagad/Rocket) via the Android native gallery and document picker.
7. **Bengali Offline Recovery**: If network connection drops, a native Bengali error screen appears with an instant **"পুনরায় চেষ্টা করুন" (Retry)** button and **"কাস্টমার কেয়ার কল করুন" (Call Hotline)** trigger dialing `+880 9600-998877`.
8. **Strict HTTPS & Security**: Enforces `usesCleartextTraffic="false"` and blocks mixed HTTP content.

---

## Prerequisites

- **Android Studio**: Android Studio Giraffe (2022.3), Hedgehog (2023.1), Iguana (2023.2), Jellyfish (2023.3), Koala (2024.1), or Ladybug (2024.2+).
- **JDK**: Java 17 or Java 21 (bundled with Android Studio).
- **Android SDK**: Compile SDK 34, Min SDK 24 (Android 7.0 Nougat through Android 15+).

---

## Project Structure

```
android/
├── build.gradle.kts           # Root Gradle build script
├── settings.gradle.kts         # Module & repository declarations
├── gradle.properties          # JVM memory and AndroidX flags
├── gradle/
│   └── libs.versions.toml     # Gradle Version Catalog (Compose, Kotlin 2.0, AGP 8.5)
└── app/
    ├── build.gradle.kts       # App module configuration & dependencies
    ├── proguard-rules.pro     # Code obfuscation and WebView interface protection
    └── src/main/
        ├── AndroidManifest.xml # Permissions, HTTPS enforcement, Main Activity
        ├── res/
        │   ├── values/        # strings.xml, colors.xml, themes.xml
        │   ├── drawable/      # ic_wink_logo.xml, ic_offline.xml, launcher vectors
        │   └── mipmap-anydpi-v26/ # Adaptive Android launcher icons
        └── java/bd/winknetwork/app/
            ├── Constants.kt           # Target URLs and ISP hotlines
            ├── MainActivity.kt        # Entry Activity with file picker & back press
            ├── ui/
            │   ├── WinkAppScaffold.kt # Coordinates splash, offline, and web views
            │   ├── components/
            │   │   ├── WinkWebView.kt   # Enterprise Android WebView wrapper
            │   │   ├── SplashScreen.kt  # Animated brand splash composable
            │   │   └── OfflineScreen.kt # Bengali offline & hotline dialer
            │   └── theme/
            │       ├── Color.kt
            │       ├── Type.kt
            │       └── Theme.kt
            └── util/
                ├── NetworkMonitor.kt  # Reactive connectivity listener
                └── DownloadHandler.kt # Android DownloadManager for invoices
```

---

## Building the APK

### Method 1: Using Android Studio (Recommended)

1. Open **Android Studio**.
2. Click **Open** and select the `/android` directory.
3. Allow Gradle to sync dependencies (takes ~1-2 minutes on first run).
4. Connect an Android phone via USB (with **USB Debugging** enabled) or start an Android Virtual Device (AVD).
5. Click the green **Run (▶)** button or press `Shift + F10`.

### Method 2: Building Debug APK from Terminal

Run the following command inside the `/android` folder:

```bash
# On Linux / macOS
./gradlew assembleDebug

# On Windows PowerShell / CMD
gradlew.bat assembleDebug
```

The compiled APK will be located at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

You can install it directly onto any connected Android phone via ADB:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Generating a Signed Release APK / AAB for Google Play Store

### Step 1: Create a Keystore (if you don't already have one)

Run the keytool command in terminal:
```bash
keytool -genkey -v -keystore wink_release_key.jks -alias winkisp -keyalg RSA -keysize 2048 -validity 10000
```

### Step 2: Build Signed APK in Android Studio

1. In Android Studio, go to the top menu: **Build** → **Generate Signed Bundle / APK...**
2. Choose **APK** (for direct distribution) or **Android App Bundle** (for Google Play Store).
3. Select your `wink_release_key.jks` file, enter your keystore password, alias, and key password.
4. Select build variant **release**.
5. Check `V1 (Jar Signature)` and `V2 (Full APK Signature)`.
6. Click **Finish**. Your signed release APK will be generated ready for installation.

---

## Changing the Target URL

To change the website URL loaded by the Android app:

Open `android/app/src/main/java/bd/winknetwork/app/Constants.kt` and update:

```kotlin
// Change this to your live custom domain when ready:
const val CUSTOM_DOMAIN_URL: String = "https://your-custom-domain.com"

// Or update DEFAULT_URL:
val DEFAULT_URL: String = LIVE_PORTAL_URL
```
