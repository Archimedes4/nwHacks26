import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, 
  TextInput, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { submitJsonData } from '../functions/database'; 

export default function Assistant() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    gender: '', // Male or Female
    age: '',
    sleepDuration: '',
    activityTime: '',
    height: '',
    weight: '',
    restingHeartrate: '', // Optional
    dailySteps: '',      // Optional
    stressLevel: '',     // Optional
  });

  const updateField = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handlePress = async () => {
    // Basic Validation
    const { gender, age, sleepDuration, activityTime, height, weight } = form;
    if (!gender || !age || !sleepDuration || !activityTime || !height || !weight) {
      Alert.alert("Missing Info", "Please fill in all required fields.");
      return;
    }

    setLoading(true);
    
    // Prepare data (converting strings to numbers where necessary)
    const submissionData = {
      gender: form.gender,
      age: parseInt(form.age),
      sleep_duration: parseFloat(form.sleepDuration),
      activity_minutes: parseInt(form.activityTime),
      height_cm: parseInt(form.height),
      weight_kg: parseInt(form.weight),
      resting_heartrate: form.restingHeartrate ? parseInt(form.restingHeartrate) : null,
      daily_steps: form.dailySteps ? parseInt(form.dailySteps) : null,
      stress_level: form.stressLevel ? parseInt(form.stressLevel) : null,
      timestamp: new Date().toISOString(),
    };

    try {
      await submitJsonData(submissionData);
      Alert.alert("Success", "Health data recorded!");
      // Optional: Clear form here
    } catch (err) {
      Alert.alert("Error", "Failed to submit data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Health Metrics</Text>

        {/* Gender Selection */}
        <Text style={styles.label}>Gender*</Text>
        <View style={styles.row}>
          {['Male', 'Female'].map((option) => (
            <TouchableOpacity 
              key={option}
              style={[styles.selector, form.gender === option && styles.selectedBox]}
              onPress={() => updateField('gender', option)}
            >
              <Text style={form.gender === option ? styles.selectedText : styles.unselectedText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Fields */}
        <InputField label="Age (1-100)*" value={form.age} onChangeText={(v) => updateField('age', v)} placeholder="e.g. 25" keyboardType="numeric" />
        <InputField label="Sleep Duration (Hours)*" value={form.sleepDuration} onChangeText={(v) => updateField('sleepDuration', v)} placeholder="e.g. 7.5" keyboardType="decimal-pad" />
        <InputField label="Activity (Minutes/Day)*" value={form.activityTime} onChangeText={(v) => updateField('activityTime', v)} placeholder="e.g. 45" keyboardType="numeric" />
        
        <View style={styles.row}>
          <InputField label="Height (cm)*" value={form.height} onChangeText={(v) => updateField('height', v)} placeholder="180" keyboardType="numeric" containerStyle={{flex: 1, marginRight: 10}} />
          <InputField label="Weight (kg)*" value={form.weight} onChangeText={(v) => updateField('weight', v)} placeholder="75" keyboardType="numeric" containerStyle={{flex: 1}} />
        </View>

        <Text style={styles.optionalDivider}>Optional Information</Text>

        <InputField label="Resting Heartrate" value={form.restingHeartrate} onChangeText={(v) => updateField('restingHeartrate', v)} placeholder="60" keyboardType="numeric" />
        <InputField label="Daily Steps" value={form.dailySteps} onChangeText={(v) => updateField('dailySteps', v)} placeholder="8000" keyboardType="numeric" />
        <InputField label="Stress Level (1-10)" value={form.stressLevel} onChangeText={(v) => updateField('stressLevel', v)} placeholder="5" keyboardType="numeric" />

        <TouchableOpacity 
          style={[styles.button, loading && styles.disabled]} 
          onPress={handlePress}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Submitting..." : "Submit Health Data"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Reusable Input Component
const InputField = ({ label, containerStyle, ...props }) => (
  <View style={[styles.inputGroup, containerStyle]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} {...props} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  selector: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  selectedBox: {
    backgroundColor: '#3ecf8e',
    borderColor: '#3ecf8e',
  },
  selectedText: { color: 'white', fontWeight: 'bold' },
  unselectedText: { color: '#666' },
  optionalDivider: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    color: '#666',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
  },
  button: {
    backgroundColor: '#3ecf8e',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabled: {
    backgroundColor: '#a0a0a0',
  }
});