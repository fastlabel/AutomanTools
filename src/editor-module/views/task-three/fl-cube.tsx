import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Html } from './drei-html';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import React, { useState } from 'react';
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';
import { ThreePoints } from '../../types/vo';

const useStyles = makeStyles(() =>
  createStyles({
    tooltip: {
      display: 'flex',
      padding: '4px 8px',
      borderRadius: 8,
      backgroundColor: '#24303b',
    },
    tooltipLabel: {
      paddingRight: 4,
      color: '#fff',
    },
    tooltipContent: {
      whiteSpace: 'pre',
      userSelect: 'none',
    },
  })
);

type Props = {
  id?: string;
  points: ThreePoints;
  color: string;
  selected?: boolean;
  selectable?: boolean;
  showLabel?: boolean;
  labelTitle?: string;
  annotationOpacity?: number;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
  onLabelMouseOver?: (hoveredId: string) => void;
};

const FLCube = React.forwardRef<Group, Props>(
  (
    {
      id,
      points,
      color,
      selected = false,
      selectable = false,
      showLabel = false,
      labelTitle,
      annotationOpacity = 50,
      onClick = (f) => f,
      onLabelMouseOver = (f) => f,
    },
    ref
  ) => {
    const [px, py, pz, ax, ay, az, sx, sy, sz] = points;
    const styles = useStyles();

    const [hovered, setHovered] = useState(false);
    const htmlRef = React.createRef<HTMLDivElement>();
    const boxRef = React.createRef<Mesh<BoxGeometry, MeshBasicMaterial>>();
    const directionRef =
      React.createRef<Mesh<BoxGeometry, MeshBasicMaterial>>();

    const [dAssistanceSize, dAssistancePosition] = React.useMemo<
      [[width: number, height: number, depth: number], Vector3]
    >(() => {
      return [[0.5, 0.1, 0.1], new Vector3((1 / 4) * 3, 0, 0)];
    }, []);

    const material = React.useMemo(() => {
      return <meshBasicMaterial color={color} />;
    }, [color]);

    const lineRef =
      React.createRef<LineSegments<BufferGeometry, LineBasicMaterial>>();

    const indices = new Uint16Array([
      0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7,
    ]);
    const positions = new Float32Array(8 * 3);
    positions.set([
      0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
      -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5,
    ]);
    const geometry = new BufferGeometry();
    geometry.setIndex(new BufferAttribute(indices, 1));
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();

    const lineSegments = new LineSegments(
      geometry,
      new LineBasicMaterial({ color: color })
    );
    const settingOpacity = (base: number, annotation: number) => {
      const settingUnit = annotation - 50;
      if (settingUnit >= 0) {
        return base + 0.016 * settingUnit;
      } else if (settingUnit === -50) {
        return 0;
      }
      return base + 0.004 * settingUnit;
    };

    useFrame(() => {
      if (!selectable) return;
      if (boxRef.current) {
        boxRef.current.material.opacity = settingOpacity(
          hovered ? 0.9 : selected ? 0.6 : 0.2,
          annotationOpacity
        );
      }
      if (lineRef.current) {
        lineRef.current.material.opacity = settingOpacity(1, annotationOpacity);
      }
      if (directionRef.current) {
        directionRef.current.material.opacity = settingOpacity(
          1,
          annotationOpacity
        );
      }
    });

    return (
      <group
        name={id}
        userData={{ type: 'cube' }}
        ref={ref}
        rotation={[ax, ay, az]}
        position={[px, py, pz]}>
        <group scale={[sx, sy, sz]}>
          <mesh
            ref={directionRef}
            position={dAssistancePosition}
            userData={{ type: 'cube-direction' }}>
            <boxGeometry args={dAssistanceSize} />
            {material}
          </mesh>
          <mesh
            ref={boxRef}
            userData={{ type: 'cube-box' }}
            onPointerEnter={(e) => {
              e.stopPropagation();
              setHovered(true);
            }}
            onPointerLeave={(e) => {
              e.stopPropagation();
              setHovered(false);
            }}
            onClick={selectable ? onClick : undefined}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={color} opacity={0.5} transparent />
            {showLabel && !!id && (
              <Html ref={htmlRef} visible={showLabel} zIndexRange={[1300, 0]}>
                <div
                  className={styles.tooltip}
                  onMouseEnter={() => onLabelMouseOver(id)}
                  onMouseLeave={() => onLabelMouseOver('')}>
                  <div className={styles.tooltipContent} style={{ color }}>
                    {labelTitle}
                  </div>
                </div>
              </Html>
            )}
          </mesh>
          {annotationOpacity >= 40 && <primitive object={lineSegments} />}
        </group>
      </group>
    );
  }
);

export default FLCube;
