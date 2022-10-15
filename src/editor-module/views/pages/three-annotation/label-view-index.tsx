import FlLabelMainView from '@fl-three-editor/views/task-three/fl-label-main-view';
import TaskStore from '@fl-three-editor/stores/task-store';
import { FlMainCameraControls } from '@fl-three-editor/views/task-three/fl-main-camera-controls';
import CameraCalibrationStore from '@fl-three-editor/stores/camera-calibration-store';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import React from 'react';
import LabelSidePanel from './label-side-panel';
import LabelToolBar from './label-tool-bar';
import { Group, PerspectiveCamera, Vector3 } from 'three';
import PcdUtil from '@fl-three-editor/utils/pcd-util';
import FLPcd from '@fl-three-editor/views/task-three/fl-pcd';
import { buildFlCubeObject3d } from './../../task-three/fl-cube-model';

const LabelViewIndex: React.FC = () => {
  const { calibrationCamera } = CameraCalibrationStore.useContainer();

  const mainControlsRef = React.createRef<FlMainCameraControls>();
  const { taskRom, taskToolBar, taskFrames, labelViewState } =
    TaskStore.useContainer();

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

  const [pcd, pcdEditorObj] = React.useMemo(() => {
    const targetFrameNo = labelViewState?.selectedFrame || '';
    const targetFrame = taskFrames[targetFrameNo];
    if (
      targetFrame &&
      targetFrame.status !== 'none' &&
      targetFrame.pcdResource
    ) {
      const pcd = targetFrame.pcdResource;
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
  }, [taskFrames, labelViewState]);

  const framesObject: { [frameNo: string]: Group } = React.useMemo(() => {
    const resultObj: { [frameNo: string]: Group } = {};
    if (labelViewState && taskRom.status === 'loaded') {
      taskRom.frames.forEach((frameNo) => {
        resultObj[frameNo] = buildFlCubeObject3d(
          labelViewState.target,
          frameNo
        );
      });
    }
    return resultObj;
  }, [taskRom, labelViewState]);

  if (!labelViewState) {
    return <></>;
  }
  return (
    <>
      <Grid item xs={5}>
        <Stack height="100vh">
          <LabelToolBar />
          <FlLabelMainView
            showLabel={taskToolBar.showLabel}
            targetFrameNo={labelViewState.selectedFrame}
            framesObject={framesObject}
            pcd={pcd}
            bgSub={pcdEditorObj}
            cameraHelper={resolveCameraHelper(calibrationCamera)}
            mainControlsRef={mainControlsRef}
          />
        </Stack>
      </Grid>
      <Grid item xs={7}>
        <LabelSidePanel framesObject={framesObject} />
      </Grid>
    </>
  );
};
export default LabelViewIndex;
