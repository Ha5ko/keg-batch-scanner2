#!/bin/bash

# Keg Scanner Setup Script
echo "🍺 Setting up Keg Batch Scanner..."

# Check if we're in a React Native project
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Make sure you're in your React Native project directory."
    exit 1
fi

echo "📦 Installing dependencies..."

# Remove existing node_modules and package-lock to avoid conflicts
rm -rf node_modules package-lock.json

# Install dependencies with legacy peer deps to resolve conflicts
npm install --legacy-peer-deps

echo "🔧 Setting up Android configuration..."

# Create android directory structure if it doesn't exist
mkdir -p android/app/src/main

# Copy AndroidManifest.xml to the correct location
if [ -f "AndroidManifest.xml" ]; then
    cp AndroidManifest.xml android/app/src/main/AndroidManifest.xml
    echo "✅ Android manifest updated with camera permissions"
else
    echo "⚠️ AndroidManifest.xml not found in root directory"
fi

# Setup gradle.properties for optimal Android builds
cat >> android/gradle.properties << EOF

# React Native optimizations
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+UseParallelGC
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.daemon=true

# Android build optimizations
android.useAndroidX=true
android.enableJetifier=true
android.enableR8=true

# Vision Camera
disableNewArchitecture=false

# Flipper
FLIPPER_VERSION=0.125.0
EOF

echo "✅ Gradle properties configured"

# Set up local.properties for Android SDK
if [ -n "$ANDROID_SDK_ROOT" ]; then
    echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties
    echo "✅ Android SDK path configured"
else
    echo "⚠️ ANDROID_SDK_ROOT not set. You'll need to set this manually in android/local.properties"
fi

echo "📱 Linking native dependencies..."

# For React Native 0.60+, auto-linking should handle most dependencies
# But let's ensure everything is properly linked
if [ -d "ios" ]; then
    echo "Setting up iOS..."
    cd ios
    pod install --repo-update
    cd ..
    echo "✅ iOS CocoaPods installed"
fi

echo "🧹 Cleaning previous builds..."
cd android
./gradlew clean
cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update the Google Sheets webhook URL in App.js"
echo "2. Test the app: npm run android"
echo "3. For CodeMagic builds, push to your repository"
echo ""
echo "📋 Dependencies installed:"
echo "- react-native-vision-camera (modern camera library)"
echo "- @react-native-ml-kit/text-recognition (OCR engine)"
echo "- react-native-permissions (permission handling)"
echo "- @react-native-async-storage/async-storage (offline storage)"
echo ""
echo "🔧 Configuration files updated:"
echo "- package.json (dependencies)"
echo "- App.js (modern camera & OCR implementation)" 
echo "- android/app/src/main/AndroidManifest.xml (permissions)"
echo "- android/gradle.properties (build optimizations)"
echo "- codemagic.yaml (CI/CD configuration)"
echo ""
echo "✅ Your keg scanner app should now work properly!"
