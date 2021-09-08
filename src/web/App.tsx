import { SnackbarProvider } from 'notistack';
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'typeface-roboto/index.css';
import './App.scss';
import { ApplicationConst } from './application/const';
import favicon from './asset/favicon-200.png';
import WorkspaceContext from './context/workspace';
import { useProjectFsRepository } from './repositories/project-fs-repository';
import { ProjectRepositoryContext } from './repositories/project-repository';
import AnnotationClassStore from './stores/annotation-class-store';
import TaskStore from './stores/task-store';
import StartPage from './views/pages/start/index';
import ThreeAnnotationPage from './views/pages/three-annotation/index';
import WorkspacePage from './views/pages/workspace/index';

const { appApi } = window;

export const App = (): JSX.Element => {
  const [maximized, setMaximized] = useState(false);
  const [blur, setBlur] = useState(false);

  const onMinimize = async () => {
    await appApi.minimize();
  };

  const onMaximize = async () => {
    setMaximized(!maximized);
    await appApi.maximize();
  };

  const onRestore = async () => {
    setMaximized(!maximized);
    await appApi.restore();
  };

  const onClose = async () => await appApi.close();

  const onContextMenu = () => {
    appApi.contextMenu();
  };

  useEffect(() => {
    appApi.resized(async () => setMaximized(false));

    return () => {
      appApi.removeResized();
    };
  }, []);

  useEffect(() => {
    appApi.getFocus(async () => setBlur(false));

    return () => {
      appApi.removeGetFocus();
    };
  }, [blur]);

  useEffect(() => {
    appApi.getBlur(async () => setBlur(true));

    return () => {
      appApi.removeGetBlur();
    };
  });

  useEffect(() => {
    appApi.maximized(async () => setMaximized(true));

    return () => {
      appApi.removeMaximized();
    };
  }, []);

  useEffect(() => {
    appApi.unMaximized(async () => setMaximized(false));

    return () => {
      appApi.removeUnMaximized();
    };
  }, []);

  const workspace = WorkspaceContext.useContainer();
  const projectFsRepository = useProjectFsRepository(workspace);
  return (
    <ProjectRepositoryContext.Provider value={projectFsRepository}>
      <SnackbarProvider maxSnack={3} hideIconVariant>
        <div className="container">
          <div
            className={blur ? 'titlebar blur' : 'titlebar'}
            onDoubleClick={(e) => e.preventDefault()}>
            <div className={blur ? 'top-container blur' : 'top-container'}>
              <img src={favicon} width="auto" height={24} />
            </div>
            <div className={blur ? 'title-container blur' : 'title-container'}>
              <p>{ApplicationConst.name}</p>
            </div>
            <div className="controls">
              <div
                className={blur ? 'button-container blur' : 'button-container'}
                onClick={onMinimize}>
                <svg
                  width="10"
                  height="1"
                  viewBox="0 0 10 1"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <rect width="10" height="1" fill="black" />
                </svg>
              </div>
              {maximized ? (
                <div
                  className={
                    blur ? 'button-container blur' : 'button-container'
                  }
                  onClick={onRestore}>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M9 1H3V2H2V1V0H3H9H10V1V7V8H9H8V7H9V1Z"
                      fill="black"
                    />
                    <rect x="0.5" y="2.5" width="7" height="7" stroke="black" />
                  </svg>
                </div>
              ) : (
                <div
                  className={
                    blur ? 'button-container blur' : 'button-container'
                  }
                  onClick={onMaximize}>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="0.5" width="9" height="9" stroke="black" />
                  </svg>
                </div>
              )}
              <div
                className={
                  blur
                    ? 'button-container close blur'
                    : 'button-container close'
                }
                onClick={onClose}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 11L11 1" className="close" />
                  <path d="M1 1L11 11" className="close" />
                </svg>
              </div>
            </div>
          </div>
          <div className={'content'}>
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
          </div>
        </div>
      </SnackbarProvider>
    </ProjectRepositoryContext.Provider>
  );
};
