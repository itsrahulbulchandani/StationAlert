import React, {useState, useContext, useMemo} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TabContext} from '../App';
import stationsFromKeys from './stationsFromKeys';
import {colorLinesWithIds, graphWithIds} from './graph';
import {findRouteOptions} from '../utilities/helper';
import {computeRouteMetrics, buildSegments, getLineInfo, lightenHex} from '../utilities/routeMetrics';
import RouteTimeline from './RouteTimeline';

const RED = '#E5252B';

const LinePill = ({lineInfo}) => (
  <View style={[styles.linePill, {backgroundColor: lightenHex(lineInfo.color), borderColor: lightenHex(lineInfo.color, 0.5)}]}>
    <Text style={[styles.linePillText, {color: lineInfo.color}]}>{lineInfo.name}</Text>
  </View>
);

const RouteSelection = ({onClose}) => {
  const {
    selectedRoute,
    routesFound,
    setSelectedRoute,
    setActiveTab,
    handleSetAlert,
    alertActive,
    favourites = [],
    setFavourites,
  } = useContext(TabContext);

  const [activeRoute, setActiveRoute] = useState(
    (routesFound && routesFound[0]) || selectedRoute || null,
  );
  const [showTimeline, setShowTimeline] = useState(false);

  const metrics = useMemo(() => computeRouteMetrics(activeRoute), [activeRoute]);
  const segments = useMemo(() => (activeRoute ? buildSegments(activeRoute) : []), [activeRoute]);

  // Alternative options for the same origin/destination.
  const options = useMemo(() => {
    if (!activeRoute?.path?.length) return [];
    const start = activeRoute.path[0];
    const end = activeRoute.path[activeRoute.path.length - 1];
    return findRouteOptions(graphWithIds, start, end, colorLinesWithIds, 4);
  }, [activeRoute]);

  if (!activeRoute || !metrics) {
    return (
      <LinearGradient colors={['#FAFAFA', '#FFFFFF', '#FAFAFA']} style={styles.gradient}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.circleBtn} onPress={onClose}>
              <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Route Details</Text>
            <View style={styles.circleBtn} />
          </View>
          <View style={styles.emptyWrap}>
            <Ionicons name="alert-circle-outline" size={48} color="#D9D9D9" />
            <Text style={styles.emptyText}>No route found between these stations.</Text>
          </View>
        </SafeAreaView>
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

  const startJourney = () => {
    setSelectedRoute(activeRoute);
    setActiveTab('route');
    onClose && onClose();
  };

  const viewOnMap = () => {
    setSelectedRoute(activeRoute);
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
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} onPress={onClose}>
            <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Route Details</Text>
          <TouchableOpacity style={styles.circleBtn} onPress={toggleFav}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={RED} />
          </TouchableOpacity>
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
                  <View style={styles.nameRow}>
                    <Text style={styles.odName}>{metrics.fromName}</Text>
                    <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
                  </View>
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
            <View style={styles.odRight}>
              <View style={styles.trainGlow}><Ionicons name="train" size={42} color={RED} /></View>
              <View style={styles.goodService}>
                <View style={styles.goodDot} />
                <Text style={styles.goodText}>Good Service</Text>
              </View>
            </View>
          </View>

          {/* Stats card */}
          <View style={styles.statsCard}>
            <Stat icon="time-outline" value={`${metrics.durationMin} min`} label="Duration" />
            <Stat icon="git-network-outline" value={`${metrics.interchanges}`} label="Interchange" />
            <Stat icon="cash-outline" value={`₹${metrics.fare}`} label="Fare" />
            <Stat icon="train-outline" value={`${metrics.stationsCount}`} label="Stations" />
          </View>

          {/* Route summary card */}
          <View style={styles.routeCard}>
            <View style={styles.routeCardTop}>
              <View style={styles.fastestPill}>
                <Ionicons name="flash" size={14} color={RED} />
                <Text style={styles.fastestText}>Fastest Route</Text>
              </View>
              <View style={styles.routeCardActions}>
                <TouchableOpacity style={styles.timelineBtn} onPress={() => setShowTimeline(true)}>
                  <Ionicons name="list" size={15} color={RED} />
                  <Text style={styles.timelineBtnText}>View Timeline</Text>
                  <Ionicons name="chevron-forward" size={14} color={RED} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.mapBtn} onPress={viewOnMap}>
                  <Text style={styles.mapBtnText}>View on Map</Text>
                  <Ionicons name="map-outline" size={15} color={RED} />
                </TouchableOpacity>
              </View>
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
              style={[styles.alertBtn, alertActive && styles.alertBtnActive]}
              onPress={() => !alertActive && handleSetAlert(activeRoute)}
              disabled={alertActive}>
              <Ionicons name="notifications" size={20} color={alertActive ? '#999' : RED} />
              <Text style={[styles.alertBtnText, alertActive && {color: '#999'}]}>
                {alertActive ? 'Alert Active' : 'Set Alert'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.startBtn} onPress={startJourney}>
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

          <View style={styles.footnote}>
            <Ionicons name="information-circle-outline" size={15} color="#AAA" />
            <Text style={styles.footnoteText}>Fares may vary. Please check at the time of travel.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
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
  headerTitle: {fontSize: 22, fontWeight: '800', color: '#1A1A1A'},
  circleBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  emptyWrap: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40},
  emptyText: {fontSize: 16, color: '#888', marginTop: 12, textAlign: 'center'},

  // Origin/Destination card
  odCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 16, marginTop: 6, padding: 18,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
  },
  odLeft: {flex: 1},
  odRow: {flexDirection: 'row'},
  odTimeline: {alignItems: 'center', marginRight: 14, paddingTop: 6},
  odDot: {width: 14, height: 14, borderRadius: 7},
  odDashWrap: {height: 48, justifyContent: 'space-evenly', alignItems: 'center', marginVertical: 2},
  odDash: {width: 2, height: 5, backgroundColor: '#D5D5D5', borderRadius: 1},
  nameRow: {flexDirection: 'row', alignItems: 'center'},
  odName: {fontSize: 22, fontWeight: '800', color: '#1A1A1A'},
  odLineRow: {flexDirection: 'row', alignItems: 'center', marginTop: 5},
  odLineDot: {width: 9, height: 9, borderRadius: 5, marginRight: 7},
  odLineText: {fontSize: 14, color: '#555', fontWeight: '600'},
  odRight: {alignItems: 'flex-end', justifyContent: 'space-between'},
  trainGlow: {width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(229,37,43,0.07)', alignItems: 'center', justifyContent: 'center'},
  goodService: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F6E8', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, marginTop: 8},
  goodDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: '#1B9E1B', marginRight: 6},
  goodText: {color: '#1B9E1B', fontSize: 12, fontWeight: '700'},
  liveBadge: {flexDirection: 'row', alignItems: 'center', backgroundColor: RED, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, marginLeft: 10},
  liveDot: {width: 5, height: 5, borderRadius: 3, backgroundColor: '#fff', marginRight: 4},
  liveText: {color: '#fff', fontSize: 10, fontWeight: '800'},

  // Stats card
  statsCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 16, marginTop: 16, paddingVertical: 18,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
  },
  stat: {flex: 1, alignItems: 'center'},
  statIcon: {width: 44, height: 44, borderRadius: 12, backgroundColor: '#FDECEC', alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  statValue: {fontSize: 17, fontWeight: '800', color: '#1A1A1A'},
  statLabel: {fontSize: 12, color: '#9A9A9A', marginTop: 3},

  // Route summary card
  routeCard: {
    backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 16, marginTop: 16, padding: 18,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
  },
  routeCardTop: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap'},
  fastestPill: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDECEC', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6},
  fastestText: {color: RED, fontSize: 13, fontWeight: '700', marginLeft: 5},
  routeCardActions: {flexDirection: 'row', alignItems: 'center'},
  timelineBtn: {flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: RED, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7},
  timelineBtnText: {color: RED, fontSize: 13, fontWeight: '700', marginHorizontal: 4},
  mapBtn: {flexDirection: 'row', alignItems: 'center', marginLeft: 12},
  mapBtnText: {color: RED, fontSize: 13, fontWeight: '700', marginRight: 4},

  segWrap: {marginTop: 18},
  segRow: {flexDirection: 'row'},
  segTimeline: {alignItems: 'center', width: 24},
  segRing: {width: 18, height: 18, borderRadius: 9, borderWidth: 4, backgroundColor: '#fff'},
  segLine: {width: 3, flex: 1, marginVertical: 2, borderRadius: 2},
  segContent: {flex: 1, paddingLeft: 12, paddingBottom: 6},
  segName: {fontSize: 17, fontWeight: '800', color: '#1A1A1A'},
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
  alertBtnActive: {backgroundColor: '#EEE'},
  alertBtnText: {color: RED, fontSize: 16, fontWeight: '700', marginLeft: 8},
  startBtn: {flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: RED, borderRadius: 16, height: 58, shadowColor: RED, shadowOffset: {width: 0, height: 6}, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5},
  startBtnText: {color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8},

  // Other options
  otherCard: {backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 16, marginTop: 16, padding: 18, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3},
  otherTitle: {fontSize: 18, fontWeight: '800', color: '#1A1A1A', marginBottom: 6},
  otherRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F2F2F2'},
  otherName: {fontSize: 16, fontWeight: '700', color: '#1A1A1A'},
  otherMeta: {fontSize: 13, color: '#9A9A9A', marginTop: 3},
  otherFare: {fontSize: 16, fontWeight: '800', color: '#1A1A1A', marginRight: 10},
  otherChevron: {width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#EEE', alignItems: 'center', justifyContent: 'center'},

  footnote: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16, paddingHorizontal: 24},
  footnoteText: {fontSize: 12, color: '#AAA', marginLeft: 6, textAlign: 'center'},
});

export default RouteSelection;
