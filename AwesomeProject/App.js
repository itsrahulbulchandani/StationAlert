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
  Dimensions,
  NativeModules,
  NativeEventEmitter,
} from 'react-native';
import {SafeAreaProvider, useSafeAreaInsets, initialWindowMetrics} from 'react-native-safe-area-context';
import {
  PERMISSIONS,
  RESULTS,
  check,
  request,
  openSettings,
  checkMultiple,
  requestMultiple,
  checkNotifications,
  requestNotifications,
} from 'react-native-permissions';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import Geolocation from '@react-native-community/geolocation';
import {requestTrackingPermission} from 'react-native-tracking-transparency';
import {AdBanner} from './src/components/AdBanner';
import VersionCheckService from './src/components/VersionCheckService';
import './src/config/admob';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import {loadJSON, saveJSON, STORAGE_KEYS} from './src/utils/storage';
import RouteMapScreen from './components/RouteMapScreen';
import SearchRouteScreen from './components/SearchRoutes';
// import stations from './components/stations';
import SplashScreen from './components/SplashScreen';
import {ThemeProvider, useTheme} from './src/context/ThemeContext';
import stations from './components/stationsWithIDs';
import stationsInverted from './components/stations_inverted';
import stationsFromKeys from './components/stationsFromKeys';
import AlertOverlay from './components/AlertOverlay';
import TutorialOverlay from './components/TutorialOverlay';
import {TutorialProvider, useTutorial} from './src/context/TutorialContext';

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

