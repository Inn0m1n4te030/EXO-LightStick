import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useBLE } from '../src/ble/BLEContext';
import { COLORS, MEMBER_COLORS } from '../src/constants/theme';
import { hexToRgb } from '../src/utils/color';

const BAR_COUNT = 28;

export default function ConcertScreen() {
  const router = useRouter();
  const { sendColor } = useBLE();
  const [active, setActive] = useState(true);
  const [bpm, setBpm] = useState(120);
  const colorIdxRef = useRef(0);
  const intervalRef = useRef<any>(null);

  // Beat-driven color cycle
  useEffect(() => {
    if (!active) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const period = 60000 / bpm;
    intervalRef.current = setInterval(() => {
      colorIdxRef.current = (colorIdxRef.current + 1) % MEMBER_COLORS.length;
      const c = MEMBER_COLORS[colorIdxRef.current].color;
      const { r, g, b } = hexToRgb(c);
      sendColor(r, g, b, 255);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, period);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [active, bpm, sendColor]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient colors={['#0a0014', '#050505']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="concert-back-btn">
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Concert Mode</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.center}>
        <Text style={styles.statusLabel}>{active ? 'CONCERT SYNC ACTIVE' : 'PAUSED'}</Text>
        <Text style={styles.title}>Feel the Beat</Text>
        <Text style={styles.subtitle}>Lightstick syncs to a {bpm} BPM rhythm cycling through member colors</Text>

        <View style={styles.visualizer}>
          {Array.from({ length: BAR_COUNT }).map((_, i) => (
            <Bar key={i} index={i} active={active} />
          ))}
        </View>

        <View style={styles.bpmRow}>
          {[80, 100, 120, 140, 160].map(b => (
            <TouchableOpacity
              key={b}
              testID={`bpm-${b}`}
              style={[styles.bpmBtn, bpm === b && styles.bpmBtnActive]}
              onPress={() => setBpm(b)}
            >
              <Text style={[styles.bpmText, bpm === b && { color: '#000' }]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          testID="concert-toggle"
          style={[styles.toggle, !active && styles.toggleOff]}
          onPress={() => setActive(!active)}
          activeOpacity={0.85}
        >
          <Ionicons name={active ? 'pause' : 'play'} size={22} color={active ? '#000' : '#fff'} />
          <Text style={[styles.toggleText, active && { color: '#000' }]}>
            {active ? 'Pause sync' : 'Resume sync'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Bar({ index, active }: { index: number; active: boolean }) {
  const h = useSharedValue(8);
  useEffect(() => {
    if (!active) {
      h.value = withTiming(8, { duration: 400 });
      return;
    }
    const dur = 250 + (index % 5) * 60;
    const peak = 30 + Math.random() * 90;
    h.value = withRepeat(
      withSequence(
        withTiming(peak, { duration: dur, easing: Easing.out(Easing.ease) }),
        withTiming(8 + Math.random() * 12, { duration: dur, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );
  }, [active, index, h]);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[styles.bar, style]} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  statusLabel: { color: COLORS.pearlBlue, fontSize: 11, letterSpacing: 4, fontWeight: '700' },
  title: { color: '#fff', fontSize: 44, fontWeight: '700', letterSpacing: -1, marginTop: 8 },
  subtitle: { color: COLORS.textDim, textAlign: 'center', marginTop: 8, marginBottom: 32 },
  visualizer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 130, width: '100%', marginBottom: 36, gap: 3 },
  bar: { flex: 1, backgroundColor: COLORS.pearlBlue, borderRadius: 2, opacity: 0.85 },
  bpmRow: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  bpmBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: COLORS.border, backgroundColor: 'rgba(255,255,255,0.03)' },
  bpmBtnActive: { backgroundColor: '#fff', borderColor: '#fff' },
  bpmText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  toggle: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 26, paddingVertical: 14, borderRadius: 999 },
  toggleOff: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.border },
  toggleText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
