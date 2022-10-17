import ArrowBackIosOutlinedIcon from '@mui/icons-material/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import React from 'react';
import TaskStore from '@fl-three-editor/stores/task-store';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import FlLabelSecondaryView from '@fl-three-editor/views/task-three/fl-label-secondary-view';
import FLPcd from '@fl-three-editor/views/task-three/fl-pcd';
import { Group } from 'three';
import Typography from '@mui/material/Typography';
import ToolBarButton, {
  ToolBarBoxButtonThemeProvider,
} from '@fl-three-editor/components/tool-bar-button';
import ToolBar from '@fl-three-editor/components/tool-bar';
import { useTranslation } from 'react-i18next';
import { THREE_STYLES } from '@fl-three-editor/views/task-three/fl-const';

type Props = {
  framesObject: { [frameNo: string]: Group };
};

const LabelSidePanel: React.FC<Props> = ({ framesObject }) => {
  const [t] = useTranslation();
  const { labelViewState, taskFrames, movePageLabelView } =
    TaskStore.useContainer();

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
          px={2}
          pt={1}
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
