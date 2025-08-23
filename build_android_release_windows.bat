@echo off
setlocal enabledelayedexpansion
echo ==^> Installing deps
npm install
echo ==^> Prebuild native Android project
npx expo prebuild -p android
echo ==^> Building release APK
cd android
gradlew.bat assembleRelease
echo ==^> Build done: android\app\build\outputs\apk\release\app-release.apk
