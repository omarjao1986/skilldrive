#!/usr/bin/env bash
set -e
echo "==> Installing deps"
npm install
echo "==> Prebuild native Android project"
npx expo prebuild -p android || npx expo prebuild --platform android
echo "==> Building release APK"
cd android
./gradlew assembleRelease
APK=app/build/outputs/apk/release/app-release.apk
echo "==> Build done: $APK"
