import { ProjectRepositoryContext } from '@fl-three-editor/repositories/project-repository';
import AnnotationClassStore from '@fl-three-editor/stores/annotation-class-store';
import CameraCalibrationStore from '@fl-three-editor/stores/camera-calibration-store';
import TaskStore from '@fl-three-editor/stores/task-store';
import ThreeAnnotationPage from '@fl-three-editor/views/pages/three-annotation/index';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'typeface-roboto/index.css';
import './App.scss';
import WorkspaceContext from './context/workspace';
import { useProjectFsRepository } from './repositories/project-fs-repository';
import TitleBar from './title-bar';
import StartPage from './views/pages/start/index';
import WorkspacePage from './views/pages/workspace/index';

export const App = (): JSX.Element => {
  const workspace = WorkspaceContext.useContainer();
  const projectFsRepository = useProjectFsRepository(workspace);
  return (
    <ProjectRepositoryContext.Provider value={projectFsRepository}>
      <SnackbarProvider maxSnack={3} hideIconVariant>
        <div className="container">
          <Router>
            <TitleBar />
            <div className={'content'}>
              <Switch>
                <Route path="/threeannotation/:projectId">
                  <TaskStore.Provider>
                    <AnnotationClassStore.Provider>
                      <CameraCalibrationStore.Provider>
                        <ThreeAnnotationPage />
                      </CameraCalibrationStore.Provider>
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
            </div>
          </Router>
        </div>
      </SnackbarProvider>
    </ProjectRepositoryContext.Provider>
  );
};
