import { ThreeEvent } from '@react-three/fiber';
import React, { useEffect, useMemo, useState } from 'react';
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { TaskAnnotationVOPoints } from '../../types/vo';

const D_ASSISTANCE_MIN_SIZE = 0.25;

type Props = {
    id?: string;
    points: TaskAnnotationVOPoints;
    color: string;
    onClick?: (event: ThreeEvent<MouseEvent>) => void;
};

const FLCube = React.forwardRef<Object3D, Props>(({ id, points, color, onClick = f => f }, ref) => {
    const [px, py, pz, ax, ay, az, sx, sy, sz] = points;

    const [hovered, setHovered] = useState(false);
    const [boxRef, setBoxRef] = useState<Mesh<BoxGeometry, MeshBasicMaterial>>();

    const [dAssistanceSize, dAssistancePosition] = useMemo<[[width: number, height: number, depth: number], Vector3]>(() => {
        return [[0.1, 0.1, 0.5], new Vector3(0, 0, (1 / 4 * 3))];
    }, []);

    const material = useMemo(() => {
        return (<meshBasicMaterial color={color} />);
    }, [color]);

    useEffect(() => {
        document.body.style.cursor = hovered ? 'pointer' : 'auto';
        if (boxRef) {
            boxRef.material.opacity = hovered ? 1 : 0.5;
        }
    }, [hovered, boxRef]);

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
            <mesh ref={setBoxRef} userData={({ type: 'cube-box' })} >
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color={color} opacity={0.5} transparent />
            </mesh>
            {boxRef && <boxHelper args={[boxRef, color]} />}
        </group>
    )
});

export default FLCube;