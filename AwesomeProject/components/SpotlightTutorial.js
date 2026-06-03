/**
 * Self-contained spotlight tutorial component.
 * Renders inside a transparent Modal so it sits above all in-app
 * elevation/zIndex layers (avoids Android elevation bleed-through).
 *
 * Props:
 *   steps        - array of step objects (see STEP SHAPE below)
 *   stepRefs     - { [key]: React.RefObject } — refs for spotlight targets
 *   storageKey   - AsyncStorage key; tutorial auto-shows on first visit
 *   onDone       - optional callback when tutorial ends
 *
 * STEP SHAPE:
 *   { key, title, description, tooltipSide? }  — spotlight step
 *   { key: null, title, description, icon?, isLast? }  — full card step
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const RED = '#E5252B';
const PAD = 10;

const ProgressDots = ({ total, current }) => (
  <View style={styles.dotsRow}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
    ))}
  </View>
);

const SpotlightTutorial = ({ steps, stepRefs = {}, storageKey, onDone }) => {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then(val => {
      if (!val) setActive(true);
    }).catch(() => {});
  }, [storageKey]);

  const step = steps[stepIdx];

  // The overlay lives in a full-window Modal, so pageX/pageY from measure()
  // are already in the Modal's coordinate space — no offset adjustment needed.
  const measureTarget = () => {
    if (!step?.key) { setTargetRect(null); return; }
    const ref = stepRefs[step.key];
    if (!ref?.current) { setTargetRect(null); return; }
    ref.current.measure((_x, _y, w, h, pageX, pageY) => {
      setTargetRect({ x: pageX, y: pageY, w, h });
    });
  };

  useEffect(() => {
    if (!active) return;
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
    const timer = setTimeout(measureTarget, 150);
    return () => clearTimeout(timer);
  }, [active, stepIdx]);

  useEffect(() => {
    if (!active || !targetRect) return;
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
      ]),
    );
    pulseLoop.current.start();
    return () => pulseLoop.current?.stop();
  }, [targetRect, active]);

  const finish = async () => {
    setActive(false);
    try { await AsyncStorage.setItem(storageKey, 'true'); } catch (_) {}
    onDone?.();
  };

  const goNext = () => {
    if (stepIdx >= steps.length - 1) { finish(); return; }
    setStepIdx(s => s + 1);
  };

  if (!active) return null;

  // ── Full-screen card ──────────────────────────────────────────────────────
  if (!step?.key || !targetRect) {
    return (
      <Modal visible transparent statusBarTranslucent animationType="none">
        <Animated.View
          style={[styles.overlayFull, { opacity: fadeAnim }]}
          pointerEvents="box-none">
          <View style={StyleSheet.absoluteFill} pointerEvents="auto" onStartShouldSetResponder={() => true} />
          <View style={styles.cardWrap} pointerEvents="auto">
            <View style={styles.card}>
              {step?.icon && (
                <View style={styles.iconCircle}>
                  <Ionicons name={step.icon} size={44} color={RED} />
                </View>
              )}
              <Text style={styles.cardTitle}>{step?.title}</Text>
              <Text style={styles.cardDesc}>{step?.description}</Text>
              <View style={styles.btnRow}>
                {!step?.isLast && (
                  <TouchableOpacity onPress={finish} style={styles.skipBtn}>
                    <Text style={styles.skipText}>Skip</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={goNext} style={styles.nextBtn}>
                  <Text style={styles.nextText}>{step?.isLast ? 'Got it' : 'Next'}</Text>
                  <Ionicons
                    name={step?.isLast ? 'checkmark' : 'arrow-forward'}
                    size={16}
                    color="#fff"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              </View>
              <ProgressDots total={steps.length} current={stepIdx} />
            </View>
          </View>
        </Animated.View>
      </Modal>
    );
  }

  // ── Spotlight ─────────────────────────────────────────────────────────────
  const { x, y, w, h } = targetRect;
  const spotTop = Math.max(0, y - PAD);
  const spotLeft = Math.max(0, x - PAD);
  const spotW = w + PAD * 2;
  const spotH = h + PAD * 2;

  const inTopHalf = y < SCREEN_H * 0.5;
  const tooltipBelow = step.tooltipSide === 'below' || (step.tooltipSide !== 'above' && inTopHalf);
  const tooltipTop = tooltipBelow ? spotTop + spotH + 12 : undefined;
  const tooltipBottom = !tooltipBelow ? SCREEN_H - spotTop + 12 : undefined;

  return (
    <Modal visible transparent statusBarTranslucent animationType="none">
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
        pointerEvents="box-none">
        {/* 4-panel dark mask */}
        <View style={[styles.dark, { top: 0, left: 0, right: 0, height: spotTop }]}
          pointerEvents="auto" onStartShouldSetResponder={() => true} />
        <View style={[styles.dark, { top: spotTop + spotH, left: 0, right: 0, bottom: 0 }]}
          pointerEvents="auto" onStartShouldSetResponder={() => true} />
        <View style={[styles.dark, { top: spotTop, left: 0, width: spotLeft, height: spotH }]}
          pointerEvents="auto" onStartShouldSetResponder={() => true} />
        <View style={[styles.dark, { top: spotTop, left: spotLeft + spotW, right: 0, height: spotH }]}
          pointerEvents="auto" onStartShouldSetResponder={() => true} />

        {/* Pulsing ring */}
        <Animated.View
          style={[
            styles.ring,
            { top: spotTop - 2, left: spotLeft - 2, width: spotW + 4, height: spotH + 4,
              transform: [{ scale: pulseAnim }] },
          ]}
          pointerEvents="none"
        />

        {/* Tooltip */}
        <View
          style={[
            styles.tooltip,
            { left: 16, right: 16 },
            tooltipTop !== undefined ? { top: tooltipTop } : {},
            tooltipBottom !== undefined ? { bottom: tooltipBottom } : {},
          ]}
          pointerEvents="auto">
          <Text style={styles.tipTitle}>{step.title}</Text>
          <Text style={styles.tipDesc}>{step.description}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={finish} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goNext} style={styles.nextBtn}>
              <Text style={styles.nextText}>Next</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
          <ProgressDots total={steps.length} current={stepIdx} />
        </View>
      </Animated.View>
    </Modal>
  );
};

export default SpotlightTutorial;

const styles = StyleSheet.create({
  overlayFull: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrap: { width: SCREEN_W - 48, zIndex: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 12,
  },
  iconCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: { fontSize: 19, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 10 },
  cardDesc: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 21, marginBottom: 24 },
  dark: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.78)' },
  ring: { position: 'absolute', borderRadius: 12, borderWidth: 2.5, borderColor: RED },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
  },
  tipTitle: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  tipDesc: { fontSize: 13, color: '#555', lineHeight: 19, marginBottom: 16 },
  btnRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10, marginBottom: 14 },
  skipBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  skipText: { fontSize: 14, color: '#888', fontWeight: '500' },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: RED, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24,
  },
  nextText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  dotsRow: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#DDD' },
  dotActive: { backgroundColor: RED, width: 18 },
});
