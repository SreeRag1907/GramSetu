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
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../../i18n/useI18n';
import { createUser, checkUserExists, getUserByPhone } from '../../services/userService';
const LoginRegistration = () => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
    name: '',
    state: '',
    district: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);

  const handleSendOTP = async () => {
    if (formData.phoneNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Checking your account...');
    
    try {
      // Check if user already exists
      const exists = await checkUserExists(formData.phoneNumber);
      setUserExists(exists);
      setIsExistingUser(exists);
      
      // Simulate OTP sending
      setTimeout(() => {
        setOtpSent(true);
        setIsLoading(false);
        setLoadingMessage('');
        
        const message = exists 
          ? `Welcome back! OTP sent to ${formData.phoneNumber}. Demo OTP: 123456`
          : `OTP sent to ${formData.phoneNumber}. Demo OTP: 123456`;
        
        Alert.alert('OTP Sent', message);
      }, 1000);
      
    } catch (error) {
      console.error('Send OTP error:', error);
      setIsLoading(false);
      setLoadingMessage('');
      Alert.alert('Error', `Failed to verify phone number: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleVerifyOTP = async () => {
    if (formData.otp !== '123456') {
      Alert.alert('Error', 'Please enter the correct OTP');
      return;
    }

    setIsLoading(true);
    setLoadingMessage(isExistingUser ? 'Logging you in...' : 'Verifying your phone...');
    
    try {
      if (isExistingUser) {
        // User exists - proceed with login
        const userResult = await getUserByPhone(formData.phoneNumber);
        
        if (userResult.success && userResult.data) {
          setLoadingMessage('Welcome back! Setting up your session...');
          
          // Store user data and navigate to dashboard
          await AsyncStorage.setItem('userPhone', formData.phoneNumber);
          await AsyncStorage.setItem('userName', userResult.data.name);
          await AsyncStorage.setItem('userState', userResult.data.state);
          await AsyncStorage.setItem('userDistrict', userResult.data.district);
          await AsyncStorage.setItem('isOnboarded', 'true');
          
          setIsLoading(false);
          setLoadingMessage('');
          
          // Navigate directly without alert in production
          setTimeout(() => {
            router.replace('/dashboard');
          }, 500);
        } else {
          setIsLoading(false);
          setLoadingMessage('');
          Alert.alert('Error', 'Failed to retrieve user data. Please try again.');
        }
      } else {
        // New user - proceed to registration form
        setOtpVerified(true);
        setIsLoading(false);
        setLoadingMessage('');
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      setIsLoading(false);
      setLoadingMessage('');
      Alert.alert('Error', `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRegistration = async () => {
    if (!formData.name || !formData.state || !formData.district ) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Creating your account...');
    
    try {
      // Prepare user data
      const userData = {
        phoneNumber: formData.phoneNumber,
        name: formData.name.trim(),
        state: formData.state.trim(),
        district: formData.district.trim(),
      };

      // Save to Firebase
      const result = await createUser(userData);

      if (result.success) {
        setLoadingMessage('Saving to local storage...');

        // Save to AsyncStorage for local access
        await AsyncStorage.setItem('userName', formData.name);
        await AsyncStorage.setItem('userPhone', formData.phoneNumber);
        await AsyncStorage.setItem('userState', formData.state);
        await AsyncStorage.setItem('userDistrict', formData.district);
        await AsyncStorage.setItem('isOnboarded', 'true');

        setLoadingMessage('Registration complete!');
        
        setTimeout(() => {
          router.replace('/dashboard');
        }, 500);
      } else {
        Alert.alert('Error', result.error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
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
          <Text style={styles.title}>
            {!otpSent 
              ? "Login to GramSetu" 
              : userExists === null 
                ? "Verify Phone Number"
                : userExists 
                  ? "Welcome Back!" 
                  : "New User Registration"
            }
          </Text>
          <Text style={styles.subtitle}>
            {!otpSent 
              ? "Enter your mobile number to continue" 
              : userExists === null 
                ? "Please verify your phone number to continue"
                : userExists 
                  ? "Please enter the OTP to login to your account" 
                  : "You're a new user! Please complete your profile"
            }
          </Text>
        </View>

        {/* Phone Number Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📱 {!otpSent ? "Login with Mobile Number" : "Verification Code"}
          </Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your 10-digit mobile number"
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
                {isLoading ? "Checking..." : "Login / Register"}
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
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? "Verifying..." : userExists ? "Login" : "Verify OTP"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>✅ Phone number verified successfully!</Text>
            </View>
          )}
        </View>

        {/* Personal Information - Only show for new users */}
        {otpVerified && !isExistingUser && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Complete Your Profile</Text>
            
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
              <Text style={styles.label}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your state (e.g., Maharashtra)"
                value={formData.state}
                onChangeText={(text) => updateFormData('state', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>District</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your district (e.g., Pune)"
                value={formData.district}
                onChangeText={(text) => updateFormData('district', text)}
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
              onPress={handleRegistration}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.primaryButtonText}>Creating Account...</Text>
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Loading Modal */}
      <Modal
        visible={isLoading}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.loadingModal}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingTitle}>
              {userExists === null 
                ? "Checking Account" 
                : userExists 
                  ? "Logging In" 
                  : otpVerified 
                    ? "Creating Account" 
                    : "Verifying Phone"
              }
            </Text>
            <Text style={styles.loadingSubtitle}>{loadingMessage}</Text>
          </View>
        </View>
      </Modal>
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
  disabledButton: {
    backgroundColor: '#A5D6A7',
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    minWidth: 250,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  debugButton: {
    backgroundColor: '#FF9800',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  debugButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
});

export default LoginRegistration;
