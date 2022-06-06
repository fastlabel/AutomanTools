import {
  BufferGeometry,
  Camera,
  DoubleSide,
  Intersection,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Vector3,
} from 'three';
import { FlCubeUtil } from '../../utils/fl-cube-util';
import {
  ControlKey,
  ControlType,
  FlObjectCameraUtil,
} from '../../utils/fl-object-camera-util';
import { FLObjectCameraControls } from './fl-object-camera-controls';
import { FLTransformControlsGizmo } from './fl-transform-controls-gizmo';

export interface FLTransformControlsPointerObject {
  x: number;
  y: number;
  button: number;
}

class FLTransformControls<TCamera extends Camera = Camera> extends Object3D {
  public readonly isTransformControls = true;

  public visible = false;

  private domElement: HTMLElement | Document;

  private raycaster = new Raycaster();

  private gizmo: FLTransformControlsGizmo;
  private plane: FLTransformControlsPlane;

  private tempVector = new Vector3();
  private tempVector2 = new Vector3();
  private tempQuaternion = new Quaternion();
  private unit = {
    X: new Vector3(1, 0, 0),
    Y: new Vector3(0, 1, 0),
    Z: new Vector3(0, 0, 1),
  };

  private pointStart = new Vector3();
  private pointEnd = new Vector3();
  private offset = new Vector3();
  private rotationAxis = new Vector3();
  private startNorm = new Vector3();
  private endNorm = new Vector3();
  private rotationAngle = 0;

  private cameraPosition = new Vector3();
  private cameraQuaternion = new Quaternion();
  private cameraScale = new Vector3();

  private parentPosition = new Vector3();
  private parentQuaternion = new Quaternion();
  private parentQuaternionInv = new Quaternion();
  private parentScale = new Vector3();

  private worldPositionStart = new Vector3();
  private worldQuaternionStart = new Quaternion();
  private worldScaleStart = new Vector3();

  private worldPosition = new Vector3();
  private worldQuaternion = new Quaternion();
  private worldQuaternionInv = new Quaternion();
  private worldScale = new Vector3();

  private eye = new Vector3();

  private positionStart = new Vector3();
  private quaternionStart = new Quaternion();
  private scaleStart = new Vector3();

  private camera: TCamera;
  private object: Object3D | undefined;
  private enabled = true;
  private axis: ControlKey | null = null;
  private size = 1;
  private dragging = false;

  private control: ControlType;

  // events
  private changeEvent = { type: 'change' };
  private mouseDownEvent = { type: 'mouseDown' };
  private mouseUpEvent = { type: 'mouseUp' };
  private objectChangeEvent = { type: 'objectChange' };

  private orbit: FLObjectCameraControls;

