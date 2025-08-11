import React, {useState, useEffect, useContext, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  StatusBar,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Dimensions,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import {metroStation} from './metroRoutes';
import {colorLines, colorLinesWithIds, graph, graphWithIds} from './graph';
import {TabContext} from '../App';
import {useTheme} from '../src/context/ThemeContext';
import {findAllRoutes2} from '../utilities/helper';
import RouteSelection from './RouteSelection';
import stationsInverted from './stations_inverted';
import { SquareAd } from '../src/components/SquareAd';
import { AdBanner } from '../src/components/AdBanner';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const SearchRoutesScreen = () => {
  const { theme } = useTheme();
  const [allStations] = useState(metroStation);
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const { setActiveTab, setSelectedRoute, setRoutesFound, routeSelectionOpened, setRouteSelectionOpened } = useContext(TabContext);

  // Modal visibility states
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);

  // Search states
  const [fromSearchQuery, setFromSearchQuery] = useState('');
  const [toSearchQuery, setToSearchQuery] = useState('');
  const [filteredFromStations, setFilteredFromStations] = useState(metroStation);
  const [filteredToStations, setFilteredToStations] = useState(metroStation);

  const [showSquareAd, setShowSquareAd] = useState(false);
  // const [showShortcuts, setShowShortcuts] = useState(false);
  const contentRef = useRef(null);

  // Add recent searches state
  const [recentSearches, setRecentSearches] = useState([
    { from: 'Rajiv Chowk', to: 'Botanical Garden' },
    { from: 'Noida Sector 62', to: 'Rajiv Chowk' },
    { from: 'Kashmere Gate', to: 'Huda City Centre' },
  ]);

  // Filter stations based on search query
  useEffect(() => {
    if (showFromModal) {
      const filtered = allStations.filter(station =>
        station.toLowerCase().includes(fromSearchQuery.toLowerCase().trim()),
      );
      setFilteredFromStations(filtered);
    }
  }, [fromSearchQuery, showFromModal, allStations]);

  useEffect(() => {
    if (showToModal) {
      const filtered = allStations.filter(station =>
        station.toLowerCase().includes(toSearchQuery.toLowerCase().trim()),
      );
      setFilteredToStations(filtered);
    }
  }, [toSearchQuery, showToModal, allStations]);

  // Reset search when modal opens
  const openFromModal = () => {
    setFromSearchQuery('');
    setFilteredFromStations(allStations);
    setShowFromModal(true);
  };

  const openToModal = () => {
    setToSearchQuery('');
    setFilteredToStations(allStations);
    setShowToModal(true);
  };

  const selectFromStation = station => {
    setFromStation(station);
    setShowFromModal(false);
  };

  const selectToStation = station => {
    setToStation(station);
    setShowToModal(false);
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

    // Add current search to recent searches
    const newSearch = { from: fromStation, to: toStation };
    const updatedSearches = [newSearch, ...recentSearches.filter(
      search => !(search.from === fromStation && search.to === toStation)
    ).slice(0, 4)];
    setRecentSearches(updatedSearches);

    const fromStationId = stationsInverted[fromStation];
    const toStationId = stationsInverted[toStation];

    const routes2 = findAllRoutes2(
      graphWithIds,
      fromStationId,
      toStationId,
      colorLinesWithIds,
      50,
    );
    console.log(routes2)
    setRoutesFound(routes2||[])
    setRouteSelectionOpened(true);
  };

  // Add function to handle selecting a recent search
  const handleRecentSearch = (search) => {
    setFromStation(search.from);
    setToStation(search.to);
    
    // Trigger search with a slight delay to allow UI to update
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  // Render station item for the FlatList
  const renderStationItem = (item, onSelect) => {
    return (
      <TouchableOpacity
        style={[styles.stationItem, { backgroundColor: 'transparent' }]}
        onPress={() => onSelect(item)}>
        <Text style={[styles.stationItemText, { color: theme.text }]}>{item}</Text>
      </TouchableOpacity>
    );
  };

  // Check if there's space for the square ad
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.measure((x, y, width, height, pageX, pageY) => {
        const screenHeight = Dimensions.get('window').height;
        const availableSpace = screenHeight - (pageY + height);
        // MEDIUM_RECTANGLE ad is 300x250, add some padding
        setShowSquareAd(availableSpace >= 270);
      });
    }
  }, [fromStation, toStation]); // Recalculate when stations change

  return (
    <LinearGradient
      colors={['#E0E0E0', '#ffffff', '#E0E0E0']}
      style={styles.gradientContainer}
      start={{x: 0, y: 0}}
      end={{x: 0, y: 1}}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <ScrollView style={styles.container}>
          <View style={styles.titleContainer}>
          <Text style={styles.title}>{`Find Train\nRoutes`}</Text>
          </View>
          <View ref={contentRef} style={styles.contentContainer}>
            
            
            <View style={styles.routeInputContainer}>
              {/* From Station Button */}
              <Text style={styles.label}>From Station</Text>
              <TouchableOpacity
                style={styles.selectionButton}
                onPress={openFromModal}>
                <View style={styles.selectionButtonContent}>
                  <View style={styles.stationDot} />
                  <Text
                    style={[
                      styles.selectionButtonText,
                      !fromStation && { color: 'rgba(255,255,255,0.6)' },
                    ]}>
                    {fromStation || 'Select From Station'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* To Station Button */}
              <Text style={styles.label}>To Station</Text>
              <TouchableOpacity
                style={[styles.selectionButton, { marginTop: 10 }]}
                onPress={openToModal}>
                <View style={styles.selectionButtonContent}>
                  <View style={[styles.stationDot, { backgroundColor: '#fff' }]} />
                  <Text
                    style={[
                      styles.selectionButtonText,
                      !toStation && { color: 'rgba(255,255,255,0.6)' },
                    ]}>
                    {toStation || 'Select To Station'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Search Button */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!fromStation || !toStation) && { backgroundColor: 'rgba(255,255,255,0.3)' }
                ]}
                onPress={handleSearch}
                disabled={!fromStation || !toStation}
              >
                <Text style={styles.primaryButtonText}>Search Routes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Searches Section */}
          <View style={styles.recentSearchesContainer}>
            <Text style={styles.recentSearchesTitle}>Recent Searches</Text>
            {recentSearches.map((search, index) => (
              <TouchableOpacity
                key={index}
                style={styles.recentSearchItem}
                onPress={() => handleRecentSearch(search)}
              >
                <View style={styles.recentSearchContent}>
                  <View style={styles.recentSearchStations}>
                    <Text style={styles.recentSearchText}>{search.from}</Text>
                    <Icon name="arrow-forward" size={16} color="#000000" style={styles.arrowIcon} />
                    <Text style={styles.recentSearchText}>{search.to}</Text>
                  </View>
                  <Icon name="time-outline" size={18} color="#666666" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Show square ad if space available, otherwise show banner ad */}
          {showSquareAd ? (
            <View style={styles.squareAdContainer}>
              <SquareAd />
            </View>
          ) : (
            <AdBanner />
          )}
        </ScrollView>

        {/* FROM Modal */}
        <Modal
          visible={showFromModal}
          animationType="slide"
          transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {Platform.OS === 'ios' ? (
                <BlurView
                  style={styles.modalBlur}
                  blurType="light"
                  blurAmount={25}
                  reducedTransparencyFallbackColor="white"
                />
              ) : (
                <View style={[styles.modalBlur, { backgroundColor: 'rgba(255,255,255,0.95)' }]} />
              )}
              <Text style={[styles.modalTitle, { color: theme.headerTextColor }]}>
                Select From Station
              </Text>
              <View style={[styles.searchContainer, { borderBottomColor: 'rgba(0,0,0,0.1)' }]}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search stations..."
                  value={fromSearchQuery}
                  onChangeText={setFromSearchQuery}
                  autoFocus={false}
                  clearButtonMode="while-editing"
                  placeholderTextColor={theme.tabBar.inactiveColor}
                  fontSize={18}
                />
              </View>
              <FlatList
                data={filteredFromStations}
                keyExtractor={item => item}
                renderItem={({item}) =>
                  renderStationItem(item, selectFromStation)
                }
                style={styles.stationsList}
              />
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowFromModal(false)}>
                <Text style={[styles.modalCancelButtonText, { color: theme.accentColor }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* TO Modal */}
        <Modal visible={showToModal} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {Platform.OS === 'ios' ? (
                <BlurView
                  style={styles.modalBlur}
                  blurType="light"
                  blurAmount={25}
                  reducedTransparencyFallbackColor="white"
                />
              ) : (
                <View style={[styles.modalBlur, { backgroundColor: 'rgba(255,255,255,0.95)' }]} />
              )}
              <Text style={[styles.modalTitle, { color: theme.headerTextColor }]}>
                Select To Station
              </Text>
              <View style={[styles.searchContainer, { borderBottomColor: 'rgba(0,0,0,0.1)' }]}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search stations..."
                  value={toSearchQuery}
                  onChangeText={setToSearchQuery}
                  autoFocus={false}
                  clearButtonMode="while-editing"
                  placeholderTextColor={theme.tabBar.inactiveColor}
                  fontSize={18}
                />
              </View>
              <FlatList
                data={filteredToStations}
                keyExtractor={item => item}
                renderItem={({item}) =>
                  renderStationItem(item, selectToStation)
                }
                style={styles.stationsList}
              />
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => setShowToModal(false)}>
                <Text style={[styles.modalCancelButtonText, { color: theme.accentColor }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Route Selection Modal */}
        <Modal
          visible={routeSelectionOpened}
          animationType="slide"
          transparent={true}
        >
          <RouteSelection onClose={() => setRouteSelectionOpened(false)} />
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10
  },
  titleContainer: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  contentContainer: {
    padding: 10,
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: "#000000",
    borderRadius: 30,
    boxShadow: '0px 0px 20px 1px rgba(36, 6, 24, 0.9)',

  },
  title: {
    fontSize: 56,
    fontWeight: '800',
    marginBottom: 32,
    textAlign: 'left',
    letterSpacing: 0.8,
    lineHeight: 56,
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  routeInputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    textAlign: 'left',
    color: '#fff',
  },
  selectionButton: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 30,
    borderWidth: 0,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  selectionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  selectionButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  primaryButton: {
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
    backgroundColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  modalContent: {
    borderRadius: 24,
    width: '90%',
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 0,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  modalBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    zIndex: 1,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    zIndex: 1,
  },
  searchInput: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
  },
  stationsList: {
    maxHeight: 400,
    marginTop: 4,
    zIndex: 1,
  },
  stationItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  stationItemText: {
    fontSize: 18,
  },
  modalCancelButton: {
    marginTop: 16,
    marginBottom: 16,
    alignSelf: 'center',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(10px)',
    zIndex: 1,
  },
  modalCancelButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  squareAdContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  recentSearchesContainer: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#000000',
  },
  recentSearchItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  recentSearchContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentSearchStations: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recentSearchText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
});

export default SearchRoutesScreen;
