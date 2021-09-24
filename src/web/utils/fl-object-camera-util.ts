import { OrthographicCamera, Vector3 } from 'three';

const DISTANCE = 0.1;

export type ControlKey =
  | 'T_BOX'
  | 'S_TL'
  | 'S_TR'
  | 'S_BL'
  | 'S_BR'
  | 'R_POINT';

export type ControlType = 'top' | 'side' | 'front';

export const FlObjectCameraUtil = {
  reset: (controlType: ControlType, camera: OrthographicCamera) => {
    switch (controlType) {
      case 'top':
        camera.position.set(0, 0, 10);
        break;
      case 'side':
        camera.position.set(0, 10, 0);
        break;
      case 'front':
        camera.position.set(10, 0, 0);
        break;
    }
    camera.far = 20;
  },
  adjust: (
    controlType: ControlType,
    camera: OrthographicCamera,
    objectScale: Vector3
  ) => {
    switch (controlType) {
      case 'top':
        camera.position.set(0, 0, objectScale.z / 2);
        camera.far = objectScale.z + DISTANCE;
        break;
      case 'side':
        camera.position.set(0, objectScale.y / 2, 0);
        camera.far = objectScale.y + DISTANCE;
        break;
      case 'front':
        camera.position.set(objectScale.x / 2, 0, 0);
        camera.far = objectScale.x + DISTANCE;
        break;
    }
    camera.updateProjectionMatrix();
  },
  adjustFar: (
    controlType: ControlType,
    camera: OrthographicCamera,
    objectScale: Vector3
  ) => {
    switch (controlType) {
      case 'top':
        camera.position.z = objectScale.z / 2;
        camera.far = objectScale.z + DISTANCE;
        break;
      case 'side':
        camera.position.y = objectScale.y / 2;
        camera.far = objectScale.y + DISTANCE;
        break;
      case 'front':
        camera.position.x = objectScale.x / 2;
        camera.far = objectScale.x + DISTANCE;
        break;
    }
    camera.updateProjectionMatrix();
  },
};