  constructor(
    camera: TCamera,
    domElement: HTMLElement,
    control: ControlType,
    orbit: FLObjectCameraControls
  ) {
    super();
    if (domElement === undefined) {
      console.warn(
        'THREE.FLTransformControls: The second parameter "domElement" is now mandatory.'
      );
      this.domElement = document;
    }
    this.domElement = domElement;
    this.camera = camera;
    this.control = control;

    this.gizmo = new FLTransformControlsGizmo(control);
    this.add(this.gizmo);
    this.plane = new FLTransformControlsPlane();
    this.add(this.plane);

    this.orbit = orbit;

    // Defined getter, setter and store for a property
    const defineProperty = <TValue>(
      propName: string,
      defaultValue: TValue
    ): void => {
      let propValue = defaultValue;
      Object.defineProperty(this, propName, {
        get: () => (propValue !== undefined ? propValue : defaultValue),
        set: (value) => {
          if (propValue === value) return;
          propValue = value;
          (this.plane as any)[propName] = value;
          (this.gizmo as any)[propName] = value;
          this.dispatchEvent({ type: propName + '-changed', value: value });
          this.dispatchEvent(this.changeEvent);
        },
      });
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      this[propName] = defaultValue;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.plane[propName] = defaultValue;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this.gizmo[propName] = defaultValue;
    };

    defineProperty('camera', this.camera);
    defineProperty('object', this.object);
    defineProperty('control', this.control);
    defineProperty('enabled', this.enabled);
    defineProperty('axis', this.axis);
    defineProperty('size', this.size);
    defineProperty('dragging', this.dragging);
    defineProperty('worldPosition', this.worldPosition);
    defineProperty('worldPositionStart', this.worldPositionStart);
    defineProperty('worldQuaternion', this.worldQuaternion);
    defineProperty('worldQuaternionStart', this.worldQuaternionStart);
    defineProperty('cameraPosition', this.cameraPosition);
    defineProperty('cameraQuaternion', this.cameraQuaternion);
    defineProperty('pointStart', this.pointStart);
    defineProperty('pointEnd', this.pointEnd);
    defineProperty('rotationAxis', this.rotationAxis);
    defineProperty('rotationAngle', this.rotationAngle);
    defineProperty('eye', this.eye);
    domElement.addEventListener('pointerdown', this.onPointerDown);
    domElement.addEventListener('pointermove', this.onPointerHover);
    this.domElement.ownerDocument.addEventListener(
      'pointerup',
      this.onPointerUp
    );
  }

  private intersectObjectWithRay = (
    object: Object3D,
    raycaster: Raycaster,
    includeInvisible?: boolean
  ): false | Intersection => {
    const allIntersections = raycaster.intersectObject(object, true);

    for (let i = 0; i < allIntersections.length; i++) {
      if (allIntersections[i].object.visible || includeInvisible) {
        return allIntersections[i];
      }
    }

    return false;
  };

  // Set current object
  public attach = (object: Object3D): this => {
    this.object = object;
    this.visible = true;
    this.orbit?.set0(this.object);
    this.gizmo.attach(object);
    const scale = FlCubeUtil.getScale(object);
    FlObjectCameraUtil.adjust(this.control, this.camera as any, scale);
    return this;
  };

  // Detatch from object
  public detach = (): this => {
    this.object = undefined;
    this.visible = false;
    this.axis = null;
    this.orbit?.reset0();
    return this;
  };

  public updateMatrixWorld = (): void => {
    if (this.object !== undefined) {
      this.object.updateMatrixWorld();

      if (this.object.parent === null) {
        console.error(
          'FLTransformControls: The attached 3D object must be a part of the scene graph.'
        );
      } else {
        this.object.parent.matrixWorld.decompose(
          this.parentPosition,
          this.parentQuaternion,
          this.parentScale
        );
      }

      this.object.matrixWorld.decompose(
        this.worldPosition,
        this.worldQuaternion,
        this.worldScale
      );

      this.parentQuaternionInv.copy(this.parentQuaternion).invert();
      this.worldQuaternionInv.copy(this.worldQuaternion).invert();
      if (this.dragging === false) {
        this.orbit?.set0(this.object);
      }
    }

    this.camera.updateMatrixWorld();
    this.camera.matrixWorld.decompose(
      this.cameraPosition,
      this.cameraQuaternion,
      this.cameraScale
    );
    this.eye.copy(this.cameraPosition).sub(this.worldPosition).normalize();
    super.updateMatrixWorld();
  };

  private pointerHover = (pointer: FLTransformControlsPointerObject): void => {
    if (this.object === undefined || this.dragging === true) return;
    this.raycaster.setFromCamera(pointer, this.camera);
    const intersect = this.intersectObjectWithRay(
      this.gizmo.getPicker(),
      this.raycaster
    );
    if (intersect) {
      this.axis = intersect.object.name as ControlKey;
    } else {
      this.axis = null;
    }
  };

