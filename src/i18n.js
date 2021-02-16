import i18n from 'i18next';
import detector from 'i18next-browser-languagedetector';
import backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import translationEN from './locales/en/translation.json';
import translationZH_CN from './locales/zh-CN/translation.json';

const resources = {
    en: {
        translation: translationEN,
    },
    'zh-CN': {
        translation: translationZH_CN,
    },
};

i18n.use(detector)
    .use(backend)
    .use(initReactI18next)
    .init({
        resources: resources,
        lng: 'en',
        fallbackLng: 'en',

        saveMissing: true,

        keySeparator: false,

        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;
