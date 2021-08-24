import i18n from 'i18next';
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom';
import { initReactI18next } from 'react-i18next';
import { App } from './App';
import WorkspaceContext from './context/workspace';
import './index.scss';
import enJson from './locales/en.json';
import jaJson from './locales/ja.json';
import CssBaseline from '@material-ui/core/CssBaseline';
import muiTheme from './config/mui-theme';
import { ThemeProvider } from '@material-ui/core/styles';

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
