import { ReactThreeFiber, useFrame, useThree } from '@react-three/fiber';
import * as React from 'react';
import { Camera, Event, EventDispatcher, Vector2 } from 'three';


export type AnnotationControlsProps = ReactThreeFiber.Overwrite<
    ReactThreeFiber.Object3DNode<AnnotationControlsImpl, typeof AnnotationControlsImpl>,
    {
        target?: ReactThreeFiber.Vector3
        camera?: THREE.Camera
        domElement?: HTMLElement
        regress?: boolean
        enableDamping?: boolean,
        onPointerUp?: (evt: MouseEvent, camera: Camera) => void
    }
>

export const AnnotationControls = React.forwardRef<AnnotationControlsImpl, AnnotationControlsProps>(
    ({ camera, regress, domElement, enableDamping = true, onPointerUp, ...restProps }, ref) => {
        const invalidate = useThree(({ invalidate }) => invalidate)
        const defaultCamera = useThree(({ camera }) => camera)
        const gl = useThree(({ gl }) => gl)
        const performance = useThree(({ performance }) => performance)
        const explCamera = camera || defaultCamera
        const explDomElement = domElement || gl.domElement
        const controls = React.useMemo(() => new AnnotationControlsImpl(explCamera), [explCamera])

        useFrame(() => {
            if (controls.enabled) { }
        })

        React.useEffect(() => {
            const callback = (event: Event) => {
                if (onPointerUp) onPointerUp(event.evt as any, defaultCamera);
            }

            controls.connect(explDomElement)
            controls.addEventListener('add', callback)
            return () => {
                controls.removeEventListener('add', callback)
                controls.dispose()
            }
        }, [controls, onPointerUp])

        return <primitive ref={ref} object={controls} enableDamping={enableDamping} {...restProps} />
    }
)


const _startEvent = { type: 'start' };
const _endEvent = { type: 'end' };

class AnnotationControlsImpl extends EventDispatcher {

    private _domElementKeyEvents: HTMLElement | null = null;

    object: Camera;
    domElement?: HTMLElement;
    enabled: boolean;
    listenToKeyEvents: (domElement: HTMLElement) => void;
    connect: (domElement: HTMLElement) => void;
    dispose: () => void;

    constructor(object: Camera) {
        super();
        this.object = object;
        this.enabled = true;

        const pointers: PointerEvent[] = [];
        const pointerPositions: { [key: number]: Vector2 } = {};


        const addPointer = (event: PointerEvent) => {
            pointers.push(event);
        }

        const trackPointer = (event: PointerEvent) => {
            let position = pointerPositions[event.pointerId];
            if (position === undefined) {
                position = new Vector2();
                pointerPositions[event.pointerId] = position;
            }
            position.set(event.pageX, event.pageY);
        }

        const removePointer = (event: PointerEvent) => {
            delete pointerPositions[event.pointerId];
            for (let i = 0; i < pointers.length; i++) {
                if (pointers[i].pointerId == event.pointerId) {
                    pointers.splice(i, 1);
                    return;
                }
            }
        }

        const onPointerDown = (event: PointerEvent) => {
            if (this.enabled === false) return;

            if (pointers.length === 0 && this.domElement) {
                const ownerDocument = this.domElement.ownerDocument;
                this.domElement.addEventListener('pointermove', onPointerMove);
                this.domElement.addEventListener('pointerup', onPointerUp);
            }
            addPointer(event);
            if (event.pointerType === 'touch') {
                onTouchStart(event);
            } else {
                onMouseDown(event);
            }
        }

        const onPointerMove = (event: PointerEvent) => {
            if (this.enabled === false) return;
            if (event.pointerType === 'touch') {
                onTouchMove(event);
            } else {
                onMouseMove(event);
            }
        }

        const onPointerUp = (event: PointerEvent) => {
            if (this.enabled === false) return;

            if (event.pointerType === 'touch') {
                onTouchEnd(event);
            } else {
                onMouseUp(event);
            }
            this.dispatchEvent({ type: 'add', evt: event, camera: this.object });
            removePointer(event);
            if (pointers.length === 0 && this.domElement) {
                const ownerDocument = this.domElement.ownerDocument;
                this.domElement.removeEventListener('pointermove', onPointerMove);
                this.domElement.removeEventListener('pointerup', onPointerUp);
            }
        }

        const onPointerCancel = (event: PointerEvent) => {
            removePointer(event);
        }

        const onTouchStart = (event: PointerEvent) => {
            trackPointer(event);
            this.dispatchEvent(_startEvent);
        }

        const onTouchMove = (event: PointerEvent) => {
            trackPointer(event);
        }

        const onTouchEnd = (event: PointerEvent) => {
            this.dispatchEvent(_endEvent);
        }

        const onMouseDown = (event: PointerEvent) => {
            this.dispatchEvent(_startEvent);
        }

        const onMouseMove = (event: PointerEvent) => {
            if (this.enabled === false) return;
        }

        const onMouseUp = (event: PointerEvent) => {
            this.dispatchEvent(_endEvent);
        }

        const onContextMenu = (event: Event) => {
            if (this.enabled === false) return;
            event.preventDefault();
        }

        const onMouseWheel = (event: WheelEvent) => {
            if (this.enabled === false) return;
            event.preventDefault();
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (this.enabled === false) return;
        }

        this.connect = (domElement: HTMLElement) => {
            if ((domElement as any) === document) {
                console.error(
                    'THREE.OrbitControls: "document" should not be used as the target "domElement". Please use "renderer.domElement" instead.',
                )
            }
            this.domElement = domElement;
            this.domElement.style.touchAction = 'none'
            this.domElement.addEventListener('contextmenu', onContextMenu);

            this.domElement.addEventListener('pointerdown', onPointerDown);
            this.domElement.addEventListener('pointercancel', onPointerCancel);
            this.domElement.addEventListener('wheel', onMouseWheel, { passive: false });
        };

        this.dispose = () => {
            if (this.domElement) {
                this.domElement.removeEventListener('contextmenu', onContextMenu);

                this.domElement.removeEventListener('pointerdown', onPointerDown);
                this.domElement.removeEventListener('pointercancel', onPointerCancel);
                this.domElement.removeEventListener('wheel', onMouseWheel);

                this.domElement.ownerDocument.removeEventListener('pointermove', onPointerMove);
                this.domElement.ownerDocument.removeEventListener('pointerup', onPointerUp);
            }

            if (this._domElementKeyEvents !== null) {
                this._domElementKeyEvents.removeEventListener('keydown', onKeyDown);
            }
        }

        this.listenToKeyEvents = (domElement: HTMLElement) => {
            domElement.addEventListener('keydown', onKeyDown);
            this._domElementKeyEvents = domElement;
        };
    }
}