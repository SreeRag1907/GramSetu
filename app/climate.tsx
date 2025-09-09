import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

interface ForecastDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  rainChance: number;
}

interface Advisory {
  id: string;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

const ClimateAnalysis = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [advisories, setAdvisories] = useState<Advisory[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'forecast' | 'advisories' | 'historical'>('current');

  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      
      // Get location
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const [address] = await Location.reverseGeocodeAsync(location.coords);
        setLocationName(`${address.city || address.district || 'Unknown'}, ${address.region || ''}`);
      }

      // Mock weather data
      const mockCurrentWeather: WeatherData = {
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        condition: 'Partly Cloudy',
        icon: '⛅',
      };

      const mockForecast: ForecastDay[] = [
        { date: '2024-01-16', day: 'Today', high: 30, low: 18, condition: 'Sunny', icon: '☀️', rainChance: 10 },
        { date: '2024-01-17', day: 'Tomorrow', high: 28, low: 16, condition: 'Partly Cloudy', icon: '⛅', rainChance: 20 },
        { date: '2024-01-18', day: 'Wed', high: 25, low: 14, condition: 'Rainy', icon: '🌧️', rainChance: 80 },
        { date: '2024-01-19', day: 'Thu', high: 26, low: 15, condition: 'Cloudy', icon: '☁️', rainChance: 40 },
        { date: '2024-01-20', day: 'Fri', high: 29, low: 17, condition: 'Sunny', icon: '☀️', rainChance: 5 },
        { date: '2024-01-21', day: 'Sat', high: 31, low: 19, condition: 'Hot', icon: '🌡️', rainChance: 0 },
        { date: '2024-01-22', day: 'Sun', high: 27, low: 16, condition: 'Windy', icon: '💨', rainChance: 15 },
      ];

      const mockAdvisories: Advisory[] = [
        {
          id: '1',
          title: 'Rain Expected Tomorrow',
          description: 'Heavy rainfall expected tomorrow. Consider postponing harvest activities and ensure proper drainage in fields.',
          icon: '🌧️',
          priority: 'high',
          category: 'Weather Alert',
        },
        {
          id: '2',
          title: 'Optimal Sowing Conditions',
          description: 'Current soil moisture and temperature conditions are ideal for sowing wheat. Consider starting within the next 3-4 days.',
          icon: '🌱',
          priority: 'medium',
          category: 'Farming Advisory',
        },
        {
          id: '3',
          title: 'Irrigation Recommendation',
          description: 'No irrigation needed for the next 2 days due to expected rainfall. This will save water and reduce costs.',
          icon: '💧',
          priority: 'medium',
          category: 'Water Management',
        },
        {
          id: '4',
          title: 'Pest Alert',
          description: 'Current humid conditions may increase pest activity. Monitor crops closely and consider preventive measures.',
          icon: '🐛',
          priority: 'high',
          category: 'Pest Management',
        },
      ];

