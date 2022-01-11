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
import { useProjectWebRepository } from './repositories/project-web-repository';
import EditPage from './views/pages/edit';
import NewPage from './views/pages/new';
import StartPage from './views/pages/start/index';

export const App = (): JSX.Element => {
  const projectWebRepository = useProjectWebRepository();
  return (
    <ProjectRepositoryContext.Provider value={projectWebRepository}>
      <SnackbarProvider maxSnack={3} hideIconVariant>
        <div className="container">
          <Router>
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
                <Route path="/new">
                  <NewPage />
                </Route>
                <Route path="/edit">
                  <EditPage />
                </Route>
                <Route path="/">
                  <StartPage />
                </Route>
                <Route component={() => <StartPage />} />
              </Switch>
            </div>
          </Router>
        </div>
      </SnackbarProvider>
    </ProjectRepositoryContext.Provider>
  );
};