  private pointerDown = (pointer: FLTransformControlsPointerObject): void => {
    if (
      this.object === undefined ||
      this.dragging === true ||
      pointer.button !== 0
    )
      return;

    if (this.axis !== null) {
      this.raycaster.setFromCamera(pointer, this.camera);
      const planeIntersect = this.intersectObjectWithRay(
        this.plane,
        this.raycaster,
        true
      );
      if (planeIntersect) {
        this.object.updateMatrixWorld();
        if (this.object.parent) {
          this.object.parent.updateMatrixWorld();
        }
        this.positionStart.copy(this.object.position);
        this.quaternionStart.copy(this.object.quaternion);
        this.scaleStart.copy(FlCubeUtil.getScale(this.object));

        this.object.matrixWorld.decompose(
          this.worldPositionStart,
          this.worldQuaternionStart,
          this.worldScaleStart
        );

        this.pointStart.copy(planeIntersect.point).sub(this.worldPositionStart);
      }

      this.dragging = true;
      this.dispatchEvent(this.mouseDownEvent);
    }
  };

  private pointerMove = (pointer: FLTransformControlsPointerObject): void => {
    const axis = this.axis;
    const object = this.object;

    if (
      object === undefined ||
      axis === null ||
      this.dragging === false ||
      pointer.button !== -1
    )
      return;
    this.raycaster.setFromCamera(pointer, this.camera);

    const planeIntersect = this.intersectObjectWithRay(
      this.plane,
      this.raycaster,
      true
    );
    if (!planeIntersect) return;

    this.pointEnd.copy(planeIntersect.point).sub(this.worldPositionStart);

    if (this.axis === 'T_BOX') {
      // Apply translate
      this.offset.copy(this.pointEnd).sub(this.pointStart);
      this.camera.position
        .set(0, 0, 0)
        .sub(this.offset.applyQuaternion(object.quaternion.clone().invert()));
      const objectScale = FlCubeUtil.getScale(object);
      FlObjectCameraUtil.adjustFar(
        this.control,
        this.camera as any,
        objectScale
      );

      this.offset.copy(this.pointEnd).sub(this.pointStart);
      this.offset
        .applyQuaternion(this.parentQuaternionInv)
        .divide(this.parentScale);

      object.position.copy(this.offset).add(this.positionStart);
    } else if (this.axis === 'R_POINT') {
      this.rotationAxis.copy(this.eye);
      this.rotationAngle = this.pointEnd.angleTo(this.pointStart);

      this.startNorm.copy(this.pointStart).normalize();
      this.endNorm.copy(this.pointEnd).normalize();

      this.rotationAngle *=
        this.endNorm.cross(this.startNorm).dot(this.eye) < 0 ? 1 : -1;

      // Apply rotate
      this.rotationAxis.applyQuaternion(this.parentQuaternionInv);
      object.quaternion.copy(
        this.tempQuaternion.setFromAxisAngle(
          this.rotationAxis,
          this.rotationAngle
        )
      );
      object.quaternion.multiply(this.quaternionStart).normalize();
    } else {
      this.tempVector.copy(this.pointStart);
      this.tempVector2.copy(this.pointEnd);

      this.tempVector.applyQuaternion(this.worldQuaternionInv);
      this.tempVector2.applyQuaternion(this.worldQuaternionInv);

      this.tempVector2.sub(this.tempVector);

      if (this.control === 'top') {
        this.tempVector2.z = 0;
      } else if (this.control === 'side') {
        this.tempVector2.y = 0;
      } else if (this.control === 'front') {
        this.tempVector2.x = 0;
      }
      switch (this.axis) {
        case 'S_TL':
          if (this.control === 'top') {
            this.tempVector2.x = -this.tempVector2.x;
          } else if (this.control === 'side') {
            this.tempVector2.x = -this.tempVector2.x;
            // eslint-disable-next-line no-empty
          } else if (this.control === 'front') {
          }
          break;
        case 'S_TR':
          if (this.control === 'top') {
            this.tempVector2.x = -this.tempVector2.x;
            this.tempVector2.y = -this.tempVector2.y;
          } else if (this.control === 'side') {
            this.tempVector2.x = -this.tempVector2.x;
            this.tempVector2.z = -this.tempVector2.z;
          } else if (this.control === 'front') {
            this.tempVector2.y = -this.tempVector2.y;
          }
          break;
        case 'S_BL':
          if (this.control === 'top') {
            this.tempVector2.y = -this.tempVector2.y;
            // eslint-disable-next-line no-empty
          } else if (this.control === 'side') {
          } else if (this.control === 'front') {
            this.tempVector2.y = -this.tempVector2.y;
            this.tempVector2.z = -this.tempVector2.z;
          }
          break;
        case 'S_BR':
          // eslint-disable-next-line no-empty
          if (this.control === 'top') {
          } else if (this.control === 'side') {
            this.tempVector2.z = -this.tempVector2.z;
          } else if (this.control === 'front') {
            this.tempVector2.z = -this.tempVector2.z;
          }
          break;
      }
      this.tempVector.copy(this.scaleStart).add(this.tempVector2);
      this.offset.copy(this.scaleStart).sub(this.tempVector).divideScalar(2);
      switch (this.axis) {
        case 'S_TL':
          if (this.control === 'top') {
            this.offset.y = -this.offset.y;
          } else if (this.control === 'side') {
            this.offset.z = -this.offset.z;
          } else if (this.control === 'front') {
            this.offset.y = -this.offset.y;
            this.offset.z = -this.offset.z;
          }
          break;
        case 'S_TR':
          if (this.control === 'top') {
            // O
          } else if (this.control === 'side') {
            // O
          } else if (this.control === 'front') {
            this.offset.z = -this.offset.z;
          }
          break;
        case 'S_BL':
          if (this.control === 'top') {
            this.offset.x = -this.offset.x;
          } else if (this.control === 'side') {
            this.offset.x = -this.offset.x;
            this.offset.z = -this.offset.z;
          } else if (this.control === 'front') {
            // O
          }
          break;
        case 'S_BR':
          if (this.control === 'top') {
            this.offset.x = -this.offset.x;
            this.offset.y = -this.offset.y;
          } else if (this.control === 'side') {
            this.offset.x = -this.offset.x;
          } else if (this.control === 'front') {
            this.offset.y = -this.offset.y;
          }
          break;
      }
      object.position
        .copy(this.offset.applyQuaternion(object.quaternion))
        .add(this.positionStart);
      // Apply scale
      FlCubeUtil.setScale(object, this.tempVector);
    }

    this.dispatchEvent(this.changeEvent);
    this.dispatchEvent(this.objectChangeEvent);
  };

