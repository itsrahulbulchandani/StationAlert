import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TabContext} from '../App';

const RED = '#E5252B';
const RED_SOFT = '#FDECEC';

const ProfileScreen = () => {
  const {setActiveTab, favourites = [], recentSearches = []} = useContext(TabContext);

  const items = [
    { icon: 'heart', label: 'Favourite Routes', value: `${favourites.length}`, onPress: () => setActiveTab('search route') },
    { icon: 'time-outline', label: 'Recent Searches', value: `${recentSearches.length}`, onPress: () => setActiveTab('search route') },
    { icon: 'notifications-outline', label: 'Live Alerts', value: '', onPress: () => setActiveTab('alert') },
    { icon: 'map-outline', label: 'Metro Map', value: '', onPress: () => setActiveTab('map') },
  ];

  return (
    <LinearGradient colors={['#FFF5F5', '#FFFFFF', '#FDF0F0']} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Profile</Text>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={RED} />
            </View>
            <Text style={styles.name}>Metro Traveller</Text>
            <Text style={styles.sub}>Delhi Metro Route Planner</Text>
          </View>

          <View style={styles.menuCard}>
            {items.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuRow, i < items.length - 1 && styles.menuRowBorder]}
                activeOpacity={0.7}
                onPress={item.onPress}>
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={20} color={RED} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.value ? <Text style={styles.menuValue}>{item.value}</Text> : null}
                <Ionicons name="chevron-forward" size={18} color="#C4C4C4" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 8 },
  heading: { fontSize: 32, fontWeight: '800', color: '#1A1A1A', marginBottom: 16 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: RED_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  sub: { fontSize: 14, color: '#9A9A9A', marginTop: 4 },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F2F2' },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: RED_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  menuValue: { fontSize: 15, color: '#9A9A9A', marginRight: 8, fontWeight: '600' },
});

export default ProfileScreen;
