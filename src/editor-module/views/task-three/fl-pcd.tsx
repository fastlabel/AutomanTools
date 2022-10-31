import React, { FC } from 'react';
import { PCDResult } from '../../types/labos';
import { FlPcdPoints } from './fl-pcd-points';

type Props = {
  pcd: PCDResult;
  baseSize?: number;
};

const FLPcd: FC<Props> = ({ pcd, baseSize = 0.005 }) => {
  const geometry = FlPcdPoints.buildGeometry(pcd);
  // build material
  const material = FlPcdPoints.buildMaterial(baseSize);
  return <points geometry={geometry} material={material} />;
};
export default FLPcd;
