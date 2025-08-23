import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import hiTranslation from './locales/hi.json';
import ruTranslation from './locales/ru.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      hi: {
        translation: hiTranslation,
      },
      ru: {
        translation: ruTranslation,
      },
    },
    lng: null,
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi', 'ru'],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
