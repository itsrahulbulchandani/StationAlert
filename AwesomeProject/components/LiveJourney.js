import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Animated,
  Easing,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from '@react-native-community/geolocation';
import stationsFromKeys from './stationsFromKeys';
import stationsWithIDs from './stationsWithIDs';
import {getLineInfo} from '../utilities/routeMetrics';

const RED = '#E5252B';
const LIVE_BLUE = '#1A73E8';
const ROW_H = 64; // approx row height, used for auto-scroll

// Haversine distance in metres.
const distanceM = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    0.5 -
    Math.cos(dLat) / 2 +
    (Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon))) /
      2;
  return R * 2 * Math.asin(Math.sqrt(a));
};

// Project point p onto the segment a→b. Returns the fraction `t` (0..1) of the
// way along the segment closest to p, plus the perpendicular distance in metres.
// Uses an equirectangular approximation (fine over a single inter-station hop),
// scaling longitude by cos(lat) so the geometry isn't skewed.
const projectFrac = (p, a, b) => {
  const k = Math.cos((a.latitude * Math.PI) / 180);
  const ax = a.longitude * k, ay = a.latitude;
  const bx = b.longitude * k, by = b.latitude;
  const px = p.longitude * k, py = p.latitude;
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + dx * t, cy = ay + dy * t;
  const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2) * 111000;
  return {t, dist};
};

const coordsOf = id => stationsWithIDs[id]?.coords || stationsWithIDs[String(id)]?.coords;

