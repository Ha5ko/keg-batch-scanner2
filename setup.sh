#!/bin/bash
set -e

echo "🍺 Keg Batch Scanner setup"

echo "📦 Installing dependencies..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

echo "🔎 Checking for android/ folder..."
if [ ! -d "android" ]; then
  echo "📱 android/ not found. Generating RN template android project..."
  npx react-native@0.72.10 init KegBatchScannerTemp --version 0.72.10 --skip-install
  cp -R KegBatchScannerTemp/android .
  rm -rf KegBatchScannerTemp
  echo "✅ android/ generated"
else
  echo "✅ android/ already exists"
fi

echo "📄 Copying AndroidManifest.xml into android project..."
mkdir -p android/app/src/main
if [ -f "AndroidManifest.xml" ]; then
  cp AndroidManifest.xml android/app/src/main/AndroidManifest.xml
  echo "✅ Manifest copied"
else
  echo "⚠️ AndroidManifest.xml not found at repo root (skipping)"
fi

echo "⚙️ Writing android/gradle.properties (safe + FLIPPER_VERSION)..."
cat > android/gradle.properties << 'EOF'
org.gradle.jvmargs=-Xmx4g -Dkotlin.daemon.jvm.options=-Xmx2g
org.gradle.parallel=true
org.gradle.daemon=true
org.gradle.configureondemand=true

android.useAndroidX=true
android.enableJetifier=true

newArchEnabled=false
hermesEnabled=true

FLIPPER_VERSION=0.201.0
EOF

echo "✅ gradle.properties written"

if [ -n "$ANDROID_SDK_ROOT" ]; then
  echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties
  echo "✅ android/local.properties set"
else
  echo "⚠️ ANDROID_SDK_ROOT not set. You may need to set sdk.dir manually."
fi

echo "🧹 Gradle clean..."
cd android
chmod +x ./gradlew
./gradlew clean
echo "✅ Done"
