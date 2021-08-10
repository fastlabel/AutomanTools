import React, { FC, useEffect, useRef } from 'react';
import { Vector3 } from 'three';

type Props = {
    position: Vector3;
    width: number;
    height: number;
    depth: number;
    color?: string;
};

const Cube: FC<Props> = ({ position, width, height, depth, color }) => {
    const angle = 5 * Math.PI / 12;
    const box = useRef<any>()
    useEffect(() => {
    }, []);
    return (<mesh ref={box} position={position} rotation={[0, angle, 0]}>
        <boxGeometry args={[width, height, depth, 2, 2, 2]} />
        <meshBasicMaterial color={color} opacity={0.5} transparent />
    </mesh>)
};

export default Cube;