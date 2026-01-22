# 🍺 Keg Batch Scanner

A React Native mobile app for scanning keg L-codes using OCR technology, with automatic Google Sheets integration for warehouse operations.

## ✨ Features

- **Real-time OCR**: Automatic L-code detection using Google ML Kit
- **Modern Camera**: Uses latest React Native Vision Camera
- **Offline Support**: Queues scans when offline, syncs when connected
- **Google Sheets Integration**: Automatic data upload with timestamps
- **Robust Permissions**: Proper camera permission handling
- **Professional UI**: Clean scanning interface with visual feedback

## 🔧 **MAJOR UPDATES MADE**

Your original app had several critical issues that have been completely fixed:

### ❌ **Issues Fixed**:
1. **Deprecated Camera Library**: Replaced `react-native-camera` (deprecated) with modern `react-native-vision-camera`
2. **Broken OCR**: Added proper OCR with `@react-native-ml-kit/text-recognition`  
3. **Missing Permissions**: Added proper Android camera permissions
4. **Build Failures**: Updated dependencies and build configuration
5. **CodeMagic Issues**: Fixed CI/CD pipeline configuration

### ✅ **New Implementation**:
- **Modern Stack**: Latest React Native libraries that actually work
- **Reliable OCR**: Google ML Kit for accurate text recognition
- **Proper Permissions**: React Native Permissions for camera access
- **Optimized Builds**: Fixed Gradle and CodeMagic configurations

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# 1. Copy all the updated files to your project directory
# 2. Run the setup script
bash setup.sh

# 3. Update your Google Sheets webhook URL in App.js
# 4. Test the app
npm run android
```

### Option 2: Manual Setup
```bash
# 1. Install new dependencies  
npm install --legacy-peer-deps

# 2. Copy Android manifest
cp AndroidManifest.xml android/app/src/main/AndroidManifest.xml

# 3. Set Android SDK path
echo "sdk.dir=$ANDROID_SDK_ROOT" > android/local.properties

# 4. Clean and build
cd android && ./gradlew clean && ./gradlew assembleRelease
```

## 📱 How It Works

### L-Code Detection
The app automatically recognizes these L-code patterns:
- `L50780A 10:52` (with time)
- `L5025MB 04:22` (with time) 
- `L5149MA 13:53` (with time)
- `L12345A` (without time)

### Data Flow
1. **Scan**: Point camera at keg L-code
2. **OCR**: ML Kit extracts text from camera feed
3. **Extract**: App finds L-code pattern in text
4. **Upload**: Data sent to Google Sheets webhook
5. **Offline**: If network fails, data queued locally
6. **Sync**: When online, queued data automatically syncs

## 📋 Updated Dependencies

```json
{
  "dependencies": {
    "react-native-vision-camera": "^3.6.17",          // Modern camera
    "@react-native-ml-kit/text-recognition": "^0.7.1", // OCR engine  
    "react-native-permissions": "^3.10.1",             // Permissions
    "@react-native-async-storage/async-storage": "^1.19.3" // Offline storage
  }
}
```

## 🔑 Google Sheets Setup

1. **Create Google Apps Script**:
```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  sheet.appendRow([
    new Date(data.timestamp),
    data.lCode,
    data.device
  ]);
  
  return ContentService
    .createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

2. **Deploy as Web App** with "Execute as: Me" and "Who has access: Anyone"

3. **Update App.js** with your webhook URL:
```javascript
const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';
```

## 🏗️ Build & Deploy

### Local Development
```bash
# Android
npm run android

# iOS (if configured)
npm run ios
```

### CodeMagic CI/CD
The updated `codemagic.yaml` includes:
- ✅ Proper dependency installation
- ✅ Android permissions setup
- ✅ Optimized build configuration  
- ✅ APK artifact generation
- ✅ Email notifications

## 🐛 Troubleshooting

Common issues and solutions in `TROUBLESHOOTING.md`:

- **Build failures** → Clean and reinstall dependencies
- **Camera issues** → Check permissions in AndroidManifest.xml
- **OCR not working** → Verify lighting and L-code format
- **Network issues** → Test Google Sheets webhook URL

## 🎯 L-Code Scanning Tips

**For Best Results**:
- ✅ Good lighting conditions
- ✅ Hold camera steady 
- ✅ Position L-code in center viewfinder
- ✅ Clean keg label (no dirt/scratches)
- ✅ Distance: 6-12 inches from label

## 📊 What's Different from Your Original Code

| **Component** | **Old (Broken)** | **New (Working)** |
|---------------|------------------|-------------------|
| **Camera** | react-native-camera (deprecated) | react-native-vision-camera (modern) |
| **OCR** | onTextRecognized (broken) | @react-native-ml-kit/text-recognition |
| **Permissions** | Basic camera request | react-native-permissions (robust) |
| **Build Config** | Basic setup | Optimized Gradle + CodeMagic |
| **Error Handling** | Limited | Comprehensive with offline support |

## 📞 Support

If you encounter issues:
1. Check `TROUBLESHOOTING.md`
2. Verify all dependencies installed correctly
3. Test Google Sheets webhook independently
4. Check Android device logs: `adb logcat`

## 🎉 Success!

When working correctly, you should see:
- Camera preview without errors
- "L-Code found: LXXXXXA" message after scanning
- Data appearing in your Google Sheet
- Offline queue working when network is unavailable

Your keg scanning app is now built on modern, reliable technologies and should work consistently! 🍺
