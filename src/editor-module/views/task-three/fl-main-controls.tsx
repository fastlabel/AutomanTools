import { ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import React, { createRef, FC, useEffect } from 'react';
import { Vector3 } from 'three';
import { AnnotationClassVO } from '../../types/vo';
import FLAnnotationControls, {
  FLAnnotationControlsImpl,
} from './fl-annotation-controls';
import { FlMainCameraControls } from './fl-main-camera-controls';

type Props = {
  orthographic: boolean;
  position0?: Vector3;
  preObject?: AnnotationClassVO;
  mainControlsRef?: React.RefObject<FlMainCameraControls>;
  onPutObject?: (
    evt: ThreeEvent<MouseEvent>,
    preObject: AnnotationClassVO
  ) => void;
};

const FLMainControls: FC<Props> = ({
  orthographic,
  position0,
  preObject,
  mainControlsRef,
  onPutObject = (f) => f,
}) => {
  const gl = useThree(({ gl }) => gl);
  const camera = useThree(({ camera }) => camera);
  const mainControls = React.useMemo(
    () => new FlMainCameraControls(camera),
    [camera]
  );

  const annotation = createRef<FLAnnotationControlsImpl>();

  // TODO adjust  position only first time
  useFrame(() => {
    if (mainControls.enabled) mainControls.update();
  });

  useEffect(() => {
    const putMode = !!preObject;

    if (annotation.current) {
      annotation.current.enabled = putMode;
    }
  }, [annotation]);

  useEffect(() => {
    mainControls.connect(gl.domElement);
    if (position0 && mainControls.enabled) {
      mainControls.object.position.copy(
        position0.clone().setZ(position0.z + 50)
      );
      mainControls.saveState();
    }
  }, [mainControls]);
  return (
    <>
      <FLAnnotationControls
        ref={annotation}
        camera={camera}
        preObject={preObject}
        onPutObject={onPutObject}
      />
      <primitive
        ref={mainControlsRef}
        object={mainControls}
        minZoom={10}
        maxZoom={200}
        minPolarAngle={orthographic ? 0 : undefined}
        maxPolarAngle={orthographic ? 0 : undefined}
        minDistance={0.3}
        maxDistance={0.3 * 100}
      />
    </>
  );
};

export default FLMainControls;
