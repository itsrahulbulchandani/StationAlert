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
import MapView, {Marker, Polyline, Callout} from 'react-native-maps';
import {
  findAllRoutes2,
  findRoutesWithTransfers,
} from '../utilities/helper';
import CustomMarkerAnimated from './CustomMarkerAnimated';
import { TabContext } from '../App';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native';
import stationsFromKeys from './stationsFromKeys';
import { computeRouteMetrics, getLineInfo, lightenHex } from '../utilities/routeMetrics';

const RED = '#E5252B';
const METRO_LINES = [
  { name: 'Red Line', color: '#CC0000' },
  { name: 'Yellow Line', color: '#F7D117' },
  { name: 'Blue Line', color: '#0000FF' },
  { name: 'Green Line', color: '#008000' },
  { name: 'Violet Line', color: '#8F00FF' },
  { name: 'Pink Line', color: '#FF69B4' },
  { name: 'Magenta Line', color: '#800080' },
  { name: 'Aqua Line', color: '#00FFFF' },
  { name: 'Grey Line', color: '#808080' },
  { name: 'Orange Line', color: '#FFA500' },
];

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
  const [currentZoom, setCurrentZoom] = useState(10);
  const { selectedRoute=[], setSelectedRoute, alertActive, currentCoordinates, setActiveTab, setRoutesFound, setRouteSelectionOpened } = useContext(TabContext);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [viewMode, setViewMode] = useState('route'); // 'route' | 'all'
  const [showLegend, setShowLegend] = useState(false);
  const [hiddenLines, setHiddenLines] = useState([]); // line color hexes hidden on map
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

  const hasRoute = selectedRoute?.path && selectedRoute.path.length > 0;
  const showRoute = viewMode === 'route' && hasRoute;
  const hiddenSet = useMemo(
    () => new Set(hiddenLines.map(c => (c || '').toLowerCase())),
    [hiddenLines],
  );
  const routeMetrics = useMemo(
    () => (hasRoute ? computeRouteMetrics(selectedRoute) : null),
    [hasRoute, selectedRoute],
  );
  const viaName = hasRoute && selectedRoute.interChangeStations?.length
    ? stationsFromKeys[selectedRoute.interChangeStations[0]]
    : null;

  // During an active alert, keep the journey pinned to the route view.
  useEffect(() => {
    if (alertActive) setViewMode('route');
  }, [alertActive]);

  const toggleLine = color => {
    const c = (color || '').toLowerCase();
    setHiddenLines(prev =>
      prev.map(x => x.toLowerCase()).includes(c)
        ? prev.filter(x => x.toLowerCase() !== c)
        : [...prev, c]);
  };

  const zoomBy = async delta => {
    if (!mapRef.current) return;
    try {
      const cam = await mapRef.current.getCamera();
      if (cam.zoom != null) cam.zoom = Math.max(1, cam.zoom + delta);
      if (cam.altitude != null) cam.altitude = delta > 0 ? cam.altitude / 2 : cam.altitude * 2;
      mapRef.current.animateCamera(cam, { duration: 250 });
    } catch (e) {}
  };

  const recenter = () => {
    if (showRoute) {
      const coords = getRouteCoordinates(selectedRoute.path);
      if (coords && mapRef.current) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 160, right: 60, bottom: 220, left: 60 },
          animated: true,
        });
      }
    } else if (mapRef.current) {
      mapRef.current.animateToRegion(initialRegion, 600);
    }
  };

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
      const filePath = Platform.select({
        ios: `${RNFS.MainBundlePath}/shapes_with_colors.txt`,
        android: 'asset:/shapes_with_colors.txt',
      });
      console.log('Attempting to read file from:', filePath);
      const fileContent = await RNFS.readFile(filePath, 'utf8');
      console.log('File read successfully');

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
      console.error('Error details:', error.message);
      console.error('File path attempted:', filePath);
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

  // Effect to update currentLocation when currentCoordinates changes during alert tracking
  useEffect(() => {
    if (alertActive && currentCoordinates) {
      const { latitude, longitude } = currentCoordinates.coords;
      console.log("Updating map with alert tracking coordinates:", { latitude, longitude });
      setCurrentLocation({ latitude, longitude });
      // Auto-follow the user's live position during active journey tracking.
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          { latitude, longitude, latitudeDelta: 0.03, longitudeDelta: 0.03 },
          800,
        );
      }
    }
  }, [alertActive, currentCoordinates]);

  // Station ID ranges for each line
  const routeRanges = {
    red: {start: 1, end: 21},
    blue: {start: 72, end: 121},
    yellow: {start: 36, end: 71},
    green: {start: 22, end: 35},
    violet: {start: 122, end: 148},
    pink: {start: 173, end: 218},
    magenta: {start: 161, end: 172},
    grey: {start: 239, end: 241},
    orange: {start: 154, end: 157},
  };

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
            fontSize: 8,
            fontWeight: 'bold',
            paddingHorizontal: 3,
            paddingVertical: 1,
            borderRadius: 2,
            textAlign: 'center',
            marginBottom: 2,
            maxWidth: 70,
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

  const tabContextRef = useRef();

  // Store the TabContext reference without causing re-renders
  const contextValue = useContext(TabContext);
  useEffect(() => {
    tabContextRef.current = contextValue;
  }, [contextValue]);

  const [mapKey, setMapKey] = useState(0);

  const getCurrentLocation = () => {
    // If alerts are active, use the coordinates from alert tracking
    if (alertActive && tabContextRef.current?.currentCoordinates) {
      const { latitude, longitude } = tabContextRef.current.currentCoordinates.coords;
      console.log("Using coordinates from alert tracking:", { latitude, longitude });
      
      const newLocation = { latitude, longitude };
      setCurrentLocation(newLocation);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);
      }
      return;
    }

    // If alerts are not active or no tracking coordinates available, request new location
    console.log("Getting current location...");
    requestLocationPermission().then(hasPermission => {
      console.log("Location permission:", hasPermission);
      if (hasPermission) {
        hasRequestedLocation.current = true;
        Geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            console.log("Got location:", { latitude, longitude });
            const newLocation = { latitude, longitude };
            
            setCurrentLocation(newLocation);
            
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }, 1000);
            }
          },
          error => {
            console.log("Location error:", error);
            hasRequestedLocation.current = false;
          },
          { 
            enableHighAccuracy: true, 
            timeout: 20000, 
            maximumAge: 1000 
          }
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
              key={mapKey}
              ref={mapRef}
              style={{flex: 1}}
              cameraZoomRange={CameraZoomRange}
              initialRegion={initialRegion}
              preserveClusterData={true}
              moveOnMarkerPress={false}
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
                {Object.entries(shapes).map(([shapeId, coordinates]) => {
                  const col = (coordinates[0]?.shape_color || '').toLowerCase();
                  if (hiddenSet.has(col)) return null;
                  return (
                    <Polyline
                      key={shapeId}
                      coordinates={coordinates}
                      strokeColor={coordinates[0].shape_color}
                      strokeWidth={showRoute ? 2.5 : 4}
                    />
                  );
                })}
                {/* Highlighted selected route, coloured per line segment */}
                {showRoute && (() => {
                  const path = selectedRoute.path;
                  const colorPath = selectedRoute.colorPath || [];
                  const segs = [];
                  let cur = null;
                  path.forEach((id, i) => {
                    const st = memoizedStations.find(s => s.id == id);
                    if (!st) return;
                    const color = getLineInfo(colorPath[i]).color;
                    if (!cur || cur.color !== color) {
                      cur = { color, coords: [] };
                      // connect segments visually
                      if (segs.length) cur.coords.push(segs[segs.length - 1].coords.slice(-1)[0]);
                      segs.push(cur);
                    }
                    cur.coords.push(st.coords);
                  });
                  return segs.map((seg, i) => (
                    <Polyline key={`rseg-${i}`} coordinates={seg.coords} strokeColor={seg.color} strokeWidth={6} />
                  ));
                })()}
                {showRoute ?
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
                  if (hiddenSet.has((marker.color_code || '').toLowerCase())) return null;
                  if (marker.interchange === "TRUE") {
                    return (
                      <Marker
                        key={marker.id}
                        coordinate={marker.coords}
                        anchor={{x: 0.5, y: 0.5}}
                        tracksViewChanges={false}>
                        <View pointerEvents="none">
                          <InterchangeMarker
                            name={marker.name}
                            color={marker.color_code}
                          />
                        </View>
                      </Marker>
                    );
                  }
                  
                  return (
                    <Marker
                      key={marker.id}
                      coordinate={marker.coords}
                      tracksViewChanges={false}>
                      <View pointerEvents="none">
                        <CustomMarker
                          color={marker.color_code}
                          size={6}
                          borderWidth={0.5}
                        />
                      </View>
                      <Callout 
                        tooltip
                        alphaHitTest
                        onPress={(e) => {
                          e.stopPropagation();
                          return false;
                        }}>
                        <SmallCallout text={marker.name} />
                      </Callout>
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
  const MapComponent = useMemo(() => {
    return TestMapScreen();
  }, [shapes, memoizedStations, selectedRoute?.path?.length, isMaxZoom, currentLocation, showRoute, hiddenSet]);

  const handleBackPress = () => {
    setActiveTab('search route');
  };

  const handleViewDetails = () => {
    if (selectedRoute) {
      setRoutesFound([selectedRoute]);
      setRouteSelectionOpened(true);
    }
    setActiveTab('search route');
  };

  return (
    <View style={styles.root}>
      {stationsLoaded && !loading && showMarkers && MapComponent}

      {/* Top header */}
      <SafeAreaView style={styles.topSafe} pointerEvents="box-none">
        <View style={styles.headerBar} pointerEvents="box-none">
          <TouchableOpacity style={styles.circleBtn} onPress={handleBackPress} activeOpacity={0.7}>
            <Icon name="arrow-back" size={22} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Metro Map</Text>
          <TouchableOpacity style={styles.circleBtn} onPress={() => setShowLegend(true)} activeOpacity={0.7}>
            <Icon name="options-outline" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>

        {/* Route summary card */}
        {routeMetrics && (
          <View style={styles.routeCard}>
            <View style={styles.routeCardTop}>
              <View style={styles.routeStations}>
                <View style={styles.routeStationRow}>
                  <View style={[styles.routeDot, {backgroundColor: routeMetrics.startLine.color}]} />
                  <Text style={styles.routeStationName} numberOfLines={1}>{routeMetrics.fromName}</Text>
                  <View style={[styles.miniPill, {backgroundColor: lightenHex(routeMetrics.startLine.color)}]}>
                    <Text style={[styles.miniPillText, {color: routeMetrics.startLine.color}]}>{routeMetrics.startLine.name}</Text>
                  </View>
                </View>
                <View style={styles.routeConnector} />
                <View style={styles.routeStationRow}>
                  <View style={[styles.routeDot, {backgroundColor: routeMetrics.endLine.color}]} />
                  <Text style={styles.routeStationName} numberOfLines={1}>{routeMetrics.toName}</Text>
                  <View style={[styles.miniPill, {backgroundColor: lightenHex(routeMetrics.endLine.color)}]}>
                    <Text style={[styles.miniPillText, {color: routeMetrics.endLine.color}]}>{routeMetrics.endLine.name}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.routeStatsDivider} />
              <View style={styles.routeStats}>
                <View style={styles.routeStat}>
                  <Text style={styles.routeStatValue}>{routeMetrics.durationMin}</Text>
                  <Text style={styles.routeStatLabel}>min</Text>
                </View>
                <View style={styles.routeStat}>
                  <Text style={styles.routeStatValue}>{routeMetrics.interchanges}</Text>
                  <Text style={styles.routeStatLabel}>Interchange</Text>
                </View>
                <View style={styles.routeStat}>
                  <Text style={styles.routeStatValue}>{`₹${routeMetrics.fare}`}</Text>
                  <Text style={styles.routeStatLabel}>Fare</Text>
                </View>
              </View>
            </View>
            <View style={styles.routeCardBottom}>
              {alertActive ? (
                <View style={styles.liveRow}>
                  <View style={styles.liveDotPulse} />
                  <Text style={styles.liveTrackingText}>Live Tracking Active</Text>
                </View>
              ) : (
                <View style={styles.viaRow}>
                  <Icon name="walk" size={16} color="#666" />
                  <Text style={styles.viaText} numberOfLines={1}>{viaName ? `via ${viaName}` : 'Direct route'}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.viewDetailsBtn} onPress={handleViewDetails} activeOpacity={0.7}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Icon name="chevron-forward" size={16} color={RED} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>

      {/* Right-side map controls */}
      <View style={styles.rightControls} pointerEvents="box-none">
        <TouchableOpacity style={styles.controlBtn} onPress={getCurrentLocation} activeOpacity={0.7}>
          <Icon name="locate" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.zoomGroup}>
          <TouchableOpacity style={styles.zoomBtn} onPress={() => zoomBy(1)} activeOpacity={0.7}>
            <Icon name="add" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <View style={styles.zoomDivider} />
          <TouchableOpacity style={styles.zoomBtn} onPress={() => zoomBy(-1)} activeOpacity={0.7}>
            <Icon name="remove" size={24} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom-left Legend / bottom-right Center */}
      <View style={styles.bottomActions} pointerEvents="box-none">
        <TouchableOpacity style={styles.pillBtn} onPress={() => setShowLegend(true)} activeOpacity={0.7}>
          <Icon name="layers-outline" size={18} color="#1A1A1A" />
          <Text style={styles.pillBtnText}>Legend</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pillBtn} onPress={recenter} activeOpacity={0.7}>
          <Icon name="locate" size={18} color={RED} />
          <Text style={[styles.pillBtnText, {color: RED}]}>Center</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom segmented control (All Lines / Route) */}
      <SafeAreaView style={styles.segmentSafe} pointerEvents="box-none">
        <View style={styles.segmentBar}>
          <TouchableOpacity
            style={[styles.segment, viewMode === 'all' && styles.segmentActive, alertActive && styles.segmentDisabled]}
            onPress={() => !alertActive && setViewMode('all')}
            activeOpacity={alertActive ? 1 : 0.7}>
            <Icon name="git-network-outline" size={18} color={viewMode === 'all' ? RED : (alertActive ? '#CCC' : '#777')} />
            <Text style={[styles.segmentText, viewMode === 'all' && styles.segmentTextActive, alertActive && {color: '#CCC'}]}>All Lines</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, viewMode === 'route' && styles.segmentActive, !hasRoute && styles.segmentDisabled]}
            onPress={() => hasRoute && setViewMode('route')}
            activeOpacity={hasRoute ? 0.7 : 1}>
            <Icon name="navigate" size={18} color={viewMode === 'route' ? RED : (hasRoute ? '#777' : '#CCC')} />
            <Text style={[styles.segmentText, viewMode === 'route' && styles.segmentTextActive, !hasRoute && {color: '#CCC'}]}>Route</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Legend / line filter sheet */}
      {showLegend && (
        <View style={styles.legendBackdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setShowLegend(false)} />
          <View style={styles.legendSheet}>
            <View style={styles.legendHandle} />
            <View style={styles.legendHeader}>
              <Text style={styles.legendTitle}>Lines</Text>
              <TouchableOpacity onPress={() => setShowLegend(false)} style={styles.legendClose}>
                <Icon name="close" size={20} color="#444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.legendHint}>Tap a line to show or hide it on the map.</Text>
            {METRO_LINES.map(line => {
              const hidden = hiddenSet.has(line.color.toLowerCase());
              return (
                <TouchableOpacity key={line.color} style={styles.legendRow} onPress={() => toggleLine(line.color)} activeOpacity={0.7}>
                  <View style={[styles.legendDash, {backgroundColor: line.color, opacity: hidden ? 0.3 : 1}]} />
                  <Text style={[styles.legendLineName, hidden && {color: '#BBB'}]}>{line.name}</Text>
                  <Icon name={hidden ? 'eye-off-outline' : 'eye-outline'} size={20} color={hidden ? '#BBB' : RED} />
                </TouchableOpacity>
              );
            })}
            <View style={styles.legendRow}>
              <Icon name="ellipse-outline" size={18} color="#000" style={{marginRight: 10}} />
              <Text style={styles.legendLineName}>Interchange Station</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const SmallCallout = ({ text }) => (
  <View style={{
    backgroundColor: 'white',
    borderRadius: 3,
    padding: 3,
    width: 60,
    borderWidth: 0.5,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  }}>
    <Text style={{
      fontSize: 9,
      color: '#000',
      textAlign: 'center',
      fontWeight: '500',
    }}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#EAEAEA' },
  topSafe: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 },
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  circleBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4,
  },
  routeCard: {
    backgroundColor: '#fff', borderRadius: 18, marginHorizontal: 16, marginTop: 4, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 6,
  },
  routeCardTop: { flexDirection: 'row', alignItems: 'center' },
  routeStations: { flex: 1 },
  routeStationRow: { flexDirection: 'row', alignItems: 'center' },
  routeDot: { width: 11, height: 11, borderRadius: 6, marginRight: 8 },
  routeStationName: { fontSize: 16, fontWeight: '800', color: '#1A1A1A', maxWidth: 130 },
  miniPill: { borderRadius: 7, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 8 },
  miniPillText: { fontSize: 11, fontWeight: '700' },
  routeConnector: { width: 1, height: 12, backgroundColor: '#D5D5D5', marginLeft: 5, marginVertical: 2 },
  routeStatsDivider: { width: 1, height: 44, backgroundColor: '#EEE', marginHorizontal: 12 },
  routeStats: { flexDirection: 'row' },
  routeStat: { alignItems: 'center', marginLeft: 12 },
  routeStatValue: { fontSize: 16, fontWeight: '800', color: '#1A1A1A' },
  routeStatLabel: { fontSize: 11, color: '#9A9A9A', marginTop: 1 },
  routeCardBottom: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: '#F0F0F0', marginTop: 12, paddingTop: 10,
  },
  viaRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  viaText: { fontSize: 14, color: '#555', fontWeight: '600', marginLeft: 8 },
  liveRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  liveDotPulse: { width: 9, height: 9, borderRadius: 5, backgroundColor: RED, marginRight: 8 },
  liveTrackingText: { fontSize: 14, color: RED, fontWeight: '700' },
  viewDetailsBtn: { flexDirection: 'row', alignItems: 'center' },
  viewDetailsText: { color: RED, fontSize: 14, fontWeight: '700', marginRight: 2 },

  rightControls: { position: 'absolute', right: 16, top: '32%', alignItems: 'center', zIndex: 15 },
  controlBtn: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5,
  },
  zoomGroup: {
    backgroundColor: '#fff', borderRadius: 23, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5,
  },
  zoomBtn: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center' },
  zoomDivider: { height: 1, backgroundColor: '#EEE' },

  bottomActions: {
    position: 'absolute', left: 16, right: 16, bottom: 172,
    flexDirection: 'row', justifyContent: 'space-between', zIndex: 15,
  },
  pillBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5,
  },
  pillBtnText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', marginLeft: 8 },

  segmentSafe: { position: 'absolute', left: 0, right: 0, bottom: 96, zIndex: 15 },
  segmentBar: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 22,
    marginHorizontal: 16, marginBottom: 10, padding: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8,
  },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 16 },
  segmentActive: { backgroundColor: '#FDECEC' },
  segmentDisabled: { opacity: 0.6 },
  segmentText: { fontSize: 15, fontWeight: '700', color: '#777', marginLeft: 8 },
  segmentTextActive: { color: RED },

  legendBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end', zIndex: 50 },
  legendSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 36 },
  legendHandle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#D9D9D9', alignSelf: 'center', marginBottom: 10 },
  legendHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  legendTitle: { fontSize: 22, fontWeight: '800', color: '#1A1A1A' },
  legendClose: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F2F2F2', alignItems: 'center', justifyContent: 'center' },
  legendHint: { fontSize: 13, color: '#9A9A9A', marginTop: 4, marginBottom: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F4F4F4' },
  legendDash: { width: 26, height: 5, borderRadius: 3, marginRight: 12 },
  legendLineName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1A1A1A' },

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
