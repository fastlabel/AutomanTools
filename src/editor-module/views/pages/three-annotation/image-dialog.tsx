import ArrowBackIosOutlinedIcon from '@mui/icons-material/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { Canvas, useThree } from '@react-three/fiber';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Texture, TextureLoader } from 'three';
import DraggablePopover from '../../../components/draggable-popover';
import ToolBar from '../../../components/tool-bar';
import CameraCalibrationStore from '../../../stores/camera-calibration-store';
import TaskStore from '../../../stores/task-store';
import FLCubes from '../../task-three/fl-cubes';

const useStyles = makeStyles(() =>
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

const ImagePopover: FC = () => {
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
          <Box component="div" width={state.width} height={state.height}>
            <Canvas camera={calibrationCamera} resize={{ debounce: 500 }}>
              <_SceneBackground tex={state.tex} />
              <FLCubes frameNo={frameNo} annotations={taskAnnotations} />
            </Canvas>
          </Box>
          {topicImageDialog.hasPrev && (
            <Box component="div" className={styles.prevButton} m={0}>
              <Box component="div" height={48}>
                <IconButton
                  aria-label="image-popover-prev"
                  onClick={() => moveTopicImage('prev')}
                  size="large">
                  <ArrowBackIosOutlinedIcon />
                </IconButton>
              </Box>
            </Box>
          )}
          {topicImageDialog.hasNext && (
            <Box component="div" className={styles.nextButton} m={0}>
              <Box component="div" height={48}>
                <IconButton
                  aria-label="image-popover-next"
                  onClick={() => moveTopicImage('next')}
                  size="large">
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
