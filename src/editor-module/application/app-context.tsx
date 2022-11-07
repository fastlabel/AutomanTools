import React from 'react';

type AppContextObj = {
  mode: 'electron' | 'web';
};

export const AppContext = React.createContext<AppContextObj>({
  mode: 'web',
});

export const useContextApp = (): AppContextObj => React.useContext(AppContext);
