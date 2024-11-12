import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Image, ScrollView, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';

const PeriodTracker = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [nextPeriod, setNextPeriod] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [history, setHistory] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    loadHistory();
    fetchNextPeriod();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('history');
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (error) {
      console.error('Failed to load history', error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowPicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const logPeriod = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.253.168:3000/set-period', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
        }),
      });
      const result = await response.json();
      fetchNextPeriod();
    } catch (error) {
      console.error('Failed to log period or fetch next period', error);
    }
  };

  const fetchNextPeriod = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error('No token found. Please log in.');
        return;
      }
      const response = await fetch('http://192.168.253.168:3000/get-next-period', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.nextPeriodDate) {
        setNextPeriod(result.nextPeriodDate);
        setHistory(result.nextPeriodDate);
      } else {
        console.error('Failed to fetch next period');
      }
    } catch (error) {
      console.error('Error fetching next period', error);
    }
  };

  // Calculate progress for the day tracker
  const calculateProgress = () => {
    const today = new Date();
    const daysPassed = Math.floor((today - new Date(startDate)) / (1000 * 60 * 60 * 24));
    return Math.min(daysPassed / cycleLength, 1); // Ensure progress is capped at 100%
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/images/medicare.png')} style={styles.logo} />
      <Text style={styles.header}>Medicare Period Tracker</Text>

      <Text style={styles.label}>Select the date of your last period</Text>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
        <Text style={styles.dateButtonText}>{startDate.toDateString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="calendar"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      <Button title="Log Period" onPress={logPeriod} color="#4CAF50" />

      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Cycle Progress</Text>
        <Progress.Bar
          progress={calculateProgress()}
          width={200}
          color="#388E3C"
          borderRadius={10}
          style={styles.progressBar}
        />
      </View>

      {nextPeriod && (
        <View style={styles.result}>
          <Text style={styles.nextPeriodText}>Next Period: {new Date(nextPeriod).toDateString()}</Text>
        </View>
      )}

      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Period History</Text>
        {history.length > 0 ? (
          <View style={styles.historyItem}>
            <Text>Last Period: {new Date(history).toDateString()}</Text>
          </View>
        ) : (
          <Text>No periods logged yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginTop: 20,
    marginBottom: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  dateButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 5,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  progressContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  progressBar: {
    marginTop: 5,
  },
  result: {
    marginTop: 20,
    backgroundColor: '#e8f5e9',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    width: '100%',
  },
  nextPeriodText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#388E3C',
    textAlign: 'center',
  },
  historyContainer: {
    width: '100%',
    marginTop: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyItem: {
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default PeriodTracker;
