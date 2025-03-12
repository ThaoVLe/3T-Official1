
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, AuthScreenRouteProp } from '../navigation/types';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../services/firebase';

type AuthScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Auth'>;
  route: AuthScreenRouteProp;
};

export const AuthScreen: React.FC<AuthScreenProps> = ({ navigation, route }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Check if we've been redirected here due to session expiry
  useEffect(() => {
    if (route.params?.sessionExpired) {
      Alert.alert('Session Expired', 'Please sign in again to continue');
    }
  }, [route.params]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      if (isLogin) {
        // Handle login
        await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in successfully');
      } else {
        // Handle signup
        await createUserWithEmailAndPassword(auth, email, password);
        console.log('User created successfully');
      }
    } catch (error) {
      console.error('Auth error:', error);
      Alert.alert(
        'Authentication Error',
        error instanceof Error ? error.message : 'Failed to authenticate'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Personal Journal</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Sign in to continue' : 'Create a new account'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            testID="email-input"
          />
          
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            testID="password-input"
          />
          
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleAuth}
            disabled={loading}
            testID="auth-button"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Log In' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
            testID="toggle-auth-mode"
          >
            <Text style={styles.switchText}>
              {isLogin ? 'Need an account? Sign up' : 'Have an account? Log in'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#212529',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#6c757d',
  },
  input: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  button: {
    width: '100%',
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchText: {
    color: '#007bff',
    fontSize: 16,
  },
});
