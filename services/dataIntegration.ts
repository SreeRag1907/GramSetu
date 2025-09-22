import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockSchemes } from '../data/schemes-data';
import { defaultWeatherData } from '../data/dashboard-data';

export interface IntegratedFarmData {
  userProfile: {
    name: string;
    location: string;
    farmSize: number;
    primaryCrops: string[];
    farmingType: 'organic' | 'conventional' | 'mixed';
    experience: number; // years
    language: string;
  };
  currentCrops: {
    cropName: string;
    variety: string;
    area: number;
    sowingDate: Date;
    currentStage: 'sowing' | 'vegetative' | 'flowering' | 'fruiting' | 'harvesting';
    expectedHarvest: Date;
    issues?: string[];
  }[];
  weatherData: {
    current: {
      temperature: number;
      humidity: number;
      condition: string;
      location: string;
    };
    forecast?: {
      tomorrow: {
        temperature: number;
        condition: string;
        rainfall: number;
      };
      weekly: any[];
    };
  };
  marketData: {
    [cropName: string]: {
      currentPrice: number;
      trend: 'up' | 'down' | 'stable';
      demandLevel: 'high' | 'medium' | 'low';
      lastUpdated: Date;
    };
  };
  schemes: {
    eligible: any[];
    applied: any[];
    recommended: any[];
  };
  laborData: {
    availableWorkers: number;
    dailyWage: number;
    currentTasks: string[];
    upcomingNeeds: string[];
  };
  farmActivities: {
    recent: {
      activity: string;
      date: Date;
      crop: string;
      notes?: string;
    }[];
    planned: {
      activity: string;
      scheduledDate: Date;
      crop: string;
      priority: 'high' | 'medium' | 'low';
    }[];
  };
}

class DataIntegrationService {
  
  // Load comprehensive farm data for AI context
  async loadFarmData(): Promise<IntegratedFarmData> {
    try {
      const [
        userName,
        userProfile,
        weatherData,
        cropsData,
        marketData,
        laborData,
        activitiesData
      ] = await Promise.all([
        AsyncStorage.getItem('userName'),
        AsyncStorage.getItem('userProfile'),
        AsyncStorage.getItem('weatherData'),
        AsyncStorage.getItem('userCrops'),
        AsyncStorage.getItem('marketData'),
        AsyncStorage.getItem('laborData'),
        AsyncStorage.getItem('farmActivities')
      ]);

      const profile = userProfile ? JSON.parse(userProfile) : {};
      const weather = weatherData ? JSON.parse(weatherData) : defaultWeatherData;
      const crops = cropsData ? JSON.parse(cropsData) : [];
      const market = marketData ? JSON.parse(marketData) : {};
      const labor = laborData ? JSON.parse(laborData) : {};
      const activities = activitiesData ? JSON.parse(activitiesData) : { recent: [], planned: [] };

      return {
        userProfile: {
          name: userName || 'Farmer',
          location: profile.location || 'India',
          farmSize: profile.farmSize || 2,
          primaryCrops: profile.primaryCrops || ['rice', 'wheat'],
          farmingType: profile.farmingType || 'conventional',
          experience: profile.experience || 5,
          language: profile.language || 'en'
        },
        currentCrops: crops.map((crop: any) => ({
          cropName: crop.name || crop.cropName,
          variety: crop.variety || 'local',
          area: crop.area || 1,
          sowingDate: new Date(crop.sowingDate || Date.now()),
          currentStage: crop.currentStage || 'vegetative',
          expectedHarvest: new Date(crop.expectedHarvest || Date.now() + 90 * 24 * 60 * 60 * 1000),
          issues: crop.issues || []
        })),
        weatherData: {
          current: weather,
          forecast: weather.forecast
        },
        marketData: market,
        schemes: {
          eligible: this.getEligibleSchemes(profile),
          applied: profile.appliedSchemes || [],
          recommended: this.getRecommendedSchemes(profile, crops)
        },
        laborData: {
          availableWorkers: labor.availableWorkers || 2,
          dailyWage: labor.dailyWage || 300,
          currentTasks: labor.currentTasks || [],
          upcomingNeeds: labor.upcomingNeeds || []
        },
        farmActivities: activities
      };

    } catch (error) {
      console.error('Error loading farm data:', error);
      return this.getDefaultFarmData();
    }
  }

