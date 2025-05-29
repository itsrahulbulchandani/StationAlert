import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useTheme } from '../src/context/ThemeContext';
import stationsFromKeys from './stationsFromKeys';

const AlertOverlay = ({ isActive, onStopAlerts, route }) => {
  const { theme } = useTheme();

  if (!isActive) return null;

  const routeTitle = route && route.path && route.path.length >= 2 
    ? `${stationsFromKeys[route.path[0]]} → ${stationsFromKeys[route.path[route.path.length - 1]]}` 
    : '';

  return (
    <View style={styles.container}>
      <View style={[styles.overlay, { backgroundColor: theme.cardBackground }]}>
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
          <TouchableOpacity
            style={[styles.stopButton, { backgroundColor: '#CC0000' }]}
            onPress={onStopAlerts}
          >
            <Text style={styles.stopButtonText}>Stop Alerts</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    width: Dimensions.get('window').width - 32,
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
  content: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AlertOverlay; 