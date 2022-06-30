import { ThreeEvent } from '@react-three/fiber';
import React from 'react';
import { Object3D } from 'three';
import { TaskAnnotationVO } from '../../types/vo';
import FLCube from './fl-cube';

type Props = {
  frameNo: string;
  annotations: TaskAnnotationVO[];
  selectedTaskAnnotations?: TaskAnnotationVO[];
  selectable?: boolean;
  showLabel?: boolean;
  hoveredLabelAnnotationId?: string;
  annotationOpacity?: number;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  onLabelMouseOver?: (hoveredId: string) => void;
};

const FLCubes = React.forwardRef<Object3D, Props>(
  (
    {
      frameNo,
      annotations,
      selectedTaskAnnotations,
      selectable = false,
      showLabel = false,
      hoveredLabelAnnotationId,
      annotationOpacity,
      onClick = (f) => f,
      onLabelMouseOver = (f) => f,
    },
    ref
  ) => {
    const selectedTaskAnnotationSet = React.useMemo(
      () => new Set(selectedTaskAnnotations?.map((a) => a.id)),
      [selectedTaskAnnotations]
    );
    const getLabelTitle = (
      taskAnnotation: TaskAnnotationVO,
      hoveredLabelAnnotationId?: string
    ) => {
      const isHovered = hoveredLabelAnnotationId === taskAnnotation.id;
      const attributeValue = '';
      const labelTitleSep = isHovered ? '\n' : ': ';
      return attributeValue
        ? taskAnnotation.title + labelTitleSep + attributeValue
        : taskAnnotation.title;
    };
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
                  selected={selectedTaskAnnotationSet.has(a.id)}
                  selectable={selectable}
                  showLabel={showLabel}
                  labelTitle={getLabelTitle(a, hoveredLabelAnnotationId)}
                  color={a.color}
                  annotationOpacity={annotationOpacity}
                  onClick={onClick}
                  onLabelMouseOver={onLabelMouseOver}
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
