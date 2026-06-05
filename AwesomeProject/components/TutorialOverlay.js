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
import { useTutorial } from '../src/context/TutorialContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const RED = '#E5252B';
const SPOTLIGHT_PAD = 10;

const STEPS = [
  {
    key: null,
    title: 'Welcome to Next Stop: Delhi Metro',
    description:
      "Your Delhi Metro companion. We'll show you how to plan your journey and get notified before your stop — so you never miss it.",
    icon: 'train-outline',
    isFullCard: true,
  },
  {
    key: 'fromStation',
    title: 'Pick Your Starting Station',
    description: 'Tap here to select the station you are boarding from.',
    tooltipSide: 'below',
  },
  {
    key: 'toStation',
    title: 'Pick Your Destination',
    description: 'Tap here to choose where you want to get off.',
    tooltipSide: 'below',
  },
  {
    key: 'searchButton',
    title: 'Search for Routes',
    description:
      'Tap to find all available routes between your selected stations.',
    tooltipSide: 'above',
  },
  {
    key: null,
    title: 'Set an Alert',
    description:
      'After searching, pick a route and tap "Set Alert". Next Stop: Delhi Metro will notify you as you approach your destination — hands-free, no watching required.',
    icon: 'notifications-outline',
    isFullCard: true,
  },
  {
    key: 'mapTab',
    title: 'Explore the Metro Map',
    description:
      'Tap the Map tab to browse the full Delhi Metro network and track your live journey.',
    tooltipSide: 'above',
  },
  {
    key: null,
    title: "You're All Set!",
    description: 'Enjoy stress-free commutes. Happy travels!',
    icon: 'checkmark-circle-outline',
    isFullCard: true,
    isLast: true,
  },
];

const ProgressDots = ({ total, current }) => (
  <View style={styles.dotsRow}>
    {Array.from({ length: total }).map((_, i) => (
      <View key={i} style={[styles.dot, i === current && styles.dotActive]} />
    ))}
  </View>
);

