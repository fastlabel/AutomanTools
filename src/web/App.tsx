import React from 'react';
import {
  BrowserRouter as Router, Route, Switch
} from "react-router-dom";
import 'typeface-roboto/index.css';
import './App.scss';
import workspaceStore from './stores/workspace-store';
import AnnotationClassesPage from './views/pages/annotation-classes/index';
import StartPage from './views/pages/start/index';
import ThreeAnnotationPage from './views/pages/three-annotation/index';
import WorkspacePage from './views/pages/workspace/index';

const { myAPI } = window;

export const App = (): JSX.Element => {

  return (
    <workspaceStore.Provider>
      <Router>
        <Switch>
          <Route path="/threeannotation">
            <ThreeAnnotationPage />
          </Route>
          <Route path="/annotationclasses">
            <AnnotationClassesPage />
          </Route>
          <Route path="/workspace">
            <WorkspacePage />
          </Route>
          <Route path="/">
            <StartPage />
          </Route>
        </Switch>
      </Router>
    </workspaceStore.Provider>
  );
};
