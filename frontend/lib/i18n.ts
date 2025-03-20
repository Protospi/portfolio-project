import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import translationEN from '../translations/en.json';
import translationES from '../translations/es.json';
import translationPT from '../translations/pt.json';
import translationDE from '../translations/de.json';
import translationZH from '../translations/zh.json';
import translationJA from '../translations/ja.json';
import translationFR from '../translations/fr.json';

// Map language codes to translation objects
const resources = {
  en: {
    translation: translationEN
  },
  es: {
    translation: translationES
  },
  pt: {
    translation: translationPT
  },
  de: {
    translation: translationDE
  },
  zh: {
    translation: translationZH
  },
  ja: {
    translation: translationJA
  },
  fr: {
    translation: translationFR
  }
};

// Map backend language detection responses to i18n language codes
export const languageMap: Record<string, string> = {
  'English': 'en',
  'Spanish': 'es',
  'Portuguese': 'pt',
  'German': 'de',
  'Chinese': 'zh',
  'Japanese': 'ja',
  'French': 'fr',
  // Add more mappings as needed
};

i18n
  // Load translations from external files
  .use(Backend)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // not needed for React
    },
    react: {
      useSuspense: false,
    },
    detection: {
      order: ['path', 'cookie', 'htmlTag'], // Don't use navigator language detection
      lookupFromPathIndex: 0,
      caches: ['cookie'],
    }
  });

// Function to change the language programmatically
export const changeLanguage = (detectedLanguage: string) => {
  // If detected language is in our map, use it, otherwise fall back to English
  const langCode = languageMap[detectedLanguage] || 'en';
  i18n.changeLanguage(langCode);
  return langCode;
};

export default i18n; 