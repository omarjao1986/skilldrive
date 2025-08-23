#!/usr/bin/env bash
set -e
npm install
npx expo prebuild -p android || npx expo prebuild --platform android
cd android
./gradlew assembleDebug
APK=app/build/outputs/apk/debug/app-debug.apk
echo "==> Build done: $APK"
