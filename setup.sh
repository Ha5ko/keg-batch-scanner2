#!/bin/bash

echo "🔧 Keg Batch Scanner - Crash-Free Setup"
echo "======================================="

# Make sure we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Make sure you're in the project directory."
    exit 1
fi

echo ""
echo "1️⃣ Cleaning old installation..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

echo ""
echo "2️⃣ Installing dependencies..."
npm install --legacy-peer-deps

echo ""
echo "3️⃣ Setting up Android..."
if [ ! -d "android" ]; then
    echo "⚠️  Android directory not found. This might be a fresh React Native project."
    echo "Run: npx react-native init KegBatchScanner"
    echo "Then copy these files over."
else
    echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties
    
    # Copy manifest to correct location
    if [ -f "AndroidManifest.xml" ]; then
        cp AndroidManifest.xml android/app/src/main/AndroidManifest.xml
        echo "✅ AndroidManifest.xml copied"
    fi
fi

echo ""
echo "4️⃣ Building clean APK..."
if [ -d "android" ]; then
    cd android
    ./gradlew clean
    echo "✅ Android project cleaned"
    cd ..
else
    echo "⚠️  Skipping Android clean (directory not found)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Test the minimal app first: npm run android"
echo "2. If it works, we'll add camera features incrementally"
echo "3. If it still crashes, run: bash diagnose.sh"
echo ""
echo "📝 This minimal version should NOT crash and will show:"
echo "   'Keg Batch Scanner' with 'Loading...' text"
