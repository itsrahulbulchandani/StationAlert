import React, {useState} from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  Platform,
  TextInput,
  Modal,
  FlatList,
  Button,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Geolocation from '@react-native-community/geolocation';
import {metroStation} from './metroRoutes';

const AlertScreen = () => {
  const [allStations] = useState(metroStation);
  const [fromStation, setFromStation] = useState('');
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [showFromModal, setShowFromModal] = useState(false);
  const [fromSearchQuery, setFromSearchQuery] = useState('');

  const requestLocationPermission = async () => {
    //IOS
    try {
      if (Platform.OS === 'ios') {
        try {
          if (Platform.OS === 'ios') {
            Geolocation.requestAuthorization();
            Geolocation.getCurrentPosition(
              position => {
                setCurrentCoordinates(position);
              },
              error => {
                console.log('map error: ', error);
                console.log(error.code, error.message);
              },
              {enableHighAccuracy: false, timeout: 15000, maximumAge: 1},
            );
          }
        } catch (e) {
          console.log(e);
        }
        return;
      }

      // Android
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getLocation();
      } else {
        setError('Location permission denied');
      }
    } catch (err) {
      setError('Error requesting location permission');
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation(position.coords);
        setError(null);
      },
      error => {
        setError('Error getting location: ' + error.message);
        setLocation(null);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  console.log('currentCoordinates: ', currentCoordinates);

  const renderStationItem = (item, onSelect) => {
    return (
      <TouchableOpacity
        style={styles.stationItem}
        onPress={() => onSelect(item)}>
        <Text style={styles.stationItemText}>{item}</Text>
      </TouchableOpacity>
    );
  };

  const selectFromStation = station => {
    setFromStation(station);
    setShowFromModal(false);
  };

  const openFromModal = () => {
    setFromSearchQuery('');
    // setFilteredFromStations(allStations);
    setShowFromModal(true);
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.mapContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Destination:</Text>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={openFromModal}>
            <Text
              style={[
                styles.selectionButtonText,
                !fromStation && styles.placeholderText,
              ]}>
              {fromStation || 'Select Station'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={requestLocationPermission}>
          <Text style={styles.buttonText}>Get Current Location</Text>
          {currentCoordinates && (
            <>
              <Text style={styles.coordinates}>
                Latitude: {currentCoordinates.coords.latitude.toFixed(6)}
              </Text>
              <Text style={styles.coordinates}>
                Longitude: {currentCoordinates.coords.longitude.toFixed(6)}
              </Text>
            </>
          )}
        </TouchableOpacity>
        {location && (
          <View style={styles.locationContainer}>
            <Text style={styles.locationText}>Your current location:</Text>
            <Text style={styles.coordinates}>
              Latitude: {location.latitude.toFixed(6)}
            </Text>
            <Text style={styles.coordinates}>
              Longitude: {location.longitude.toFixed(6)}
            </Text>
          </View>
        )}

        {error && <Text style={styles.errorText}>{error}</Text>}
        <Modal visible={showFromModal} animationType="slide" transparent={true}>
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
                  autoFocus={true}
                  clearButtonMode="while-editing"
                />
              </View>

              {/* Stations List */}
              <FlatList
                data={allStations}
                keyExtractor={item => item}
                renderItem={({item}) =>
                  renderStationItem(item, selectFromStation)
                }
                style={styles.stationsList}
              />

              <View style={styles.modalButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setShowFromModal(false)}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  searchContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stationsList: {
    maxHeight: 400,
  },
  stationItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  stationItemText: {
    fontSize: 16,
  },
  modalButtons: {
    padding: 15,
  },
  placeholderText: {
    fontSize: 16,
    color: '#444',
  },
  label: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 8,
    color: '#555',
    fontWeight: '500',
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    color: '#444',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
  },
  inputContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#CC0000',
    padding: 16,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
  },
  tabText: {
    padding: 16,
    fontSize: 16,
    color: '#666666',
  },
  activeTab: {
    color: '#CC0000',
    borderBottomWidth: 2,
    borderBottomColor: '#CC0000',
  },
  button: {
    backgroundColor: '#CC0000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  locationText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  coordinates: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  errorText: {
    color: '#CC0000',
    marginTop: 20,
    textAlign: 'center',
  },
  selectionButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
},
});

export default AlertScreen;
