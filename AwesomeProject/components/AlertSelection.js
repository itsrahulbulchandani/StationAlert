import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Image,
  StatusBar,
} from 'react-native';
import { TabContext } from '../App';
import { useTheme } from '../src/context/ThemeContext';
import stationsFromKeys from './stationsFromKeys';
import CustomMarkerAnimated from './CustomMarkerAnimated';

const AlertSelection = ({ route, onClose }) => {
  const { theme } = useTheme();
  const [selectedStationIndex, setSelectedStationIndex] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [travelDirection, setTravelDirection] = useState('forward'); // 'forward' or 'backward'
  const [lastPosition, setLastPosition] = useState(null);
  const tabContextRef = useRef();
  const { 
    currentCoordinates, 
    userBetweenStations, 
    setUserBetweenStations,
    nearestStationIndices,
    setNearestStationIndices,
    alertActive,
    setCurrentCoordinates
  } = useContext(TabContext);
  
  // Animation values for user location indicator
  const userLocationAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  
  // Store the TabContext reference without causing re-renders
  const contextValue = useContext(TabContext);
  useEffect(() => {
    tabContextRef.current = contextValue;
  }, [contextValue]);
  
  // Setup pulse animation
  useEffect(() => {
    // Create pulse animation sequence
    const createPulseAnimation = () => {
      return Animated.sequence([
        // Grow and fade out
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false
        }),
        // Reset immediately
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false
        })
      ]);
    };
    
    // Start looping animation if user is between stations
    if (userBetweenStations) {
      Animated.loop(createPulseAnimation()).start();
    }
    
    return () => {
      // Clean up animation
      pulseAnim.stopAnimation();
    };
  }, [userBetweenStations, pulseAnim]);
  

  
  // Find the nearest station to current location when component mounts or when coordinates change
  useEffect(() => {
    if (currentCoordinates && route?.path) {
      const { nearestIndex, isBetweenStations, prevIndex, nextIndex, progressRatio } = findNearestUpcomingStation(currentCoordinates, route.path);
      
      console.log('Location update:', { 
        nearestIndex, 
        prevIndex, 
        nextIndex, 
        progressRatio, 
        coords: currentCoordinates.coords 
      });
      
      if (nearestIndex !== -1) {
        setSelectedStationIndex(nearestIndex);
        
        // Update between stations status - force to true to always show
        setUserBetweenStations(true);
        
        // Make sure we have valid indices
        if (prevIndex !== null && nextIndex !== null) {
          setNearestStationIndices({ prev: prevIndex, next: nextIndex });
          
          // Always animate user location indicator with the calculated progress ratio
          if (progressRatio !== undefined) {
            console.log('Animating dot to position:', progressRatio);
            
            // Cancel any running animations first
            userLocationAnim.stopAnimation();
            
            // Start new animation
            Animated.timing(userLocationAnim, {
              toValue: progressRatio,
              duration: 300, // Faster for more responsive updates
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
            }).start();
          }
        }
      }
    }
  }, [currentCoordinates, route, setUserBetweenStations, setNearestStationIndices]);
  
  // Process coordinates when they change
  useEffect(() => {
    if (currentCoordinates && route?.path) {
      // Process location updates from currentCoordinates
      const position = currentCoordinates;
      if (!position || !position.coords) return;
      
      const { latitude, longitude } = position.coords;
      console.log("DEBUG: Using coordinates:", { latitude, longitude });
      
      // Calculate user's position on the route
      const result = calculateUserPositionOnRoute(position, route.path);
      console.log("DEBUG: Position calculation result:", result);
      
      // Determine travel direction if we have a previous position
      if (lastPosition) {
        // Determine direction based on progress along the route
        if (result.prevStation && result.nextStation) {
          const lastResult = calculateUserPositionOnRoute(lastPosition, route.path);
          
          // If progress changed significantly
          if (Math.abs(result.progressRatio - (lastResult.progressRatio || 0)) > 0.01) {
            if (result.progressRatio > lastResult.progressRatio) {
              setTravelDirection('forward');
              console.log("DEBUG: Moving forward");
            } else {
              setTravelDirection('backward');
              console.log("DEBUG: Moving backward");
            }
          }
        }
      }
      
      // Always update UI with the new position
      if (result.prevStation !== undefined && result.nextStation !== undefined) {
        // Set the previous station as the selected one
        setSelectedStationIndex(result.prevStation);
        
        // Always show position
        setUserBetweenStations(true);
        
        // Update station indices
        setNearestStationIndices({ 
          prev: result.prevStation, 
          next: result.nextStation 
        });
        
        console.log("DEBUG: Setting station indices:", { 
          prev: result.prevStation, 
          next: result.nextStation,
          progress: result.progressRatio 
        });
        
        // Always animate user location indicator with the calculated progress ratio
        if (result.progressRatio !== undefined) {
          console.log('DEBUG: Animating dot to position:', result.progressRatio);
          
          // Cancel any running animations first
          userLocationAnim.stopAnimation();
          
          // Start new animation
          Animated.timing(userLocationAnim, {
            toValue: result.progressRatio,
            duration: 200, // Faster for more responsive updates
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }).start();
        }
      }
      
      setLastPosition(position);
      setCurrentLocation({ latitude, longitude });
    }
  }, [currentCoordinates, route]);
  


  // Calculate user's position on the route
  const calculateUserPositionOnRoute = (currentLocation, routePath) => {
    if (!currentLocation || !routePath || routePath.length < 2) {
      return { 
        prevStation: 0, 
        nextStation: 1, 
        progressRatio: 0 
      };
    }
    
    // Get the actual station coordinates for the route
    const stationCoordinates = [];
    for (let i = 0; i < routePath.length; i++) {
      const stationId = routePath[i];
      
      // In a real implementation, use actual station coordinates
      // This is a simplified example using hardcoded values for the specific route
      // Dilshad Garden to Shastri Park route
      let stationCoords;
      
      // Hardcoded coordinates for the Delhi Metro Red Line stations from Dilshad Garden to Shastri Park
      const stationPositions = {
        // These are approximate coordinates - replace with actual values
        'dilshad_garden': { latitude: 28.6725, longitude: 77.3215 },
        'jhilmil': { latitude: 28.6686, longitude: 77.3149 },
        'mansarovar_park': { latitude: 28.6633, longitude: 77.3066 },
        'shahdara': { latitude: 28.6667, longitude: 77.2903 },
        'welcome': { latitude: 28.6681, longitude: 77.2786 },
        'seelampur': { latitude: 28.6691, longitude: 77.2658 },
        'shastri_park': { latitude: 28.6677, longitude: 77.2511 },
      };
      
      // Map station IDs to the hardcoded positions
      // This is a placeholder - in a real app, you'd have a proper mapping
      const stationMap = {
        '1': 'dilshad_garden',
        '2': 'jhilmil',
        '3': 'mansarovar_park',
        '4': 'shahdara',
        '5': 'welcome',
        '6': 'seelampur',
        '7': 'shastri_park',
      };
      
      const stationKey = stationMap[stationId] || `station_${stationId}`;
      stationCoords = stationPositions[stationKey] || {
        // Fallback to dummy coordinates if station not found
        latitude: 28.6725 - (i * 0.005),
        longitude: 77.3215 - (i * 0.01)
      };
      
      stationCoordinates.push({
        id: stationId,
        index: i,
        coords: stationCoords
      });
    }
    
    // Calculate distance from user to each station
    const stationDistances = stationCoordinates.map(station => {
      const distance = calculateDistance(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        station.coords.latitude,
        station.coords.longitude
      );
      
      return {
        ...station,
        distance
      };
    });
    
    // Sort by distance to find closest station
    stationDistances.sort((a, b) => a.distance - b.distance);
    const closestStation = stationDistances[0];
    
    console.log("DEBUG: Closest station:", {
      id: closestStation.id,
      index: closestStation.index,
      distance: closestStation.distance,
      name: stationsFromKeys[closestStation.id]
    });
    
    // Determine if user is between stations and which ones
    let prevStation, nextStation, progressRatio;
    
    // If closest to first station
    if (closestStation.index === 0) {
      prevStation = 0;
      nextStation = 1;
      
      // Calculate progress based on distance ratio
      const distanceToNext = calculateDistance(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        stationCoordinates[1].coords.latitude,
        stationCoordinates[1].coords.longitude
      );
      
      const totalDistance = calculateDistance(
        stationCoordinates[0].coords.latitude,
        stationCoordinates[0].coords.longitude,
        stationCoordinates[1].coords.latitude,
        stationCoordinates[1].coords.longitude
      );
      
      progressRatio = Math.max(0, Math.min(1, 1 - (distanceToNext / totalDistance)));
    }
    // If closest to last station
    else if (closestStation.index === stationCoordinates.length - 1) {
      prevStation = stationCoordinates.length - 2;
      nextStation = stationCoordinates.length - 1;
      progressRatio = 1; // At the end
    }
    // If closest to a middle station
    else {
      // Check if closer to previous or next segment
      const prevIndex = closestStation.index - 1;
      const nextIndex = closestStation.index + 1;
      
      // Calculate distances to the line segments before and after
      const distanceToPrevSegment = calculateDistanceToLine(
        currentLocation.coords,
        stationCoordinates[prevIndex].coords,
        stationCoordinates[closestStation.index].coords
      );
      
      const distanceToNextSegment = calculateDistanceToLine(
        currentLocation.coords,
        stationCoordinates[closestStation.index].coords,
        stationCoordinates[nextIndex].coords
      );
      
      console.log("DEBUG: Segment distances:", {
        prevSegment: distanceToPrevSegment,
        nextSegment: distanceToNextSegment
      });
      
      // Determine which segment the user is on
      if (distanceToPrevSegment <= distanceToNextSegment) {
        // On segment between prev and closest
        prevStation = prevIndex;
        nextStation = closestStation.index;
        
        // Project point onto line segment
        const projection = projectPointOnLine(
          currentLocation.coords,
          stationCoordinates[prevIndex].coords,
          stationCoordinates[closestStation.index].coords
        );
        
        // Calculate progress ratio
        const distanceFromPrev = calculateDistance(
          stationCoordinates[prevIndex].coords.latitude,
          stationCoordinates[prevIndex].coords.longitude,
          projection.latitude,
          projection.longitude
        );
        
        const segmentLength = calculateDistance(
          stationCoordinates[prevIndex].coords.latitude,
          stationCoordinates[prevIndex].coords.longitude,
          stationCoordinates[closestStation.index].coords.latitude,
          stationCoordinates[closestStation.index].coords.longitude
        );
        
        progressRatio = Math.max(0, Math.min(1, distanceFromPrev / segmentLength));
      } else {
        // On segment between closest and next
        prevStation = closestStation.index;
        nextStation = nextIndex;
        
        // Project point onto line segment
        const projection = projectPointOnLine(
          currentLocation.coords,
          stationCoordinates[closestStation.index].coords,
          stationCoordinates[nextIndex].coords
        );
        
        // Calculate progress ratio
        const distanceFromPrev = calculateDistance(
          stationCoordinates[closestStation.index].coords.latitude,
          stationCoordinates[closestStation.index].coords.longitude,
          projection.latitude,
          projection.longitude
        );
        
        const segmentLength = calculateDistance(
          stationCoordinates[closestStation.index].coords.latitude,
          stationCoordinates[closestStation.index].coords.longitude,
          stationCoordinates[nextIndex].coords.latitude,
          stationCoordinates[nextIndex].coords.longitude
        );
        
        progressRatio = Math.max(0, Math.min(1, distanceFromPrev / segmentLength));
      }
    }
    
    return {
      prevStation,
      nextStation,
      progressRatio
    };
  };
  
  // Function to find nearest upcoming station based on GPS location
  const findNearestUpcomingStation = (currentLocation, routePath) => {
    if (!currentLocation || !routePath || routePath.length < 2) {
      return { nearestIndex: 0, isBetweenStations: false, progressRatio: 0 }; // Default if can't determine
    }
    
    // Calculate distances between current location and each station in the route path
    const distances = [];
    const stationCoordinates = [];
    
    // Get actual coordinates for each station in the route path
    for (let i = 0; i < routePath.length; i++) {
      const stationId = routePath[i];
      
      // In a real implementation, this would get coordinates from your station data
      // This is a placeholder - in a real app, you'd use actual station coordinates
      // For example, you might have a stations object with coordinates for each station ID
      let stationCoords;
      
      // Try to get coordinates from the context or use a fallback
      try {
        // This is a simplified example - replace with your actual station data structure
        // For example: stationCoords = stations[stationId].coords;
        stationCoords = {
          latitude: currentLocation.coords.latitude + ((i - Math.floor(routePath.length/2)) * 0.001),
          longitude: currentLocation.coords.longitude + ((i - Math.floor(routePath.length/2)) * 0.001)
        };
      } catch (error) {
        console.log(`Error getting coordinates for station ${stationId}:`, error);
        continue;
      }
      
      stationCoordinates[i] = stationCoords;
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        stationCoords.latitude,
        stationCoords.longitude
      );
      
      distances.push({ index: i, distance, coords: stationCoords });
    }
    
    // Sort stations by distance
    distances.sort((a, b) => a.distance - b.distance);
    
    // Get the nearest station
    const nearest = distances[0];
    const secondNearest = distances[1] || distances[0];
    
    // Always calculate position between the two nearest stations
    let prevIndex, nextIndex;
    let progressRatio = 0;
    
    // Determine which station is before and which is after in the route sequence
    if (nearest.index < secondNearest.index) {
      prevIndex = nearest.index;
      nextIndex = secondNearest.index;
    } else {
      prevIndex = secondNearest.index;
      nextIndex = nearest.index;
    }
    
    // Make sure the stations are adjacent in the route
    if (nextIndex - prevIndex > 1) {
      // If not adjacent, find the adjacent pair that the user is closest to
      let bestPair = null;
      let minDistanceToLine = Infinity;
      
      for (let i = 0; i < routePath.length - 1; i++) {
        const stationA = stationCoordinates[i];
        const stationB = stationCoordinates[i + 1];
        
        if (!stationA || !stationB) continue;
        
        // Calculate distance from user to the line between these stations
        const distanceToLine = calculateDistanceToLine(
          currentLocation.coords,
          stationA,
          stationB
        );
        
        if (distanceToLine < minDistanceToLine) {
          minDistanceToLine = distanceToLine;
          bestPair = { prev: i, next: i + 1 };
        }
      }
      
      if (bestPair) {
        prevIndex = bestPair.prev;
        nextIndex = bestPair.next;
      }
    }
    
    // Get the coordinates of the two stations
    const stationA = stationCoordinates[prevIndex];
    const stationB = stationCoordinates[nextIndex];
    
    if (!stationA || !stationB) {
      // If we can't get coordinates, just use the nearest station
      return { 
        nearestIndex: nearest.index, 
        isBetweenStations: false,
        prevIndex: null,
        nextIndex: null,
        progressRatio: 0
      };
    }
    
    // Always calculate progress ratio between the two stations
    // Project the user's position onto the line between stations
    const projection = projectPointOnLine(
      currentLocation.coords,
      stationA,
      stationB
    );
    
    // Calculate total distance between the stations
    const totalDistance = calculateDistance(
      stationA.latitude,
      stationA.longitude,
      stationB.latitude,
      stationB.longitude
    );
    
    // Calculate distance from station A to the projection point
    const distanceFromA = calculateDistance(
      stationA.latitude,
      stationA.longitude,
      projection.latitude,
      projection.longitude
    );
    
    // Calculate progress ratio (0 = at station A, 1 = at station B)
    progressRatio = Math.min(Math.max(distanceFromA / totalDistance, 0), 1);
    
    // Calculate distance to the line
    const distanceToLine = calculateDistanceToLine(
      currentLocation.coords,
      stationA,
      stationB
    );
    
    // Determine if user is actually between stations or just close to one
    // We'll always consider the user to be between stations, but we'll use this flag
    // for any special UI treatments if needed
    const isBetweenStations = distanceToLine < 100; // Within 100 meters of the route line
    
    return { 
      nearestIndex: nearest.index,
      isBetweenStations: true, // Always true so we always show the position
      prevIndex, 
      nextIndex,
      progressRatio 
    };
  };
  
  // Helper function to project a point onto a line
  const projectPointOnLine = (point, lineStart, lineEnd) => {
    const { latitude: x, longitude: y } = point;
    const { latitude: x1, longitude: y1 } = lineStart;
    const { latitude: x2, longitude: y2 } = lineEnd;
    
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq !== 0) param = dot / len_sq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    return {
      latitude: xx,
      longitude: yy
    };
  };
  
  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };
  
  // Calculate distance from point to line segment
  const calculateDistanceToLine = (point, lineStart, lineEnd) => {
    const { latitude: x, longitude: y } = point;
    const { latitude: x1, longitude: y1 } = lineStart;
    const { latitude: x2, longitude: y2 } = lineEnd;
    
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    
    if (len_sq !== 0) param = dot / len_sq;
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = x - xx;
    const dy = y - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleStationSelect = (index) => {
    setSelectedStationIndex(index);
  };

  const   renderStation = ({ item, index }) => {
    const stationId = route?.path[index];
    const stationName = stationsFromKeys[stationId];
    const isSelected = index === selectedStationIndex;
    const isPast = index < selectedStationIndex;
    const isUpcoming = index >= selectedStationIndex;
    const isInterchange = route?.interChangeStations?.includes(stationId);
    
    // Check if this station is part of the between-stations segment
    const isPrevStation = userBetweenStations && nearestStationIndices.prev === index;
    const isNextStation = userBetweenStations && nearestStationIndices.next === index;
    
    // Debug info
    if (isPrevStation) {
      console.log(`Station ${stationName} is prev station, index ${index}`);
      console.log(`Next station index: ${nearestStationIndices.next}`);
    }
    
    // Get the color for this station from the route's color path
    const stationColor = route?.colorPath?.[index] || theme.accentColor;
    
    return (
      <TouchableOpacity
        onPress={() => handleStationSelect(index)}
        style={[
          styles.stationItem,
          isPast && styles.pastStationItem
        ]}>
        <View style={styles.stationContent}>
          {isUpcoming ? (
            <CustomMarkerAnimated
              color={stationColor}
              size={24}
              borderWidth={0}
              borderColor={theme.background}
              index={index - selectedStationIndex}
              totalMarkers={route?.path?.length - selectedStationIndex || 1}
              isTerminal={index === route?.path?.length - 1}
              stationDot={true}
            />
          ) : (
          <View 
            style={[
              styles.stationDot,
              isInterchange && styles.interchangeDot,
              { backgroundColor: stationColor }
            ]}
          />
          )}
          <View style={styles.stationTextContainer}>
            <Text 
              style={[
                styles.stationName,
                { color: theme.text },
                isSelected && styles.selectedStationName,
                isPast && styles.pastStationName,
                isInterchange && styles.interchangeStationName
              ]}>
              {stationName}
            </Text>
            
            {/* No current station label */}
            
            {isInterchange && (
              <View style={styles.interchangePill}>
                <Text style={styles.interchangePillText}>Interchange</Text>
              </View>
            )}
          </View>
        </View>
        
        {index < route?.path?.length - 1 && (
          <View style={styles.connectionLineContainer}>
            {/* Connection line */}
          <View 
            style={[
              styles.connectionLine,
              { backgroundColor: route?.colorPath?.[index+1] || theme.accentColor }
            ]} 
          />
            
            {/* User location indicator (always show between stations) */}
            {isPrevStation && nearestStationIndices.next === index + 1 && (
              <>
                {/* Pulse animation as a separate element */}
                <Animated.View 
                  style={[
                    styles.userLocationPulse,
                    {
                      top: userLocationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      }),
                      opacity: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 0]
                      }),
                      transform: [{
                        scale: pulseAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 2.5]
                        })
                      }]
                    }
                  ]} 
                />
                
                {/* Main indicator dot */}
                <Animated.View 
                  style={[
                    styles.userLocationIndicator,
                    { 
                      top: userLocationAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      }),
                      opacity: 1
                    }
                  ]}
                >
                  {/* Inner dot for better visibility */}
                  <View style={styles.userLocationInner} />
                  
                  {/* Direction indicator */}
                  {/* {travelDirection === 'forward' ? (
                    <View style={styles.userLocationArrowDown} />
                  ) : (
                    <View style={styles.userLocationArrowUp} />
                  )} */}
                </Animated.View>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={theme.statusBar.style}
        backgroundColor={theme.statusBar.background}
      />
      <View style={[styles.content, { backgroundColor: theme.background }]}>

          <View style={[styles.header, { borderBottomColor: theme.borderColor }]}>
            <Text style={[styles.headerTitle, { color: theme.headerTextColor }]}>Current Route</Text>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: theme.isDark ? '#333333' : '#EEEEEE' }]} 
              onPress={onClose}
            >
              <Text style={[styles.closeButtonText, { color: theme.text }]}>×</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.instructionText, { color: theme.labelColor }]}>
            Upcoming stations on your route:
          </Text>
          
          <FlatList
            data={route?.path || []}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderStation}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
          

        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    position: 'relative',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 20,
    paddingBottom: 16
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 17,
    padding: 20,
    paddingTop: 12,
    paddingBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  stationItem: {
    marginBottom: 4,
    borderRadius: 16,
    // Removed overflow: 'hidden' to prevent clipping the pulse animation
  },
  stationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 16,
    paddingVertical: 0,
    zIndex: 1, // Lower z-index to ensure it doesn't block the pulse animation
  },
  pastStationItem: {
    opacity: 0.6,
  },
  stationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 16,
    marginTop: 5,
    shadowColor: '#000',
    // shadowOffset: { width: 0, height: 0 },
    // shadowOpacity: 0.2,
    // shadowRadius: 2,
    // elevation: 3,
  },
  interchangeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  stationTextContainer: {
    flex: 1,
    zIndex: 1, // Lower z-index to ensure it doesn't block the pulse animation
  },
  stationName: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  selectedStationName: {
    fontWeight: '700',
    color: '#2EC4B6',
  },
  pastStationName: {
    color: '#999',
  },
  interchangeStationName: {
    fontWeight: '700',
  },
  selectedLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  interchangePill: {
    backgroundColor: '#FF9800',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 0,
    alignSelf: 'flex-start',
    marginTop: 6,
    shadowColor: '#FF9800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  interchangePillText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  connectionLineContainer: {
    height: 56,
    width: 4,
    marginLeft: 22,
    position: 'relative',
    zIndex: 1, // Lower z-index to prevent blocking pulse animation
  },
  connectionLine: {
    height: 56,
    width: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 2,
  },
  userLocationIndicator: {
    position: 'absolute',
    left: -13,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2EC4B6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 15, // Increased elevation for Android
    zIndex: 9999999, // Higher z-index to ensure visibility
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationPulse: {
    position: 'absolute',
    left: -27, // Adjusted for positioning as a separate element
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(46, 196, 182, 0.6)', // Increased opacity for better visibility
    zIndex: 9999999999,
    elevation: 20, // Increased elevation for Android
    pointerEvents: 'none', // Make sure it doesn't block touch events
  },
  userLocationInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    zIndex: 999999, // Higher than the indicator
  },
  userLocationArrowDown: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#2EC4B6',
    position: 'absolute',
    bottom: -8,
    left: 1,
  },
  userLocationArrowUp: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#2EC4B6',
    position: 'absolute',
    top: -8,
    left: 1,
  },

});

export default AlertSelection;