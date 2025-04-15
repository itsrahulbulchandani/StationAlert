import React, {createContext, useState} from 'react';
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
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AlertScreen from './components/AlertScreen';
import RouteMapScreen from './components/RouteMapScreen';
import MapScreen from './components/MapScreen';
import SearchRouteScreen from './components/SearchRoutes';
// import { TabProvider, useTab } from './components/context';

// Mock data for metro stations and routes
// const metroRoutes = {
//   purple: {
//     color: '#800080',
//     stations: ['Nehru Nagar', 'Moolchand', 'Kailash Colony', 'Nehru Place', 'Kalkaji Mandir'],
//   },
//   pink: {
//     color: '#FF69B4',
//     stations: ['Kalkaji Mandir', 'Okhla NSIC', 'Sukhdev Vihar', 'Jamia Millia Islamia', 'Jasola Vihar', 'Kalindi Kunj'],
//   },
//   blue: {
//     color: '#0000FF',
//     stations: ['Kalindi Kunj', 'Golf Course'],
//   },
// };
export const TabContext = createContext();
function App() {
  // const [activeTab, setActiveTab] = useState('route'); // 'alert', 'route', or 'map'
  // const [selectedRoute, setSelectedRoute] = useState(null);
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState([]);
    // const { activeTab,setActiveTab } = useTab();
      const [activeTab, setActiveTab] = useState('route');
     


  // const requestLocationPermission = async () => {
  //   //IOS
  //   try{
  //   if (Platform.OS === 'ios') {
  //     try{
  //       if (Platform.OS === 'ios') {
          
  //         Geolocation.requestAuthorization();
  //         Geolocation.getCurrentPosition(
  //           (position) => {
  //               console.log(position);
  //               setCurrentCoordinates(position);
  //           },
  //           (error) => {
  //             console.log("map error: ",error);
  //               console.log(error.code, error.message);
  //           },
  //           { enableHighAccuracy: false, timeout: 15000, maximumAge: 1 }
  //       );
  //       }
  //   }
  //   catch(e){
  //     console.log(e)
  //   }
  //     return;
  //   }


  //   // Android 
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //       {
  //         title: 'Location Permission',
  //         message: 'This app needs access to your location',
  //         buttonNeutral: 'Ask Me Later',
  //         buttonNegative: 'Cancel',
  //         buttonPositive: 'OK',
  //       },
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       getLocation();
  //     } else {
  //       setError('Location permission denied');
  //     }
  //   } catch (err) {
  //     setError('Error requesting location permission');
  //   }
  // };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation(position.coords);
        setError(null);
      },
      error => {
        setError('Error getting location: ' + error.message);
        setLocation(null);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  // const renderRoute = (routeName, route) => {
  //   const isSelected = selectedRoute === routeName;
  //   const opacity = isSelected ? 1 : 0.5;

  //   return (
  //     <View key={routeName} style={styles.routeContainer}>
  //       <TouchableOpacity
  //         onPress={() => setSelectedRoute(routeName)}
  //         style={styles.routeTouchable}>
  //         {/* Line connecting stations */}
  //         <View
  //           style={[
  //             styles.routeLine,
  //             {
  //               backgroundColor: route.color,
  //               opacity: opacity,
  //             },
  //           ]}
  //         />
  //         {/* Stations */}
  //         {route.stations.map((station, index) => {
  //           const isInterchange = Object.values(metroRoutes).some(
  //             (r) => r !== route && r.stations.includes(station),
  //           );
  //           const leftPosition = `${(index / (route.stations.length - 1)) * 100}%`;
            
  //           return (
  //             <View
  //               key={station}
  //               style={[
  //                 styles.stationContainer,
  //                 {
  //                   left: leftPosition,
  //                 },
  //               ]}>
  //               <View
  //                 style={[
  //                   styles.station,
  //                   {
  //                     width: isInterchange ? 20 : 14,
  //                     height: isInterchange ? 20 : 14,
  //                     borderWidth: isInterchange ? 4 : 2,
  //                     borderColor: route.color,
  //                     backgroundColor: 'white',
  //                   },
  //                 ]}
  //               />
  //               <Text style={styles.stationName}>{station}</Text>
  //             </View>
  //           );
  //         })}
  //       </TouchableOpacity>
  //     </View>
  //   );
  // };

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
    <TabContext.Provider value={{activeTab, setActiveTab, setSelectedRoute, selectedRoute}}>
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#CC0000" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Detailed View</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('alert')}
          style={styles.tabButton}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'alert' && styles.activeTab,
            ]}>
            Alert
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('search route')}
          style={styles.tabButton}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'search route' && styles.activeTab,
            ]}>
            Search Route
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('route')}
          style={styles.tabButton}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'route' && styles.activeTab,
            ]}>
            Route Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('map')}
          style={styles.tabButton}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'map' && styles.activeTab,
            ]}>
            Map
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>{renderScreen()}</View>
    </SafeAreaView>
    </TabContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#CC0000',
    padding: 16,
    height:60,
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
  tabButton: {
    flex: 1,
  },
  tabText: {
    padding: 2,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  activeTab: {
    color: '#CC0000',
    borderBottomWidth: 2,
    // textAlign: 'center',
    // width: "50%",
    borderBottomColor: '#CC0000',
  },
  content: {
    flex: 1,
    zIndex:-1
  },
  routeContainer: {
    marginVertical: 0,
    height: 0,
  },
  routeTouchable: {
    position: 'relative',
    height: '10%',
    justifyContent: 'center',
  },
  routeLine: {
    position: 'absolute',
    width: '100%',
    height: 6,
    borderRadius: 3,
    top: '50%',
    marginTop: -3, // Half of height to center the line
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
});

export default App; 