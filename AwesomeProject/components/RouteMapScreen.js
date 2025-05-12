import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';
import React, {useState, useRef, useEffect, useContext} from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import RNFS from 'react-native-fs';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {
  findAllRoutes2,
  findRoutesWithTransfers,
} from '../utilities/helper';
import CustomMarkerAnimated from './CustomMarkerAnimated';
import { TabContext } from '../App';

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
  const { selectedRoute=[] } = useContext(TabContext);

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
      console.log(localStations)

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

  const TestMapScreen = () => {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <PinchGestureHandler>
          {/* // onGestureEvent={onPinchGestureEvent} */}
          {/* // onHandlerStateChange={onPinchHandlerStateChange}> */}
          <PanGestureHandler>
            {/* // onGestureEvent={onPanGestureEvent} */}
            {/* // onHandlerStateChange={onPanHandlerStateChange}> */}
            <MapView
              style={{flex: 1}}
              cameraZoomRange={CameraZoomRange}
              // onRegionChangeComplete={onRegionChangeComplete}
              initialRegion={{
                latitude: 28.6139,
                longitude: 77.209,
                latitudeDelta: 0.4,
                longitudeDelta: 0.4,
              }}>
              <>
                <Marker
                  key={"test"}
                  coordinate={{
                    latitude: 28.650059,
                    longitude: 77.337608,}}
                  title={"testing data"}
                  style={{width:"200px"}}
                  pinColor={"#fff"}>
                    <CustomMarker
                      size={4}
                      borderWidth={0.5}
                    />
                </Marker>
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
                    let stationFound =stations?.find(
                      p => marker.toLowerCase().replace(/\s+/g, '') === p.name.toLowerCase().replace(/\s+/g, '')
                    )
                    if (stationFound) {
                      // Special handling for interchange stations only
                      // if (marker.interchange === "TRUE") {
                      //   return (
                      //     <Marker
                      //       key={marker.id}
                      //       coordinate={marker.coords}
                      //       title={marker.name}
                      //       anchor={{x: 0.5, y: 0.5}}>
                      //       <InterchangeMarker
                      //         name={marker.name}
                      //         color={marker.color_code}
                      //       />
                      //     </Marker>
                      //   );
                      // }

                      // Keep existing behavior for all other stations
                      let x = selectedRoute?.path?.indexOf(marker.name);
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
                stations.map(marker => {
                  // Only modify interchange stations
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
                  
                  // Keep existing behavior for all other stations
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
     
      setMarkerData(stations);
    }
  }, [stationsLoaded, loading]);

  return (
    <>
      <View style={styles.headerSpace} />
      {stationsLoaded && !loading && showMarkers && TestMapScreen()}
      {/* {stationsLoaded && !loading && TestMapScreen()} */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerSpace: {
    height: 1,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default RouteMapScreen;
