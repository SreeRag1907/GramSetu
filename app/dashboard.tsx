import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator, Modal, Alert } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [weatherData, setWeatherData] = useState({
    temperature: 28,
    humidity: 65,
    condition: 'Partly Cloudy',
    location: 'Your Location'
  });

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

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              setShowProfileMenu(false);
              router.replace('/get-started' as any);
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleChangeLanguage = () => {
    setShowProfileMenu(false);
    router.push('/onboarding/language');
  };

  const modules = [
    {
      id: 'marketplace',
      title: 'Marketplace',
      subtitle: 'Sell & Buy Produce',
      icon: '🛒',
      route: '/marketplace',
      gradient: ['#4CAF50', '#66BB6A'],
      badge: '3'
    },
    {
      id: 'climate',
      title: 'Weather',
      subtitle: 'Climate Analysis',
      icon: '🌤️',
      route: '/climate',
      gradient: ['#2196F3', '#42A5F5'],
      badge: null
    },
    {
      id: 'chatbot',
      title: 'AI Assistant',
      subtitle: 'Smart Farming Tips',
      icon: '🤖',
      route: '/chatbot',
      gradient: ['#FF9800', '#FFA726'],
      badge: null
    },
    {
      id: 'schemes',
      title: 'Schemes',
      subtitle: 'Government Benefits',
      icon: '🏛️',
      route: '/schemes',
      gradient: ['#9C27B0', '#BA68C8'],
      badge: '2'
    },
    {
      id: 'labor',
      title: 'Labor',
      subtitle: 'Workforce Management',
      icon: '👥',
      route: '/labor',
      gradient: ['#F44336', '#EF5350'],
      badge: null
    }
  ];

  const quickActions = [
    { id: 'weather', title: 'Today\'s Weather', icon: '☀️', route: '/climate' },
    { id: 'prices', title: 'Market Prices', icon: '💰', route: '/marketplace' },
    { id: 'ai', title: 'Quick Query', icon: '�', route: '/chatbot' },
    { id: 'alerts', title: 'Alerts', icon: '🔔', route: '/schemes' }
  ];

  const recentActivities = [
    { id: '1', title: 'Weather forecast updated', time: '2 hours ago', type: 'weather' },
    { id: '2', title: 'New scheme available', time: '5 hours ago', type: 'scheme' },
    { id: '3', title: 'Market price alert: Rice ↗️', time: '1 day ago', type: 'market' }
  ];

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading GramSetu...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {getGreeting()}</Text>
            <Text style={styles.userName}>{userName || 'Farmer'}</Text>
            <Text style={styles.date}>{formatDate()}</Text>
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
          <Text style={styles.searchText}>Search here... Ask AI assistant</Text>
          <Text style={styles.micIcon}>🎤</Text>
        </TouchableOpacity>
      </View>

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
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
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
        <Text style={styles.sectionTitle}>Farm Management</Text>
        <View style={styles.modulesGrid}>
          {modules.map((module, index) => (
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
          <Text style={styles.sectionTitle}>Recent Updates</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View all</Text>
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
        onRequestClose={() => setShowProfileMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowProfileMenu(false)}
        >
          <View style={styles.profileMenu}>
            <View style={styles.profileMenuHeader}>
              <Text style={styles.profileMenuTitle}>Profile Menu</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.profileMenuItem}
              onPress={handleChangeLanguage}
            >
              <Text style={styles.profileMenuIcon}>🌐</Text>
              <Text style={styles.profileMenuText}>Change Language</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.profileMenuItem, styles.logoutMenuItem]}
              onPress={handleLogout}
            >
              <Text style={styles.profileMenuIcon}>🚪</Text>
              <Text style={[styles.profileMenuText, styles.logoutText]}>Logout</Text>
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
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#E8F5E8',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#C8E6C9',
  },
  profileButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 5,
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
    marginTop: -15,
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
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingTop: 100,
    paddingRight: 20,
  },
  profileMenu: {
    backgroundColor: 'white',
    borderRadius: 15,
    minWidth: 200,
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
});

export default Dashboard;
