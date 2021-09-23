import { Vector3 } from 'three';

const DISTANCE = 10;

export type ControlKey =
  | 'T_BOX'
  | 'S_TL'
  | 'S_TR'
  | 'S_BL'
  | 'S_BR'
  | 'R_POINT';

export type ControlType = 'top' | 'side' | 'front';

export const FlObjectCameraUtil = {
  adjustOffset: (controlType: ControlType, position: Vector3) => {
    switch (controlType) {
      case 'top':
        position.z = DISTANCE;
        break;
      case 'side':
        position.y = DISTANCE;
        break;
      case 'front':
        position.x = DISTANCE;
        break;
    }
  },
  copyOffset: (controlType: ControlType, position: Vector3) => {
    switch (controlType) {
      case 'top':
        position.set(0, 0, DISTANCE);
        break;
      case 'side':
        position.set(0, DISTANCE, 0);
        break;
      case 'front':
        position.set(DISTANCE, 0, 0);
        break;
    }
  },
};
