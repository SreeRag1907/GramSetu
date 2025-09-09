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

// Language detection plugin
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Get saved language from AsyncStorage
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && resources[savedLanguage as keyof typeof resources]) {
        callback(savedLanguage);
        return;
      }
      
      // Fallback to English if no saved language
      callback('en');
    } catch (error) {
      console.log('Language detection error:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', lng);
    } catch (error) {
      console.log('Language cache error:', error);
    }
  }
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    
    interpolation: {
      escapeValue: false,
    },
    
    // Enable namespace separation
    ns: ['translation'],
    defaultNS: 'translation',
    
    // Debug mode for development
    debug: false,
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
