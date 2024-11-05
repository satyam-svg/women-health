import React, { useState } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, Alert, View, Text, Image, Dimensions } from 'react-native';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';

const { width, height } = Dimensions.get('window');

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    // Check for empty fields
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
  
    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
  
    // Attempt to send signup data to server
    try {
      const response = await fetch('192.168.192.168:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });
  
      const data = await response.json();
      if (response.ok) {
        // Success popup
        Alert.alert('Success', 'User registered successfully!');
      } else {
        // Error popup if registration failed
        Alert.alert('Error', data.message || 'Failed to create user.');
      }
    } catch (error) {
      // Log the error and show an alert
      console.error('Signup Error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };
  

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.logoContainer}>
        <Image source={require('../assets/images/medicare.png')} style={styles.logoImage} />
        <ThemedText style={styles.logoText}>Medicare</ThemedText>
      </ThemedView>
      <ThemedView style={styles.innerContainer}>
        <ThemedText style={styles.title}>Sign Up</ThemedText>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Reset password link sent')}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Already have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.signupLink}><Link href="/login">Sign in</Link></Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <ThemedView style={styles.icons}>
          <ThemedView style={styles.iconWrapper}>
            <AntDesign name="google" size={24} color="white" />
          </ThemedView>
          <ThemedView style={styles.iconWrapper}>
            <FontAwesome name="facebook-f" size={24} color="white" />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CAF0F8',
  },
  logoContainer: {
    backgroundColor: '#CAF0F8',
    alignItems: 'center',
    marginTop: height * 0.05,
  },
  logoImage: {
    height: 50,
    width: 50,
    resizeMode: 'contain',
  },
  logoText: {
    fontWeight: 'bold',
    fontSize: width * 0.08,
    marginTop: 20,
  },
  innerContainer: {
    marginTop: '10%',
    width: '100%',
    padding: 40,
    borderRadius: 40,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    flex: 1,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: height * 0.04,
    color: '#333',
  },
  label: {
    fontSize: width * 0.04,
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderBottomWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  forgotPassword: {
    color: '#007AFF',
    textAlign: 'right',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: width * 0.045,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.05,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  orText: {
    marginHorizontal: 10,
    color: '#ccc',
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#333',
  },
  signupLink: {
    color: '#FF5A5F',
    fontWeight: 'bold',
  },
  icons: {
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center',
    marginTop: height * 0.02,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
});

export default LoginPage;
