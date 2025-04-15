import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const CustomMarkerAnimated = ({
  color,
  size = 8,
  borderWidth = 1,
  borderColor = '#FFFFFF',
}) => {
  const glowAnim = useRef(new Animated.Value(1)).current;
  console.log("inside the custom marker function")
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  return (
    <Animated.View
      style={[
        styles.marker,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderWidth: borderWidth,
          borderColor: borderColor,
          transform: [{ scale: glowAnim }],
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
          elevation: 10,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  marker: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomMarkerAnimated;
