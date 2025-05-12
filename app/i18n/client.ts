'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getOptions } from './settings';

const initI18next = async () => {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(resourcesToBackend((language: string, namespace: string) => {
      return import(`../../public/locales/${language}/${namespace}.json`);
    }))
    .init({
      ...getOptions(),
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      fallbackLng: 'en',
      preload: ['en', 'ko'],
      react: {
        useSuspense: false
      }
    });
};

// i18n 초기화
initI18next();

export default i18next; 