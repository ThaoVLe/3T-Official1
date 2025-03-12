import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { EntryScreen } from './src/screens/EntryScreen';
import type { RootStackParamList } from './src/navigation/types';
import { auth } from './src/services/firebase';
import { onAuthStateChanged } from '@firebase/auth';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  function onAuthStateChange(user) {
    console.log('Auth state changed, user:', user ? 'Logged in' : 'Not logged in');
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    // Check for authentication state when the app loads
    console.log('Checking authentication state...');
    const subscriber = onAuthStateChanged(auth, onAuthStateChange);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: '#000000',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          {!user ? (
            // Auth screen stack
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen}
              options={{ headerShown: false }}
            />
          ) : (
            // Main app screens when user is authenticated
            <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{
                  title: 'My Journal',
                  headerLeft: () => null,
                }}
              />
              <Stack.Screen 
                name="Entry" 
                component={EntryScreen}
                options={{ title: 'Journal Entry' }}
              />
            </>
          )}
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}