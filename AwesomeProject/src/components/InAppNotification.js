import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { Portal } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

const InAppNotification = ({message, isVisible, onHide}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-(insets.top + 100))).current;

  useEffect(() => {
    if (isVisible) {
      // Slide in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 20,
        friction: 5,
      }).start();

      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        hideNotification();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);
  console.log("Safe area insets:", insets);

  const hideNotification = () => {
    Animated.timing(translateY, {
      toValue: -(insets.top + 200),
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      if (onHide) onHide();
    });
  };

  if (!isVisible) return null;

  return (
    <Portal>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{translateY}],
              top: insets.top + 10, // Use safe area insets for proper positioning
            },
          ]}>
          <View style={styles.content}>
            <Text style={styles.title}>Next Station Alert</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={hideNotification}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Portal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999999,
    elevation: 9999,
    pointerEvents: 'box-none',
  },
  container: {
    position: 'absolute',
    // top is now set dynamically using useSafeAreaInsets
    left: 16,
    right: 16,
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 10000,
    zIndex: 10000,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default InAppNotification; 