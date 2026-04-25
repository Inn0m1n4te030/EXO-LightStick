import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  hue: number; // 0..360
  onChange: (hue: number) => void;
};

const HUE_STOPS = ['#FF0000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000'];

export default function HueSlider({ hue, onChange }: Props) {
  const [width, setWidth] = useState(1);
  const widthRef = useRef(1);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth(w);
    widthRef.current = w;
  };

  const update = (x: number) => {
    const w = widthRef.current || 1;
    const clamped = Math.max(0, Math.min(w, x));
    onChange((clamped / w) * 360);
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => update(e.nativeEvent.locationX),
      onPanResponderMove: (e) => update(e.nativeEvent.locationX),
    })
  ).current;

  const thumbX = (hue / 360) * width - 14;

  return (
    <View style={styles.wrap} onLayout={onLayout} {...pan.panHandlers} testID="hue-slider">
      <LinearGradient
        colors={HUE_STOPS}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.track}
      />
      <View style={[styles.thumb, { left: Math.max(0, thumbX) }]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 36, justifyContent: 'center' },
  track: { height: 14, borderRadius: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  thumb: {
    position: 'absolute',
    top: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.6)',
    shadowColor: '#A6C1EE',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 6,
  },
});
