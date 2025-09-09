// Onboarding static data

export interface OnboardingItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
}

export interface Language {
  code: string;
  name: string;
  native: string;
}

export const onboardingData: OnboardingItem[] = [
  {
    id: 1,
    title: 'Smart Solutions',
    subtitle: 'Modern Farmers',
    description: 'Empowering farmers with smart tools for better yields and decisions',
  },
  {
    id: 2,
    title: 'AI-Powered',
    subtitle: 'Farming Assistant',
    description: 'Get intelligent recommendations for crops, weather, and market prices',
  },
  {
    id: 3,
    title: 'Connect & Grow',
    subtitle: 'Together',
    description: 'Join a community of modern farmers sharing knowledge and resources',
  },
];

export const languages: Language[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
];

export const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export const cropTypes = [
  'Wheat',
  'Rice',
  'Cotton',
  'Sugarcane',
  'Maize',
  'Soybean',
  'Potato',
  'Tomato',
  'Onion',
  'Chilli',
  'Turmeric',
  'Groundnut',
  'Mustard',
  'Barley',
  'Pulses',
  'Vegetables',
  'Fruits',
  'Spices',
  'Other'
];

export const landSizeOptions = [
  'Less than 1 acre',
  '1-2 acres',
  '2-5 acres',
  '5-10 acres',
  '10-20 acres',
  'More than 20 acres'
];

// Initial registration form state
export const initialRegistrationForm = {
  name: '',
  phone: '',
  state: '',
  district: '',
  village: '',
  primaryCrop: '',
  landSize: '',
  experience: '',
};
