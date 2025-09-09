import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Registration = () => {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
    name: '',
    village: '',
    district: '',
    primaryCrop: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const crops = [
    'Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Maize', 'Bajra', 'Jowar',
    'Barley', 'Gram', 'Tur', 'Mustard', 'Groundnut', 'Soybean', 'Sunflower',
    'Tomato', 'Onion', 'Potato', 'Chili', 'Other'
  ];

  const handleSendOTP = async () => {
    if (formData.phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    // Simulate OTP sending
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
      Alert.alert('OTP Sent', `OTP sent to ${formData.phoneNumber}. Use 123456 for demo.`);
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    if (formData.otp !== '123456') {
      Alert.alert('Error', 'Invalid OTP. Use 123456 for demo.');
      return;
    }

    setOtpVerified(true);
    Alert.alert('Success', 'Phone number verified successfully!');
  };

  const handleRegistration = async () => {
    if (!formData.name || !formData.village || !formData.district || !formData.primaryCrop) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      await AsyncStorage.setItem('userName', formData.name);
      await AsyncStorage.setItem('userVillage', formData.village);
      await AsyncStorage.setItem('userDistrict', formData.district);
      await AsyncStorage.setItem('userPrimaryCrop', formData.primaryCrop);
      await AsyncStorage.setItem('userPhone', formData.phoneNumber);
      await AsyncStorage.setItem('isOnboarded', 'true');

      Alert.alert('Welcome!', 'Registration completed successfully!', [
        { text: 'Continue', onPress: () => router.replace('/permissions') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  const updateFormData = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join thousands of farmers using GramSetu</Text>
        </View>

        {/* Phone Number Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 Phone Verification</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit mobile number"
              value={formData.phoneNumber}
              onChangeText={(text) => updateFormData('phoneNumber', text)}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!otpVerified}
            />
          </View>

          {!otpSent ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSendOTP}
              disabled={isLoading}
            >
              <Text style={styles.primaryButtonText}>
                {isLoading ? 'Sending...' : 'Send OTP'}
              </Text>
            </TouchableOpacity>
          ) : !otpVerified ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Enter OTP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChangeText={(text) => updateFormData('otp', text)}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleVerifyOTP}
              >
                <Text style={styles.primaryButtonText}>Verify OTP</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>✅ Phone verified successfully!</Text>
            </View>
          )}
        </View>

        {/* Personal Information */}
        {otpVerified && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Personal Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Village</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your village name"
                value={formData.village}
                onChangeText={(text) => updateFormData('village', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>District</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your district"
                value={formData.district}
                onChangeText={(text) => updateFormData('district', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Primary Crop</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropSelection}>
                {crops.map((crop) => (
                  <TouchableOpacity
                    key={crop}
                    style={[
                      styles.cropButton,
                      formData.primaryCrop === crop && styles.selectedCrop
                    ]}
                    onPress={() => updateFormData('primaryCrop', crop)}
                  >
                    <Text style={[
                      styles.cropButtonText,
                      formData.primaryCrop === crop && styles.selectedCropText
                    ]}>
                      {crop}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRegistration}
            >
              <Text style={styles.primaryButtonText}>Complete Registration</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 30,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E8F5E8',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  successText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  cropSelection: {
    marginTop: 10,
  },
  cropButton: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  selectedCrop: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  cropButtonText: {
    color: '#666',
    fontSize: 14,
  },
  selectedCropText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Registration;
