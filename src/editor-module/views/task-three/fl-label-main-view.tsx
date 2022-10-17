import { Box } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import { Euler, Group, Vector3 } from 'three';
import { PCDResult } from '../../types/labos';
import { LABEL_C_RESIZE, THREE_STYLES, THREE_SX_PROPS } from './fl-const';
import { FlMainCameraControls } from './fl-main-camera-controls';
import FLMainControls from './fl-main-controls';
import FLPcd from './fl-pcd';

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
  const rootRef = React.createRef<HTMLDivElement>();
  const orthographic = false;

  React.useEffect(() => {
    if (rootRef.current) {
      const root = rootRef.current;
      const handleResize = () => {
        const canvas = root.getElementsByTagName('canvas') as any;
        for (const c of canvas) {
          c.width = 0;
          c.height = 0;
          c.style.width = '';
          c.style.height = '';
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [rootRef]);

  return (
    <Box
      ref={rootRef}
      component="div"
      flexGrow={1}
      px={2}
      pt={2}
      pb={1}
      sx={{ backgroundColor: THREE_STYLES.baseBackgroundColor }}>
      <Canvas
        orthographic={orthographic}
        camera={{
          fov: 50,
          up: new Vector3(0, 0, 1),
          rotation: new Euler(0, 0, 0, 'ZXY'),
          zoom: orthographic ? 10 : undefined,
        }}
        style={THREE_SX_PROPS.canvasSx}
        resize={LABEL_C_RESIZE}>
        <FLMainControls
          orthographic={orthographic}
          mainControlsRef={mainControlsRef}
        />
        {pcd ? (
          <FLPcd pcd={pcd} baseSize={orthographic ? 0.3 : 0.015} />
        ) : (
          bgSub
        )}
        <primitive object={framesObject[targetFrameNo]} />
        {cameraHelper}
      </Canvas>
    </Box>
  );
};
export default FlLabelMainView;
