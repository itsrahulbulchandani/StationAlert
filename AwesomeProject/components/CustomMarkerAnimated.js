import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Easing } from 'react-native';

const CustomMarkerAnimated = ({
  color,
  size = 12,
  borderWidth = 2,
  borderColor = '#FFFFFF',
  isTerminal = false,
  index = 0,
  totalMarkers = 1,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const singleMarkerDuration = 800;
    
    const createSingleAnimation = () => {
      return Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: isTerminal ? 1.9 : 1.9, // Reduced scale for subtler effect
          duration: singleMarkerDuration * 0.7,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: singleMarkerDuration * 0.3,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);
    };

    const createSequencedAnimation = () => {
      return Animated.sequence([
        Animated.delay(index * singleMarkerDuration),
        createSingleAnimation(),
        ...(index < totalMarkers - 1 
          ? [Animated.delay((totalMarkers - index - 1) * singleMarkerDuration)]
          : [])
      ]);
    };
    
    Animated.loop(createSequencedAnimation()).start();
    
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [pulseAnim, isTerminal, index, totalMarkers]);

  const shadowRadius = Math.max(size / 2, 6);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.marker,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isTerminal ? '#000000' : color,
            borderWidth: borderWidth,
            borderColor: borderColor,
            shadowColor: color,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: shadowRadius,
            elevation: 10,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {isTerminal && (
          <View
            style={[
              styles.centralDot,
              {
                width: size / 3,
                height: size / 3,
                borderRadius: size / 6,
                backgroundColor: '#FFFFFF',
              },
            ]}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  marker: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  centralDot: {
    position: 'absolute',
    zIndex: 3,
  }
});

export default CustomMarkerAnimated;
