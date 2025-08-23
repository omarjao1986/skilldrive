
# Skilldrive Mobile (Expo React Native)

Application mobile Android pour Skilldrive (clients ↔ pros).

## Fonctionnalités
- Connexion OTP (dev: code 0000)
- Liste des demandes + recherche + géoloc (autour de moi)
- Publication d'une demande (client)
- Offres / contre-offres / acceptation / clôture
- Upload photos (S3/MinIO via presigned POST)
- Paiement (TEST provider) avec confirmation immédiate

## Prérequis
- Node 18+
- Expo CLI (`npm i -g expo`)
- Android Studio (SDK) pour construire l'APK
- API Skilldrive v2 en cours d'exécution (voir vos livrables API)

## Démarrage
```bash
npm install
npm run start
# Appuyez sur 'a' pour ouvrir l'émulateur Android
```

Dans l'écran de **login**, ajustez l'URL **API Base** (par défaut: `http://10.0.2.2:4000` pour l'émulateur).

## Construction APK
### Option A — React Native (prebuild + Gradle)
```bash
npm run prebuild:android
cd android
./gradlew assembleRelease   # (Windows: gradlew.bat assembleRelease)
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### Option B — Debug APK rapide
```bash
npm run prebuild:android
npm run build:android:debug
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

> Si vous avez un périphérique **physique Android**, activez **Débogage USB** et exécutez `npm run android` (après prebuild).

## Variables
- L'URL de l'API est modifiable directement dans l'app (écran de login).

## Notes
- Pour les **uploads**, configurez votre API avec MinIO/S3 comme dans le pack v2.
- Pour les **paiements CMI**, l'app ouvrira une webview dans une itération suivante ; en **TEST**, la confirmation est simulée côté serveur.


> Package Android configuré : `com.skilldrive.app`.
