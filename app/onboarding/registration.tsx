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
import { createUser, checkUserExists } from '../../services/userService';
const Registration = () => {
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
  const [registrationProgress, setRegistrationProgress] = useState('');

    const handleSendOTP = async () => {
    if (formData.phoneNumber.length !== 10) {
      Alert.alert(t('common.error'), t('registration.errors.invalidPhone'));
      return;
    }

    setIsLoading(true);
    // Simulate OTP sending
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
      Alert.alert(t('registration.otpSent'), `${t('registration.otpSentMessage')} ${formData.phoneNumber}. ${t('registration.demoOtp')}`);
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    if (formData.otp !== '123456') {
      Alert.alert(t('common.error'), t('registration.errors.invalidOtp'));
      return;
    }

    setOtpVerified(true);
    Alert.alert(t('common.success'), t('registration.phoneVerified'));
  };

  const handleRegistration = async () => {
    if (!formData.name || !formData.state || !formData.district ) {
      Alert.alert(t('common.error'), t('registration.errors.fillAllFields'));
      return;
    }

    setIsLoading(true);
    setRegistrationProgress('Checking Firebase connection...');
    
    try {
      console.log('🔍 Starting registration process for:', formData.phoneNumber);
            
      setRegistrationProgress('Checking if user already exists...');
      
      // Check if user already exists
      const userExists = await checkUserExists(formData.phoneNumber);
      
      if (userExists) {
        console.log('❌ User already exists:', formData.phoneNumber);
        Alert.alert(t('common.error'), 'User with this phone number already exists!');
        setIsLoading(false);
        setRegistrationProgress('');
        return;
      }

      console.log('✅ User does not exist, proceeding with registration');
      setRegistrationProgress('Creating your account...');

      // Prepare user data
      const userData = {
        phoneNumber: formData.phoneNumber,
        name: formData.name.trim(),
        state: formData.state.trim(),
        district: formData.district.trim(),
      };

      console.log('📝 User data to save:', userData);

      // Save to Firebase
      const result = await createUser(userData);

      console.log('🔥 Firebase result:', result);

      if (result.success) {
        console.log('✅ User created successfully in Firebase');
        setRegistrationProgress('Saving to local storage...');

        // Save to AsyncStorage for local access
        await AsyncStorage.setItem('userName', formData.name);
        await AsyncStorage.setItem('userState', formData.state);
        await AsyncStorage.setItem('userDistrict', formData.district);
        await AsyncStorage.setItem('userPhone', formData.phoneNumber);
        await AsyncStorage.setItem('isOnboarded', 'true');

        console.log('✅ Data saved to AsyncStorage');
        setRegistrationProgress('Registration completed!');

        setTimeout(() => {
          Alert.alert(t('registration.welcome'), t('registration.registrationComplete'), [
            { text: t('common.continue'), onPress: () => router.replace('/dashboard') }
          ]);
        }, 500);

      } else {
        console.error('❌ Firebase registration failed:', result.error);
        Alert.alert(t('common.error'), result.error || t('registration.errors.registrationFailed'));
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      Alert.alert(t('common.error'), t('registration.errors.registrationFailed'));
    } finally {
      setIsLoading(false);
      setRegistrationProgress('');
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
          <Text style={styles.title}>{t('registration.createAccount')}</Text>
          <Text style={styles.subtitle}>{t('registration.joinFarmers')}</Text>
        </View>

        {/* Phone Number Verification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 {t('registration.phoneVerification')}</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('registration.mobileNumber')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('registration.placeholders.enterPhone')}
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
                {isLoading ? t('registration.sending') : t('registration.sendOtp')}
              </Text>
            </TouchableOpacity>
          ) : !otpVerified ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t('registration.enterOtp')}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={t('registration.placeholders.enterOtp')}
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
                <Text style={styles.primaryButtonText}>{t('registration.verifyOtp')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>✅ {t('registration.phoneVerifiedSuccess')}</Text>
            </View>
          )}
        </View>

        {/* Personal Information */}
        {otpVerified && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 {t('registration.personalInformation')}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('registration.fullName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('registration.placeholders.enterName')}
                value={formData.name}
                onChangeText={(text) => updateFormData('name', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('registration.state')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('registration.placeholders.enterState')}
                value={formData.state}
                onChangeText={(text) => updateFormData('state', text)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('registration.district')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('registration.placeholders.enterDistrict')}
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
                <Text style={styles.primaryButtonText}>{t('registration.completeRegistration')}</Text>
              )}
            </TouchableOpacity>

            {/* Debug Firebase Button */}
            
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
            <Text style={styles.loadingTitle}>Creating Your Account</Text>
            <Text style={styles.loadingSubtitle}>{registrationProgress}</Text>
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

export default Registration;
