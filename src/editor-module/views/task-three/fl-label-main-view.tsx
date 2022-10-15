import { Box } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import { Euler, Group, Vector3 } from 'three';
import { PCDResult } from '../../types/labos';
import { FlMainCameraControls } from './fl-main-camera-controls';
import FLMainControls from './fl-main-controls';
import FLPcd from './fl-pcd';

const C_RESIZE = { debounce: 200 };

const ANNOTATION_OPACITY = 50;

type Props = {
  showLabel: boolean;
  targetFrameNo: string;
  framesObject: { [frameNo: string]: Group };
  pcd?: PCDResult;
  bgSub?: JSX.Element;
  cameraHelper?: JSX.Element;
  mainControlsRef?: React.RefObject<FlMainCameraControls>;
};

const FlLabelMainView: React.FC<Props> = ({
  showLabel,
  targetFrameNo,
  framesObject,
  pcd,
  bgSub,
  cameraHelper,
  mainControlsRef,
}) => {
  const orthographic = false;

  return (
    <Box component="div" flexGrow={1} mt={2} mr={2} ml={2} mb={1}>
      <Canvas
        orthographic={orthographic}
        camera={{
          fov: 50,
          up: new Vector3(0, 0, 1),
          rotation: new Euler(0, 0, 0, 'ZXY'),
          zoom: orthographic ? 10 : undefined,
        }}
        style={{ backgroundColor: 'black' }}
        resize={C_RESIZE}>
        <FLMainControls
          orthographic={orthographic}
          mainControlsRef={mainControlsRef}
        />
        {pcd ? (
          <FLPcd pcd={pcd} baseSize={orthographic ? 0.3 : 0.015} />
        ) : (
          bgSub
        )}
        <primitive object={framesObject[targetFrameNo]}/>
        {cameraHelper}
      </Canvas>
    </Box>
  );
};
export default FlLabelMainView;
