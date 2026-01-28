// App.js - Minimal Keg Scanner (Test Build)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Replace this with YOUR Google Apps Script Web App URL
const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycby87KX7t0nmio433zyB7H0fl2-7-zhZ3GFY6q9yp7b9zGp41rglrgolg4RMN156yrcUnA/exec';

const App = () => {
  const [scannedCodes, setScannedCodes] = useState([]);
  const [offlineQueue, setOfflineQueue] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const codes = await AsyncStorage.getItem('scannedCodes');
      const queue = await AsyncStorage.getItem('offlineQueue');
      
      if (codes) setScannedCodes(JSON.parse(codes));
      if (queue) setOfflineQueue(JSON.parse(queue));
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const saveData = async (codes, queue) => {
    try {
      await AsyncStorage.setItem('scannedCodes', JSON.stringify(codes));
      await AsyncStorage.setItem('offlineQueue', JSON.stringify(queue));
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  const generateMockLCode = () => {
    const numbers = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const time = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return `L${numbers}${letter} ${time}`;
  };

  const uploadToGoogleSheets = async (data) => {
    try {
      const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lCode: data.lCode,
          timestamp: data.timestamp,
          device: 'WarehouseScanner-Test'
        }),
      });
      
      const result = await response.json();
      console.log('Google Sheets response:', result);
      
      return result.success || false;
    } catch (error) {
      console.log('Google Sheets upload error:', error);
      return false;
    }
  };

  const simulateScanning = async () => {
    const mockLCode = generateMockLCode();
    const timestamp = new Date().toISOString();
    const batchData = { lCode: mockLCode, timestamp };
    
    // Try to upload immediately
    const uploadSuccess = await uploadToGoogleSheets(batchData);
    
    const newCodes = [...scannedCodes, mockLCode];
    let newQueue = [...offlineQueue];
    
    if (!uploadSuccess) {
      // Add to offline queue if upload fails
      newQueue = [...offlineQueue, batchData];
    }
    
    setScannedCodes(newCodes);
    setOfflineQueue(newQueue);
    await saveData(newCodes, newQueue);
    
    Alert.alert(
      'Mock L-Code Scanned',
      `Code: ${mockLCode}\nStatus: ${uploadSuccess ? 'Uploaded' : 'Queued offline'}`,
      [{ text: 'OK' }]
    );
  };

  const clearData = async () => {
    setScannedCodes([]);
    setOfflineQueue([]);
    await saveData([], []);
    Alert.alert('Data Cleared', 'All scanned codes cleared.');
  };

  const syncOfflineData = async () => {
    if (offlineQueue.length === 0) {
      Alert.alert('No Data', 'No offline data to sync.');
      return;
    }

    let successCount = 0;
    const remainingQueue = [];

    for (const data of offlineQueue) {
      const success = await uploadToGoogleSheets(data);
      if (success) {
        successCount++;
      } else {
        remainingQueue.push(data);
        break; // Stop on first failure
      }
    }

    setOfflineQueue(remainingQueue);
    await saveData(scannedCodes, remainingQueue);
    
    Alert.alert(
      'Sync Complete', 
      `${successCount} items synced successfully.\n${remainingQueue.length} items remain offline.`
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <Text style={styles.title}>Keg Batch Scanner</Text>
      <Text style={styles.subtitle}>Test Version - Build Verification</Text>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Scanned: {scannedCodes.length}</Text>
        <Text style={styles.statsText}>Offline: {offlineQueue.length}</Text>
      </View>
      
      <TouchableOpacity style={styles.scanButton} onPress={simulateScanning}>
        <Text style={styles.scanButtonText}>SIMULATE SCAN</Text>
      </TouchableOpacity>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.smallButton} onPress={syncOfflineData}>
          <Text style={styles.smallButtonText}>SYNC OFFLINE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.smallButton} onPress={clearData}>
          <Text style={styles.smallButtonText}>CLEAR DATA</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Recent L-Codes:</Text>
        {scannedCodes.slice(-5).reverse().map((code, index) => (
          <Text key={index} style={styles.resultItem}>{code}</Text>
        ))}
        {scannedCodes.length === 0 && (
          <Text style={styles.emptyText}>No codes scanned yet</Text>
        )}
      </View>
      
      <Text style={styles.note}>
        This minimal version tests basic React Native functionality.
        Camera and OCR will be added once build succeeds.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  statsText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  smallButton: {
    backgroundColor: '#666666',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultsContainer: {
    marginTop: 20,
    width: '100%',
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  resultItem: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
  },
  note: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
});

export default App;
