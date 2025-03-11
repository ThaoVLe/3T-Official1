import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { auth } from './src/services/firebase';
import { onAuthStateChanged } from '@firebase/auth';
import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { EntryScreen } from './src/screens/EntryScreen';
import type { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // Set up authentication state observer
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      
      if (user) {
        // Check if session is expired when user exists
        const expired = await isSessionExpired();
        setSessionExpired(expired);
        
        if (expired) {
          console.log('Session expired, user needs to login again');
          // Keep the user data but require re-auth
        } else {
          console.log('Session is still valid');
        }
      } else {
        setSessionExpired(false);
      }
      
      setUser(user);
      setIsLoading(false);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner
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
          {!user || sessionExpired ? (
            // Auth Stack - show when no user OR session expired
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen}
              options={{ 
                headerShown: false,
                // Pass if session expired to display different message
                initialParams: { sessionExpired }
              }}
            />
          ) : (
            // App Stack - only when user exists AND session is valid
            <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{
                  title: 'My Journal',
                  headerLeft: () => null, // Disable back button
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