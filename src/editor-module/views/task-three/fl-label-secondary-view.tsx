import { Box, Grid } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import { Euler, Event, Object3D } from 'three';
import FLObjectControls from './fl-object-controls';

const C_RESIZE = { debounce: 100 };
const ANNOTATION_OPACITY = 50;
const FOOTER_BOX_H = 240;

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
    <Grid container spacing={2} maxHeight={340} mb={2}>
      <Grid item xs={4}>
        <Box component="div" height={FOOTER_BOX_H}>
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
              annotationOpacity={ANNOTATION_OPACITY}
              control="top"
              target={target}
              onObjectChange={onObjectChange}
            />
          </Canvas>
        </Box>
      </Grid>
      <Grid item xs={4}>
        <Box component="div" height={FOOTER_BOX_H}>
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
              annotationOpacity={ANNOTATION_OPACITY}
              control="side"
              target={target}
              onObjectChange={onObjectChange}
            />
          </Canvas>
        </Box>
      </Grid>
      <Grid item xs={4}>
        <Box component="div" height={FOOTER_BOX_H}>
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
              annotationOpacity={ANNOTATION_OPACITY}
              control="front"
              target={target}
              onObjectChange={onObjectChange}
            />
          </Canvas>
        </Box>
      </Grid>
    </Grid>
  );
};
export default FlLabelSecondaryView;
