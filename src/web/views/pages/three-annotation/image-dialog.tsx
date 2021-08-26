import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@material-ui/icons/ArrowForwardIosOutlined';
import { Canvas } from '@react-three/fiber';
import React, { FC, RefObject, useCallback, useEffect, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { Camera, Euler, Group, PerspectiveCamera, TextureLoader, Vector3 } from 'three';
import TaskStore from '../../../stores/task-store';
import FLCubes from '../../task-three/fl-cubes';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        content: {
            position: 'relative'
        },
        contentImage: {
            width: 560,
            height: 'auto'
        },
        popoverPaper: {
            maxWidth: 'initial',
            maxHeight: 'initial'
        },
        prevButton: {
            display: 'flex',
            position: 'absolute',
            height: '100%',
            alignItems: 'center',
            top: 0,
            left: 0
        },
        nextButton: {
            display: 'flex',
            position: 'absolute',
            height: '100%',
            alignItems: 'center',
            top: 0,
            right: 0
        }
    }));

type Props = {
    cubeGroup?: RefObject<Group>;
    calibrationCamera?: PerspectiveCamera;
};

type Position = {
    xRate: number;
    yRate: number;
};

type LocalState = {
    open: boolean;
    width: number;
    height: number;
    imageMesh: JSX.Element | undefined;
}

const _vector = /*@__PURE__*/ new Vector3();
const _camera = /*@__PURE__*/ new Camera();

const ImagePopover: FC<Props> = ({ cubeGroup, calibrationCamera }) => {
    const styles = useStyles();
    const popoverRef = useRef<any>(undefined);

    const [state, setState] = useState<LocalState>({ open: false, width: 1, height: 1, imageMesh: undefined });

    const [currentPosition, setCurrentPosition] = useState<Position>({ xRate: 0, yRate: 0 });

    const onDrag = useCallback((e: DraggableEvent, data: DraggableData) => {
        setCurrentPosition({ xRate: data.lastX, yRate: data.lastY });
    }, []);

    const { taskAnnotations, taskFrame, topicImageDialog, moveTopicImage } = TaskStore.useContainer();

    useEffect(() => {
        if (!topicImageDialog.currentImageData || !topicImageDialog.open || !calibrationCamera) {
            const width = 1;
            const height = 1;
            setState({
                open: false, width, height, imageMesh: undefined
            });
            return;
        }
        new TextureLoader().load(topicImageDialog.currentImageData, (tex) => {
            _camera.projectionMatrixInverse.copy(calibrationCamera.projectionMatrixInverse);
            _vector.set(30, 0, 0);
            const width = 120;
            const height = tex.image.height / (tex.image.width / width);
            console.log(_vector);
            setState({
                open: true, width, height,
                imageMesh: (<>
                    <mesh position={_vector.clone()} rotation={new Euler(0, -Math.PI / 2, -Math.PI / 2)} >
                        <planeGeometry args={[width, height]} />
                        <meshBasicMaterial args={[({ map: tex })]} />
                    </mesh>
                </>)
            });
        });
        return;
    }, [topicImageDialog]);

    useEffect(() => {
        if (popoverRef.current && state.open) {
            popoverRef.current.style.inset = '';
            popoverRef.current.style.top = '0px';
        }
    }, [popoverRef, state]);

    return (
        <Draggable
            position={{
                x: currentPosition.xRate,
                y: currentPosition.yRate
            }}
            onDrag={onDrag}
        >
            <Popover
                ref={popoverRef}
                hideBackdrop={true}
                disablePortal={true}
                anchorReference="anchorPosition"
                anchorPosition={{ top: 0, left: 0 }}
                PaperProps={({ className: styles.popoverPaper })}
                open={state.open}>

                <Box className={styles.content}>
                    {topicImageDialog.hasPrev && <Box className={styles.prevButton} m={0}>
                        <Box height={48}>
                            <IconButton aria-label="image-popover-prev" onClick={() => moveTopicImage('prev')}>
                                <ArrowBackIosOutlinedIcon />
                            </IconButton>
                        </Box>
                    </Box>}
                    <Box style={({ cursor: 'move' })} width={800} height={229.95169082125605}>
                        {state.imageMesh &&
                            <Canvas camera={calibrationCamera} resize={({ debounce: 500 })}>
                                {taskFrame.status === 'loaded' && <FLCubes frameNo={taskFrame.currentFrame} annotations={taskAnnotations} />}
                                {state.imageMesh}
                            </Canvas>}
                    </Box>
                    {topicImageDialog.hasNext && <Box className={styles.nextButton} m={0}>
                        <Box height={48}>
                            <IconButton aria-label="image-popover-next" onClick={() => moveTopicImage('next')} >
                                <ArrowForwardIosOutlinedIcon />
                            </IconButton>
                        </Box>
                    </Box>}
                </Box>
            </Popover>
        </Draggable>
    );
};

export default ImagePopover;