// Among the stations still ahead on the route (index >= fromIndex), find the
// one physically closest to the user. Used to resync progress when GPS drops
// out: if signal was lost while the train passed several stations, the closest
// station *ahead* is now further along the path, so we skip the missed ones
// instead of waiting forever for a station that is already behind us.
const findNearestStationIndexFrom = (currentLocation, routePath, fromIndex) => {
  let minDistance = Infinity;
  let nearestIndex = -1;

  for (let i = Math.max(0, fromIndex); i < routePath.length; i++) {
    const station = stations[routePath[i]];
    if (!station) continue;

    const distance = getDistanceFromLatLonInMeters(
      currentLocation.coords.latitude,
      currentLocation.coords.longitude,
      station.coords.latitude,
      station.coords.longitude,
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
    }
  }

  return { nearestIndex, minDistance };
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
  } else {
    // Android: runtime permissions default to "denied" at install, so the
    // system popups never appear unless we request them. Ask for foreground
    // location and notifications up front. Background location is NOT requested
    // here — Android requires it as a separate, in-context request (handled
    // when an alert is set), which is also what Play policy expects.
    // NB: POST_NOTIFICATIONS is not a PERMISSIONS.ANDROID constant in
    // react-native-permissions v5 — use the dedicated notifications helpers.
    try {
      const locStatus = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (locStatus !== RESULTS.GRANTED) {
        const locResult = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        console.log('Android location request:', locResult);
      }
      if (Platform.Version >= 33) {
        const {status} = await checkNotifications();
        if (status !== RESULTS.GRANTED) {
          const {status: notifResult} = await requestNotifications([]);
          console.log('Android notification request:', notifResult);
        }
      }
    } catch (error) {
      console.error('Error initializing Android permissions:', error);
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
  liveTracking,
  setLiveTracking,
  routeSelectionOpened,
  setRouteSelectionOpened,
  recentSearches,
  setRecentSearches,
  favourites,
  setFavourites,
  recentStations,
  setRecentStations,
  favouriteStations,
  setFavouriteStations,
}) {
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [showSplash, setShowSplash] = useState(true);
  const [adError, setAdError] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const watchId = useRef(null);
  // Alert-notification state for the shared location watcher (refs so the single
  // persistent watcher can read/advance them across renders).
  const alertRouteRef = useRef(null);
  const alertIdxRef = useRef(0);
  const appState = useRef(AppState.currentState);

  // Android: listen for events emitted by the native StationAlertService.
  // The service runs in the background independently of the JS thread, so this
  // is the only way to know when it has finished or when a station was passed.
  useEffect(() => {
    if (Platform.OS !== 'android' || !NativeModules.StationAlert) return;
    const emitter = new NativeEventEmitter(NativeModules.StationAlert);
    const subStopped = emitter.addListener('onAlertStopped', () => {
      alertRouteRef.current = null;
      setAlertActive(false);
      setActiveRoute(null);
    });
    return () => subStopped.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const insets = useSafeAreaInsets();
  const {theme} = useTheme();
  const { registerRef, checkAndStartTutorial } = useTutorial();
  const mapTabRef = useRef(null);

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
    // Check for updates when the app starts (using test mode)
    VersionCheckService.checkForUpdate();

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
    }

    // Android notification setup. iOS keeps using PushNotificationIOS above; on
    // Android we use react-native-push-notification to post a real system
    // notification — Alert.alert only shows while the app is foregrounded and
    // never reaches the notification tray, which is exactly when a station
    // alert needs to fire.
    if (Platform.OS === 'android') {
      try {
        PushNotification.configure({
          onNotification: notification => {
            console.log('Android notification:', notification);
          },
          // POST_NOTIFICATIONS is requested via requestNotificationPermission()
          // (react-native-permissions); don't let the library prompt as well.
          requestPermissions: false,
          popInitialNotification: true,
        });

        // A channel is mandatory on Android 8+ (API 26); without it the
        // notification is dropped silently.
        PushNotification.createChannel(
          {
            channelId: 'station-alerts',
            channelName: 'Station Alerts',
            channelDescription: 'Alerts as you approach your station',
            importance: 4, // HIGH — shows as a heads-up notification
            vibrate: true,
          },
          created => console.log(`Station-alerts channel created: ${created}`),
        );
      } catch (error) {
        console.error('Error in Android notification initialization:', error);
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
  // Android: POST_NOTIFICATIONS is not a PERMISSIONS.ANDROID constant in
  // react-native-permissions v5; use the dedicated notifications helper.
  try {
    const {status} = await checkNotifications();
    return status;
  } catch (error) {
    console.error('Error checking Android notification permission:', error);
    return RESULTS.DENIED;
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
  // "Always" / "Allow all the time" is the OS wording for background location.
  // It can only be enabled from system Settings (both iOS and Android 11+ do
  // NOT allow it via an in-app popup), so we explain why and route there.
  const alwaysLabel = Platform.OS === 'ios' ? '"Always"' : '"Allow all the time"';

  const needsLocationFix =
    locationInfo.status !== RESULTS.GRANTED || !locationInfo.hasBackground;
  const needsNotificationFix = notificationStatus !== RESULTS.GRANTED;

  if (!needsLocationFix && !needsNotificationFix) {
    return false;
  }

  const lines = [];
  if (needsLocationFix) {
    lines.push(
      `📍  Location set to ${alwaysLabel}, so we can alert you as you near your station even when the app is in the background.`,
    );
  }
  if (needsNotificationFix) {
    lines.push('🔔  Notifications turned on, so Next Stop: Delhi Metro can reach you.');
  }

  Alert.alert(
    'Turn on Next Stop: Delhi Metro alerts',
    `To notify you before your stop, Next Stop: Delhi Metro needs:\n\n${lines.join(
      '\n\n',
    )}\n\nOpen Settings to enable them?`,
    [
      {text: 'Not now', style: 'cancel'},
      {
        text: 'Open Settings',
        onPress: () => openSettings().catch(() => console.warn('Cannot open settings')),
      },
    ],
  );
  return true;
};

const requestLocationPermission = async () => {
  try {
    // First request basic location permission
    const basicResult = await request(getLocationPermission());
    console.log('Basic location permission result:', getPermissionStatusText(basicResult));
    
    if (basicResult !== RESULTS.GRANTED) {
      return false;
    }

    // Background location is optional — don't let its request (which can throw
    // on Android 11+ because it requires a Settings round-trip) block the watcher.
    try {
      await request(getBackgroundLocationPermission());
    } catch (e) {
      console.log('Background location request (non-fatal):', e);
    }
    return true;
  } catch (error) {
    console.log('Location permission request error:', error);
    return false;
  }
};

const requestNotificationPermission = async () => {
  if (Platform.OS === 'android') {
    // Android 13+ (API 33) requires a runtime notification grant; earlier
    // versions grant it implicitly at install time.
    if (Platform.Version < 33) return true;
    const {status} = await requestNotifications([]);
    return status === RESULTS.GRANTED;
  }
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

  // The shared location watcher (effect) owns the watch lifecycle now — no
  // manual clearWatch here, which would otherwise interrupt live tracking.

  // Check current permission status
  const locationInfo = await checkLocationPermissionStatus();
  const notificationStatus = await checkNotificationPermissionStatus();

  console.log('Permission status:', {
    location: getPermissionStatusText(locationInfo.status),
    hasBackground: locationInfo.hasBackground,
    notifications: getPermissionStatusText(notificationStatus)
  });

  // Hard failures: location is fully blocked/denied, or on iOS notifications
  // are blocked (iOS alerts are useless without them). These must be fixed in
  // Settings before the alert can work at all.
  const isHardBlock = (
    locationInfo.status === RESULTS.BLOCKED ||
    locationInfo.status === RESULTS.DENIED ||
    (notificationStatus === RESULTS.BLOCKED && Platform.OS === 'ios')
  );

  // Advisory only: background location not granted means alerts only fire
  // while the app is open, but they DO still work. Show the settings tip once
  // so the user knows, but proceed — do NOT return early.
  const hasAdvisory =
    (locationInfo.status === RESULTS.GRANTED && !locationInfo.hasBackground) ||
    (notificationStatus === RESULTS.BLOCKED && Platform.OS === 'android');

  if (isHardBlock) {
    showPermissionSettingsPrompt(locationInfo, notificationStatus);
    return;
  }

  if (hasAdvisory) {
    showPermissionSettingsPrompt(locationInfo, notificationStatus);
    // Continue — foreground location is enough for in-app alerts.
  }

  // Request permissions if not granted
  if (locationInfo.status !== RESULTS.GRANTED) {
    const hasLocationPermission = await requestLocationPermission();
    if (!hasLocationPermission) {
      Alert.alert('Permission Required', 'Location permission is required for alerts.');
      return;
    }
  }

  if (notificationStatus !== RESULTS.GRANTED) {
    const hasNotificationPermission = await requestNotificationPermission();
    // iOS alerts are useless without notifications, so block. On Android the
    // live in-app tracking still works, so proceed even if it's declined.
    if (!hasNotificationPermission && Platform.OS === 'ios') {
      Alert.alert('Permission Required', 'Notification permission is required for alerts.');
      return;
    }
  }

  // Set the active route when starting alerts
  setActiveRoute(route);
  alertRouteRef.current = route;

  // Get current location once to seed the starting station, then flip the state
  // flags. The single shared location watcher (effect below) does the actual
  // watching and fires the approach notifications via handleAlertFix.
  Geolocation.getCurrentPosition(
    (position) => {
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

      alertIdxRef.current = nearestStationIndex;
      setCurrentCoordinates(position);
      setAlertActive(true);
      setLiveTracking(true);
      Alert.alert('Alert Set', 'You will be notified as you approach the next station.');

      // Android: hand off to the native foreground service, which keeps running
      // even when the app is backgrounded or the screen is off.
      if (Platform.OS === 'android' && NativeModules.StationAlert) {
        const upcoming = route.path
          .slice(nearestStationIndex + 1)
          .map(id => {
            const s = stations[id];
            if (!s) return null;
            return {name: stationsFromKeys[id] || '', lat: s.coords.latitude, lon: s.coords.longitude};
          })
          .filter(Boolean);
        NativeModules.StationAlert.startAlert(upcoming);
      }
    },
    (error) => {
      console.log('Location error:', error);
      setAlertActive(false);
    },
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
  );
};

  // Station-approach notification logic, driven by the shared location watcher
  // while alerts are active. Uses refs (alertRouteRef / alertIdxRef) instead of
  // closure variables so the single persistent watcher can call it across
  // renders and advance the progress index.
  const handleAlertFix = (position) => {
    const route = alertRouteRef.current;
    if (!route?.path) return;

    let currentIdx = alertIdxRef.current;
    if (currentIdx >= route.path.length - 1) {
      setAlertActive(false); // end of route — the effect tears the watch down
      return;
    }

    // Resync past any stations missed during a GPS gap: the station to alert for
    // is the closest one still ahead of us on the route.
    const { nearestIndex } = findNearestStationIndexFrom(position, route.path, currentIdx + 1);
    if (nearestIndex > currentIdx + 1) {
      currentIdx = nearestIndex - 1;
      alertIdxRef.current = currentIdx;
    }

    const nextStationId = route.path[currentIdx + 1];
    const nextStation = stations[nextStationId];
    const nextStationName = stationsFromKeys[nextStationId];

    if (!nextStation) {
      if (Platform.OS === 'ios') {
        PushNotificationIOS.presentLocalNotification({
          alertBody: `Next station not found:${nextStationName}`,
          alertTitle: 'Next Stop: Delhi Metro',
          soundName: 'default',
          category: 'STATION_ALERT',
          userInfo: { station: nextStationName, timestamp: new Date().toISOString(), appState: AppState.currentState },
          applicationIconBadgeNumber: 1,
        });
      } else {
        PushNotification.localNotification({
          channelId: 'station-alerts',
          title: 'Next Stop: Delhi Metro',
          message: `Next station not found:${nextStationName}`,
          playSound: true,
          soundName: 'default',
        });
      }
      return;
    }

    const { latitude: stationLat, longitude: stationLon } = nextStation.coords;
    const { latitude: userLat, longitude: userLon } = position.coords;
    const distance = getDistanceFromLatLonInMeters(userLat, userLon, stationLat, stationLon);

    if (distance < 400) {
      if (Platform.OS === 'ios') {
        try {
          PushNotificationIOS.presentLocalNotification({
            alertBody: `You are approaching ${nextStationName}!`,
            alertTitle: 'Next Stop: Delhi Metro',
            soundName: 'default',
            category: 'STATION_ALERT',
            userInfo: { station: nextStationName, timestamp: new Date().toISOString(), appState: AppState.currentState, iconName: 'AppIcon60x60' },
            applicationIconBadgeNumber: 1,
            threadIdentifier: 'station-alerts',
            alertAction: 'view',
          });
        } catch (error) {
          console.error('Error sending iOS notification:', error);
        }
      } else {
        PushNotification.localNotification({
          channelId: 'station-alerts',
          title: 'Next Stop: Delhi Metro',
          message: `You are approaching ${nextStationName}!`,
          playSound: true,
          soundName: 'default',
          vibrate: true,
          importance: 'high',
          priority: 'high',
        });
      }

      currentIdx++;
      alertIdxRef.current = currentIdx;
      if (currentIdx >= route.path.length - 1) {
        setAlertActive(false); // reached destination
      }
    }
  };

  // Single shared location watcher. Runs while live tracking OR alerts are on,
  // and is fully torn down + recreated whenever either flag changes (so the
  // native observer is re-started cleanly — see note below). Using ONE watcher,
  // instead of one here for alerts and a separate one in RouteMapScreen for the
  // map dot, avoids the @react-native-community/geolocation shared-observer
  // conflicts where clearing one watcher (e.g. toggling alerts) could stop the
  // other. It always publishes currentCoordinates (consumed by the map's live
  // dot), and runs the approach-alert notifications only while alerts are on.
  useEffect(() => {
    if (!liveTracking && !alertActive) return undefined;
    let id = null;
    let cancelled = false;
    (async () => {
      const ok = await requestLocationPermission();
      if (!ok || cancelled) return;
      // Background updates are only needed (and the 'always' authorization only
      // requested) while alerts are active. Setting this BEFORE watchPosition
      // matters: the library only (re)starts the native observer on the first
      // watcher, and recreating the watch on every flag change guarantees that
      // happens after the configuration is applied.
      if (alertActive) {
        Geolocation.setRNConfiguration({
          skipPermissionRequests: false,
          authorizationLevel: 'always',
          locationProvider: 'auto',
          enableBackgroundLocationUpdates: true,
          pauseLocationUpdatesAutomatically: false,
          showsBackgroundLocationIndicator: true,
          allowsBackgroundLocationUpdates: true,
        });
      }
      if (cancelled) return;
      id = Geolocation.watchPosition(
        position => {
          setCurrentCoordinates(position);
          // Android: the native StationAlertService handles proximity checks and
          // notifications independently; handleAlertFix is iOS-only here.
          if (alertActive && Platform.OS !== 'android') handleAlertFix(position);
        },
        error => { console.log('Location watch error:', error); },
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: alertActive ? 10000 : 4000,
          fastestInterval: alertActive ? 5000 : 2000,
          maximumAge: 1000,
          useSignificantChanges: false,
          allowsBackgroundLocationUpdates: alertActive,
        },
      );
      watchId.current = id;
    })();
    return () => {
      cancelled = true;
      if (id != null) Geolocation.clearWatch(id);
      watchId.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveTracking, alertActive]);

  // Stop alerts. Live tracking (if on) keeps running via the shared watcher
  // above — only the notification logic and the active alert route are cleared.
  const handleStopAlerts = () => {
    alertRouteRef.current = null;
    setAlertActive(false);
    setActiveRoute(null);
    if (Platform.OS === 'android' && NativeModules.StationAlert) {
      NativeModules.StationAlert.stopAlert();
    }
    Alert.alert('Alerts Stopped', 'Station tracking alerts have been stopped.');
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'search route':
        return <SearchRouteScreen />;
      case 'route':
        return <RouteMapScreen />;
      default:
        return <SearchRouteScreen />;
    }
  };

  const TABS = [
    { key: 'search route', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
    { key: 'route', label: 'Map', icon: 'map', iconOutline: 'map-outline' },
  ];

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
        handleStopAlerts,
        alertActive,
        liveTracking,
        setLiveTracking,
        currentCoordinates,
        setCurrentCoordinates,
        routeSelectionOpened,
        setRouteSelectionOpened,
        recentSearches,
        setRecentSearches,
        favourites,
        setFavourites,
        recentStations,
        setRecentStations,
        favouriteStations,
        setFavouriteStations
      }}>
      <View style={styles.safeArea}>
        <StatusBar
          translucent
          barStyle={theme.statusBar.style}
          backgroundColor="transparent"
        />

        {showSplash ? (
          <SplashScreen onFinish={() => { setShowSplash(false); checkAndStartTutorial(); }} />
        ) : (
          <>
            <View
              style={[styles.content, {backgroundColor: theme.softBackground}]}>
              {renderScreen()}
            </View>
            {!adError && activeTab !== 'search route' && <></>}

            <AlertOverlay
              isActive={alertActive}
              onStopAlerts={handleStopAlerts}
              route={activeRoute}
              onOpen={() => setActiveTab('route')}
            />

            {/* Bottom Tab Bar */}
            <View style={[styles.bottomTabContainer, {paddingBottom: Math.max(insets?.bottom ?? 0, 8)}]}>
              <View style={styles.bottomTabBar}>
                {TABS.map(tab => {
                  const active = activeTab === tab.key;
                  const tabRef = tab.key === 'route' ? mapTabRef : null;
                  if (tabRef) registerRef('mapTab', tabRef);
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      ref={tabRef}
                      style={styles.bottomTab}
                      activeOpacity={0.8}
                      onPress={() => setActiveTab(tab.key)}>
                      <View style={[styles.tabPill, active && styles.tabPillActive]}>
                        <Icon
                          name={active ? tab.icon : tab.iconOutline}
                          size={22}
                          color={active ? '#E5252B' : '#9A9A9A'}
                        />
                        {active && <Text style={styles.tabPillLabel}>{tab.label}</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

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
        <TutorialOverlay />
      </View>
    </TabContext.Provider>
    </GestureHandlerRootView>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('search route');
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [routesFound, setRoutesFound] = useState([]);
  const [alertActive, setAlertActive] = useState(false);
  // Live tracking (foreground map follow + live position) is independent of
  // alerts (background station notifications). Starting a journey turns this on;
  // setting an alert turns both on.
  const [liveTracking, setLiveTracking] = useState(false);
  const [routeSelectionOpened, setRouteSelectionOpened] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    { from: 'Kashmere Gate', to: 'Millennium City Centre Gurugram' },
    { from: 'Rajiv Chowk', to: 'Vaishali' },
    { from: 'Dwarka Sector - 21', to: 'Noida Electronic City' },
  ]);
  const [favourites, setFavourites] = useState([]);
  const [recentStations, setRecentStations] = useState([]);
  const [favouriteStations, setFavouriteStations] = useState([
    'Kashmere Gate', 'Rajiv Chowk', 'Dwarka Sector - 21',
  ]);
  const hydrated = useRef(false);

  // Hydrate persisted state on launch
  useEffect(() => {
    (async () => {
      const [rs, fav, rst, fst] = await Promise.all([
        loadJSON(STORAGE_KEYS.recentSearches, null),
        loadJSON(STORAGE_KEYS.favourites, null),
        loadJSON(STORAGE_KEYS.recentStations, null),
        loadJSON(STORAGE_KEYS.favouriteStations, null),
      ]);
      if (rs) setRecentSearches(rs);
      if (fav) setFavourites(fav);
      if (rst) setRecentStations(rst);
      if (fst) setFavouriteStations(fst);
      hydrated.current = true;
    })();
  }, []);

  // Persist on change (after hydration)
  useEffect(() => { if (hydrated.current) saveJSON(STORAGE_KEYS.recentSearches, recentSearches); }, [recentSearches]);
  useEffect(() => { if (hydrated.current) saveJSON(STORAGE_KEYS.favourites, favourites); }, [favourites]);
  useEffect(() => { if (hydrated.current) saveJSON(STORAGE_KEYS.recentStations, recentStations); }, [recentStations]);
  useEffect(() => { if (hydrated.current) saveJSON(STORAGE_KEYS.favouriteStations, favouriteStations); }, [favouriteStations]);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <TutorialProvider>
        <AppContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedRoute={selectedRoute}
          setSelectedRoute={setSelectedRoute}
          routesFound={routesFound}
          setRoutesFound={setRoutesFound}
          alertActive={alertActive}
          setAlertActive={setAlertActive}
          liveTracking={liveTracking}
          setLiveTracking={setLiveTracking}
          routeSelectionOpened={routeSelectionOpened}
          setRouteSelectionOpened={setRouteSelectionOpened}
          recentSearches={recentSearches}
          setRecentSearches={setRecentSearches}
          favourites={favourites}
          setFavourites={setFavourites}
          recentStations={recentStations}
          setRecentStations={setRecentStations}
          favouriteStations={favouriteStations}
          setFavouriteStations={setFavouriteStations}
        />
        </TutorialProvider>
      </ThemeProvider>
    </SafeAreaProvider>
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
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
  // Bottom tab bar — paddingBottom is applied dynamically via useSafeAreaInsets
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  bottomTab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 16,
  },
  tabPillActive: { backgroundColor: '#FDECEC' },
  tabPillLabel: { fontSize: 14, color: '#E5252B', fontWeight: '700', marginLeft: 8 },
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
    zIndex: -1,
    // paddingTop: normalize(8),
  },
});

export default App;
