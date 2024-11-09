import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert, TextInput, Modal, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Schedule = () => {
  const [selectedTimes, setSelectedTimes] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [newMedicine, setNewMedicine] = useState({ name: '', dosage: '', schedule: '', capsulesLeft: '' });
  const [medications, setMedications] = useState([]);
  const[morning, setMorning] = useState(true);
  const [evening, setEvening] = useState(true); // Evening state
  const [night, setNight] = useState(true); // Night state

  const fetchMedications = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'You need to be logged in to fetch medications.');
        return;
      }

      const response = await fetch('http://192.168.167.168:3000/medicines', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data[0].morning)
        if (data[0].morning !== true) {
          setMorning(false);
        }
        if (data[0].evening !== true) {
          setEvening(false); // Check for evening field
        }
        if (data[0].night !== true) {
          setNight(false); // Check for night field
        }
        setMedications(data);}
      else Alert.alert('Error', data.message || 'Failed to fetch medications.');
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  useEffect(() => {
    fetchMedications();
  }, []);

  const handleAddMedicine = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Authentication Error', 'You need to be logged in to add medication.');
      return;
    }

    try {
      const response = await fetch('http://192.168.167.168:3000/add-medicine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newMedicine),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Medicine added successfully.');

        setModalVisible(false);
        setNewMedicine({ name: '', dosage: '', schedule: '', capsulesLeft: '' });
        fetchMedications();
      } else {
        Alert.alert('Error', data.message || 'Failed to add medicine.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  const handleTimeSelection = async (medicationId, time) => {
    setSelectedTimes(prev => {
      // Get the current selection for this medication, if any
      const medicationTimes = prev[medicationId] || []; 
      
      // Toggle the selected state for the clicked time (Morning, Evening, Night)
      const updatedTimes = medicationTimes.includes(time)
        ? medicationTimes.filter(t => t !== time) // Deselect time if already selected
        : [...medicationTimes, time]; // Select time if not selected
  
      // Send PATCH request to update the medication time on the backend
      updateMedicationTime(medicationId, time, !medicationTimes.includes(time)); // Toggle selection on backend
    
      // Update the selected times for this medication only
      return { ...prev, [medicationId]: updatedTimes };
    });
  };
  
  // Function to send PATCH request to update the medication time on the backend
  const updateMedicationTime = async (medicationId, time, selected) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Error', 'You need to be logged in to update medication time.');
        return;
      }
  
      const response = await fetch(`http://192.168.167.168:3000/update-medication-time/${medicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          time: time,      // "morning", "evening", or "night"
          selected: selected,  // true or false
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Medication time updated successfully.');
      } else {
        Alert.alert('Error', data.message || 'Failed to update medication time.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
      console.log(error);
    }
  };
  
  

  const renderMedication = ({ item }) => (
    <View style={styles.medicationCard}>
      <View style={styles.medicationInfo}>
        <FontAwesome name="medkit" size={24} color="#1A73E8" />
        <View style={styles.medicationDetails}>
          <Text style={styles.medicationName}>{item.name} - {item.dosage}</Text>
          <Text style={styles.medicationSchedule}>{item.schedule}</Text>
          <View style={styles.medicationFooter}>
            <View style={styles.timeSelection}>
              {/* Dynamic Button Style based on selectedTimes state */}
              {['morning', 'evening', 'night'].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeCircle,
                    selectedTimes[item._id]?.includes(time) ? styles.selectedCircle : styles.unselectedCircle
                  ]}
                  onPress={() => handleTimeSelection(item._id, time)}
                >
                  <Text style={styles.timeText}>{time.charAt(0).toUpperCase() + time.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.capsuleCount}>{item.capsulesLeft} capsules remain</Text>
          </View>
        </View>
      </View>
    </View>
  );
  
  
  
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/images/medicare.png')} style={styles.logo} />
        <Text style={styles.headerTitle}>MEDICARE</Text>
        <Icon name="notifications-outline" size={24} color="black" style={styles.notificationIcon} />
      </View>

      <View style={styles.upcomingSection}>
        <Text style={styles.sectionTitle}>Upcoming Medications</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={medications}
        renderItem={renderMedication}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        style={styles.medicationList}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Medicine</Text>
              <TextInput
                placeholder="Name"
                value={newMedicine.name}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, name: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Dosage"
                value={newMedicine.dosage}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, dosage: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Schedule"
                value={newMedicine.schedule}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, schedule: text })}
                style={styles.input}
              />
              <TextInput
                placeholder="Capsules Left"
                value={newMedicine.capsulesLeft}
                onChangeText={(text) => setNewMedicine({ ...newMedicine, capsulesLeft: text })}
                keyboardType="numeric"
                style={styles.input}
              />
              <TouchableOpacity onPress={handleAddMedicine} style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Add Medicine</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logo: {
    width: 30,
    height: 30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A73E8',
  },
  notificationIcon: {
    padding: 10,
  },
  upcomingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#1A73E8',
  },
  medicationList: {
    marginBottom: 20,
  },
  medicationCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationDetails: {
    marginLeft: 10,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  medicationSchedule: {
    fontSize: 14,
    color: '#555',
  },
  medicationFooter: {
    marginTop: 5,
  },
  timeSelection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  timeCircle: {
    width: 70,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  selectedCircle: {
    backgroundColor: 'green',
  },
  unselectedCircle: {
    backgroundColor: 'red',
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  capsuleCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1A73E8',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderBottomWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  submitButton: {
    backgroundColor: '#1A73E8',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#333',
  },
  
});

export default Schedule;