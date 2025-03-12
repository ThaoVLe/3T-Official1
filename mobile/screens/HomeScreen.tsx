import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

// Temporary mock data until we connect to the backend
const mockEntries = [
  {id: '1', title: 'First Entry', date: '2025-03-10'},
  {id: '2', title: 'Second Entry', date: '2025-03-09'},
];

export const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const [entries, setEntries] = useState(mockEntries);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // For debugging
    console.log("HomeScreen rendered with entries:", entries);
  }, []);

  const handleLogout = () => {
    navigation.replace('Auth');
  };

  const renderItem = ({item}: any) => (
    <TouchableOpacity
      style={styles.entryItem}
      onPress={() => navigation.navigate('Entry', {entryId: item.id})}
    >
      <Text style={styles.entryTitle}>{item.title}</Text>
      <Text style={styles.entryDate}>{item.date}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Journal</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.newButton}
            onPress={() => navigation.navigate('Entry')}
          >
            <Text style={styles.newButtonText}>New Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No entries yet. Create your first one!</Text>
          <TouchableOpacity
            style={styles.createFirstButton}
            onPress={() => navigation.navigate('Entry')}
          >
            <Text style={styles.createFirstButtonText}>Create First Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  newButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  newButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
  },
  entryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  entryDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  createFirstButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  createFirstButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});