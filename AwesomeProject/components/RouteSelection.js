import React, {useState, useContext, useMemo, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Share,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TabContext} from '../App';
import stationsFromKeys from './stationsFromKeys';
import {colorLinesWithIds, graphWithIds} from './graph';
import {findRouteOptions} from '../utilities/helper';
import {computeRouteMetrics, buildSegments, getLineInfo, lightenHex} from '../utilities/routeMetrics';
import RouteTimeline from './RouteTimeline';
import {SquareAd} from '../src/components/SquareAd';
import SpotlightTutorial from './SpotlightTutorial';

const ROUTE_TUTORIAL_STEPS = [
  {
    key: null,
    title: 'Route Details',
    description: "Here's everything about your journey — stats, step-by-step directions, and actions to start or set an alert.",
    icon: 'map-outline',
  },
  {
    key: 'statsCard',
    title: 'Journey at a Glance',
    description: 'See the estimated travel time, number of interchanges, fare, and total stations for this route.',
    tooltipSide: 'below',
  },
  {
    key: 'timelineBtn',
    title: 'Full Station List',
    description: 'Tap Timeline to see every station on your journey with platform numbers and interchange points.',
    tooltipSide: 'below',
  },
  {
    key: 'alertBtn',
    title: 'Set a Station Alert',
    description: "Tap Set Alert before you board. Next Stop: Delhi Metro will notify you as you near the next station — no need to watch the map.",
    tooltipSide: 'above',
  },
  {
    key: 'startBtn',
    title: 'Start Journey',
    description: 'Tap here to open the live map and track your route in real time.',
    tooltipSide: 'above',
    isLast: true,
  },
];

const RED = '#E5252B';

const LinePill = ({lineInfo}) => (
  <View style={[styles.linePill, {backgroundColor: lightenHex(lineInfo.color), borderColor: lightenHex(lineInfo.color, 0.5)}]}>
    <Text style={[styles.linePillText, {color: lineInfo.color}]}>{lineInfo.name}</Text>
  </View>
);

