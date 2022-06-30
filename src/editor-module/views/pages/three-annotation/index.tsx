import FrameBar from '@fl-three-editor/components/frame-bar/frame-bar';
import Grid from '@mui/material/Grid';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, {
  createRef,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
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
import ClassListDialog from './class-list-dialog';
import HotKey from './hot-key';
import ImageDialog from './image-dialog';
import ThreeSidePanel from './side-panel';
import ThreeToolbar from './tool-bar';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
      height: (props: Props) => props.height || '100vh',
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

type Props = {
  height?: '100%' | '100vh';
};

const ThreeAnnotationPage: FC<Props> = (props) => {
  const [windowWidth, setWindowWidth] = useState(0);
  const classes = useStyles(props);
  const { projectId } = useParams<{ projectId: string }>();
  const mainControlsRef = createRef<FlMainCameraControls>();
  const [initialed, setInitialed] = useState(false);

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
    resetSelectMode,
    setIsTaskAnnotationUpdated,
    changeFrame,
  } = TaskStore.useContainer();

  const { annotationClass, dispatchAnnotationClass } =
    AnnotationClassStore.useContainer();

  const { calibrationCamera, updateCalibration } =
    CameraCalibrationStore.useContainer();

  const cubeGroupRef = createRef<Group>();

  useEffect(() => {
    const onWindowResize = () => {
      setWindowWidth(window.innerWidth);
    };
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onWindowResize);

    return () => window.removeEventListener('resize', onWindowResize);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openClassListDialog = useCallback(() => {
    if (taskRom.status === 'loaded') {
      const { status, projectId, annotationClasses } = taskRom;
      resetSelectMode();
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
        <FLPcd key="" pcd={pcd} baseSize={0.3} />,
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
          selectedTaskAnnotations={selectingTaskAnnotations}
          position0={position0}
          preObject={selectingAnnotationClass}
          onClickObj={onClickObj}
          onPutObject={(e, annotationClass) => {
            if (taskRom.status !== 'loaded') {
              return;
            }
            const cubeMesh = FlCubeUtil.resolveByOnClick(e);
            const p = cubeMesh.position;
            const r = cubeMesh.rotation;
            const { defaultSize } = annotationClass;
            const { x, y, z } = defaultSize;

            // TODO control autogenerated
            const autogenerated = true;
            const vo = TaskAnnotationUtil.create(
              annotationClass,
              taskFrame.currentFrame,
              taskRom.frames,
              [
                p.x,
                p.y,
                p.z,
                r.x,
                r.y,
                r.z,
                // prevent NaN with decimal value
                Number(x),
                Number(y),
                Number(z),
              ],
              autogenerated
            );

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
    // added by lint
    addTaskAnnotations,
    mainControlsRef,
    pcdEditorObj,
    resolveCameraHelper,
    selectTaskAnnotations,
    taskToolBar.selectMode,
    taskToolBar.showLabel,
    taskToolBar.useOrthographicCamera,
    updateTaskAnnotations,
    taskRom,
  ]);

  // initialize Editor
  useEffect(() => {
    const taskId = '';
    setInitialed(false);
    open(projectId, taskId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (
      taskRom.status === 'loaded' &&
      (annotationClass.status === 'none' || annotationClass.status === 'saved')
    ) {
      const { projectId, annotationClasses } = taskRom;
      if (annotationClasses.length === 0 && !initialed) {
        changePageMode('classesList');
        dispatchAnnotationClass({
          type: 'init',
          projectId,
          data: annotationClasses,
        });
      }
      setInitialed(true);
      setIsTaskAnnotationUpdated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskRom]);

  useEffect(() => {
    if (taskRom.status === 'loaded' && annotationClass.status === 'saved') {
      dispatchAnnotationClass({ type: 'end' });
      fetchAnnotationClasses(taskRom.projectId);
      // TODO this mode using hot-key control should consider more smart way
      changePageMode('threeEdit');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskRom, annotationClass]);

  useEffect(() => {
    const imageTopicId = topicImageDialog.currentTopicId;
    if (
      topicImageDialog.open &&
      taskRom.status === 'loaded' &&
      imageTopicId &&
      taskRom.calibrations &&
      taskRom.calibrations[imageTopicId]
    ) {
      updateCalibration(taskRom.calibrations[imageTopicId]);
    } else {
      updateCalibration(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskRom, topicImageDialog]);

  const { currentFrame, totalFrames } = useMemo(() => {
    if (taskRom.status === 'loaded') {
      if (taskFrame.status === 'loaded' || taskFrame.status === 'loading') {
        return {
          currentFrame: parseInt(taskFrame.currentFrame),
          totalFrames: taskRom.frames.length,
        };
      }
    }
    return {
      currentFrame: 0,
      totalFrames: 0,
    };
  }, [taskFrame, taskRom]);

  const hasAnnotation = useCallback(
    (frame: string) => {
      return taskAnnotations.some((annotation) => {
        const points = annotation.points;
        return !!points[`${frame}`];
      });
    },
    [taskAnnotations]
  );

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
            <Grid item>
              {totalFrames > 1 && (
                <FrameBar
                  windowWidth={windowWidth}
                  currentFrame={currentFrame}
                  totalFrames={totalFrames}
                  selectedTaskAnnotations={selectingTaskAnnotations}
                  hasAnnotation={hasAnnotation}
                  onClickFrameButton={(frame: number) => {
                    changeFrame(('0000' + frame).slice(-4));
                  }}
                  onDoubleClickFrameButton={(frame: number) => {
                    //
                  }}
                />
              )}
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
      <HotKey mainControlsRef={mainControlsRef} />
    </React.Fragment>
  );
};

export default ThreeAnnotationPage;
