import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const CustomMarkerAnimated = ({
  color,
  size = 12,
  borderWidth = 2,
  borderColor = '#FFFFFF',
  isTerminal = false,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.4)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: isTerminal ? 1.7 : 1.5,
            duration: isTerminal ? 1000 : 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: isTerminal ? 0.9 : 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.4,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [pulseAnim, opacityAnim, isTerminal]);

  const shadowRadius = Math.max(size / 2, 6);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: size * 3,
            height: size * 3,
            borderRadius: (size * 3) / 2,
            backgroundColor: color,
            opacity: opacityAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />
      
      <View
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
          },
        ]}
      />
      
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    zIndex: 2,
  },
  centralDot: {
    position: 'absolute',
    zIndex: 3,
  }
});

export default CustomMarkerAnimated;
