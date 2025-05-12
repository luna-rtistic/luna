import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from '../public/locales/en/common.json';
import koCommon from '../public/locales/ko/common.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
      },
      ko: {
        common: koCommon,
      },
    },
    lng: typeof window !== 'undefined' ? localStorage.getItem('lang') || 'en' : 'en',
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n; 