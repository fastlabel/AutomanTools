import { useFrame, useThree } from '@react-three/fiber';
import React, { FC, useCallback, useMemo } from 'react';
import { Event, Object3D, OrthographicCamera } from 'three';
import { FLObjectCameraControls } from './fl-object-camera-controls';
import { FLTransformControls } from './fl-transform-controls';
import { ControlType } from './fl-transform-controls-gizmo';

const [zoom, distance] = [5, 5];

const FLObjectControls: FC<{
  control: ControlType;
  target?: Object3D;
  onObjectChange?: (event: Event) => void;
}> = ({ control, target, onObjectChange = (f) => f }) => {
  const invalidate = useThree(({ invalidate }) => invalidate);
  const gl = useThree(({ gl }) => gl);
  const camera = useThree(({ camera }) => camera);

  const initCamera = useCallback(
    (orbit: FLObjectCameraControls) => {
      const camera = orbit.object as OrthographicCamera;
      camera.zoom = zoom;

      orbit.target.set(0, 0, 0);

      switch (control) {
        case 'top':
          camera.up.set(0, 0, -1);
          camera.position.set(0, 0, distance);
          break;
        case 'side':
          camera.up.set(0, -1, 0);
          camera.position.set(0, distance, 0);
          break;
        case 'front':
          camera.up.set(-1, 0, 0);
          camera.position.set(distance, 0, 0);
          break;
      }
      camera.lookAt(orbit.target);
      camera.updateProjectionMatrix();
      orbit.update();
      orbit.saveState();
    },
    [control]
  );

  const [orbitControls, transformControls] = useMemo(() => {
    const orbit = new FLObjectCameraControls(camera, control);
    orbit.minZoom = zoom;
    orbit.maxZoom = 200;
    initCamera(orbit);

    const transform = new FLTransformControls(
      camera,
      gl.domElement,
      control,
      orbit
    );
    return [orbit, transform];
  }, [control]);

  React.useEffect(() => {
    const callback = (e: THREE.Event) => {
      invalidate();
    };
    orbitControls.connect(gl.domElement);
    orbitControls.addEventListener('change', callback);
    orbitControls.listenToKeyEvents(document.body);
    return () => {
      orbitControls.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orbitControls, invalidate]);

  React.useEffect(() => {
    if (target) {
      transformControls.attach(target);
    } else {
      transformControls.detach();
      initCamera(orbitControls);
    }
  }, [transformControls, target]);

  React.useEffect(() => {
    const old = transformControls;
    old.addEventListener('objectChange', onObjectChange);
    return () => {
      old.removeEventListener('objectChange', onObjectChange);
    };
  }, [transformControls, onObjectChange]);

  useFrame(() => {
    if (!transformControls.isDragging() && orbitControls.enabled)
      orbitControls.update();
  });

  return (
    <>
      <primitive object={orbitControls} />
      <primitive object={transformControls} />
    </>
  );
};

export default FLObjectControls;
