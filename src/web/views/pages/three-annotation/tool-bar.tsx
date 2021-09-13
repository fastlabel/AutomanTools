import { Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@material-ui/icons/ArrowForwardIosOutlined';
import FormatShapesOutlinedIcon from '@material-ui/icons/FormatShapesOutlined';
import InputOutlinedIcon from '@material-ui/icons/InputOutlined';
import OpenWithOutlinedIcon from '@material-ui/icons/OpenWithOutlined';
import PhotoLibraryOutlinedIcon from '@material-ui/icons/PhotoLibraryOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import SettingsOverscanOutlinedIcon from '@material-ui/icons/SettingsOverscanOutlined';
import TouchAppOutlinedIcon from '@material-ui/icons/TouchAppOutlined';
import { useSnackbar } from 'notistack';
import React, { FC, useMemo } from 'react';
import ToolBar from '../../../components/tool-bar';
import ToolBarButton, {
  ToolBarBoxButtonThemeProvider,
} from '../../../components/tool-bar-button';
import TaskStore from '../../../stores/task-store';

type Props = {};

const ThreeToolbar: FC<Props> = () => {
  const { enqueueSnackbar } = useSnackbar();

  const {
    taskToolBar,
    taskRom,
    taskFrame,
    topicImageDialog,
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
          toolTip="平面図表示"
          active={taskToolBar.useOrthographicCamera}
          icon={<SettingsOverscanOutlinedIcon />}
          onClick={() =>
            updateTaskToolBar((pre) => ({
              ...pre,
              useOrthographicCamera: !pre.useOrthographicCamera,
            }))
          }
        />
        <Box mr={2} />
        <ToolBarButton
          toolTip="カメラのズーム・移動"
          active={taskToolBar.selectMode === 'control'}
          icon={<OpenWithOutlinedIcon />}
          onClick={() =>
            updateTaskToolBar((pre) => ({ ...pre, selectMode: 'control' }))
          }
        />
        <ToolBarButton
          toolTip="オブジェクトの選択"
          active={taskToolBar.selectMode === 'select'}
          icon={<TouchAppOutlinedIcon />}
          onClick={() =>
            updateTaskToolBar((pre) => ({ ...pre, selectMode: 'select' }))
          }
        />
        <Box mr={2} />
        <ToolBarButton
          toolTip="ラベル表示"
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
          toolTip="画像表示"
          disabled={disabledShowTopicImageDialog}
          active={topicImageDialog.open}
          icon={<PhotoLibraryOutlinedIcon />}
          onClick={() => openImageDialog(!topicImageDialog.open)}
        />
        <Box mr={2} />
        <ToolBarButton
          toolTip="前のフレームのオブジェクトをコピー"
          disabled={!multiFrame}
          icon={<InputOutlinedIcon />}
          onClick={() => {
            copyFrameTaskAnnotations();
            enqueueSnackbar('コピーしました');
          }}
        />
        <Box mr={2} />
        <ToolBarButton
          toolTip="保存"
          icon={<SaveOutlinedIcon />}
          onClick={() => {
            saveFrameTaskAnnotations();
            enqueueSnackbar('保存しました');
          }}
        />
      </ToolBarBoxButtonThemeProvider>
      <Box flexGrow={1} />
      {showFramePaging && (
        <>
          <ToolBarButton
            toolTip="前のフレームへ移動"
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
            toolTip="次のフレームへ移動"
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
