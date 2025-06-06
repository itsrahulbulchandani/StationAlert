import React, { useState } from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { squareAdUnitId } from '../config/admob';

export const SquareAd = () => {
  const [adError, setAdError] = useState(null);

  // Debug logging
  console.log('SquareAd - unitId:', squareAdUnitId);
  console.log('SquareAd - isDev:', __DEV__);
  console.log('SquareAd - TestIds.MEDIUM_RECTANGLE:', TestIds.MEDIUM_RECTANGLE);

  try {
    if (!squareAdUnitId) {
      console.warn('SquareAd - No valid unitId provided');
      return null;
    }

    return (
      <View style={styles.container}>
        <BannerAd
          unitId={squareAdUnitId}
          size={BannerAdSize.MEDIUM_RECTANGLE}
          requestOptions={{
            requestNonPersonalizedAdsOnly: false,
            keywords: ['transit', 'transportation', 'travel'],
          }}
          onAdLoaded={() => {
            console.log('Square ad loaded successfully');
            setAdError(null);
          }}
          onAdFailedToLoad={(error) => {
            console.warn('Square ad failed to load:', {
              errorCode: error.code,
              errorMessage: error.message,
              unitId: squareAdUnitId,
              isDev: __DEV__
            });
            setAdError(error);
          }}
          onAdOpened={() => {
            console.log('Square ad opened');
          }}
          onAdClosed={() => {
            console.log('Square ad closed');
          }}
        />
      </View>
    );
  } catch (error) {
    console.warn('Error rendering square ad:', error);
    return null;
  }
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 10,
    width: '100%',
    alignSelf: 'center',
    // Add shadow for iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
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