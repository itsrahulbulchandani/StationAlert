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
  Image,
} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  openSettings,
  checkMultiple,
  requestMultiple,
} from 'react-native-permissions';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import Geolocation from '@react-native-community/geolocation';
import { NativeModules } from 'react-native';
import {requestTrackingPermission} from 'react-native-tracking-transparency';
import {AdBanner} from './src/components/AdBanner';
import './src/config/admob';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AlertScreen from './components/AlertScreen';
// import RouteMapScreen from './components/RouteMapScreen';
import MapScreen from './components/MapScreen';
import SearchRouteScreen from './components/SearchRoutes';
import AlertSelection from './components/AlertSelection';
// import stations from './components/stations';
import SplashScreen from './components/SplashScreen';
import {ThemeProvider, useTheme} from './src/context/ThemeContext';
import stations from './components/stationsWithIDs';
import stationsInverted from './components/stations_inverted';
import stationsFromKeys from './components/stationsFromKeys';
import AlertOverlay from './components/AlertOverlay';
import InAppNotification from './src/components/InAppNotification';

export const TabContext = createContext();

// Add screen dimension utilities
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // Using 375 as base width (iPhone X)

const normalize = size => {
  const newSize = size * scale;
  return Math.round(Platform.OS === 'ios' ? newSize : newSize - 2);
};

// Haversine formula to calculate distance between two points
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of the earth in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    0.5 -
    Math.cos(dLat) / 2 +
    (Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      (1 - Math.cos(dLon))) /
      2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// Helper function to find the nearest upcoming station
const findNearestUpcomingStation = (currentLocation, routePath) => {
  if (!currentLocation || !routePath || routePath.length < 2) {
    return -1;
  }

  let minDistance = Infinity;
  let nearestStationIndex = -1;

  for (let i = 0; i < routePath.length; i++) {
    const stationName = routePath[i];
    const station = stations[stationName];
    
    if (!station) continue;

    const distance = getDistanceFromLatLonInMeters(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      station.coords.latitude,
      station.coords.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestStationIndex = i;
    }
  }

  return nearestStationIndex;
};

// Add this before the AppContent component
const initializePermissions = async () => {
  if (Platform.OS === 'ios') {
    const permissions = [
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      PERMISSIONS.IOS.LOCATION_ALWAYS,
      PERMISSIONS.IOS.NOTIFICATIONS,
    ];
    
    try {
      const statuses = await checkMultiple(permissions);
      console.log('Permission statuses:', statuses);
      
      // Request any permissions that aren't granted
      const permissionsToRequest = permissions.filter(
        permission => statuses[permission] === RESULTS.DENIED
      );
      
      if (permissionsToRequest.length > 0) {
        const results = await requestMultiple(permissionsToRequest);
        console.log('Permission request results:', results);
      }
    } catch (error) {
      console.error('Error initializing permissions:', error);
    }
  }
};

const requestAppTrackingPermission = async () => {
  if (Platform.OS === 'ios') {
    try {
      const trackingStatus = await requestTrackingPermission();
      console.log('Tracking permission status:', trackingStatus);
      return trackingStatus === 'authorized';
    } catch (error) {
      console.error('Error requesting tracking permission:', error);
      return false;
    }
  }
  return true; // Return true for non-iOS platforms
};

