import React, {useState} from 'react';
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

const renderRoute = (routeName, route) => {
    const [selectedRoute, setSelectedRoute] = useState(null);
    const isSelected = selectedRoute === routeName;
    const opacity = isSelected ? 1 : 0.5;

    return (
      <View key={routeName} style={styles.routeContainer}>
        <TouchableOpacity
          onPress={() => setSelectedRoute(routeName)}
          style={styles.routeTouchable}>
          {/* Line connecting stations */}
          <View
            style={[
              styles.routeLine,
              {
                backgroundColor: route.color,
                opacity: opacity,
              },
            ]}
          />
          {/* Stations */}
          {route.stations.map((station, index) => {
            const isInterchange = Object.values(metroRoutes).some(
              (r) => r !== route && r.stations.includes(station),
            );
            const leftPosition = `${(index / (route.stations.length - 1)) * 100}%`;
            
            return (
              <View
                key={station}
                style={[
                  styles.stationContainer,
                  {
                    left: leftPosition,
                  },
                ]}>
                <View
                  style={[
                    styles.station,
                    {
                      width: isInterchange ? 20 : 14,
                      height: isInterchange ? 20 : 14,
                      borderWidth: isInterchange ? 4 : 2,
                      borderColor: route.color,
                      backgroundColor: 'white',
                    },
                  ]}
                />
                <Text style={styles.stationName}>{station}</Text>
              </View>
            );
          })}
        </TouchableOpacity>
      </View>
    );
  };

const RouteMapScreen = () => {
  return (
    <ScrollView style={styles.container}>
        return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.mapContainer}>
        {Object.entries(metroRoutes).map(([routeName, route]) =>
          renderRoute(routeName, route),
        )}
      </ScrollView>
    </SafeAreaView>
  );
    </ScrollView>
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
    errorText: {
      color: '#CC0000',
      marginTop: 20,
      textAlign: 'center',
    },
  });

export default RouteMapScreen; 