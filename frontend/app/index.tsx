import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Lightstick from '../src/components/Lightstick';
import HueSlider from '../src/components/HueSlider';
import { useBLE } from '../src/ble/BLEContext';
import { COLORS, MEMBER_COLORS } from '../src/constants/theme';
import { hslToRgb, rgbToHex, hexToRgb } from '../src/utils/color';

export default function HomeScreen() {
  const router = useRouter();
  const { isConnected, connectedDevice, disconnect, sendColor } = useBLE();
  const [hue, setHue] = useState(214); // pearl blue
  const [saturation, setSaturation] = useState(0.55);
  const [lightness, setLightness] = useState(0.79);
  const [brightness, setBrightness] = useState(0.85);
  const [pattern, setPattern] = useState('solid');
  const [showMembers, setShowMembers] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>('official');

  const rgb = useMemo(() => hslToRgb(hue, saturation, lightness), [hue, saturation, lightness]);
  const hex = useMemo(() => rgbToHex(rgb.r, rgb.g, rgb.b), [rgb]);

  // Push to lightstick whenever color or brightness changes
  useEffect(() => {
    sendColor(rgb.r, rgb.g, rgb.b, Math.round(brightness * 255));
  }, [rgb.r, rgb.g, rgb.b, brightness, sendColor]);

  const haptic = () => Platform.OS !== 'web' && Haptics.selectionAsync();

  const applyPreset = (id: string, color: string) => {
    haptic();
    setActivePresetId(id);
    const { r, g, b } = hexToRgb(color);
    // approximate to HSL for sliders (kept simple — store directly)
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const l = (max + min) / 2;
    const d = max - min;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let h = 0;
    if (d !== 0) {
      const rN = r / 255, gN = g / 255, bN = b / 255;
      if (max === rN) h = 60 * (((gN - bN) / d) % 6);
      else if (max === gN) h = 60 * ((bN - rN) / d + 2);
      else h = 60 * ((rN - gN) / d + 4);
      if (h < 0) h += 360;
    }
    setHue(h);
    setSaturation(s);
    setLightness(l);
    setShowMembers(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <LinearGradient colors={['#0a0a14', '#050505']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.connBadge} testID="connection-status">
          <View style={[styles.connDot, { backgroundColor: isConnected ? COLORS.success : COLORS.warning }]} />
          <Text style={styles.connText}>
            {isConnected ? connectedDevice?.name?.slice(0, 18) : 'Not connected'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          testID="scan-link-btn"
          onPress={() => router.push('/scan')}
          style={styles.iconBtn}
        >
          <Ionicons name="bluetooth" size={20} color={isConnected ? COLORS.success : '#fff'} />
        </TouchableOpacity>
        {isConnected && (
          <TouchableOpacity testID="disconnect-btn" onPress={disconnect} style={[styles.iconBtn, { marginLeft: 8 }]}>
            <Ionicons name="close" size={20} color={COLORS.error} />
          </TouchableOpacity>
        )}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero lightstick */}
        <View style={styles.heroWrap}>
          <Lightstick color={hex} brightness={brightness} pattern={pattern} />
        </View>

        <Text style={styles.colorHex} testID="current-hex">{hex}</Text>
        <Text style={styles.colorLabel}>Current color</Text>

        {/* Hue slider */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Hue</Text>
          <HueSlider hue={hue} onChange={(h) => { setHue(h); setActivePresetId(null); }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Saturation</Text>
          <Slider
            testID="sat-slider"
            minimumValue={0}
            maximumValue={1}
            value={saturation}
            onValueChange={(v) => { setSaturation(v); setActivePresetId(null); }}
            minimumTrackTintColor={COLORS.pearlBlue}
            maximumTrackTintColor="rgba(255,255,255,0.15)"
            thumbTintColor="#fff"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Lightness</Text>
          <Slider
            testID="light-slider"
            minimumValue={0.1}
            maximumValue={0.9}
            value={lightness}
            onValueChange={(v) => { setLightness(v); setActivePresetId(null); }}
            minimumTrackTintColor={COLORS.pearlBlue}
            maximumTrackTintColor="rgba(255,255,255,0.15)"
            thumbTintColor="#fff"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionLabel}>Brightness</Text>
            <Text style={styles.sectionValue}>{Math.round(brightness * 100)}%</Text>
          </View>
          <Slider
            testID="brightness-slider"
            minimumValue={0.05}
            maximumValue={1}
            value={brightness}
            onValueChange={setBrightness}
            minimumTrackTintColor="#fff"
            maximumTrackTintColor="rgba(255,255,255,0.15)"
            thumbTintColor="#fff"
          />
        </View>

        {/* Quick action row */}
        <View style={styles.actionRow}>
          <ActionBtn
            testID="action-power"
            icon="power"
            label="Power"
            onPress={() => {
              haptic();
              setBrightness(brightness > 0.05 ? 0.05 : 0.85);
            }}
          />
          <ActionBtn
            testID="action-modes"
            icon="pulse"
            label="Modes"
            onPress={() => router.push('/modes')}
          />
          <ActionBtn
            testID="action-concert"
            icon="musical-notes"
            label="Concert"
            onPress={() => router.push('/concert')}
          />
          <ActionBtn
            testID="action-members"
            icon="people"
            label="Members"
            onPress={() => { haptic(); setShowMembers(true); }}
          />
        </View>

        {/* Active preset chip */}
        {activePresetId && (
          <View style={styles.presetChip}>
            <View style={[styles.presetDot, { backgroundColor: hex }]} />
            <Text style={styles.presetText}>
              {MEMBER_COLORS.find(m => m.id === activePresetId)?.name}
            </Text>
          </View>
        )}

        {isConnected && (
          <View testID="bottom-disconnect-spacer" style={{ height: 8 }} />
        )}
      </ScrollView>

      {/* Members bottom sheet */}
      <Modal visible={showMembers} transparent animationType="slide" onRequestClose={() => setShowMembers(false)}>
        <TouchableOpacity activeOpacity={1} style={styles.sheetBackdrop} onPress={() => setShowMembers(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Member Colors</Text>
            <Text style={styles.sheetSubtitle}>Tap to apply official EXO member glow</Text>
            <View style={styles.memberGrid}>
              {MEMBER_COLORS.map(m => (
                <TouchableOpacity
                  key={m.id}
                  testID={`preset-${m.id}`}
                  style={styles.memberItem}
                  onPress={() => applyPreset(m.id, m.color)}
                >
                  <View style={[styles.memberOrb, { backgroundColor: m.color, shadowColor: m.color }]} />
                  <Text style={styles.memberName}>{m.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function ActionBtn({ icon, label, onPress, testID }: { icon: any; label: string; onPress: () => void; testID?: string }) {
  return (
    <TouchableOpacity testID={testID} style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionIcon}>
        <Ionicons name={icon} size={22} color="#fff" />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 },
  connBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  connDot: { width: 8, height: 8, borderRadius: 4 },
  connText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  heroWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 8, height: 380 },
  colorHex: { color: '#fff', fontSize: 32, fontWeight: '300', textAlign: 'center', letterSpacing: 4, marginTop: 4 },
  colorLabel: { color: COLORS.textFaint, textAlign: 'center', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', marginTop: 4 },
  section: { marginTop: 22 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionLabel: { color: COLORS.textFaint, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  sectionValue: { color: '#fff', fontSize: 12, fontWeight: '600' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 26, paddingHorizontal: 4 },
  actionBtn: { alignItems: 'center', gap: 8, flex: 1 },
  actionIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: COLORS.textDim, fontSize: 11, fontWeight: '600' },
  presetChip: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: COLORS.border },
  presetDot: { width: 10, height: 10, borderRadius: 5 },
  presetText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  disconnect: { alignSelf: 'center', marginTop: 28, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,51,102,0.4)' },
  disconnectText: { color: COLORS.error, fontWeight: '600' },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#0a0a0a', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, borderTopWidth: 1, borderColor: COLORS.border },
  sheetHandle: { width: 44, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 16 },
  sheetTitle: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  sheetSubtitle: { color: COLORS.textDim, fontSize: 13, marginTop: 4, marginBottom: 20 },
  memberGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 8 },
  memberItem: { width: '22%', alignItems: 'center', marginBottom: 18 },
  memberOrb: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', shadowOpacity: 0.9, shadowRadius: 12, shadowOffset: { width: 0, height: 0 }, elevation: 10 },
  memberName: { color: '#fff', fontSize: 11, marginTop: 6, fontWeight: '600' },
});
