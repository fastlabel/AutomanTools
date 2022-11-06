import CameraCalibrationStore from '@fl-three-editor/stores/camera-calibration-store';
import TaskStore from '@fl-three-editor/stores/task-store';
import { PCDResult } from '@fl-three-editor/types/labos';
import { ThreePoints } from '@fl-three-editor/types/vo';
import PcdUtil from '@fl-three-editor/utils/pcd-util';
import FlLabelMainView from '@fl-three-editor/views/task-three/fl-label-main-view';
import { FlMainCameraControls } from '@fl-three-editor/views/task-three/fl-main-camera-controls';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import React from 'react';
import { Group, PerspectiveCamera, Vector3 } from 'three';
import {
  buildFlCubeObject3d,
  extractFlCubeObject3d,
} from './../../task-three/fl-cube-model';
import LabelSidePanel from './label-side-panel';
import LabelToolBar from './label-tool-bar';

const LabelViewIndex: React.FC = () => {
  const { calibrationCamera } = CameraCalibrationStore.useContainer();

  const mainControlsRef = React.createRef<FlMainCameraControls>();
  const {
    loadStatus,
    taskRom,
    taskFrames,
    labelViewState,
    labelViewPageState,
    endLabelView,
    updateTaskAnnotations,
  } = TaskStore.useContainer();

  const resolveCameraHelper = React.useCallback(
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
  const [pcd, setPcd] = React.useState<PCDResult>();
  const [position0, setPosition0] = React.useState<Vector3>();

  React.useEffect(() => {
    const targetFrameNo = labelViewPageState?.selectedFrame || '';
    const targetFrame = taskFrames[targetFrameNo];
    if (
      targetFrame &&
      targetFrame.status !== 'none' &&
      targetFrame.pcdResource
    ) {
      const pcd = targetFrame.pcdResource;
      setPcd(pcd);
      if (!position0) {
        const x = PcdUtil.getMaxMin(pcd.position, 'x');
        const y = PcdUtil.getMaxMin(pcd.position, 'y');
        const z = PcdUtil.getMaxMin(pcd.position, 'z');
        setPosition0(
          new Vector3(
            (x.min + x.max) / 2,
            (z.min + z.max) / 2,
            -(y.min + y.max) / 2
          )
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskFrames, labelViewPageState]);

  const [currentPoints, setCurrentPoints] = React.useState<{
    [frameNo: string]: ThreePoints;
  }>({});

  const [framesObject, framesPoints] = React.useMemo(() => {
    const resultObj: { [frameNo: string]: Group } = {};
    // copy for prevent leak object
    const resultPoints: { [frameNo: string]: ThreePoints } = {};
    if (labelViewState && taskRom.status === 'loaded') {
      taskRom.frames.forEach((frameNo) => {
        const flCube = buildFlCubeObject3d(labelViewState.target, frameNo);
        if (flCube) {
          resultObj[frameNo] = flCube;
          resultPoints[frameNo] = labelViewState.target.points[
            frameNo
          ].concat() as ThreePoints;
        }
      });
    }
    return [resultObj, resultPoints];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const target = React.useMemo(() => {
    if (labelViewPageState) {
      return framesObject[labelViewPageState.selectedFrame];
    }
    return undefined;
  }, [framesObject, labelViewPageState]);

  React.useEffect(() => {
    setCurrentPoints(framesPoints);
  }, [framesPoints]);

  if (!labelViewState || !labelViewPageState) {
    return <></>;
  }
  return (
    <>
      <Grid item xs={5}>
        <Stack height="100vh">
          <LabelToolBar
            onEndLabelView={() => {
              const points = Object.keys(framesObject).reduce<{
                [frameNo: string]: ThreePoints;
              }>((r, key) => {
                r[key] = extractFlCubeObject3d(framesObject[key]);
                return r;
              }, {});
              const newVo = { ...labelViewState.target, points };
              updateTaskAnnotations({
                type: 'updateTaskAnnotation',
                vo: newVo,
              });
              endLabelView();
            }}
          />
          {loadStatus === 'loaded' && (
            <FlLabelMainView
              target={target}
              pcd={pcd}
              position0={position0}
              cameraHelper={resolveCameraHelper(calibrationCamera)}
              mainControlsRef={mainControlsRef}
            />
          )}
        </Stack>
      </Grid>
      <Grid item xs={7}>
        <LabelSidePanel
          framesObject={framesObject}
          framesPoints={currentPoints}
          onUpdateFramesPoints={setCurrentPoints}
        />
      </Grid>
    </>
  );
};
export default LabelViewIndex;
