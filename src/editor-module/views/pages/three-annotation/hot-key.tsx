import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC, useCallback, useEffect, useMemo } from 'react';
import TaskStore from '../../../stores/task-store';
import { AnnotationClassVO } from '../../../types/vo';
import { FlMainCameraControls } from '../../task-three/fl-main-camera-controls';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      width: '100%',
      height: '100%',
      '&:focus': {
        outline: 'none',
      },
    },
  })
);

type Props = {
  mainControlsRef?: React.RefObject<FlMainCameraControls>;
};

const KEY_ROTATE_SEED = Math.PI / 180;
const KEY_PAN_SEED = 7;
const KEY_DOLLY_SEED = Math.pow(0.95, 1);

const HotKey: FC<Props> = ({ mainControlsRef }) => {
  const styles = useStyles();
  const {
    taskRom,
    taskFrame,
    taskEditor,
    updateTaskAnnotations,
    selectAnnotationClass,
    resetSelectMode,
  } = TaskStore.useContainer();

  const memoTaskStore = useMemo(() => {
    let enableHotKey = false;
    let currentFrameNo = '';
    let selectingTaskAnnotationIds: string[] = [];
    let annotationClasses: AnnotationClassVO[] = [];
    if (taskRom.status !== 'loaded' || taskFrame.status === 'none') {
      return {
        enableHotKey,
        currentFrameNo,
        selectingTaskAnnotationIds,
        annotationClasses,
      };
    }
    enableHotKey = taskEditor.pageMode === 'threeEdit';
    // hasMultiFrame = taskRom.frames.length > 1;
    currentFrameNo = taskFrame.currentFrame;
    annotationClasses = taskRom.annotationClasses;

    if (taskEditor.editorState.mode === 'selecting_taskAnnotation') {
      selectingTaskAnnotationIds =
        taskEditor.editorState.selectingTaskAnnotations.map((vo) => vo.id);
    }
    return {
      enableHotKey,
      currentFrameNo,
      selectingTaskAnnotationIds,
      annotationClasses,
    };
  }, [taskRom, taskFrame, taskEditor]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!memoTaskStore.enableHotKey) {
        return;
      }
      const controls = mainControlsRef?.current;
      const { key } = event;

      let handled = true;
      switch (key) {
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          // eslint-disable-next-line no-case-declarations
          const selectAnnotationClassIdx = Number(key) - 1;
          // eslint-disable-next-line no-case-declarations
          const annClasses = memoTaskStore.annotationClasses;
          if (annClasses.length > Number(key) - 1) {
            selectAnnotationClass(annClasses[selectAnnotationClassIdx]);
          }
          break;
        case 'ArrowRight':
          if (controls) {
            controls.keyRotate(KEY_ROTATE_SEED, 0);
          }
          break;
        case 'ArrowLeft':
          if (controls) {
            controls.keyRotate(-KEY_ROTATE_SEED, 0);
          }
          break;
        case 'ArrowDown':
          if (controls) {
            controls.keyRotate(0, -KEY_ROTATE_SEED);
          }
          break;
        case 'ArrowUp':
          if (controls) {
            controls.keyRotate(0, KEY_ROTATE_SEED);
          }
          break;
        case 'q':
          if (controls) {
            // TODO move forward
            controls.pan(0, 0, -KEY_DOLLY_SEED);
          }
          break;
        case 'e':
          if (controls) {
            // TODO move back
            controls.pan(0, 0, KEY_DOLLY_SEED);
          }
          break;
        case 'a':
          if (controls) {
            // move left
            controls.pan(KEY_PAN_SEED, 0, 0);
          }
          break;
        case 'w':
          if (controls) {
            // TODO move up
            controls.pan(0, KEY_PAN_SEED, 0);
          }
          break;
        case 's':
          if (controls) {
            // TODO move down
            controls.pan(0, -KEY_PAN_SEED, 0);
          }
          break;
        case 'd':
          if (controls) {
            // move right
            controls.pan(-KEY_PAN_SEED, 0, 0);
          }
          break;
        case 'Escape':
          resetSelectMode();
          break;
        case 'Delete':
          // current only supported single select
          updateTaskAnnotations({
            type: event.shiftKey ? 'removeAll' : 'removeFrame',
            id: memoTaskStore.selectingTaskAnnotationIds[0],
            frameNo: memoTaskStore.currentFrameNo,
          });
          break;
        default:
          handled = false;
      }
      if (handled) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      console.log(key);
    },
    [mainControlsRef, memoTaskStore]
  );

  useEffect(() => {
    const oldOnKeyDown = onKeyDown;
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', oldOnKeyDown);
    };
  }, [onKeyDown]);
  return <></>;
};
export default HotKey;
