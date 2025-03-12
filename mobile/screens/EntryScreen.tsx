
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
  Alert
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';

type EntryScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Entry'>;
  route: RouteProp<RootStackParamList, 'Entry'>;
};

export const EntryScreen: React.FC<EntryScreenProps> = ({ navigation, route }) => {
  const entryId = route.params?.entryId;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // For debugging
    console.log("EntryScreen rendered with entryId:", entryId);
    
    // If we have an entryId, this is an edit, so we should load the entry
    if (entryId) {
      // For now we'll use mock data
      const mockEntry = { 
        id: entryId, 
        title: 'Sample Entry', 
        content: 'This is the content of the entry', 
        date: '2025-03-10' 
      };
      
      setTitle(mockEntry.title);
      setContent(mockEntry.content);
    }
  }, [entryId]);

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'Please enter a title or content for your entry');
      return;
    }
    
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      navigation.goBack();
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {entryId ? 'Edit Entry' : 'New Entry'}
        </Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Title (optional)"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.contentInput}
          placeholder="Write your thoughts..."
          value={content}
          onChangeText={setContent}
          multiline={true}
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    padding: 8,
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    minHeight: 200,
    padding: 8,
  },
});