  // Get schemes eligible for farmer based on profile
  getEligibleSchemes(profile: any): any[] {
    return mockSchemes.filter(scheme => {
      const farmSize = profile.farmSize || 2;
      const category = profile.category || 'small';
      
      // Simple eligibility logic - can be enhanced
      if (scheme.id === '1' && farmSize <= 2) return true; // PM-KISAN for small farmers
      if (scheme.id === '2') return true; // Crop insurance for all
      if (scheme.id === '3') return true; // Soil health for all
      if (scheme.id === '4' && category !== 'large') return true; // KCC for small/medium
      if (scheme.id === '5' && farmSize >= 1) return true; // Machinery subsidy
      
      return false;
    });
  }

  // Get recommended schemes based on current situation
  getRecommendedSchemes(profile: any, crops: any[]): any[] {
    const recommendations = [];
    
    // Recommend based on crop types
    if (crops.some((c: any) => c.name?.includes('rice'))) {
      recommendations.push(mockSchemes.find(s => s.id === '2')); // Crop insurance
    }
    
    // Recommend based on farm size
    if (profile.farmSize && profile.farmSize <= 2) {
      recommendations.push(mockSchemes.find(s => s.id === '1')); // PM-KISAN
    }
    
    // Recommend based on farming type
    if (profile.farmingType === 'organic') {
      recommendations.push(mockSchemes.find(s => s.id === '8')); // Organic farming scheme
    }
    
    return recommendations.filter(Boolean);
  }

  // Generate AI context summary
  generateContextSummary(farmData: IntegratedFarmData): string {
    const { userProfile, currentCrops, weatherData, marketData } = farmData;
    
    let summary = `Farmer Profile: ${userProfile.name}, ${userProfile.farmSize} acres in ${userProfile.location}. `;
    summary += `${userProfile.experience} years experience in ${userProfile.farmingType} farming. `;
    
    if (currentCrops.length > 0) {
      summary += `Current crops: ${currentCrops.map(c => `${c.cropName} (${c.currentStage} stage)`).join(', ')}. `;
    }
    
    summary += `Weather: ${weatherData.current.temperature}°C, ${weatherData.current.condition}. `;
    
    const marketCrops = Object.keys(marketData);
    if (marketCrops.length > 0) {
      summary += `Market prices available for: ${marketCrops.join(', ')}. `;
    }
    
    return summary;
  }

