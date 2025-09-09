// This is an example of how to translate EVERYTHING in your app

import React from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useI18n } from '../i18n/useI18n';

// Example: Completely translated component
const ExampleTranslatedComponent = () => {
  const { t } = useI18n();

  const handleSubmit = () => {
    // Even alert messages are translated
    Alert.alert(
      t('common.success'),
      t('messages.dataSubmitted'),
      [
        { text: t('common.ok'), onPress: () => console.log('OK Pressed') }
      ]
    );
  };

  return (
    <View>
      {/* All text is translated */}
      <Text>{t('headers.welcomeMessage')}</Text>
      <Text>{t('instructions.fillForm')}</Text>
      
      {/* Form labels translated */}
      <Text>{t('forms.nameLabel')}</Text>
      <TextInput
        placeholder={t('forms.namePlaceholder')}
        // Even accessibility labels
        accessibilityLabel={t('accessibility.nameInput')}
      />
      
      <Text>{t('forms.emailLabel')}</Text>
      <TextInput
        placeholder={t('forms.emailPlaceholder')}
        accessibilityLabel={t('accessibility.emailInput')}
      />
      
      {/* Button text translated */}
      <Button
        title={t('buttons.submit')}
        onPress={handleSubmit}
      />
      
      {/* Help text translated */}
      <Text>{t('help.formInstructions')}</Text>
      <Text>{t('legal.privacyNotice')}</Text>
    </View>
  );
};

// Example: Error handling with translations
const handleError = (error: any, t: any) => {
  const errorMessage = error.code 
    ? t(`errors.${error.code}`) 
    : t('errors.generic');
    
  Alert.alert(t('common.error'), errorMessage);
};

// Example: Dynamic content translation
const formatDateTime = (date: Date, t: any) => {
  // You can even translate date/time formats
  const options = {
    weekday: t('dateFormat.weekday'),
    year: t('dateFormat.year'),
    month: t('dateFormat.month'),
    day: t('dateFormat.day'),
  };
  
  return date.toLocaleDateString(t('locale.code'), options);
};

export default ExampleTranslatedComponent;