  private pointerUp = (pointer: FLTransformControlsPointerObject): void => {
    if (pointer.button !== 0) return;
    if (this.dragging && this.axis !== null) {
      this.dispatchEvent(this.mouseUpEvent);
      if (this.object) {
        const objectScale = FlCubeUtil.getScale(this.object);
        FlObjectCameraUtil.adjust(
          this.control,
          this.camera as any,
          objectScale
        );
      }
    }
    this.dragging = false;
    this.axis = null;
  };

  private getPointer = (event: Event): FLTransformControlsPointerObject => {
    if (this.domElement && this.domElement.ownerDocument?.pointerLockElement) {
      return { x: 0, y: 0, button: (event as MouseEvent).button };
    } else {
      const pointer = (event as TouchEvent).changedTouches
        ? (event as TouchEvent).changedTouches[0]
        : (event as MouseEvent);
      const rect = (this.domElement as HTMLElement)?.getBoundingClientRect();
      return {
        x: ((pointer.clientX - rect.left) / rect.width) * 2 - 1,
        y: (-(pointer.clientY - rect.top) / rect.height) * 2 + 1,
        button: (event as MouseEvent).button,
      };
    }
  };

  private onPointerHover = (event: Event): void => {
    if (!this.enabled) return;

    switch ((event as PointerEvent).pointerType) {
      case 'mouse':
      case 'pen':
        this.pointerHover(this.getPointer(event));
        break;
    }
  };

