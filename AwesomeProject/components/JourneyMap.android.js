// Android journey map: a fully-offline MapLibre map (no Google Maps / no API
// key / no tiles — minimal background style + our GTFS data as GeoJSON layers).
// iOS uses Apple Maps via JourneyMap.ios.js. Metro picks the right file per
// platform, so neither react-native-maps nor MapLibre is bundled on the other.
export {default} from './OfflineMetroMap';
