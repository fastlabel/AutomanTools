import React from 'react';
import TaskStore from '@fl-three-editor/stores/task-store';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import FlLabelSecondaryView from '@fl-three-editor/views/task-three/fl-label-secondary-view';
import FLPcd from '@fl-three-editor/views/task-three/fl-pcd';
import { Group } from 'three';

type Props = {
  framesObject: { [frameNo: string]: Group };
};

const LabelSidePanel: React.FC<Props> = ({ framesObject }) => {
  const { labelViewState, taskFrames } = TaskStore.useContainer();
  return (
    <>
      <Stack height={'100vh'}>
        <Box component="div">
          {`${labelViewState?.selectedPage}/${labelViewState?.pageCount}`}
        </Box>
        <Box component="div">
          {`${labelViewState?.selectedFrame}/${labelViewState?.pageFrameCount}`}
        </Box>
        <Box component="div">{`${labelViewState?.pageFrames}`}</Box>
        <Stack px={2} sx={{ overflowY: 'scroll' }}>
          {labelViewState?.pageFrames.map((frameNo) => {
            const taskFrame = taskFrames[frameNo];
            if (taskFrame.status === 'loaded') {
              return (
                <FlLabelSecondaryView
                  key={frameNo}
                  frameNo={frameNo}
                  target={framesObject[frameNo]}
                  bgSub={<FLPcd pcd={taskFrame.pcdResource} baseSize={0.3} />}
                  onObjectChange={(event) => {
                    //
                  }}
                />
              );
            }
            return <Box key={frameNo} component="div" height={240} />;
          })}
        </Stack>
      </Stack>
    </>
  );
};
export default LabelSidePanel;
