import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@material-ui/icons/ArrowForwardIosOutlined';
import FormatShapesOutlinedIcon from '@material-ui/icons/FormatShapesOutlined';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';
import InputOutlinedIcon from '@material-ui/icons/InputOutlined';
import OpenWithOutlinedIcon from '@material-ui/icons/OpenWithOutlined';
import PhotoLibraryOutlinedIcon from '@material-ui/icons/PhotoLibraryOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import SettingsOverscanOutlinedIcon from '@material-ui/icons/SettingsOverscanOutlined';
import TouchAppOutlinedIcon from '@material-ui/icons/TouchAppOutlined';
import { useSnackbar } from 'notistack';
import React, { FC, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ToolBar from '../../../components/tool-bar';
import ToolBarButton, {
  ToolBarBoxButtonThemeProvider,
} from '../../../components/tool-bar-button';
import { ProjectRepositoryContext } from '../../../repositories/project-repository';
import TaskStore from '../../../stores/task-store';

const workspaceApi = window.workspace;

type Props = {};

const ThreeToolbar: FC<Props> = () => {
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
        <Box mr={2} />
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
        <Box mr={2} />
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
        <Box mr={2} />
        <ToolBarButton
          toolTip={t('toolBar-label__copyPrevFrameObject')}
          disabled={!multiFrame}
          icon={<InputOutlinedIcon />}
          onClick={() => {
            copyFrameTaskAnnotations();
            enqueueSnackbar(t('toolBar-message__copyPrevFrame'));
          }}
        />
        <Box mr={2} />
        <ToolBarButton
          toolTip={t('toolBar-label__save')}
          icon={<SaveOutlinedIcon />}
          onClick={() => {
            saveFrameTaskAnnotations();
            enqueueSnackbar(t('toolBar-message__save'));
          }}
        />
        <Box mr={2} />
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
      <Box flexGrow={1} />
      {showFramePaging && (
        <>
          <ToolBarButton
            toolTip={t('toolBar-label__movePrevFrame')}
            disabled={!onClickBackFrame}
            icon={<ArrowBackIosOutlinedIcon />}
            onClick={onClickBackFrame}
          />
          <Box minWidth={68} display="flex" justifyContent="center">
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
