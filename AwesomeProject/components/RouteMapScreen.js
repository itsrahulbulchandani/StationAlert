import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';
import React, {useState, useRef, useEffect, useContext} from 'react';
import {graph, colorLines} from './graph';
import {
  StyleSheet,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import MapView, {Marker, Polyline} from 'react-native-maps';
import {
  findAllRoutes2,
  findRoutesWithTransfers,
} from '../utilities/helper';
import CustomMarkerAnimated from './CustomMarkerAnimated';
import {metroRoutes} from './metroRoutes';
import { TabContext } from '../App';

// const {width, height} = Dimensions.get('window');

// const SCALE_FACTOR = 2000;
// const convertCoords = (lat, lon) => ({
//   latitude: lat,
//   longitude: lon,
// });

// const metroRoutes = {
//   red: {
//     color: '#CC0000',
//     stations: [],
//   },
//   blue: {
//     color: '#0000FF',
//     stations: [],
//   },
//   green: {
//     color: '#008000',
//     stations: [],
//   },
//   yellow: {
//     color: '#F7D117',
//     stations: [],
//   },
//   violet: {
//     color: '#8F00FF',
//     stations: [],
//   },
//   pink: {
//     color: '#FF69B4',
//     stations: [],
//   },
//   magenta: {
//     color: '#800080',
//     stations: [],
//   },
//   grey: {
//     color: '#808080',
//     stations: [],
//   },
//   orange: {
//     color: '#FFA500',
//     stations: [],
//   },
// };

const RouteMapScreen = () => {
  const [scale, setScale] = useState(2);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [shapes, setShapes] = useState({});
  const [loading, setLoading] = useState(true);
  const [stationsLoaded, setStationsLoaded] = useState(false);
  const [showMarkers, setShowMarkers] = useState(false);
  const [markerData, setMarkerData] = useState([]);
  const { selectedRoute=[] } = useContext(TabContext);

  console.log("testing the selected route",selectedRoute);

  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  // const [shortestPath] = useState([]);

  // // Call this function when user selects two stations

  const onPanGestureEvent = ({nativeEvent}) => {
    setTranslateX(lastTranslateX.current + nativeEvent.translationX);
    setTranslateY(lastTranslateY.current + nativeEvent.translationY);
  };

  const onPanHandlerStateChange = ({nativeEvent}) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      lastTranslateX.current = translateX;
      lastTranslateY.current = translateY;
    }
  };

  const onPinchGestureEvent = ({nativeEvent}) => {
    setScale(lastScale.current * nativeEvent.scale);
  };

  const onPinchHandlerStateChange = ({nativeEvent}) => {
    if (nativeEvent.oldState === State.ACTIVE) {
      lastScale.current = scale;
    }
  };


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
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const [stop_id, , stop_name, , stop_lat, stop_lon] =
          lines[i].split(',');
        if (!stop_name || !stop_lat || !stop_lon) continue;

        // const station = {
        //   name: stop_name,
        //   coords: convertCoords(parseFloat(stop_lat), parseFloat(stop_lon)),
        // };

        const id = parseInt(stop_id);
        stops.push(stop_name);
        // Check each route's range and add the station if it falls within
        // Object.entries(routeRanges).forEach(([routeName, range]) => {
        //   if (id >= range.start && id <= range.end) {
        //     metroRoutes[routeName].stations.push(station);
        //   }
        // });
      }
      console.log("Parsed stops:", stops);
    } catch (error) {
      console.error('Error reading stops file:', error);
    }
  };

  const CustomMarker = ({
    color,
    size = 8,
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

  const TestMapScreen = () => {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <PinchGestureHandler
          onGestureEvent={onPinchGestureEvent}
          onHandlerStateChange={onPinchHandlerStateChange}>
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanHandlerStateChange}>
            {/* {TestMapScreen()} */}
            <MapView
              style={{flex: 1}}
              initialRegion={{
                latitude: 28.6139,
                longitude: 77.209,
                latitudeDelta: 0.4,
                longitudeDelta: 0.4,
              }}>
              <>
                {Object.entries(shapes).map(([shapeId, coordinates]) => (
                  <Polyline
                    key={shapeId}
                    coordinates={coordinates}
                    strokeColor={coordinates[0].shape_color}
                    strokeWidth={4}
                  />
                ))}
                {markerData.map(marker => (
                  (selectedRoute && selectedRoute?.path?.length > 0 ?
                    selectedRoute?.path?.includes(marker.title) ? <Marker
                    key={marker.id}
                    coordinate={marker.coordinate}
                    title={marker.title}
                    description={marker.description}
                    pinColor={marker.color}>
                      <CustomMarkerAnimated
                        color={'#FF0000'}
                        size={10} // Make it even smaller
                        borderWidth={1} // Thinner border
                      />
                  </Marker>: null : <Marker
                    key={marker.id}
                    coordinate={marker.coordinate}
                    title={marker.title}
                    description={marker.description}
                    pinColor={marker.color}>
                      <CustomMarker
                        color={marker.color}
                        size={6} // Make it even smaller
                        borderWidth={0.5} // Thinner border
                      />
                  </Marker>)
                ))}
              </>
              {/* )} */}
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
      Object.entries(metroRoutes).forEach(([routeName, route]) => {
        route.stations.forEach(station => {
          markers.push({
            id: `${station.name}`,
            coordinate: station.coords,
            title: station.name,
            description: `${routeName.toUpperCase()} Line`,
            color: route.color || 'red',
          });
        });
      });
      // console.log("testing one two three",stationColor);
      setMarkerData(markers);
    }
  }, [stationsLoaded, loading, metroRoutes]);

  return (
    <>
      <View style={styles.headerSpace} />
      {stationsLoaded && !loading && showMarkers && TestMapScreen()}
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
