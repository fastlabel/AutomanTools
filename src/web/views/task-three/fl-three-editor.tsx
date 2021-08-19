import { Box, createStyles, Grid, makeStyles, Theme } from '@material-ui/core';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import React, { createRef, FC, useEffect, useMemo, useState } from 'react';
import { Group, Object3D, Vector3 } from 'three';
import { AnnotationClassVO, TaskAnnotationVO } from '../../types/vo';
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
    onClickObj?: (evt: ThreeEvent<MouseEvent>) => void;
    onPutObject?: (evt: ThreeEvent<MouseEvent>, preObject: AnnotationClassVO) => void;
};

const FLThreeEditor: FC<Props> = ({ frameNo, annotations, backgroundObj, position0, targets, preObject, onClickObj = f => f, onPutObject = f => f }) => {
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

    return (
        <Box display="flex" flexDirection="column" height="100%">
            <Box flexGrow={1} mb={2}>
                <Canvas style={{ backgroundColor: 'black' }}>
                    <FLMainControls position0={position0} preObject={preObject} onPutObject={onPutObject} />
                    {backgroundObj}
                    <group ref={cubeGroupRef}>
                        {annotations.map(a => {
                            const points = a.points[frameNo as any];
                            return (<FLCube key={a.id} id={a.id} points={points} color={a.color} onClick={onClickObj} />);
                        })}
                    </group>
                </Canvas>
            </Box>
            <Box mr={2} ml={2}>
                <Grid container spacing={2} className={styles.footer}>
                    <Grid item xs={4}>
                        <Canvas orthographic camera={{ near, far, zoom }} style={{ backgroundColor: 'black' }}>
                            {backgroundObj}
                            <FLObjectControls control='z' target={target} />
                        </Canvas>
                    </Grid>
                    <Grid item xs={4}>
                        <Canvas orthographic camera={{ near, far, zoom }} style={{ backgroundColor: 'black' }}>
                            {backgroundObj}
                            <FLObjectControls control='y' target={target} />
                        </Canvas>
                    </Grid>
                    <Grid item xs={4}>
                        <Canvas orthographic camera={{ near, far, zoom }} style={{ backgroundColor: 'black' }}>
                            {backgroundObj}
                            <FLObjectControls control='x' target={target} />
                        </Canvas>
                    </Grid>
                </Grid>
            </Box>
        </Box >
    );
};
export default FLThreeEditor;
