import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';

const Permissions = () => {
  const [locationGranted, setLocationGranted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const requestLocationPermission = async () => {
    setIsRequesting(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        setLocationGranted(true);
        Alert.alert('Success!', 'Location permission granted. You\'ll get personalized weather and advisories.');
      } else {
        Alert.alert(
          'Permission Required',
          'Location access helps us provide personalized weather and farming advisories. You can still use the app without it.',
          [
            { text: 'Skip for now', onPress: () => handleContinue() },
            { text: 'Try again', onPress: () => requestLocationPermission() }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to request location permission');
    }
    
    setIsRequesting(false);
  };

  const handleContinue = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.title}>Location Services</Text>
        <Text style={styles.description}>
          GramSetu uses your location to provide:
        </Text>

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌤️</Text>
            <Text style={styles.featureText}>Local weather forecasts and alerts</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Nearby market prices</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Regional farming advisories</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏛️</Text>
            <Text style={styles.featureText}>Location-specific government schemes</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          {!locationGranted ? (
            <TouchableOpacity
              style={styles.allowButton}
              onPress={requestLocationPermission}
              disabled={isRequesting}
            >
              <Text style={styles.allowButtonText}>
                {isRequesting ? 'Requesting...' : 'Allow Location Access'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>✅ Location access granted!</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleContinue}
          >
            <Text style={styles.skipButtonText}>
              {locationGranted ? 'Continue to Dashboard' : 'Skip for now'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.privacyNote}>
          🔒 Your location data is used only to enhance your farming experience and is never shared with third parties.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 80,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  featuresList: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: 30,
  },
  allowButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  allowButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: '#E8F5E8',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  privacyNote: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});

export default Permissions;
