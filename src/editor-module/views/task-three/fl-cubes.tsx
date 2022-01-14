import { ThreeEvent } from '@react-three/fiber';
import React from 'react';
import { Object3D } from 'three';
import { TaskAnnotationVO } from '../../types/vo';
import FLCube from './fl-cube';

type Props = {
  frameNo: string;
  annotations: TaskAnnotationVO[];
  selectable?: boolean;
  showLabel?: boolean;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
};

const FLCubes = React.forwardRef<Object3D, Props>(
  (
    {
      frameNo,
      annotations,
      selectable = false,
      showLabel = false,
      onClick = (f) => f,
    },
    ref
  ) => {
    return (
      <group ref={ref}>
        {annotations
          .map((a) => {
            const points = a.points[frameNo as any];
            if (points) {
              return (
                <FLCube
                  key={a.id}
                  id={a.id}
                  points={points}
                  selectable={selectable}
                  showLabel={showLabel}
                  color={a.color}
                  onClick={onClick}
                />
              );
            }
            return undefined;
          })
          .filter((r) => !!r)}
      </group>
    );
  }
);

export default FLCubes;
