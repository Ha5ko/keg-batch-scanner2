#!/bin/bash

echo "🔍 Keg Batch Scanner - Crash Diagnosis"
echo "======================================"

echo ""
echo "📱 React Native Environment Check:"
echo "-----------------------------------"

# Check Node version
echo "Node version:"
node --version || echo "❌ Node.js not installed"

# Check npm version  
echo "npm version:"
npm --version || echo "❌ npm not available"

# Check React Native CLI
echo "React Native CLI:"
npx react-native --version || echo "❌ React Native CLI not available"

echo ""
echo "📦 Package Dependencies Check:"
echo "------------------------------"

if [ -f "package.json" ]; then
    echo "✅ package.json exists"
    
    # Check for problematic dependencies
    if grep -q "react-native-camera" package.json; then
        echo "⚠️  WARNING: react-native-camera found (deprecated, causes crashes)"
    fi
    
    if grep -q "react-native-text-recognition" package.json; then
        echo "⚠️  WARNING: react-native-text-recognition found (may cause issues)"
    fi
    
    echo "React version:"
    grep '"react"' package.json || echo "❌ React not found"
    
    echo "React Native version:"
    grep '"react-native"' package.json || echo "❌ React Native not found"
    
else
    echo "❌ package.json missing"
fi

echo ""
echo "📋 Core Files Check:"
echo "--------------------"

[ -f "App.js" ] && echo "✅ App.js exists" || echo "❌ App.js missing"
[ -f "index.js" ] && echo "✅ index.js exists" || echo "❌ index.js missing"  
[ -f "app.json" ] && echo "✅ app.json exists" || echo "❌ app.json missing"
[ -f "babel.config.js" ] && echo "✅ babel.config.js exists" || echo "❌ babel.config.js missing"
[ -f "metro.config.js" ] && echo "✅ metro.config.js exists" || echo "❌ metro.config.js missing"
[ -f "AndroidManifest.xml" ] && echo "✅ AndroidManifest.xml exists" || echo "❌ AndroidManifest.xml missing"

echo ""
echo "🔧 Android Configuration Check:"
echo "-------------------------------"

if [ -f "AndroidManifest.xml" ]; then
    echo "✅ AndroidManifest.xml found"
    
    if grep -q "android.permission.CAMERA" AndroidManifest.xml; then
        echo "✅ Camera permission declared"
    else
        echo "⚠️  Camera permission not found"
    fi
    
    if grep -q "exported.*true" AndroidManifest.xml; then
        echo "✅ Activity exported properly"
    else
        echo "❌ Activity not exported (will cause crash on Android 12+)"
    fi
else
    echo "❌ AndroidManifest.xml missing"
fi

echo ""
echo "💡 Common Crash Fixes:"
echo "----------------------"
echo "1. Replace deprecated libraries"
echo "2. Update React Native to 0.72+"  
echo "3. Ensure android:exported='true' in manifest"
echo "4. Check for syntax errors in App.js"
echo "5. Verify all dependencies are compatible"

echo ""
echo "🚀 Next Steps:"
echo "--------------"
echo "1. Replace all files with the fixed versions provided"
echo "2. Run: npm install --legacy-peer-deps"
echo "3. Clean build: cd android && ./gradlew clean"
echo "4. Build APK: ./gradlew assembleRelease"

echo ""
echo "📊 Build this minimal version first, then add features incrementally"
