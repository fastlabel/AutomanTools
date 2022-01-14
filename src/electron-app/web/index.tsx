import muiTheme from '@fl-three-editor/config/mui-theme';
import editorEnJson from '@fl-three-editor/locales/en.json';
import editorJaJson from '@fl-three-editor/locales/ja.json';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { initReactI18next } from 'react-i18next';
import { App } from './App';
import WorkspaceContext from './context/workspace';
import './index.scss';
import enJson from './locales/en.json';
import jaJson from './locales/ja.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: { ...editorEnJson, ...enJson } },
      ja: { translation: { ...editorJaJson, ...jaJson } },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

ReactDOM.render(
  <ThemeProvider theme={muiTheme}>
    <CssBaseline />
    <Suspense fallback={null}>
      <WorkspaceContext.Provider>
        <App />
      </WorkspaceContext.Provider>
    </Suspense>
  </ThemeProvider>,
  document.getElementById('root')
);
