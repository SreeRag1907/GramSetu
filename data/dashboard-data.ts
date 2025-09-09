// Dashboard static data

export interface DashboardModule {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  gradient: string[];
  badge: string | null;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  route: string;
}

export interface RecentActivity {
  id: string;
  title: string;
  time: string;
  type: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  location: string;
}

export const dashboardModules: DashboardModule[] = [
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

export const quickActions: QuickAction[] = [
  { id: 'weather', title: 'Today\'s Weather', icon: '☀️', route: '/climate' },
  { id: 'prices', title: 'Market Prices', icon: '💰', route: '/marketplace' },
  { id: 'ai', title: 'Quick Query', icon: '💬', route: '/chatbot' },
  { id: 'alerts', title: 'Alerts', icon: '🔔', route: '/schemes' }
];

export const recentActivities: RecentActivity[] = [
  { id: '1', title: 'Weather forecast updated', time: '2 hours ago', type: 'weather' },
  { id: '2', title: 'New scheme available', time: '5 hours ago', type: 'scheme' },
  { id: '3', title: 'Market price alert: Rice ↗️', time: '1 day ago', type: 'market' }
];

export const defaultWeatherData: WeatherData = {
  temperature: 28,
  humidity: 65,
  condition: 'Partly Cloudy',
  location: 'Your Location'
};

// Utility functions
export const getGreeting = (currentTime: Date): string => {
  const hour = currentTime.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const formatDate = (currentTime: Date): string => {
  return currentTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};
