import React from 'react';
import { Select } from '@shopify/polaris';
import { useLanguage } from './providers';

const LanguageSelector = ({ size = 'slim', variant = 'tertiary' }) => {
  const { currentLanguage, availableLanguages, changeLanguage, loading } = useLanguage();

  const handleLanguageChange = async (value) => {
    if (value && value !== currentLanguage) {
      await changeLanguage(value);
    }
  };

  const languageOptions = [
    { label: 'English', value: 'English' },
    { label: 'French', value: 'French' },
    { label: 'German', value: 'German' },
    { label: 'Russian', value: 'Russian' },
    { label: 'Chinese', value: 'Chinese' },
    { label: 'Japanese', value: 'Japanese' },
    ...availableLanguages
      .filter(lang => !['English', 'French', 'German', 'Russian', 'Chinese', 'Japanese'].includes(lang))
      .map(lang => ({ label: lang, value: lang }))
  ];

  return (
    <Select
      label="Language"
      labelInline
      options={languageOptions}
      value={currentLanguage}
      onChange={handleLanguageChange}
      disabled={loading}
      size={size}
    />
  );
};

export default LanguageSelector; 