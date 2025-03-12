
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type EntryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Entry'>;
  route: RouteProp<RootStackParamList, 'Entry'>;
};

export function EntryScreen({ navigation, route }: EntryScreenProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const entryId = route.params?.entryId;
  const isEditing = !!entryId;

  useEffect(() => {
    if (isEditing) {
      // Simulate fetching entry data
      setTimeout(() => {
        setTitle('Sample Entry Title');
        setContent('This is a sample journal entry content. You can edit this text.');
        setInitialLoading(false);
      }, 1000);
    } else {
      setInitialLoading(false);
    }
  }, [isEditing]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your entry');
      return;
    }

    setLoading(true);
    
    // Simulate saving
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success', 
        isEditing ? 'Entry updated successfully' : 'Entry created successfully',
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    }, 1000);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{isEditing ? 'Edit Entry' : 'New Entry'}</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.titleInput}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
            />
            
            <TextInput
              style={styles.contentInput}
              placeholder="Write your journal entry here..."
              value={content}
              onChangeText={setContent}
              multiline={true}
              placeholderTextColor="#999"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  cancelButton: {
    marginRight: 12,
    padding: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  inputContainer: {
    padding: 16,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  contentInput: {
    fontSize: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
    height: 300,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
});
