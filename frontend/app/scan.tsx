import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useBLE } from '../src/ble/BLEContext';
import { COLORS } from '../src/constants/theme';

export default function ScanScreen() {
  const router = useRouter();
  const { isScanning, devices, startScan, stopScan, connect, isConnecting, isConnected, error, isAvailable } = useBLE();

  const ring1 = useSharedValue(0);
  const ring2 = useSharedValue(0);

  useEffect(() => {
    ring1.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.ease) }), -1, false);
    ring2.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.out(Easing.ease) }), -1, false);
  }, [ring1, ring2]);

  useEffect(() => {
    startScan();
    return () => stopScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isConnected) router.replace('/');
  }, [isConnected, router]);

  const ring1Style = useAnimatedStyle(() => ({
    opacity: 1 - ring1.value,
    transform: [{ scale: 0.4 + ring1.value * 1.6 }],
  }));
  const ring2Style = useAnimatedStyle(() => ({
    opacity: 1 - ring2.value,
    transform: [{ scale: 0.4 + ring2.value * 1.6 }],
  }));

  const handleConnect = (id: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    connect(id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient colors={['#0a0e1a', '#050505', '#050505']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="scan-back-btn">
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connect</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.radarWrap}>
        <Animated.View style={[styles.ring, ring1Style]} />
        <Animated.View style={[styles.ring, ring2Style]} />
        <View style={styles.radarCore}>
          <Ionicons name="bluetooth" size={32} color={COLORS.pearlBlue} />
        </View>
      </View>

      <Text style={styles.title}>{isScanning ? 'Searching for Erigi…' : 'Nearby devices'}</Text>
      <Text style={styles.subtitle}>
        {isAvailable
          ? 'Make sure your lightstick is powered on'
          : 'Preview mode — real BLE works in a dev build'}
      </Text>

      {error ? <Text style={styles.error} testID="scan-error">{error}</Text> : null}

      <FlatList
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 10 }}
        data={devices}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          isScanning ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator color={COLORS.pearlBlue} />
              <Text style={styles.emptyText}>Listening for advertisements…</Text>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No devices found</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isErigi = /erigi|exo|fanlight/i.test(item.name);
          const bars = item.rssi > -55 ? 4 : item.rssi > -70 ? 3 : item.rssi > -85 ? 2 : 1;
          return (
            <TouchableOpacity
              testID={`device-${item.id}`}
              activeOpacity={0.85}
              onPress={() => handleConnect(item.id)}
              style={[styles.deviceRow, isErigi && styles.deviceRowAccent]}
            >
              <View style={[styles.deviceIcon, isErigi && { borderColor: COLORS.pearlBlue }]}>
                <Ionicons name={isErigi ? 'sparkles' : 'hardware-chip-outline'} size={20} color={isErigi ? COLORS.pearlBlue : '#fff'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.deviceName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.deviceMeta}>{item.id.slice(0, 18)} · {item.rssi} dBm</Text>
              </View>
              <View style={styles.signalBars}>
                {[1, 2, 3, 4].map(i => (
                  <View key={i} style={[styles.signalBar, { height: 4 + i * 3, opacity: i <= bars ? 1 : 0.2 }]} />
                ))}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          testID="rescan-btn"
          style={[styles.scanBtn, isScanning && { opacity: 0.6 }]}
          disabled={isScanning || isConnecting}
          onPress={startScan}
        >
          <Ionicons name="refresh" size={18} color="#000" />
          <Text style={styles.scanBtnText}>{isScanning ? 'Scanning…' : 'Scan again'}</Text>
        </TouchableOpacity>
      </View>

      {isConnecting && (
        <View style={styles.connectingOverlay}>
          <ActivityIndicator color={COLORS.pearlBlue} size="large" />
          <Text style={styles.connectingText}>Connecting…</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  radarWrap: { alignItems: 'center', justifyContent: 'center', height: 200, marginTop: 8 },
  ring: { position: 'absolute', width: 220, height: 220, borderRadius: 110, borderWidth: 1.5, borderColor: COLORS.pearlBlue },
  radarCore: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(166,193,238,0.10)', borderWidth: 1, borderColor: 'rgba(166,193,238,0.4)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 28, fontWeight: '700', textAlign: 'center', marginTop: 12, letterSpacing: -0.5 },
  subtitle: { color: COLORS.textDim, textAlign: 'center', marginTop: 6, marginBottom: 20, paddingHorizontal: 32 },
  error: { color: COLORS.error, textAlign: 'center', paddingHorizontal: 24, marginBottom: 8 },
  emptyWrap: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  emptyText: { color: COLORS.textFaint },
  deviceRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: COLORS.border },
  deviceRowAccent: { borderColor: 'rgba(166,193,238,0.4)', backgroundColor: 'rgba(166,193,238,0.06)' },
  deviceIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  deviceName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  deviceMeta: { color: COLORS.textFaint, fontSize: 11, marginTop: 2 },
  signalBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  signalBar: { width: 3, backgroundColor: COLORS.pearlBlue, borderRadius: 1.5 },
  footer: { padding: 20 },
  scanBtn: { flexDirection: 'row', gap: 8, alignSelf: 'center', backgroundColor: '#fff', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 999, alignItems: 'center' },
  scanBtnText: { color: '#000', fontWeight: '700' },
  connectingOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(5,5,5,0.85)', alignItems: 'center', justifyContent: 'center', gap: 14 },
  connectingText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
