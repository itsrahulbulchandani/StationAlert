/**
 * Headless JS task to handle background location processing
 */
import { AppRegistry, NativeModules, Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';

// Get the native module
const LocationModule = NativeModules.LocationModule;

// This task runs in the background when the app is killed or suspended
const LocationTask = async (taskData) => {
  console.log('Headless Task - Location update received in background', JSON.stringify(taskData));
  
  try {
    // Check if we received locationData as a string (from Java)
    if (taskData.locationData) {
      try {
        // Parse the JSON string from Java
        const parsedData = JSON.parse(taskData.locationData);
        console.log('Parsed location data:', JSON.stringify(parsedData));
        
        // Extract location data from the parsed object
        if (parsedData.initialLocation) {
          const location = parsedData.initialLocation;
          console.log('Using initial location from service:', JSON.stringify(location));
          
          // If we have route data, we can process it
          if (parsedData.route && Array.isArray(parsedData.route)) {
            console.log('Route data available in background task');
            // Process route data if needed
          }
        }
      } catch (parseError) {
        console.error('Error parsing location data:', parseError);
      }
    } else {
      // Process the location data directly if it's not in locationData string
      const { location, nextStationName, distance } = taskData;
      
      console.log('Checking notification conditions:', JSON.stringify({
        hasLocation: !!location,
        nextStationName,
        distance,
        shouldNotify: location && nextStationName && distance < 400
      }));
      
      if (location && nextStationName && distance < 400) {
        console.log('Preparing to send background notification for station:', nextStationName);
        
        // Send a notification when approaching a station - use same format as foreground
        PushNotification.localNotification({
          channelId: 'station-alerts',
          title: "Next Station Alert",
          message: `You are approaching ${nextStationName}!`,
          playSound: true,
          soundName: 'default',
          importance: 'high',
          vibrate: true,
          priority: 'high',
          visibility: 'public',
          ignoreInForeground: false,
          // Additional Android-specific options for background notifications
          ongoing: false,
          autoCancel: true,
          largeIcon: "ic_launcher",
          smallIcon: "ic_notification",
        });
        
        console.log('Background notification sent for station:', nextStationName);
      } else {
        console.log('Notification conditions not met:', 
          !location ? 'Missing location' : 
          !nextStationName ? 'Missing station name' : 
          `Distance ${distance} > 400m`);
      }
    }
  } catch (error) {
    console.error('Error in headless location task:', error);
  }
  
  return Promise.resolve();
};

// Helper functions to start/stop the foreground service
export const startLocationService = async (data = {}) => {
  if (Platform.OS === 'android' && LocationModule) {
    try {
      const result = await LocationModule.startLocationService(data);
      console.log('Location service started:', result);
      return true;
    } catch (error) {
      console.error('Failed to start location service:', error);
      return false;
    }
  }
  return false;
};

export const stopLocationService = async () => {
  if (Platform.OS === 'android' && LocationModule) {
    try {
      const result = await LocationModule.stopLocationService();
      console.log('Location service stopped:', result);
      return true;
    } catch (error) {
      console.error('Failed to stop location service:', error);
      return false;
    }
  }
  return false;
};

// Register the headless task
AppRegistry.registerHeadlessTask('LocationTask', () => LocationTask);

export default LocationTask;