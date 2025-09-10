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
import { useI18n } from '../../i18n/useI18n';

const Registration = () => {
  const { t } = useI18n();
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

  const getCrops = () => [
    { id: 'rice', name: t('registration.crops.rice') },
    { id: 'wheat', name: t('registration.crops.wheat') },
    { id: 'sugarcane', name: t('registration.crops.sugarcane') },
    { id: 'cotton', name: t('registration.crops.cotton') },
    { id: 'maize', name: t('registration.crops.maize') },
    { id: 'bajra', name: t('registration.crops.bajra') },
    { id: 'jowar', name: t('registration.crops.jowar') },
    { id: 'barley', name: t('registration.crops.barley') },
    { id: 'gram', name: t('registration.crops.gram') },
    { id: 'tur', name: t('registration.crops.tur') },
    { id: 'mustard', name: t('registration.crops.mustard') },
    { id: 'groundnut', name: t('registration.crops.groundnut') },
    { id: 'soybean', name: t('registration.crops.soybean') },
    { id: 'sunflower', name: t('registration.crops.sunflower') },
    { id: 'tomato', name: t('registration.crops.tomato') },
    { id: 'onion', name: t('registration.crops.onion') },
    { id: 'potato', name: t('registration.crops.potato') },
    { id: 'chili', name: t('registration.crops.chili') },
    { id: 'other', name: t('registration.crops.other') }
  ];

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
    if (!formData.name || !formData.village || !formData.district || !formData.primaryCrop) {
      Alert.alert(t('common.error'), t('registration.errors.fillAllFields'));
      return;
    }

    try {
      await AsyncStorage.setItem('userName', formData.name);
      await AsyncStorage.setItem('userVillage', formData.village);
      await AsyncStorage.setItem('userDistrict', formData.district);
      await AsyncStorage.setItem('userPrimaryCrop', formData.primaryCrop);
      await AsyncStorage.setItem('userPhone', formData.phoneNumber);
      await AsyncStorage.setItem('isOnboarded', 'true');

      Alert.alert(t('registration.welcome'), t('registration.registrationComplete'), [
        { text: t('common.continue'), onPress: () => router.replace('/dashboard') }
      ]);
    } catch (error) {
      Alert.alert(t('common.error'), t('registration.errors.registrationFailed'));
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
              <Text style={styles.label}>{t('registration.village')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('registration.placeholders.enterVillage')}
                value={formData.village}
                onChangeText={(text) => updateFormData('village', text)}
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

            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('registration.primaryCrop')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropSelection}>
                {getCrops().map((crop) => (
                  <TouchableOpacity
                    key={crop.id}
                    style={[
                      styles.cropButton,
                      formData.primaryCrop === crop.name && styles.selectedCrop
                    ]}
                    onPress={() => updateFormData('primaryCrop', crop.name)}
                  >
                    <Text style={[
                      styles.cropButtonText,
                      formData.primaryCrop === crop.name && styles.selectedCropText
                    ]}>
                      {crop.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRegistration}
            >
              <Text style={styles.primaryButtonText}>{t('registration.completeRegistration')}</Text>
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
