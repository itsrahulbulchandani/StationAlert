import React, {createContext, useState, useEffect, useRef} from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  AppState,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import Geolocation from '@react-native-community/geolocation';

import AlertScreen from './components/AlertScreen';
import RouteMapScreen from './components/RouteMapScreen';
import MapScreen from './components/MapScreen';
import SearchRouteScreen from './components/SearchRoutes';
import stations from './components/stations';
import SplashScreen from './components/SplashScreen';

export const TabContext = createContext();

// Haversine formula to calculate distance between two points
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the earth in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat)/2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    (1 - Math.cos(dLon))/2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

function App() {
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [routesFound, setRoutesFound] = useState([]);
  const [activeTab, setActiveTab] = useState('search route');
  const [alertActive, setAlertActive] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const watchId = useRef(null);
  const appState = useRef(AppState.currentState);

  // Handle splash screen timeout
  useEffect(() => {
    if (showSplash) {
      // Splash screen will handle its own timeout via onFinish callback
    }
  }, [showSplash]);

  useEffect(() => {
    // iOS notification configuration
    if (Platform.OS === 'ios') {
      try {
        console.log('Initializing iOS notifications...');
        // Configure notification categories for iOS
        PushNotificationIOS.setNotificationCategories([
          {
            id: 'STATION_ALERT',
            actions: [
              {
                id: 'dismiss',
                title: 'Dismiss',
                options: {
                  isAuthenticationRequired: false,
                  isDestructive: true,
                },
              },
            ],
          },
        ]);
        console.log('iOS notification categories configured successfully');
      } catch (error) {
        console.error('Error configuring iOS notifications:', error);
      }
    }
    
    // App state change listener for background/foreground transitions
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        console.log('App has gone to the background!');
        // Ensure location updates continue in background
        if (watchId.current) {
          Geolocation.setRNConfiguration({
            skipPermissionRequests: false,
            authorizationLevel: 'always',
            locationProvider: 'auto',
            enableBackgroundLocationUpdates: true,
            pauseLocationUpdatesAutomatically: false,
          });
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      if (watchId.current) {
        console.log('Cleaning up location interval on unmount:', watchId.current);
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      return true; // iOS permissions are handled in Info.plist
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Station Alert needs access to your location to provide alerts.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('Location permission result:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.log('Location permission error:', err);
      return false;
    }
  };

  const checkNotificationPermissions = async () => {
    if (Platform.OS !== 'ios') return true;
    
    return new Promise((resolve) => {
      PushNotificationIOS.checkPermissions((permissions) => {
        console.log('Current notification permissions:', permissions);
        
        if (!permissions.alert && !permissions.badge && !permissions.sound) {
          PushNotificationIOS.requestPermissions({
            alert: true,
            badge: true,
            sound: true,
          }, (granted) => {
            console.log('Requested notification permissions:', granted);
            resolve(granted.alert || granted.badge || granted.sound);
          });
        } else {
          resolve(true);
        }
      });
    });
  };

  const handleSetAlert = async (route) => {
    console.log('handleSetAlert called with route:', route);
    
    if (!route || !route.path || route.path.length < 2) {
      console.log('Invalid route:', route);
      Alert.alert('Alert', 'Route is too short for alerts.');
      return;
    }

    // Clear any existing watch
    if (watchId.current) {
      console.log('Clearing existing watch:', watchId.current);
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    const hasLocationPermission = await requestLocationPermission();
    if (!hasLocationPermission) {
      Alert.alert('Permission Required', 'Location permission is required for alerts.');
      return;
    }

    if (Platform.OS === 'ios') {
      const hasNotificationPermission = await checkNotificationPermissions();
      if (!hasNotificationPermission) {
        Alert.alert('Permission Required', 'Notification permission is required for alerts.');
        return;
      }
    }

    // Configure for background location updates
    if (Platform.OS === 'ios') {
      console.log('Configuring background location updates...');
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'always',
        locationProvider: 'auto',
        enableBackgroundLocationUpdates: true,
        pauseLocationUpdatesAutomatically: false,
      });
      console.log('Background location configuration complete');
    }

    console.log('Setting up location tracking for route:', route.path);
    setAlertActive(true);
    let currentIdx = 0;
    let lastUpdateTime = Date.now();

    // Start at the first station, alert for the next
    const checkNextStation = (position) => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTime;
      lastUpdateTime = now;

      // Log app state and location update details
      const appState = AppState.currentState;
      console.log('Location update received:', {
        appState,
        timeSinceLastUpdate,
        position: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString()
        }
      });
      
      if (!route.path || currentIdx >= route.path.length - 1) {
        console.log('Alert cleared - End of route');
        if (watchId.current) {
          Geolocation.clearWatch(watchId.current);
          watchId.current = null;
        }
        setAlertActive(false);
        return;
      }

      const nextStationName = route.path[currentIdx + 1];
      const nextStation = stations[nextStationName];
      
      if (!nextStation) {
        console.log('Next station not found:', nextStationName);
        PushNotificationIOS.presentLocalNotification({
          alertBody: `Next station not found:${nextStationName}`,
          alertTitle: "Next Station Alert",
          soundName: 'default',
          category: 'STATION_ALERT',
          userInfo: {
            station: nextStationName,
            timestamp: new Date().toISOString(),
            appState: AppState.currentState
          },
          applicationIconBadgeNumber: 1,
        });
        return;
      }

      const {latitude: stationLat, longitude: stationLon} = nextStation.coords;
      const {latitude: userLat, longitude: userLon} = position.coords;
      const distance = getDistanceFromLatLonInMeters(userLat, userLon, stationLat, stationLon);

      console.log('Location check:', {
        appState,
        userLocation: {lat: userLat, lon: userLon},
        nextStation: {name: nextStationName, lat: stationLat, lon: stationLon},
        distance: distance,
        accuracy: position.coords.accuracy,
        timeSinceLastUpdate
      });

      if (distance < 200) {
        console.log('Station approaching alert triggered for:', nextStationName);
        
        if (Platform.OS === 'ios') {
          try {
            console.log('Attempting to send iOS notification...');
            PushNotificationIOS.presentLocalNotification({
              alertBody: `You are approaching ${nextStationName}!`,
              alertTitle: "Next Station Alert",
              soundName: 'default',
              category: 'STATION_ALERT',
              userInfo: {
                station: nextStationName,
                timestamp: new Date().toISOString(),
                appState: AppState.currentState
              },
              applicationIconBadgeNumber: 1,
            });
            console.log('iOS notification sent successfully from state:', AppState.currentState);
          } catch (error) {
            console.error('Error sending iOS notification:', error);
          }
        } else {
          Alert.alert('Next Station Alert', `You are approaching ${nextStationName}!`);
        }
        
        currentIdx++;
        if (currentIdx >= route.path.length - 1) {
          console.log('Alert cleared - Reached final station');
          if (watchId.current) {
            Geolocation.clearWatch(watchId.current);
            watchId.current = null;
          }
          setAlertActive(false);
        }
      }
    };

    // Start watching position with background updates
    console.log('Starting location watch with background updates...');
    watchId.current = Geolocation.watchPosition(
      checkNextStation,
      (error) => {
        console.log('Location error:', error);
        setAlertActive(false);
      },
      { enableHighAccuracy: true }
    );
    
    console.log('Location watching started with ID:', watchId.current);
    Alert.alert('Alert Set', 'You will be notified as you approach the next station.');
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'alert':
        return <AlertScreen />;
      case 'search route' :
        return <SearchRouteScreen />
      case 'route':
        return <RouteMapScreen />;
      case 'map':
        return <MapScreen />;
      default:
        return <RouteMapScreen />;
    }
  };

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <TabContext.Provider
        value={{
          activeTab, 
          setActiveTab, 
          setSelectedRoute, 
          selectedRoute, 
          setRoutesFound, 
          routesFound,
          handleSetAlert,
          alertActive
        }}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor={softBg} 
          translucent={false} 
        />
        
        {true ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Station Alert</Text>
            </View>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'search route' && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab('search route')}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'search route' && styles.activeTabText,
                  ]}>
                  Search Route
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'route map' && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab('route map')}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'route map' && styles.activeTabText,
                  ]}>
                  Route Map
                </Text>
              </TouchableOpacity>
              
              {/* <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'map' && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab('map')}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'map' && styles.activeTabText,
                  ]}>
                  Map
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'alert' && styles.activeTabButton,
                ]}
                onPress={() => setActiveTab('alert')}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'alert' && styles.activeTabText,
                  ]}>
                  {alertActive ? '🔔 Alert' : 'Alert'}
                </Text>
              </TouchableOpacity> */}
            </View>
            
            <View style={styles.content}>
              {renderScreen()}
            </View>
          </SafeAreaView>
        )}
      </TabContext.Provider>
    </GestureHandlerRootView>
  );
}

const accentColor = '#2EC4B6';
const softBg = '#F3F6F9';
const tabInactive = '#B0B4B8';
const tabActive = accentColor;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: softBg,
  },
  header: {
    backgroundColor: softBg,
    paddingTop: 32,
    paddingBottom: 18,
    paddingHorizontal: 24,
    alignItems: 'flex-start',
    borderBottomWidth: 0,
    elevation: 0,
  },
  headerTitle: {
    color: '#222B45',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'left',
    fontFamily: 'System',
  },
  tabContainer: {
    flexDirection: 'row',
    height: 48,
    backgroundColor: softBg,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E4EA',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginHorizontal: 8,
  },
  activeTabButton: {
    borderBottomColor: tabActive,
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: tabInactive,
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 0.2,
  },
  activeTabText: {
    color: tabActive,
  },
  content: {
    flex: 1,
    backgroundColor: softBg,
    zIndex: -1,
    paddingTop: 8,
  },
});

export default App; 