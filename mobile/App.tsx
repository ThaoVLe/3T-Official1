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
import { auth, db } from './src/services/firebase'; // Assuming db is imported from firebase
import { onAuthStateChanged } from '@firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import necessary Firebase functions


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

    // For debugging - log the current auth state
    console.log('Current auth state:', auth.currentUser ? 'User logged in' : 'No user logged in');

    return subscriber; // unsubscribe on unmount
  }, []);

  const checkLastLogin = async (uid) => {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
          //Simulate last login check. Replace with actual logic to compare last_login timestamp.
          const lastLogin = userDoc.data().last_login;
          // Replace with actual logic to determine if session is expired.
          const isExpired = false; // Replace with a real expiration check.  Example:  Date.now() - lastLogin > 60 * 60 * 1000; // Expired after 1 hour
          return isExpired;
      } else {
        return true; // User not found in database. Treat as expired.
      }
    } catch (error) {
      console.error("Error checking last login:", error);
      return true; // Treat as expired on error.
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (user) {
        const expired = await checkLastLogin(user.uid);
        if (expired) {
          // Session expired, redirect to login (This part is simplified)
          setUser(null); // Simulate logout
        }
      }
      setInitializing(false);
    };
    if (user) {
        checkAuth();
    }
  }, [user]);


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
          initialRouteName="Auth"
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
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
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
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}