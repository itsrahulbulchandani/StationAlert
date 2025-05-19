import React, {createContext, useState, useEffect, useRef} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  AppState,
  Alert,
  PermissionsAndroid,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import Geolocation from '@react-native-community/geolocation';
import { AdBanner } from './src/components/AdBanner';
import './src/config/admob';

import AlertScreen from './components/AlertScreen';
import RouteMapScreen from './components/RouteMapScreen';
import MapScreen from './components/MapScreen';
import SearchRouteScreen from './components/SearchRoutes';
import stations from './components/stations';
import SplashScreen from './components/SplashScreen';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

export const TabContext = createContext();

// Add screen dimension utilities
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // Using 375 as base width (iPhone X)

const normalize = (size) => {
  const newSize = size * scale;
  return Math.round(Platform.OS === 'ios' ? newSize : newSize - 2);
};

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

function AppContent({ 
  activeTab, 
  setActiveTab, 
  selectedRoute, 
  setSelectedRoute, 
  routesFound, 
  setRoutesFound, 
  alertActive, 
  setAlertActive,
  onSetAlert 
}) {
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(false);
  const [adError, setAdError] = useState(false);
  const watchId = useRef(null);
  const appState = useRef(AppState.currentState);
  const { theme } = useTheme();

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

  const renderScreen = () => {
    switch (activeTab) {
      case 'alert':
        return <AlertScreen />;
      case 'search route':
        return <SearchRouteScreen />;
      case 'route':
        return <RouteMapScreen />;
      case 'map':
        return <MapScreen />;
      default:
        return <RouteMapScreen />;
    }
  };

  return (
    <TabContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedRoute,
        setSelectedRoute,
        routesFound,
        setRoutesFound,
        handleSetAlert: onSetAlert,
        alertActive
      }}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.softBackground }]}>
        <StatusBar 
          barStyle={theme.statusBar.style} 
          backgroundColor={theme.statusBar.background} 
        />
        
        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <>
            <View style={[styles.header, { backgroundColor: theme.softBackground }]}>
              <Text style={[styles.headerTitle, { color: theme.headerTextColor }]}>
                Next Stop
              </Text>
            </View>
            
            <View style={[styles.tabContainer, { backgroundColor: theme.softBackground }]}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'search route' && [styles.activeTabButton, { borderBottomColor: theme.tabBar.activeBorderColor }],
                ]}
                onPress={() => setActiveTab('search route')}>
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === 'search route' ? theme.tabBar.activeColor : theme.tabBar.inactiveColor },
                  ]}>
                  Search Route
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'route' && [styles.activeTabButton, { borderBottomColor: theme.tabBar.activeBorderColor }],
                ]}
                onPress={() => setActiveTab('route')}>
                <Text
                  style={[
                    styles.tabText,
                    { color: activeTab === 'route' ? theme.tabBar.activeColor : theme.tabBar.inactiveColor },
                  ]}>
                  Map
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={[styles.content, { backgroundColor: theme.softBackground }]}>
              {renderScreen()}
            </View>
            {!adError && activeTab !== 'search route' && <AdBanner />}
          </>
        )}
      </SafeAreaView>
    </TabContext.Provider>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('search route');
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [routesFound, setRoutesFound] = useState([]);
  const [alertActive, setAlertActive] = useState(false);

  const handleSetAlert = async (route) => {
    console.log('handleSetAlert called with route:', route);
    
    if (!route || !route.path || route.path.length < 2) {
      console.log('Invalid route:', route);
      Alert.alert('Alert', 'Route is too short for alerts.');
      return;
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

    setAlertActive(true);
    Alert.alert('Alert Set', 'You will be notified as you approach the next station.');
  };

  return (
    <ThemeProvider>
      <AppContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedRoute={selectedRoute}
        setSelectedRoute={setSelectedRoute}
        routesFound={routesFound}
        setRoutesFound={setRoutesFound}
        alertActive={alertActive}
        setAlertActive={setAlertActive}
        onSetAlert={handleSetAlert}
      />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: normalize(24),
    paddingBottom: normalize(16),
    paddingHorizontal: normalize(24),
    alignItems: 'flex-start',
    borderBottomWidth: 0,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: normalize(36),
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'left',
    fontFamily: 'System',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    height: normalize(48),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(8),
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginHorizontal: normalize(8),
  },
  activeTabButton: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: normalize(16),
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'System',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
    zIndex: -1,
    paddingTop: normalize(8),
  },
});

export default App; 