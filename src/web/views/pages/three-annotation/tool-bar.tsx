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
import React, { FC, useMemo } from 'react';
import ToolBar from '../../../components/tool-bar';
import ToolBarButton, {
  ToolBarBoxButtonThemeProvider,
} from '../../../components/tool-bar-button';
import WorkspaceContext from '../../../context/workspace';
import TaskStore from '../../../stores/task-store';

const workspaceApi = window.workspace;

type Props = {};

const ThreeToolbar: FC<Props> = () => {
  const { enqueueSnackbar } = useSnackbar();
  const workspaceStore = WorkspaceContext.useContainer();

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
          toolTip="平面図表示"
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
            enqueueSnackbar('表示しているフレームにコピーしました');
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
        <Box mr={2} />
        <ToolBarButton
          toolTip="出力"
          icon={<GetAppOutlinedIcon />}
          onClick={() => {
            saveFrameTaskAnnotations();
            const date = new Date();
            const yyyy = `${date.getFullYear()}`;
            const MM = `0${date.getMonth() + 1}`.slice(-2);
            const dd = `0${date.getDate()}`.slice(-2);
            const HH = `0${date.getHours()}`.slice(-2);
            const mm = `0${date.getMinutes()}`.slice(-2);
            const ss = `0${date.getSeconds()}`.slice(-2);
            const ms = `00${date.getMilliseconds()}`.slice(-3);
            const fileName = `${workspaceStore.folderName}_${yyyy}${MM}${dd}${HH}${mm}${ss}${ms}.json`;
            workspaceApi
              .export({ fileName, dataJson: taskAnnotations })
              .then((res) => {
                if (res.status === undefined) {
                  // clicked cancel
                  return;
                }
                if (res.status) {
                  enqueueSnackbar(`${res.path}に出力しました。`);
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
