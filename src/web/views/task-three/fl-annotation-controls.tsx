import {
  ReactThreeFiber,
  ThreeEvent,
  useFrame,
  useThree,
} from '@react-three/fiber';
import * as React from 'react';
import { useMemo } from 'react';
import {
  Camera,
  EventDispatcher,
  Group,
  Object3D,
  Scene,
  Vector3,
} from 'three';
import { AnnotationClassVO, TaskAnnotationVOPoints } from '../../types/vo';
import FLCube from './fl-cube';

type Prop = ReactThreeFiber.Overwrite<
  ReactThreeFiber.Object3DNode<
    FLAnnotationControlsImpl,
    typeof FLAnnotationControlsImpl
  >,
  {
    target?: ReactThreeFiber.Vector3;
    camera?: Camera;
    domElement?: HTMLElement;
    preObject?: AnnotationClassVO;
    onPutObject?: (
      evt: ThreeEvent<MouseEvent>,
      preObject: AnnotationClassVO
    ) => void;
  }
>;

const FLAnnotationControls = React.forwardRef<FLAnnotationControlsImpl, Prop>(
  (
    { camera, domElement, preObject, onPutObject = (f) => f, ...restProps },
    ref
  ) => {
    const invalidate = useThree(({ invalidate }) => invalidate);
    const defaultCamera = useThree(({ camera }) => camera);
    const gl = useThree(({ gl }) => gl);
    const scene = useThree(({ scene }) => scene);

    // const performance = useThree(({ performance }) => performance)
    const explCamera = camera || defaultCamera;
    const explDomElement = domElement || gl.domElement;

    const preCube = React.createRef<Group>();
    const controls = React.useMemo(
      () => new FLAnnotationControlsImpl(explCamera, scene),
      [explCamera, scene]
    );

    useFrame(() => {
      if (controls.enabled) {
      }
    });

    const points = useMemo(() => {
      if (preObject) {
        const { x, y, z } = preObject.defaultSize;
        return [0, 0, 0, 0, 0, 0, x, y, z];
      }
      return undefined;
    }, [preObject]) as TaskAnnotationVOPoints;

    React.useEffect(() => {
      controls.connect(explDomElement);
      return () => {
        controls.dispose();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controls, explDomElement]);

    React.useEffect(() => {
      if (preCube.current) {
        controls.attach(preCube.current);
      } else {
        controls.detach();
      }
      return () => {
        controls.detach();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [controls, preCube]);
    return (
      <>
        <primitive
          ref={ref}
          object={controls}
          enableDamping={false}
          {...restProps}
        />
        {preObject && points && (
          <FLCube
            ref={preCube}
            points={points}
            color={preObject.color}
            selectable={true}
            onClick={(e) => {
              onPutObject(e, preObject);
            }}
          />
        )}
      </>
    );
  }
);

const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

export class FLAnnotationControlsImpl extends EventDispatcher {
  private _domElementKeyEvents: HTMLElement | null = null;

  camera: Camera;
  scene: Scene;
  object?: Object3D;
  domElement?: HTMLElement;
  enabled: boolean;
  connect: (domElement: HTMLElement) => void;
  attach: (object: Object3D) => void;
  detach: () => void;
  dispose: () => void;

  constructor(camera: Camera, scene: Scene) {
    super();
    this.camera = camera;
    this.scene = scene;
    this.enabled = true;

    const onPointerMove = (event: PointerEvent) => {
      if (this.enabled === false) return;

      // adjust preObject3D
      if (this.object) {
        const canvasElement = event.target as HTMLCanvasElement;
        const pos = new Vector3(0, 0, 0);
        const pMouse = new Vector3(
          (event.offsetX / canvasElement.width) * 2 - 1,
          -(event.offsetY / canvasElement.height) * 2 + 1,
          1
        );
        pMouse.unproject(camera);

        const cam = camera.position;
        const m = pMouse.z / (pMouse.z - cam.z);

        pos.x = pMouse.x + (cam.x - pMouse.x) * m;
        pos.y = pMouse.y + (cam.y - pMouse.y) * m;
        this.object.position.copy(pos);
      }
    };

    this.connect = (domElement: HTMLElement) => {
      if ((domElement as any) === document) {
        console.error(
          'THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.'
        );
      }
      this.domElement = domElement;
      this.domElement.style.touchAction = 'none';
    };

    this.dispose = () => {
      this.detach();
    };

    this.attach = (object: Object3D) => {
      if (!this.domElement) return;
      this.object = object;

      this.domElement.addEventListener('pointermove', onPointerMove);
    };

    this.detach = () => {
      this.object = undefined;
      if (this.domElement) {
        this.domElement.removeEventListener('pointermove', onPointerMove);
      }
    };
  }
}

export default FLAnnotationControls;
