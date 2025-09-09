// Climate/Weather static data

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

export interface ForecastDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  rainChance: number;
}

export interface Advisory {
  id: string;
  title: string;
  description: string;
  icon: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export const mockCurrentWeather: WeatherData = {
  temperature: 28,
  humidity: 65,
  windSpeed: 12,
  condition: 'Partly Cloudy',
  icon: '⛅',
};

export const mockForecast: ForecastDay[] = [
  { date: '2024-01-16', day: 'Today', high: 30, low: 18, condition: 'Sunny', icon: '☀️', rainChance: 10 },
  { date: '2024-01-17', day: 'Tomorrow', high: 28, low: 16, condition: 'Partly Cloudy', icon: '⛅', rainChance: 20 },
  { date: '2024-01-18', day: 'Wed', high: 25, low: 14, condition: 'Rainy', icon: '🌧️', rainChance: 80 },
  { date: '2024-01-19', day: 'Thu', high: 26, low: 15, condition: 'Cloudy', icon: '☁️', rainChance: 40 },
  { date: '2024-01-20', day: 'Fri', high: 29, low: 17, condition: 'Sunny', icon: '☀️', rainChance: 5 },
  { date: '2024-01-21', day: 'Sat', high: 31, low: 19, condition: 'Hot', icon: '🌡️', rainChance: 0 },
  { date: '2024-01-22', day: 'Sun', high: 27, low: 16, condition: 'Windy', icon: '💨', rainChance: 15 },
];

export const mockAdvisories: Advisory[] = [
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
    title: 'Pest Alert - Aphids',
    description: 'Humid conditions favor aphid population growth. Monitor crops closely and apply neem oil spray if necessary.',
    icon: '🐛',
    priority: 'medium',
    category: 'Pest Management',
  },
  {
    id: '4',
    title: 'Irrigation Reminder',
    description: 'No significant rainfall in next 5 days. Plan irrigation schedule for water-sensitive crops like vegetables.',
    icon: '💧',
    priority: 'low',
    category: 'Water Management',
  },
  {
    id: '5',
    title: 'Market Opportunity',
    description: 'Vegetable prices expected to rise due to weather disruption in neighboring regions. Consider harvesting early if ready.',
    icon: '📈',
    priority: 'medium',
    category: 'Market Advisory',
  },
];

export const weatherParameters = [
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️' },
  { key: 'humidity', label: 'Humidity', unit: '%', icon: '💧' },
  { key: 'windSpeed', label: 'Wind Speed', unit: 'km/h', icon: '💨' },
  { key: 'pressure', label: 'Pressure', unit: 'hPa', icon: '📊' },
  { key: 'visibility', label: 'Visibility', unit: 'km', icon: '👁️' },
  { key: 'uvIndex', label: 'UV Index', unit: '', icon: '☀️' },
];

export const historicalData = {
  temperature: [
    { month: 'Jan', value: 18 },
    { month: 'Feb', value: 22 },
    { month: 'Mar', value: 28 },
    { month: 'Apr', value: 35 },
    { month: 'May', value: 42 },
    { month: 'Jun', value: 39 },
    { month: 'Jul', value: 32 },
    { month: 'Aug', value: 31 },
    { month: 'Sep', value: 29 },
    { month: 'Oct', value: 26 },
    { month: 'Nov', value: 22 },
    { month: 'Dec', value: 19 },
  ],
  rainfall: [
    { month: 'Jan', value: 5 },
    { month: 'Feb', value: 8 },
    { month: 'Mar', value: 12 },
    { month: 'Apr', value: 15 },
    { month: 'May', value: 25 },
    { month: 'Jun', value: 120 },
    { month: 'Jul', value: 200 },
    { month: 'Aug', value: 180 },
    { month: 'Sep', value: 85 },
    { month: 'Oct', value: 35 },
    { month: 'Nov', value: 15 },
    { month: 'Dec', value: 8 },
  ],
};

// Utility functions
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return '#F44336';
    case 'medium': return '#FF9800';
    case 'low': return '#4CAF50';
    default: return '#666';
  }
};

export const getWeatherConditionIcon = (condition: string): string => {
  switch (condition.toLowerCase()) {
    case 'sunny': return '☀️';
    case 'partly cloudy': return '⛅';
    case 'cloudy': return '☁️';
    case 'rainy': return '🌧️';
    case 'stormy': return '⛈️';
    case 'windy': return '💨';
    case 'hot': return '🌡️';
    case 'cold': return '🥶';
    default: return '🌤️';
  }
};
