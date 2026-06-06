import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { bannerAdUnitId, ADS_ENABLED } from '../config/admob';

export const AdBanner = () => {
  const [adError, setAdError] = useState(null);

  // Ads temporarily disabled (e.g. for app promo content capture)
  if (!ADS_ENABLED) {
    return null;
  }

  try {
    return (
      <View style={styles.container}>
        <BannerAd
          unitId={bannerAdUnitId}
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
            keywords: ['transit', 'transportation', 'travel'],
          }}
          onAdLoaded={() => {
            console.log('Banner ad loaded successfully');
            setAdError(null);
          }}
          onAdFailedToLoad={(error) => {
            console.warn('Banner ad failed to load:', {
              errorCode: error.code,
              errorMessage: error.message,
              unitId: bannerAdUnitId,
              isDev: __DEV__
            });
            setAdError(error);
          }}
          onAdOpened={() => {
            console.log('Banner ad opened');
          }}
          onAdClosed={() => {
            console.log('Banner ad closed');
          }}
        />
      </View>
    );
  } catch (error) {
    console.warn('Error rendering banner ad:', error);
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 5,
    // Add shadow for iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      // Add elevation for Android
      android: {
        elevation: 4,
      },
    }),
  },
}); 