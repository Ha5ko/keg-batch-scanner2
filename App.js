import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GOOGLE_SHEETS_WEBHOOK_URL = 'PUT_YOUR_WEBHOOK_URL_HERE';
const QUEUE_KEY = 'keg_scan_queue_v1';

// L + 3-6 digits + optional letters + optional time "HH:MM"
const LCODE_REGEX = /\bL[0-9]{3,6}[A-Z]{0,3}(?:\s*[0-2]?\d:[0-5]\d)?\b/g;

function extractLCode(text) {
  if (!text) return null;
  const matches = text.match(LCODE_REGEX);
  if (!matches || matches.length === 0) return null;
  const best = matches.sort((a, b) => b.length - a.length)[0];
  return best.replace(/\s+/g, ' ').trim();
}

async function getQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
}
async function setQueue(queue) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}
async function enqueue(item) {
  const q = await getQueue();
  q.push(item);
  await setQueue(q);
}

async function postToWebhook(payload) {
  const res = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Webhook failed: ${res.status} ${res.statusText} ${txt}`.trim());
  }
}

export default function App() {
  const cameraRef = useRef(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();

  const [status, setStatus] = useState('Idle');
  const [lastLCode, setLastLCode] = useState('');
  const [lastText, setLastText] = useState('');
  const [busy, setBusy] = useState(false);

  const canUseCamera = useMemo(() => !!device && hasPermission, [device, hasPermission]);

  const askForCameraPermission = useCallback(async () => {
    const ok = await requestPermission();
    if (!ok) {
      Alert.alert(
        'Camera permission needed',
        'Enable camera permission to scan L-codes.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  }, [requestPermission]);

  const flushQueue = useCallback(async () => {
    const q = await getQueue();
    if (q.length === 0) return;
    const remaining = [];
    for (const item of q) {
      try {
        await postToWebhook(item);
      } catch {
        remaining.push(item);
      }
    }
    await setQueue(remaining);
    if (remaining.length === 0) setStatus('Synced queued scans ✅');
  }, []);

  useEffect(() => {
    flushQueue().catch(() => {});
  }, [flushQueue]);

  const scanOnce = useCallback(async () => {
    if (!canUseCamera || !cameraRef.current) return;

    if (!GOOGLE_SHEETS_WEBHOOK_URL || GOOGLE_SHEETS_WEBHOOK_URL.includes('PUT_YOUR')) {
      Alert.alert('Missing webhook URL', 'Set GOOGLE_SHEETS_WEBHOOK_URL in App.js');
      return;
    }

    setBusy(true);
    setStatus('Taking photo…');

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
        enableShutterSound: false,
      });

      setStatus('Running OCR…');

      const result = await TextRecognition.recognize(photo.path);
      const text = (result?.text || '').trim();

      setLastText(text);

      const lCode = extractLCode(text);
      if (!lCode) {
        setStatus('No L-code found');
        Alert.alert('No L-code detected', 'Try better lighting and get closer to the label.');
        return;
      }

      setLastLCode(lCode);
      setStatus('Uploading…');

      const payload = {
        timestamp: new Date().toISOString(),
        lCode,
        rawText: text,
        platform: Platform.OS,
      };

      try {
        await postToWebhook(payload);
        setStatus('Uploaded ✅');
      } catch {
        await enqueue(payload);
        setStatus('Queued (offline) 📥');
      }
    } catch (e) {
      setStatus('Error ❌');
      Alert.alert('Scan failed', String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }, [canUseCamera]);

  if (!device) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>No back camera found</Text>
        <Text style={styles.small}>Use a real Android phone (emulators often lack camera).</Text>
      </SafeAreaView>
    );
  }

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.title}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={askForCameraPermission}>
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.previewWrap}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          photo={true}
        />
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle}>Aim at the L-code</Text>
          <Text style={styles.overlaySmall}>Status: {status}</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.button, busy && styles.buttonDisabled]}
          onPress={scanOnce}
          disabled={busy}
        >
          <Text style={styles.buttonText}>{busy ? 'Working…' : 'Scan'}</Text>
        </TouchableOpacity>

        {!!lastLCode && <Text style={styles.result}>Last L-code: {lastLCode}</Text>}
        {!!lastText && (
          <Text numberOfLines={4} style={styles.small}>OCR: {lastText}</Text>
        )}

        <TouchableOpacity style={styles.linkBtn} onPress={flushQueue}>
          <Text style={styles.linkText}>Try upload queued scans</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  previewWrap: { flex: 1 },

  overlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
  },
  overlayTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  overlaySmall: { color: '#fff', marginTop: 6, opacity: 0.9 },

  bottom: { padding: 16, backgroundColor: '#111' },
  button: {
    backgroundColor: '#2F80ED',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  result: { color: '#fff', marginTop: 12, fontSize: 16, fontWeight: '700' },
  small: { color: '#ddd', marginTop: 10, fontSize: 12, lineHeight: 16 },

  linkBtn: { marginTop: 12, alignItems: 'center' },
  linkText: { color: '#9CC4FF', textDecorationLine: 'underline' },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#000' },
  title: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 12 },
});
