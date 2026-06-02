import React, {useMemo, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  SectionList,
  Platform,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RED = '#E5252B';
const {height: SCREEN_H} = Dimensions.get('window');
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('');

const buildSections = (stations, query) => {
  const q = query.toLowerCase().trim();
  const map = {};
  stations.forEach(s => {
    if (q && !s.toLowerCase().includes(q)) return;
    let letter = (s[0] || '#').toUpperCase();
    if (!/[A-Z]/.test(letter)) letter = '#';
    (map[letter] = map[letter] || []).push(s);
  });
  return Object.keys(map)
    .sort()
    .map(l => ({ title: l, data: map[l].sort((a, b) => a.localeCompare(b)) }));
};

const Chip = ({ icon, iconColor, label, onPress, onRemove }) => (
  <TouchableOpacity style={styles.chip} activeOpacity={0.7} onPress={onPress}>
    <Ionicons name={icon} size={15} color={iconColor} />
    <Text style={styles.chipText} numberOfLines={1}>{label}</Text>
    <TouchableOpacity hitSlop={{top: 8, bottom: 8, left: 8, right: 8}} onPress={onRemove}>
      <Ionicons name="close" size={16} color="#9A9A9A" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const StationPicker = ({
  visible,
  onClose,
  title,
  query,
  onChangeQuery,
  allStations,
  recentStations = [],
  favouriteStations = [],
  onSelect,
  onClearRecents,
  onRemoveRecent,
  onToggleFavourite,
}) => {
  const listRef = useRef(null);

  const sections = useMemo(
    () => buildSections(allStations, query),
    [allStations, query],
  );

  const scrollToLetter = letter => {
    const idx = sections.findIndex(s => s.title === letter);
    if (idx >= 0 && listRef.current) {
      listRef.current.scrollToLocation({
        sectionIndex: idx,
        itemIndex: 0,
        animated: true,
        viewOffset: 0,
      });
    }
  };

  const showChips = !query.trim();

  const ListHeader = () => (
    <View>
      {showChips && recentStations.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={onClearRecents}>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chipWrap}>
            {recentStations.map((s, i) => (
              <Chip
                key={`r-${s}-${i}`}
                icon="time-outline"
                iconColor="#9A9A9A"
                label={s}
                onPress={() => onSelect(s)}
                onRemove={() => onRemoveRecent(s)}
              />
            ))}
          </View>
        </View>
      )}

      {showChips && favouriteStations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favourites</Text>
          <View style={styles.chipWrap}>
            {favouriteStations.map((s, i) => (
              <Chip
                key={`f-${s}-${i}`}
                icon="heart"
                iconColor={RED}
                label={s}
                onPress={() => onSelect(s)}
                onRemove={() => onToggleFavourite(s)}
              />
            ))}
          </View>
        </View>
      )}

      {showChips && (recentStations.length > 0 || favouriteStations.length > 0) && (
        <View style={styles.divider} />
      )}

      <Text style={[styles.sectionTitle, styles.allTitle]}>All Stations</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#444" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#9A9A9A" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search station name..."
              placeholderTextColor="#9A9A9A"
              value={query}
              onChangeText={onChangeQuery}
              clearButtonMode="while-editing"
            />
          </View>

          <View style={styles.listWrap}>
            <SectionList
              ref={listRef}
              sections={sections}
              keyExtractor={(item, i) => `${item}-${i}`}
              ListHeaderComponent={ListHeader}
              stickySectionHeadersEnabled={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              onScrollToIndexFailed={() => {}}
              renderSectionHeader={({ section }) => (
                <View style={styles.alphaHeader}>
                  <Text style={styles.alphaHeaderText}>{section.title}</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.stationRow}
                  activeOpacity={0.6}
                  onPress={() => onSelect(item)}
                  onLongPress={() => onToggleFavourite(item)}>
                  <Text style={styles.stationName}>{item}</Text>
                  <Ionicons
                    name={favouriteStations.includes(item) ? 'heart' : 'chevron-forward'}
                    size={favouriteStations.includes(item) ? 18 : 20}
                    color={favouriteStations.includes(item) ? RED : '#C4C4C4'}
                  />
                </TouchableOpacity>
              )}
            />

            <View style={styles.alphaIndex}>
              {ALPHABET.map(l => (
                <TouchableOpacity key={l} onPress={() => scrollToLetter(l)} hitSlop={{left: 6, right: 6}}>
                  <Text style={styles.alphaIndexText}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: {
    height: SCREEN_H * 0.9,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D9D9D9',
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A' },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 17, color: '#1A1A1A', height: '100%' },
  listWrap: { flex: 1 },
  section: { paddingHorizontal: 20, marginTop: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: '#1A1A1A', marginBottom: 12 },
  allTitle: { paddingHorizontal: 20, marginTop: 18 },
  clearAll: { fontSize: 15, fontWeight: '600', color: RED },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECECEC',
    backgroundColor: '#FAFAFA',
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    marginBottom: 10,
    maxWidth: '100%',
  },
  chipText: { fontSize: 15, color: '#1A1A1A', fontWeight: '500', marginHorizontal: 8 },
  divider: { height: 1, backgroundColor: '#EEEEEE', marginHorizontal: 20, marginTop: 24 },
  alphaHeader: { backgroundColor: '#F4F4F4', borderRadius: 8, marginHorizontal: 20, paddingVertical: 6, paddingHorizontal: 14, marginTop: 4 },
  alphaHeaderText: { fontSize: 14, fontWeight: '600', color: '#7A7A7A' },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  stationName: { fontSize: 18, color: '#1A1A1A', fontWeight: '500' },
  alphaIndex: {
    position: 'absolute',
    right: 4,
    top: 8,
    bottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alphaIndexText: { fontSize: 11, color: '#B0B0B0', fontWeight: '600', paddingVertical: 1 },
});

export default StationPicker;
