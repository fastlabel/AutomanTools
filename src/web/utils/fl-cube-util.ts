import { ThreeEvent } from '@react-three/fiber';
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { TaskAnnotationVOPoints } from '../types/vo';

/**
 * Cube
 */
export const FlCubeUtil = {
  getId: (object: Object3D) => {
    return object.name;
  },
  setScale: (object: Object3D, scale: Vector3) => {
    const scaleGrp = object.children[0];
    scaleGrp.scale.copy(scale);
  },
  getScale: (object: Object3D) => {
    const scaleGrp = object.children[0];
    return scaleGrp.scale;
  },
  getColor: (object: Object3D) => {
    const cube = object.children[0].children[1] as Mesh<
      BoxGeometry,
      MeshBasicMaterial
    >;
    return cube.material.color;
  },
  getPointsVo: (object: Object3D): TaskAnnotationVOPoints => {
    const scale = FlCubeUtil.getScale(object);
    return [
      object.position.x,
      object.position.y,
      object.position.z,
      object.rotation.x,
      object.rotation.y,
      object.rotation.z,
      scale.x,
      scale.y,
      scale.z,
    ];
  },
  resolveByOnClick: (event: ThreeEvent<MouseEvent>) => {
    const scaleGrp = event.eventObject.parent;
    if (scaleGrp && scaleGrp.parent) {
      return scaleGrp.parent;
    }
    throw new Error(`Can't resolve event ${event}`);
  },
};
