import React, { useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { TabContext } from '../App';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useTheme } from '../src/context/ThemeContext';
import stationsFromKeys from './stationsFromKeys';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AlertOverlay = ({ isActive, onStopAlerts, route }) => {
  const { theme } = useTheme();
  const { setActiveTab } = useContext(TabContext);
  const translateY = useRef(new Animated.Value(0)).current;
  const offsetY = useRef(0); // Track the current position offset
  
  if (!isActive) return null;

  const routeTitle = route && route.path && route.path.length >= 2
    ? `${stationsFromKeys[route.path[0]]} → ${stationsFromKeys[route.path[route.path.length - 1]]}`
    : '';

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    const { state, translationY } = event.nativeEvent;
    
    if (state === State.BEGAN) {
      // Set the starting position when gesture begins
      translateY.setOffset(offsetY.current);
      translateY.setValue(0);
    }
    
    if (state === State.END || state === State.CANCELLED) {
      // Calculate vertical boundaries - 15% from top and bottom
      const topBoundary = screenHeight * 0.15;
      const bottomBoundary = screenHeight * 0.85;
      const overlayHeight = 80;
      const initialTop = Platform.OS === 'ios' ? 100 : 80;
      
      // Calculate min and max Y positions relative to initial position
      const minY = topBoundary - initialTop;
      const maxY = bottomBoundary - overlayHeight - initialTop;
      
      // Get current position (offset + current translation)
      const currentY = offsetY.current + translationY;
      
      // Clamp Y value within boundaries
      const clampedY = Math.max(minY, Math.min(maxY, currentY));
      
      // Update the offset reference
      offsetY.current = clampedY;
      
      // Flatten the offset and set new value
      translateY.flattenOffset();
      
      // Animate to final position with spring effect
      Animated.spring(translateY, {
        toValue: clampedY,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateY: translateY }, // Only Y translation
            ],
          },
        ]}
      >
        <View style={[styles.overlay, { backgroundColor: theme.cardBackground }]}>
          {/* Drag handle indicator */}
          <View style={styles.dragHandle} />
          
          <View style={styles.content}>
            <View style={styles.statusContainer}>
              <View style={styles.dot} />
              <View style={styles.textContainer}>
                <Text style={[styles.statusText, { color: theme.text }]}>
                  Station Alerts Active
                </Text>
                {routeTitle ? (
                  <Text style={[styles.routeText, { color: theme.labelColor }]}>
                    {routeTitle}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.trackButton, { backgroundColor: '#2196F3' }]}
                onPress={() => setActiveTab('alert-tracking')}
              >
                <Text style={styles.buttonText}>Track</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stopButton, { backgroundColor: '#CC0000' }]}
                onPress={onStopAlerts}
              >
                <Text style={styles.buttonText}>Stop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  overlay: {
    width: screenWidth - 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  content: {
    padding: 16,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 8,
    marginTop: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  routeText: {
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  stopButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  trackButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AlertOverlay;