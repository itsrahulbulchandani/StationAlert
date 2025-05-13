import React, {useState, useEffect, useContext} from 'react';
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
} from 'react-native';
import {metroStation} from './metroRoutes';
import {colorLines, colorLinesWithIds, graph, graphWithIds} from './graph';
import {TabContext} from '../App';
import {findAllRoutes2} from '../utilities/helper';
import RouteSelection from './RouteSelection';
import stationsInverted from './stations_inverted';

const { width } = Dimensions.get('window');

const accentColor = '#2EC4B6';
const softBg = '#F3F6F9';
const cardBg = '#fff';
const borderColor = '#E0E4EA';

const SearchRoutesScreen = () => {
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
        style={styles.stationItem}
        onPress={() => onSelect(item)}>
        <Text style={styles.stationItemText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Find Train Routes</Text>

        {/* From Station Button */}
        <Text style={styles.label}>From Station</Text>
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={openFromModal}>
          <Text
            style={[
              styles.selectionButtonText,
              !fromStation && styles.placeholderText,
            ]}>
            {fromStation || 'Select From Station'}
          </Text>
        </TouchableOpacity>

        {/* To Station Button */}
        <Text style={styles.label}>To Station</Text>
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={openToModal}>
          <Text
            style={[
              styles.selectionButtonText,
              !toStation && styles.placeholderText,
            ]}>
            {toStation || 'Select To Station'}
          </Text>
        </TouchableOpacity>

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.primaryButton, (!fromStation || !toStation) && styles.primaryButtonDisabled]}
          onPress={handleSearch}
          disabled={!fromStation || !toStation}
        >
          <Text style={styles.primaryButtonText}>Search Routes</Text>
        </TouchableOpacity>

        {/* FROM Modal with Searchable List */}
        <Modal
          visible={showFromModal}
          animationType="slide"
          transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select From Station</Text>
              {/* Search Input */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search stations..."
                  value={fromSearchQuery}
                  onChangeText={setFromSearchQuery}
                  autoFocus={false}
                  clearButtonMode="while-editing"
                  placeholderTextColor="#B0B4B8"
                />
              </View>
              {/* Stations List */}
              <FlatList
                data={filteredFromStations}
                keyExtractor={item => item}
                renderItem={({item}) =>
                  renderStationItem(item, selectFromStation)
                }
                style={styles.stationsList}
              />
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowFromModal(false)}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* TO Modal with Searchable List */}
        <Modal visible={showToModal} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select To Station</Text>
              {/* Search Input */}
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search stations..."
                  value={toSearchQuery}
                  onChangeText={setToSearchQuery}
                  autoFocus={false}
                  clearButtonMode="while-editing"
                  placeholderTextColor="#B0B4B8"
                />
              </View>
              {/* Stations List */}
              <FlatList
                data={filteredToStations}
                keyExtractor={item => item}
                renderItem={({item}) =>
                  renderStationItem(item, selectToStation)
                }
                style={styles.stationsList}
              />
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowToModal(false)}>
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
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
    backgroundColor: softBg,
  },
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: softBg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222B45',
    marginBottom: 32,
    textAlign: 'left',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7B8794',
    marginBottom: 8,
    marginTop: 8,
    textAlign: 'left',
  },
  selectionButton: {
    backgroundColor: cardBg,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: borderColor,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  selectionButtonText: {
    fontSize: 17,
    color: '#222B45',
    fontWeight: '600',
  },
  placeholderText: {
    color: '#B0B4B8',
    fontWeight: '400',
  },
  primaryButton: {
    backgroundColor: accentColor,
    borderRadius: 22,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 8,
    shadowColor: accentColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryButtonDisabled: {
    backgroundColor: '#B0B4B8',
    shadowColor: '#B0B4B8',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  modalContent: {
    backgroundColor: cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#222B45',
    textAlign: 'center',
    marginBottom: 10,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: borderColor,
  },
  searchInput: {
    height: 44,
    backgroundColor: softBg,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222B45',
    borderWidth: 1,
    borderColor: borderColor,
  },
  stationsList: {
    maxHeight: 400,
    marginTop: 2,
  },
  stationItem: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderColor,
    backgroundColor: cardBg,
  },
  stationItemText: {
    fontSize: 16,
    color: '#222B45',
    fontWeight: '500',
  },
  modalCancelButton: {
    marginTop: 10,
    marginBottom: 10,
    alignSelf: 'center',
    backgroundColor: softBg,
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: borderColor,
  },
  modalCancelButtonText: {
    color: accentColor,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SearchRoutesScreen;
