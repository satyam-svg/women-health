import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Animated, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import Robot from '@expo/vector-icons/FontAwesome5';
import { useGlobalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const ChatScreen = () => {
  const { username } = useGlobalSearchParams();
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [showCategories, setShowCategories] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Animated values for typing dots
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  // Typing animation sequence
  const startTypingAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot1Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3Anim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ])
    ).start();
  };

  useEffect(() => {
    if (isTyping) {
      startTypingAnimation();
    } else {
      dot1Anim.setValue(0);
      dot2Anim.setValue(0);
      dot3Anim.setValue(0);
    }
  }, [isTyping]);

  // Image picker function
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Function to handle sending the message and image together
  const handleSend = async () => {
    if (userInput.trim() === '' && !selectedImage) return;
  
    // Prepare the form data
    const formData = new FormData();
    formData.append('symptoms', userInput);
    formData.append('username', username);
  
    // If an image is selected, append it to the form data
    if (selectedImage) {
      formData.append('image', {
        uri: selectedImage,
        name: 'uploaded_image.jpg',
        type: 'image/jpeg',
      });
    }
  
    // Send the form data to the server
    setMessages(prevMessages => [
      ...prevMessages,
      { id: Date.now().toString(), text: userInput, sender: 'user', image: selectedImage },  // Include image in the message
    ]);
    setUserInput('');
    setShowCategories(false);
    setIsTyping(true);
  
    // Reset the image after sending
    setSelectedImage(null);
  
    try {
      const response = await fetch('http://192.168.167.168:3000/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',  // Updated to handle form data
        },
        body: formData,
      });
  
      const data = await response.json();
      const aiMessage = { id: Date.now().toString(), text: data.response, sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };
  
  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'ai' ? styles.aiMessage : styles.userMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      {item.image && <Image source={{ uri: item.image }} style={styles.previewImage} />}
    </View>
  );
  

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Conversation</Text>
          <TouchableOpacity>
            <Icon name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 20, marginTop: 60 }}>
          <View style={styles.robotIcon}>
            <Robot name="robot" size={30} color="orange" />
          </View>
          <Text style={styles.doctorName}>AI Doctor</Text>
        </View>
        <Text style={styles.encryptionInfo}>This is a private message, between you and AI Doctor. This chat is end-to-end encrypted...</Text>
      </View>

      {/* Chat Section */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.chatContainer}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingIndicator}>
          <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot3Anim }]} />
        </View>
      )}

      {/* Image Picker and Upload */}
      <View style={styles.imageUploadContainer}>
        {selectedImage && (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        )}
        <TouchableOpacity style={styles.pickImageButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>
      </View>

      {/* Chat Input */}
      <View style={styles.chatInputContainer}>
        <TextInput
          placeholder="How can I assist you?"
          style={styles.chatInput}
          placeholderTextColor="#C4C4C4"
          value={userInput}
          onChangeText={text => setUserInput(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Icon name="send" size={25} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#3E69FE',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    height: '30%',
  },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  robotIcon: { height: 60, width: 60, backgroundColor: '#7879F1', borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  doctorName: { fontSize: 15, fontWeight: 'bold', color: 'white', paddingTop: 15 },
  encryptionInfo: { fontSize: 15, fontWeight: 'bold', color: 'white', marginLeft: 20, marginTop: 10 },
  chatContainer: { paddingHorizontal: 10, paddingBottom: 10, marginTop: 20 },
  messageContainer: {
    maxWidth: '70%',
    padding: 10,
    marginBottom: 10,
  },
  aiMessage: { alignSelf: 'flex-start', backgroundColor: '#3E69FE', borderTopRightRadius: 22, borderTopLeftRadius: 22, borderBottomRightRadius: 22 },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#05294B', borderTopRightRadius: 11.5, borderTopLeftRadius: 11.5, borderBottomLeftRadius: 11.5 },
  messageText: { color: 'white', fontSize: 14 },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 25,
    marginVertical: 10,
    backgroundColor: '#EBECEF',
    borderRadius: 25,
    paddingHorizontal: 13,
    height: 55,
  },
  chatInput: { flex: 1, fontSize: 14, color: '#333' },
  sendButton: {
    backgroundColor: '#4871F4',
    padding: 13,
    borderRadius: 20,
    alignItems: 'center',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 20,
  },
  dot: {
    height: 10,
    width: 10,
    backgroundColor: '#3E69FE',
    borderRadius: 5,
    marginHorizontal: 2,
  },
  imageUploadContainer: { flexDirection: 'row', alignItems: 'center', margin: 10 },
  pickImageButton: {
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 10,
    marginLeft: 10,
  },
  previewImage: { width: 60, height: 60, borderRadius: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});

export default ChatScreen;
