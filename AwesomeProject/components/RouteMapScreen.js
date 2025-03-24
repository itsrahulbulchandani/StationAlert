import React, {useState, useEffect} from 'react';
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
  Dimensions,
} from 'react-native';
import RNFS from 'react-native-fs';
// This works for static files in your project
// const shapesData = require('../assets/shapes.txt');

const metroRoutes = {
    purple: {
      color: '#800080',
      stations: ['Nehru Nagar', 'Moolchand', 'Kailash Colony', 'Nehru Place', 'Kalkaji Mandir'],
    },
    pink: {
      color: '#FF69B4',
      stations: ['Kalkaji Mandir', 'Okhla NSIC', 'Sukhdev Vihar', 'Jamia Millia Islamia', 'Jasola Vihar', 'Kalindi Kunj'],
    },
    blue: {
      color: '#0000FF',
      stations: ['Kalindi Kunj', 'Golf Course'],
    },
  };


// Helper function to convert GPS coordinates to screen coordinates
const convertToScreenCoords = (lat, lon, bounds) => {
  const width = Dimensions.get('window').width - 4; // Accounting for padding
  const height = Dimensions.get('window').height - 100; // Fixed height for the route display

  const latRange = bounds.maxLat - bounds.minLat;
  const lonRange = bounds.maxLon - bounds.minLon;

  const x = ((lon - bounds.minLon) / lonRange) * width;
  const y = ((bounds.maxLat - lat) / latRange) * height;

  return {x, y};
};

const renderRoute = (routeName, route, bounds) => {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const isSelected = selectedRoute === routeName;
  const opacity = isSelected ? 1 : 0.5;

  // Convert shape coordinates to path
  const points = route.map(point => 
    convertToScreenCoords(point.lat, point.lon, bounds)
  );

  return (
    <View key={routeName} style={styles.routeContainer}>
      <TouchableOpacity
        onPress={() => setSelectedRoute(routeName)}
        style={styles.routeTouchable}>
        {/* Custom SVG or connected line segments to draw the actual route shape */}
        <View style={[styles.routePath, { opacity }]}>
          {points.map((point, index) => (
            <View
              key={index}
              style={[
                styles.pathPoint,
                {
                  left: point.x,
                  top: point.y,
                }
              ]}
            />
          ))}
        </View>
        
        {/* Add stations at important points */}
        {route.stations && route.stations.map((station, index) => (
          <View
            key={station}
            style={[
              styles.stationContainer,
              {
                left: points[index].x,
                top: points[index].y,
              },
            ]}>
            <View style={styles.station} />
            <Text style={styles.stationName}>{station}</Text>
          </View>
        ))}
      </TouchableOpacity>
    </View>
  );
};

const parseShapesData = (shapesText) => {
  const lines = shapesText.split('\n');
  const shapes = {};
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const [shapeId, lat, lon, sequence, distance] = line.split(',');
    
    if (!shapes[shapeId]) {
      shapes[shapeId] = [];
    }
    
    shapes[shapeId].push({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      sequence: parseInt(sequence),
      distance: parseFloat(distance)
    });
  }
  
  // Sort points by sequence number for each shape
  for (const shapeId in shapes) {
    shapes[shapeId].sort((a, b) => a.sequence - b.sequence);
  }
  
  return shapes;
};

// Function to calculate bounds for all shapes
const calculateBounds = (shapes) => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  Object.values(shapes).forEach(points => {
    points.forEach(point => {
      minLat = Math.min(minLat, point.lat);
      maxLat = Math.max(maxLat, point.lat);
      minLon = Math.min(minLon, point.lon);
      maxLon = Math.max(maxLon, point.lon);
    });
  });

  return { minLat, maxLat, minLon, maxLon };
};

const RouteMapScreen = () => {
  const [shapesData, setShapesData] = useState(null);
  const [bounds, setBounds] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  

  useEffect(() => {
    const loadShapesFile = async () => {
      try {
        // For Android
        const androidPath = `${RNFS.DocumentDirectoryPath}/shapes.txt`;
        
        // For iOS
        const iosPath = `${RNFS.MainBundlePath}/shapes.txt`;

        // Choose the appropriate path based on platform
        const filePath = Platform.OS === 'ios' ? iosPath : androidPath;

        // Read the file contents
        const fileContents = await RNFS.readFile(filePath, 'utf8');
        
        // Parse the shapes data
        const parsed = parseShapesData(fileContents);
        
        // Set the state
        setShapesData(parsed);
        setBounds(calculateBounds(parsed));
      } catch (error) {
        console.error('Error loading shapes:', error);
      }
    };

    loadShapesFile();
  }, []);

  console.log(shapesData , 'shapesData', bounds, 'bounds')


  const renderRoute = (shapeId, route) => {
    const isSelected = selectedRoute === shapeId;
    const opacity = isSelected ? 1 : 0.5;

    // Convert shape coordinates to path
    const points = route.map(point => 
      convertToScreenCoords(point.lat, point.lon, bounds)
    );

    return (
      <TouchableOpacity
        key={shapeId}
        onPress={() => setSelectedRoute(shapeId)}
        style={styles.routeContainer}>
        <View style={[styles.routePath, { opacity }]}>
          {points.map((point, index) => (
            <View
              key={index}
              style={[
                styles.pathPoint,
                {
                  left: point.x,
                  top: point.y,
                  width: 10,  // Increased from 2 to 8
                height: 10, // Increased from 2 to 8
                borderRadius: 4, // Make it circular
                }
              ]}
            />
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  if (!shapesData || !bounds) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.mapContainer}>
        {Object.entries(shapesData).map(([shapeId, points]) =>
          renderRoute(shapeId, points)
        )}
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
    mapContainer: {
      flex: 1,
      padding: 20,
    },
    routeContainer: {
      marginVertical: 40,
      height: 80,
    },
    routeTouchable: {
      position: 'relative',
      height: '100%',
      justifyContent: 'center',
    },
    routePath: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    pathPoint: {
      position: 'absolute',
      width: 2,
      height: 2,
      backgroundColor: '#800080',
    },
    stationContainer: {
      position: 'absolute',
      alignItems: 'center',
      top: '50%',
      transform: [{translateY: -10}], // Half of station height to center
    },
    station: {
      borderRadius: 10,
      zIndex: 1, // Ensure stations appear above the line
    },
    stationName: {
      fontSize: 12,
      transform: [{rotate: '-45deg'}],
      position: 'absolute',
      top: 20,
      width: 100,
      left: -25,
    },
    errorText: {
      color: '#CC0000',
      marginTop: 20,
      textAlign: 'center',
    },
  });

export default RouteMapScreen; 