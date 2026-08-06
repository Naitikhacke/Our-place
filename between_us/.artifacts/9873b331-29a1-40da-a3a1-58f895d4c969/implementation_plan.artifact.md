# Implementation Plan - Fix Build and Run Issues

The project is currently unable to build or run due to several configuration and environment issues. This plan addresses the experimental Gradle/AGP versions and identifies missing Android SDK components.

## User Review Required

> [!IMPORTANT]
> The project is using experimental versions of Gradle (9.1.0) and AGP (9.0.1) which are likely not available on standard repositories or are unstable. I will downgrade these to the latest stable versions.

> [!WARNING]
> `flutter doctor` identified that Android SDK Command-line Tools are missing and licenses are not accepted. You will need to perform some manual steps in Android Studio.

## Proposed Changes

### Android Build Configuration

#### [MODIFY] [gradle-wrapper.properties](file:///D:/NOTES/between_us/android/gradle/wrapper/gradle-wrapper.properties)
- Downgrade Gradle from `9.1.0` to `8.10` to ensure stability and availability.

#### [MODIFY] [settings.gradle.kts](file:///D:/NOTES/between_us/android/settings.gradle.kts)
- Downgrade Android Gradle Plugin (AGP) from `9.0.1` to `8.6.0`.
- Downgrade Kotlin from `2.3.20` to `2.0.21`.

## Verification Plan

### Automated Tests
- Run `./gradlew help` in the `android` directory to verify Gradle can synchronize with the new versions.

### Manual Verification
1.  **Accept Licenses**: Run `flutter doctor --android-licenses` in your terminal and accept all prompts.
2.  **Install SDK Tools**:
    - Open Android Studio -> Settings -> Languages & Frameworks -> Android SDK -> SDK Tools.
    - Check **Android SDK Command-line Tools (latest)** and click Apply.
3.  **Build APK**: Run `flutter build apk` to verify the final build.
