import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BLEProvider } from '../src/ble/BLEContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#050505' }}>
      <SafeAreaProvider>
        <BLEProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#050505' },
              animation: 'fade',
            }}
          />
        </BLEProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
