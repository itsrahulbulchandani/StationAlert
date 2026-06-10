module.exports = {
  dependencies: {
    // The app's JS imports icons from the legacy `react-native-vector-icons`
    // (v10) package, whose Ionicons glyph map ships in this repo's bundled
    // v10 Ionicons.ttf (android/app/src/main/assets/fonts/Ionicons.ttf).
    //
    // The newer scoped `@react-native-vector-icons/ionicons` (v12) package is
    // also installed and would otherwise autolink on Android and bundle ITS
    // own Ionicons.ttf with different codepoints — that mismatch renders every
    // icon as a tofu box. It is not imported anywhere in JS, so we disable its
    // Android autolinking to keep the v10 font as the single source of truth.
    '@react-native-vector-icons/ionicons': {
      platforms: {
        android: null,
      },
    },
    // react-native-maps is used only on iOS (Apple Maps, via JourneyMap.ios.js).
    // Android uses the offline MapLibre map, so we drop the Google Maps native
    // SDK from the Android build entirely — no Play Services Maps, no API key.
    'react-native-maps': {
      platforms: {
        android: null,
      },
    },
    // MapLibre powers the Android offline map only (JourneyMap.android.js →
    // OfflineMetroMap). iOS uses Apple Maps, so keep the MapLibre native SDK out
    // of the iOS build (don't add it to the Pods) by disabling iOS autolinking.
    '@maplibre/maplibre-react-native': {
      platforms: {
        ios: null,
      },
    },
  },
};
