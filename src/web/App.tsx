import { SnackbarProvider } from 'notistack';
import React from 'react';
import {
  BrowserRouter as Router, Route, Switch
} from "react-router-dom";
import 'typeface-roboto/index.css';
import WorkspaceContext from './context/workspace';
import { useProjectFsRepository } from './repositories/project-fs-repository';
import { ProjectRepositoryContext } from './repositories/project-repository';
import AnnotationClassStore from './stores/annotation-class-store';
import TaskStore from './stores/task-store';
import StartPage from './views/pages/start/index';
import ThreeAnnotationPage from './views/pages/three-annotation/index';
import WorkspacePage from './views/pages/workspace/index';

export const App = (): JSX.Element => {
  const workspace = WorkspaceContext.useContainer();
  const projectFsRepository = useProjectFsRepository(workspace);
  return (
    <ProjectRepositoryContext.Provider value={projectFsRepository}>
      <SnackbarProvider maxSnack={3} hideIconVariant>
        <Router>
          <Switch>
            <Route path="/threeannotation">
              <TaskStore.Provider>
                <AnnotationClassStore.Provider>
                  <ThreeAnnotationPage />
                </AnnotationClassStore.Provider>
              </TaskStore.Provider>
            </Route>
            <Route path="/workspace">
              <WorkspacePage />
            </Route>
            <Route path="/">
              <StartPage />
            </Route>
          </Switch>
        </Router>
      </SnackbarProvider>
    </ProjectRepositoryContext.Provider>
  );
};
