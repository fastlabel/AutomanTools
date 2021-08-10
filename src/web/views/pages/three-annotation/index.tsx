import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { FC, useCallback, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import AnnotationClassStore from '../../../stores/annotation-class-store';
import TaskStore from '../../../stores/task-store';
import Canvas3d from '../../three/canvas-3d';
import ClassListDialog from './class-list-dialog';
import ThreeSidePanel from "./side-panel";
import ThreeToolbar from './tool-bar';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            height: '100vh',
            width: '100vw',
        },
        mainPanel: {
            flexGrow: 1
        },
        mainContentPanel: {
            height: '100vh'
        },
        mainContent: {
            flexGrow: 1,
            background: '#000'
        },
        sidePanel: {
        }
    }),
);

const ThreeAnnotationPage: FC = () => {
    const classes = useStyles();
    const history = useHistory();

    const store = TaskStore.useContainer();
    const { annotationClass, dispatchAnnotationClass } = AnnotationClassStore.useContainer();

    const openClassListDialog = useCallback(() => {
        if (store.taskRom.status === 'loaded') {
            const { status, projectId, annotationClasses } = store.taskRom;
            dispatchAnnotationClass({ type: 'init', projectId, data: annotationClasses });
        }
    }, [store.taskRom]);

    // initialize Editor
    useEffect(() => {
        const projectId = '';
        const taskId = '';
        store.open(projectId, taskId);
    }, []);

    useEffect(() => {
        if (store.taskRom.status === 'loaded') {
            const { status, projectId, annotationClasses } = store.taskRom;
            if (annotationClasses.length === 0) {
                dispatchAnnotationClass({ type: 'init', projectId, data: annotationClasses });
            }
        }
    }, [store.taskRom]);

    useEffect(() => {
        if (store.taskRom.status === 'loaded' && annotationClass.status === 'saved') {
            dispatchAnnotationClass({ type: 'end' });
            store.fetchAnnotationClasses(store.taskRom.projectId);
        }
    }, [store.taskRom, annotationClass]);



    return (
        <React.Fragment>
            <Grid container className={classes.root}>
                <Grid item className={classes.mainPanel} >
                    <Grid container direction="column" className={classes.mainContentPanel}>
                        <Grid item>
                            <ThreeToolbar />
                        </Grid>
                        <Grid item className={classes.mainContent}>
                            {(store.pageStatus === 'ready' || store.pageStatus === 'saving') && store.taskFrame.status === 'loaded' ?
                                <Canvas3d pcd={store.taskFrame.pcdResource} />
                                : <div />}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item className={classes.sidePanel}>
                    <ThreeSidePanel onConfigClassesClick={openClassListDialog} />
                </Grid>
            </Grid>
            <ClassListDialog />
        </React.Fragment>
    );
};

export default ThreeAnnotationPage;