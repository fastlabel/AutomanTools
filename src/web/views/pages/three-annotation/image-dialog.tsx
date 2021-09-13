import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@material-ui/icons/ArrowForwardIosOutlined';
import { Canvas, useThree } from '@react-three/fiber';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { PerspectiveCamera, Texture, TextureLoader } from 'three';
import DraggablePopover from '../../../components/draggable-popover';
import ToolBar from '../../../components/tool-bar';
import CameraCalibrationStore from '../../../stores/camera-calibration-store';
import TaskStore from '../../../stores/task-store';
import FLCubes from '../../task-three/fl-cubes';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    prevButton: {
      display: 'flex',
      position: 'absolute',
      height: '100%',
      alignItems: 'center',
      top: 0,
      left: 0,
    },
    nextButton: {
      display: 'flex',
      position: 'absolute',
      height: '100%',
      alignItems: 'center',
      top: 0,
      right: 0,
    },
  })
);

type LocalState = {
  open: boolean;
  width: number;
  height: number;
  tex?: Texture;
};

type SceneBackgroundProps = {
  tex?: Texture;
};

const _SceneBackground: FC<SceneBackgroundProps> = ({ tex }) => {
  const { gl, scene } = useThree();
  useEffect(() => {
    scene.background = tex || null;
  }, [tex]);
  return <></>;
};

type Props = {
  calibrationCamera?: PerspectiveCamera;
};

const ImagePopover: FC<Props> = ({ }) => {
  const styles = useStyles();

  const [state, setState] = useState<LocalState>({
    open: false,
    width: 0,
    height: 0,
  });

  const { taskAnnotations, taskFrame, topicImageDialog, moveTopicImage } =
    TaskStore.useContainer();

  const { open, setOpen, calibrationCamera } =
    CameraCalibrationStore.useContainer();

  useEffect(() => {
    if (topicImageDialog.open) {
      new TextureLoader().load(topicImageDialog.currentImageData, (tex) => {
        const imageAspect = tex.image ? tex.image.width / tex.image.height : 1;
        const width = 800;
        const height = width / imageAspect;
        setState({ open: true, width, height, tex });
      });
      return;
    }
    setState({
      open: false,
      width: 0,
      height: 0,
    });
  }, [topicImageDialog]);

  const frameNo = useMemo(() => {
    if (taskFrame.status === 'loaded') {
      return taskFrame.currentFrame;
    }
    return '';
  }, [taskFrame]);

  return (
    <DraggablePopover handle=".imageToolBar" open={topicImageDialog.open}>
      <ToolBar
        className="imageToolBar"
        style={{ cursor: 'move', minHeight: 38 }}>
        {/* <ToolBarButton
          toolTip="キャリブレーション調整"
          icon={<SettingsOutlinedIcon />}
          onClick={() => setOpen((pre) => !pre)}
          active={open}
        /> */}
      </ToolBar>
      {topicImageDialog.open && (
        <>
          <Box width={state.width} height={state.height}>
            <Canvas camera={calibrationCamera} resize={{ debounce: 500 }}>
              <_SceneBackground tex={state.tex} />
              <FLCubes frameNo={frameNo} annotations={taskAnnotations} />
            </Canvas>
          </Box>
          {topicImageDialog.hasPrev && (
            <Box className={styles.prevButton} m={0}>
              <Box height={48}>
                <IconButton
                  aria-label="image-popover-prev"
                  onClick={() => moveTopicImage('prev')}>
                  <ArrowBackIosOutlinedIcon />
                </IconButton>
              </Box>
            </Box>
          )}
          {topicImageDialog.hasNext && (
            <Box className={styles.nextButton} m={0}>
              <Box height={48}>
                <IconButton
                  aria-label="image-popover-next"
                  onClick={() => moveTopicImage('next')}>
                  <ArrowForwardIosOutlinedIcon />
                </IconButton>
              </Box>
            </Box>
          )}
        </>
      )}
    </DraggablePopover>
  );
};

export default ImagePopover;
