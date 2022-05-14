import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import ArrowBackIosOutlinedIcon from '@mui/icons-material/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import FormatShapesOutlinedIcon from '@mui/icons-material/FormatShapesOutlined';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import InputOutlinedIcon from '@mui/icons-material/InputOutlined';
import OpenWithOutlinedIcon from '@mui/icons-material/OpenWithOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import SettingsOverscanOutlinedIcon from '@mui/icons-material/SettingsOverscanOutlined';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';
import { useSnackbar } from 'notistack';
import React, { FC, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ToolBar from '../../../components/tool-bar';
import ToolBarButton, {
  ToolBarBoxButtonThemeProvider,
} from '../../../components/tool-bar-button';
import { ProjectRepositoryContext } from '../../../repositories/project-repository';
import TaskStore from '../../../stores/task-store';

const ThreeToolbar: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [t] = useTranslation();
  const projectRepository = useContext(ProjectRepositoryContext);

  const {
    taskToolBar,
    taskRom,
    taskFrame,
    topicImageDialog,
    taskAnnotations,
    reopen,
    updateTaskToolBar,
    openImageDialog,
    changeFrame,
    saveFrameTaskAnnotations,
    copyFrameTaskAnnotations,
  } = TaskStore.useContainer();

  const [disabledBase, disabledShowTopicImageDialog, multiFrame] =
    useMemo(() => {
      if (taskRom.status === 'loaded') {
        return [
          false,
          taskRom.imageTopics.length === 0,
          taskRom.frames.length > 1,
        ];
      }
      return [true, true, false];
    }, [taskRom]);

  const [
    showFramePaging,
    currentFrameNo,
    totalFrameNo,
    onClickBackFrame,
    onClickNextFrame,
  ] = useMemo(() => {
    if (taskRom.status !== 'loaded' || taskFrame.status === 'none') {
      return [false, 0, 0, undefined, undefined];
    }
    const totalFrameNo = taskRom.frames.length;
    if (totalFrameNo === 1) {
      return [false, 1, 1, undefined, undefined];
    }
    const currentFrameNo = Number(taskFrame.currentFrame);
    const onClickBackFrame =
      taskFrame.status === 'loaded' && currentFrameNo !== 1
        ? () => {
            changeFrame(taskRom.frames[currentFrameNo - 2]);
          }
        : undefined;
    const onClickNextFrame =
      taskFrame.status === 'loaded' && currentFrameNo !== taskRom.frames.length
        ? () => {
            changeFrame(taskRom.frames[currentFrameNo]);
          }
        : undefined;
    return [
      true,
      currentFrameNo,
      totalFrameNo,
      onClickBackFrame,
      onClickNextFrame,
    ];
  }, [taskRom, taskFrame, changeFrame]);

  return (
    <ToolBar>
      <ToolBarBoxButtonThemeProvider>
        <ToolBarButton
          toolTip={t('toolBar-label__planView')}
          active={taskToolBar.useOrthographicCamera}
          icon={<SettingsOverscanOutlinedIcon />}
          onClick={() => {
            reopen();
            updateTaskToolBar((pre) => ({
              ...pre,
              useOrthographicCamera: !pre.useOrthographicCamera,
            }));
          }}
        />
        <Box component="div" mr={2} />
        <ToolBarButton
          toolTip={t('toolBar-label__selectMode_control')}
          active={taskToolBar.selectMode === 'control'}
          icon={<OpenWithOutlinedIcon />}
          onClick={() =>
            updateTaskToolBar((pre) => ({ ...pre, selectMode: 'control' }))
          }
        />
        <ToolBarButton
          toolTip={t('toolBar-label__selectMode_select')}
          active={taskToolBar.selectMode === 'select'}
          icon={<TouchAppOutlinedIcon />}
          onClick={() =>
            updateTaskToolBar((pre) => ({ ...pre, selectMode: 'select' }))
          }
        />
        <Box component="div" mr={2} />
        <ToolBarButton
          toolTip={t('toolBar-label__showLabel')}
          active={taskToolBar.showLabel}
          icon={<FormatShapesOutlinedIcon />}
          onClick={() =>
            updateTaskToolBar((pre) => ({
              ...pre,
              showLabel: !pre.showLabel,
            }))
          }
        />
        <ToolBarButton
          toolTip={t('toolBar-label__showImage')}
          disabled={disabledShowTopicImageDialog}
          active={topicImageDialog.open}
          icon={<PhotoLibraryOutlinedIcon />}
          onClick={() => openImageDialog(!topicImageDialog.open)}
        />
        <Box component="div" mr={2} />
        <ToolBarButton
          toolTip={t('toolBar-label__copyPrevFrameObject')}
          disabled={!multiFrame}
          icon={<InputOutlinedIcon />}
          onClick={() => {
            copyFrameTaskAnnotations();
            enqueueSnackbar(t('toolBar-message__copyPrevFrame'));
          }}
        />
        <Box component="div" mr={2} />
        <ToolBarButton
          toolTip={t('toolBar-label__save')}
          icon={<SaveOutlinedIcon />}
          onClick={() => {
            saveFrameTaskAnnotations();
            enqueueSnackbar(t('toolBar-message__save'));
          }}
        />
        <Box component="div" mr={2} />
        <ToolBarButton
          toolTip={t('toolBar-label__export')}
          icon={<GetAppOutlinedIcon />}
          onClick={() => {
            projectRepository
              .exportTaskAnnotations(taskAnnotations)
              .then((res) => {
                if (res.status === undefined) {
                  // clicked cancel
                  return;
                }
                if (res.status) {
                  enqueueSnackbar(
                    t('toolBar-message__export', { exportPath: res.path })
                  );
                } else {
                  enqueueSnackbar(res.message, { variant: 'error' });
                }
              });
          }}
        />
      </ToolBarBoxButtonThemeProvider>
      <Box component="div" flexGrow={1} />
      {showFramePaging && (
        <>
          <ToolBarButton
            toolTip={t('toolBar-label__movePrevFrame')}
            disabled={!onClickBackFrame}
            icon={<ArrowBackIosOutlinedIcon />}
            onClick={onClickBackFrame}
          />
          <Box
            component="div"
            minWidth={68}
            display="flex"
            justifyContent="center">
            <Typography variant="body1">
              {currentFrameNo}/{totalFrameNo}
            </Typography>
          </Box>
          <ToolBarButton
            toolTip={t('toolBar-label__moveNextFrame')}
            disabled={!onClickNextFrame}
            icon={<ArrowForwardIosOutlinedIcon />}
            onClick={onClickNextFrame}
          />
        </>
      )}
    </ToolBar>
  );
};

export default ThreeToolbar;
