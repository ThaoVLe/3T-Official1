
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { formatDate } from '@shared/utils/date';
import type { JournalEntry } from '@shared/types/schema';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const currentUser = auth.currentUser;

  // Fetch entries when component mounts
  useEffect(() => {
    fetchUserEntries();
  }, []);

  const fetchUserEntries = async () => {
    if (!currentUser) {
      setError('No user logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch(`/api/entries?userId=${currentUser.uid}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      
      const data = await response.json();
      setEntries(data);
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load your journal entries');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // The auth state change in App.tsx will redirect to auth screen
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={styles.entryItem}
      onPress={() => navigation.navigate('Entry', { entryId: item.id })}
    >
      <Text style={styles.entryTitle}>{item.title || 'Untitled Entry'}</Text>
      <Text style={styles.entryDate}>{formatDate(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        You haven't created any journal entries yet.
      </Text>
      <TouchableOpacity
        style={[styles.newButton, styles.emptyButton]}
        onPress={() => navigation.navigate('Entry')}
      >
        <Text style={styles.newButtonText}>Create Your First Entry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.userInfoContainer}>
        {currentUser?.photoURL && (
          <Image 
            source={{ uri: currentUser.photoURL }} 
            style={styles.userAvatar} 
          />
        )}
        <View style={styles.userTextContainer}>
          <Text style={styles.welcomeText}>
            Welcome{currentUser?.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : ''}
          </Text>
          <Text style={styles.userEmail}>{currentUser?.email}</Text>
        </View>
      </View>
      
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your journal entries...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchUserEntries}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          contentContainerStyle={entries.length === 0 ? { flex: 1 } : {}}
          ListEmptyComponent={renderEmptyList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  newButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#EEEEEE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#666666',
  },
  list: {
    flex: 1,
  },
  entryItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  entryDate: {
    fontSize: 14,
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});
