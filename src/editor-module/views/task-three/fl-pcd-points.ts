import { PCDResult } from '@fl-three-editor/types/labos';
import ColorUtil from '@fl-three-editor/utils/color-util';
import {
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  PointsMaterial,
} from 'three';

const _buildGeometry = (pcd: PCDResult): BufferGeometry => {
  const geometry = new BufferGeometry();
  if (pcd.position.length > 0)
    geometry.setAttribute(
      'position',
      new Float32BufferAttribute(pcd.position, 3)
    );
  if (pcd.normal.length > 0)
    geometry.setAttribute('normal', new Float32BufferAttribute(pcd.normal, 3));
  if (pcd.color.length > 0) {
    geometry.setAttribute('color', new Float32BufferAttribute(pcd.color, 3));
  } else {
    geometry.setAttribute(
      'color',
      new Float32BufferAttribute(ColorUtil.normalizeColors(pcd.position), 3)
    );
  }
  geometry.computeBoundingSphere();
  return geometry;
};

const _buildMaterial = (baseSize = 0.005): PointsMaterial => {
  const material = new PointsMaterial({ size: baseSize * 8 });
  material.vertexColors = true;
  return material;
};

export const FlPcdPoints = {
  buildGeometry: _buildGeometry,
  buildMaterial: _buildMaterial,
  buildPointsMesh: (pcd: PCDResult, baseSize?: number): Points => {
    const geometry = _buildGeometry(pcd);
    const material = _buildMaterial(baseSize);
    return new Points(geometry, material);
  },
};