  // Save farm data updates
  async saveFarmData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  }

  // Default farm data for new users
  private getDefaultFarmData(): IntegratedFarmData {
    return {
      userProfile: {
        name: 'Farmer',
        location: 'India',
        farmSize: 2,
        primaryCrops: ['rice', 'wheat'],
        farmingType: 'conventional',
        experience: 5,
        language: 'en'
      },
      currentCrops: [],
      weatherData: {
        current: defaultWeatherData
      },
      marketData: {},
      schemes: {
        eligible: mockSchemes.slice(0, 3),
        applied: [],
        recommended: mockSchemes.slice(0, 2)
      },
      laborData: {
        availableWorkers: 2,
        dailyWage: 300,
        currentTasks: [],
        upcomingNeeds: []
      },
      farmActivities: {
        recent: [],
        planned: []
      }
    };
  }

  // Analyze farm data for AI insights
  analyzeFarmStatus(farmData: IntegratedFarmData): {
    urgentIssues: string[];
    opportunities: string[];
    recommendations: string[];
  } {
    const urgentIssues: string[] = [];
    const opportunities: string[] = [];
    const recommendations: string[] = [];

    // Check for urgent weather-related issues
    if (farmData.weatherData.current.temperature > 40) {
      urgentIssues.push('Extreme heat - ensure adequate irrigation and crop protection');
    }

    // Check crop stages and timing
    farmData.currentCrops.forEach(crop => {
      const daysSinceSowing = Math.floor((Date.now() - crop.sowingDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (crop.currentStage === 'flowering' && farmData.weatherData.current.temperature > 35) {
        urgentIssues.push(`${crop.cropName} flowering stage at risk due to high temperature`);
      }
      
      if (daysSinceSowing > 120 && crop.currentStage !== 'harvesting') {
        recommendations.push(`Check ${crop.cropName} for harvest readiness`);
      }
    });

    // Check for market opportunities
    Object.entries(farmData.marketData).forEach(([crop, data]) => {
      if (data.trend === 'up' && data.demandLevel === 'high') {
        opportunities.push(`Good time to sell ${crop} - price trending up with high demand`);
      }
    });

    // Check for scheme eligibility
    if (farmData.schemes.eligible.length > farmData.schemes.applied.length) {
      recommendations.push(`You're eligible for ${farmData.schemes.eligible.length - farmData.schemes.applied.length} more government schemes`);
    }

    return { urgentIssues, opportunities, recommendations };
  }

  // Get crop-specific advice data
  getCropAdviceContext(cropName: string, farmData: IntegratedFarmData): any {
    const crop = farmData.currentCrops.find(c => 
      c.cropName.toLowerCase().includes(cropName.toLowerCase())
    );

    if (!crop) {
      return {
        found: false,
        message: `${cropName} not found in your current crops. General advice will be provided.`
      };
    }

    const marketInfo = farmData.marketData[cropName] || farmData.marketData[crop.cropName];
    const daysSinceSowing = Math.floor((Date.now() - crop.sowingDate.getTime()) / (1000 * 60 * 60 * 24));

    return {
      found: true,
      crop: crop,
      marketInfo: marketInfo,
      daysSinceSowing: daysSinceSowing,
      weatherSuitability: this.assessWeatherSuitability(crop, farmData.weatherData.current),
      stageAdvice: this.getStageSpecificAdvice(crop.currentStage, crop.cropName)
    };
  }

  private assessWeatherSuitability(crop: any, weather: any): string {
    const temp = weather.temperature;
    const humidity = weather.humidity;

    if (crop.cropName.toLowerCase().includes('rice')) {
      if (temp >= 20 && temp <= 35 && humidity > 50) return 'favorable';
      if (temp > 35) return 'too_hot';
      if (temp < 20) return 'too_cold';
    }

    if (crop.cropName.toLowerCase().includes('wheat')) {
      if (temp >= 15 && temp <= 25) return 'favorable';
      if (temp > 30) return 'too_hot';
      if (temp < 10) return 'too_cold';
    }

    return 'moderate';
  }

  private getStageSpecificAdvice(stage: string, cropName: string): string[] {
    const advice: string[] = [];

    switch (stage) {
      case 'sowing':
        advice.push('Ensure proper seed depth and spacing');
        advice.push('Apply basal fertilizer as recommended');
        advice.push('Maintain optimal soil moisture');
        break;
      case 'vegetative':
        advice.push('Monitor for pest and disease symptoms');
        advice.push('Apply first top-dressing of fertilizer');
        advice.push('Ensure adequate water supply');
        break;
      case 'flowering':
        advice.push('Critical stage - avoid water stress');
        advice.push('Monitor for flower drop');
        advice.push('Consider plant protection measures');
        break;
      case 'fruiting':
        advice.push('Maintain consistent irrigation');
        advice.push('Apply potash-rich fertilizer');
        advice.push('Support heavy fruit-bearing branches');
        break;
      case 'harvesting':
        advice.push('Check grain moisture content');
        advice.push('Plan harvesting equipment');
        advice.push('Arrange storage facilities');
        break;
    }

    return advice;
  }
}

export const dataIntegration = new DataIntegrationService();