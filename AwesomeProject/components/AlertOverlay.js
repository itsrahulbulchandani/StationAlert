import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import stationsFromKeys from './stationsFromKeys';

const RED = '#E5252B';
// Pill height + top padding of the tab container.
const TAB_PILL_HEIGHT = 62;

// A persistent "live journey" bar shown while station tracking is active.
// Pinned just above the tab bar (so it never covers screen headers/cards),
// tap to jump to the map, or Stop to end tracking.
const AlertOverlay = ({ isActive, onStopAlerts, route, onOpen }) => {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current; // 0 hidden -> 1 shown
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: isActive ? 1 : 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [isActive, slide]);

  useEffect(() => {
    if (!isActive) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 850, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 850, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [isActive, pulse]);

  if (!isActive) return null;

  const routeTitle =
    route && route.path && route.path.length >= 2
      ? `${stationsFromKeys[route.path[0]]} → ${stationsFromKeys[route.path[route.path.length - 1]]}`
      : 'Journey in progress';

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] });
  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  // Position just above the tab bar (pill + inset + top padding).
  const bottomOffset = TAB_PILL_HEIGHT + Math.max(insets?.bottom ?? 0, 8) + 8;

  return (
    <Animated.View
      style={[styles.wrap, { bottom: bottomOffset, opacity: slide, transform: [{ translateY }] }]}
      pointerEvents="box-none">
      <TouchableOpacity activeOpacity={0.9} style={styles.bar} onPress={onOpen}>
        <View style={styles.dotWrap}>
          <Animated.View
            style={[styles.pulseRing, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]}
          />
          <View style={styles.dot} />
        </View>
        <View style={styles.texts}>
          <Text style={styles.label}>LIVE TRACKING</Text>
          <Text style={styles.route} numberOfLines={1}>{routeTitle}</Text>
        </View>
        <TouchableOpacity style={styles.stopBtn} onPress={onStopAlerts} activeOpacity={0.8}>
          <Ionicons name="stop" size={14} color="#fff" />
          <Text style={styles.stopText}>Stop</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 30,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
    elevation: 8,
  },
  dotWrap: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  pulseRing: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: RED },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: RED },
  texts: { flex: 1, marginRight: 12 },
  label: { fontSize: 11, fontWeight: '700', color: RED, letterSpacing: 0.5 },
  route: { fontSize: 15, fontWeight: '700', color: '#1A1A1A', marginTop: 2 },
  stopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RED,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  stopText: { color: '#fff', fontSize: 14, fontWeight: '700', marginLeft: 5 },
});

export default AlertOverlay;
