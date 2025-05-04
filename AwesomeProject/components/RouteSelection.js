import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {TabContext} from '../App';

const { width } = Dimensions.get('window');

const pastelColors = [
  '#E0F7FA', '#FCE4EC', '#FFF9C4', '#E1BEE7', '#C8E6C9', '#FFECB3', '#B3E5FC', '#FFCDD2', '#D1C4E9', '#DCEDC8'
];

const RouteSelection = ({onClose}) => {
  const {selectedRoute, routesFound, setSelectedRoute, setActiveTab, handleSetAlert} = useContext(TabContext);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderRoute = ({item, index}) => {
    console.log('renderRoute called with item:', item);
    const isExpanded = expandedIndex === index;
    return (
      <TouchableOpacity
        onPress={() => toggleExpand(index)}
        style={[styles.routeCard, isExpanded && styles.routeCardExpanded]}
        activeOpacity={0.9}>
        <View style={styles.routeCardHeader}>
          <Text style={styles.routeCardTitle}>{item?.path[0]}</Text>
          <View style={styles.routePillsRow}>
            {item?.interChangeStations?.map((station, idx) => (
              <View
                key={idx}
                style={[styles.stationPill, {backgroundColor: pastelColors[idx % pastelColors.length]}]}
              >
                <Text style={[styles.stationPillText, {color: item?.lineChangeColors[idx]}]}>{station}</Text>
              </View>
            ))}
            {item?.interChangeStations[item?.interChangeStations?.length - 1] !== item?.path[item?.path?.length - 1] && (
              <View style={[styles.stationPill, {backgroundColor: pastelColors[3]}]}>
                <Text style={[styles.stationPillText, {color: item?.colorPath[item?.colorPath?.length - 1]}]}>
                  {item?.path[item?.path?.length - 1]}
                </Text>
              </View>
            )}
          </View>
        </View>
        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.sectionTitle}>Full Route</Text>
            <View style={styles.pathRow}>
              {item.path?.map((station, idx) => (
                <React.Fragment key={idx}>
                  <View style={[styles.stationPillLarge, {backgroundColor: pastelColors[idx % pastelColors.length]}]}>
                    <Text style={[styles.stationPillTextLarge, {color: item?.colorPath[idx]}]}>{station}</Text>
                  </View>
                  {idx !== item?.path?.length - 1 && <Text style={styles.arrowLarge}>→</Text>}
                </React.Fragment>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  setSelectedRoute(item);
                  setActiveTab('route');
                }}>
                <Text style={styles.primaryButtonText}>View On Map</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => handleSetAlert(item)}>
                <Text style={styles.secondaryButtonText}>Set Alerts</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.safeArea}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Route Details</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={routesFound ? routesFound : []}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderRoute}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6F9',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 18,
    backgroundColor: 'transparent',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222B45',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  closeButtonText: {
    fontSize: 28,
    color: '#A0A4A8',
    lineHeight: 28,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 22,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0,
  },
  routeCardExpanded: {
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  routeCardHeader: {
    marginBottom: 8,
  },
  routeCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222B45',
    marginBottom: 10,
  },
  routePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  stationPill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 6,
    backgroundColor: '#E0F7FA',
  },
  stationPillText: {
    fontSize: 15,
    fontWeight: '600',
  },
  expandedContent: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7B8794',
    marginBottom: 10,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  stationPillLarge: {
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#E0F7FA',
    marginRight: 8,
    marginBottom: 8,
  },
  stationPillTextLarge: {
    fontSize: 16,
    fontWeight: '700',
  },
  arrowLarge: {
    fontSize: 18,
    color: '#B0B4B8',
    marginRight: 8,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2EC4B6',
    borderRadius: 22,
    paddingVertical: 13,
    alignItems: 'center',
    marginRight: 6,
    shadowColor: '#2EC4B6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F3F6F9',
    borderRadius: 22,
    paddingVertical: 13,
    alignItems: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#E0E4EA',
  },
  secondaryButtonText: {
    color: '#2EC4B6',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default RouteSelection;
