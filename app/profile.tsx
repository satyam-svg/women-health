import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Icon from 'react-native-vector-icons/Ionicons'; // Ensure react-native-vector-icons is installed
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesom6 from '@expo/vector-icons/FontAwesome';
const Tab = createBottomTabNavigator();

const ProfileContent = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header section with user info */}
      <ThemedView style={styles.headerContainer}>
        <View style={styles.userInfo}>
        <FontAwesom6 name="user-circle" size={50} color="skyblue" />
          <View style={styles.userText}>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.userName}>Dipanshu Kumar</Text>
          </View>
        </View>

        {/* AI Doctor Chat Section */}
        <View style={styles.aiDoctorContainer}>
          <View style={{ width: '60%' }}>
            <Text style={styles.aiDoctorTitle}>Chat in AI Doctor</Text>
            <Text style={styles.aiDoctorDescription}>
              You can ask her your medical questions. You can ask him your medical questions and know the required medicines.
            </Text>
            <TouchableOpacity style={styles.startChatButton}>
              <Text style={styles.startChatButtonText}>Start Chat</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={ require('../assets/images/Chatbot.png')} // replace with actual image source
            style={styles.doctorImage}
          />
        </View>
      </ThemedView>

      {/* Cards Section */}
      <View style={styles.cardContainer}>
  {[
    { title: 'Mental Health', subtitle: '16 Conversations', iconComponent: <Entypo name="lab-flask" size={30} color="green" /> },
    { title: 'Physical Health', subtitle: '12 Conversations', iconComponent1: <FontAwesome name="heartbeat" size={24} color="blue" /> },
    { title: 'Nutrition', subtitle: '8 Conversations', iconComponent2: <MaterialIcons name="health-and-safety" size={24} color="orange" /> },
    { title: 'Sleep Health', subtitle: '5 Conversations', iconComponent3: <FontAwesome5 name="capsules" size={24} color="pink" /> },
  ].map((card, index) => (
    <View key={index} style={styles.card}>
      <View
        style={[
          styles.cardIconContainer,
          (card.iconComponent) && { backgroundColor: '#00A8591A' },
          card.iconComponent1 && { backgroundColor: '#0057A81A' },
          card.iconComponent2 && {backgroundColor:'#EB71001A'},
           card.iconComponent3 && {backgroundColor:'#E005CA1A'}// Apply custom background if iconComponent or iconComponent1 exists
        ]}
      >
        {card.iconComponent ? (
          card.iconComponent
        ) : card.iconComponent1 ? (
          card.iconComponent1
        ) : card.iconComponent2 ? (
            card.iconComponent2
        ) : card.iconComponent3 ? (
            card.iconComponent3
        ):(
          <Image
            source={{ uri: card.iconUri }}
            style={styles.cardIcon}
          />
        )}
      </View>
      <Text style={styles.cardTitle}>{card.title}</Text>
      <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
    </View>
  ))}
</View>
    </ScrollView>
  );
};

const Profile = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Doctor') {
            iconName = 'person-outline';
          } else if (route.name === 'Message') {
            iconName = 'chatbubble-outline';
          } else if (route.name === 'Medicine') {
            iconName = 'medkit-outline';
          } else if (route.name === 'History') {
            iconName = 'time-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1A73E8',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={ProfileContent} />
      <Tab.Screen name="Doctor" component={ProfileContent} />
      <Tab.Screen name="Message" component={ProfileContent} />
      <Tab.Screen name="Medicine" component={ProfileContent} />
      <Tab.Screen name="History" component={ProfileContent} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    flexDirection:'column',
    
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#F7F8FA',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userText: {
    marginLeft: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: '#888',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  aiDoctorContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  aiDoctorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A73E8',
  },
  aiDoctorDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  startChatButton: {
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#1A73E8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  startChatButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  doctorImage: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#F7F8FA',
  },
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default Profile;