      setCurrentWeather(mockCurrentWeather);
      setForecast(mockForecast);
      setAdvisories(mockAdvisories);
      setLoading(false);
    } catch (error) {
      console.error('Error loading weather data:', error);
      Alert.alert('Error', 'Failed to load weather data');
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const renderCurrentWeather = () => (
    <View style={styles.tabContent}>
      {currentWeather && (
        <>
          <View style={styles.currentWeatherCard}>
            <View style={styles.weatherHeader}>
              <Text style={styles.locationText}>📍 {locationName || 'Your Location'}</Text>
              <TouchableOpacity onPress={loadWeatherData}>
                <Text style={styles.refreshIcon}>🔄</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.mainWeatherInfo}>
              <Text style={styles.weatherIcon}>{currentWeather.icon}</Text>
              <View style={styles.temperatureContainer}>
                <Text style={styles.temperature}>{currentWeather.temperature}°C</Text>
                <Text style={styles.condition}>{currentWeather.condition}</Text>
              </View>
            </View>

            <View style={styles.weatherDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>💧</Text>
                <Text style={styles.detailLabel}>Humidity</Text>
                <Text style={styles.detailValue}>{currentWeather.humidity}%</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailIcon}>💨</Text>
                <Text style={styles.detailLabel}>Wind Speed</Text>
                <Text style={styles.detailValue}>{currentWeather.windSpeed} km/h</Text>
              </View>
            </View>
          </View>

          <View style={styles.quickInsights}>
            <Text style={styles.sectionTitle}>Quick Insights</Text>
            <View style={styles.insightCard}>
              <Text style={styles.insightIcon}>🌡️</Text>
              <Text style={styles.insightText}>
                Temperature is ideal for most crop activities. Good conditions for fieldwork.
              </Text>
            </View>
            <View style={styles.insightCard}>
              <Text style={styles.insightIcon}>💧</Text>
              <Text style={styles.insightText}>
                Moderate humidity levels. Monitor for fungal diseases in sensitive crops.
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );

  const renderForecast = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>7-Day Forecast</Text>
      {forecast.map((day, index) => (
        <View key={index} style={styles.forecastCard}>
          <View style={styles.forecastLeft}>
            <Text style={styles.forecastDay}>{day.day}</Text>
            <Text style={styles.forecastDate}>{day.date.split('-').slice(1).join('/')}</Text>
          </View>
          
          <View style={styles.forecastCenter}>
            <Text style={styles.forecastIcon}>{day.icon}</Text>
            <Text style={styles.forecastCondition}>{day.condition}</Text>
          </View>
          
          <View style={styles.forecastRight}>
            <Text style={styles.forecastTemp}>{day.high}°/{day.low}°</Text>
            <Text style={styles.rainChance}>☔ {day.rainChance}%</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderAdvisories = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Personalized Advisories</Text>
      {advisories.map((advisory) => (
        <View key={advisory.id} style={styles.advisoryCard}>
          <View style={styles.advisoryHeader}>
            <View style={styles.advisoryLeft}>
              <Text style={styles.advisoryIcon}>{advisory.icon}</Text>
              <View>
                <Text style={styles.advisoryTitle}>{advisory.title}</Text>
                <Text style={styles.advisoryCategory}>{advisory.category}</Text>
              </View>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(advisory.priority) }]}>
              <Text style={styles.priorityText}>{advisory.priority.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.advisoryDescription}>{advisory.description}</Text>
        </View>
      ))}
    </View>
  );

  const renderHistorical = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Historical Data</Text>
      
      <View style={styles.historicalCard}>
        <Text style={styles.historicalTitle}>📊 Rainfall Pattern (Last 30 Days)</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>📈 Rainfall Chart</Text>
          <Text style={styles.chartSubtext}>Total: 45mm | Average: 1.5mm/day</Text>
        </View>
      </View>

      <View style={styles.historicalCard}>
        <Text style={styles.historicalTitle}>🌡️ Temperature Trends (Last 30 Days)</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>📈 Temperature Chart</Text>
          <Text style={styles.chartSubtext}>Avg High: 29°C | Avg Low: 16°C</Text>
        </View>
      </View>

      <View style={styles.historicalCard}>
        <Text style={styles.historicalTitle}>💧 Humidity Levels (Last 30 Days)</Text>
        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartText}>📈 Humidity Chart</Text>
          <Text style={styles.chartSubtext}>Average: 62% | Range: 45-78%</Text>
        </View>
      </View>

      <View style={styles.comparisonCard}>
        <Text style={styles.comparisonTitle}>📅 Last Year Comparison</Text>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Rainfall</Text>
          <Text style={styles.comparisonValue}>+15% more than last year</Text>
        </View>
        <View style={styles.comparisonRow}>
          <Text style={styles.comparisonLabel}>Temperature</Text>
          <Text style={styles.comparisonValue}>2°C warmer than last year</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading weather data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Climate Analysis</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'current' && styles.activeTab]}
          onPress={() => setActiveTab('current')}
        >
          <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
            Current
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'forecast' && styles.activeTab]}
          onPress={() => setActiveTab('forecast')}
        >
          <Text style={[styles.tabText, activeTab === 'forecast' && styles.activeTabText]}>
            Forecast
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'advisories' && styles.activeTab]}
          onPress={() => setActiveTab('advisories')}
        >
          <Text style={[styles.tabText, activeTab === 'advisories' && styles.activeTabText]}>
            Advisories
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'historical' && styles.activeTab]}
          onPress={() => setActiveTab('historical')}
        >
          <Text style={[styles.tabText, activeTab === 'historical' && styles.activeTabText]}>
            Historical
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'current' && renderCurrentWeather()}
        {activeTab === 'forecast' && renderForecast()}
        {activeTab === 'advisories' && renderAdvisories()}
        {activeTab === 'historical' && renderHistorical()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 24,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#2196F3',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  currentWeatherCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  refreshIcon: {
    fontSize: 20,
  },
  mainWeatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherIcon: {
    fontSize: 80,
    marginRight: 20,
  },
  temperatureContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  condition: {
    fontSize: 18,
    color: '#666',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  quickInsights: {
    marginTop: 10,
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  forecastCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  forecastLeft: {
    width: 80,
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  forecastDate: {
    fontSize: 12,
    color: '#666',
  },
  forecastCenter: {
    flex: 1,
    alignItems: 'center',
  },
  forecastIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  forecastCondition: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  forecastRight: {
    alignItems: 'flex-end',
    width: 80,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rainChance: {
    fontSize: 12,
    color: '#2196F3',
  },
  advisoryCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
  },
  advisoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  advisoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  advisoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  advisoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  advisoryCategory: {
    fontSize: 12,
    color: '#666',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  advisoryDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginLeft: 36,
  },
  historicalCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 1,
  },
  historicalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartPlaceholder: {
    height: 120,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  chartText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  chartSubtext: {
    fontSize: 12,
    color: '#888',
  },
  comparisonCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 1,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#666',
  },
  comparisonValue: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default ClimateAnalysis;
