import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import auth from '@react-native-firebase/auth';

// Mock data - replace with actual data fetching
const mockEntries = [
  {id: '1', title: 'First Entry', date: '2025-03-10'},
  {id: '2', title: 'Second Entry', date: '2025-03-09'},
];

export const HomeScreen = ({navigation}: any) => {
  const handleLogout = async () => {
    try {
      await auth().signOut();
      navigation.replace('Auth');
    } catch (error) {
      console.error(error);
    }
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
      <FlatList
        data={mockEntries}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  newButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    padding: 10,
  },
  logoutButtonText: {
    color: '#FF3B30',
  },
  list: {
    flex: 1,
  },
  entryItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  entryDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
});
