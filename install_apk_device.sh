#!/usr/bin/env bash
set -e
APK_PATH="${1:-android/app/build/outputs/apk/debug/app-debug.apk}"
if ! command -v adb >/dev/null 2>&1; then
  echo "adb not found. Install Android Platform Tools and retry."
  exit 1
fi
adb devices
adb install -r "$APK_PATH"
echo "==> Installed: $APK_PATH"
