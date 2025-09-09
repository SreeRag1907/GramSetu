import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import language resources
import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import ta from './locales/ta.json';
import bn from './locales/bn.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
  gu: { translation: gu },
  ta: { translation: ta },
  bn: { translation: bn },
};

// Simple language detection
const detectLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
    return savedLanguage || 'en';
  } catch (error) {
    return 'en';
  }
};

// Initialize i18n
const initI18n = async () => {
  const lng = await detectLanguage();
  
  await i18n
    .use(initReactI18next)
    .init({
      resources,
      lng,
      fallbackLng: 'en',
      
      interpolation: {
        escapeValue: false,
      },
      
      react: {
        useSuspense: false,
      },
    });
};

// Initialize immediately
initI18n();

export default i18n;
