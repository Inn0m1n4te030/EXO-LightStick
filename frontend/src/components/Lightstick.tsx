import React, { useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

type Props = {
  color: string;
  brightness: number; // 0..1
  pattern?: string;
};

const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export default function Lightstick({ color, brightness, pattern = 'solid' }: Props) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = 1;
    if (pattern === 'pulse' || pattern === 'wave') {
      pulse.value = withRepeat(withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
    } else if (pattern === 'blink') {
      pulse.value = withRepeat(withSequence(withTiming(0.4, { duration: 350 }), withTiming(1, { duration: 350 })), -1, false);
    } else if (pattern === 'strobe') {
      pulse.value = withRepeat(withSequence(withTiming(0.2, { duration: 80 }), withTiming(1, { duration: 80 })), -1, false);
    } else {
      pulse.value = withTiming(1, { duration: 200 });
    }
  }, [pattern, pulse]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + 0.5 * brightness * pulse.value,
    transform: [{ scale: pulse.value }],
  }));

  const glowOuter = hexToRgba(color, 0.55 * brightness);
  const glowMid = hexToRgba(color, 0.85 * brightness);

  return (
    <View style={styles.wrap} pointerEvents="none">
      {/* Outer halo */}
      <Animated.View style={[styles.halo, { backgroundColor: glowOuter, shadowColor: color }, animStyle]} />
      {/* Top crystal/gem */}
      <Animated.View style={[styles.gem, animStyle]}>
        <LinearGradient
          colors={[hexToRgba(color, 1), hexToRgba(color, 0.8), hexToRgba('#FFFFFF', 0.95)]}
          style={styles.gemInner}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        >
          <View style={[styles.gemCore, { backgroundColor: glowMid, shadowColor: color }]} />
        </LinearGradient>
      </Animated.View>
      {/* Neck */}
      <View style={styles.neck}>
        <LinearGradient colors={['#1a1a1a', '#0a0a0a']} style={StyleSheet.absoluteFill} />
      </View>
      {/* Handle */}
      <View style={styles.handle}>
        <LinearGradient
          colors={['#2a2a2a', '#0d0d0d', '#1a1a1a']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        />
        <View style={styles.handleHighlight} />
        <View style={styles.handleRing} />
        <View style={[styles.handleRing, { top: 'auto', bottom: 36 }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 200,
    height: 380,
  },
  halo: {
    position: 'absolute',
    top: -10,
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.6,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 60 },
      android: { elevation: 20 },
      default: {},
    }),
  },
  gem: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 30 },
      android: { elevation: 24 },
      default: {},
    }),
  },
  gemInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gemCore: {
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.8,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 24 },
      android: { elevation: 18 },
      default: {},
    }),
  },
  neck: {
    width: 22,
    height: 36,
    marginTop: -6,
    overflow: 'hidden',
    borderRadius: 4,
  },
  handle: {
    width: 70,
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  handleHighlight: {
    position: 'absolute',
    left: 8,
    top: 8,
    bottom: 8,
    width: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  handleRing: {
    position: 'absolute',
    left: 0, right: 0, top: 36,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
});
