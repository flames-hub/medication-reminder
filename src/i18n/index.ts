import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './en.json';
import ja from './ja.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: Localization.getLocales()[0]?.languageCode ?? 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    ja: { translation: ja },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
