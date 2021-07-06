import i18n from 'i18next';
import detector from 'i18next-browser-languagedetector';
import http from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

export const i18nInitPromise = i18n
    .use(detector)
    .use(http)
    .use(initReactI18next)
    .init({
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },

        fallbackLng: 'en',
        defaultNS: 'common',
        ns: ['common', 'account', 'library', 'aria', 'add-article', 'reader'],

        debug: process.env.NODE_ENV === 'development',

        saveMissing: false,

        keySeparator: false,

        interpolation: {
            escapeValue: false, // react already safes from xss
        },

        react: {
            useSuspense: false,
        },
    });

export default i18n;
