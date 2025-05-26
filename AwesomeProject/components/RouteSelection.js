import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import {TabContext} from '../App';
import {useTheme} from '../src/context/ThemeContext';
import stationsFromKeys from './stationsFromKeys';
import { lightenColor } from '../utilities/helper';
import { AdBanner } from '../src/components/AdBanner';
const { width } = Dimensions.get('window');

// Keeping pastelColors as a fallback
const pastelColors = [
  '#E0F7FA', '#FCE4EC', '#FFF9C4', '#E1BEE7', '#C8E6C9', '#FFECB3', '#B3E5FC', '#FFCDD2', '#D1C4E9', '#DCEDC8'
];

const RouteSelection = ({onClose}) => {
  const {selectedRoute, routesFound, setSelectedRoute, setActiveTab, handleSetAlert} = useContext(TabContext);
  const { theme } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState(0);

  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderRoute = ({item, index}) => {
    console.log('renderRoute called with item:', item);
    const isExpanded = expandedIndex === index;
    return (
      <TouchableOpacity
        onPress={() => toggleExpand(index)}
        style={[styles.routeCard, { backgroundColor: theme.cardBackground }, isExpanded && styles.routeCardExpanded]}
        activeOpacity={0.9}>
        <View style={styles.routeCardHeader}>
          <Text style={[styles.routeCardTitle, { color: theme.headerTextColor }]}>
            {stationsFromKeys[item?.path[0]]} → {stationsFromKeys[item?.path[item?.path?.length - 1]]}
          </Text>
          
          {/* Only show interchange stations if they exist */}
          {item?.interChangeStations?.length > 0 ? (
            <View style={styles.interchangeRow}>
              <Text style={styles.interchangeLabel}>Interchanges:</Text>
              <View style={styles.pillsContainer}>
                {item?.interChangeStations?.map((station, idx) => (
                  <View 
                    key={idx}
                    style={[
                      styles.stationPill, 
                      {backgroundColor: item?.lineChangeColors[idx] ? lightenColor(item?.lineChangeColors[idx]) : pastelColors[idx % pastelColors.length]}
                    ]}
                  >
                    <Text style={[styles.stationPillText, {color: item?.lineChangeColors[idx]}]}>{stationsFromKeys[station]}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={[styles.directRouteText, { color: theme.labelColor }]}>Direct Route</Text>
          )}
          
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
          
          <View style={styles.tapHintContainer}>
            <Text style={[styles.tapHintText, { color: theme.labelColor }]}>
              {index === expandedIndex ? 'Hide full route' : 'Tap to see full route'}
            </Text>
          </View>
        </View>
        {index === expandedIndex && (
          <View style={[styles.expandedContent, { borderTopColor: theme.borderColor }]}>
            <Text style={[styles.sectionTitle, { color: theme.headerTextColor }]}>Full Route</Text>
            <View style={styles.routeListContainer}>
              {item.path?.map((station, idx) => {
                // Check if this station is an interchange station
                const isInterchange = item?.interChangeStations?.includes(station);
                
                const dotColor = idx === 0 || idx === item?.path?.length - 1 
                  ? theme.text 
                  : (isInterchange ? '#FF9800' : item?.colorPath[idx]);
                
                return (
                  <View key={idx} style={styles.routeListItem}>
                    <View 
                      style={[
                        styles.stationDot,
                        isInterchange ? styles.interchangeDot : null,
                        { backgroundColor: dotColor }
                      ]}
                    />
                    <View style={styles.stationLineContainer}>
                      <View style={styles.stationNameRow}>
                        <Text style={[
                          styles.stationName,
                          { color: theme.text },
                          isInterchange && styles.interchangeStationName
                        ]}>
                          {stationsFromKeys[station]}
                        </Text>
                        
                        {isInterchange && (
                          <View style={styles.interchangePill}>
                            <Text style={styles.interchangePillText}>Interchange</Text>
                          </View>
                        )}
                      </View>
                      
                      {idx < item.path.length - 1 && (
                        <View style={[
                          styles.connectionLine,
                          {backgroundColor: item?.colorPath[idx+1] || theme.text}
                        ]} />
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.softBackground }]}>
      <View style={[styles.container, { backgroundColor: theme.softBackground }]}>
        <View style={[styles.header, { backgroundColor: theme.softBackground }]}>
          <Text style={[styles.headerTitle, { color: theme.headerTextColor }]}>Route Details</Text>
          <TouchableOpacity style={[styles.closeButton, { backgroundColor: theme.cardBackground }]} onPress={onClose}>
            <Text style={[styles.closeButtonText, { color: theme.labelColor }]}>×</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={routesFound ? routesFound : []}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderRoute}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
        <AdBanner />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F6F9',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#F3F6F9',
    paddingTop: 32,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
    elevation: 0,
  },
  headerTitle: {
    color: '#222B45',
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'left',
    fontFamily: 'System',
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
    paddingHorizontal: 20,
    paddingBottom: 80,
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
  interchangeRow: {
    marginTop: 4,
  },
  interchangeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    marginRight: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  directRouteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#7B8794',
  },
  tapHintContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  tapHintText: {
    fontSize: 12,
    color: '#8F9BB3',
    fontStyle: 'italic',
  },
  expandedContent: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222B45',
    marginBottom: 16,
  },
  routeListContainer: {
    marginBottom: 16,
  },
  routeListItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  stationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  stationLineContainer: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222B45',
    marginBottom: 2,
  },
  interchangeStationName: {
    fontWeight: '700',
  },
  stationNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  interchangeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  interchangePill: {
    backgroundColor: '#FF9800',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  interchangePillText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  connectionLine: {
    height: 24,
    width: 2,
    marginLeft: 5,
  },
  pathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  stationPill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginVertical: 4,
    position: 'relative',
    backgroundColor: '#E0F7FA',
  },
  stationPillText: {
    fontSize: 15,
    fontWeight: '600',
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
    marginTop: 24,
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
    backgroundColor: '#2EC4B6',
    borderRadius: 22,
    paddingVertical: 13,
    alignItems: 'center',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#2EC4B6',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default RouteSelection;
