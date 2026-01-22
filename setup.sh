#!/bin/bash
set -e

echo "🍺 Setting up Keg Batch Scanner..."

if [ ! -f "package.json" ]; then
  echo "❌ package.json not found. Run this from the project root."
  exit 1
fi

echo "📦 Installing dependencies..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

echo "🔧 Ensuring Android folder exists..."
if [ ! -d "android" ]; then
  echo "📱 android/ not found. Creating a fresh RN Android project..."
  npx react-native@0.72.10 init KegBatchScannerTemp --version 0.72.10 --skip-install
  cp -R KegBatchScannerTemp/android .
  rm -rf KegBatchScannerTemp
  echo "✅ android/ created"
else
  echo "✅ android/ already exists"
fi

echo "📄 Setting up Android manifest..."
mkdir -p android/app/src/main
if [ -f "AndroidManifest.xml" ]; then
  cp AndroidManifest.xml android/app/src/main/AndroidManifest.xml
  echo "✅ Android manifest copied"
else
  echo "⚠️ AndroidManifest.xml not found in repo root"
fi

echo "⚙️ Writing SAFE android/gradle.properties..."
cat > android/gradle.properties << 'EOF'
org.gradle.jvmargs=-Xmx4g -Dkotlin.daemon.jvm.options=-Xmx2g
org.gradle.parallel=true
org.gradle.daemon=true
org.gradle.configureondemand=true

android.useAndroidX=true
android.enableJetifier=true

newArchEnabled=false
hermesEnabled=true
EOF

echo "✅ gradle.properties written"

if [ -n "$ANDROID_SDK_ROOT" ]; then
  echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties
  echo "✅ Android SDK path configured"
else
  echo "⚠️ ANDROID_SDK_ROOT not set. Set sdk.dir manually in android/local.properties"
fi

echo "🧹 Cleaning Android build..."
cd android
chmod +x ./gradlew
./gradlew clean
cd ..

echo "🎉 Setup complete!"
echo "Next:"
echo "1) Update your Google Sheets webhook URL in App.js"
echo "2) Build locally: npm run android (or cd android && ./gradlew assembleDebug)"
