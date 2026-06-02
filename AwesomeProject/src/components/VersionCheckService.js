import VersionCheck from 'react-native-version-check';
import { Alert, Linking } from 'react-native';

class VersionCheckService {
  static async checkForUpdate(testMode = false) {
    try {
      if (testMode) {
        Alert.alert(
          'Update Available',
          'A new version is available! Would you like to update?',
          [
            {
              text: 'Update',
              onPress: () => {
                Alert.alert('Test Mode', 'In a real scenario, this would open the App Store.');
              },
            },
            {
              text: 'Later',
              style: 'cancel',
            },
          ],
          { cancelable: true }
        );
        return true;
      }

      const latestVersion = await VersionCheck.getLatestVersion({ provider: 'appStore' });
      const currentVersion = VersionCheck.getCurrentVersion();

      const needsUpdate = await VersionCheck.needUpdate({
        latestVersion,
        currentVersion,
      });

      if (needsUpdate.isNeeded) {
        Alert.alert(
          'Update Available',
          'A new version is available! Would you like to update?',
          [
            {
              text: 'Update',
              onPress: async () => {
                try {
                  const storeUrl = await VersionCheck.getStoreUrl({ appID: '6746700055',provider: 'appStore' });
                  if (storeUrl) {
                    Linking.openURL(storeUrl);
                  } else {
                    Alert.alert('Error', 'Could not find the store link.');
                  }
                } catch (err) {
                  console.error('Error opening store URL:', err);
                  Alert.alert('Error', 'Something went wrong while opening the store.');
                }
              },
            },
            {
              text: 'Later',
              style: 'cancel',
            },
          ],
          { cancelable: true }
        );
      }

      return needsUpdate.isNeeded;
    } catch (error) {
      console.error('Error checking for updates:', error);
      return false;
    }
  }
}

export default VersionCheckService;
