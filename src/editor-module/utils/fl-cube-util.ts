import { ThreeEvent } from '@react-three/fiber';
import { BoxGeometry, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { ThreePoints } from '../types/vo';

/**
 * Cube
 */
export const FlCubeUtil = {
  valid: (object: Object3D) => {
    const scaleGrp = object.children[0];
    if (!scaleGrp) {
      return false;
    }
    // TODO add condition
    return true;
  },
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
  getPointsVo: (object: Object3D): ThreePoints => {
    const scale = FlCubeUtil.getScale(object);
    // prevent NaN with decimal value
    // to Number prevent Nan in editing.
    // Basically it should prevent make annotation class.
    // It's for preventive measures.
    return [
      Number(object.position.x),
      Number(object.position.y),
      Number(object.position.z),
      Number(object.rotation.x),
      Number(object.rotation.y),
      Number(object.rotation.z),
      Number(scale.x),
      Number(scale.y),
      Number(scale.z),
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
