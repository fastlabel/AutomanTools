import { Box } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import { Euler, Group, Vector3 } from 'three';
import { PCDResult } from '../../types/labos';
import { TaskAnnotationVO } from '../../types/vo';
import FLCubes from './fl-cubes';
import { FlMainCameraControls } from './fl-main-camera-controls';
import FLMainControls from './fl-main-controls';
import FLPcd from './fl-pcd';

const C_RESIZE = { debounce: 100 };

const ANNOTATION_OPACITY = 50;

type Props = {
  showLabel: boolean;
  targetFrameNo: string;
  targetTaskAnnotation:TaskAnnotationVO;
  pcd?: PCDResult;
  bgSub?: JSX.Element;
  cameraHelper?: JSX.Element;
  mainControlsRef?: React.RefObject<FlMainCameraControls>;
};

const FlLabelMainView: React.FC<Props> = ({
  showLabel,
  targetFrameNo,
  targetTaskAnnotation,
  pcd,
  bgSub,
  cameraHelper,
  mainControlsRef,
}) => {
  const orthographic = true;
  const _cubeGroupRef = React.createRef<Group>();
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
        <FLCubes
          ref={_cubeGroupRef}
          selectedTaskAnnotations={[targetTaskAnnotation]}
          frameNo={targetFrameNo}
          selectable={false}
          showLabel={showLabel}
          annotationOpacity={ANNOTATION_OPACITY}
          annotations={[targetTaskAnnotation]}
        />
        {cameraHelper}
      </Canvas>
    </Box>
  );
};
export default FlLabelMainView;
