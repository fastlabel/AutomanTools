import React, { FC } from 'react';
import { BufferGeometry, Float32BufferAttribute, PointsMaterial } from 'three';
import { PCDResult } from '../../types/labos';
import ColorUtil from '../../utils/color-util';

type Props = {
    pcd: PCDResult;
};

const FLPcd: FC<Props> = ({ pcd }) => {
    const geometry = new BufferGeometry();
    if (pcd.position.length > 0) geometry.setAttribute('position', new Float32BufferAttribute(pcd.position, 3));
    if (pcd.normal.length > 0) geometry.setAttribute('normal', new Float32BufferAttribute(pcd.normal, 3));
    if (pcd.color.length > 0) {
        geometry.setAttribute('color', new Float32BufferAttribute(pcd.color, 3));
    } else {
        geometry.setAttribute('color', new Float32BufferAttribute(ColorUtil.normalizeColors(pcd.position), 3));
    }
    geometry.computeBoundingSphere();

    // build material
    const baseSize = 0.005;
    const material = new PointsMaterial({ size: baseSize * 8 });
    material.vertexColors = true;

    const halfAngle = Math.PI / 2;
    geometry.rotateX(-halfAngle);
    return <points geometry={geometry} material={material} />;
};
export default FLPcd;