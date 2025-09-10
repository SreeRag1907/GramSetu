import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Modal, Alert, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../i18n/useI18n';
import {
  dashboardModules,
  quickActions,
  recentActivities,
  defaultWeatherData,
  getGreeting,
  formatDate,
  WeatherData,
} from '../data/dashboard-data';
import { languages } from '../data/onboarding-data';

const Dashboard = () => {
  const { t, currentLanguage, changeLanguage } = useI18n();
  
  // Get translated modules
  const getTranslatedModules = () => {
    return dashboardModules.map(module => ({
      ...module,
      title: getModuleTitle(module.id),
      subtitle: getModuleSubtitle(module.id)
    }));
  };

  const getModuleTitle = (moduleId: string) => {
    switch (moduleId) {
      case 'marketplace': return t('modules.marketplace');
      case 'climate': return t('modules.weather');
      case 'chatbot': return t('modules.aiAssistant');
      case 'schemes': return t('modules.schemes');
      case 'labor': return t('modules.labor');
      default: return moduleId;
    }
  };

  const getModuleSubtitle = (moduleId: string) => {
    switch (moduleId) {
      case 'marketplace': return t('modules.marketplaceSubtitle');
      case 'climate': return t('modules.weatherSubtitle');
      case 'chatbot': return t('modules.aiAssistantSubtitle');
      case 'schemes': return t('modules.schemesSubtitle');
      case 'labor': return t('modules.laborSubtitle');
      default: return '';
    }
  };

  const getTranslatedQuickActions = () => {
    return quickActions.map(action => ({
      ...action,
      title: getQuickActionTitle(action.id)
    }));
  };

  const getQuickActionTitle = (actionId: string) => {
    switch (actionId) {
      case 'weather': return t('quickActions.todayWeather');
      case 'market': return t('quickActions.marketPrices');
      case 'query': return t('quickActions.quickQuery');
      case 'alerts': return t('quickActions.alerts');
      default: return actionId;
    }
  };
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData>(defaultWeatherData);

  useEffect(() => {
    loadUserData();
    checkOnboardingStatus();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const isOnboarded = await AsyncStorage.getItem('isOnboarded');
      if (isOnboarded !== 'true') {
        router.replace('/onboarding/language');
        return;
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const village = await AsyncStorage.getItem('userVillage');
      const district = await AsyncStorage.getItem('userDistrict');
      
      if (name) setUserName(name);
      if (village && district) {
        setWeatherData(prev => ({
          ...prev,
          location: `${village}, ${district}`
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };



  const handleLogout = async () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirmation'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel'
        },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setShowProfileMenu(false);
              router.replace('/get-started' as any);
            } catch (error) {
              Alert.alert(t('common.error'), t('profile.logoutError'));
            }
          }
        }
      ]
    );
  };

  const handleLanguageSelect = async (languageCode: string) => {
    try {
      await changeLanguage(languageCode);
      setShowLanguageDropdown(false);
      setShowProfileMenu(false);
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.languageChangeError'));
    }
  };



  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>{t('dashboard.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&q=80' }}
        style={styles.header}
        resizeMode="cover"
      >
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting(currentTime)}</Text>
              <Text style={styles.userName}>{userName || t('dashboard.farmer')}</Text>
              <Text style={styles.date}>{formatDate(currentTime)}</Text>
            </View>
            <TouchableOpacity 
              style={styles.profileButton} 
              onPress={() => setShowProfileMenu(true)}
            >
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/chatbot')}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchText}>{t('dashboard.searchPlaceholder')}</Text>
            <Text style={styles.micIcon}>🎤</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Weather Widget */}
      <View style={styles.weatherWidget}>
        <View style={styles.weatherLeft}>
          <Text style={styles.locationIcon}>📍</Text>
          <View>
            <Text style={styles.locationText}>{weatherData.location}</Text>
            <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
            <Text style={styles.weatherCondition}>{weatherData.condition}</Text>
          </View>
        </View>
        <View style={styles.weatherRight}>
          <Text style={styles.weatherIcon}>⛅</Text>
          <View style={styles.weatherDetails}>
            <Text style={styles.weatherDetail}>Humidity {weatherData.humidity}%</Text>
            <Text style={styles.weatherDetail}>Good day for farming</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsContainer}>
          {getTranslatedQuickActions().map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => router.push(action.route as any)}
            >
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
              <Text style={styles.quickActionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Modules */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('dashboard.mainModules')}</Text>
        <View style={styles.modulesGrid}>
          {getTranslatedModules().map((module, index) => (
            <TouchableOpacity
              key={module.id}
              style={[
                styles.moduleCard,
                index % 2 === 0 ? styles.moduleCardLeft : styles.moduleCardRight
              ]}
              onPress={() => router.push(module.route as any)}
              activeOpacity={0.8}
            >
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleIcon}>{module.icon}</Text>
                {module.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{module.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.moduleTitle}>{module.title}</Text>
              <Text style={styles.moduleSubtitle}>{module.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('dashboard.recentActivities')}</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>{t.viewAll}</Text>
          </TouchableOpacity>
        </View>
        {recentActivities.map((activity) => (
          <View key={activity.id} style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <Text style={styles.activityIconText}>
                {activity.type === 'weather' ? '🌤️' : 
                 activity.type === 'scheme' ? '🏛️' : '💰'}
              </Text>
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
    
    {/* Profile Menu Modal */}
    {showProfileMenu && (
      <Modal
        visible={showProfileMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowProfileMenu(false);
          setShowLanguageDropdown(false);
        }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowProfileMenu(false);
            setShowLanguageDropdown(false);
          }}
        >
          <View style={styles.profileMenu}>
            <View style={styles.profileMenuHeader}>
              <Text style={styles.profileMenuTitle}>{t('profile.menu')}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.profileMenuItem}
              onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
            >
              <Text style={styles.profileMenuIcon}>🌐</Text>
              <Text style={styles.profileMenuText}>{t('profile.changeLanguage')}</Text>
              <Text style={styles.dropdownIcon}>{showLanguageDropdown ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            
            {/* Language Dropdown */}
            {showLanguageDropdown && (
              <View style={styles.languageDropdown}>
                {languages.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageOption,
                      currentLanguage === language.code && styles.selectedLanguage
                    ]}
                    onPress={() => handleLanguageSelect(language.code)}
                  >
                    <Text style={[
                      styles.languageOptionText,
                      currentLanguage === language.code && styles.selectedLanguageText
                    ]}>
                      {language.native}
                    </Text>
                    {currentLanguage === language.code && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.profileMenuItem, styles.logoutMenuItem]}
              onPress={handleLogout}
            >
              <Text style={styles.profileMenuIcon}>🚪</Text>
              <Text style={[styles.profileMenuText, styles.logoutText]}>{t('profile.logout')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    )}
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 55,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76, 175, 80, 0.35)',
  },
  headerContent: {
    paddingHorizontal: 20,
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 20,
    color: 'white',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  date: {
    fontSize: 14,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  profileButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileIcon: {
    fontSize: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  micIcon: {
    fontSize: 16,
  },
  weatherWidget: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  temperature: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  weatherCondition: {
    fontSize: 12,
    color: '#666',
  },
  weatherRight: {
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 40,
    marginBottom: 5,
  },
  weatherDetails: {
    alignItems: 'center',
  },
  weatherDetail: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  quickActionsContainer: {
    marginBottom: 5,
  },
  quickActionCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginRight: 12,
    alignItems: 'center',
    minWidth: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  moduleCardLeft: {
    marginRight: '2%',
  },
  moduleCardRight: {
    marginLeft: '2%',
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  moduleIcon: {
    fontSize: 32,
  },
  badge: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  moduleSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  activityCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activityIcon: {
    width: 35,
    height: 35,
    backgroundColor: '#F8F9FA',
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityIconText: {
    fontSize: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#999',
  },
  bottomSpacing: {
    height: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  profileMenu: {
    backgroundColor: 'white',
    borderRadius: 15,
    width: '100%',
    maxWidth: 320,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  profileMenuHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  profileMenuTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoutMenuItem: {
    borderBottomWidth: 0,
  },
  profileMenuIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 25,
    textAlign: 'center',
  },
  profileMenuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  logoutText: {
    color: '#FF4444',
    fontWeight: '600',
  },
  dropdownIcon: {
    fontSize: 14,
    color: '#666',
    marginLeft: 'auto',
  },
  languageDropdown: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 10,
  },
  currentLanguageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 15,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  selectedLanguage: {
    backgroundColor: '#E8F5E8',
  },
  languageOptionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  selectedLanguageText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});

export default Dashboard;
