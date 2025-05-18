import mobileAds, { TestIds } from 'react-native-google-mobile-ads';

// Initialize the Google Mobile Ads SDK
try {
  mobileAds()
    .initialize()
    .then(adapterStatuses => {
      console.log('AdMob Initialization complete:', adapterStatuses);
    })
    .catch(error => {
      console.warn('AdMob Initialization error:', error);
    });
} catch (error) {
  console.warn('AdMob setup error:', error);
}

// Use test IDs for development and real IDs for production
export const bannerAdUnitId = __DEV__ 
  ? TestIds.BANNER
  : 'ca-app-pub-xxxxxxxxxxxxxxxx/yyyyyyyyyy'; // Replace with your actual ad unit ID 