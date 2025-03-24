import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const AlertScreen = () => {
const [currentCoordinates, setCurrentCoordinates] = useState(null);
const [location, setLocation] = useState(null);
const [error, setError] = useState(null);

const requestLocationPermission = async () => {
    //IOS
    try{
    if (Platform.OS === 'ios') {
      try{
        if (Platform.OS === 'ios') {
          
          Geolocation.requestAuthorization();
          Geolocation.getCurrentPosition(
            (position) => {
                console.log(position);
                setCurrentCoordinates(position);
            },
            (error) => {
              console.log("map error: ",error);
                console.log(error.code, error.message);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 1 }
        );
        }
    }
    catch(e){
      console.log(e)
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

  const renderRoute = (routeName, route) => {
    const isSelected = selectedRoute === routeName;
    const opacity = isSelected ? 1 : 0.5;

    return (
      <View key={routeName} style={styles.routeContainer}>
        <TouchableOpacity
          onPress={() => setSelectedRoute(routeName)}
          style={styles.routeTouchable}>
          {/* Line connecting stations */}
          <View
            style={[
              styles.routeLine,
              {
                backgroundColor: route.color,
                opacity: opacity,
              },
            ]}
          />
          {/* Stations */}
          {route.stations.map((station, index) => {
            const isInterchange = Object.values(metroRoutes).some(
              (r) => r !== route && r.stations.includes(station),
            );
            const leftPosition = `${(index / (route.stations.length - 1)) * 100}%`;
            
            return (
              <View
                key={station}
                style={[
                  styles.stationContainer,
                  {
                    left: leftPosition,
                  },
                ]}>
                <View
                  style={[
                    styles.station,
                    {
                      width: isInterchange ? 20 : 14,
                      height: isInterchange ? 20 : 14,
                      borderWidth: isInterchange ? 4 : 2,
                      borderColor: route.color,
                      backgroundColor: 'white',
                    },
                  ]}
                />
                <Text style={styles.stationName}>{station}</Text>
              </View>
            );
          })}
        </TouchableOpacity>
      </View>
    );
  };

  return (
<SafeAreaView style={styles.container}>
      <ScrollView style={styles.mapContainer}>
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  });

export default AlertScreen; 