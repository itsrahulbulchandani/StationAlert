import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { bannerAdUnitId } from '../config/admob';

export const SquareAd = () => {
  try {
    return (
      <View style={styles.container}>
        <BannerAd
          unitId={bannerAdUnitId}
          size={BannerAdSize.MEDIUM_RECTANGLE}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={(error) => {
            console.warn('Square ad failed to load:', error);
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