import { Box, createStyles, Grid, makeStyles, Theme } from '@material-ui/core';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import React, { createRef, FC, useEffect, useMemo, useState } from 'react';
import { Euler, Event, Group, Matrix4, Object3D, PerspectiveCamera, Vector3 } from 'three';
import { AnnotationClassVO, TaskAnnotationVO, TaskCalibrationVO } from '../../types/vo';
import FLCube from './fl-cube';
import FLMainControls from './fl-main-controls';
import FLObjectControls from './fl-object-controls';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        wrapTaskForm: {
            padding: theme.spacing(2),
        },
        footer: {
            height: 360
        }
    })
);

type Props = {
    frameNo: string;
    annotations: TaskAnnotationVO[];
    backgroundObj?: JSX.Element;
    position0?: Vector3;
    targets?: TaskAnnotationVO[];
    preObject?: AnnotationClassVO;
    imageTopicId?: string;
    calibrations?: { [topicId: string]: TaskCalibrationVO };
    onClickObj?: (evt: ThreeEvent<MouseEvent>) => void;
    onPutObject?: (evt: ThreeEvent<MouseEvent>, preObject: AnnotationClassVO) => void;
    onObjectChange?: (event: Event) => void;
};

const FLThreeEditor: FC<Props> = ({ frameNo, annotations, backgroundObj, position0, targets, preObject, imageTopicId, calibrations, onClickObj = f => f, onPutObject = f => f, onObjectChange = f => f }) => {
    const styles = useStyles();
    const cubeGroupRef = createRef<Group>();
    const [near, far, zoom] = useMemo(() => [0.01, 500, 10], []);
    const [target, setTarget] = useState<Object3D>();

    useEffect(() => {
        if (targets && targets.length === 1 && cubeGroupRef.current) {
            const vo = targets[0];
            setTarget(cubeGroupRef.current.getObjectByName(vo.id));
        } else {
            setTarget(undefined);
        }
    }, [cubeGroupRef, targets]);

    const [calibrationCamera] = useMemo(() => {
        if (imageTopicId && calibrations) {
            const calibration = calibrations[imageTopicId];
            const cameraMatrix = new Matrix4();
            const mat = calibration.cameraMat;
            cameraMatrix.set(...mat[0], 0, ...mat[1], 0, ...mat[2], 0, 0, 0, 0, 1);
            const cameraMatrixT = cameraMatrix.clone().transpose();

            const cameraExtrinsicMatrix = new Matrix4();
            const extrinsic = calibration.cameraExtrinsicMat;
            cameraExtrinsicMatrix.set(...extrinsic[0], ...extrinsic[1], ...extrinsic[2], ...extrinsic[3]);
            // const cameraExtrinsicMatrixT = cameraExtrinsicMatrix.clone().transpose();

            // Flip the calibration information along with all axes.
            const flipMatrix = new Matrix4();
            flipMatrix.set(-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1);

            // NOTE: THREE.Matrix4.elements contains matrices in column-major order, but not row-major one.
            //       So, we need the transposed matrix to get the elements in row-major order.
            const cameraExtrinsicMatrixFlipped = flipMatrix.premultiply(cameraExtrinsicMatrix);
            const cameraExtrinsicMatrixFlippedT = cameraExtrinsicMatrixFlipped.clone().transpose();


            const distance = 20;

            const [width, height] = calibration.imageSize;
            const imageFx = cameraMatrixT.elements[0];
            const imageFov = 2 * Math.atan(width / (2 * imageFx)) / Math.PI * 180;

            const imageCamera = new PerspectiveCamera(imageFov, width / height, 1, distance);
            const [n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44] = cameraExtrinsicMatrixFlippedT.elements;
            imageCamera.matrixWorld.set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44);

            return [imageCamera];
        }
        return [undefined];
    }, [imageTopicId, calibrations]);

    return (
        <Box display="flex" flexDirection="column" height="100%">
            <Box flexGrow={1} mb={2}>
                <Canvas camera={{ fov: 90, up: new Vector3(0, 0, 1), rotation: new Euler(0, 0, 0, 'ZXY') }} style={{ backgroundColor: 'black' }} >
                    <FLMainControls position0={position0} preObject={preObject} onPutObject={onPutObject} />
                    {backgroundObj}
                    <group ref={cubeGroupRef}>
                        {annotations.map(a => {
                            const points = a.points[frameNo as any];
                            return (<FLCube key={a.id} id={a.id} points={points} color={a.color} onClick={onClickObj} />);
                        })}
                    </group>
                    {calibrationCamera && <cameraHelper args={[calibrationCamera]} />}
                </Canvas>
            </Box>
            <Box mr={2} ml={2}>
                <Grid container spacing={2} className={styles.footer}>
                    <Grid item xs={4}>
                        <Canvas orthographic camera={{ near, far, zoom }} style={{ backgroundColor: 'black' }}>
                            {backgroundObj}
                            <FLObjectControls control='top' target={target} onObjectChange={onObjectChange} />
                        </Canvas>
                    </Grid>
                    <Grid item xs={4}>
                        <Canvas orthographic camera={{ near, far, zoom }} style={{ backgroundColor: 'black' }}>
                            {backgroundObj}
                            <FLObjectControls control='side' target={target} onObjectChange={onObjectChange} />
                        </Canvas>
                    </Grid>
                    <Grid item xs={4}>
                        <Canvas orthographic camera={{ near, far, zoom, up: new Vector3(1, 0, 0) }} style={{ backgroundColor: 'black' }} >
                            {backgroundObj}
                            <FLObjectControls control='front' target={target} onObjectChange={onObjectChange} />
                        </Canvas>
                    </Grid>
                </Grid>
            </Box>
        </Box >
    );
};
export default FLThreeEditor;
