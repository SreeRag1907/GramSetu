// Localization context and hook for GramSetu app

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import comprehensiveTranslations, { ComprehensiveTranslations } from '../data/comprehensive-translations';
import { languages } from '../data/onboarding-data';

interface LocalizationContextType {
  currentLanguage: string;
  t: ComprehensiveTranslations;
  changeLanguage: (languageCode: string) => Promise<void>;
  isLoading: boolean;
  availableLanguages: typeof languages;
  getCurrentLanguageName: () => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

interface LocalizationProviderProps {
  children: ReactNode;
}

export const LocalizationProvider: React.FC<LocalizationProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on app start
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
      if (savedLanguage && comprehensiveTranslations[savedLanguage]) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (languageCode: string) => {
    try {
      if (comprehensiveTranslations[languageCode]) {
        setCurrentLanguage(languageCode);
        await AsyncStorage.setItem('selectedLanguage', languageCode);
      }
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  };

  const getCurrentLanguageName = (): string => {
    const language = languages.find(lang => lang.code === currentLanguage);
    return language ? language.native : 'English';
  };

  const value: LocalizationContextType = {
    currentLanguage,
    t: comprehensiveTranslations[currentLanguage] || comprehensiveTranslations.en,
    changeLanguage,
    isLoading,
    availableLanguages: languages,
    getCurrentLanguageName,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

export default LocalizationContext;
