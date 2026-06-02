import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import stationsFromKeys from './stationsFromKeys';
import {computeRouteMetrics, buildSegments, getLineInfo, lightenHex, formatClock} from '../utilities/routeMetrics';
import {AdBanner} from '../src/components/AdBanner';

const RED = '#E5252B';
const WALK_MIN = 2;

const LinePill = ({lineInfo, small}) => (
  <View style={[styles.linePill, {backgroundColor: lightenHex(lineInfo.color)}, small && {paddingVertical: 2}]}>
    <Text style={[styles.linePillText, {color: lineInfo.color}]}>{lineInfo.name}</Text>
  </View>
);

const RouteTimeline = ({item, onClose, isFav, onToggleFav}) => {
  const insets = useSafeAreaInsets();
  const startDate = useMemo(() => new Date(), []);
  const metrics = useMemo(() => computeRouteMetrics(item, startDate), [item, startDate]);
  const segments = useMemo(() => buildSegments(item, startDate), [item, startDate]);

  if (!metrics) return null;

  const path = item.path;
  const colorPath = item.colorPath || [];
  const interSet = new Set(item.interChangeStations || []);
  const lastIdx = path.length - 1;

  const onShare = () => {
    const lines = segments.map(s => s.lineInfo.name).join(' → ');
    Share.share({
      message:
        `🚇 ${metrics.fromName} → ${metrics.toName}\n` +
        `${metrics.startTime} – ${metrics.arrivalTime} (${metrics.durationMin} min)\n` +
        `${lines}\n${metrics.interchanges} interchange • ₹${metrics.fare} • ${metrics.stationsCount} stations`,
    }).catch(() => {});
  };

  // Which line colour to draw on the connector BELOW station i (the next hop).
  const connectorColor = i => getLineInfo(colorPath[Math.min(i + 1, lastIdx)]).color;

  const renderNode = (id, i) => {
    const isOrigin = i === 0;
    const isDest = i === lastIdx;
    const isInter = interSet.has(id);
    const segColor = getLineInfo(colorPath[i]).color;
    const showTime = isOrigin || isDest || isInter;
    const time = metrics.times[i];

    // The board info for the line entered AFTER this interchange.
    const nextLine = isInter ? getLineInfo(colorPath[i + 1]) : null;
    const nextPlatform = isInter ? ((Math.abs(parseInt(path[i + 1], 10) || 0) % 4) + 1) : null;

    return (
      <View key={`n-${id}-${i}`} style={styles.row}>
        <View style={styles.timeCol}>
          {showTime ? (
            <Text style={styles.timeText}>{formatClock(startDate, time)}</Text>
          ) : null}
        </View>

        <View style={styles.dotCol}>
          {!isOrigin && <View style={[styles.lineTop, {backgroundColor: connectorColor(i - 1)}]} />}
          {!isDest && <View style={[styles.lineBottom, {backgroundColor: connectorColor(i)}]} />}
          {isOrigin || isDest ? (
            <View style={[styles.ringDot, {borderColor: segColor}]} />
          ) : isInter ? (
            <View style={[styles.interDot, {backgroundColor: segColor}]}>
              <Ionicons name="train" size={14} color="#fff" />
            </View>
          ) : (
            <View style={[styles.smallDot, {backgroundColor: segColor}]} />
          )}
        </View>

        <View style={styles.contentCol}>
          {isOrigin && (
            <>
              <Text style={styles.majorName}>{stationsFromKeys[id]}</Text>
              <Text style={styles.subMeta}>{`Platform ${segments[0].boardPlatform}  •  Towards ${segments[0].towards}`}</Text>
              <View style={styles.pillRow}><LinePill lineInfo={segments[0].lineInfo} /></View>
            </>
          )}

          {isInter && (
            <>
              <Text style={styles.majorName}>{stationsFromKeys[id]}</Text>
              <Text style={styles.subMeta}>Interchange Station</Text>
              <View style={styles.interBox}>
                <View style={styles.interBoxTop}>
                  <LinePill lineInfo={nextLine} small />
                  <Text style={styles.interBoxDot}>•</Text>
                  <Text style={styles.interBoxTowards} numberOfLines={1}>{`Towards ${segments.find(s => s.lineInfo.color === nextLine.color)?.towards || metrics.toName}`}</Text>
                </View>
                <View style={styles.interBoxBottom}>
                  <Ionicons name="walk" size={16} color="#666" />
                  <Text style={styles.interBoxWalk}>{`${WALK_MIN} min  •  Platform ${nextPlatform}`}</Text>
                </View>
              </View>
            </>
          )}

          {isDest && (
            <>
              <Text style={styles.majorName}>{stationsFromKeys[id]}</Text>
              <Text style={styles.subMeta}>{`Platform ${segments[segments.length - 1].boardPlatform}`}</Text>
            </>
          )}

          {!isOrigin && !isDest && !isInter && (
            <Text style={styles.minorName}>{stationsFromKeys[id]}</Text>
          )}
        </View>
      </View>
    );
  };

  const legendLines = [];
  const seenColors = new Set();
  segments.forEach(s => {
    if (!seenColors.has(s.lineInfo.color)) {
      seenColors.add(s.lineInfo.color);
      legendLines.push(s.lineInfo);
    }
  });

  return (
    <LinearGradient colors={['#FAFAFA', '#FFFFFF', '#FAFAFA']} style={styles.gradient}>
      <View style={[styles.safe, {paddingTop: insets?.top ?? 0, paddingBottom: insets?.bottom ?? 0}]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.circleBtn} onPress={onClose}>
            <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Route Timeline</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.circleBtn} onPress={onToggleFav}>
              <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={20} color={RED} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.circleBtn, {marginLeft: 8}]} onPress={onShare}>
              <Ionicons name={Platform.OS === 'ios' ? 'share-outline' : 'share-social-outline'} size={20} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={{paddingBottom: 30}} showsVerticalScrollIndicator={false}>
          {/* Summary card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={{flex: 1}}>
                <Text style={styles.sumStation}>{metrics.fromName}</Text>
                <Text style={styles.sumTime}>{`Start  ${metrics.startTime}`}</Text>
              </View>
              <View style={styles.sumArrow}><Ionicons name="arrow-forward" size={18} color="#666" /></View>
              <View style={{flex: 1, alignItems: 'flex-end'}}>
                <Text style={styles.sumStation}>{metrics.toName}</Text>
                <Text style={styles.sumTime}>{`Arrival  ${metrics.arrivalTime}`}</Text>
              </View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.statsRow}>
              <Stat icon="time-outline" value={`${metrics.durationMin} min`} label="Duration" />
              <View style={styles.statSep} />
              <Stat icon="git-network-outline" value={`${metrics.interchanges}`} label="Interchange" />
              <View style={styles.statSep} />
              <Stat icon="cash-outline" value={`₹${metrics.fare}`} label="Fare" />
              <View style={styles.statSep} />
              <Stat icon="train-outline" value={`${metrics.stationsCount}`} label="Stations" />
            </View>
          </View>

          {/* Timeline */}
          <View style={styles.timelineCard}>
            {path.map((id, i) => renderNode(id, i))}

            <View style={styles.legend}>
              {legendLines.map(l => (
                <View key={l.color} style={styles.legendItem}>
                  <View style={[styles.legendDash, {backgroundColor: l.color}]} />
                  <Text style={styles.legendText}>{l.name}</Text>
                </View>
              ))}
              <View style={styles.legendItem}>
                <Ionicons name="walk" size={16} color="#666" />
                <Text style={styles.legendText}>Interchange</Text>
              </View>
            </View>
          </View>

          {/* Banner ad at the end of the timeline content. */}
          <AdBanner />
        </ScrollView>
      </View>
    </LinearGradient>
  );
};

