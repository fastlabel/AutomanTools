import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from 'react-router-dom';
import { Group, Vector3 } from 'three';
import AnnotationClassStore from '../../../stores/annotation-class-store';
import TaskStore from '../../../stores/task-store';
import { TaskAnnotationVOPoints } from '../../../types/vo';
import PcdUtil from '../../../utils/pcd-util';
import FLPcd from '../../task-three/fl-pcd';
import { TaskAnnotationUtil } from './../../../use-case/task-annotation-util';
import FLThreeEditor from './../../task-three/fl-three-editor';
import ClassListDialog from './class-list-dialog';
import ImageDialog from './image-dialog';
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
            flexGrow: 1,
            maxWidth: 'calc(100vw - 360px)'
        },
        mainContentPanel: {
            height: '100vh'
        },
        mainContent: {
            flexGrow: 1,
        },
        sidePanel: {
        }
    }),
);

const ThreeAnnotationPage: FC = () => {
    const classes = useStyles();
    const history = useHistory();

    const { taskRom, taskEditor, taskFrame, taskAnnotations,
        open, fetchAnnotationClasses,
        addTaskAnnotations,
        updateTaskAnnotations,
        selectTaskAnnotations
    } = TaskStore.useContainer();

    const { annotationClass, dispatchAnnotationClass } = AnnotationClassStore.useContainer();

    const [cubeRef, setCubeRef] = useState<any>();

    const openClassListDialog = useCallback(() => {
        if (taskRom.status === 'loaded') {
            const { status, projectId, annotationClasses } = taskRom;
            dispatchAnnotationClass({ type: 'init', projectId, data: annotationClasses });
        }
    }, [taskRom]);

    const [selectingAnnotationClass, selectingTaskAnnotations] = useMemo(() => {
        if (taskEditor.editorState.mode === 'selecting_annotationClass') {
            return [taskEditor.editorState.selectingAnnotationClass, undefined];
        } else if (taskEditor.editorState.mode === 'selecting_taskAnnotation') {
            return [undefined, taskEditor.editorState.selectingTaskAnnotations];
        }
        return [undefined, undefined];
    }, [taskEditor]);

    const [pcdObj, position0] = useMemo(() => {
        if (taskFrame.status === 'loaded') {
            const pcd = taskFrame.pcdResource;
            const x = PcdUtil.getMaxMin(pcd.position, 'x');
            const y = PcdUtil.getMaxMin(pcd.position, 'y');
            const z = PcdUtil.getMaxMin(pcd.position, 'z');
            return [(<FLPcd pcd={taskFrame.pcdResource} />), new Vector3((x.min + x.max) / 2, (z.min + z.max) / 2, -(y.min + y.max) / 2)];
        }
        return [undefined, undefined];
    }, [taskFrame]);

    const editor = useMemo(() => {
        if (taskFrame.status === 'loaded' && pcdObj) {
            return (<FLThreeEditor
                frameNo={taskFrame.currentFrame}
                annotations={taskAnnotations}
                backgroundObj={pcdObj}
                targets={selectingTaskAnnotations}
                position0={position0}
                preObject={selectingAnnotationClass}
                onClickObj={(e) => { setCubeRef(e.eventObject) }}
                onPutObject={(e, annotationClass) => {
                    const vo = TaskAnnotationUtil.create(annotationClass, taskFrame.currentFrame);
                    const cubeMesh = e.eventObject as Group;
                    const p = cubeMesh.position;
                    const r = cubeMesh.rotation;
                    const { defaultSize } = annotationClass;
                    const { x, y, z } = defaultSize;
                    vo.points[taskFrame.currentFrame] = [p.x, p.y, p.z, r.x, r.y, r.z, x, y, z];
                    addTaskAnnotations([vo]);
                    selectTaskAnnotations([vo], "single");
                }}
                onObjectChange={(e) => {
                    const boxMesh = e.target.object as Group;
                    const points: TaskAnnotationVOPoints = [
                        boxMesh.position.x,
                        boxMesh.position.y,
                        boxMesh.position.z,
                        boxMesh.rotation.x,
                        boxMesh.rotation.y,
                        boxMesh.rotation.z,
                        boxMesh.scale.x,
                        boxMesh.scale.y,
                        boxMesh.scale.z
                    ];
                    updateTaskAnnotations({ type: 'objectTransForm', frameNo: taskFrame.currentFrame, changes: { [boxMesh.name]: { points } } })
                }}
            />);
        }
        return (<div />);
    }, [taskFrame, taskAnnotations, pcdObj, cubeRef, position0, selectingAnnotationClass, selectingTaskAnnotations])

    // initialize Editor
    useEffect(() => {
        const projectId = '';
        const taskId = '';
        open(projectId, taskId);
    }, []);

    useEffect(() => {
        if (taskRom.status === 'loaded') {
            const { status, projectId, annotationClasses } = taskRom;
            if (annotationClasses.length === 0) {
                dispatchAnnotationClass({ type: 'init', projectId, data: annotationClasses });
            }
        }
    }, [taskRom]);

    useEffect(() => {
        if (taskRom.status === 'loaded' && annotationClass.status === 'saved') {
            dispatchAnnotationClass({ type: 'end' });
            fetchAnnotationClasses(taskRom.projectId);
        }
    }, [taskRom, annotationClass]);

    return (
        <React.Fragment>
            <Grid container className={classes.root}>
                <Grid item className={classes.mainPanel} >
                    <Grid container direction="column" className={classes.mainContentPanel}>
                        <Grid item>
                            <ThreeToolbar />
                        </Grid>
                        <Grid item className={classes.mainContent}>
                            {editor}
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item className={classes.sidePanel}>
                    <ThreeSidePanel onConfigClassesClick={openClassListDialog} />
                </Grid>
            </Grid>
            <ClassListDialog />
            <ImageDialog />
        </React.Fragment>
    );
};

export default ThreeAnnotationPage;