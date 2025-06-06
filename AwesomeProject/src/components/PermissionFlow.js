import React, { useState, useEffect } from 'react';
import { 
  Platform, 
  Alert, 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Linking,
  PermissionsAndroid,
  AppState
} from 'react-native';

const PermissionFlowManager = ({ onPermissionsGranted, onPermissionsDenied }) => {
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [currentStep, setCurrentStep] = useState('intro');
  const [permissionStatus, setPermissionStatus] = useState({
    locationWhenInUse: false,
    locationAlways: false,
    notifications: false
  });

  // Step 1: Introduction Modal - Explain WHY permissions are needed
  const IntroModal = () => (
    <Modal visible={showPermissionModal && currentStep === 'intro'} transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Stay Informed on Your Journey</Text>
          <Text style={styles.modalText}>
            To provide you with timely station alerts, this app needs to:
          </Text>
          <View style={styles.permissionList}>
            <Text style={styles.permissionItem}>📍 Access your location to know when you're near stations</Text>
            <Text style={styles.permissionItem}>🔄 Track location in background to alert you even when app is closed</Text>
            <Text style={styles.permissionItem}>🔔 Send notifications to alert you about upcoming stations</Text>
          </View>
          <Text style={styles.modalSubtext}>
            Your location is only used for station alerts and is never shared with third parties.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => setShowPermissionModal(false)}
            >
              <Text style={styles.secondaryButtonText}>Maybe Later</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => setCurrentStep('location')}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Step 2: Location Permission (When in Use first)
  const LocationPermissionModal = () => (
    <Modal visible={showPermissionModal && currentStep === 'location'} transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Location Access</Text>
          <Text style={styles.modalText}>
            First, we'll request access to your location while using the app.
          </Text>
          <Text style={styles.modalSubtext}>
            This allows us to show your position on the map and calculate distances to stations.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => setShowPermissionModal(false)}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={requestLocationWhenInUse}
            >
              <Text style={styles.primaryButtonText}>Grant Location Access</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Step 3: Background Location Permission
  const BackgroundLocationModal = () => (
    <Modal visible={showPermissionModal && currentStep === 'background'} transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Background Location Access</Text>
          <Text style={styles.modalText}>
            Now, let's enable background location access so you receive alerts even when the app is closed.
          </Text>
          <View style={styles.permissionInstructions}>
            {Platform.OS === 'ios' ? (
              <Text style={styles.instructionText}>
                On the next screen, please select "Always Allow" instead of "While Using App"
              </Text>
            ) : (
              <Text style={styles.instructionText}>
                On the next screen, please select "Allow all the time"
              </Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => setCurrentStep('notifications')}
            >
              <Text style={styles.secondaryButtonText}>Skip for Now</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={requestBackgroundLocation}
            >
              <Text style={styles.primaryButtonText}>Enable Background Access</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Step 4: Notification Permission
  const NotificationPermissionModal = () => (
    <Modal visible={showPermissionModal && currentStep === 'notifications'} transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Enable Notifications</Text>
          <Text style={styles.modalText}>
            Finally, let's enable notifications so you receive station alerts.
          </Text>
          <Text style={styles.modalSubtext}>
            You'll receive timely notifications when approaching your station, even with your phone in your pocket.
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => setCurrentStep('complete')}
            >
              <Text style={styles.secondaryButtonText}>Skip Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={requestNotificationPermission}
            >
              <Text style={styles.primaryButtonText}>Enable Notifications</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Step 5: Settings Prompt for denied permissions
  const SettingsPromptModal = () => (
    <Modal visible={showPermissionModal && currentStep === 'settings'} transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Permissions Needed</Text>
          <Text style={styles.modalText}>
            Some permissions were denied. To use station alerts, please enable them in Settings:
          </Text>
          <View style={styles.settingsInstructions}>
            {!permissionStatus.locationWhenInUse && (
              <Text style={styles.instructionText}>• Enable Location Services</Text>
            )}
            {!permissionStatus.locationAlways && (
              <Text style={styles.instructionText}>
                • Set Location to "Always" {Platform.OS === 'ios' ? 'or "Always Allow"' : 'or "Allow all the time"'}
              </Text>
            )}
            {!permissionStatus.notifications && (
              <Text style={styles.instructionText}>• Enable Notifications</Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={() => setShowPermissionModal(false)}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={openSettings}
            >
              <Text style={styles.primaryButtonText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const requestLocationWhenInUse = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs location access to provide station alerts.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionStatus(prev => ({ ...prev, locationWhenInUse: true }));
          setCurrentStep('background');
        } else {
          setCurrentStep('settings');
        }
      } catch (err) {
        console.warn(err);
        setCurrentStep('settings');
      }
    } else {
      // For iOS, request through geolocation
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPermissionStatus(prev => ({ ...prev, locationWhenInUse: true }));
          setCurrentStep('background');
        },
        (error) => {
          if (error.code === 1) { // PERMISSION_DENIED
            setCurrentStep('settings');
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  const requestBackgroundLocation = async () => {
    if (Platform.OS === 'android') {
      try {
        // On Android 10+, request background location
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location Permission',
            message: 'Allow location access all the time to receive alerts when the app is closed.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'While Using App Only',
            buttonPositive: 'Allow All the Time',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setPermissionStatus(prev => ({ ...prev, locationAlways: true }));
        }
        setCurrentStep('notifications');
      } catch (err) {
        console.warn(err);
        setCurrentStep('notifications');
      }
    } else {
      // For iOS, this requires a second location request or manual settings
      Alert.alert(
        'Background Location Access',
        'On the next screen, please tap "Change to Always Allow" to enable background location access.',
        [
          { text: 'Cancel', onPress: () => setCurrentStep('notifications') },
          { 
            text: 'Continue', 
            onPress: () => {
              // Trigger another location request which should show the "Change to Always Allow" option
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setPermissionStatus(prev => ({ ...prev, locationAlways: true }));
                  setCurrentStep('notifications');
                },
                (error) => {
                  setCurrentStep('notifications');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
              );
            }
          }
        ]
      );
    }
  };

  const requestNotificationPermission = async () => {
    if (Platform.OS === 'ios') {
      // For iOS, you would typically use PushNotificationIOS or a notification library
      // This is a simplified version
      Alert.alert(
        'Notification Permission',
        'Please allow notifications in the system dialog.',
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Here you would call your notification permission request
              // For now, we'll assume it's granted
              setPermissionStatus(prev => ({ ...prev, notifications: true }));
              setCurrentStep('complete');
            }
          }
        ]
      );
    } else {
      // On Android < 13, notifications are granted by default
      setPermissionStatus(prev => ({ ...prev, notifications: true }));
      setCurrentStep('complete');
    }
  };

  const openSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
    setShowPermissionModal(false);
  };

  const checkPermissionsComplete = () => {
    const hasMinimumPermissions = permissionStatus.locationWhenInUse;
    const hasOptimalPermissions = permissionStatus.locationWhenInUse && 
                                  permissionStatus.locationAlways && 
                                  permissionStatus.notifications;

    if (hasOptimalPermissions) {
      onPermissionsGranted('optimal');
    } else if (hasMinimumPermissions) {
      onPermissionsGranted('minimum');
    } else {
      onPermissionsDenied();
    }
    setShowPermissionModal(false);
  };

  useEffect(() => {
    if (currentStep === 'complete') {
      checkPermissionsComplete();
    }
  }, [currentStep, permissionStatus]);

  const startPermissionFlow = () => {
    setCurrentStep('intro');
    setShowPermissionModal(true);
  };

  return (
    <View>
      <IntroModal />
      <LocationPermissionModal />
      <BackgroundLocationModal />
      <NotificationPermissionModal />
      <SettingsPromptModal />
      
      {/* Trigger button - replace with your own trigger */}
      <TouchableOpacity style={styles.triggerButton} onPress={startPermissionFlow}>
        <Text style={styles.triggerButtonText}>Setup Station Alerts</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  modalSubtext: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
  },
  permissionList: {
    marginBottom: 15,
  },
  permissionItem: {
    fontSize: 15,
    marginBottom: 8,
    color: '#555',
    lineHeight: 20,
  },
  permissionInstructions: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  settingsInstructions: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  secondaryButtonText: {
    color: '#6c757d',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  triggerButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  triggerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default PermissionFlowManager;