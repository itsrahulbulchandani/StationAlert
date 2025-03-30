import {
  GestureHandlerRootView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';
import React, {useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  SafeAreaView,
  Platform,
  Text,
} from 'react-native';
import Svg, {Path, Circle, Text as SvgText} from 'react-native-svg';
import RNFS from 'react-native-fs';
import MapView, {Marker, Polyline} from 'react-native-maps';

const {width, height} = Dimensions.get('window');

const SCALE_FACTOR = 2000;
const convertCoords = (lat, lon) => ({
  latitude: lat,
  longitude: lon,
});

const metroRoutes = {
  red: {
    color: '#CC0000',
    stations: [],
  },
  blue: {
    color: '#0000FF',
    stations: [],
  },
  green: {
    color: '#008000',
    stations: [],
  },
  yellow: {
    color: '#F7D117',
    stations: [],
  },
  violet: {
    color: '#8F00FF',
    stations: [],
  },
  pink: {
    color: '#FF69B4',
    stations: [],
  },
  magenta: {
    color: '#800080',
    stations: [],
  },
  grey: {
    color: '#808080',
    stations: [],
  },
  orange: {
    color: '#FFA500',
    stations: [],
  },
};

// const metroRoutes = {
//   blue: {
//     color: '#0000FF',
//     stations: [
//       {name: 'Dwarka Sector 21', coords: convertCoords(28.552322, 77.056198)},
//       {name: 'Dwarka', coords: convertCoords(28.614899, 77.022629)},
//       {name: 'Dwarka Mor', coords: convertCoords(28.619366, 77.033188)},
//       {name: 'Nawada', coords: convertCoords(28.620222, 77.044991)},
//       {name: 'Uttam Nagar West', coords: convertCoords(28.621672, 77.055664)},
//       {name: 'Uttam Nagar East', coords: convertCoords(28.624643, 77.063126)},
//       {name: 'Janakpuri West', coords: convertCoords(28.629637, 77.077866)},
//       {name: 'Janakpuri East', coords: convertCoords(28.633121, 77.086578)},
//       {name: 'Tilak Nagar', coords: convertCoords(28.636568, 77.096336)},
//       {name: 'Rajouri Garden', coords: convertCoords(28.649157, 77.122749)},
//       {name: 'Ramesh Nagar', coords: convertCoords(28.652809, 77.131462)},
//       {name: 'Moti Nagar', coords: convertCoords(28.657803, 77.140488)},
//       {name: 'Kirti Nagar', coords: convertCoords(28.655773, 77.148499)},
//       {name: 'Shadipur', coords: convertCoords(28.65143, 77.156021)},
//       {name: 'Patel Nagar', coords: convertCoords(28.645037, 77.167046)},
//       {name: 'Rajendra Place', coords: convertCoords(28.64241, 77.191833)},
//       {name: 'Karol Bagh', coords: convertCoords(28.643925, 77.188416)},
//       {name: 'Rajiv Chowk', coords: convertCoords(28.632896, 77.219574)},
//       {name: 'Barakhamba', coords: convertCoords(28.629662, 77.224876)},
//       {name: 'Mandi House', coords: convertCoords(28.625816, 77.234726)},
//       {name: 'Yamuna Bank', coords: convertCoords(28.623178, 77.267937)},
//       {name: 'Laxmi Nagar', coords: convertCoords(28.629843, 77.276428)},
//       {name: 'Nirman Vihar', coords: convertCoords(28.637049, 77.287872)},
//       {name: 'Preet Vihar', coords: convertCoords(28.641352, 77.295158)},
//       {name: 'Karkarduma', coords: convertCoords(28.648653, 77.304581)},
//       {name: 'Anand Vihar', coords: convertCoords(28.647005, 77.316185)},
//       {name: 'Kaushambi', coords: convertCoords(28.645428, 77.322273)},
//       {name: 'Vaishali', coords: convertCoords(28.650059, 77.337608)},
//     ],
//   },
//   // Yellow Line (Line 2)
//   yellow: {
//     color: '#F7D117',
//     stations: [
//       {name: 'Samaypur Badli', coords: convertCoords(28.742872, 77.146545)},
//       {
//         name: 'Rohini Sector 18-19',
//         coords: convertCoords(28.740192, 77.135574),
//       },
//       {
//         name: 'Haiderpur Badli Mor',
//         coords: convertCoords(28.718657, 77.149956),
//       },
//       {name: 'Jahangirpuri', coords: convertCoords(28.72818, 77.16124)},
//       {name: 'Adarsh Nagar', coords: convertCoords(28.696377, 77.208809)},
//       {name: 'Model Town', coords: convertCoords(28.702833, 77.193764)},
//       {name: 'GTB Nagar', coords: convertCoords(28.698195, 77.206985)},
//       {name: 'Vishwavidyalaya', coords: convertCoords(28.694765, 77.212418)},
//       {name: 'Vidhan Sabha', coords: convertCoords(28.687845, 77.221626)},
//       {name: 'Civil Lines', coords: convertCoords(28.676945, 77.224953)},
//       {name: 'Kashmere Gate', coords: convertCoords(28.667879, 77.228012)},
//       {name: 'Chandni Chowk', coords: convertCoords(28.656443, 77.229218)},
//       {name: 'New Delhi', coords: convertCoords(28.642944, 77.222351)},
//       {name: 'Rajiv Chowk', coords: convertCoords(28.632896, 77.219574)},
//       {name: 'Patel Chowk', coords: convertCoords(28.622967, 77.212288)},
//       {
//         name: 'Central Secretariat',
//         coords: convertCoords(28.614973, 77.212029),
//       },
//       {name: 'AIIMS', coords: convertCoords(28.568199, 77.207947)},
//       {name: 'Green Park', coords: convertCoords(28.559853, 77.206902)},
//       {name: 'Hauz Khas', coords: convertCoords(28.543346, 77.206673)},
//       {name: 'Malviya Nagar', coords: convertCoords(28.52817, 77.205612)},
//       {name: 'Saket', coords: convertCoords(28.520638, 77.199379)},
//       {name: 'Qutab Minar', coords: convertCoords(28.512714, 77.185791)},
//       {name: 'Huda City Centre', coords: convertCoords(28.459118, 77.072586)},
//     ],
//   },
//   red: {
//     color: '#CC0000',
//     stations: [
//       {name: 'Rithala', coords: convertCoords(28.720821, 77.105042)},
//       {name: 'Rohini West', coords: convertCoords(28.715008, 77.115746)},
//       {name: 'Rohini East', coords: convertCoords(28.707941, 77.125732)},
//       {name: 'Pitampura', coords: convertCoords(28.70318, 77.132355)},
//       {name: 'Kohat Enclave', coords: convertCoords(28.697943, 77.140465)},
//       {
//         name: 'Netaji Subash Place',
//         coords: convertCoords(28.695637, 77.152428),
//       },
//       {name: 'Keshav Puram', coords: convertCoords(28.688944, 77.161774)},
//       {name: 'Kanhaiya Nagar', coords: convertCoords(28.682386, 77.162552)},
//       {name: 'Inderlok', coords: convertCoords(28.673452, 77.170235)},
//       {name: 'Shastri Nagar', coords: convertCoords(28.670135, 77.181679)},
//       {name: 'Pratap Nagar', coords: convertCoords(28.666632, 77.196869)},
//       {name: 'Pulbangash', coords: convertCoords(28.66571, 77.206329)},
//       {name: 'Tis Hazari', coords: convertCoords(28.667137, 77.216721)},
//       {name: 'Kashmere Gate', coords: convertCoords(28.667879, 77.228012)},
//       {name: 'Shastri Park', coords: convertCoords(28.668451, 77.250404)},
//       {name: 'Seelampur', coords: convertCoords(28.670324, 77.267311)},
//       {name: 'Welcome', coords: convertCoords(28.671986, 77.277931)},
//       {name: 'Shahdara', coords: convertCoords(28.673531, 77.28727)},
//       {name: 'Mansarovar Park', coords: convertCoords(28.675352, 77.301178)},
//       {name: 'Jhilmil', coords: convertCoords(28.675648, 77.312393)},
//       {name: 'Dilshad Garden', coords: convertCoords(28.675991, 77.321495)},
//     ],
//   },

//   // Green Line (Line 5)
//   green: {
//     color: '#008000',
//     stations: [
//       {
//         name: 'Brigadier Hoshiyar Singh',
//         coords: convertCoords(28.697428, 76.919128),
//       },
//       {name: 'Bahadurgarh City', coords: convertCoords(28.690784, 76.935265)},
//       {
//         name: 'Pandit Shree Ram Sharma',
//         coords: convertCoords(28.689213, 76.951088),
//       },
//       {name: 'Tikri Border', coords: convertCoords(28.687876, 76.963783)},
//       {name: 'Tikri Kalan', coords: convertCoords(28.686899, 76.977249)},
//       {name: 'Ghevra', coords: convertCoords(28.685289, 76.993584)},
//       {name: 'Mundka', coords: convertCoords(28.682411, 77.028282)},
//       {name: 'Rajdhani Park', coords: convertCoords(28.682217, 77.043869)},
//       {
//         name: 'Nangloi Railway Station',
//         coords: convertCoords(28.682091, 77.05619),
//       },
//       {name: 'Nangloi', coords: convertCoords(28.682356, 77.064728)},
//       {name: 'Udyog Nagar', coords: convertCoords(28.681047, 77.078674)},
//       {name: 'Peera Garhi', coords: convertCoords(28.67972, 77.092491)},
//       {name: 'Paschim Vihar East', coords: convertCoords(28.677305, 77.112251)},
//       {name: 'Paschim Vihar West', coords: convertCoords(28.678539, 77.102119)},
//       {name: 'Madipur', coords: convertCoords(28.676418, 77.117294)},
//       {name: 'Shivaji Park', coords: convertCoords(28.674965, 77.128258)},
//       {name: 'Punjabi Bagh', coords: convertCoords(28.672943, 77.146011)},
//       {name: 'Ashok Park Main', coords: convertCoords(28.671572, 77.155159)},
//       {name: 'Inderlok', coords: convertCoords(28.673452, 77.170235)},
//     ],
//   },

//   // Violet Line (Line 6)
//   violet: {
//     color: '#8F00FF',
//     stations: [
//       {name: 'Kashmere Gate', coords: convertCoords(28.667879, 77.228012)},
//       {name: 'Lal Quila', coords: convertCoords(28.657576, 77.236595)},
//       {name: 'Jama Masjid', coords: convertCoords(28.650393, 77.237556)},
//       {name: 'Delhi Gate', coords: convertCoords(28.640488, 77.240303)},
//       {name: 'ITO', coords: convertCoords(28.627205, 77.240952)},
//       {name: 'Mandi House', coords: convertCoords(28.625816, 77.234726)},
//       {
//         name: 'Central Secretariat',
//         coords: convertCoords(28.614973, 77.212029),
//       },
//       {name: 'Khan Market', coords: convertCoords(28.602682, 77.228096)},
//       {name: 'JLN Stadium', coords: convertCoords(28.590475, 77.23307)},
//       {name: 'Jangpura', coords: convertCoords(28.583231, 77.239662)},
//       {name: 'Lajpat Nagar', coords: convertCoords(28.570705, 77.233124)},
//       {name: 'Moolchand', coords: convertCoords(28.564629, 77.234222)},
//       {name: 'Kailash Colony', coords: convertCoords(28.554617, 77.239738)},
//       {name: 'Nehru Place', coords: convertCoords(28.551134, 77.251511)},
//       {name: 'Kalkaji Mandir', coords: convertCoords(28.549532, 77.258789)},
//       {name: 'Govind Puri', coords: convertCoords(28.544413, 77.264259)},
//       {name: 'Okhla', coords: convertCoords(28.543194, 77.275955)},
//       {name: 'Jasola', coords: convertCoords(28.538084, 77.285538)},
//       {name: 'Sarita Vihar', coords: convertCoords(28.528622, 77.288345)},
//       {name: 'Mohan Estate', coords: convertCoords(28.51959, 77.294518)},
//       {name: 'Tughlakabad', coords: convertCoords(28.502232, 77.29866)},
//       {name: 'Badarpur', coords: convertCoords(28.4932, 77.30085)},
//       {name: 'Raja Nahar Singh', coords: convertCoords(28.339899, 77.331657)},
//     ],
//   },

//   // Pink Line (Line 7)
//   pink: {
//     color: '#FF69B4',
//     stations: [
//       {name: 'Majlis Park', coords: convertCoords(28.724157, 77.182068)},
//       {name: 'Azadpur', coords: convertCoords(28.707287, 77.179863)},
//       {name: 'Shalimar Bagh', coords: convertCoords(28.70182, 77.165184)},
//       {
//         name: 'Netaji Subash Place',
//         coords: convertCoords(28.695637, 77.152428),
//       },
//       {name: 'Punjabi Bagh West', coords: convertCoords(28.672747, 77.139183)},
//       {name: 'ESI Basai Darapur', coords: convertCoords(28.658159, 77.127319)},
//       {name: 'Rajouri Garden', coords: convertCoords(28.649157, 77.122749)},
//       {name: 'Mayapuri', coords: convertCoords(28.637098, 77.129738)},
//       {name: 'South Campus', coords: convertCoords(28.589376, 77.169518)},
//       {name: 'Lajpat Nagar', coords: convertCoords(28.570705, 77.233124)},
//       {
//         name: 'Mayur Vihar Phase-1',
//         coords: convertCoords(28.606598, 77.296326),
//       },
//       {name: 'Anand Vihar', coords: convertCoords(28.647005, 77.316185)},
//       {name: 'Karkarduma', coords: convertCoords(28.648653, 77.304581)},
//       {name: 'Welcome', coords: convertCoords(28.671986, 77.277931)},
//       {name: 'Shiv Vihar', coords: convertCoords(28.721863, 77.289635)},
//     ],
//   },

//   // Magenta Line (Line 8)
//   magenta: {
//     color: '#800080',
//     stations: [
//       {name: 'Janakpuri West', coords: convertCoords(28.629637, 77.077866)},
//       {
//         name: 'Terminal 1 IGI Airport',
//         coords: convertCoords(28.565275, 77.122391),
//       },
//       {name: 'Hauz Khas', coords: convertCoords(28.543346, 77.206673)},
//       {name: 'Kalkaji Mandir', coords: convertCoords(28.549532, 77.258789)},
//       {name: 'Botanical Garden', coords: convertCoords(28.564198, 77.334656)},
//     ],
//   },

//   // Grey Line (Line 9)
//   grey: {
//     color: '#808080',
//     stations: [
//       {name: 'Dwarka', coords: convertCoords(28.614899, 77.022629)},
//       {name: 'Nangli', coords: convertCoords(28.61722, 77.010345)},
//       {name: 'Najafgarh', coords: convertCoords(28.613316, 76.986259)},
//       {name: 'Dhansa Bus Stand', coords: convertCoords(28.611858, 76.975426)},
//     ],
//   },

//   // Orange Line (Airport Express)
//   orange: {
//     color: '#FFA500',
//     stations: [
//       {name: 'New Delhi', coords: convertCoords(28.642944, 77.222351)},
//       {name: 'Shivaji Stadium', coords: convertCoords(28.629007, 77.209213)},
//       {name: 'Dhaula Kuan', coords: convertCoords(28.591776, 77.161545)},
//       {name: 'Delhi Aerocity', coords: convertCoords(28.548792, 77.120743)},
//       {name: 'IGI Airport', coords: convertCoords(28.554869, 77.087921)},
//       {name: 'Dwarka Sector 21', coords: convertCoords(28.552322, 77.056198)},
//     ],
//   },
// };

// const stations = [
//   { id: 1, name: "Station A", latitude: 37.773972, longitude: -122.431297 },
//   { id: 2, name: "Station B", latitude: 37.783972, longitude: -122.421297 },
//   { id: 3, name: "Station C", latitude: 37.793972, longitude: -122.411297 },
// ];

// Function to generate SVG path between stations
const generateRoutePath = stations => {
  if (stations.length < 2) return '';

  // Start the path at the first station
  let pathCommands = [
    `M${stations[0].coords.x.toFixed(2)} ${stations[0].coords.y.toFixed(2)}`,
  ];

  // Use line to for subsequent stations
  for (let i = 1; i < stations.length; i++) {
    pathCommands.push(
      `L${stations[i].coords.x.toFixed(2)} ${stations[i].coords.y.toFixed(2)}`,
    );
  }

  return pathCommands.join(' ');
};

const RouteMapScreen = () => {
  const [scale, setScale] = useState(2);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [shapes, setShapes] = useState({});
  const [loading, setLoading] = useState(true);
  const [stationsLoaded, setStationsLoaded] = useState(false);
  const [showMarkers, setShowMarkers] = useState(false);
  const [markerData, setMarkerData] = useState([]);

  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  // Dynamically add paths to metro routes
  // const routesWithPaths = Object.fromEntries(
  // Object.entries(metroRoutes).map(([routeName, route]) => [
  //   routeName,
  //   {
  //     ...route,
  //     path: generateRoutePath(route.stations),
  //   },
  // ]),
  // );

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

  const grayscaleMapStyle = [
    {
      elementType: 'all',
      stylerType: 'grayscale',
    },
  ];

  // Function to parse shapes.txt file
  const parseShapesFile = async () => {
    try {
      // Read the shapes.txt file
      const filePath = RNFS.MainBundlePath + '/shapes_with_colors.txt';
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', filePath);
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
          dist,
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
        await Promise.all([parseStopsFile(), parseShapesFile()]);
        setStationsLoaded(true);
        setLoading(false);
        console.log('All data loaded');
      } catch (error) {
        console.error('Error loading data:', error);
        setStationsLoaded(true);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (stationsLoaded && !loading) {
      // Try rendering markers after a slight delay
      // const timer = setTimeout(() => {
      setShowMarkers(true);
      console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~', showMarkers);
      // }, 0);
      // return () => clearTimeout(timer);
    }
  }, [stationsLoaded, loading]);
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
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const [stop_id, , stop_name, , stop_lat, stop_lon] =
          lines[i].split(',');
        if (!stop_name || !stop_lat || !stop_lon) continue;

        const station = {
          name: stop_name,
          coords: convertCoords(parseFloat(stop_lat), parseFloat(stop_lon)),
        };

        const id = parseInt(stop_id);

        // Check each route's range and add the station if it falls within
        Object.entries(routeRanges).forEach(([routeName, range]) => {
          if (id >= range.start && id <= range.end) {
            metroRoutes[routeName].stations.push(station);
          }
        });
      }
      console.log(
        'Stops loaded:',
        Object.entries(metroRoutes).map(
          ([name, route]) => `${name}: ${route.stations.length} stations`,
        ),
      );
    } catch (error) {
      console.error('Error reading stops file:', error);
    }
  };

  const CustomMarker = ({ color, size = 8, borderWidth = 1, borderColor = '#FFFFFF' }) => {
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

  // let data = Object.entries(metroRoutes).map(([routeName, route]) =>
  //   route.stations.map(station => {
  //     return (
  //       <Marker
  //         key={`${routeName}-${station.name}`}
  //         coordinate={station.coords}
  //         title={station.name}
  //         pinColor={route.color}
  //         zIndex={1000}
  //         tracksViewChanges={false}
  //         description={`${routeName.toUpperCase()} Line`}
  //       />
  //     );
  //   }),
  // )

  // console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",data)
  // Color mapping for different routes
  const routeColors = {
    'blue-line': '#0000FF',
    'yellow-line': '#F7D117',
    'red-line': '#CC0000',
    'green-line': '#008000',
    'violet-line': '#8F00FF',
    'pink-line': '#FF69B4',
    'magenta-line': '#800080',
    'grey-line': '#808080',
    'orange-line': '#FFA500',
  };

  console.log(metroRoutes);
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
              customMapStyle={grayscaleMapStyle}
              mapType=""
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
                    strokeWidth={3}
                  />
                ))}
                {markerData.map(marker => (
                  <Marker
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
                  </Marker>
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
            id: `${routeName}-${station.name}`,
            coordinate: station.coords,
            title: station.name,
            description: `${routeName.toUpperCase()} Line`,
            color: route.color || 'red',
          });
        });
      });
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
