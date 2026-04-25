# Erigi Control — EXO Lightstick Ver. 3 Controller

## Overview
A React Native Expo mobile app (iOS first) that connects to the EXO Official Lightstick Ver. 3 (Erigi) over Bluetooth Low Energy and lets fans control color, brightness, light patterns and a beat-sync concert mode in real time.

## Stack
- React Native + Expo SDK 54 (expo-router file-based navigation)
- BLE: `react-native-ble-plx` (real native implementation, with web preview mock)
- UI: `expo-linear-gradient`, `react-native-reanimated`, `@expo/vector-icons`
- Sliders: `@react-native-community/slider`

## Screens
1. **Home (`/`)** — Hero lightstick visualizer with live glow, hex readout, hue/saturation/lightness/brightness sliders, 4 quick actions (Power/Modes/Concert/Members), member preset chip, bottom-sheet member palette.
2. **Scan (`/scan`)** — Pulsing radar animation, BLE device scanner with signal-strength bars, connect flow.
3. **Modes (`/modes`)** — Pattern grid: Solid, Blink, Pulse, Strobe, Rainbow, Wave.
4. **Concert (`/concert`)** — Animated EQ bars, BPM presets (80/100/120/140/160), beat-sync color cycling through member palette.

## BLE Protocol
- Generic frame `[0x56, R, G, B, brightness, 0xAA]` for color, `[0xBB, patternIdx, 0x44]` for pattern
- Default service/char UUIDs use Nordic UART (placeholder); the real Erigi protocol is proprietary and may need vendor-specific UUIDs — easily swapped in `BLEContext.tsx`.

## Permissions (configured in app.json)
- iOS: `NSBluetoothAlwaysUsageDescription`, `NSBluetoothPeripheralUsageDescription`
- Android: `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`, `ACCESS_FINE_LOCATION`

## Notes
- BLE only works in a custom dev build (`eas build`), not Expo Go. Web preview ships a built-in mock that simulates 3 devices on scan.
- No backend / no auth (per user choice).

## Future enhancements (smart business)
- Save favorite color combos to cloud profile (shareable via QR among fans for synchronized fancam shoots).
- "Concert ticker" — fetch upcoming EXO tour dates and auto-load setlist-driven color sequences.
