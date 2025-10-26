import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  ImageBackground,
  StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { useI18n } from '../i18n/useI18n';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GetStartedScreen = () => {
  const { t } = useI18n();

  const handleGetStarted = () => {
    router.push('/onboarding/registration');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800&q=80' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />
        
        {/* Content Container */}
        <View style={styles.container}>
          
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Text style={styles.leafIcon}>🌱</Text>
              </View>
              <Text style={styles.appTitle}>GramSetu</Text>
              <Text style={styles.tagline}>{t('onboarding.tagline')}</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.contentSection}>
            <View style={styles.featureCard}>
              <Text style={styles.welcomeText}>{t('onboarding.welcome')}</Text>
              <Text style={styles.mainTitle}>{t('onboarding.transformAgriculture')}</Text>
              <Text style={styles.subtitle}>
                {t('onboarding.description')}
              </Text>
              
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🤖</Text>
                  <Text style={styles.featureText}>{t('onboarding.features.aiAssistant')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🌤️</Text>
                  <Text style={styles.featureText}>{t('onboarding.features.weatherInsights')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>💰</Text>
                  <Text style={styles.featureText}>{t('onboarding.features.marketPrices')}</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🏛️</Text>
                  <Text style={styles.featureText}>{t('onboarding.features.govtSchemes')}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bottom Section */}
          <View style={styles.bottomSection}>
            <TouchableOpacity 
              style={styles.getStartedButton} 
              onPress={handleGetStarted}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedText}>Continue to Login</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
            
            <Text style={styles.footerText}>
              {t('onboarding.joinFarmers')}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: screenWidth,
    height: screenHeight,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerSection: {
    flex: 0.3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  leafIcon: {
    fontSize: 40,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 18,
    color: '#E8F5E8',
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  contentSection: {
    flex: 0.5,
    justifyContent: 'center',
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
    fontWeight: '400',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  featureText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomSection: {
    flex: 0.2,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
    justifyContent: 'center',
  },
  getStartedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },
  arrowIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default GetStartedScreen;
