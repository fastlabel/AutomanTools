/* eslint-disable */
import {
  Camera,
  EventDispatcher,
  Matrix4,
  MOUSE,
  Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  TOUCH,
  Vector2,
  Vector3,
} from 'three';
import { FlCubeUtil } from '../../utils/fl-cube-util';
import {
  ControlType,
  FlObjectCameraUtil,
} from '../../utils/fl-object-camera-util';

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

class FLObjectCameraControls extends EventDispatcher {
  object: Camera;
  controlType: ControlType;
  domElement: HTMLElement | undefined;
  // Set to false to disable this control
  enabled = true;
  // "target" sets the location of focus, where the object orbits around
  target = new Vector3();
  // How far you can dolly in and out ( PerspectiveCamera only )
  minDistance = 0;
  maxDistance = Infinity;
  // How far you can zoom in and out ( OrthographicCamera only )
  minZoom = 0;
  maxZoom = Infinity;
  // How far you can orbit vertically, upper and lower limits.
  // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  // Set to false to disable zooming
  enableZoom = true;
  zoomSpeed = 1.0;
  // Set to false to disable panning
  enablePan = true;
  panSpeed = 1.0;
  screenSpacePanning = true; // if false, pan orthogonal to world-space direction camera.up
  keyPanSpeed = 7.0; // pixels moved per arrow key push
  // Set to true to automatically rotate around the target
  // If auto-rotate is enabled, you must call controls.update() in your animation loop
  // The four arrow keys
  keys = {
    LEFT: 'ArrowLeft',
    UP: 'ArrowUp',
    RIGHT: 'ArrowRight',
    BOTTOM: 'ArrowDown',
  };
  // Mouse buttons
  mouseButtons = {
    LEFT: MOUSE.ROTATE,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.PAN,
  };
  // Touch fingers
  touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };
  target0: Vector3;
  position0: Vector3;
  zoom0: number;
  // the target DOM element for key events
  _domElementKeyEvents: any = null;

  editingId: string = '';

  getDistance: () => number;

  listenToKeyEvents: (domElement: HTMLElement) => void;
  saveState: () => void;
  reset: () => void;
  update: () => void;
  connect: (domElement: HTMLElement) => void;
  dispose: () => void;

  reset0: () => void;
  set0: (object: Object3D) => void;

  constructor(
    object: Camera,
    controlType: ControlType,
    domElement?: HTMLElement
  ) {
    super();

    this.object = object;
    this.controlType = controlType;
    this.domElement = domElement;

    // for reset
    this.target0 = this.target.clone();
    this.position0 = this.object.position.clone();
    this.zoom0 =
      this.object instanceof PerspectiveCamera ? this.object.zoom : 1;

    //
    // public methods
    //
    this.getDistance = (): number =>
      scope.object.position.distanceTo(scope.target);

    this.listenToKeyEvents = (domElement: HTMLElement): void => {
      domElement.addEventListener('keydown', onKeyDown);
      this._domElementKeyEvents = domElement;
    };

    this.saveState = (): void => {
      scope.target0.copy(scope.target);
      scope.position0.copy(scope.object.position);
      scope.zoom0 =
        scope.object instanceof PerspectiveCamera ? scope.object.zoom : 1;
    };

    this.reset = (): void => {
      scope.target.copy(scope.target0);
      scope.object.position.copy(scope.position0);
      if (scope.object instanceof PerspectiveCamera) {
        scope.object.zoom = scope.zoom0;
        scope.object.updateProjectionMatrix();
      }

      scope.dispatchEvent(changeEvent);

      scope.update();

      state = STATE.NONE;
    };

    // this method is exposed, but perhaps it would be better if we can make it private...
    this.update = ((): (() => void) => {
      const offset = new Vector3();

      // so camera.up is the orbit axis
      const lastPosition = new Vector3();

      return function update(): boolean {
        const position = scope.object.position;
        offset.copy(position).sub(scope.target);
        // move target to panned location
        scope.target.add(panOffset);
        position.copy(scope.target).add(offset);
        // scope.object.lookAt(scope.target);

        panOffset.set(0, 0, 0);

        scale = 1;
        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8
        if (
          zoomChanged ||
          lastPosition.distanceToSquared(scope.object.position) > EPS // ||
          // 8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS
        ) {
          scope.dispatchEvent(changeEvent);
          lastPosition.copy(scope.object.position);
          zoomChanged = false;
          return true;
        }
        return false;
      };
    })();

    // https://github.com/mrdoob/three.js/issues/20575
    this.connect = (domElement: HTMLElement): void => {
      if ((domElement as any) === document) {
        console.error(
          'THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.'
        );
      }
      scope.domElement = domElement;
      // disables touch scroll
      // touch-action needs to be defined for pointer events to work on mobile
      // https://stackoverflow.com/a/48254578
      scope.domElement.style.touchAction = 'none';
      scope.domElement.addEventListener('contextmenu', onContextMenu);
      scope.domElement.addEventListener('pointerdown', onPointerDown);
      scope.domElement.addEventListener('pointercancel', onPointerCancel);
      scope.domElement.addEventListener('wheel', onMouseWheel);
    };

    this.dispose = (): void => {
      scope.domElement?.removeEventListener('contextmenu', onContextMenu);
      scope.domElement?.removeEventListener('pointerdown', onPointerDown);
      scope.domElement?.removeEventListener('pointercancel', onPointerCancel);
      scope.domElement?.removeEventListener('wheel', onMouseWheel);
      scope.domElement?.ownerDocument.removeEventListener(
        'pointermove',
        onPointerMove
      );
      scope.domElement?.ownerDocument.removeEventListener(
        'pointerup',
        onPointerUp
      );
      if (scope._domElementKeyEvents !== null) {
        scope._domElementKeyEvents.removeEventListener('keydown', onKeyDown);
      }
      //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?
    };

    this.reset0 = (): void => {
      scope.editingId = '';
      scope.target.set(0, 0, 0);
      if (scope.object.parent) {
        scope.object.parent.remove(scope.object);
      }
    };

    this.set0 = (object: Object3D): void => {
      const camera = scope.object as OrthographicCamera;
      const baseSize = Math.min(camera.top, camera.right) * 1;
      if (!FlCubeUtil.valid(object)) {
        return;
      }
      const scale = FlCubeUtil.getScale(object);
      const changeTarget = scope.editingId !== object.name;
      if (changeTarget) {
        scope.target.set(0, 0, 0);
        object.add(scope.object);
        scope.editingId = object.name;
        switch (scope.controlType) {
          case 'top':
            camera.zoom = Math.floor(baseSize / Math.max(scale.x, scale.y));
            break;
          case 'side':
            camera.zoom = Math.floor(baseSize / Math.max(scale.x, scale.z));
            break;
          case 'front':
            camera.zoom = Math.floor(baseSize / Math.max(scale.y, scale.z));
            break;
        }
        // updateProjectionMatrix called in below
        FlObjectCameraUtil.adjust(scope.controlType, camera, scale);
      } else {
        FlObjectCameraUtil.adjustFar(scope.controlType, camera, scale);
      }
    };
    //
    // internals
    //

    const scope = this;

    const changeEvent = { type: 'change' };
    const startEvent = { type: 'start' };
    const endEvent = { type: 'end' };

    const STATE = {
      NONE: -1,
      DOLLY: 1,
      PAN: 2,
      TOUCH_PAN: 4,
      TOUCH_DOLLY_PAN: 5,
    };

    let state = STATE.NONE;

    const EPS = 0.000001;

    let scale = 1;
    const panOffset = new Vector3();
    let zoomChanged = false;

    const panStart = new Vector2();
    const panEnd = new Vector2();
    const panDelta = new Vector2();

    const dollyStart = new Vector2();
    const dollyEnd = new Vector2();
    const dollyDelta = new Vector2();

    const pointers: PointerEvent[] = [];
    const pointerPositions: { [key: string]: Vector2 } = {};

    function getZoomScale(): number {
      return Math.pow(0.95, scope.zoomSpeed);
    }

    const panLeft = (() => {
      const v = new Vector3();

      return function panLeft(distance: number, objectMatrix: Matrix4) {
        v.setFromMatrixColumn(objectMatrix, 0); // get X column of objectMatrix
        v.multiplyScalar(-distance);

        panOffset.add(v);
      };
    })();

    const panUp = (() => {
      const v = new Vector3();

      return function panUp(distance: number, objectMatrix: Matrix4) {
        if (scope.screenSpacePanning === true) {
          v.setFromMatrixColumn(objectMatrix, 1);
        } else {
          v.setFromMatrixColumn(objectMatrix, 0);
          v.crossVectors(scope.object.up, v);
        }

        v.multiplyScalar(distance);

        panOffset.add(v);
      };
    })();

    // deltaX and deltaY are in pixels; right and down are positive
    const pan = (() => {
      const offset = new Vector3();

      return function pan(deltaX: number, deltaY: number) {
        const element = scope.domElement;

        if (
          element &&
          scope.object instanceof PerspectiveCamera &&
          scope.object.isPerspectiveCamera
        ) {
          // perspective
          const position = scope.object.position;
          offset.copy(position).sub(scope.target);
          let targetDistance = offset.length();

          // half of the fov is center to top of screen
          targetDistance *= Math.tan(
            ((scope.object.fov / 2) * Math.PI) / 180.0
          );

          // we use only clientHeight here so aspect ratio does not distort speed
          panLeft(
            (2 * deltaX * targetDistance) / element.clientHeight,
            scope.object.matrix
          );
          panUp(
            (2 * deltaY * targetDistance) / element.clientHeight,
            scope.object.matrix
          );
        } else if (
          element &&
          scope.object instanceof OrthographicCamera &&
          scope.object.isOrthographicCamera
        ) {
          // orthographic
          panLeft(
            (deltaX * (scope.object.right - scope.object.left)) /
              scope.object.zoom /
              element.clientWidth,
            scope.object.matrix
          );
          panUp(
            (deltaY * (scope.object.top - scope.object.bottom)) /
              scope.object.zoom /
              element.clientHeight,
            scope.object.matrix
          );
        } else {
          // camera neither orthographic nor perspective
          console.warn(
            'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.'
          );
          scope.enablePan = false;
        }
      };
    })();

    function dollyOut(dollyScale: number) {
      if (
        scope.object instanceof PerspectiveCamera &&
        scope.object.isPerspectiveCamera
      ) {
        scale /= dollyScale;
      } else if (
        scope.object instanceof OrthographicCamera &&
        scope.object.isOrthographicCamera
      ) {
        scope.object.zoom = Math.max(
          scope.minZoom,
          Math.min(scope.maxZoom, scope.object.zoom * dollyScale)
        );
        scope.object.updateProjectionMatrix();
        zoomChanged = true;
      } else {
        console.warn(
          'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.'
        );
        scope.enableZoom = false;
      }
    }

    function dollyIn(dollyScale: number) {
      if (
        scope.object instanceof PerspectiveCamera &&
        scope.object.isPerspectiveCamera
      ) {
        scale *= dollyScale;
      } else if (
        scope.object instanceof OrthographicCamera &&
        scope.object.isOrthographicCamera
      ) {
        scope.object.zoom = Math.max(
          scope.minZoom,
          Math.min(scope.maxZoom, scope.object.zoom / dollyScale)
        );
        scope.object.updateProjectionMatrix();
        zoomChanged = true;
      } else {
        console.warn(
          'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.'
        );
        scope.enableZoom = false;
      }
    }

    //
    // event callbacks - update the object state
    //

    function handleMouseDownDolly(event: MouseEvent) {
      dollyStart.set(event.clientX, event.clientY);
    }

    function handleMouseDownPan(event: MouseEvent) {
      panStart.set(event.clientX, event.clientY);
    }

    function handleMouseMoveDolly(event: MouseEvent) {
      dollyEnd.set(event.clientX, event.clientY);
      dollyDelta.subVectors(dollyEnd, dollyStart);

      if (dollyDelta.y > 0) {
        dollyOut(getZoomScale());
      } else if (dollyDelta.y < 0) {
        dollyIn(getZoomScale());
      }

      dollyStart.copy(dollyEnd);
      scope.update();
    }

    function handleMouseMovePan(event: MouseEvent) {
      panEnd.set(event.clientX, event.clientY);
      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
      pan(panDelta.x, panDelta.y);
      panStart.copy(panEnd);
      scope.update();
    }

    function handleMouseUp(/*event*/) {
      // no-op
    }

    function handleMouseWheel(event: WheelEvent) {
      if (event.deltaY < 0) {
        dollyIn(getZoomScale());
      } else if (event.deltaY > 0) {
        dollyOut(getZoomScale());
      }

      scope.update();
    }

    const keyR = Math.PI / 360;

    function handleKeyDown(event: KeyboardEvent) {
      let needsUpdate = false;

      switch (event.code) {
        case scope.keys.UP:
          // pan(0, scope.keyPanSpeed);
          needsUpdate = true;
          break;

        case scope.keys.BOTTOM:
          // pan(0, -scope.keyPanSpeed);
          needsUpdate = true;
          break;

        case scope.keys.LEFT:
          // pan(scope.keyPanSpeed, 0);
          needsUpdate = true;
          break;

        case scope.keys.RIGHT:
          // pan(-scope.keyPanSpeed, 0);
          needsUpdate = true;
          break;
      }

      if (needsUpdate) {
        // prevent the browser from scrolling on cursor keys
        event.preventDefault();
        scope.update();
      }
    }

    function handleTouchStartPan() {
      if (pointers.length == 1) {
        panStart.set(pointers[0].pageX, pointers[0].pageY);
      } else {
        const x = 0.5 * (pointers[0].pageX + pointers[1].pageX);
        const y = 0.5 * (pointers[0].pageY + pointers[1].pageY);

        panStart.set(x, y);
      }
    }

    function handleTouchStartDolly() {
      const dx = pointers[0].pageX - pointers[1].pageX;
      const dy = pointers[0].pageY - pointers[1].pageY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      dollyStart.set(0, distance);
    }

    function handleTouchStartDollyPan() {
      if (scope.enableZoom) handleTouchStartDolly();
      if (scope.enablePan) handleTouchStartPan();
    }

    function handleTouchMovePan(event: PointerEvent) {
      if (pointers.length == 1) {
        panEnd.set(event.pageX, event.pageY);
      } else {
        const position = getSecondPointerPosition(event);
        const x = 0.5 * (event.pageX + position.x);
        const y = 0.5 * (event.pageY + position.y);
        panEnd.set(x, y);
      }

      panDelta.subVectors(panEnd, panStart).multiplyScalar(scope.panSpeed);
      pan(panDelta.x, panDelta.y);
      panStart.copy(panEnd);
    }

    function handleTouchMoveDolly(event: PointerEvent) {
      const position = getSecondPointerPosition(event);
      const dx = event.pageX - position.x;
      const dy = event.pageY - position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      dollyEnd.set(0, distance);
      dollyDelta.set(0, Math.pow(dollyEnd.y / dollyStart.y, scope.zoomSpeed));
      dollyOut(dollyDelta.y);
      dollyStart.copy(dollyEnd);
    }

    function handleTouchMoveDollyPan(event: PointerEvent) {
      if (scope.enableZoom) handleTouchMoveDolly(event);
      if (scope.enablePan) handleTouchMovePan(event);
    }

    function handleTouchEnd(/*event*/) {
      // no-op
    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    function onPointerDown(event: PointerEvent) {
      if (scope.enabled === false) return;

      if (pointers.length === 0) {
        scope.domElement?.ownerDocument.addEventListener(
          'pointermove',
          onPointerMove
        );
        scope.domElement?.ownerDocument.addEventListener(
          'pointerup',
          onPointerUp
        );
      }

      addPointer(event);

      if (event.pointerType === 'touch') {
        onTouchStart(event);
      } else {
        onMouseDown(event);
      }
    }

    function onPointerMove(event: PointerEvent) {
      if (scope.enabled === false) return;

      if (event.pointerType === 'touch') {
        onTouchMove(event);
      } else {
        onMouseMove(event);
      }
    }

    function onPointerUp(event: PointerEvent) {
      if (scope.enabled === false) return;

      if (event.pointerType === 'touch') {
        onTouchEnd();
      } else {
        onMouseUp();
      }

      removePointer(event);

      if (pointers.length === 0) {
        scope.domElement?.ownerDocument.removeEventListener(
          'pointermove',
          onPointerMove
        );
        scope.domElement?.ownerDocument.removeEventListener(
          'pointerup',
          onPointerUp
        );
      }
    }

    function onPointerCancel(event: PointerEvent) {
      removePointer(event);
    }

    function onMouseDown(event: MouseEvent) {
      let mouseAction;

      switch (event.button) {
        case 0:
          // mouseButtons.LEFT
          mouseAction = MOUSE.PAN;
          // TODO should disable dragging point
          return;

        case 1:
          mouseAction = scope.mouseButtons.MIDDLE;
          break;

        case 2:
          // mouseButtons.RIGHT
          mouseAction = MOUSE.PAN;
          break;

        default:
          mouseAction = -1;
      }

      switch (mouseAction) {
        case MOUSE.DOLLY:
          if (scope.enableZoom === false) return;
          handleMouseDownDolly(event);
          state = STATE.DOLLY;
          break;

        case MOUSE.ROTATE:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
            if (scope.enablePan === false) return;
            handleMouseDownPan(event);
            state = STATE.PAN;
          }
          break;

        case MOUSE.PAN:
          if (event.ctrlKey || event.metaKey || event.shiftKey) {
          } else {
            if (scope.enablePan === false) return;
            handleMouseDownPan(event);
            state = STATE.PAN;
          }
          break;

        default:
          state = STATE.NONE;
      }

      if (state !== STATE.NONE) {
        scope.dispatchEvent(startEvent);
      }
    }

    function onMouseMove(event: MouseEvent) {
      if (scope.enabled === false) return;
      switch (state) {
        case STATE.DOLLY:
          if (scope.enableZoom === false) return;
          handleMouseMoveDolly(event);
          break;

        case STATE.PAN:
          if (scope.enablePan === false) return;
          handleMouseMovePan(event);
          break;
      }
    }

    function onMouseUp() {
      handleMouseUp();
      scope.dispatchEvent(endEvent);
      state = STATE.NONE;
    }

    function onMouseWheel(event: WheelEvent) {
      if (
        scope.enabled === false ||
        scope.enableZoom === false ||
        state !== STATE.NONE
      ) {
        return;
      }

      event.preventDefault();

      scope.dispatchEvent(startEvent);

      handleMouseWheel(event);

      scope.dispatchEvent(endEvent);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (scope.enabled === false || scope.enablePan === false) return;
      handleKeyDown(event);
    }

    function onTouchStart(event: PointerEvent) {
      trackPointer(event);

      switch (pointers.length) {
        case 1:
          switch (scope.touches.ONE) {
            case TOUCH.PAN:
              if (scope.enablePan === false) return;
              handleTouchStartPan();
              state = STATE.TOUCH_PAN;
              break;
            default:
              state = STATE.NONE;
          }
          break;
        case 2:
          switch (scope.touches.TWO) {
            case TOUCH.DOLLY_PAN:
              if (scope.enableZoom === false && scope.enablePan === false)
                return;
              handleTouchStartDollyPan();
              state = STATE.TOUCH_DOLLY_PAN;
              break;
            default:
              state = STATE.NONE;
          }
          break;
        default:
          state = STATE.NONE;
      }

      if (state !== STATE.NONE) {
        scope.dispatchEvent(startEvent);
      }
    }

    function onTouchMove(event: PointerEvent) {
      trackPointer(event);

      switch (state) {
        case STATE.TOUCH_PAN:
          if (scope.enablePan === false) return;
          handleTouchMovePan(event);
          scope.update();
          break;
        case STATE.TOUCH_DOLLY_PAN:
          if (scope.enableZoom === false && scope.enablePan === false) return;
          handleTouchMoveDollyPan(event);
          scope.update();
          break;
        default:
          state = STATE.NONE;
      }
    }

    function onTouchEnd() {
      handleTouchEnd();
      scope.dispatchEvent(endEvent);
      state = STATE.NONE;
    }

    function onContextMenu(event: Event) {
      if (scope.enabled === false) return;
      event.preventDefault();
    }

    function addPointer(event: PointerEvent) {
      pointers.push(event);
    }

    function removePointer(event: PointerEvent) {
      delete pointerPositions[event.pointerId];

      for (let i = 0; i < pointers.length; i++) {
        if (pointers[i].pointerId == event.pointerId) {
          pointers.splice(i, 1);
          return;
        }
      }
    }

    function trackPointer(event: PointerEvent) {
      let position = pointerPositions[event.pointerId];

      if (position === undefined) {
        position = new Vector2();
        pointerPositions[event.pointerId] = position;
      }

      position.set(event.pageX, event.pageY);
    }

    function getSecondPointerPosition(event: PointerEvent) {
      const pointer =
        event.pointerId === pointers[0].pointerId ? pointers[1] : pointers[0];
      return pointerPositions[pointer.pointerId];
    }

    // connect events
    if (domElement !== undefined) this.connect(domElement);
    // force an update at start
    this.update();
  }
}
export { FLObjectCameraControls };
