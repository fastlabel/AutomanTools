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
  bgSub?: JSX.Element;
  onObjectChange?: (event: Event) => void;
};

const FlLabelSecondaryView: React.FC<Props> = ({
  frameNo,
  target,
  bgSub,
  onObjectChange,
}) => {
  const [near, far] = React.useMemo(() => [0.03, 20], []);

  return (
    <Stack>
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
                onObjectChange={onObjectChange}
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
                onObjectChange={onObjectChange}
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
                onObjectChange={onObjectChange}
              />
            </Canvas>
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
};
export default FlLabelSecondaryView;
