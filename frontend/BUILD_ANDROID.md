# Build the Android APK (offline installable)

This produces a `.apk` file you can copy to your Android phone and install — no Play Store needed, no developer account fees.

## Prerequisites
- A free [Expo account](https://expo.dev/signup) (the build runs in Expo's cloud)
- Node.js installed locally

## One-time setup
```bash
# Install the EAS CLI
npm install -g eas-cli

# Login to your Expo account
eas login

# From the project root:
cd /app/frontend

# Link the project to your Expo account (creates a projectId in app.json)
eas init
```

## Build the APK
```bash
cd /app/frontend
eas build --profile preview --platform android
```

That's it. After ~10–20 minutes EAS gives you a URL where you can download the `.apk`.

## Install on your phone
1. Download the `.apk` to your Android phone (Drive, email, USB, AirDroid — any way)
2. Open it. Android may ask you to enable **"Install from unknown sources"** for your file manager / browser — allow it
3. Tap **Install**
4. Open the app → grant **Bluetooth** and **Location** permissions when prompted
5. Tap the bluetooth icon → scan → connect to your Erigi lightstick

## Re-building after code changes
Just run `eas build --profile preview --platform android` again. The new APK will be a separate download — uninstall the old one first or bump `expo.version` in `app.json` to install over the top.

## Build profiles available (in `eas.json`)
| Profile | Output | Use case |
|---|---|---|
| `preview` | `.apk` | Sideload onto your own phone — **recommended for you** |
| `development` | `.apk` (with dev client) | Live-reload during development |
| `production` | `.aab` (App Bundle) | Upload to Google Play Store |

## Important note about the EXO Erigi BLE protocol
The app currently writes color data using a generic Nordic UART service UUID. The real Erigi Ver. 3 may use proprietary service/characteristic UUIDs that I don't have access to. If colors don't actually change on the lightstick after a successful connection:

1. Use the **nRF Connect** Android app to scan the Erigi and inspect its services/characteristics
2. Note the writable characteristic UUID
3. Open `/app/frontend/src/ble/BLEContext.tsx`
4. Replace `SERVICE_UUID` and `WRITE_CHAR_UUID` constants near the top
5. Adjust the byte format in `sendColor()` if the protocol differs (e.g., some lightsticks use `[0xAA, R, G, B, 0x55]` or a 7-byte frame)
6. Rebuild