function AppContent({
  activeTab,
  setActiveTab,
  selectedRoute,
  setSelectedRoute,
  routesFound,
  setRoutesFound,
  alertActive,
  setAlertActive,
  routeSelectionOpened,
  setRouteSelectionOpened,
}) {
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [userBetweenStations, setUserBetweenStations] = useState(false);
  const [nearestStationIndices, setNearestStationIndices] = useState({ prev: null, next: null });
  const [showSplash, setShowSplash] = useState(false);
  const [adError, setAdError] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [showInAppNotification, setShowInAppNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [startFromStationIndex, setStartFromStationIndex] = useState(0);
  const watchId = useRef(null);
  const appState = useRef(AppState.currentState);
  const {theme} = useTheme();

  // Handle splash screen timeout
  // useEffect(() => {
  //   if (showSplash) {
  //     // Splash screen will handle its own timeout via onFinish callback
  //   }
  // }, [showSplash]);

  console.log("alertActive", alertActive)

  useEffect(() => {
    const initializeApp = async () => {
      // Request App Tracking Transparency permission first
      await requestAppTrackingPermission();
      
      // Initialize other permissions
      await initializePermissions();
    };

    initializeApp();

    // iOS notification configuration
    if (Platform.OS === 'ios') {
      try {
        console.log('Initializing iOS notifications...');
        
        // Configure notification categories
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
        
        console.log('Notification categories configured');
      } catch (error) {
        console.error('Error in iOS notification initialization:', error);
      }
    } else if (Platform.OS === 'android') {
      // Android notification configuration - simplified to avoid Firebase errors
      try {
        console.log('Initializing Android notifications...');
        
        // Only create the notification channel without configuring the entire system
        // This avoids Firebase initialization errors
        PushNotification.createChannel(
          {
            channelId: 'station-alerts',
            channelName: 'Station Alerts',
            channelDescription: 'Notifications for approaching stations',
            playSound: true,
            soundName: 'default',
            importance: 4,
            vibrate: true,
          },
          (created) => console.log(`Channel created: ${created}`)
        );
        
        console.log('Android notification channel created');
      } catch (error) {
        console.error('Error creating Android notification channel:', error);
      }
    }
    
    // App state change listener for background/foreground transitions
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        console.log('App has gone to the background!');
        // Ensure location updates continue in background
        if (watchId.current && alertActive) {
          Geolocation.setRNConfiguration({
            skipPermissionRequests: false,
            authorizationLevel: 'always',
            locationProvider: 'auto',
            enableBackgroundLocationUpdates: true,
            pauseLocationUpdatesAutomatically: false,
          });
          
          // Start the foreground service when app goes to background if alerts are active
          if (Platform.OS === 'android') {
            console.log('App going to background - ensuring foreground service is running');
            try {
              const { startLocationService } = require('./LocationTask');
              
              // Get current position to pass to the service
              Geolocation.getCurrentPosition(
                position => {
                  startLocationService({
                    initialLocation: {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                      accuracy: position.coords.accuracy
                    },
                    route: activeRoute?.path,
                    isBackground: true
                  });
                },
                error => console.error('Error getting position for background service:', error),
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
              );
            } catch (error) {
              console.error('Error starting foreground service on background:', error);
            }
          }
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

// First, install the library:
// npm install react-native-permissions
// For iOS, also run: cd ios && pod install

// Add these imports at the top of your file:


const getLocationPermission = () => {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
  } else {
    return PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  }
};

const getBackgroundLocationPermission = () => {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.LOCATION_ALWAYS;
  } else {
    return PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION;
  }
};

const getNotificationPermission = () => {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.NOTIFICATIONS;
  } else {
    return PERMISSIONS.ANDROID.POST_NOTIFICATIONS;
  }
};

const checkLocationPermissionStatus = async () => {
  try {
    // Check basic location permission first
    const basicLocationStatus = await check(getLocationPermission());
    
    if (basicLocationStatus !== RESULTS.GRANTED) {
      return {
        status: basicLocationStatus,
        hasBackground: false
      };
    }

    // If basic location is granted, check background location
    const backgroundLocationStatus = await check(getBackgroundLocationPermission());
    
    return {
      status: basicLocationStatus,
      hasBackground: backgroundLocationStatus === RESULTS.GRANTED
    };
  } catch (error) {
    console.log('Error checking location permission:', error);
    return {
      status: RESULTS.UNAVAILABLE,
      hasBackground: false
    };
  }
};

const checkNotificationPermissionStatus = async () => {
  if (Platform.OS === 'ios') {
    try {
     return new Promise((resolve) => {
      PushNotificationIOS.checkPermissions((permissions) => {
        console.log('iOS notification permissions:', permissions);
        const hasAnyPermission = permissions.alert || permissions.badge || permissions.sound;
        resolve(hasAnyPermission ? RESULTS.GRANTED : RESULTS.DENIED);
      });
    });
    } catch (error) {
      console.error('Detailed error checking notification permission:', error);
      // Try fallback to PushNotificationIOS only
    }
  }
};

const getPermissionStatusText = (status) => {
  switch (status) {
    case RESULTS.UNAVAILABLE:
      return 'unavailable';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.LIMITED:
      return 'limited';
    case RESULTS.GRANTED:
      return 'granted';
    case RESULTS.BLOCKED:
      return 'blocked';
    default:
      return 'unknown';
  }
};

const showPermissionSettingsPrompt = (locationInfo, notificationStatus) => {
  let message = '';
  let needsLocationFix = false;
  let needsNotificationFix = false;

  // Check location issues
  if (locationInfo.status === RESULTS.DENIED || locationInfo.status === RESULTS.BLOCKED) {
    message += 'Location access is denied. ';
    needsLocationFix = true;
  } else if (locationInfo.status === RESULTS.GRANTED && !locationInfo.hasBackground) {
    if (Platform.OS === 'ios') {
      message += 'Location is set to "While Using App" but background alerts need "Always Allow". ';
    } else {
      message += 'Background location access is needed for alerts when app is closed. ';
    }
    needsLocationFix = true;
  }

  // Check notification issues
  if (notificationStatus === RESULTS.DENIED || notificationStatus === RESULTS.BLOCKED) {
    message += 'Notifications are disabled. ';
    needsNotificationFix = true;
  }

  if (needsLocationFix || needsNotificationFix) {
    message += '\nWould you like to open Settings to update these permissions?';

    Alert.alert(
      'Permission Settings Required',
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Open Settings',
          onPress: () => {
            openSettings().catch(() => {
              console.warn('Cannot open settings');
            });
          }
        }
      ]
    );
    return true;
  }
  return false;
};

