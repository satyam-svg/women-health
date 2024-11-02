import React from 'react';
import { StyleSheet, StatusBar, Image } from 'react-native';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { useFonts } from 'expo-font'; // Import useFonts from expo-font
import LottieView from 'lottie-react-native';

const StartScreen = () => {
  const [fontsLoaded] = useFonts({
    OpenSansCondensedBoldItalic: require('../assets/fonts/OpenSansCondensedBoldItalic.ttf'), // Load your font
  });

  if (!fontsLoaded) {
    return null; // Optionally, you can render a loading screen or return null until the font is loaded
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar hidden />
      <Image
        source={require('../assets/images/medicare.png')}
        style={styles.image}
      />
      <ThemedText style={styles.title}>MEDICARE</ThemedText>
      <ThemedView style={styles.lottieContainer}>
        <LottieView 
          source={require('../assets/doctor.json')} 
          autoPlay 
          loop 
          style={styles.lottie} // Apply the style here
        />
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#CAF0F8', // Background color for the main container
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    fontFamily: 'OpenSansCondensedBoldItalic', // Use the loaded font family
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  lottieContainer: {
    width: 250,  // Set the width for the Lottie animation container
    height: 250, // Set the height for the Lottie animation container
    justifyContent: 'center', // Center the animation
    alignItems: 'center', // Center the animation
    backgroundColor: 'transparent', // Set background to transparent
  },
  lottie: {
    width: '100%', // Make the animation fill the container
    height: '100%', // Make the animation fill the container
  },
});

export default StartScreen;
