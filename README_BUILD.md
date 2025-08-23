# Build Android APK in 1 command

## macOS / Linux (release)
```bash
bash build_android_release.sh
# APK => android/app/build/outputs/apk/release/app-release.apk
```

## Windows (release)
Double-cliquez : **build_android_release_windows.bat**  
APK => `android\app\build\outputs\apk\release\app-release.apk`

## Debug build (faster)
```bash
bash build_android_debug.sh
# APK => android/app/build/outputs/apk/debug/app-debug.apk
```

## Installer sur un téléphone branché (ADB)
```bash
bash install_apk_device.sh android/app/build/outputs/apk/debug/app-debug.apk
```

> L'API doit être accessible. Dans l'écran de login de l'app, ajustez l'URL (ex: `http://10.0.2.2:4000` pour l'émulateur Android).
