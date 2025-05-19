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
  LayoutAnimation,
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

const { width } = Dimensions.get('window');

const SearchRoutesScreen = () => {
  const { theme } = useTheme();
  const [allStations] = useState(metroStation);
  const [fromStation, setFromStation] = useState('');
  const [toStation, setToStation] = useState('');
  const [routeSelectionOpened, setRouteSelectionOpened] = useState(false);

  // Modal visibility states
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);

  // Search states
  const [fromSearchQuery, setFromSearchQuery] = useState('');
  const [toSearchQuery, setToSearchQuery] = useState('');
  const [filteredFromStations, setFilteredFromStations] = useState(metroStation);
  const [filteredToStations, setFilteredToStations] = useState(metroStation);
  const {setActiveTab, setSelectedRoute, setRoutesFound} = useContext(TabContext);

  const [showSquareAd, setShowSquareAd] = useState(false);
  const contentRef = useRef(null);

  // Filter stations based on search query
  useEffect(() => {
    if (showFromModal) {
      const filtered = allStations.filter(station =>
        station.toLowerCase().includes(fromSearchQuery.toLowerCase()),
      );
      setFilteredFromStations(filtered);
    }
  }, [fromSearchQuery, showFromModal, allStations]);

  useEffect(() => {
    if (showToModal) {
      const filtered = allStations.filter(station =>
        station.toLowerCase().includes(toSearchQuery.toLowerCase()),
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

  // Render station item for the FlatList
  const renderStationItem = (item, onSelect) => {
    return (
      <TouchableOpacity
        style={[styles.stationItem, { backgroundColor: theme.cardBackground }]}
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.softBackground }]}>
      <StatusBar barStyle={theme.statusBar.style} />
      <View style={[styles.container, { backgroundColor: theme.softBackground }]}>
        <View ref={contentRef}>
          <Text style={[styles.title, { color: theme.headerTextColor }]}>Find Train Routes</Text>

          {/* From Station Button */}
          <Text style={[styles.label, { color: theme.labelColor }]}>From Station</Text>
          <TouchableOpacity
            style={[styles.selectionButton, { 
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderColor 
            }]}
            onPress={openFromModal}>
            <Text
              style={[
                styles.selectionButtonText,
                { color: theme.headerTextColor },
                !fromStation && { color: theme.tabBar.inactiveColor },
              ]}>
              {fromStation || 'Select From Station'}
            </Text>
          </TouchableOpacity>

          {/* To Station Button */}
          <Text style={[styles.label, { color: theme.labelColor }]}>To Station</Text>
          <TouchableOpacity
            style={[styles.selectionButton, { 
              backgroundColor: theme.cardBackground,
              borderColor: theme.borderColor 
            }]}
            onPress={openToModal}>
            <Text
              style={[
                styles.selectionButtonText,
                { color: theme.headerTextColor },
                !toStation && { color: theme.tabBar.inactiveColor },
              ]}>
              {toStation || 'Select To Station'}
            </Text>
          </TouchableOpacity>

          {/* Search Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: theme.accentColor },
              (!fromStation || !toStation) && { backgroundColor: theme.tabBar.inactiveColor }
            ]}
            onPress={handleSearch}
            disabled={!fromStation || !toStation}
          >
            <Text style={styles.primaryButtonText}>Search Routes</Text>
          </TouchableOpacity>
        </View>

        {/* Show square ad if space available, otherwise show banner ad */}
        {showSquareAd ? (
          <View style={styles.squareAdContainer}>
            <SquareAd />
          </View>
        ) : (
          <AdBanner />
        )}

        {/* FROM Modal */}
        <Modal
          visible={showFromModal}
          animationType="slide"
          transparent={true}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { 
              backgroundColor: theme.cardBackground 
            }]}>
              <Text style={[styles.modalTitle, { color: theme.headerTextColor }]}>
                Select From Station
              </Text>
              <View style={[styles.searchContainer, { borderBottomColor: theme.borderColor }]}>
                <TextInput
                  style={[styles.searchInput, { 
                    backgroundColor: theme.softBackground,
                    borderColor: theme.borderColor,
                    color: theme.text 
                  }]}
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
                style={[styles.modalCancelButton, { 
                  backgroundColor: theme.softBackground,
                  borderColor: theme.borderColor 
                }]} 
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
            <View style={[styles.modalContent, { 
              backgroundColor: theme.cardBackground 
            }]}>
              <Text style={[styles.modalTitle, { color: theme.headerTextColor }]}>
                Select To Station
              </Text>
              <View style={[styles.searchContainer, { borderBottomColor: theme.borderColor }]}>
                <TextInput
                  style={[styles.searchInput, { 
                    backgroundColor: theme.softBackground,
                    borderColor: theme.borderColor,
                    color: theme.text 
                  }]}
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
                style={[styles.modalCancelButton, { 
                  backgroundColor: theme.softBackground,
                  borderColor: theme.borderColor 
                }]} 
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
          transparent={false}
        >
          <RouteSelection onClose={() => setRouteSelectionOpened(false)} />
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 8,
    textAlign: 'left',
  },
  selectionButton: {
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  selectionButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
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
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  searchInput: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    borderWidth: 1,
  },
  stationsList: {
    maxHeight: 400,
    marginTop: 4,
  },
  stationItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
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
    borderWidth: 1,
  },
  modalCancelButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  squareAdContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default SearchRoutesScreen;
