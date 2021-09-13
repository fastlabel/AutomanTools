import {
  Box,
  createStyles,
  Grid,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import React, { createRef, FC, useEffect, useMemo, useState } from 'react';
import { Euler, Event, Group, Object3D, Vector3 } from 'three';
import { AnnotationClassVO, TaskAnnotationVO } from '../../types/vo';
import FLCubes from './fl-cubes';
import FLMainControls from './fl-main-controls';
import FLObjectControls from './fl-object-controls';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      height: '100%',
      flexDirection: 'column',
      backgroundColor: '#1a1a1a',
    },
    wrapTaskForm: {
      padding: theme.spacing(2),
    },
    footer: {
      maxHeight: 360,
    },
    footerLabel: {
      alignItems: 'center',
      justifyContent: 'center',
      display: 'flex',
      backgroundColor: '#24303b',
      color: '#bdc8d2',
    },
  })
);

type Props = {
  frameNo: string;
  annotations: TaskAnnotationVO[];
  selectable: boolean;
  showLabel: boolean;
  cubeGroupRef?: React.RefObject<Group>;
  bgMain?: JSX.Element;
  bgSub?: JSX.Element;
  cameraHelper?: JSX.Element;
  position0?: Vector3;
  targets?: TaskAnnotationVO[];
  preObject?: AnnotationClassVO;
  onClickObj?: (evt: ThreeEvent<MouseEvent>) => void;
  onPutObject?: (
    evt: ThreeEvent<MouseEvent>,
    preObject: AnnotationClassVO
  ) => void;
  onObjectChange?: (event: Event) => void;
};

const C_RESIZE = { debounce: 100 };

const FLThreeEditor: FC<Props> = ({
  frameNo,
  annotations,
  selectable,
  showLabel,
  cubeGroupRef,
  bgMain,
  bgSub,
  position0,
  targets,
  preObject,
  cameraHelper,
  onClickObj = (f) => f,
  onPutObject = (f) => f,
  onObjectChange = (f) => f,
}) => {
  const styles = useStyles();
  const [near, far, zoom] = useMemo(() => [0.01, 500, 10], []);
  const [target, setTarget] = useState<Object3D>();
  const rootRef = createRef<HTMLDivElement>();
  const _cubeGroupRef = cubeGroupRef || createRef<Group>();

  useEffect(() => {
    if (targets && targets.length === 1 && _cubeGroupRef.current) {
      const vo = targets[0];
      setTarget(_cubeGroupRef.current.getObjectByName(vo.id));
    } else {
      setTarget(undefined);
    }
  }, [_cubeGroupRef, targets]);

  useEffect(() => {
    if (rootRef.current) {
      const root = rootRef.current;
      const handleResize = () => {
        const canvas = root.getElementsByTagName('canvas') as any;
        for (const c of canvas) {
          c.width = 0;
          c.height = 0;
          c.style.width = '';
          c.style.height = '';
        }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [rootRef]);

  const footerBoxH = 320;
  return (
    <div className={styles.root} ref={rootRef}>
      <Box flexGrow={1} mt={2} mr={2} ml={2} mb={1}>
        <Canvas
          camera={{
            fov: 50,
            up: new Vector3(0, 0, 1),
            rotation: new Euler(0, 0, 0, 'ZXY'),
          }}
          style={{ backgroundColor: 'black' }}
          resize={C_RESIZE}>
          <FLMainControls
            position0={position0}
            preObject={preObject}
            onPutObject={onPutObject}
          />
          {bgMain}
          <FLCubes
            ref={_cubeGroupRef}
            selectable={selectable}
            showLabel={showLabel}
            frameNo={frameNo}
            annotations={annotations}
            onClick={onClickObj}
          />
          {cameraHelper}
        </Canvas>
      </Box>
      <Box mr={2} ml={2} mb={1}>
        <Grid container spacing={2} className={styles.footer}>
          <Grid item xs={4}>
            <Box className={styles.footerLabel}>
              <Typography>上面</Typography>
            </Box>
            <Box height={footerBoxH}>
              <Canvas
                orthographic
                camera={{ near, far, zoom, up: new Vector3(1, 0, 0) }}
                style={{ backgroundColor: 'black' }}
                resize={C_RESIZE}>
                {bgSub}
                <FLObjectControls
                  control="top"
                  target={target}
                  onObjectChange={onObjectChange}
                />
              </Canvas>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box className={styles.footerLabel}>
              <Typography>側面</Typography>
            </Box>
            <Box height={footerBoxH}>
              <Canvas
                orthographic
                camera={{
                  near,
                  far,
                  zoom,
                  up: new Vector3(0, 0, 1),
                  position: new Vector3(0, -1, 0),
                }}
                style={{ backgroundColor: 'black' }}
                resize={C_RESIZE}>
                {bgSub}
                <FLObjectControls
                  control="side"
                  target={target}
                  onObjectChange={onObjectChange}
                />
              </Canvas>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box className={styles.footerLabel}>
              <Typography>前面</Typography>
            </Box>
            <Box height={footerBoxH}>
              <Canvas
                orthographic
                camera={{
                  near,
                  far,
                  zoom,
                  up: new Vector3(0, 0, 1),
                  position: new Vector3(1, 0, 0),
                }}
                style={{ backgroundColor: 'black' }}
                resize={C_RESIZE}>
                {bgSub}
                <FLObjectControls
                  control="front"
                  target={target}
                  onObjectChange={onObjectChange}
                />
              </Canvas>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};
export default FLThreeEditor;