  private onPointerDown = (event: Event): void => {
    if (!this.enabled) return;
    (this.domElement as HTMLElement).style.touchAction = 'none'; // disable touch scroll;
    this.domElement.ownerDocument?.addEventListener(
      'pointermove',
      this.onPointerMove
    );
    this.pointerHover(this.getPointer(event));
    this.pointerDown(this.getPointer(event));
  };

  private onPointerMove = (event: Event): void => {
    if (!this.enabled) return;
    this.pointerMove(this.getPointer(event));
  };

  private onPointerUp = (event: Event): void => {
    if (!this.enabled) return;
    (this.domElement as HTMLElement).style.touchAction = '';
    this.domElement.ownerDocument?.removeEventListener(
      'pointermove',
      this.onPointerMove
    );

    this.pointerUp(this.getPointer(event));
  };

  public setSize = (size: number): void => {
    this.size = size;
  };

  public update = (): void => {
    console.warn(
      'THREE.FLTransformControls: update function has no more functionality and therefore has been deprecated.'
    );
  };

  public isDragging = () => {
    return this.dragging;
  };

  public dispose = (): void => {
    this.domElement.removeEventListener('pointerdown', this.onPointerDown);
    this.domElement.removeEventListener('pointermove', this.onPointerHover);
    this.domElement.ownerDocument?.removeEventListener(
      'pointermove',
      this.onPointerMove
    );
    this.domElement.ownerDocument?.removeEventListener(
      'pointerup',
      this.onPointerUp
    );

    this.traverse((child) => {
      const mesh = child as Mesh<BufferGeometry, Material>;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        mesh.material.dispose();
      }
    });
  };
}

class FLTransformControlsPlane extends Mesh<PlaneGeometry, MeshBasicMaterial> {
  private isTransformControlsPlane = true;
  public type = 'FLTransformControlsPlane';

  constructor() {
    super(
      new PlaneGeometry(100000, 100000, 2, 2),
      new MeshBasicMaterial({
        visible: false,
        wireframe: true,
        side: DoubleSide,
        transparent: true,
        opacity: 0.1,
        toneMapped: false,
      })
    );
  }

  private unitX = new Vector3(1, 0, 0);
  private unitY = new Vector3(0, 1, 0);
  private unitZ = new Vector3(0, 0, 1);

  private tempVector = new Vector3();
  private dirVector = new Vector3();
  private alignVector = new Vector3();
  private tempMatrix = new Matrix4();
  private identityQuaternion = new Quaternion();

  // these are set from parent class FLTransformControls
  private cameraQuaternion = new Quaternion();

  private worldPosition = new Vector3();
  private worldQuaternion = new Quaternion();

  private eye = new Vector3();

  private axis: ControlKey | null = null;

  public updateMatrixWorld = (): void => {
    this.position.copy(this.worldPosition);

    this.unitX.set(1, 0, 0).applyQuaternion(this.worldQuaternion);
    this.unitY.set(0, 1, 0).applyQuaternion(this.worldQuaternion);
    this.unitZ.set(0, 0, 1).applyQuaternion(this.worldQuaternion);

    // Align the plane for current transform mode, axis and space.

    this.alignVector.copy(this.unitY);

    this.dirVector.set(0, 0, 0);

    if (this.dirVector.length() === 0) {
      // If in rotate mode, make the plane parallel to camera
      this.quaternion.copy(this.cameraQuaternion);
    } else {
      this.tempMatrix.lookAt(
        this.tempVector.set(0, 0, 0),
        this.dirVector,
        this.alignVector
      );
      this.quaternion.setFromRotationMatrix(this.tempMatrix);
    }
    super.updateMatrixWorld();
  };
}

export { FLTransformControls, FLTransformControlsPlane };
