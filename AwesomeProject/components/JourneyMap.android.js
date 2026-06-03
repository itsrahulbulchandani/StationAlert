// Android journey map: the fully-offline SVG metro map (no Google Maps / no API
// key / no tiles). iOS uses Apple Maps via JourneyMap.ios.js. Metro picks the
// right file per platform, so react-native-maps is never bundled on Android.
export {default} from './OfflineMetroMap';
