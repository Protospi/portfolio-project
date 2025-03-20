'use client';

import { useTranslation } from 'react-i18next';
import { useLanguage } from '../lib/LanguageContext';
import { TFunction } from 'i18next';

export function useAppTranslation() {
  const { t, i18n } = useTranslation();
  const { currentLanguage, detectedLanguage, isLanguageDetected } = useLanguage();

  // Use this function to translate text
  // We ensure it returns a string for React components
  const $t = (key: string, options?: any): string => {
    const translation = t(key, options);
    return typeof translation === 'string' ? translation : key;
  };

  return {
    $t,
    t,
    i18n,
    currentLanguage,
    detectedLanguage,
    isLanguageDetected
  };
} 