// Lightweight persistence helper. Degrades gracefully to in-memory if the
// native AsyncStorage module is unavailable (e.g. before a native rebuild).
let AsyncStorage = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  AsyncStorage = null;
}

export const loadJSON = async (key, fallback) => {
  try {
    if (!AsyncStorage) return fallback;
    const raw = await AsyncStorage.getItem(key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const saveJSON = async (key, value) => {
  try {
    if (!AsyncStorage) return;
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // ignore persistence failures
  }
};

export const STORAGE_KEYS = {
  recentSearches: '@sa_recent_searches',
  favourites: '@sa_favourites',
  recentStations: '@sa_recent_stations',
  favouriteStations: '@sa_favourite_stations',
};
