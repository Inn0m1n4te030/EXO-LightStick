import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useBLE } from '../src/ble/BLEContext';
import { COLORS, PATTERNS } from '../src/constants/theme';

const ICONS: Record<string, any> = {
  solid: 'ellipse',
  blink: 'flash',
  pulse: 'heart',
  strobe: 'flashlight',
  rainbow: 'color-palette',
  wave: 'pulse',
};

export default function ModesScreen() {
  const router = useRouter();
  const { sendPattern } = useBLE();
  const [active, setActive] = useState('solid');

  const onSelect = (id: string) => {
    setActive(id);
    sendPattern(id);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient colors={['#0a0e1a', '#050505']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} testID="modes-back-btn">
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Light Patterns</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Choose a pattern</Text>
        <Text style={styles.subtitle}>Send rhythm and motion to your lightstick</Text>

        <View style={styles.grid}>
          {PATTERNS.map(p => {
            const isActive = p.id === active;
            return (
              <TouchableOpacity
                key={p.id}
                testID={`pattern-${p.id}`}
                style={[styles.card, isActive && styles.cardActive]}
                onPress={() => onSelect(p.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.cardIcon, isActive && { borderColor: COLORS.pearlBlue, backgroundColor: 'rgba(166,193,238,0.12)' }]}>
                  <Ionicons name={ICONS[p.id] || 'ellipse'} size={24} color={isActive ? COLORS.pearlBlue : '#fff'} />
                </View>
                <Text style={styles.cardName}>{p.name}</Text>
                <Text style={styles.cardDesc}>{p.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 30, fontWeight: '700', letterSpacing: -0.6 },
  subtitle: { color: COLORS.textDim, marginTop: 4, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: { width: '48%', padding: 18, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  cardActive: { borderColor: 'rgba(166,193,238,0.6)', backgroundColor: 'rgba(166,193,238,0.06)', shadowColor: COLORS.pearlBlue, shadowOpacity: 0.4, shadowRadius: 16, elevation: 10 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  cardName: { color: '#fff', fontSize: 17, fontWeight: '700' },
  cardDesc: { color: COLORS.textDim, fontSize: 12, marginTop: 4 },
});
