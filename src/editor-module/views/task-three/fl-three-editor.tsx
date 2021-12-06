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
import { useTranslation } from 'react-i18next';
import { Euler, Event, Group, Object3D, Vector3 } from 'three';
import { PCDResult } from '../../types/labos';
import { AnnotationClassVO, TaskAnnotationVO } from '../../types/vo';
import FLCubes from './fl-cubes';
import { FlMainCameraControls } from './fl-main-camera-controls';
import FLMainControls from './fl-main-controls';
import FLObjectControls from './fl-object-controls';
import FLPcd from './fl-pcd';

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
  useOrthographicCamera?: true | undefined;
  selectable: boolean;
  showLabel: boolean;
  mainControlsRef?: React.RefObject<FlMainCameraControls>;
  cubeGroupRef?: React.RefObject<Group>;
  pcd?: PCDResult;
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
const C_DISTANCE = 5;

const FLThreeEditor: FC<Props> = ({
  frameNo,
  annotations,
  useOrthographicCamera,
  selectable,
  showLabel,
  mainControlsRef,
  cubeGroupRef,
  pcd,
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
  const [t] = useTranslation();
  const [near, far, zoom] = useMemo(() => [0.03, 20, 10], []);
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
  const orthographic = !!useOrthographicCamera;
  return (
    <div className={styles.root} ref={rootRef}>
      <Box flexGrow={1} mt={2} mr={2} ml={2} mb={1}>
        <Canvas
          orthographic={orthographic}
          camera={{
            fov: 50,
            up: new Vector3(0, 0, 1),
            rotation: new Euler(0, 0, 0, 'ZXY'),
            zoom: orthographic ? 10 : undefined,
          }}
          style={{ backgroundColor: 'black' }}
          resize={C_RESIZE}>
          <FLMainControls
            orthographic={orthographic}
            position0={position0}
            preObject={preObject}
            mainControlsRef={mainControlsRef}
            onPutObject={onPutObject}
          />
          {pcd ? (
            <FLPcd pcd={pcd} baseSize={orthographic ? 0.3 : 0.015} />
          ) : (
            bgSub
          )}
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
              <Typography>{t('flThreeEditor-label__top')}</Typography>
            </Box>
            <Box height={footerBoxH}>
              <Canvas
                orthographic
                camera={{
                  near,
                  far,
                  rotation: new Euler(0, 0, 0, 'ZXY'),
                }}
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
              <Typography>{t('flThreeEditor-label__side')}</Typography>
            </Box>
            <Box height={footerBoxH}>
              <Canvas
                orthographic
                camera={{
                  near,
                  far,
                  rotation: new Euler(0, 0, 0, 'ZXY'),
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
              <Typography>{t('flThreeEditor-label__front')}</Typography>
            </Box>
            <Box height={footerBoxH}>
              <Canvas
                orthographic
                camera={{
                  near,
                  far,
                  rotation: new Euler(0, 0, 0, 'ZXY'),
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