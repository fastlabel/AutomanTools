import { Box } from '@mui/material';
import { Canvas, useThree } from '@react-three/fiber';
import React from 'react';
import { Euler, Group, Vector3 } from 'three';
import { PCDResult } from '../../types/labos';
import { LABEL_C_RESIZE, THREE_STYLES, THREE_SX_PROPS } from './fl-const';
import { extractFlCubeObject3d } from './fl-cube-model';
import { FlMainCameraControls } from './fl-main-camera-controls';
import FLMainControls from './fl-main-controls';
import { FlPcdPoints } from './fl-pcd-points';

type ResetEffectProps = {
  pcd?: PCDResult;
  target?: Group;
  baseSize?: number;
  mainControlsRef?: React.RefObject<FlMainCameraControls>;
};

const ResetEffect: React.FC<ResetEffectProps> = ({
  pcd,
  target,
  baseSize,
  mainControlsRef,
}) => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  React.useEffect(() => {
    scene.clear();
    if (target) {
      scene.add(target);
    }
    if (pcd) {
      const points = FlPcdPoints.buildPointsMesh(pcd, baseSize);
      scene.add(points);
    }
    gl.clear();
    gl.resetState();
    if (mainControlsRef?.current && target) {
      const [px, py, pz, ax, ay, az, sx, sy, sz] =
        extractFlCubeObject3d(target);
      const offset = Math.max(sx, sy, sz, 20);
      const positionX = px - offset;
      const positionY = py;
      const positionZ = pz + offset;
      mainControlsRef.current.point(
        new Vector3(px, py, pz),
        new Vector3(positionX, positionY, positionZ)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, gl, scene]);
  return <></>;
};

type Props = {
  position0?: Vector3;
  target?: Group;
  pcd?: PCDResult;
  cameraHelper?: JSX.Element;
  mainControlsRef?: React.RefObject<FlMainCameraControls>;
};

const FlLabelMainView: React.FC<Props> = ({
  position0,
  target,
  pcd,
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
          position0={position0}
          orthographic={orthographic}
          mainControlsRef={mainControlsRef}
        />
        <ResetEffect
          target={target}
          pcd={pcd}
          baseSize={orthographic ? 0.3 : 0.015}
          mainControlsRef={mainControlsRef}
        />
        {cameraHelper}
      </Canvas>
    </Box>
  );
};
export default FlLabelMainView;
