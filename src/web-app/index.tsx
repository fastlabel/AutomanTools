import muiTheme from '@fl-three-editor/config/mui-theme';
import editorEnJson from '@fl-three-editor/locales/en.json';
import editorJaJson from '@fl-three-editor/locales/ja.json';
import CssBaseline from '@mui/material/CssBaseline';
import {
  ThemeProvider,
  Theme,
  StyledEngineProvider,
} from '@mui/material/styles';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { initReactI18next } from 'react-i18next';
import { App } from './App';
import './index.scss';
import enJson from './locales/en.json';
import jaJson from './locales/ja.json';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en',
    resources: {
      en: { translation: { ...editorEnJson, ...enJson } },
      ja: { translation: { ...editorJaJson, ...jaJson } },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

ReactDOM.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Suspense fallback={null}>
        <App />
      </Suspense>
    </ThemeProvider>
  </StyledEngineProvider>,
  document.getElementById('root')
);
