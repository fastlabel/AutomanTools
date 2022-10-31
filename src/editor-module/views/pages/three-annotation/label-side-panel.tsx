import ToolBar from '@fl-three-editor/components/tool-bar';
import ToolBarButton, {
  ToolBarBoxButtonThemeProvider,
} from '@fl-three-editor/components/tool-bar-button';
import TaskStore from '@fl-three-editor/stores/task-store';
import { ThreePoints } from '@fl-three-editor/types/vo';
import { FlCubeUtil } from '@fl-three-editor/utils/fl-cube-util';
import { InterpolationUtil } from '@fl-three-editor/utils/interpolation-util';
import { THREE_STYLES } from '@fl-three-editor/views/task-three/fl-const';
import FlLabelSecondaryView from '@fl-three-editor/views/task-three/fl-label-secondary-view';
import FLPcd from '@fl-three-editor/views/task-three/fl-pcd';
import ArrowBackIosOutlinedIcon from '@mui/icons-material/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Group } from 'three';
import { extractFlCubeObject3d } from '@fl-three-editor/views/task-three/fl-cube-model';

type Props = {
  framesObject: { [frameNo: string]: Group };
  framesPoints: { [frameNo: string]: ThreePoints };
  onUpdateFramesPoints: (framesPoints: {
    [frameNo: string]: ThreePoints;
  }) => void;
};

const LabelSidePanel: React.FC<Props> = ({
  framesObject,
  framesPoints,
  onUpdateFramesPoints,
}) => {
  const [t] = useTranslation();
  const {
    taskToolBar,
    labelViewState,
    taskFrames,
    movePageLabelView,
    moveFrameNoLabelView,
  } = TaskStore.useContainer();

  const [
    disabledBack,
    onClickBackFramePage,
    disabledNext,
    onClickNextFramePage,
  ] = React.useMemo(() => {
    let _disabledBack = false;
    let _disabledNext = false;
    let _currentPage = 0;
    if (labelViewState) {
      const { selectedPage, pageCount } = labelViewState;
      _disabledBack = selectedPage <= 1;
      _disabledNext = selectedPage >= pageCount;
      _currentPage = selectedPage;
    }
    return [
      _disabledBack,
      () => {
        movePageLabelView(_currentPage - 1);
      },
      _disabledNext,
      () => {
        movePageLabelView(_currentPage + 1);
      },
    ];
  }, [labelViewState, movePageLabelView]);

  return (
    <>
      <Stack height={'100vh'}>
        <ToolBar>
          <Box component="div" mr="auto" />
          <ToolBarBoxButtonThemeProvider>
            <ToolBarButton
              toolTip={t('toolBar-label__movePrevFrame')}
              disabled={disabledBack}
              icon={<ArrowBackIosOutlinedIcon />}
              onClick={onClickBackFramePage}
            />
            <Box
              component="div"
              minWidth={68}
              display="flex"
              justifyContent="center">
              <Typography variant="body1">
                {`${labelViewState?.selectedPage}/${labelViewState?.pageCount}`}
              </Typography>
            </Box>
            <ToolBarButton
              toolTip={t('toolBar-label__moveNextFrame')}
              disabled={disabledNext}
              icon={<ArrowForwardIosOutlinedIcon />}
              onClick={onClickNextFramePage}
            />
          </ToolBarBoxButtonThemeProvider>
        </ToolBar>

        <Stack
          px={1}
          minHeight="calc(100vh - 42px)"
          sx={{
            overflowY: 'scroll',
            backgroundColor: THREE_STYLES.baseBackgroundColor,
            color: '#fff',
          }}>
          {labelViewState?.pageFrames.map((frameNo) => {
            const taskFrame = taskFrames[frameNo];
            if (taskFrame.status === 'loaded') {
              return (
                <FlLabelSecondaryView
                  key={frameNo}
                  frameNo={frameNo}
                  selected={frameNo === labelViewState?.selectedFrame}
                  target={framesObject[frameNo]}
                  onClickCapture={(event, frameNo) => {
                    moveFrameNoLabelView(frameNo);
                  }}
                  bgSub={<FLPcd pcd={taskFrame.pcdResource} baseSize={0.3} />}
                  onObjectChange={(event, frameNo) => {
                    const changedObj = event.target.object;
                    const newPoints = FlCubeUtil.getPointsVo(changedObj);
                    const newFramesPoints = { ...framesPoints };
                    if (labelViewState && taskToolBar.interpolation) {
                      InterpolationUtil.interpolation3D(
                        frameNo,
                        labelViewState.target.pointsMeta,
                        newFramesPoints,
                        framesObject,
                        newPoints
                      );
                      onUpdateFramesPoints(newFramesPoints);
                    } else {
                      newFramesPoints[frameNo] = newPoints;
                    }
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