const Stat = ({icon, value, label}) => (
  <View style={styles.stat}>
    <View style={styles.statIcon}><Ionicons name={icon} size={18} color={RED} /></View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

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
  headerRight: {flexDirection: 'row', alignItems: 'center'},
  circleBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  headerTitle: {fontSize: 20, fontWeight: '700', color: '#1A1A1A'},

  summaryCard: {
    backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 16, marginTop: 6, padding: 18,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
  },
  summaryTop: {flexDirection: 'row', alignItems: 'center'},
  sumStation: {fontSize: 18, fontWeight: '700', color: '#1A1A1A'},
  sumTime: {fontSize: 13, color: '#9A9A9A', marginTop: 3},
  sumArrow: {width: 36, height: 36, borderRadius: 18, backgroundColor: '#F4F4F4', alignItems: 'center', justifyContent: 'center', marginHorizontal: 8},
  summaryDivider: {height: 1, backgroundColor: '#F0F0F0', marginVertical: 16},
  statsRow: {flexDirection: 'row', alignItems: 'center'},
  stat: {flex: 1, alignItems: 'center'},
  statSep: {width: 1, height: 40, backgroundColor: '#F0F0F0'},
  statIcon: {width: 36, height: 36, borderRadius: 10, backgroundColor: '#FDECEC', alignItems: 'center', justifyContent: 'center', marginBottom: 6},
  statValue: {fontSize: 16, fontWeight: '700', color: '#1A1A1A'},
  statLabel: {fontSize: 11, color: '#9A9A9A', marginTop: 2},

  timelineCard: {
    backgroundColor: '#fff', borderRadius: 20, marginHorizontal: 16, marginTop: 16, paddingVertical: 18, paddingRight: 18,
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.06, shadowRadius: 14, elevation: 3,
  },
  row: {flexDirection: 'row', minHeight: 40},
  timeCol: {width: 64, alignItems: 'flex-end', paddingRight: 8, paddingTop: 0},
  timeText: {fontSize: 12, color: '#8A8A8A', fontWeight: '600'},
  dotCol: {width: 34, alignItems: 'center'},
  lineTop: {position: 'absolute', top: 0, height: '50%', width: 3, borderRadius: 2},
  lineBottom: {position: 'absolute', bottom: 0, top: '50%', width: 3, borderRadius: 2},
  ringDot: {width: 20, height: 20, borderRadius: 10, borderWidth: 4, backgroundColor: '#fff', marginTop: 2},
  interDot: {width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 2},
  smallDot: {width: 11, height: 11, borderRadius: 6, marginTop: 6},
  contentCol: {flex: 1, paddingLeft: 12, paddingBottom: 18},
  majorName: {fontSize: 18, fontWeight: '700', color: '#1A1A1A'},
  minorName: {fontSize: 16, color: '#333', fontWeight: '500', paddingTop: 2},
  subMeta: {fontSize: 13, color: '#9A9A9A', marginTop: 4},
  pillRow: {flexDirection: 'row', marginTop: 8},
  linePill: {alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4},
  linePillText: {fontSize: 13, fontWeight: '700'},
  interBox: {backgroundColor: '#F7F7F7', borderRadius: 14, padding: 12, marginTop: 10},
  interBoxTop: {flexDirection: 'row', alignItems: 'center'},
  interBoxDot: {marginHorizontal: 8, color: '#BBB'},
  interBoxTowards: {flex: 1, fontSize: 13, color: '#666', fontWeight: '500'},
  interBoxBottom: {flexDirection: 'row', alignItems: 'center', marginTop: 10},
  interBoxWalk: {fontSize: 13, color: '#666', fontWeight: '600', marginLeft: 8},
  legend: {flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', marginLeft: 64, paddingTop: 14, marginTop: 6},
  legendItem: {flexDirection: 'row', alignItems: 'center', marginRight: 18, marginBottom: 6},
  legendDash: {width: 22, height: 4, borderRadius: 2, marginRight: 6},
  legendText: {fontSize: 13, color: '#666', fontWeight: '500'},
});

export default RouteTimeline;
