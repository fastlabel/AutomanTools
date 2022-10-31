import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import { Euler, Event, Object3D } from 'three';
import {
  LABEL_BOX_H,
  MAIN_C_RESIZE,
  ANNOTATION_OPACITY,
  THREE_SX_PROPS,
} from './fl-const';
import FLObjectControls from './fl-object-controls';

type Props = {
  frameNo: string;
  target: Object3D;
  onClickCapture: (event: Event, frameNo: string) => void;
  selected: boolean;
  bgSub?: JSX.Element;
  onObjectChange: (event: Event, frameNo: string) => void;
};

const FlLabelSecondaryView: React.FC<Props> = ({
  frameNo,
  target,
  onClickCapture,
  selected,
  bgSub,
  onObjectChange,
}) => {
  const [near, far] = React.useMemo(() => [0.03, 20], []);
  const handleObjectChange = React.useCallback(
    (event) => onObjectChange(event, frameNo),
    [frameNo, onObjectChange]
  );
  return (
    <Stack
      p={1}
      onClickCapture={(event) => {
        onClickCapture(event, frameNo);
      }}
      sx={{
        backgroundColor: selected ? '#595959' : undefined,
        ':hover': {
          backgroundColor: '#757575',
        },
      }}>
      <Typography>{frameNo}</Typography>
      <Grid container spacing={2} maxHeight={340} mb={2}>
        <Grid item xs={4}>
          <Box component="div" height={LABEL_BOX_H}>
            <Canvas
              orthographic
              camera={{
                near,
                far,
                rotation: new Euler(0, 0, 0, 'ZXY'),
              }}
              style={THREE_SX_PROPS.canvasSx}
              resize={MAIN_C_RESIZE}>
              {bgSub}
              <FLObjectControls
                annotationOpacity={ANNOTATION_OPACITY}
                control="top"
                target={target}
                onObjectChange={handleObjectChange}
              />
            </Canvas>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box component="div" height={LABEL_BOX_H}>
            <Canvas
              orthographic
              camera={{
                near,
                far,
                rotation: new Euler(0, 0, 0, 'ZXY'),
              }}
              style={THREE_SX_PROPS.canvasSx}
              resize={MAIN_C_RESIZE}>
              {bgSub}
              <FLObjectControls
                annotationOpacity={ANNOTATION_OPACITY}
                control="side"
                target={target}
                onObjectChange={handleObjectChange}
              />
            </Canvas>
          </Box>
        </Grid>
        <Grid item xs={4}>
          <Box component="div" height={LABEL_BOX_H}>
            <Canvas
              orthographic
              camera={{
                near,
                far,
                rotation: new Euler(0, 0, 0, 'ZXY'),
              }}
              style={THREE_SX_PROPS.canvasSx}
              resize={MAIN_C_RESIZE}>
              {bgSub}
              <FLObjectControls
                annotationOpacity={ANNOTATION_OPACITY}
                control="front"
                target={target}
                onObjectChange={handleObjectChange}
              />
            </Canvas>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
};
export default FlLabelSecondaryView;
