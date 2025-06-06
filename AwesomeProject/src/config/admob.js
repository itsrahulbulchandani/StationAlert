import mobileAds, { TestIds, MaxAdContentRating } from 'react-native-google-mobile-ads';

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
  : 'ca-app-pub-1713281088911988/4464743591'; // Replace XXXXXXXX with your actual banner ad unit ID

export const squareAdUnitId = __DEV__
  ? TestIds.MEDIUM_RECTANGLE
  : 'ca-app-pub-1713281088911988/5887450567'; // Replace YYYYYYYY with your actual medium rectangle ad unit ID 

// Debug logging
console.log('admob.js - __DEV__:', __DEV__);
console.log('admob.js - bannerAdUnitId:', bannerAdUnitId);
console.log('admob.js - squareAdUnitId:', squareAdUnitId);
console.log('admob.js - TestIds:', TestIds); 