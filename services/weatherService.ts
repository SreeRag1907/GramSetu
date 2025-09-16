// OpenWeatherMap API Service
import * as Location from 'expo-location';

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface ForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust: number;
    };
    visibility: number;
    pop: number;
    rain?: {
      '3h': number;
    };
    sys: {
      pod: string;
    };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface ProcessedWeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  pressure: number;
  visibility: number;
  uvIndex: number;
  location: string;
}

export interface ProcessedForecastDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  rainChance: number;
}

class WeatherService {
  private async getCurrentLocation(): Promise<{latitude: number, longitude: number} | null> {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return null;
      }

      let location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }

  private getWeatherIcon(iconCode: string): string {
    const iconMap: {[key: string]: string} = {
      '01d': '☀️', // clear sky day
      '01n': '🌙', // clear sky night
      '02d': '⛅', // few clouds day
      '02n': '☁️', // few clouds night
      '03d': '☁️', // scattered clouds
      '03n': '☁️',
      '04d': '☁️', // broken clouds
      '04n': '☁️',
      '09d': '🌧️', // shower rain
      '09n': '🌧️',
      '10d': '🌦️', // rain day
      '10n': '🌧️', // rain night
      '11d': '⛈️', // thunderstorm
      '11n': '⛈️',
      '13d': '❄️', // snow
      '13n': '❄️',
      '50d': '🌫️', // mist
      '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
  }

  private getDayName(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  async getCurrentWeather(): Promise<ProcessedWeatherData | null> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) {
        throw new Error('Location not available');
      }

      const response = await fetch(
        `${BASE_URL}/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherResponse = await response.json();

      return {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        condition: data.weather[0].description,
        icon: this.getWeatherIcon(data.weather[0].icon),
        pressure: data.main.pressure,
        visibility: Math.round(data.visibility / 1000), // Convert m to km
        uvIndex: 0, // UV index not available in current weather, would need separate call
        location: `${data.name}, ${data.sys.country}`
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      return null;
    }
  }

  async getForecast(): Promise<ProcessedForecastDay[] | null> {
    try {
      const location = await this.getCurrentLocation();
      if (!location) {
        throw new Error('Location not available');
      }

      const response = await fetch(
        `${BASE_URL}/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Forecast API error: ${response.status}`);
      }

      const data: ForecastResponse = await response.json();

      // Group forecast data by day (OpenWeatherMap returns 3-hour intervals)
      const dailyForecasts: { [key: string]: any[] } = {};
      
      data.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toDateString();
        if (!dailyForecasts[date]) {
          dailyForecasts[date] = [];
        }
        dailyForecasts[date].push(item);
      });

      // Process daily forecasts
      const processedForecast: ProcessedForecastDay[] = Object.entries(dailyForecasts)
        .slice(0, 7) // Limit to 7 days
        .map(([dateString, dayData]) => {
          const date = new Date(dateString);
          const temperatures = dayData.map(item => item.main.temp);
          const rainChances = dayData.map(item => item.pop * 100);
          
          // Get the most common weather condition for the day
          const conditions = dayData.map(item => item.weather[0]);
          const mainCondition = conditions[Math.floor(conditions.length / 2)]; // Take middle of day

          return {
            date: date.toISOString().split('T')[0],
            day: this.getDayName(date),
            high: Math.round(Math.max(...temperatures)),
            low: Math.round(Math.min(...temperatures)),
            condition: mainCondition.description,
            icon: this.getWeatherIcon(mainCondition.icon),
            rainChance: Math.round(Math.max(...rainChances))
          };
        });

      return processedForecast;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      return null;
    }
  }

  async getWeatherByCity(cityName: string): Promise<ProcessedWeatherData | null> {
    try {
      const response = await fetch(
        `${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherResponse = await response.json();

      return {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6),
        condition: data.weather[0].description,
        icon: this.getWeatherIcon(data.weather[0].icon),
        pressure: data.main.pressure,
        visibility: Math.round(data.visibility / 1000),
        uvIndex: 0,
        location: `${data.name}, ${data.sys.country}`
      };
    } catch (error) {
      console.error('Error fetching weather by city:', error);
      return null;
    }
  }
}

export const weatherService = new WeatherService();
