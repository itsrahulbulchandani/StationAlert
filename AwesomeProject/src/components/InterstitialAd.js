import React, { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { interstitialAdUnitId } from '../config/admob';
import { Platform, AppState } from 'react-native';

// Preload interstitial ad to improve user experience
let preloadedInterstitialAd = null;
let isPreloading = false;

/**
 * Preload an interstitial ad in the background
 * This improves user experience by having an ad ready to show immediately
 */
export const preloadInterstitialAd = () => {
  // Don't preload if already preloading or if we already have a preloaded ad
  if (isPreloading || preloadedInterstitialAd) {
    return;
  }

  // Return early if no ad unit ID is available
  if (!interstitialAdUnitId) {
    console.log('No interstitial ad unit ID available for preloading');
    return;
  }

  isPreloading = true;
  console.log('Preloading interstitial ad...');
  
  // Create a new interstitial ad instance
  const interstitialAd = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
    requestNonPersonalizedAdsOnly: false,
    keywords: ['transit', 'transportation', 'travel'],
  });
  
  // Set up event listeners
  const unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    console.log('Interstitial ad preloaded successfully');
    preloadedInterstitialAd = interstitialAd;
    isPreloading = false;
    
    // Clean up the load listener as we don't need it anymore
    unsubscribeLoaded();
    unsubscribeError();
  });
  
  const unsubscribeError = interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error('Interstitial ad preload error:', error);
    preloadedInterstitialAd = null;
    isPreloading = false;
    
    // Clean up event listeners
    unsubscribeLoaded();
    unsubscribeError();
  });
  
  // Load the ad
  interstitialAd.load();
};

// Listen for app state changes to preload ads when app comes to foreground
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'active') {
    // App has come to the foreground
    preloadInterstitialAd();
  }
});

// Initial preload
preloadInterstitialAd();

/**
 * Show an interstitial ad and call the callback when it's closed
 * Uses a preloaded ad if available, otherwise loads a new one
 */
export const showInterstitialAd = async (onAdClosed) => {
  // Return early if no ad unit ID is available (e.g., for iOS)
  if (!interstitialAdUnitId) {
    console.log('No interstitial ad unit ID available');
    if (onAdClosed) onAdClosed();
    return;
  }

  // Use preloaded ad if available
  let interstitialAd = preloadedInterstitialAd;
  preloadedInterstitialAd = null; // Clear the reference so we preload a new one
  
  // If no preloaded ad, create a new one
  if (!interstitialAd) {
    console.log('No preloaded ad available, creating new one');
    interstitialAd = InterstitialAd.createForAdRequest(interstitialAdUnitId, {
      requestNonPersonalizedAdsOnly: false,
      keywords: ['transit', 'transportation', 'travel'],
    });
  }
  
  // Track loading state
  let isLoaded = interstitialAd ? true : false;
  let isShowing = false;
  
  // Set up event listeners if this is a new ad
  let unsubscribeLoaded = () => {};
  if (!isLoaded) {
    unsubscribeLoaded = interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
      isLoaded = true;
      
      // Show the ad when it's loaded, but only if we haven't already shown it
      if (!isShowing) {
        isShowing = true;
        interstitialAd.show().catch(error => {
          console.error('Error showing interstitial ad:', error);
          cleanupAndCallback();
        });
      }
    });
  }
  
  // Set up closed and error event listeners
  const unsubscribeClosed = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    console.log('Interstitial ad closed');
    cleanupAndCallback();
  });
  
  const unsubscribeError = interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error('Interstitial ad error:', error);
    cleanupAndCallback();
  });
  
  // Helper function to clean up and call the callback
  const cleanupAndCallback = () => {
    // Clean up event listeners
    unsubscribeLoaded();
    unsubscribeClosed();
    unsubscribeError();
    
    // Preload the next ad for future use
    preloadInterstitialAd();
    
    // Call the callback
    if (onAdClosed) onAdClosed();
  };
  
  // If the ad is already loaded (preloaded), show it immediately
  if (isLoaded && !isShowing) {
    isShowing = true;
    console.log('Showing preloaded interstitial ad');
    interstitialAd.show().catch(error => {
      console.error('Error showing preloaded interstitial ad:', error);
      cleanupAndCallback();
    });
  } 
  // Otherwise, load the ad
  else if (!isLoaded) {
    console.log('Loading interstitial ad...');
    interstitialAd.load();
    
    // Set a timeout in case the ad doesn't load
    setTimeout(() => {
      if (!isLoaded) {
        console.log('Interstitial ad load timeout');
        cleanupAndCallback();
      }
    }, 10000); // 10 second timeout
  }
};