const RouteSelection = ({onClose}) => {
  const insets = useSafeAreaInsets();
  const {
    selectedRoute,
    routesFound,
    setSelectedRoute,
    setActiveTab,
    handleSetAlert,
    setLiveTracking,
    alertActive,
    favourites = [],
    setFavourites,
  } = useContext(TabContext);

  const [activeRoute, setActiveRoute] = useState(
    (routesFound && routesFound[0]) || selectedRoute || null,
  );
  const [showTimeline, setShowTimeline] = useState(false);

  const statsCardRef = useRef(null);
  const timelineBtnRef = useRef(null);
  const alertBtnRef = useRef(null);
  const startBtnRef = useRef(null);
  const tutorialRefs = {
    statsCard: statsCardRef,
    timelineBtn: timelineBtnRef,
    alertBtn: alertBtnRef,
    startBtn: startBtnRef,
  };

  const metrics = useMemo(() => computeRouteMetrics(activeRoute), [activeRoute]);
  const segments = useMemo(() => (activeRoute ? buildSegments(activeRoute) : []), [activeRoute]);

  // Alternative options for the same origin/destination.
  const options = useMemo(() => {
    if (!activeRoute?.path?.length) return [];
    const start = activeRoute.path[0];
    const end = activeRoute.path[activeRoute.path.length - 1];
    return findRouteOptions(graphWithIds, start, end, colorLinesWithIds, 4);
  }, [activeRoute]);

  // Badge describing the *currently shown* route relative to the alternatives,
  // so picking a slower alternate no longer keeps saying "Fastest Route".
  const routeBadge = useMemo(() => {
    if (!metrics) return null;
    const pool = options.length ? options : [activeRoute];
    const minDuration = Math.min(
      ...pool.map(o => computeRouteMetrics(o)?.durationMin ?? Infinity),
    );
    const minInterchanges = Math.min(
      ...pool.map(o => (o.interchanges ?? Infinity)),
    );
    if (metrics.durationMin <= minDuration) return {icon: 'flash', text: 'Fastest Route'};
    if ((activeRoute.interchanges ?? Infinity) <= minInterchanges)
      return {icon: 'git-network-outline', text: 'Fewer Interchanges'};
    return {icon: 'shuffle', text: 'Alternate Route'};
  }, [metrics, options, activeRoute]);

  if (!activeRoute || !metrics) {
    return (
      <LinearGradient colors={['#FAFAFA', '#FFFFFF', '#FAFAFA']} style={styles.gradient}>
        <View style={[styles.safe, {paddingTop: insets?.top ?? 0, paddingBottom: insets?.bottom ?? 0}]}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.circleBtn} onPress={onClose}>
              <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Route Details</Text>
            <View style={styles.circleBtn} />
          </View>
          <View style={styles.emptyWrap}>
            <View style={styles.emptyArt} pointerEvents="none">
              <View style={styles.emptyGlow} />
              <Image
                source={require('../assets/Header.png')}
                style={styles.emptyImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.emptyTitle}>No Routes Found</Text>
            <Text style={styles.emptyText}>We couldn't find a route between these stations.</Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const favKey = {from: metrics.fromName, to: metrics.toName};
  const isFav = favourites.some(f => f.from === favKey.from && f.to === favKey.to);
  const toggleFav = () => {
    if (!setFavourites) return;
    setFavourites(prev =>
      isFav
        ? prev.filter(f => !(f.from === favKey.from && f.to === favKey.to))
        : [favKey, ...prev]);
  };

  const onShare = async () => {
    if (!metrics) return;
    const lines = segments.map(s => s.lineInfo.name).join(' → ');
    const msg =
      `🚇 ${metrics.fromName} → ${metrics.toName}\n` +
      `~${metrics.durationMin} min • ${metrics.interchanges} interchange • ₹${metrics.fare} • ${metrics.stationsCount} stations\n` +
      `${lines}\n\nShared via Next Stop: Delhi Metro`;
    try {
      await Share.share(
        { message: msg, title: `${metrics.fromName} → ${metrics.toName}` },
        { dialogTitle: `Share route to ${metrics.toName}` },
      );
    } catch (_) {}
  };

  const startJourney = () => {
    setSelectedRoute(activeRoute);
    // Live tracking on by default when a journey starts (alerts stay opt-in via
    // the Set Alert button / the map screen toggle).
    setLiveTracking && setLiveTracking(true);
    setActiveTab('route');
    onClose && onClose();
  };

  if (showTimeline) {
    return (
      <RouteTimeline
        item={activeRoute}
        onClose={() => setShowTimeline(false)}
        isFav={isFav}
        onToggleFav={toggleFav}
      />
    );
  }

  const optionLabel = (opt, m) => {
    if (opt.interchanges === 0) return 'Fewer Interchanges';
    const mn = Math.min(...options.map(o => o.distance));
    if (opt.distance === mn) return 'Economy Route';
    return 'Alternate Route';
  };

  return (
    <LinearGradient colors={['#FAFAFA', '#FFFFFF', '#FAFAFA']} style={styles.gradient}>
      <View style={[styles.safe, {paddingTop: insets?.top ?? 0, paddingBottom: insets?.bottom ?? 0}]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} onPress={onClose}>
            <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Route Details</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.circleBtn} onPress={toggleFav}>
              <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={RED} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.circleBtn, {marginLeft: 8}]} onPress={onShare}>
              <Ionicons name={Platform.OS === 'ios' ? 'share-outline' : 'share-social-outline'} size={20} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={{paddingBottom: 40}} showsVerticalScrollIndicator={false}>
          {/* Origin/Destination card */}
          <View style={styles.odCard}>
            <View style={styles.odLeft}>
              <View style={styles.odRow}>
                <View style={styles.odTimeline}>
                  <View style={[styles.odDot, {backgroundColor: metrics.startLine.color}]} />
                  <View style={styles.odDashWrap}>
                    <View style={styles.odDash} /><View style={styles.odDash} /><View style={styles.odDash} />
                  </View>
                  <View style={[styles.odDot, {backgroundColor: metrics.endLine.color}]} />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.odName}>{metrics.fromName}</Text>
                  <View style={styles.odLineRow}>
                    <View style={[styles.odLineDot, {backgroundColor: metrics.startLine.color}]} />
                    <Text style={styles.odLineText}>{metrics.startLine.name}</Text>
                  </View>
                  <Text style={[styles.odName, {marginTop: 18}]}>{metrics.toName}</Text>
                  <View style={styles.odLineRow}>
                    <View style={[styles.odLineDot, {backgroundColor: metrics.endLine.color}]} />
                    <Text style={styles.odLineText}>{metrics.endLine.name}</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.odRight} pointerEvents="none">
              <View style={styles.odGlow} />
              <Image
                source={require('../assets/Header.png')}
                style={styles.odImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Stats card */}
          <View ref={statsCardRef} style={styles.statsCard}>
            <Stat icon="time-outline" value={`${metrics.durationMin} min`} label="Duration" />
            <Stat icon="git-network-outline" value={`${metrics.interchanges}`} label="Interchange" />
            <Stat icon="cash-outline" value={`₹${metrics.fare}`} label="Fare" />
            <Stat icon="train-outline" value={`${metrics.stationsCount}`} label="Stations" />
          </View>

          {/* Route summary card */}
          <View style={styles.routeCard}>
            <View style={styles.routeCardTop}>
              <View style={styles.fastestPill}>
                <Ionicons name={routeBadge.icon} size={14} color={RED} />
                <Text style={styles.fastestText}>{routeBadge.text}</Text>
              </View>
              <TouchableOpacity ref={timelineBtnRef} style={styles.timelineBtn} onPress={() => setShowTimeline(true)} activeOpacity={0.8}>
                <Ionicons name="list" size={16} color={RED} />
                <Text style={styles.timelineBtnText}>Timeline</Text>
              </TouchableOpacity>
            </View>

            {/* Segment summary: board points + interchanges + destination */}
            <View style={styles.segWrap}>
              {/* Origin (first line) */}
              <View style={styles.segRow}>
                <View style={styles.segTimeline}>
                  <View style={[styles.segRing, {borderColor: segments[0].lineInfo.color}]} />
                  <View style={[styles.segLine, {backgroundColor: segments[0].lineInfo.color}]} />
                </View>
                <View style={styles.segContent}>
                  <Text style={styles.segName}>{metrics.fromName}</Text>
                  <View style={styles.pillRow}><LinePill lineInfo={segments[0].lineInfo} /></View>
                  <Text style={styles.segMeta}>{`Platform ${segments[0].boardPlatform}  •  Towards ${segments[0].towards}`}</Text>
                  <Ionicons name="arrow-down" size={16} color="#BBB" style={{marginTop: 6}} />
                </View>
              </View>

              {/* Interchange boundary stations -> board next line */}
              {(activeRoute.interChangeStations || []).map((boundaryId, k) => {
                const nextSeg = segments[k + 1];
                if (!nextSeg) return null;
                return (
                  <View key={`ic-${k}`} style={styles.segRow}>
                    <View style={styles.segTimeline}>
                      <View style={[styles.segRing, {borderColor: nextSeg.lineInfo.color}]} />
                      <View style={[styles.segLine, {backgroundColor: nextSeg.lineInfo.color}]} />
                    </View>
                    <View style={styles.segContent}>
                      <Text style={styles.segName}>{stationsFromKeys[boundaryId]}</Text>
                      <Text style={styles.segInterchange}>{`Interchange  •  2 min`}</Text>
                      <View style={styles.pillRow}><LinePill lineInfo={nextSeg.lineInfo} /></View>
                      <Text style={styles.segMeta}>{`Platform ${nextSeg.boardPlatform}  •  Towards ${nextSeg.towards}`}</Text>
                      <Ionicons name="arrow-down" size={16} color="#BBB" style={{marginTop: 6}} />
                    </View>
                  </View>
                );
              })}

              {/* Final destination */}
              <View style={styles.segRow}>
                <View style={styles.segTimeline}>
                  <View style={[styles.segRing, {borderColor: metrics.endLine.color}]} />
                </View>
                <View style={styles.segContent}>
                  <Text style={styles.segName}>{metrics.toName}</Text>
                  <Text style={styles.segMeta}>{`Platform ${segments[segments.length - 1].boardPlatform}`}</Text>
                </View>
              </View>
            </View>

            {activeRoute.interChangeStations?.length > 0 && (
              <View style={styles.infoBar}>
                <Ionicons name="walk" size={16} color="#666" />
                <Text style={styles.infoBarText}>
                  {`Platform change at ${stationsFromKeys[activeRoute.interChangeStations[0]]}`}
                </Text>
                <Ionicons name="information-circle-outline" size={18} color="#999" />
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              ref={alertBtnRef}
              style={[styles.alertBtn, alertActive && styles.alertBtnActive]}
              onPress={() => !alertActive && handleSetAlert(activeRoute)}
              disabled={alertActive}>
              <Ionicons
                name={alertActive ? 'checkmark-circle' : 'notifications'}
                size={20}
                color={alertActive ? '#1B9E1B' : RED}
              />
              <Text style={[styles.alertBtnText, alertActive && {color: '#1B9E1B'}]}>
                {alertActive ? 'Alert Set' : 'Set Alert'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity ref={startBtnRef} style={styles.startBtn} onPress={startJourney}>
              <Ionicons name="navigate" size={20} color="#fff" />
              <Text style={styles.startBtnText}>Start Journey</Text>
            </TouchableOpacity>
          </View>

          {/* Other route options */}
          {options.length > 1 && (
            <View style={styles.otherCard}>
              <Text style={styles.otherTitle}>Other Route Options</Text>
              {options
                .filter(o => o.path.join() !== activeRoute.path.join())
                .slice(0, 3)
                .map((opt, i) => {
                  const m = computeRouteMetrics(opt);
                  return (
                    <TouchableOpacity
                      key={`opt-${i}`}
                      style={styles.otherRow}
                      onPress={() => setActiveRoute(opt)}>
                      <View style={{flex: 1}}>
                        <Text style={styles.otherName}>{optionLabel(opt, m)}</Text>
                        <Text style={styles.otherMeta}>{`${m.durationMin} min  •  ${opt.interchanges} Interchange`}</Text>
                      </View>
                      <Text style={styles.otherFare}>{`₹${m.fare}`}</Text>
                      <View style={styles.otherChevron}>
                        <Ionicons name="chevron-forward" size={16} color="#999" />
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          )}

          {/* Ad sits after the route content so it never interrupts the
              search flow — a natural reading break before the footnote. */}
          <SquareAd />

          <View style={styles.footnote}>
            <Ionicons name="information-circle-outline" size={15} color="#AAA" />
            <Text style={styles.footnoteText}>Fares may vary. Please check at the time of travel.</Text>
          </View>
        </ScrollView>
        <SpotlightTutorial
          steps={ROUTE_TUTORIAL_STEPS}
          stepRefs={tutorialRefs}
          storageKey="tutorial_route_details_v1"
        />
      </View>
    </LinearGradient>
  );
};

const Stat = ({icon, value, label}) => (
  <View style={styles.stat}>
    <View style={styles.statIcon}><Ionicons name={icon} size={20} color={RED} /></View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  gradient: {flex: 1},
  safe: {flex: 1},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  headerTitle: {fontSize: 22, fontWeight: '700', color: '#1A1A1A'},
  headerRight: {flexDirection: 'row', alignItems: 'center'},
  circleBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  emptyWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40},
  emptyArt: {width: 240, height: 170, alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  emptyGlow: {position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(229,37,43,0.05)'},
  emptyImage: {width: '100%', height: '100%'},
  emptyTitle: {fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 6},
  emptyText: {fontSize: 15, color: '#888', textAlign: 'center'},

  // Origin/Destination card
  odCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 16, marginTop: 6, padding: 18,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
  },
  odLeft: {flex: 1},
  odRow: {flexDirection: 'row'},
  odTimeline: {alignItems: 'center', marginRight: 14, paddingTop: 6},
  odDot: {width: 14, height: 14, borderRadius: 7},
  odDashWrap: {height: 48, justifyContent: 'space-evenly', alignItems: 'center', marginVertical: 2},
  odDash: {width: 2, height: 5, backgroundColor: '#D5D5D5', borderRadius: 1},
  odName: {fontSize: 20, fontWeight: '700', color: '#1A1A1A', lineHeight: 25},
  odLineRow: {flexDirection: 'row', alignItems: 'center', marginTop: 5},
  odLineDot: {width: 9, height: 9, borderRadius: 5, marginRight: 7},
  odLineText: {fontSize: 14, color: '#555', fontWeight: '600'},
  odRight: {width: 110, height: 84, alignItems: 'center', justifyContent: 'center', marginLeft: 6},
  odGlow: {position: 'absolute', width: 84, height: 84, borderRadius: 42, backgroundColor: 'rgba(229,37,43,0.06)'},
  odImage: {width: '100%', height: '100%'},

  // Stats card
  statsCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 16, marginTop: 16, paddingVertical: 18,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
  },
  stat: {flex: 1, alignItems: 'center'},
  statIcon: {width: 44, height: 44, borderRadius: 12, backgroundColor: '#FDECEC', alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  statValue: {fontSize: 16, fontWeight: '700', color: '#1A1A1A'},
  statLabel: {fontSize: 12, color: '#9A9A9A', marginTop: 3, fontWeight: '500'},

  // Route summary card
  routeCard: {
    backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 16, marginTop: 16, padding: 18,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
  },
  routeCardTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  fastestPill: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDECEC', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6},
  fastestText: {color: RED, fontSize: 13, fontWeight: '700', marginLeft: 5},
  timelineBtn: {flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: RED, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6},
  timelineBtnText: {color: RED, fontSize: 13, fontWeight: '700', marginLeft: 5},

  segWrap: {marginTop: 18},
  segRow: {flexDirection: 'row'},
  segTimeline: {alignItems: 'center', width: 24},
  segRing: {width: 18, height: 18, borderRadius: 9, borderWidth: 4, backgroundColor: '#fff'},
  segLine: {width: 3, flex: 1, marginVertical: 2, borderRadius: 2},
  segContent: {flex: 1, paddingLeft: 12, paddingBottom: 10},
  segName: {fontSize: 16, fontWeight: '700', color: '#1A1A1A'},
  segInterchange: {fontSize: 13, color: '#9A9A9A', marginTop: 3},
  pillRow: {flexDirection: 'row', marginTop: 6},
  segMeta: {fontSize: 13, color: '#9A9A9A', marginTop: 6},
  linePill: {alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1},
  linePillText: {fontSize: 13, fontWeight: '700'},

  infoBar: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F4F4', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginTop: 12},
  infoBarText: {flex: 1, fontSize: 14, color: '#444', fontWeight: '500', marginLeft: 8},

  // Actions
  actionRow: {flexDirection: 'row', marginHorizontal: 16, marginTop: 16},
  alertBtn: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDECEC', borderRadius: 16, height: 58, marginRight: 12},
  alertBtnActive: {backgroundColor: '#E3F6E8'},
  alertBtnText: {color: RED, fontSize: 16, fontWeight: '700', marginLeft: 8},
  startBtn: {flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: RED, borderRadius: 16, height: 58, shadowColor: RED, shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5},
  startBtnText: {color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8},

  // Other options
  otherCard: {backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 16, marginTop: 16, padding: 18, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3},
  otherTitle: {fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginBottom: 6},
  otherRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F2'},
  otherName: {fontSize: 16, fontWeight: '700', color: '#1A1A1A'},
  otherMeta: {fontSize: 13, color: '#9A9A9A', marginTop: 3},
  otherFare: {fontSize: 16, fontWeight: '700', color: '#1A1A1A', marginRight: 10},
  otherChevron: {width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#EEE', alignItems: 'center', justifyContent: 'center'},

  footnote: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingHorizontal: 24},
  footnoteText: {fontSize: 12, color: '#AAA', marginLeft: 6, textAlign: 'center'},
});

export default RouteSelection;
