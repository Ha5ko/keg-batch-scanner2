# 🍺 Keg Scanner Troubleshooting Guide

## 🚀 Quick Start
1. Run the setup script: `bash setup.sh`
2. Update your Google Sheets webhook URL in App.js
3. Test: `npm run android`

## ❌ Common Issues & Solutions

### 1. **Build Failures**

**Issue**: Gradle build fails with dependency conflicts
```
FAILURE: Build failed with an exception.
* What went wrong: Could not resolve all files for configuration ':app:debugRuntimeClasspath'.
```

**Solution**:
```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 2. **Camera Permission Issues**

**Issue**: App crashes when trying to access camera
```
Error: Camera permission is required
```

**Solutions**:
- Ensure AndroidManifest.xml is in correct location: `android/app/src/main/AndroidManifest.xml`
- Check permissions are properly declared:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
```
- For testing, manually grant camera permission in device settings

### 3. **OCR Not Working**

**Issue**: L-codes not being detected
```
OCR Result: [empty or wrong text]
```

**Solutions**:
- Ensure good lighting when scanning
- Hold camera steady and close to the L-code
- Check L-code pattern in `extractLCode` function
- Test OCR with simple text first

### 4. **Metro/Bundler Issues**

**Issue**: Metro bundler fails to start or build
```
error: bundling failed: Error: Unable to resolve module...
```

**Solution**:
```bash
npx react-native start --reset-cache
# In another terminal:
npx react-native run-android
```

### 5. **CodeMagic Build Issues**

**Issue**: CodeMagic builds fail with missing dependencies

**Solutions**:
- Ensure all files are committed to git
- Check codemagic.yaml uses correct Node.js version (16)
- Verify environment variables are set in CodeMagic dashboard

### 6. **Google Sheets Integration**

**Issue**: Data not uploading to Google Sheets
```
Google Sheets upload error: [network error]
```

**Solutions**:
- Verify webhook URL is correct and accessible
- Check Google Apps Script is deployed as web app
- Test webhook URL manually with Postman
- Check device has internet connection

## 🔧 Manual Build Steps

If automatic setup fails, follow these manual steps:

### Android Setup:
```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Set up Android SDK path
echo "sdk.dir=/path/to/android/sdk" > android/local.properties

# 3. Copy manifest
cp AndroidManifest.xml android/app/src/main/AndroidManifest.xml

# 4. Build
cd android && ./gradlew assembleRelease
```

### iOS Setup (if needed):
```bash
# 1. Install CocoaPods dependencies
cd ios && pod install

# 2. Add camera usage description to Info.plist
# Add this key: NSCameraUsageDescription = "Camera access for scanning keg codes"

# 3. Build with Xcode or CLI
```

## 📋 Dependency Versions

If you encounter version conflicts, use these exact versions:

```json
{
  "react-native": "0.72.10",
  "react-native-vision-camera": "^3.6.17",
  "@react-native-ml-kit/text-recognition": "^0.7.1",
  "react-native-permissions": "^3.10.1",
  "@react-native-async-storage/async-storage": "^1.19.3"
}
```

## 🐛 Debug Mode

Enable debug logging by adding to App.js:
```javascript
const DEBUG = true; // Set to false for production

// In processOCR function:
if (DEBUG) {
  console.log('OCR Full Result:', result);
  console.log('Extracted L-Code:', lCode);
}
```

## 📱 Testing L-Code Detection

Test patterns the app should recognize:
- ✅ L50780A 10:52
- ✅ L5025MB 04:22  
- ✅ L5149MA 13:53
- ✅ L12345A
- ✅ L67890BC

## 🌐 Network Issues

If offline queueing isn't working:
```javascript
// Check AsyncStorage manually
AsyncStorage.getItem('offlineQueue').then(data => {
  console.log('Offline Queue:', JSON.parse(data || '[]'));
});
```

## 📞 Still Need Help?

1. **Check logs**: Use `adb logcat` for Android or Xcode console for iOS
2. **GitHub Issues**: Create an issue with error logs
3. **Test on device**: Emulators may have camera/permission issues

## ✅ Success Indicators

Your app is working correctly when:
- Camera preview shows without errors
- L-codes are detected and highlighted  
- Success message appears after scanning
- Data appears in your Google Sheet
- Offline queue handles network issues

## 🚀 Production Checklist

Before deploying:
- [ ] Update Google Sheets webhook URL
- [ ] Test on multiple Android devices
- [ ] Verify offline queueing works
- [ ] Test in poor lighting conditions
- [ ] Confirm data reaches Google Sheets
- [ ] Set DEBUG = false in App.js
