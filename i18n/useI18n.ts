import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Custom hook for easier translation access
export const useI18n = () => {
  const { t, i18n, ready } = useTranslation();
  
  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem('selectedLanguage', languageCode);
    } catch (error) {
      console.error('Language change failed:', error);
      throw error;
    }
  };
  
  const getCurrentLanguage = () => i18n.language || 'en';
  
  const isRTL = () => {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(getCurrentLanguage());
  };
  
  return {
    t: ready ? t : (key: string) => key, // Fallback if not ready
    changeLanguage,
    currentLanguage: getCurrentLanguage(),
    isRTL: isRTL(),
    isReady: ready,
  };
};
