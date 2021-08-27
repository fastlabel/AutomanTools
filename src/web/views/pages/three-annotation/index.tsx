import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { createRef, FC, useCallback, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { Group, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import AnnotationClassStore from '../../../stores/annotation-class-store';
import TaskStore from '../../../stores/task-store';
import { TaskAnnotationVOPoints } from '../../../types/vo';
import PcdUtil from '../../../utils/pcd-util';
import FLPcd from '../../task-three/fl-pcd';
import { TaskAnnotationUtil } from './../../../use-case/task-annotation-util';
import FLThreeEditor from './../../task-three/fl-three-editor';
import ClassListDialog from './class-list-dialog';
import ImageDialog from './image-dialog';
import ThreeSidePanel from './side-panel';
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
      maxWidth: 'calc(100vw - 360px)',
    },
    mainContentPanel: {
      height: '100vh',
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
  } = TaskStore.useContainer();

  const { annotationClass, dispatchAnnotationClass } =
    AnnotationClassStore.useContainer();

  const cubeGroupRef = createRef<Group>();

  const openClassListDialog = useCallback(() => {
    if (taskRom.status === 'loaded') {
      const { status, projectId, annotationClasses } = taskRom;
      dispatchAnnotationClass({
        type: 'init',
        projectId,
        data: annotationClasses,
      });
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

  const [pcdObj, pcdEditorObj, position0] = useMemo(() => {
    if (taskFrame.status === 'loaded') {
      const pcd = taskFrame.pcdResource;
      const x = PcdUtil.getMaxMin(pcd.position, 'x');
      const y = PcdUtil.getMaxMin(pcd.position, 'y');
      const z = PcdUtil.getMaxMin(pcd.position, 'z');
      return [
        <FLPcd pcd={taskFrame.pcdResource} />,
        <FLPcd pcd={taskFrame.pcdResource} baseSize={0.08} />,
        new Vector3(
          (x.min + x.max) / 2,
          (z.min + z.max) / 2,
          -(y.min + y.max) / 2
        ),
      ];
    }
    return [undefined, undefined, undefined];
  }, [taskFrame]);

  const calibrationCamera = useMemo(() => {
    const imageTopicId = topicImageDialog.currentTopicId;
    if (taskRom.status === 'loaded' && imageTopicId && taskRom.calibrations[imageTopicId]) {
      const calibration = taskRom.calibrations[imageTopicId];
      const cameraMatrix = new Matrix4();
      const mat = calibration.cameraMat;
      cameraMatrix.set(...mat[0], 0, ...mat[1], 0, ...mat[2], 0, 0, 0, 0, 1);
      const cameraMatrixT = cameraMatrix.clone().transpose();

      const cameraExtrinsicMatrix = new Matrix4();
      const extrinsic = calibration.cameraExtrinsicMat;
      cameraExtrinsicMatrix.set(...extrinsic[0], ...extrinsic[1], ...extrinsic[2], ...extrinsic[3]);
      const cameraExtrinsicMatrixT = cameraExtrinsicMatrix.clone().transpose();

      // Flip the calibration information along with all axes.
      const flipMatrix = new Matrix4();
      flipMatrix.set(1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

      // NOTE: THREE.Matrix4.elements contains matrices in column-major order, but not row-major one.
      //       So, we need the transposed matrix to get the elements in row-major order.
      const cameraExtrinsicMatrixFlipped = flipMatrix.premultiply(cameraExtrinsicMatrix);
      const cameraExtrinsicMatrixFlippedT = cameraExtrinsicMatrixFlipped.clone().transpose();


      const distance = 30;

      const [width, height] = calibration.imageSize;
      const imageFx = cameraMatrixT.elements[0];
      const imageFov = 2 * Math.atan(width / (2 * imageFx)) / Math.PI * 180;

      const imageCamera = new PerspectiveCamera(imageFov, width / height, 1, distance);
      const [n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44] = cameraExtrinsicMatrixFlippedT.elements;
      imageCamera.matrix.set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);
      imageCamera.matrixWorld.copy(imageCamera.matrix);
      imageCamera.updateProjectionMatrix();
      imageCamera.matrixAutoUpdate = false;
      return imageCamera;
    }
    return undefined;
  }, [taskRom, topicImageDialog]);

  const editor = useMemo(() => {
    if (taskFrame.status === 'loaded' && pcdObj) {
      return (
        <FLThreeEditor
          frameNo={taskFrame.currentFrame}
          annotations={taskAnnotations}
          showLabel={taskToolBar.showLabel}
          cubeGroupRef={cubeGroupRef}
          bgMain={pcdObj}
          bgSub={pcdEditorObj}
          targets={selectingTaskAnnotations}
          position0={position0}
          preObject={selectingAnnotationClass}
          calibrationCamera={calibrationCamera}
          onClickObj={(e) => {

          }}
          onPutObject={(e, annotationClass) => {
            const vo = TaskAnnotationUtil.create(
              annotationClass,
              taskFrame.currentFrame
            );
            const cubeMesh = e.eventObject as Group;
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
              boxMesh.scale.z,
            ];
            updateTaskAnnotations({
              type: 'objectTransForm',
              frameNo: taskFrame.currentFrame,
              changes: { [boxMesh.name]: { points } },
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
    pcdObj,
    position0,
    selectingAnnotationClass,
    selectingTaskAnnotations,
    cubeGroupRef
  ]);

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
    }
  }, [taskRom, annotationClass]);

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
      <ImageDialog cubeGroup={cubeGroupRef} calibrationCamera={calibrationCamera} />
    </React.Fragment>
  );
};

export default ThreeAnnotationPage;
