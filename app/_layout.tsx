import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import SplashScreenAnimation from '../components/SplashScreenAnimation';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); // Hide Expo’s native splash
    }
  }, [fontsLoaded]);

  const handleSplashFinish = () => {
    setShowSplash(false); // Transition to main layout after splash
  };

  if (!fontsLoaded) return null;

  return (
    showSplash ? (
      <SplashScreenAnimation onFinish={handleSplashFinish} />
    ) : (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    )
  );
}
