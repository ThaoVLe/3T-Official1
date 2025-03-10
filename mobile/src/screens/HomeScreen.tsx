import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

// Temporary mock data for testing
const mockEntries = [
  { id: '1', title: 'First Entry', createdAt: '2025-03-10' },
  { id: '2', title: 'Second Entry', createdAt: '2025-03-09' },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleNewEntry = () => {
    navigation.navigate('Entry');
  };

  const handleLogout = () => {
    navigation.replace('Auth');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.newButton} onPress={handleNewEntry}>
          <Text style={styles.newButtonText}>New Entry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={mockEntries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.entryItem}
            onPress={() => navigation.navigate('Entry', { entryId: item.id })}
          >
            <Text style={styles.entryTitle}>{item.title}</Text>
            <Text style={styles.entryDate}>{item.createdAt}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  newButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  newButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  logoutButton: {
    padding: 10,
  },
  logoutButtonText: {
    color: '#FF3B30',
  },
  entryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  entryDate: {
    fontSize: 14,
    color: '#666666',
    marginTop: 5,
  },
});
