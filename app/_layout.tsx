import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import SplashScreenAnimation from '../components/SplashScreenAnimation';
import StartScreen from '../components/Starter'; // Import your LoginScreen

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false); // New state for login

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync(); // Hide Expo’s native splash
    }
  }, [loaded]);

  const handleSplashFinish = () => {
    setShowSplash(false); // Transition to login after splash
  };

 
  if (!loaded) return null;

  return (
    showSplash ? (
      <SplashScreenAnimation onFinish={handleSplashFinish} />
    ) : loggedIn ? ( // Show main app layout if logged in
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    ) : ( // Show login component if not logged in
      <StartScreen  />
    )
  );
}