const fmtDist = m => (m == null ? '' : m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`);

// Shared Map / Line segmented control, used in both this screen's header and the
// map screen's header so the user can flip between the two journey views.
export const JourneyViewToggle = ({value, onChange}) => (
  <View style={toggleStyles.wrap}>
    <TouchableOpacity
      style={[toggleStyles.seg, value === 'map' && toggleStyles.segActive]}
      activeOpacity={0.8}
      onPress={() => onChange('map')}>
      <Ionicons name="map" size={15} color={value === 'map' ? '#fff' : '#777'} />
      <Text style={[toggleStyles.txt, value === 'map' && toggleStyles.txtActive]}>Map</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[toggleStyles.seg, value === 'line' && toggleStyles.segActive]}
      activeOpacity={0.8}
      onPress={() => onChange('line')}>
      <Ionicons name="git-network" size={15} color={value === 'line' ? '#fff' : '#777'} />
      <Text style={[toggleStyles.txt, value === 'line' && toggleStyles.txtActive]}>Line</Text>
    </TouchableOpacity>
  </View>
);

const LiveJourney = ({item, onClose, liveCoords, embedded, onChangeView, alertActive}) => {
  const insets = useSafeAreaInsets();
  const path = item?.path || [];
  const colorPath = item?.colorPath || [];
  const interSet = useMemo(
    () => new Set(item?.interChangeStations || []),
    [item],
  );
  const lastIdx = path.length - 1;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [segFrac, setSegFrac] = useState(0); // 0..1 progress toward next station
  const [nextDist, setNextDist] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [arrived, setArrived] = useState(false);

  const idxRef = useRef(0);
  const progRef = useRef(0); // forward-only progress (index + fraction)
  const rowHeights = useRef([]); // measured row heights, for sliding the puck
  const watchId = useRef(null);
  const scrollRef = useRef(null);

  // Radar pulse behind the "you are here" dot.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // Update progress from a GPS fix. Projects the live position onto the route's
  // segments to get a continuous position (station index + fraction toward the
  // next station), so the dot slides along the line as you approach the next
  // stop instead of snapping. Progress never moves backward (a train follows
  // the route forward) so noisy fixes don't make the dot jump back.
  const onFix = coords => {
    let bestI = 0;
    let bestT = 0;
    let bestD = Infinity;
    for (let i = 0; i < lastIdx; i++) {
      const a = coordsOf(path[i]);
      const b = coordsOf(path[i + 1]);
      if (!a || !b) continue;
      const {t, dist} = projectFrac(coords, a, b);
      if (dist < bestD) {
        bestD = dist;
        bestI = i;
        bestT = t;
      }
    }

    const prog = Math.max(progRef.current, bestI + bestT);
    progRef.current = prog;

    let idx = Math.min(lastIdx, Math.floor(prog + 1e-6));
    let frac = prog - idx;

    // Snap to "arrived" once at/near the final station.
    const lastC = coordsOf(path[lastIdx]);
    const dLast = lastC
      ? distanceM(coords.latitude, coords.longitude, lastC.latitude, lastC.longitude)
      : Infinity;
    if (idx >= lastIdx || dLast < 120) {
      idx = lastIdx;
      frac = 0;
      setArrived(true);
    }

    idxRef.current = idx;
    setCurrentIdx(idx);
    setSegFrac(frac);

    if (idx >= lastIdx) {
      setNextDist(0);
    } else {
      const nc = coordsOf(path[idx + 1]);
      setNextDist(
        nc
          ? distanceM(coords.latitude, coords.longitude, nc.latitude, nc.longitude)
          : null,
      );
    }
  };

  // When embedded in the map screen, the parent feeds GPS through `liveCoords`
  // (handled by the effect below), so we skip starting our own watcher.
  useEffect(() => {
    if (embedded) return undefined;
    let cancelled = false;
    const begin = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
        } else {
          Geolocation.requestAuthorization();
        }
        if (cancelled) return;
        setTracking(true);
        watchId.current = Geolocation.watchPosition(
          pos => onFix(pos.coords),
          () => {},
          {
            enableHighAccuracy: true,
            distanceFilter: 10,
            interval: 3000,
            fastestInterval: 2000,
            maximumAge: 1000,
          },
        );
      } catch (e) {
        // location unavailable — screen still shows the route, dot stays at origin
      }
    };
    begin();
    return () => {
      cancelled = true;
      if (watchId.current != null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Embedded mode: consume the GPS fix supplied by the parent (map) screen.
  useEffect(() => {
    if (liveCoords && Number.isFinite(liveCoords.latitude)) {
      setTracking(true);
      onFix(liveCoords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveCoords]);

  // Keep the active station comfortably in view as it advances.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: Math.max(0, currentIdx * ROW_H - 140),
      animated: true,
    });
  }, [currentIdx]);

  const connectorColor = i =>
    getLineInfo(colorPath[Math.min(i + 1, lastIdx)]).color;

  const currentName = stationsFromKeys[path[currentIdx]];
  const nextName =
    currentIdx < lastIdx ? stationsFromKeys[path[currentIdx + 1]] : null;

  const pulseStyle = {
    transform: [
      {scale: pulse.interpolate({inputRange: [0, 1], outputRange: [1, 2.6]})},
    ],
    opacity: pulse.interpolate({inputRange: [0, 1], outputRange: [0.45, 0]}),
  };

  const renderNode = (id, i) => {
    const isOrigin = i === 0;
    const isDest = i === lastIdx;
    const isInter = interSet.has(id);
    const segColor = getLineInfo(colorPath[i]).color;

    const passed = i < currentIdx;
    const isHere = i === currentIdx;

    return (
      <View
        key={`live-${id}-${i}`}
        style={[styles.row, {minHeight: ROW_H}]}
        onLayout={e => {
          rowHeights.current[i] = e.nativeEvent.layout.height;
        }}>
        <View style={styles.dotCol}>
          {!isOrigin && (
            <View
              style={[
                styles.lineTop,
                {backgroundColor: i <= currentIdx ? connectorColor(i - 1) : '#E2E5EA'},
              ]}
            />
          )}
          {!isDest && (
            <View
              style={[
                styles.lineBottom,
                {backgroundColor: i < currentIdx ? connectorColor(i) : '#E2E5EA'},
              ]}
            />
          )}

          {/* Station marker (always drawn — the live puck floats over it). */}
          {isOrigin || isDest ? (
            <View
              style={[
                styles.ringDot,
                {borderColor: passed ? '#C2C6CE' : segColor},
              ]}
            />
          ) : isInter ? (
            <View
              style={[
                styles.interDot,
                {backgroundColor: passed ? '#C2C6CE' : segColor},
              ]}>
              <Ionicons name="train" size={13} color="#fff" />
            </View>
          ) : (
            <View
              style={[
                styles.smallDot,
                {backgroundColor: passed ? '#CDD1D8' : segColor},
              ]}
            />
          )}

          {/* Live "you are here" puck. Sits on the current station, then slides
              down the connector toward the next station as you approach it. */}
          {isHere && (
            <Animated.View
              style={[
                styles.hereWrap,
                styles.hereOverlay,
                {transform: [{translateY: segFrac * (rowHeights.current[i] || ROW_H)}]},
              ]}>
              <Animated.View style={[styles.herePulse, pulseStyle]} />
              <View style={styles.hereDot}>
                <View style={styles.hereDotCore} />
              </View>
            </Animated.View>
          )}
        </View>

        <View style={styles.contentCol}>
          <Text
            style={[
              isOrigin || isDest || isInter ? styles.majorName : styles.minorName,
              passed && styles.passedName,
              isHere && styles.hereName,
            ]}>
            {stationsFromKeys[id]}
          </Text>
          {isInter && !passed && (
            <Text style={styles.subMeta}>Interchange — change lines</Text>
          )}
          {isHere && (
            <View style={styles.hereBadge}>
              <View style={styles.hereBadgeDot} />
              <Text style={styles.hereBadgeText}>
                {arrived ? 'Arrived' : 'You are here'}
              </Text>
            </View>
          )}
          {passed && <Text style={styles.passedMeta}>Passed</Text>}
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#FAFAFA', '#FFFFFF', '#FAFAFA']} style={styles.gradient}>
      <View
        style={[
          styles.safe,
          {paddingTop: insets?.top ?? 0, paddingBottom: insets?.bottom ?? 0},
        ]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} onPress={onClose}>
            <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          {onChangeView ? (
            <JourneyViewToggle value="line" onChange={onChangeView} />
          ) : (
            <Text style={styles.headerTitle}>Live Journey</Text>
          )}
          {/* Invisible spacer to keep the center toggle balanced opposite the back button. */}
          <View style={styles.headerSpacer} />
        </View>

        {/* Live status banner */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIcon, {backgroundColor: arrived ? '#E3F6E8' : '#E8F0FE'}]}>
              <Ionicons
                name={arrived ? 'checkmark-done' : 'navigate'}
                size={20}
                color={arrived ? '#1B9E1B' : LIVE_BLUE}
              />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.statusLabel}>
                {arrived ? 'Journey complete' : tracking ? 'You are at' : 'Waiting for GPS…'}
              </Text>
              <Text style={styles.statusStation} numberOfLines={1}>
                {currentName || '—'}
              </Text>
            </View>
            <View style={styles.progressPill}>
              <Text style={styles.progressText}>{`${currentIdx + 1}/${path.length}`}</Text>
            </View>
          </View>
          {!arrived && nextName && (
            <View style={styles.nextRow}>
              <Ionicons name="arrow-forward" size={15} color="#888" />
              <Text style={styles.nextText} numberOfLines={1}>
                {`Next: ${nextName}`}
                {nextDist != null ? `  •  ${fmtDist(nextDist)}` : ''}
              </Text>
            </View>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          // Extra bottom space when the LIVE TRACKING bar is showing, so the
          // destination (last stop) isn't hidden behind it.
          contentContainerStyle={{paddingBottom: 40 + (alertActive ? 104 : 0)}}
          showsVerticalScrollIndicator={false}>
          <View style={styles.timelineCard}>{path.map((id, i) => renderNode(id, i))}</View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {flex: 1},
  safe: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {fontSize: 20, fontWeight: '700', color: '#1A1A1A'},
  headerSpacer: {width: 40, height: 40},
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  statusRow: {flexDirection: 'row', alignItems: 'center'},
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusLabel: {fontSize: 12, color: '#9A9A9A', fontWeight: '600'},
  statusStation: {fontSize: 19, fontWeight: '800', color: '#1A1A1A', marginTop: 1},
  progressPill: {
    backgroundColor: '#F2F4F8',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  progressText: {fontSize: 13, fontWeight: '700', color: '#555'},
  nextRow: {flexDirection: 'row', alignItems: 'center', marginTop: 12},
  nextText: {fontSize: 14, color: '#666', fontWeight: '600', marginLeft: 6, flex: 1},

  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 16,
    paddingRight: 18,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  row: {flexDirection: 'row'},
  dotCol: {width: 48, alignItems: 'center'},
  lineTop: {position: 'absolute', top: 0, height: '50%', width: 3, borderRadius: 2},
  lineBottom: {position: 'absolute', bottom: 0, top: '50%', width: 3, borderRadius: 2},
  ringDot: {width: 20, height: 20, borderRadius: 10, borderWidth: 4, backgroundColor: '#fff', marginTop: 4},
  interDot: {width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4},
  smallDot: {width: 11, height: 11, borderRadius: 6, marginTop: 8},

  hereWrap: {width: 30, height: 30, alignItems: 'center', justifyContent: 'center', marginTop: 4},
  // Overlay positioning so the puck floats above the static station dot and can
  // be translated down the connector without affecting layout. dotCol is 48 wide
  // ((48-30)/2 = 9); top -1 aligns the 30px puck's centre with the dot (~14px).
  hereOverlay: {position: 'absolute', top: -1, left: 9, marginTop: 0, zIndex: 5},
  herePulse: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: LIVE_BLUE,
  },
  hereDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: LIVE_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hereDotCore: {width: 11, height: 11, borderRadius: 6, backgroundColor: LIVE_BLUE},

  contentCol: {flex: 1, paddingLeft: 14, paddingBottom: 18, justifyContent: 'center'},
  majorName: {fontSize: 18, fontWeight: '700', color: '#1A1A1A'},
  minorName: {fontSize: 16, color: '#333', fontWeight: '500'},
  passedName: {color: '#AEB3BB'},
  hereName: {color: LIVE_BLUE, fontWeight: '800'},
  subMeta: {fontSize: 13, color: '#9A9A9A', marginTop: 3},
  passedMeta: {fontSize: 12, color: '#BDC2CA', marginTop: 2, fontWeight: '500'},

  hereBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F0FE',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 6,
  },
  hereBadgeDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: LIVE_BLUE, marginRight: 6},
  hereBadgeText: {fontSize: 12, fontWeight: '700', color: LIVE_BLUE},
});

const toggleStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  seg: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  segActive: {backgroundColor: RED},
  txt: {fontSize: 13, fontWeight: '700', color: '#777', marginLeft: 5},
  txtActive: {color: '#fff'},
});

export default LiveJourney;
