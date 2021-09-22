import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { createRef, FC, useCallback, useEffect, useMemo } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { Group, PerspectiveCamera, Vector3 } from 'three';
import AnnotationClassStore from '../../../stores/annotation-class-store';
import CameraCalibrationStore from '../../../stores/camera-calibration-store';
import TaskStore from '../../../stores/task-store';
import PcdUtil from '../../../utils/pcd-util';
import { FlMainCameraControls } from '../../task-three/fl-main-camera-controls';
import FLPcd from '../../task-three/fl-pcd';
import { FlCubeUtil } from './../../../utils/fl-cube-util';
import { TaskAnnotationUtil } from './../../../utils/task-annotation-util';
import FLThreeEditor from './../../task-three/fl-three-editor';
import CalibrationEditDialog from './calibration-edit-dialog';
import ClassListDialog from './class-list-dialog';
import HotKey from './hot-key';
import ImageDialog from './image-dialog';
import ThreeSidePanel from './side-panel';
import ThreeToolbar from './tool-bar';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      height: '100%',
      width: '100vw',
    },
    mainPanel: {
      flexGrow: 1,
      maxWidth: 'calc(100vw - 360px)',
    },
    mainContentPanel: {
      height: '100%',
    },
    mainContent: {
      flexGrow: 1,
    },
    sidePanel: {},
  })
);

