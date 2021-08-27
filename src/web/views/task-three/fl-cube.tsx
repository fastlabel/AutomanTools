import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { Html } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { BoxGeometry, BufferAttribute, BufferGeometry, Group, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, Vector3 } from 'three';
import { TaskAnnotationVOPoints } from '../../types/vo';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        tooltip: {
            display: 'flex',
            padding: '4px 8px',
            borderRadius: 8,
            backgroundColor: '#24303b'
        },
        tooltipLabel: {
            paddingRight: 4,
            color: '#fff'
        },
        tooltipContent: {
            whiteSpace: 'nowrap'
        }
    }));

type Props = {
    id?: string;
    points: TaskAnnotationVOPoints;
    color: string;
    showLabel?: boolean;
    onClick?: (event: ThreeEvent<MouseEvent>) => void;
};

const omitVal = (val: string, len: number) => '…' + val.slice(val.length - len);

const FLCube: FC<Props> = React.forwardRef<Group, Props>(({ id, points, color, showLabel = false, onClick = f => f }, ref) => {
    const [px, py, pz, ax, ay, az, sx, sy, sz] = points;
    const styles = useStyles();

    const [hovered, setHovered] = useState(false);
    const htmlRef = React.createRef<HTMLDivElement>();
    const boxRef = React.createRef<Mesh<BoxGeometry, MeshBasicMaterial>>();
    const lineRef = React.createRef<LineSegments>();

    const [dAssistanceSize, dAssistancePosition] = useMemo<[[width: number, height: number, depth: number], Vector3]>(() => {
        return [[0.5, 0.1, 0.1], new Vector3((1 / 4 * 3), 0, 0)];
    }, []);

    const material = useMemo(() => {
        return (<meshBasicMaterial color={color} />);
    }, [color]);

    const indices = new Uint16Array([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
    const positions = new Float32Array(8 * 3);
    positions.set([0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5]);
    const geometry = new BufferGeometry();
    geometry.setIndex(new BufferAttribute(indices, 1));
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.computeBoundingSphere();

    const lineSegments = new LineSegments(geometry, new LineBasicMaterial({ color: color, toneMapped: false }));

    useEffect(() => {
        // if (htmlRef.current) {
        //     htmlRef.current.style.display = showLabel ? 'block' : 'none';
        // }
    }, []);

    return (
        <group name={id} userData={({ type: 'cube' })} ref={ref} rotation={[ax, ay, az]} position={[px, py, pz]} scale={[sx, sy, sz]}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
            }
            } onPointerOut={(e) => {
                e.stopPropagation();
                setHovered(false);
            }} onClick={onClick} >
            <mesh position={dAssistancePosition} userData={({ type: 'cube-direction' })} >
                <boxGeometry args={dAssistanceSize} />
                {material}
            </mesh>
            <mesh ref={boxRef} userData={({ type: 'cube-box' })} >
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color={color} opacity={0.5} transparent />
                {showLabel && !!id &&
                    <Html ref={htmlRef} visible={showLabel} zIndexRange={[1300, 0]}>
                        <div className={styles.tooltip} title={id}>
                            <div className={styles.tooltipLabel}>id</div>
                            <div className={styles.tooltipContent} style={({ color })}>{omitVal(id, 3)}</div>
                        </div>
                    </Html>}
            </mesh>
            <primitive object={lineSegments} />
        </group>
    )
});

export default FLCube;