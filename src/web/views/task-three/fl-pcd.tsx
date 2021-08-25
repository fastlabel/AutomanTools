import React, { FC } from 'react';
import { BufferGeometry, Float32BufferAttribute, PointsMaterial } from 'three';
import { PCDResult } from '../../types/labos';
import ColorUtil from '../../utils/color-util';

type Props = {
    pcd: PCDResult;
    baseSize?: number;
};

const FLPcd: FC<Props> = ({ pcd, baseSize = 0.005 }) => {
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
    const material = new PointsMaterial({ size: baseSize * 8 });
    material.vertexColors = true;
    return <points geometry={geometry} material={material} />;
};
export default FLPcd;