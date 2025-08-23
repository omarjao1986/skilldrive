#!/usr/bin/env bash
set -e
if [ ! -d android ]; then
  echo "Android project not found. Running expo prebuild..."
  npx expo prebuild -p android --non-interactive || npx expo prebuild --platform android --non-interactive
fi

KEYSTORE_PATH="android/app/skilllink-release-key.jks"
PROPS_PATH="android/keystore.properties"

echo "==> Generating keystore (you can change alias/passwords)"
if [ ! -f "$KEYSTORE_PATH" ]; then
  keytool -genkeypair -v -keystore "$KEYSTORE_PATH" -alias skilllink -keyalg RSA -keysize 2048 -validity 3650 \
    -storepass password123 -keypass password123 \
    -dname "CN=SkillLink, OU=IT, O=SkillLink, L=Rabat, S=Rabat, C=MA"
else
  echo "Keystore already exists: $KEYSTORE_PATH"
fi

echo "==> Writing keystore.properties"
cat > "$PROPS_PATH" <<'EOF'
storePassword=password123
keyPassword=password123
keyAlias=skilllink
storeFile=app/skilllink-release-key.jks
EOF

GRADLE_FILE="android/app/build.gradle"
echo "==> Patching $GRADLE_FILE for release signing"
if ! grep -q "skilllink-release-key.jks" "$GRADLE_FILE"; then
  # Insert signing config and use it for release
  awk '
  /android {/ && !done {
    print;
    print "    def keystoreProperties = new Properties()";
    print "    def keystorePropertiesFile = rootProject.file(\"keystore.properties\")";
    print "    if (keystorePropertiesFile.exists()) {";
    print "        keystoreProperties.load(new FileInputStream(keystorePropertiesFile))";
    print "    }";
    done=1;
    next
  }
  1' "$GRADLE_FILE" > "$GRADLE_FILE.tmp" && mv "$GRADLE_FILE.tmp" "$GRADLE_FILE"

  awk '
  /signingConfigs {/ && !done2 {
    print;
    print "        release {";
    print "            if (project.rootProject.file(\"keystore.properties\").exists()) {";
    print "                storeFile file(keystoreProperties[\"storeFile\"])";
    print "                storePassword keystoreProperties[\"storePassword\"]";
    print "                keyAlias keystoreProperties[\"keyAlias\"]";
    print "                keyPassword keystoreProperties[\"keyPassword\"]";
    print "            }";
    print "        }";
    done2=1; next
  }
  1' "$GRADLE_FILE" > "$GRADLE_FILE.tmp" && mv "$GRADLE_FILE.tmp" "$GRADLE_FILE"

  awk '
  /buildTypes {/ && !done3 {
    print;
    print "        release {";
    print "            signingConfig signingConfigs.release";
    print "            minifyEnabled false";
    print "            proguardFiles getDefaultProguardFile(\"proguard-android-optimize.txt\"), \"proguard-rules.pro\"";
    print "        }";
    done3=1; next
  }
  1' "$GRADLE_FILE" > "$GRADLE_FILE.tmp" && mv "$GRADLE_FILE.tmp" "$GRADLE_FILE"
else
  echo "Gradle appears already patched."
fi

echo "==> Done. Build with:"
echo "   cd android && ./gradlew assembleRelease"
