import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';

// Lazy native import — avoids web bundle crash
let BleManager: any = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    BleManager = require('react-native-ble-plx').BleManager;
  } catch (e) {
    console.warn('react-native-ble-plx not available in this runtime', e);
  }
}

// Lightstick GATT (placeholder UUIDs — real Erigi protocol is proprietary)
// Common Nordic UART service used by many BLE LED controllers
const SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const WRITE_CHAR_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';

export type BLEDevice = {
  id: string;
  name: string;
  rssi: number;
};

type BLEState = {
  isAvailable: boolean;
  isScanning: boolean;
  isConnecting: boolean;
  isConnected: boolean;
  devices: BLEDevice[];
  connectedDevice: BLEDevice | null;
  error: string | null;
  startScan: () => Promise<void>;
  stopScan: () => void;
  connect: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  sendColor: (r: number, g: number, b: number, brightness: number) => Promise<void>;
  sendPattern: (patternId: string) => Promise<void>;
};

const BLEContext = createContext<BLEState | null>(null);

export const useBLE = () => {
  const ctx = useContext(BLEContext);
  if (!ctx) throw new Error('useBLE must be used within BLEProvider');
  return ctx;
};

export const BLEProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const managerRef = useRef<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BLEDevice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const nativeDeviceRef = useRef<any>(null);
  const mockScanTimerRef = useRef<any>(null);

  const isAvailable = Platform.OS !== 'web' && BleManager !== null;

  useEffect(() => {
    if (isAvailable) {
      managerRef.current = new BleManager();
    }
    return () => {
      if (managerRef.current) {
        try { managerRef.current.destroy(); } catch (e) { /* ignore */ }
      }
      if (mockScanTimerRef.current) clearTimeout(mockScanTimerRef.current);
    };
  }, [isAvailable]);

  const requestAndroidPermissions = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return Object.values(granted).every(v => v === PermissionsAndroid.RESULTS.GRANTED);
    } catch {
      return false;
    }
  };

  const startScan = useCallback(async () => {
    setError(null);
    setDevices([]);
    setIsScanning(true);

    if (!isAvailable) {
      // Web / preview mock — simulates discovery
      mockScanTimerRef.current = setTimeout(() => {
        setDevices([
          { id: 'mock-erigi-01', name: 'EXO Fanlight Ver.3', rssi: -52 },
          { id: 'mock-ble-02', name: 'BT-LED-Strip', rssi: -71 },
          { id: 'mock-ble-03', name: 'KPOP Light A1', rssi: -83 },
        ]);
        setIsScanning(false);
      }, 1800);
      return;
    }

    const ok = await requestAndroidPermissions();
    if (!ok) {
      setError('Bluetooth permissions denied');
      setIsScanning(false);
      return;
    }

    const found = new Map<string, BLEDevice>();
    managerRef.current.startDeviceScan(null, null, (err: any, device: any) => {
      if (err) {
        setError(err.message || 'Scan error');
        setIsScanning(false);
        return;
      }
      if (device && device.id) {
        found.set(device.id, {
          id: device.id,
          name: device.name || device.localName || 'Unknown device',
          rssi: device.rssi ?? -100,
        });
        setDevices(Array.from(found.values()).sort((a, b) => b.rssi - a.rssi));
      }
    });
    setTimeout(() => {
      if (managerRef.current) managerRef.current.stopDeviceScan();
      setIsScanning(false);
    }, 8000);
  }, [isAvailable]);

  const stopScan = useCallback(() => {
    if (mockScanTimerRef.current) clearTimeout(mockScanTimerRef.current);
    if (managerRef.current) managerRef.current.stopDeviceScan();
    setIsScanning(false);
  }, []);

  const connect = useCallback(async (deviceId: string) => {
    setIsConnecting(true);
    setError(null);
    try {
      if (!isAvailable) {
        await new Promise(r => setTimeout(r, 900));
        const d = devices.find(x => x.id === deviceId) || { id: deviceId, name: 'EXO Fanlight Ver.3', rssi: -55 };
        setConnectedDevice(d);
        setIsConnected(true);
      } else {
        const native = await managerRef.current.connectToDevice(deviceId);
        await native.discoverAllServicesAndCharacteristics();
        nativeDeviceRef.current = native;
        const d: BLEDevice = { id: native.id, name: native.name || 'Erigi', rssi: -55 };
        setConnectedDevice(d);
        setIsConnected(true);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to connect');
    } finally {
      setIsConnecting(false);
    }
  }, [devices, isAvailable]);

  const disconnect = useCallback(async () => {
    try {
      if (isAvailable && nativeDeviceRef.current) {
        await managerRef.current.cancelDeviceConnection(nativeDeviceRef.current.id);
      }
    } catch (e) { /* ignore */ }
    nativeDeviceRef.current = null;
    setConnectedDevice(null);
    setIsConnected(false);
  }, [isAvailable]);

  const writeBytes = async (bytes: number[]) => {
    if (!isAvailable || !nativeDeviceRef.current) return; // mock no-op
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Buffer } = require('buffer');
      const b64 = Buffer.from(bytes).toString('base64');
      await nativeDeviceRef.current.writeCharacteristicWithoutResponseForService(
        SERVICE_UUID, WRITE_CHAR_UUID, b64
      );
    } catch (e) {
      // Many lightsticks use vendor-specific services; surface as warning, not blocking error
      console.warn('BLE write failed (likely service UUID mismatch for this device):', e);
    }
  };

  const sendColor = useCallback(async (r: number, g: number, b: number, brightness: number) => {
    // Frame: [0x56, R, G, B, brightness, 0xAA] — common LED-strip-style header
    await writeBytes([0x56, r & 0xff, g & 0xff, b & 0xff, brightness & 0xff, 0xAA]);
  }, []);

  const sendPattern = useCallback(async (patternId: string) => {
    const idx = ['solid', 'blink', 'pulse', 'strobe', 'rainbow', 'wave'].indexOf(patternId);
    await writeBytes([0xBB, Math.max(0, idx), 0x44]);
  }, []);

  return (
    <BLEContext.Provider value={{
      isAvailable,
      isScanning, isConnecting, isConnected,
      devices, connectedDevice, error,
      startScan, stopScan, connect, disconnect, sendColor, sendPattern,
    }}>
      {children}
    </BLEContext.Provider>
  );
};
