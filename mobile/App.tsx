
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './screens/HomeScreen';
import { EntryScreen } from './screens/EntryScreen';
import { AuthScreen } from './screens/AuthScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Define the type for our stack navigator
export type RootStackParamList = {
  Home: undefined;
  Auth: undefined;
  Entry: { entryId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    // For now, we'll just simulate this check
    setTimeout(() => {
      setIsLoggedIn(false);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {isLoggedIn ? (
            <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Entry" 
                component={EntryScreen} 
                options={{ headerShown: false }}
              />
            </>
          ) : (
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