const ThreeAnnotationPage: FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const { projectId } = useParams<{ projectId: string }>();
  const mainControlsRef = createRef<FlMainCameraControls>();

  const {
    taskToolBar,
    taskRom,
    taskEditor,
    taskFrame,
    taskAnnotations,
    topicImageDialog,
    open,
    fetchAnnotationClasses,
    addTaskAnnotations,
    updateTaskAnnotations,
    selectTaskAnnotations,
    changePageMode,
  } = TaskStore.useContainer();

  const { annotationClass, dispatchAnnotationClass } =
    AnnotationClassStore.useContainer();

  const { calibrationCamera, updateCalibration } =
    CameraCalibrationStore.useContainer();

  const cubeGroupRef = createRef<Group>();

  const openClassListDialog = useCallback(() => {
    if (taskRom.status === 'loaded') {
      const { status, projectId, annotationClasses } = taskRom;
      changePageMode('classesList');
      dispatchAnnotationClass({
        type: 'init',
        projectId,
        data: annotationClasses,
      });
    }
  }, [taskRom]);

  const onClickObj = useCallback(
    (e: any) => {
      const clickedObj = FlCubeUtil.resolveByOnClick(e);
      const id = FlCubeUtil.getId(clickedObj);
      const selected = taskAnnotations.filter((vo) => vo.id === id);
      selectTaskAnnotations(selected, 'single');
    },
    [taskAnnotations, selectTaskAnnotations]
  );

  const [selectingAnnotationClass, selectingTaskAnnotations] = useMemo(() => {
    if (taskEditor.editorState.mode === 'selecting_annotationClass') {
      return [taskEditor.editorState.selectingAnnotationClass, undefined];
    } else if (taskEditor.editorState.mode === 'selecting_taskAnnotation') {
      return [undefined, taskEditor.editorState.selectingTaskAnnotations];
    }
    return [undefined, undefined];
  }, [taskEditor]);

  const [pcd, pcdEditorObj, position0] = useMemo(() => {
    if (taskFrame.status !== 'none' && taskFrame.pcdResource) {
      const pcd = taskFrame.pcdResource;
      const x = PcdUtil.getMaxMin(pcd.position, 'x');
      const y = PcdUtil.getMaxMin(pcd.position, 'y');
      const z = PcdUtil.getMaxMin(pcd.position, 'z');
      return [
        pcd,
        <FLPcd pcd={pcd} baseSize={0.3} />,
        new Vector3(
          (x.min + x.max) / 2,
          (z.min + z.max) / 2,
          -(y.min + y.max) / 2
        ),
      ];
    }
    return [undefined, undefined, undefined];
  }, [taskFrame]);

  const resolveCameraHelper = useCallback(
    (calibrationCamera?: PerspectiveCamera) => {
      if (!calibrationCamera) {
        return undefined;
      }
      const helperCamera = calibrationCamera.clone();
      helperCamera.far = 30;
      return <cameraHelper args={[helperCamera]} />;
    },
    []
  );

  const editor = useMemo(() => {
    if (taskFrame.status !== 'none' && pcd) {
      return (
        <FLThreeEditor
          mainControlsRef={mainControlsRef}
          frameNo={taskFrame.currentFrame}
          annotations={taskAnnotations}
          useOrthographicCamera={taskToolBar.useOrthographicCamera || undefined}
          selectable={taskToolBar.selectMode === 'select'}
          showLabel={taskToolBar.showLabel}
          cubeGroupRef={cubeGroupRef}
          pcd={pcd}
          bgSub={pcdEditorObj}
          cameraHelper={resolveCameraHelper(calibrationCamera)}
          targets={selectingTaskAnnotations}
          position0={position0}
          preObject={selectingAnnotationClass}
          onClickObj={onClickObj}
          onPutObject={(e, annotationClass) => {
            const vo = TaskAnnotationUtil.create(
              annotationClass,
              taskFrame.currentFrame
            );
            const cubeMesh = FlCubeUtil.resolveByOnClick(e);
            const p = cubeMesh.position;
            const r = cubeMesh.rotation;
            const { defaultSize } = annotationClass;
            const { x, y, z } = defaultSize;
            vo.points[taskFrame.currentFrame] = [
              p.x,
              p.y,
              p.z,
              r.x,
              r.y,
              r.z,
              x,
              y,
              z,
            ];
            addTaskAnnotations([vo]);
            selectTaskAnnotations([vo], 'single');
          }}
          onObjectChange={(e) => {
            const changedObj = e.target.object;
            const id = FlCubeUtil.getId(changedObj);
            const points = FlCubeUtil.getPointsVo(changedObj);
            updateTaskAnnotations({
              type: 'objectTransForm',
              frameNo: taskFrame.currentFrame,
              changes: { [id]: { points } },
            });
          }}
        />
      );
    }
    return <div />;
  }, [
    taskFrame,
    taskAnnotations,
    calibrationCamera,
    pcd,
    position0,
    selectingAnnotationClass,
    selectingTaskAnnotations,
    cubeGroupRef,
    onClickObj,
  ]);

  // initialize Editor
  useEffect(() => {
    const taskId = '';
    open(projectId, taskId);
  }, [projectId]);

  useEffect(() => {
    if (taskRom.status === 'loaded') {
      const { status, projectId, annotationClasses } = taskRom;
      if (annotationClasses.length === 0) {
        dispatchAnnotationClass({
          type: 'init',
          projectId,
          data: annotationClasses,
        });
      }
    }
  }, [taskRom]);

  useEffect(() => {
    if (taskRom.status === 'loaded' && annotationClass.status === 'saved') {
      dispatchAnnotationClass({ type: 'end' });
      fetchAnnotationClasses(taskRom.projectId);
      changePageMode('threeEdit');
    }
  }, [taskRom, annotationClass]);

  useEffect(() => {
    const imageTopicId = topicImageDialog.currentTopicId;
    if (
      topicImageDialog.open &&
      taskRom.status === 'loaded' &&
      imageTopicId &&
      taskRom.calibrations[imageTopicId]
    ) {
      updateCalibration(taskRom.calibrations[imageTopicId]);
    } else {
      updateCalibration(undefined);
    }
  }, [taskRom, topicImageDialog]);

  return (
    <React.Fragment>
      <Grid container className={classes.root}>
        <Grid item className={classes.mainPanel}>
          <Grid
            container
            direction="column"
            className={classes.mainContentPanel}>
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
      <ImageDialog calibrationCamera={calibrationCamera} />
      <CalibrationEditDialog />
      <HotKey mainControlsRef={mainControlsRef} />
    </React.Fragment>
  );
};

export default ThreeAnnotationPage;
