@echo off
setlocal
if not exist android (
  echo Android project not found. Running expo prebuild...
  npx expo prebuild -p android --non-interactive
)
set KEYSTORE_PATH=android\app\skilllink-release-key.jks
set PROPS_PATH=android\keystore.properties
echo ==^> Generating keystore
if not exist %KEYSTORE_PATH% (
  keytool -genkeypair -v -keystore %KEYSTORE_PATH% -alias skilllink -keyalg RSA -keysize 2048 -validity 3650 -storepass password123 -keypass password123 -dname "CN=SkillLink, OU=IT, O=SkillLink, L=Rabat, S=Rabat, C=MA"
) else (
  echo Keystore already exists: %KEYSTORE_PATH%
)
echo storePassword=password123> %PROPS_PATH%
echo keyPassword=password123>> %PROPS_PATH%
echo keyAlias=skilllink>> %PROPS_PATH%
echo storeFile=app/skilllink-release-key.jks>> %PROPS_PATH%
echo ==^> Patching Gradle (manual check may be needed). Build with:
echo    cd android ^&^& gradlew.bat assembleRelease
