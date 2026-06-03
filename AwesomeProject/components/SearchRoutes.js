import React, {useState, useEffect, useContext, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {metroStation} from './metroRoutes';
import {colorLines, colorLinesWithIds, graph, graphWithIds} from './graph';
import {TabContext} from '../App';
import {useTheme} from '../src/context/ThemeContext';
import {findAllRoutes2} from '../utilities/helper';
import RouteSelection from './RouteSelection';
import stationsInverted from './stations_inverted';
import { SquareAd } from '../src/components/SquareAd';
import { AdBanner } from '../src/components/AdBanner';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StationPicker from './StationPicker';
import { useTutorial } from '../src/context/TutorialContext';
const { width } = Dimensions.get('window');

const RED = '#E5252B';
const RED_SOFT = '#FDECEC';
const DOT_PALETTE = ['#E5252B', '#2C7BE5', '#34A853', '#F5B400', '#9C27B0', '#00897B'];

// Resolve a station name to its graph id, tolerant of legacy/format drift in
// saved favourites & recent searches (e.g. "Dwarka Sec 21" vs the canonical
// "Dwarka Sector - 21"). Without this, a stale name yields an undefined id and
// the route finder silently returns no results.
const normalizeStationName = name =>
  String(name).toLowerCase().replace(/sector/g, 'sec').replace(/[^a-z0-9]/g, '');
const normalizedStationIndex = Object.keys(stationsInverted).reduce((acc, name) => {
  acc[normalizeStationName(name)] = stationsInverted[name];
  return acc;
}, {});
const resolveStationId = name =>
  stationsInverted[name] ?? normalizedStationIndex[normalizeStationName(name)];

const SearchRoutesScreen = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [allStations] = useState(metroStation);

  const { registerRef } = useTutorial();
  const fromStationRef = useRef(null);
  const toStationRef = useRef(null);
  const searchButtonRef = useRef(null);

  useEffect(() => {
    registerRef('fromStation', fromStationRef);
    registerRef('toStation', toStationRef);
    registerRef('searchButton', searchButtonRef);
  }, []);
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const {
    setActiveTab,
    setSelectedRoute,
    setRoutesFound,
    routeSelectionOpened,
    setRouteSelectionOpened,
    recentSearches = [],
    setRecentSearches,
    favourites = [],
    setFavourites,
    recentStations = [],
    setRecentStations,
    favouriteStations = [],
    setFavouriteStations,
  } = useContext(TabContext);

  // Modal visibility states
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [showFavModal, setShowFavModal] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);

  // Search states
  const [fromSearchQuery, setFromSearchQuery] = useState('');
  const [toSearchQuery, setToSearchQuery] = useState('');

  const scrollRef = useRef(null);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetEmoji = hour < 12 ? '👋' : hour < 17 ? '☀️' : '🌙';

  const openFromModal = () => {
    setFromSearchQuery('');
    setShowFromModal(true);
  };

  const openToModal = () => {
    setToSearchQuery('');
    setShowToModal(true);
  };

  const recordRecentStation = station => {
    if (!setRecentStations) return;
    setRecentStations(prev =>
      [station, ...prev.filter(s => s !== station)].slice(0, 8));
  };

  const removeRecentStation = station => {
    if (setRecentStations) setRecentStations(prev => prev.filter(s => s !== station));
  };

  const clearRecentStations = () => {
    if (setRecentStations) setRecentStations([]);
  };

  const toggleFavouriteStation = station => {
    if (!setFavouriteStations) return;
    setFavouriteStations(prev =>
      prev.includes(station) ? prev.filter(s => s !== station) : [station, ...prev]);
  };

  const selectFromStation = station => {
    setFromStation(station);
    recordRecentStation(station);
    setShowFromModal(false);
  };

  const selectToStation = station => {
    setToStation(station);
    recordRecentStation(station);
    setShowToModal(false);
  };

  const swapStations = () => {
    setFromStation(toStation);
    setToStation(fromStation);
  };

  const runSearch = (from, to) => {
    const newSearch = { from, to };
    if (setRecentSearches) {
      setRecentSearches(prev => [
        newSearch,
        ...prev.filter(s => !(s.from === from && s.to === to)),
      ].slice(0, 10));
    }

    const fromStationId = resolveStationId(from);
    const toStationId = resolveStationId(to);

    const routes2 = findAllRoutes2(
      graphWithIds,
      fromStationId,
      toStationId,
      colorLinesWithIds,
      50,
    );
    setRoutesFound(routes2 || []);
    setRouteSelectionOpened(true);
  };

  const handleSearch = () => {
    if (!fromStation) {
      Alert.alert('Missing Information', 'Please select a "From" station.');
      return;
    }
    if (!toStation) {
      Alert.alert('Missing Information', 'Please select a "To" station.');
      return;
    }
    if (fromStation === toStation) {
      Alert.alert(
        'Invalid Selection',
        '"From" and "To" stations cannot be the same.',
      );
      return;
    }
    runSearch(fromStation, toStation);
  };

  const handleRecentSearch = (search) => {
    setFromStation(search.from);
    setToStation(search.to);
    runSearch(search.from, search.to);
  };

  const isFavourite = (search) =>
    favourites.some(f => f.from === search.from && f.to === search.to);

  const toggleFavourite = (search) => {
    if (!setFavourites) return;
    if (isFavourite(search)) {
      setFavourites(prev =>
        prev.filter(f => !(f.from === search.from && f.to === search.to)));
    } else {
      setFavourites(prev => [{ from: search.from, to: search.to }, ...prev]);
    }
  };

  const renderRecentItem = (search, index) => (
    <TouchableOpacity
      key={`${search.from}-${search.to}-${index}`}
      style={styles.recentItem}
      activeOpacity={0.7}
      onPress={() => handleRecentSearch(search)}
      onLongPress={() => toggleFavourite(search)}>
      <View style={styles.timeline}>
        <View style={[styles.timelineDot, { backgroundColor: DOT_PALETTE[(index * 2) % DOT_PALETTE.length] }]} />
        <View style={styles.timelineLine} />
        <View style={[styles.timelineDot, { backgroundColor: DOT_PALETTE[(index * 2 + 1) % DOT_PALETTE.length] }]} />
      </View>
      <View style={styles.recentTextWrap}>
        <Text style={styles.recentFrom} numberOfLines={1}>{search.from}</Text>
        <Text style={styles.recentTo} numberOfLines={1}>{`→ ${search.to}`}</Text>
      </View>
      <View style={styles.recentClockCircle}>
        <Ionicons
          name={isFavourite(search) ? 'heart' : 'time-outline'}
          size={18}
          color={RED}
        />
      </View>
    </TouchableOpacity>
  );

  const quickActions = [
    { icon: 'time-outline', label: 'Recent\nSearches', onPress: () => scrollRef.current?.scrollToEnd({ animated: true }) },
    { icon: 'heart', label: 'Favourite\nRoutes', onPress: () => setShowFavModal(true) },
    { icon: 'map', label: 'Metro\nMap', onPress: () => setActiveTab('route') },
  ];

  return (
    <LinearGradient
      colors={['#FFF5F5', '#FFFFFF', '#FDF0F0']}
      style={styles.gradientContainer}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
    >
      <View style={[styles.safeArea, {paddingTop: insets?.top ?? 0}]}>
        <ScrollView
          ref={scrollRef}
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerArt} pointerEvents="none">
              <View style={styles.headerGlow} />
              <Image
                source={require('../assets/Header.png')}
                style={styles.headerImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.greeting}>{`${greeting} ${greetEmoji}`}</Text>
              <Text style={styles.title}>Find Train</Text>
              <Text style={[styles.title, styles.titleRed]}>Routes</Text>
              <Text style={styles.subtitle}>Delhi Metro Route Planner</Text>
            </View>
          </View>

          {/* Search Card */}
          <View style={styles.searchCard}>
            <TouchableOpacity
              ref={fromStationRef}
              style={styles.stationRow}
              activeOpacity={0.7}
              onPress={openFromModal}>
              <View style={styles.iconBox}>
                <Ionicons name="radio-button-on" size={22} color={RED} />
              </View>
              <View style={styles.stationTextWrap}>
                <Text style={styles.stationLabel}>From Station</Text>
                <Text
                  numberOfLines={1}
                  style={[styles.stationValue, !fromStation && styles.stationPlaceholder]}>
                  {fromStation || 'Select From Station'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dividerWrap}>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.swapButton} activeOpacity={0.8} onPress={swapStations}>
                <Ionicons name="swap-vertical" size={22} color={RED} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              ref={toStationRef}
              style={styles.stationRow}
              activeOpacity={0.7}
              onPress={openToModal}>
              <View style={styles.iconBox}>
                <Ionicons name="location" size={22} color={RED} />
              </View>
              <View style={styles.stationTextWrap}>
                <Text style={styles.stationLabel}>To Station</Text>
                <Text
                  numberOfLines={1}
                  style={[styles.stationValue, !toStation && styles.stationPlaceholder]}>
                  {toStation || 'Select To Station'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              ref={searchButtonRef}
              style={styles.searchButton}
              activeOpacity={0.85}
              onPress={handleSearch}>
              <Ionicons name="search" size={20} color="#fff" />
              <Text style={styles.searchButtonText}>Search Routes</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickCard}>
            {quickActions.map((action, i) => (
              <React.Fragment key={action.label}>
                <TouchableOpacity style={styles.quickItem} activeOpacity={0.7} onPress={action.onPress}>
                  <View style={styles.quickCircle}>
                    <Ionicons name={action.icon} size={22} color={RED} />
                  </View>
                  <Text style={styles.quickLabel}>{action.label}</Text>
                </TouchableOpacity>
                {i < quickActions.length - 1 && <View style={styles.quickSeparator} />}
              </React.Fragment>
            ))}
          </View>

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <View style={styles.recentCard}>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent Searches</Text>
                <TouchableOpacity style={styles.viewAll} onPress={() => setShowAllRecent(true)}>
                  <Text style={styles.viewAllText}>View All</Text>
                  <Ionicons name="chevron-forward" size={16} color={RED} />
                </TouchableOpacity>
              </View>
              {recentSearches.slice(0, 3).map((s, i) => renderRecentItem(s, i))}
            </View>
          )}
        </ScrollView>

        {/* FROM Station Picker */}
        <StationPicker
          visible={showFromModal}
          onClose={() => setShowFromModal(false)}
          title="Select From Station"
          query={fromSearchQuery}
          onChangeQuery={setFromSearchQuery}
          allStations={allStations}
          recentStations={recentStations}
          favouriteStations={favouriteStations}
          onSelect={selectFromStation}
          onClearRecents={clearRecentStations}
          onRemoveRecent={removeRecentStation}
          onToggleFavourite={toggleFavouriteStation}
        />

        {/* TO Station Picker */}
        <StationPicker
          visible={showToModal}
          onClose={() => setShowToModal(false)}
          title="Select To Station"
          query={toSearchQuery}
          onChangeQuery={setToSearchQuery}
          allStations={allStations}
          recentStations={recentStations}
          favouriteStations={favouriteStations}
          onSelect={selectToStation}
          onClearRecents={clearRecentStations}
          onRemoveRecent={removeRecentStation}
          onToggleFavourite={toggleFavouriteStation}
        />

        {/* Favourites Modal */}
        <Modal visible={showFavModal} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={[styles.modalBlur, { backgroundColor: 'rgba(255,255,255,0.98)' }]} />
              <Text style={[styles.modalTitle, { color: '#1A1A1A' }]}>Favourite Routes</Text>
              {favourites.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="heart-outline" size={48} color="#D9D9D9" />
                  <Text style={styles.emptyTitle}>No favourites yet</Text>
                  <Text style={styles.emptySub}>Long-press any recent search to save it here.</Text>
                </View>
              ) : (
                <ScrollView style={styles.stationsList}>
                  {favourites.map((s, i) => (
                    <TouchableOpacity
                      key={`fav-${i}`}
                      style={styles.favRow}
                      onPress={() => { setShowFavModal(false); handleRecentSearch(s); }}>
                      <Ionicons name="heart" size={18} color={RED} />
                      <Text style={styles.favText}>{`${s.from}  →  ${s.to}`}</Text>
                      <TouchableOpacity onPress={() => toggleFavourite(s)}>
                        <Ionicons name="close" size={20} color="#999" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowFavModal(false)}>
                <Text style={[styles.modalCancelButtonText, { color: RED }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* View All Recent Modal */}
        <Modal visible={showAllRecent} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={[styles.modalBlur, { backgroundColor: 'rgba(255,255,255,0.98)' }]} />
              <Text style={[styles.modalTitle, { color: '#1A1A1A' }]}>Recent Searches</Text>
              <ScrollView style={styles.stationsList} contentContainerStyle={{ paddingHorizontal: 16 }}>
                {recentSearches.map((s, i) => (
                  <View key={`all-${i}`} onTouchEnd={() => setShowAllRecent(false)}>
                    {renderRecentItem(s, i)}
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowAllRecent(false)}>
                <Text style={[styles.modalCancelButtonText, { color: RED }]}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Route Selection Modal. statusBarTranslucent so the modal window
            extends under the status bar — otherwise it sits below it AND
            RouteSelection adds insets.top, double-padding the header. */}
        <Modal
          visible={routeSelectionOpened}
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}>
          <RouteSelection onClose={() => setRouteSelectionOpened(false)} />
        </Modal>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },

  // Header
  header: {
    position: 'relative',
    paddingTop: 16,
    marginBottom: 4,
    minHeight: 210,
  },
  headerArt: {
    position: 'absolute',
    top: 4,
    right: -28,
    width: width * 0.7,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerGlow: {
    position: 'absolute',
    top: 8,
    right: 0,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(229,37,43,0.05)',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerTextWrap: { paddingTop: 25 },
  greeting: { fontSize: 15, fontWeight: '500', color: '#8A8A8A', marginBottom: 4 },
  title: { fontSize: 40, fontWeight: '800', color: '#1A1A1A', lineHeight: 46, letterSpacing: -0.5 },
  titleRed: { color: RED },
  subtitle: { fontSize: 14, color: '#9A9A9A', marginTop: 10, fontWeight: '500' },
  // Search card
  searchCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  stationRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingRight: 56 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: RED_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stationTextWrap: { flex: 1 },
  stationLabel: { fontSize: 13, color: '#9A9A9A', fontWeight: '500', marginBottom: 3 },
  stationValue: { fontSize: 17, color: '#1A1A1A', fontWeight: '700' },
  stationPlaceholder: { color: '#1A1A1A' },
  dividerWrap: { justifyContent: 'center', marginVertical: 6 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 62 },
  swapButton: {
    position: 'absolute',
    right: 8,
    top: -21,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: RED,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: RED,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  searchButtonText: { color: '#fff', fontSize: 17, fontWeight: '700', marginLeft: 10 },

  // Quick actions
  quickCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  quickItem: { flex: 1, alignItems: 'center' },
  quickCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: RED_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: { fontSize: 12, color: '#333', fontWeight: '600', textAlign: 'center', lineHeight: 15 },
  quickSeparator: { width: 1, height: 40, backgroundColor: '#F0F0F0' },

  // Recent
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recentTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  viewAll: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { color: RED, fontSize: 14, fontWeight: '600', marginRight: 2 },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F2',
    borderRadius: 16,
    padding: 14,
    marginTop: 10,
  },
  timeline: { alignItems: 'center', marginRight: 14, width: 14 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { width: 2, height: 14, backgroundColor: '#E0E0E0', marginVertical: 2 },
  recentTextWrap: { flex: 1 },
  recentFrom: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  recentTo: { fontSize: 14, color: '#9A9A9A', marginTop: 4, fontWeight: '500' },
  recentClockCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: RED_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Modals
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.18)' },
  modalContent: {
    borderRadius: 24,
    width: '90%',
    paddingTop: 24,
    paddingBottom: 12,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  modalBlur: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 16, zIndex: 1 },
  searchContainer: { paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, zIndex: 1 },
  searchInput: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    backgroundColor: 'rgba(0,0,0,0.04)',
    color: '#1A1A1A',
  },
  stationsList: { maxHeight: 400, marginTop: 4, zIndex: 1 },
  stationItem: { paddingVertical: 16, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  stationItemText: { fontSize: 18 },
  modalCancelButton: {
    marginTop: 16,
    marginBottom: 16,
    alignSelf: 'center',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 36,
    backgroundColor: RED_SOFT,
    zIndex: 1,
  },
  modalCancelButtonText: { fontSize: 18, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 30, zIndex: 1 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#444', marginTop: 12 },
  emptySub: { fontSize: 14, color: '#9A9A9A', textAlign: 'center', marginTop: 6 },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  favText: { flex: 1, fontSize: 16, color: '#1A1A1A', fontWeight: '600', marginLeft: 12 },
});

export default SearchRoutesScreen;