const TutorialOverlay = () => {
  const { tutorialActive, tutorialStep, setTutorialStep, getRef, endTutorial } =
    useTutorial();

  const [targetRect, setTargetRect] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef(null);

  const step = STEPS[tutorialStep];

  useEffect(() => {
    if (!tutorialActive) return;

    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();

    if (step?.key) {
      // Clear the previous step's rect immediately so it is never drawn for
      // this step while we wait for the new measurement.
      setTargetRect(null);
      // Short delay so layout settles after a tab switch or first render
      const timer = setTimeout(() => {
        const ref = getRef(step.key);
        if (ref?.current) {
          ref.current.measure((_x, _y, w, h, pageX, pageY) => {
            setTargetRect({ step: tutorialStep, x: pageX, y: pageY, w, h });
          });
        } else {
          setTargetRect({ step: tutorialStep, missing: true });
        }
      }, 120);
      return () => clearTimeout(timer);
    } else {
      setTargetRect(null);
    }
  }, [tutorialActive, tutorialStep]);

  useEffect(() => {
    if (!tutorialActive || !targetRect) return;

    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.current.start();
    return () => pulseLoop.current?.stop();
  }, [targetRect, tutorialActive]);

  if (!tutorialActive) return null;

  const goNext = () => {
    if (tutorialStep >= STEPS.length - 1) {
      endTutorial();
      return;
    }
    setTutorialStep(s => s + 1);
  };

  const skipAll = () => endTutorial();

  // Only trust a rect that belongs to the current step (avoids stale-rect flash)
  const rectForStep =
    targetRect && targetRect.step === tutorialStep ? targetRect : null;

  // Keyed step whose target hasn't been measured yet: show just the dim mask so
  // it transitions seamlessly into the spotlight (no wrong-position popup flash).
  if (step?.key && !rectForStep) {
    return (
      <Modal visible transparent statusBarTranslucent animationType="none">
        <Animated.View
          style={[styles.overlayFull, { opacity: fadeAnim }]}
          pointerEvents="auto"
          onStartShouldSetResponder={() => true}
        />
      </Modal>
    );
  }

  // ── Full-screen card (no spotlight) ──────────────────────────────────────
  if (!step?.key || rectForStep?.missing) {
    return (
      <Modal visible transparent statusBarTranslucent animationType="none">
        <Animated.View
          style={[styles.overlayFull, { opacity: fadeAnim }]}
          pointerEvents="box-none">
          <View style={StyleSheet.absoluteFill} pointerEvents="auto" onStartShouldSetResponder={() => true} />
          <View style={styles.cardWrap} pointerEvents="auto">
            <View style={styles.card}>
              {step?.icon && (
                <View style={styles.cardIconCircle}>
                  <Ionicons name={step.icon} size={44} color={RED} />
                </View>
              )}
              <Text style={styles.cardTitle}>{step?.title}</Text>
              <Text style={styles.cardDesc}>{step?.description}</Text>

              <View style={styles.btnRow}>
                {!step?.isLast && (
                  <TouchableOpacity onPress={skipAll} style={styles.skipBtn}>
                    <Text style={styles.skipText}>Skip</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={goNext} style={styles.nextBtn}>
                  <Text style={styles.nextText}>
                    {step?.isLast ? 'Get Started' : 'Next'}
                  </Text>
                  <Ionicons
                    name={step?.isLast ? 'checkmark' : 'arrow-forward'}
                    size={16}
                    color="#fff"
                    style={{ marginLeft: 6 }}
                  />
                </TouchableOpacity>
              </View>

              <ProgressDots total={STEPS.length} current={tutorialStep} />
            </View>
          </View>
        </Animated.View>
      </Modal>
    );
  }

  // ── Spotlight card ────────────────────────────────────────────────────────
  const { x, y, w, h } = rectForStep;
  const sp = SPOTLIGHT_PAD;
  const spotTop = Math.max(0, y - sp);
  const spotLeft = Math.max(0, x - sp);
  const spotW = w + sp * 2;
  const spotH = h + sp * 2;

  const bottomTop = spotTop + spotH;
  const rightLeft = spotLeft + spotW;

  const inTopHalf = y < SCREEN_H * 0.5;
  const tooltipBelow = step.tooltipSide === 'below' || inTopHalf;
  const tooltipTop = tooltipBelow ? bottomTop + 12 : undefined;
  const tooltipBottom = !tooltipBelow ? SCREEN_H - spotTop + 12 : undefined;

  return (
    <Modal visible transparent statusBarTranslucent animationType="none">
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}
        pointerEvents="box-none">
        {/* 4-panel dark mask */}
        <View
          style={[styles.darkPanel, { top: 0, left: 0, right: 0, height: spotTop }]}
          pointerEvents="auto"
          onStartShouldSetResponder={() => true}
        />
        <View
          style={[styles.darkPanel, { top: bottomTop, left: 0, right: 0, bottom: 0 }]}
          pointerEvents="auto"
          onStartShouldSetResponder={() => true}
        />
        <View
          style={[styles.darkPanel, { top: spotTop, left: 0, width: spotLeft, height: spotH }]}
          pointerEvents="auto"
          onStartShouldSetResponder={() => true}
        />
        <View
          style={[styles.darkPanel, { top: spotTop, left: rightLeft, right: 0, height: spotH }]}
          pointerEvents="auto"
          onStartShouldSetResponder={() => true}
        />

        {/* Pulsing highlight border */}
        <Animated.View
          style={[
            styles.spotlightRing,
            {
              top: spotTop - 2,
              left: spotLeft - 2,
              width: spotW + 4,
              height: spotH + 4,
              transform: [{ scale: pulseAnim }],
            },
          ]}
          pointerEvents="none"
        />

        {/* Tooltip card */}
        <View
          style={[
            styles.tooltip,
            { left: 16, right: 16 },
            tooltipTop !== undefined ? { top: tooltipTop } : {},
            tooltipBottom !== undefined ? { bottom: tooltipBottom } : {},
          ]}
          pointerEvents="auto">
          <Text style={styles.tooltipTitle}>{step.title}</Text>
          <Text style={styles.tooltipDesc}>{step.description}</Text>
          <View style={styles.btnRow}>
            <TouchableOpacity onPress={skipAll} style={styles.skipBtn}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goNext} style={styles.nextBtn}>
              <Text style={styles.nextText}>Next</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#fff"
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          </View>
          <ProgressDots total={STEPS.length} current={tutorialStep} />
        </View>
      </Animated.View>
    </Modal>
  );
};

export default TutorialOverlay;

const styles = StyleSheet.create({
  overlayFull: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrap: {
    width: SCREEN_W - 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  cardIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  darkPanel: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  spotlightRing: {
    position: 'absolute',
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: RED,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  tooltipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  tooltipDesc: {
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  skipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RED,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  nextText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#DDD',
  },
  dotActive: {
    backgroundColor: RED,
    width: 18,
  },
});
