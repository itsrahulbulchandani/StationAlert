import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';
import React, {useState, useRef, useEffect, useContext, useMemo} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import RNFS from 'react-native-fs';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {
  findAllRoutes2,
  findRoutesWithTransfers,
} from '../utilities/helper';
import CustomMarkerAnimated from './CustomMarkerAnimated';
import { TabContext } from '../App';
import Geolocation from '@react-native-community/geolocation';

// const {width, height} = Dimensions.get('window');

// const SCALE_FACTOR = 2000;
const convertCoords = (lat, lon) => ({
  latitude: lat,
  longitude: lon,
});

const RouteMapScreen = () => {
  const [scale, setScale] = useState(2);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [shapes, setShapes] = useState({});
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stationsLoaded, setStationsLoaded] = useState(false);
  const [showMarkers, setShowMarkers] = useState(false);
  const [markerData, setMarkerData] = useState([]);
  const [currentZoom, setCurrentZoom] = useState(10); // Default zoom level
  const { selectedRoute=[], setSelectedRoute } = useContext(TabContext);
  const [currentLocation, setCurrentLocation] = useState(null);
  const mapRef = useRef(null);
  const hasRequestedLocation = useRef(false);
  const hasAnimatedToRoute = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const [initialRegion, setInitialRegion] = useState({
    latitude: 28.6139,
    longitude: 77.209,
    latitudeDelta: 0.4,
    longitudeDelta: 0.4,
  });

  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  // Track if we're at max zoom level (18)
  const isMaxZoom = currentZoom >= 18;

  console.log("currentZoom",isMaxZoom, currentZoom,scale)

  // const onPanGestureEvent = ({nativeEvent}) => {
  //   setTranslateX(lastTranslateX.current + nativeEvent.translationX);
  //   setTranslateY(lastTranslateY.current + nativeEvent.translationY);
  // };

  // const onPanHandlerStateChange = ({nativeEvent}) => {
  //   if (nativeEvent.oldState === State.ACTIVE) {
  //     lastTranslateX.current = translateX;
  //     lastTranslateY.current = translateY;
  //   }
  // };

  // const onPinchGestureEvent = ({nativeEvent}) => {
  //   setScale(lastScale.current * nativeEvent.scale);
  // };

  // const onPinchHandlerStateChange = ({nativeEvent}) => {
  //   if (nativeEvent.oldState === State.ACTIVE) {
  //     lastScale.current = scale;
  //   }
  // };

  // Function to parse shapes.txt file
  const parseShapesFile = async () => {
    try {
      // Read the shapes.txt file
      const filePath = RNFS.MainBundlePath + '/shapes_with_colors.txt';
      const fileContent = await RNFS.readFile(filePath, 'utf8');

      // Parse the content
      const lines = fileContent.split('\n');
      const shapesData = {};

      lines.forEach((line, index) => {
        if (index === 0) return; // Skip header row

        const [
          shape_id,
          shape_pt_lat,
          shape_pt_lon,
          shape_pt_sequence,
          shape_dist_traveled,
          shape_color,
        ] = line.split(',');

        if (!shapesData[shape_id]) {
          shapesData[shape_id] = [];
        }

        shapesData[shape_id].push({
          latitude: parseFloat(shape_pt_lat),
          longitude: parseFloat(shape_pt_lon),
          sequence: parseInt(shape_pt_sequence),
          shape_color: shape_color,
          distance: parseFloat(shape_dist_traveled),
        });
      });

      // Sort coordinates by sequence number
      Object.keys(shapesData).forEach(shapeId => {
        shapesData[shapeId].sort((a, b) => a.sequence - b.sequence);
      });

      setShapes(shapesData);
      setLoading(false);
    } catch (error) {
      console.error('Error reading shapes file:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([parseStopsFile(),parseShapesFile()]);
        setStationsLoaded(true);
        setLoading(false);
        // console.log('All data loaded');
      } catch (error) {
        console.error('Error loading data:', error);
        setStationsLoaded(true);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (stationsLoaded && !loading && markerData?.length > 0) {
      setShowMarkers(true);
    }
  }, [stationsLoaded, loading, markerData]);
  // Station ID ranges for each line
  // const routeRanges = {
  //   red: {start: 1, end: 21},
  //   blue: {start: 72, end: 121},
  //   yellow: {start: 36, end: 71},
  //   green: {start: 22, end: 35},
  //   violet: {start: 122, end: 148},
  //   pink: {start: 173, end: 218},
  //   magenta: {start: 161, end: 172},
  //   grey: {start: 239, end: 241},
  //   orange: {start: 154, end: 157},
  // };

  const parseStopsFile = async () => {
    try {
      const filePath = RNFS.MainBundlePath + '/stops.txt';
      const fileContent = await RNFS.readFile(filePath, 'utf8');

      const lines = fileContent.split('\n');
      let stops = [];
      // let localStations = {}
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const [stop_id, , stop_name, , stop_lat, stop_lon, station_color, color_code, interchange] =
          lines[i].split(',');
        if (!stop_name || !stop_lat || !stop_lon) continue;

        const station = {
          id: parseInt(stop_id),
          name: stop_name,
          color: station_color,
          color_code: color_code,
          interchange: interchange,
          coords: convertCoords(parseFloat(stop_lat), parseFloat(stop_lon)),
        };

        // localStations[stop_name] = {...station}
        const id = parseInt(stop_id);
        stops.push(station);
      }
      setStations(stops);
      // console.log(localStations)

    } catch (error) {
      console.error('Error reading stops file:', error);
    }
  };

  const CustomMarker = ({
    color,
    size = 2,
    borderWidth = 1,
    borderColor = '#FFFFFF',
  }) => {
    return (
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 2,
          borderWidth: borderWidth,
          borderColor: borderColor,
          // Optional: add shadow
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,
          elevation: 3,
        }}
      />
    );
  };

  // Modern interchange station marker with name
  const InterchangeMarker = ({ name, color }) => {
    return (
      <View style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {!isMaxZoom && (
          <Text style={{
            color: '#000',
            backgroundColor: 'rgba(255,255,255,0.85)',
            fontSize: 10,
            fontWeight: 'bold',
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 3,
            textAlign: 'center',
            marginBottom: 3,
            maxWidth: 90,
            overflow: 'hidden',
          }}>
            {name}
          </Text>
        )}
        <View style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          borderWidth: 2,
          borderColor: '#000',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.25,
          shadowRadius: 2,
          elevation: 4,
        }} />
      </View>
    );
  };

  // console.log("Animated Custom Marker", shortestPath)

  // const routeColors = {
  //   'blue-line': '#0000FF',
  //   'yellow-line': '#F7D117',
  //   'red-line': '#CC0000',
  //   'green-line': '#008000',
  //   'violet-line': '#8F00FF',
  //   'pink-line': '#FF69B4',
  //   'magenta-line': '#800080',
  //   'grey-line': '#808080',
  //   'orange-line': '#FFA500',
  // };

  
  const CameraZoomRange = {
    minCenterCoordinateDistance: 10000, // Minimum distance (more zoomed in)
    maxCenterCoordinateDistance: 60000, // Maximum distance (more zoomed out)
    animated: true // Animate the change in zoom limits
  };

  // const onRegionChangeComplete = (region) => {
  //   // Calculate an approximate scale value based on latitudeDelta
  //   // Lower latitudeDelta = higher zoom = larger scale
  //   const approximateScale = 1 / region.latitudeDelta * 100;
  //   setScale(approximateScale.toFixed(2));
  // };
  
  console.log("scale",scale)

  // Memoize stations to prevent unnecessary re-renders
  const memoizedStations = useMemo(() => {
    return stations;
  }, [stations]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
      return true;
    }

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "This app needs access to your location",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getCurrentLocation = () => {
    console.log("Getting current location...");
    requestLocationPermission().then(hasPermission => {
      console.log("Location permission:", hasPermission);
      if (hasPermission) {
        hasRequestedLocation.current = true;
        
        // Watch for location updates instead of just getting once
        const watchId = Geolocation.watchPosition(
          position => {
            const { latitude, longitude } = position.coords;
            console.log("Got location:", { latitude, longitude });
            const newLocation = { latitude, longitude };
            
            // First set the location
            setCurrentLocation(newLocation);
            
            // Then animate to it after a short delay to ensure state is updated
            requestAnimationFrame(() => {
              mapRef.current?.animateToRegion({
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }, 1000);
            });

            // Clear the watch after successful location
            Geolocation.clearWatch(watchId);
          },
          error => {
            console.log("Location error:", error);
            hasRequestedLocation.current = false;
            
            // Handle specific error cases
            let errorMessage = "Unable to get your location. ";
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMessage += "Please enable location permissions in your device settings.";
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage += "Location service is not available. Please check if your device's location is turned on.";
                break;
              case error.TIMEOUT:
                errorMessage += "Location request timed out. Please try again.";
                break;
              default:
                errorMessage += "Please try again later.";
            }
            
            // You can add Alert.alert here to show error to user
            Alert.alert("Location Error", errorMessage);
          },
          { 
            enableHighAccuracy: false, // Set to false for faster response
            timeout: 10000, // Reduced timeout to 10 seconds
            maximumAge: 5000, // Allow locations up to 5 seconds old
            distanceFilter: 10 // Update if device moves by 10 meters
          }
        );
      } else {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to show your position on the map. Please enable it in settings.",
          [
            { text: "OK", onPress: () => console.log("OK Pressed") }
          ]
        );
      }
    });
  };

  // Function to get route coordinates
  const getRouteCoordinates = (routePath) => {
    if (!routePath || !memoizedStations) return null;

    const coordinates = routePath.map(stationId => {
      const station = memoizedStations.find(s => s.id == stationId);
      return station ? station.coords : null;
    }).filter(coord => coord !== null);

    console.log('Route coordinates:', coordinates);
    return coordinates.length > 0 ? coordinates : null;
  };

  // Effect to animate to route when selected
  useEffect(() => {
    if (selectedRoute?.path && selectedRoute?.path?.length > 0 && mapReady) {
      console.log('Selected route changed, path:', selectedRoute.path);
      const coordinates = getRouteCoordinates(selectedRoute.path);
      
      if (coordinates && mapRef.current) {
        console.log('Attempting to fit coordinates');
        // Add a small delay to ensure map is ready
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
            duration: 1000
          });
        }, 500);
      }
    }
  }, [selectedRoute?.path, mapReady]);

  const TestMapScreen = () => {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <PinchGestureHandler>
          <PanGestureHandler>
            <MapView
              ref={mapRef}
              style={{flex: 1, margin: 10}}
              cameraZoomRange={CameraZoomRange}
              initialRegion={initialRegion}
              onMapReady={() => {
                console.log('Map is ready');
                setMapReady(true);
              }}
            >
              <>
                {currentLocation && (
                  <Marker
                    coordinate={currentLocation}
                    title="You are here"
                    description="Your current location"
                  >
                    <View style={styles.currentLocationMarker}>
                      <View style={styles.currentLocationInner} />
                    </View>
                  </Marker>
                )}
                {Object.entries(shapes).map(([shapeId, coordinates]) => (
                  <Polyline
                    key={shapeId}
                    coordinates={coordinates}
                    strokeColor={coordinates[0].shape_color}
                    strokeWidth={4}
                  />
                ))}
                {selectedRoute?.path && selectedRoute?.path?.length > 0 ? 
                 (
                  selectedRoute?.path?.map((marker,index) =>{
                    let stationFound = memoizedStations?.find(
                      p => marker == p.id
                    )
                    if (stationFound) {
                      return (
                        <Marker
                          index={index}
                          key={stationFound.id}
                          coordinate={stationFound.coords}
                          title={stationFound.name}
                          pinColor={"#000000"}>
                          <CustomMarkerAnimated
                            color={"red"}
                            size={12}
                            borderWidth={2}
                            borderColor="#000000"
                            index={index}
                            totalMarkers={selectedRoute?.path?.length || 1}
                          />
                        </Marker>
                      );
                    }
                    return null;
                  })
                ) : 
                memoizedStations.map(marker => {
                  if (marker.interchange === "TRUE") {
                    return (
                      <Marker
                        key={marker.id}
                        coordinate={marker.coords}
                        title={marker.name}
                        anchor={{x: 0.5, y: 0.5}}>
                        <InterchangeMarker
                          name={marker.name}
                          color={marker.color_code}
                        />
                      </Marker>
                    );
                  }
                  
                  return (
                    <Marker
                      key={marker.id}
                      coordinate={marker.coords}
                      title={marker.name}
                      pinColor={marker.color_code}>
                      <CustomMarker
                        color={marker.color_code}
                        size={6}
                        borderWidth={0.5}
                      />
                    </Marker>
                  );
                })
                }
              </>
            </MapView>
          </PanGestureHandler>
        </PinchGestureHandler>
      </GestureHandlerRootView>
    );
  };

  useEffect(() => {
    if (stationsLoaded && !loading) {
      // Process your data into a format ready for markers
      const markers = [];
     
      setMarkerData(memoizedStations);
    }
  }, [stationsLoaded, loading, memoizedStations]);

  // Memoize the TestMapScreen component to prevent unnecessary re-renders
  const MemoizedTestMapScreen = useMemo(() => {
    return TestMapScreen();
  }, [shapes, memoizedStations, selectedRoute?.path?.length, isMaxZoom, currentLocation]);

  const handleClearRoute = () => {
    if (setSelectedRoute) {
      setSelectedRoute([]); // Clear the selected route
      hasAnimatedToRoute.current = false; // Reset the animation flag
      // Force rerender by updating showMarkers
      setShowMarkers(false);
      setTimeout(() => {
        setShowMarkers(true);
      }, 50);
    }
  };

  return (
    <>
      <View style={styles.headerSpace} />
      {stationsLoaded && !loading && showMarkers && (
        <TestMapScreen />
      )}
      <TouchableOpacity 
        style={styles.locationButton}
        onPress={getCurrentLocation}
        activeOpacity={0.7}
      >
        <Text style={styles.locationButtonText}>📍</Text>
      </TouchableOpacity>
      {selectedRoute?.path && selectedRoute?.path?.length > 0 && (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClearRoute}
          activeOpacity={0.7}
        >
          <Text style={styles.clearButtonText}>Clear Route</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 10,
  },
  headerSpace: {
    height: 1,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  clearButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  locationButton: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
  locationButtonText: {
    fontSize: 24,
  },
  currentLocationMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    borderWidth: 2,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  currentLocationInner: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#2196F3',
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default RouteMapScreen;
