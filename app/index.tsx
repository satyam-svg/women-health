import React from 'react';
import { StyleSheet, StatusBar, Image, Button } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import { useFonts } from 'expo-font'; // Import useFonts from expo-font
import LottieView from 'lottie-react-native';
import { Link } from 'expo-router';
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
      <Image
        source={require('../assets/images/doctor.png')}
        
      />
      </ThemedView>

      <ThemedView style={styles.getstarted}>
            <ThemedView style={{width:137,height:50,borderRadius:15,backgroundColor:'#E4E4E4',flex:1,justifyContent:'center',alignItems:'center'}}>
              <ThemedText style={{fontWeight:'900',fontSize:20,color:'black'}}><Link href="/login">Sign in</Link></ThemedText>
            </ThemedView>
            <ThemedView style={{width:137,height:50,borderRadius:15,backgroundColor:'#3E69FE',flex:1,justifyContent:'center',alignItems:'center'}}>
            <ThemedText style={{fontWeight:'900',fontSize:20,color:'black'}}>Get Started</ThemedText>
            </ThemedView>
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
    color: 'black'
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  lottieContainer: {
    width: 250,  // Set the width for the Lottie animation container
    height: 500, // Set the height for the Lottie animation container
    justifyContent: 'center', // Center the animation
    alignItems: 'center', // Center the animation
    backgroundColor: 'transparent', // Set background to transparent
  },
  lottie: {
    width: '100%', // Make the animation fill the container
    height: '100%', // Make the animation fill the container
  },
  getstarted:{
    marginTop:50,
    backgroundColor: '#CAF0F8',
    flex:1,
    flexDirection:'row',
    gap:20
  }
});

export default StartScreen;
