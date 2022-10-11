import { TaskAnnotationVO } from '@fl-three-editor/types/vo';
import { Box, Grid } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import React from 'react';
import { Euler, Event, Group, Object3D } from 'three';
import FLCubes from './fl-cubes';
import FLObjectControls from './fl-object-controls';

const C_RESIZE = { debounce: 100 };
const ANNOTATION_OPACITY = 50;
const FOOTER_BOX_H = 240;

type Props = {
  frameNo: string;
  targetTaskAnnotation: TaskAnnotationVO;
  bgSub?: JSX.Element;
  onObjectChange?: (event: Event) => void;
};

const FlLabelSecondaryView: React.FC<Props> = ({
  frameNo,
  targetTaskAnnotation,
  bgSub,
  onObjectChange,
}) => {
  const [near, far] = React.useMemo(() => [0.03, 20], []);
  const cubeGroupRef = React.createRef<Group>();
  const [target, setTarget] = React.useState<Object3D>();

  const devMode = false;

  React.useEffect(() => {
    if (cubeGroupRef.current) {
      setTarget(cubeGroupRef.current.getObjectByName(targetTaskAnnotation.id));
    }
  }, [cubeGroupRef, targetTaskAnnotation]);

  return (
    <Grid container spacing={2} maxHeight={340} mb={2}>
      <Grid
        item
        xs={devMode ? 3 : 0}
        sx={{ display: devMode ? undefined : 'none' }}>
        <Canvas style={{ backgroundColor: 'black' }}>
          <FLCubes
            ref={cubeGroupRef}
            frameNo={frameNo}
            annotations={[targetTaskAnnotation]}
          />
        </Canvas>
      </Grid>
      <Grid item xs={devMode ? 3 : 4}>
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
      <Grid item xs={devMode ? 3 : 4}>
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
      <Grid item xs={devMode ? 3 : 4}>
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
