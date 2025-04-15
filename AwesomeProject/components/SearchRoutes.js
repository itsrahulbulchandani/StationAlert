import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    Button,
    StyleSheet,
    SafeAreaView,
    Alert,
    StatusBar,
    TouchableOpacity,
    Modal,
    TextInput,
    FlatList,
} from 'react-native';
import { metroStation } from './metroRoutes';
import { colorLines, graph } from './graph';
import { TabContext } from '../App';
import { findAllRoutes2 } from '../utilities/helper';
// import 
// --- Mock Data ---
// const MOCK_STATIONS = [
//     'King\'s Cross',
//     'Paddington',
//     'Waterloo',
//     'Victoria',
//     'London Bridge',
//     'Euston',
//     'Liverpool Street',
//     'St Pancras International',
//     'Charing Cross',
//     'Canary Wharf',
// ];

const SearchRoutesScreen = () => {
    const [allStations] = useState(metroStation);
    const [fromStation, setFromStation] = useState('');
    const [toStation, setToStation] = useState('');
    
    // Modal visibility states
    const [showFromModal, setShowFromModal] = useState(false);
    const [showToModal, setShowToModal] = useState(false);
    
    // Search states
    const [fromSearchQuery, setFromSearchQuery] = useState('');
    const [toSearchQuery, setToSearchQuery] = useState('');
    const [filteredFromStations, setFilteredFromStations] = useState(metroStation);
    const [filteredToStations, setFilteredToStations] = useState(metroStation);
    const {setActiveTab, setSelectedRoute} = useContext(TabContext);

    

    // Filter stations based on search query
    useEffect(() => {
        if (showFromModal) {
            const filtered = allStations.filter(station => 
                station.toLowerCase().includes(fromSearchQuery.toLowerCase())
            );
            setFilteredFromStations(filtered);
        }
    }, [fromSearchQuery, showFromModal, allStations]);

    useEffect(() => {
        if (showToModal) {
            const filtered = allStations.filter(station => 
                station.toLowerCase().includes(toSearchQuery.toLowerCase())
            );
            setFilteredToStations(filtered);
        }
    }, [toSearchQuery, showToModal, allStations]);

    // Reset search when modal opens
    const openFromModal = () => {
        setFromSearchQuery('');
        setFilteredFromStations(allStations);
        setShowFromModal(true);
    };
    
    const openToModal = () => {
        setToSearchQuery('');
        setFilteredToStations(allStations);
        setShowToModal(true);
    };

    const selectFromStation = (station) => {
        setFromStation(station);
        setShowFromModal(false);
    };
    
    const selectToStation = (station) => {
        setToStation(station);
        setShowToModal(false);
    };

    const handleSearch = () => {
        if (!fromStation) {
            Alert.alert('Missing Information', 'Please select a "From" station.');
            return;
        }
        if (!toStation) {
            Alert.alert('Missing Information', 'Please select a "To" station.');
            return;
        }
        if (fromStation === toStation) {
            Alert.alert('Invalid Selection', '"From" and "To" stations cannot be the same.');
            return;
        }

        console.log(`Searching for routes from: ${fromStation} to: ${toStation}`);
        Alert.alert(
            'Search Initiated',
            `Finding routes from ${fromStation} to ${toStation}.`
        );
        const routes2 = findAllRoutes2(
          graph,
          fromStation,
          toStation,
          colorLines,
          50,
        );
        console.log("testing selected routes", routes2);
        setSelectedRoute(routes2?.[0] || []);
        setActiveTab('route');
        
    };

    // Render station item for the FlatList
    const renderStationItem = (item, onSelect) => {
        return (
            <TouchableOpacity 
                style={styles.stationItem} 
                onPress={() => onSelect(item)}
            >
                <Text style={styles.stationItemText}>{item}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
                <Text style={styles.title}>Find Train Routes</Text>

                {/* From Station Button */}
                <Text style={styles.label}>From Station:</Text>
                <TouchableOpacity 
                    style={styles.selectionButton} 
                    onPress={openFromModal}
                >
                    <Text style={[
                        styles.selectionButtonText,
                        !fromStation && styles.placeholderText
                    ]}>
                        {fromStation || 'Select From Station'}
                    </Text>
                </TouchableOpacity>

                {/* To Station Button */}
                <Text style={styles.label}>To Station:</Text>
                <TouchableOpacity 
                    style={styles.selectionButton}
                    onPress={openToModal}
                >
                    <Text style={[
                        styles.selectionButtonText,
                        !toStation && styles.placeholderText
                    ]}>
                        {toStation || 'Select To Station'}
                    </Text>
                </TouchableOpacity>

                {/* Search Button */}
                <View style={styles.buttonContainer}>
                    <Button
                        title="Search Routes"
                        onPress={handleSearch}
                        disabled={!fromStation || !toStation}
                        color="#007AFF"
                    />
                </View>

                {/* FROM Modal with Searchable List */}
                <Modal
                    visible={showFromModal}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select From Station</Text>
                            
                            {/* Search Input */}
                            <View style={styles.searchContainer}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search stations..."
                                    value={fromSearchQuery}
                                    onChangeText={setFromSearchQuery}
                                    autoFocus={true}
                                    clearButtonMode="while-editing"
                                />
                            </View>
                            
                            {/* Stations List */}
                            <FlatList
                                data={filteredFromStations}
                                keyExtractor={(item) => item}
                                renderItem={({item}) => renderStationItem(item, selectFromStation)}
                                style={styles.stationsList}
                            />
                            
                            <View style={styles.modalButtons}>
                                <Button title="Cancel" onPress={() => setShowFromModal(false)} />
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* TO Modal with Searchable List */}
                <Modal
                    visible={showToModal}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select To Station</Text>
                            
                            {/* Search Input */}
                            <View style={styles.searchContainer}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search stations..."
                                    value={toSearchQuery}
                                    onChangeText={setToSearchQuery}
                                    autoFocus={true}
                                    clearButtonMode="while-editing"
                                />
                            </View>
                            
                            {/* Stations List */}
                            <FlatList
                                data={filteredToStations}
                                keyExtractor={(item) => item}
                                renderItem={({item}) => renderStationItem(item, selectToStation)}
                                style={styles.stationsList}
                            />
                            
                            <View style={styles.modalButtons}>
                                <Button title="Cancel" onPress={() => setShowToModal(false)} />
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 25,
        textAlign: 'center',
        color: '#333',
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        color: '#555',
        fontWeight: '500',
    },
    selectionButton: {
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 15,
    },
    selectionButtonText: {
        fontSize: 16,
        color: '#444',
    },
    placeholderText: {
        color: '#999',
    },
    buttonContainer: {
        marginTop: 20,
        borderRadius: 8,
        overflow: 'hidden',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingTop: 20,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    searchContainer: {
        paddingHorizontal: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchInput: {
        height: 40,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
    },
    stationsList: {
        maxHeight: 400,
    },
    stationItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    stationItemText: {
        fontSize: 16,
    },
    modalButtons: {
        padding: 15,
    },
});

export default SearchRoutesScreen;