import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { OrbitControls } from '@react-three/drei';
import { Canvas as FiberCanvas, ThreeEvent, useThree } from '@react-three/fiber';
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import { BufferGeometry, Camera, Float32BufferAttribute, PointsMaterial, Vector3 } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import TaskStore from '../../stores/task-store';
import { PCDResult } from '../../types/labos';
import { TaskAnnotationVO } from '../../types/vo';
import { TaskAnnotationUtil } from '../../use-case/task-annotation-util';
import ColorUtil from '../../utils/color-util';
import PcdUtil from '../../utils/pcd-util';
import { AnnotationControls } from './annotation-controls';
import Cube from './cube';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            background: '#000',
        },
    })
);

const getUniqueStr = (myStrong?: number): string => {
    let strong = 1000;
    if (myStrong) strong = myStrong;
    return (
        new Date().getTime().toString(16) +
        Math.floor(strong * Math.random()).toString(16)
    );
}

const Controls: FC<{ target?: Vector3, enableZoom?: boolean, onPointerUp?: (evt: MouseEvent, camera: Camera) => void }> = ({ target, enableZoom, onPointerUp }) => {
    const { camera, gl } = useThree();
    const orbit = useRef<OrbitControlsImpl>();
    // TODO adjust  position only first time
    useEffect(() => {
        if (target) {
            camera.position.set(target.x, target.y + 50, target.z);
        }
    }, []);
    return (
        <>
            <AnnotationControls args={[camera]} onPointerUp={onPointerUp} />
            <OrbitControls
                ref={orbit as any}
                enableDamping
                dampingFactor={0.05}
                screenSpacePanning={false}
                autoRotate={false}
                enableZoom={enableZoom}
                // maxZoom={0}
                // maxDistance={3.6}
                enablePan
                // maxPolarAngle={Math.PI / 2}
                // minPolarAngle={0}
                target={target}
                args={[camera, gl.domElement]}
            />
        </>
    );
}

const Model: FC<ModelProps> = ({ pcd }) => {
    const { camera } = useThree();
    const geometry = new BufferGeometry();
    if (pcd.position.length > 0) geometry.setAttribute('position', new Float32BufferAttribute(pcd.position, 3));
    if (pcd.normal.length > 0) geometry.setAttribute('normal', new Float32BufferAttribute(pcd.normal, 3));
    if (pcd.color.length > 0) {
        geometry.setAttribute('color', new Float32BufferAttribute(pcd.color, 3));
    } else {
        geometry.setAttribute('color', new Float32BufferAttribute(ColorUtil.normalizeColors(pcd.position), 3));
    }
    geometry.computeBoundingSphere();

    // build material
    const baseSize = 0.005;
    const material = new PointsMaterial({ size: baseSize * 8 });
    material.vertexColors = true;

    const halfAngle = Math.PI / 2;
    geometry.rotateX(-halfAngle);
    return <points geometry={geometry} material={material} />;
}

type ModelProps = {
    pcd: PCDResult;
};

const Boxies: FC<{ annotations: TaskAnnotationVO[], frameNo: string }> = ({ annotations, frameNo }) => {
    return (<React.Fragment>
        {annotations.map(a => {
            const points = a.points[frameNo as any];
            const position = new Vector3(points[0], points[1], points[2]);
            return (<Cube key={a.id} position={position}
                width={points[3]}
                depth={points[4]}
                height={points[5]}
                color={a.color} />);
        })}
    </React.Fragment>)
};


const Canvas3d: FC<{ pcd: PCDResult }> = ({ pcd }) => {
    const classes = useStyles();
    const store = TaskStore.useContainer();

    const origin = useMemo(() => {
        const x = PcdUtil.getMaxMin(pcd.position, 'x');
        const y = PcdUtil.getMaxMin(pcd.position, 'y');
        const z = PcdUtil.getMaxMin(pcd.position, 'z');
        // adjust rotatex -90
        return new Vector3((x.min + x.max) / 2, (z.min + z.max) / 2, -(y.min + y.max) / 2);
    }, []);

    const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    };
    const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    };

    const onPointerUp = useCallback((evt: MouseEvent, camera: Camera) => {
        if (!evt.ctrlKey) return;

        const canvasElement = evt.target as HTMLCanvasElement;
        const pos = new Vector3(0, 0, 0);
        const pMouse = new Vector3(
            (evt.offsetX / canvasElement.width) * 2 - 1,
            - (evt.offsetY / canvasElement.height) * 2 + 1,
            1);
        pMouse.unproject(camera);

        const cam = camera.position;
        const m = pMouse.y / (pMouse.y - cam.y);

        pos.x = pMouse.x + (cam.x - pMouse.x) * m;
        pos.z = pMouse.z + (cam.z - pMouse.z) * m;


        const taskFrame = store.taskFrame;
        const editorState = store.taskEditor.editorState;
        if (editorState.mode === 'selecting_annotationClass' && taskFrame.status === 'loaded') {
            const frame = taskFrame.currentFrame;
            const vo = TaskAnnotationUtil.create(editorState.selectingAnnotationClass, taskFrame.currentFrame);
            vo.points[frame][0] = pos.x;
            vo.points[frame][1] = vo.points[frame][5] / 2;
            vo.points[frame][2] = pos.z;
            store.addTaskAnnotations([vo]);
        }
    }, [store.taskEditor, store.taskFrame]);

    return (
        <React.Fragment>
            <FiberCanvas className={classes.root}>
                <Model pcd={pcd} />
                <Boxies annotations={store.taskAnnotations} frameNo={'0001'} />
                <Controls target={origin} onPointerUp={onPointerUp} />
            </FiberCanvas>
        </React.Fragment>
    );
};

export default Canvas3d;
