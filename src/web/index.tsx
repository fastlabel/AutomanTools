import i18n from 'i18next';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { initReactI18next } from 'react-i18next';
import { App } from './App';
import './index.scss';
import enJson from './locales/en.json';
import jaJson from './locales/ja.json';


i18n.use(initReactI18next).init({
    resources: {
        en: { translation: enJson },
        ja: { translation: jaJson },
    },
    lng: 'ja',
    fallbackLng: 'ja',
    interpolation: { escapeValue: false },
});


ReactDOM.render(
    <Suspense fallback={null}>
        <App />
    </Suspense>, document.getElementById('root'));
