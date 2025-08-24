import mobileAds, { TestIds, MaxAdContentRating } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// Initialize the Google Mobile Ads SDK with configuration
const initializeAdMob = async () => {
  try {
    await mobileAds().setRequestConfiguration({
      // Set max ad content rating to all audiences
      maxAdContentRating: MaxAdContentRating.G,
      // Indicates if you want your content treated as child-directed for COPPA
      tagForChildDirectedTreatment: false,
      // Indicates if you want the ad request to be handled in a non-personalized way
      tagForUnderAgeOfConsent: false
    });

    const adapterStatuses = await mobileAds().initialize();
    console.log('AdMob Initialization complete:', adapterStatuses);
  } catch (error) {
    console.warn('AdMob Initialization error:', error);
  }
};

// Initialize AdMob
initializeAdMob().catch(error => {
  console.warn('AdMob initialization promise error:', error);
});

// Use test IDs for development and real IDs for production
export const bannerAdUnitId = __DEV__ 
  ? TestIds.BANNER
  : Platform.OS === 'android'
    ? 'ca-app-pub-1713281088911988/3202130759' // Android banner ad ID
    : 'ca-app-pub-1713281088911988/4464743591'; // iOS banner ad ID

export const squareAdUnitId = __DEV__
  ? TestIds.MEDIUM_RECTANGLE
  : 'ca-app-pub-1713281088911988/5887450567'; // Medium rectangle ad unit ID

export const interstitialAdUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'android'
    ? 'ca-app-pub-1713281088911988/4579609846' // Android interstitial ad ID
    : ''; // Add iOS interstitial ad ID when available

// Debug logging
console.log('admob.js - __DEV__:', __DEV__);
console.log('admob.js - Platform.OS:', Platform.OS);
console.log('admob.js - bannerAdUnitId:', bannerAdUnitId);
console.log('admob.js - squareAdUnitId:', squareAdUnitId);
console.log('admob.js - interstitialAdUnitId:', interstitialAdUnitId);
console.log('admob.js - TestIds:', TestIds); 