// SplashScreenAnimation.tsx
import React, { useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
// Define the props interface
interface SplashScreenAnimationProps {
  onFinish: () => void; // The function to call when the animation finishes
}

const SplashScreenAnimation: React.FC<SplashScreenAnimationProps> = ({ onFinish }) => {
  const animation = useRef<LottieView>(null);

  useEffect(() => {
    animation.current?.play();
    const timer = setTimeout(onFinish, 3000); // Adjust time to match animation duration
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <ThemedView style={styles.container}>
      <StatusBar hidden/>
      <LottieView
        ref={animation}
        source={require('../assets/medical.json')} 
        autoPlay
        loop={false}
        style={{ width: 250, height: 250 }}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CAF0F8',
  },
});

export default SplashScreenAnimation;