const requestLocationPermission = async () => {
  try {
    // First request basic location permission
    const basicResult = await request(getLocationPermission());
    console.log('Basic location permission result:', getPermissionStatusText(basicResult));
    
    if (basicResult !== RESULTS.GRANTED) {
      return false;
    }

    // If basic location granted, request background location
    const backgroundResult = await request(getBackgroundLocationPermission());
    console.log('Background location permission result:', getPermissionStatusText(backgroundResult));
    
    // Return true if we have basic location (background is nice to have but not required)
    return true;
  } catch (error) {
    console.log('Location permission request error:', error);
    return false;
  }
};

const requestNotificationPermission = async () => {
      return new Promise((resolve) => {
      PushNotificationIOS.requestPermissions({
        alert: true,
        badge: true,
        sound: true,
      }, (granted) => {
        console.log('iOS notification permission result:', granted);
        resolve(granted.alert || granted.badge || granted.sound);
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

  // Check current permission status
  const locationInfo = await checkLocationPermissionStatus();
  const notificationStatus = await checkNotificationPermissionStatus();

  console.log('Permission status:', {
    location: getPermissionStatusText(locationInfo.status),
    hasBackground: locationInfo.hasBackground,
    notifications: getPermissionStatusText(notificationStatus)
  });

  // If permissions were previously granted but not optimal, show settings prompt
  const hasPermissionIssues = (
    locationInfo.status === RESULTS.BLOCKED || locationInfo.status === RESULTS.DENIED ||
    notificationStatus === RESULTS.BLOCKED || notificationStatus === RESULTS.DENIED ||
    (locationInfo.status === RESULTS.GRANTED && !locationInfo.hasBackground)
  );

  if (hasPermissionIssues) {
    const promptShown = showPermissionSettingsPrompt(locationInfo, notificationStatus);
    if (promptShown) {
      return; // Exit early if we showed the settings prompt
    }
  }

  // Request permissions if not granted
  if (locationInfo.status !== RESULTS.GRANTED) {
    const hasLocationPermission = await requestLocationPermission();
    if (!hasLocationPermission) {
      Alert.alert('Permission Required', 'Location permission is required for alerts.');
      return;
    }
  }

  if (notificationStatus !== RESULTS.GRANTED && Platform.OS === 'ios') {
    const hasNotificationPermission = await requestNotificationPermission();
    if (!hasNotificationPermission) {
      Alert.alert('Permission Required', 'Notification permission is required for alerts.');
      return;
    }
  }

  // Set the active route when starting alerts
  setActiveRoute(route);

  // Get current location first to determine starting point
  Geolocation.getCurrentPosition(
    async (position) => {
      const nearestStationIndex = findNearestUpcomingStation(position, route.path);
      
      if (nearestStationIndex === -1) {
        Alert.alert('Alert', 'Unable to determine your position relative to the route.');
        return;
      }

      // If we're at or past the last station
      if (nearestStationIndex >= route.path.length - 1) {
        Alert.alert('Alert', 'You have already passed all stations on this route.');
        return;
      }

      // Configure for background location updates
      console.log('Configuring background location updates...');
      Geolocation.setRNConfiguration({
        skipPermissionRequests: false,
        authorizationLevel: 'always',
        locationProvider: 'auto',
        enableBackgroundLocationUpdates: true,
        pauseLocationUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
        allowsBackgroundLocationUpdates: true
      });
      console.log('Background location configuration complete');

      console.log('Setting up location tracking for route:', route.path);
      let currentIdx = nearestStationIndex;
      let lastUpdateTime = Date.now();

      // Start at the first station, alert for the next
      const checkNextStation = (position) => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTime;
        lastUpdateTime = now;
        setAlertActive(true);
        // Update currentCoordinates for use in RouteMapScreen
        setCurrentCoordinates(position);
        console.log("setting alertActive to true and updating coordinates");

        // Log app state and location update details
        const appState = AppState.currentState;
        console.log('alertactive Location update received:', {
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
          console.log("setting alertActive to false")
          setAlertActive(false);
          return;
        }

        const nextStationId = route.path[currentIdx + 1];
        const nextStation = stations[nextStationId];
        const nextStationName = stationsFromKeys[nextStationId]
        
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

        if (distance < 400) {
          console.log('Station approaching alert triggered for:', nextStationName);
          
          if (Platform.OS === 'ios') {
            try {
              // Show in-app notification if app is in foreground
              if (AppState.currentState === 'active') {
                setNotificationMessage(`You are approaching ${nextStationName}!`);
                setShowInAppNotification(true);
              }
              
              // Still show push notification
              PushNotificationIOS.presentLocalNotification({
                alertBody: `You are approaching ${nextStationName}!`,
                alertTitle: "Next Station Alert",
                soundName: 'default',
                category: 'STATION_ALERT',
                userInfo: {
                  station: nextStationName,
                  timestamp: new Date().toISOString(),
                  appState: AppState.currentState,
                  iconName: 'AppIcon60x60'  // This references your app icon
                },
                applicationIconBadgeNumber: 1,
                threadIdentifier: 'station-alerts',
                alertAction: 'view'
              });
              console.log('iOS notification sent successfully from state:', AppState.currentState);
            } catch (error) {
              console.error('Error sending iOS notification:', error);
            }
          } else {
            // For Android, show in-app notification if in foreground
            if (AppState.currentState === 'active') {
              setNotificationMessage(`You are approaching ${nextStationName}!`);
              setShowInAppNotification(true);
            } else {
              Alert.alert('Next Station Alert', `You are approaching ${nextStationName}!`);
            }
          }
          
          currentIdx++;
          if (currentIdx >= route.path.length - 1) {
            console.log('Alert cleared - Reached final station');
            if (watchId.current) {
              Geolocation.clearWatch(watchId.current);
              watchId.current = null;
            }
            console.log("setting alertActive to false")
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
          console.log("setting alertActive to false")
          setAlertActive(false);
        },
        { 
          enableHighAccuracy: true,
          distanceFilter: 10,  // Get updates when device moves by 10 meters
          interval: 10000,    // Update every 10 seconds
          fastestInterval: 5000,  // Fastest rate at which app can handle updates
          maximumAge: 10000,  // Accept locations that are up to 10 seconds old
          useSignificantChanges: false, // Get regular updates, not just significant ones
          allowsBackgroundLocationUpdates: true // Enable background location updates
        }  
      );
      
      console.log('Location watching started with ID:', watchId.current);
      Alert.alert('Alert Set', 'You will be notified as you approach the next station.');
    },
    (error) => {
      console.log('Location error:', error);
      console.log("setting alertActive to false")
      setAlertActive(false);
    }
  );
};

  // Add handleStopAlerts function
  const handleStopAlerts = () => {
    if (watchId.current) {
      console.log('Stopping alerts and clearing watch:', watchId.current);
      Geolocation.clearWatch(watchId.current);
      watchId.current = null;
      
      // Stop the foreground service on Android when alerts are stopped
      if (Platform.OS === 'android') {
        console.log('Stopping Android foreground service...');
        try {
          // Remove the persistent notification
          PushNotification.cancelLocalNotification(9999);
          
          // Stop our custom foreground service
          const { stopLocationService } = require('./LocationTask');
          stopLocationService().then(success => {
            if (success) {
              console.log('Foreground service stopped successfully');
            } else {
              console.error('Failed to stop foreground service');
            }
          });
        } catch (error) {
          console.error('Error stopping foreground service:', error);
        }
      }
    }
    
    setAlertActive(false);
    if(activeTab == 'alert-tracking') {
      setActiveTab('search route');
    }
    setActiveRoute(null);
    console.log("setting alertActive to false")
    Alert.alert('Alerts Stopped', 'Station tracking alerts have been stopped.');
  };
  
  // Android-specific alert handler that allows selecting  specific station
  const handleSetAlertAndroid = async (route, stationIndex = 0) => {
    console.log('handleSetAlertAndroid called with route and station index:', route, stationIndex);
    
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

    // Check current permission status
    const locationInfo = await checkLocationPermissionStatus();
    const notificationStatus = await checkNotificationPermissionStatus();

    console.log('Permission status:', {
      location: getPermissionStatusText(locationInfo.status),
      hasBackground: locationInfo.hasBackground,
      notifications: getPermissionStatusText(notificationStatus)
    });

    // If permissions were previously granted but not optimal, show settings prompt
    const hasPermissionIssues = (
      locationInfo.status === RESULTS.BLOCKED || locationInfo.status === RESULTS.DENIED ||
      notificationStatus === RESULTS.BLOCKED || notificationStatus === RESULTS.DENIED ||
      (locationInfo.status === RESULTS.GRANTED && !locationInfo.hasBackground)
    );

    if (hasPermissionIssues) {
      const promptShown = showPermissionSettingsPrompt(locationInfo, notificationStatus);
      if (promptShown) {
        return; // Exit early if we showed the settings prompt
      }
    }

    // Request permissions if not granted
    if (locationInfo.status !== RESULTS.GRANTED) {
      const hasLocationPermission = await requestLocationPermission();
      if (!hasLocationPermission) {
        Alert.alert('Permission Required', 'Location permission is required for alerts.');
        return;
      }
    }

    // Set the active route when starting alerts
    setActiveRoute(route);
    
    // Save the starting station index
    setStartFromStationIndex(stationIndex);

    // Get current location first to determine starting point
    Geolocation.getCurrentPosition(
      async (position) => {
        // Configure for background location updates
        console.log('Configuring background location updates...');
        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'always',
          locationProvider: 'auto',
          enableBackgroundLocationUpdates: true,
          pauseLocationUpdatesAutomatically: false,
          showsBackgroundLocationIndicator: true,
          allowsBackgroundLocationUpdates: true
        });
        console.log('Background location configuration complete');

        console.log('Setting up location tracking for route starting at station index:', stationIndex);
        let currentIdx = stationIndex;
        let lastUpdateTime = Date.now();

        // Start at the selected station, alert for the next
        const checkNextStation = (position) => {
          const now = Date.now();
          const timeSinceLastUpdate = now - lastUpdateTime;
          lastUpdateTime = now;
          setAlertActive(true);
          // Update currentCoordinates for use in RouteMapScreen
          setCurrentCoordinates(position);
          console.log("setting alertActive to true and updating coordinates");

          // Log app state and location update details
          const appState = AppState.currentState;
          console.log('alertactive Location update received:', {
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
            console.log("setting alertActive to false")
            setAlertActive(false);
            return;
          }

          const nextStationId = route.path[currentIdx + 1];
          const nextStation = stations[nextStationId];
          const nextStationName = stationsFromKeys[nextStationId]
          
          if (!nextStation) {
            console.log('Next station not found:', nextStationName);
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
          
          // Send location data to headless task when in background (Android only)
          if (Platform.OS === 'android' && AppState.currentState !== 'active') {
            try {
              // Use the LocationModule directly
              const { NativeModules } = require('react-native');
              const LocationModule = NativeModules.LocationModule;
              
              if (LocationModule) {
                // Create data object for the headless task
                const locationData = {
                  location: {
                    latitude: userLat,
                    longitude: userLon,
                    accuracy: position.coords.accuracy
                  },
                  nextStationName,
                  distance,
                  timestamp: new Date().toISOString()
                };
                
                // Send data to the headless task via the service intent
                LocationModule.startLocationService(locationData)
                  .then(result => {
                    console.log('Started background location service with data:', result);
                  })
                  .catch(err => {
                    console.error('Failed to start location service:', err);
                  });
              } else {
                console.error('LocationModule not available');
              }
            } catch (error) {
              console.error('Failed to start headless task:', error);
            }
          }

          if (distance < 400) {
            console.log('Station approaching alert triggered for:', nextStationName);
            
            if (Platform.OS === 'android') {
              try {
                // Show in-app notification if app is in foreground
                if (AppState.currentState === 'active') {
                  setNotificationMessage(`You are approaching ${nextStationName}!`);
                  setShowInAppNotification(true);
                }
                
                // ALWAYS send push notification (like iOS does) - regardless of app state
                PushNotification.localNotification({
                  channelId: 'station-alerts',
                  title: "Next Station Alert",
                  message: `You are approaching ${nextStationName}!`,
                  playSound: true,
                  soundName: 'default',
                  importance: 'high',
                  vibrate: true,
                  priority: 'high',
                  visibility: 'public',
                  ignoreInForeground: false, // Show notification even in foreground
                });
                console.log('Android notification sent successfully from state:', AppState.currentState);
              } catch (error) {
                console.error('Error sending Android notification:', error);
              }
            }
            
            currentIdx++;
            if (currentIdx >= route.path.length - 1) {
              console.log('Alert cleared - Reached final station');
              if (watchId.current) {
                Geolocation.clearWatch(watchId.current);
                watchId.current = null;
              }
              console.log("setting alertActive to false")
              setAlertActive(false);
            }
          }
        };

        // For Android, start a foreground service to keep the app running in background
        if (Platform.OS === 'android') {
          console.log('Starting Android foreground service for background location tracking...');
          
          // Import the location service functions
          const { startLocationService } = require('./LocationTask');
          
          // Start the foreground service with location data
          startLocationService({
            initialLocation: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            },
            route: route.path,
            currentStationIndex: stationIndex
          }).then(success => {
            if (success) {
              console.log('Foreground service started successfully');
            } else {
              console.error('Failed to start foreground service');
            }
          });
          
          // Create a foreground service notification channel if it doesn't exist
          PushNotification.createChannel(
            {
              channelId: 'location-tracking', // Different channel for the service
              channelName: 'Location Tracking Service',
              channelDescription: 'Keeps the app running in background for location tracking',
              playSound: false,
              importance: 3, // High importance
              vibrate: false,
            },
            (created) => console.log(`Location tracking channel created: ${created}`)
          );
        }
        
        // Start watching position with background updates
        console.log('Starting location watch with background updates...');
        watchId.current = Geolocation.watchPosition(
          checkNextStation,
          (error) => {
            console.log('Location error:', error);
            console.log("setting alertActive to false")
            setAlertActive(false);
          },
          { 
            enableHighAccuracy: true,
            distanceFilter: 10,  // Get updates when device moves by 10 meters
            interval: 10000,    // Update every 10 seconds
            fastestInterval: 5000,  // Fastest rate at which app can handle updates
            maximumAge: 10000,  // Accept locations that are up to 10 seconds old
            useSignificantChanges: false, // Get regular updates, not just significant ones
            allowsBackgroundLocationUpdates: true, // Enable background location updates
            // Android specific options to keep the service running
            ...(Platform.OS === 'android' ? {
              foregroundService: {
                notificationTitle: "Station Alert Active",
                notificationBody: "Tracking your location for station alerts",
                notificationColor: "#2196F3",
              }
            } : {})
          }  
        );
        
        console.log('Location watching started with ID:', watchId.current);
        Alert.alert('Alert Set', `You will be notified as you approach ${stationsFromKeys[route.path[stationIndex + 1]]}.`);
      },
      (error) => {
        console.log('Location error:', error);
        console.log("setting alertActive to false")
        setAlertActive(false);
      }
    );
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'alert':
        return <AlertScreen />;
      case 'search route':
        return <SearchRouteScreen />;
      // case 'route':
        // return <RouteMapScreen />;
      case 'map':
        return <MapScreen />;
      case 'alert-tracking':
        return <AlertSelection route={selectedRoute} onClose={() => setActiveTab('search route')} />;
      default:
        return <RouteMapScreen />;
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <TabContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedRoute,
        setSelectedRoute,
        routesFound,
        setRoutesFound,
        handleSetAlert,
        handleSetAlertAndroid,
        alertActive,
        currentCoordinates,
        setCurrentCoordinates,
        routeSelectionOpened,
        setRouteSelectionOpened,
        userBetweenStations,
        setUserBetweenStations,
        nearestStationIndices,
        setNearestStationIndices
      }}>
      <SafeAreaView
        style={[styles.safeArea, {backgroundColor: theme.safeAreaBackground}]}>
        <StatusBar
          barStyle={theme.statusBar.style}
          backgroundColor={theme.statusBar.background}
        />

        {showSplash ? (
          <SplashScreen onFinish={() => setShowSplash(false)} />
        ) : (
          <>
            <View
              style={[styles.content, Platform.OS === 'ios' ? {backgroundColor: theme.softBackground} : null]}
              >
              {renderScreen()}
            </View>
            {!adError && activeTab !== 'search route' && <AdBanner />}
            
            <AlertOverlay isActive={alertActive} onStopAlerts={handleStopAlerts} route={activeRoute} />
            
            <InAppNotification
              message={notificationMessage}
              isVisible={showInAppNotification}
              onHide={() => setShowInAppNotification(false)}
            />

            {/* Floating navigation bar */}
            {/* <View style={styles.floatingNavContainer}>
              <View style={[
                styles.floatingNavBar,
                {
                  backgroundColor: theme.isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  borderWidth: 1,
                  borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
                }
              ]}>
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    activeTab === 'search route' && [
                      styles.activeNavButton,
                      {backgroundColor: theme.isDark ? '#FFFFFF' : '#000000'}
                    ],
                  ]}
                  onPress={() => setActiveTab('search route')}>
                  <View style={styles.iconContainer}>
                    <Icon 
                      name="search" 
                      size={22} 
                      color={activeTab === 'search route' ? '#FFFFFF' : theme.isDark ? '#FFFFFF' : '#000000'} 
                    />
                  </View>
                  <Text
                    style={[
                      styles.navButtonText,
                      {
                        color:
                          activeTab === 'search route'
                            ? '#FFFFFF'
                            : theme.isDark ? '#B0B0B0' : '#000000',
                      },
                    ]}>
                    Search Route
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.navButton,
                    activeTab === 'route' && [
                      styles.activeNavButton,
                      {backgroundColor: theme.isDark ? '#FFFFFF' : '#000000'}
                    ],
                  ]}
                  onPress={() => setActiveTab('route')}>
                  <View style={styles.iconContainer}>
                    <Icon 
                      name="map-outline" 
                      size={22} 
                      color={activeTab === 'route' ? '#FFFFFF' : theme.isDark ? '#FFFFFF' : '#000000'} 
                    />
                  </View>
                  <Text
                    style={[
                      styles.navButtonText,
                      {
                        color:
                          activeTab === 'route'
                            ? '#FFFFFF'
                            : theme.isDark ? '#B0B0B0' : '#000000',
                      },
                    ]}>
                    Map
                  </Text>
                </TouchableOpacity>
              </View> 
            </View> */}
          </>
        )}
      </SafeAreaView>
    </TabContext.Provider>
    </GestureHandlerRootView>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('search route');
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [routesFound, setRoutesFound] = useState([]);
  const [alertActive, setAlertActive] = useState(false);
  const [routeSelectionOpened, setRouteSelectionOpened] = useState(false);

  return (
    <SafeAreaProvider>
      <PaperProvider>
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
            routeSelectionOpened={routeSelectionOpened}
            setRouteSelectionOpened={setRouteSelectionOpened}
          />
        </ThemeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  header: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight+20 : 0,
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
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'left',
    fontFamily: 'System',
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  // Floating navigation bar styles
  floatingNavContainer: {
    position: 'absolute',
    bottom: normalize(30),
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    display: 'flex',
  },
  floatingNavBar: {
    flexDirection: 'row',
    height: normalize(50),
    width: '75%',
    // width: 'fit-content',
    borderRadius: normalize(25),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.40,
    shadowRadius: 3.84,
    // paddingBottom: normalize(10),
    elevation: 50,
    paddingHorizontal: normalize(10),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flex: 1,
    height: normalize(38),
    borderRadius: normalize(19),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: normalize(12),
    gap: 6,
  },
  activeNavButton: {
    backgroundColor: '#000000',
  },
  navButtonText: {
    fontSize: normalize(14),
    fontWeight: '600',
    textAlign: 'center',
  },
  iconContainer: {
    // backgroundColor: 'rgba(128, 128, 128, 0.3)',
    // width: 30,
    // height: 30,
    // borderRadius: 15,
    // justifyContent: 'center',
    // alignItems: 'center',
    // marginRight: 4,
  },
  content: {
    flex: 1,
    zIndex: Platform.OS === 'ios' ? -1 : 0, // Fix for Android visibility
    // paddingTop: normalize(8),
  },
});

export default App;
