import React from 'react';
import {
  BrowserRouter as Router, Route, Switch
} from "react-router-dom";
import 'typeface-roboto/index.css';
import WorkspaceContext from './context/workspace';
import StartPage from './views/pages/start/index';
import ThreeAnnotationPage from './views/pages/three-annotation/index';
import WorkspacePage from './views/pages/workspace/index';

export const App = (): JSX.Element => {

  return (
    <WorkspaceContext.Provider>
      <Router>
        <Switch>
          <Route path="/threeannotation">
            <ThreeAnnotationPage />
          </Route>
          <Route path="/workspace">
            <WorkspacePage />
          </Route>
          <Route path="/">
            <StartPage />
          </Route>
        </Switch>
      </Router>
    </WorkspaceContext.Provider>
  );
};
