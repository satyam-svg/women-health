import React, { useState } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, Alert, View, Text, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link } from 'expo-router';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch('http://192.168.192.168:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Store the username from the response
        const username = data.username; // Ensure your backend returns this
        Alert.alert('Login Successful', `Welcome, ${username}!`);

        
        router.push({ pathname: '/profile', params: { username } });
      } else {
        Alert.alert('Login Failed', data.message || 'Incorrect email or password.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.logoContainer}>
        <Image source={require('../assets/images/medicare.png')} style={{ height: 50, width: 50 }} />
        <ThemedText style={{ fontWeight: 'bold', fontSize: 30, marginTop: 20 }}>Medicare</ThemedText>
      </ThemedView>
      <ThemedView style={styles.innerContainer}>
        <ThemedText style={styles.title}>Sign In</ThemedText>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter email"
          value={email}
          onChangeText={setEmail}
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

        <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Reset password link sent')}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don’t have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.signupLink}><Link href="/signup">Sign Up</Link></Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <ThemedView style={styles.icons}>
          <ThemedView style={{ width: 50, height: 50, backgroundColor: '#FF5A5F', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
            <AntDesign name="google" size={24} color="white" />
          </ThemedView>
          <ThemedView style={{ width: 50, height: 50, backgroundColor: '#FF5A5F', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
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
  logoContainer:{
    backgroundColor: '#CAF0F8',
    alignItems: 'center',
    marginTop:40,
    
  },
  innerContainer: {
    marginTop: '20%',
    width: '100%',
    height: '100%',
    padding: 40,
    borderRadius: 40,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 70,
    color: '#333',
  },
  label: {
    fontSize: 16,
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
    fontSize: 16,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 50,
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
  icons:{
    flex: 1,
    flexDirection: 'row',
    gap: 20,
    justifyContent: 'center'
  }
});

export default LoginPage;
