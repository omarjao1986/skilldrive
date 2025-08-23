# Signature Android (APK Release)

## Option rapide (local)
```bash
# 1) Générer projet natif Android (si absent)
npx expo prebuild -p android

# 2) Créer keystore + config
bash configure_signing.sh   # ou configure_signing_windows.bat

# 3) Builder
cd android
./gradlew assembleRelease
# => android/app/build/outputs/apk/release/app-release.apk
```

Modifiez les mots de passe/alias à votre convenance (gardez-les secrets).

## Option CI (GitHub Actions)
- Ajoutez ces **Secrets** dans le repo :  
  - `KEYSTORE_BASE64` (contenu `.jks` encodé en base64)  
  - `KEYSTORE_PASSWORD`  
  - `KEYSTORE_ALIAS` (ex: `skilllink`)  
- Lancez le workflow **Android APK** → récupérez les artefacts `app-debug.apk` et, si keystore présent, `app-release.apk`.