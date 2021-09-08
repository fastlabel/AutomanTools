import { useThree } from '@react-three/fiber';
import React, { FC, useEffect, useMemo } from 'react';
import { Event, Object3D } from 'three';
import { FLTransformControls } from './fl-transform-controls';
import { ControlType } from './fl-transform-controls-gizmo';

const FLObjectControls: FC<{
  control: ControlType;
  target?: Object3D;
  onObjectChange?: (event: Event) => void;
}> = ({ control, target, onObjectChange = (f) => f }) => {
  const { gl, camera } = useThree(({ gl, camera }) => ({ gl, camera }));
  const controls = useMemo(() => {
    return new FLTransformControls(camera, gl.domElement, control);
  }, [control]);

  useEffect(() => {
    if (target) {
      controls.attach(target);
    } else {
      controls.detach();
    }
  }, [controls, target]);

  useEffect(() => {
    controls && controls.addEventListener('objectChange', onObjectChange);
    return () => {
      controls && controls.removeEventListener('objectChange', onObjectChange);
    };
  }, [controls, onObjectChange]);

  return controls ? (
    <>
      <primitive dispose={undefined} object={controls} />
    </>
  ) : null;
};

export default FLObjectControls;
