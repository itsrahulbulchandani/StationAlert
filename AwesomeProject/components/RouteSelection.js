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
  Image,
} from 'react-native';
import {TabContext} from '../App';
import {useTheme} from '../src/context/ThemeContext';
import stationsFromKeys from './stationsFromKeys';
import { lightenColor } from '../utilities/helper';
import { AdBanner } from '../src/components/AdBanner';
import { BlurView } from '@react-native-community/blur';

const { width } = Dimensions.get('window');

// Keeping pastelColors as a fallback
const pastelColors = [
  '#E0F7FA', '#FCE4EC', '#FFF9C4', '#E1BEE7', '#C8E6C9', '#FFECB3', '#B3E5FC', '#FFCDD2', '#D1C4E9', '#DCEDC8'
];

const RouteSelection = ({onClose}) => {
  const {selectedRoute, routesFound, setSelectedRoute, setActiveTab, handleSetAlert, alertActive} = useContext(TabContext);
  const { theme } = useTheme();
  const [expandedIndex, setExpandedIndex] = useState(0);

  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const renderRoute = ({item, index}) => {
    console.log('renderRoute called with item:', item);
    const isExpanded = expandedIndex === index;
    
    // Calculate total travel time (just a placeholder)
    const totalMinutes = 19; // This would normally be calculated based on route data
    
    return (
      <TouchableOpacity
        onPress={() => toggleExpand(index)}
        style={[styles.routeCard, isExpanded && styles.routeCardExpanded]}
        activeOpacity={0.9}>
        {Platform.OS === 'ios' ? (
          <></>
          // <BlurView
          //   style={styles.cardBlur}
          //   blurType="light"
          //   blurAmount={0}
          //   reducedTransparencyFallbackColor="white"
          // />
        ) : (
          <View style={[styles.cardBlur, { backgroundColor: 'rgba(255,255,255,0.95)' }]} />
        )}
        
        <View style={styles.routeCardHeader}>
          <View style={styles.routeHeaderTop}>
            <Text style={[styles.routeCardTitle, { color: theme.headerTextColor }]}>
              {stationsFromKeys[item?.path[0]]} → {stationsFromKeys[item?.path[item?.path?.length - 1]]}
            </Text>
            
            {/* {!isExpanded && (
              <TouchableOpacity 
                style={styles.expandButton} 
                onPress={() => toggleExpand(index)}>
                <Text style={styles.expandButtonText}>⌄</Text>
              </TouchableOpacity>
            )} */}
          </View>

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
                    <Text style={[styles.stationPillText, {color:"black"/*  item?.lineChangeColors[idx] */}]}>{stationsFromKeys[station]}</Text>
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
            <TouchableOpacity 
              style={[
                styles.secondaryButton,
                alertActive && styles.disabledButton
              ]} 
              onPress={() => !alertActive && handleSetAlert(item)}
              disabled={alertActive}
            >
              <Text style={[
                styles.secondaryButtonText,
                alertActive && styles.disabledButtonText
              ]}>
                {alertActive ? 'Alerts Active' : 'Set Alerts'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.tapHintContainer}>
            <Text style={[styles.tapHintText, { color: theme.labelColor }]}>
              {index === expandedIndex ? 'Hide full route' : 'Tap to see full route'}
            </Text>
          </View>
        </View>
        
        {isExpanded && (
          <View style={[styles.expandedContent, { borderTopColor: 'rgba(0,0,0,0.1)' }]}>
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
        
        {/* Features section at the bottom */}
        {/* {isExpanded && (
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <View style={styles.checkboxIcon}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              <Text style={styles.featureText}>Plan a journey</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.checkboxIcon}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              <Text style={styles.featureText}>Works offline</Text>
            </View>
            <View style={styles.featureItem}>
              <View style={styles.checkboxIcon}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
              <Text style={styles.featureText}>Latest maps</Text>
            </View>
          </View>
        )} */}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.modalContainer}>
      {Platform.OS === 'ios' ? (
        <BlurView
          style={styles.modalBackgroundBlur}
          blurType="light"
          blurAmount={55}
          reducedTransparencyFallbackColor="white"
        />
      ) : (
        <View style={styles.modalBackgroundBlur} />
      )}
      
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'transparent' }]}>
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
          <View style={styles.header}>
            {Platform.OS === 'ios' ? (
              <></>
              // <BlurView
              //   style={styles.headerBlur}
              //   blurType="light"
              //   blurAmount={0}
              //   reducedTransparencyFallbackColor="white"
              // />
            ) : (
              <View style={[styles.headerBlur, { backgroundColor: 'rgba(255,255,255,0.9)' }]} />
            )}
            <Text style={[styles.headerTitle, { color: theme.headerTextColor }]}>Route Details</Text>
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: 'rgba(255,255,255,0.8)' }]} onPress={onClose}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    position: 'relative',
  },
  modalBackgroundBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.95)' : undefined,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 32,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0,
    elevation: 0,
    position: 'relative',
    zIndex: 10,
  },
  headerBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textAlign: 'left',
    fontFamily: 'System',
    zIndex: 1,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    backdropFilter: 'blur(10px)',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 28,
    lineHeight: 28,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 0,
    paddingBottom: 80,
  },
  routeCard: {
    borderRadius: 0,
    marginBottom: 20,
    marginHorizontal: 0,
    paddingVertical: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    display: 'flex',
    elevation: 4,
    borderWidth: 0,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  cardBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  routeCardExpanded: {
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  routeCardHeader: {
    marginBottom: 8,
    zIndex: 1,
    paddingHorizontal: 20,
    // width: '100%',
  },
  routeHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeCardTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#222B45',
    marginBottom: 10,
  },
  expandButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(240,240,240,0.6)',
    backdropFilter: 'blur(10px)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  interchangeRow: {
    marginTop: 4,
  },
  interchangeLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ff1c64',
    marginRight: 8,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  directRouteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#7B8794',
  },
  tapHintContainer: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  tapHintText: {
    fontSize: 14,
    color: '#8F9BB3',
    fontStyle: 'italic',
  },
  stationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
    marginRight: 10,
    marginTop: 8,
  },
  stationName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 2,
  },
  expandedContent: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
    paddingTop: 16,
    paddingHorizontal: 20,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 26,
    opacity: 0.8,
    // width: '100%',
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
  stationLineContainer: {
    flex: 1,
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
    // textShadowOffset: { width: -1, height: -0 },
    // textShadowColor: '#000000',
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
    fontSize: 18,
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
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
    opacity: 0.7,
  },
  disabledButtonText: {
    color: '#666',
  },
  featuresSection: {
    marginTop: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxIcon: {
    width: 24,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#2F3A8E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
  },
  featureText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default RouteSelection;
