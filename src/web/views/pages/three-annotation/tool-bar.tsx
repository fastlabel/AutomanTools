import { createStyles, makeStyles, Theme, Typography } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@material-ui/icons/ArrowForwardIosOutlined';
import FormatShapesOutlinedIcon from '@material-ui/icons/FormatShapesOutlined';
import InputOutlinedIcon from '@material-ui/icons/InputOutlined';
import OpenWithOutlinedIcon from '@material-ui/icons/OpenWithOutlined';
import PhotoLibraryOutlinedIcon from '@material-ui/icons/PhotoLibraryOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import TouchAppOutlinedIcon from '@material-ui/icons/TouchAppOutlined';
import { useSnackbar } from 'notistack';
import React, { FC, useCallback, useMemo } from 'react';
import TaskStore from '../../../stores/task-store';

const theme = createTheme({
  overrides: {
    MuiIconButton: {
      root: {
        borderRadius: 'initial',
      },
    },
    MuiTouchRipple: {
      rippleVisible: {
        animation: 'initial',
      },
      child: {
        borderRadius: 'initial',
      },
    },
  },
});

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    icon: () => ({
      marginRight: theme.spacing(1),
    }),
  })
);

type ToolButtonProps = {
  toolTip: string;
  icon: JSX.Element;
  dense?: true;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
};

type Props = {};

const ThreeToolbar: FC<Props> = () => {
  const classes = useStyles();
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

  const _ToolButton: FC<ToolButtonProps> = useCallback(
    ({ toolTip, icon, dense, disabled, active, onClick }) => {
      const classes = useStyles();
      if (disabled) {
        return (
          <IconButton
            className={dense ? undefined : classes.icon}
            size="small"
            disabled={disabled}
            color={active ? 'primary' : 'default'}
            onClick={onClick}>
            {icon}
          </IconButton>
        );
      }
      return (
        <Tooltip title={toolTip} arrow>
          <IconButton
            className={dense ? undefined : classes.icon}
            size="small"
            disabled={disabled}
            color={active ? 'primary' : 'default'}
            onClick={onClick}>
            {icon}
          </IconButton>
        </Tooltip>
      );
    },
    []
  );

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
    <Box borderRight={'1px solid rgba(0, 0, 0, 0.12)'}>
      <List disablePadding>
        <ListItem dense>
          <ThemeProvider theme={theme}>
            <_ToolButton
              toolTip="カメラのズーム・移動"
              active={taskToolBar.selectMode === 'control'}
              icon={<OpenWithOutlinedIcon />}
              onClick={() =>
                updateTaskToolBar((pre) => ({ ...pre, selectMode: 'control' }))
              }
            />
            <_ToolButton
              toolTip="オブジェクトの選択"
              active={taskToolBar.selectMode === 'select'}
              icon={<TouchAppOutlinedIcon />}
              onClick={() =>
                updateTaskToolBar((pre) => ({ ...pre, selectMode: 'select' }))
              }
            />
            <Box mr={2} />
            <_ToolButton
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
            <_ToolButton
              toolTip="画像表示"
              disabled={disabledShowTopicImageDialog}
              active={topicImageDialog.open}
              icon={<PhotoLibraryOutlinedIcon />}
              onClick={() => openImageDialog(!topicImageDialog.open)}
            />
            <Box mr={2} />
            <_ToolButton
              toolTip="前のフレームのオブジェクトをコピー"
              disabled={!multiFrame}
              icon={<InputOutlinedIcon />}
              onClick={() => {
                copyFrameTaskAnnotations();
                enqueueSnackbar('コピーしました');
              }}
            />
            <Box mr={2} />
            <_ToolButton
              toolTip="保存"
              icon={<SaveOutlinedIcon />}
              onClick={() => {
                saveFrameTaskAnnotations();
                enqueueSnackbar('保存しました');
              }}
            />
          </ThemeProvider>
          <Box flexGrow={1} />
          {showFramePaging && (
            <>
              <_ToolButton
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
              <_ToolButton
                toolTip="次のフレームへ移動"
                disabled={!onClickNextFrame}
                icon={<ArrowForwardIosOutlinedIcon />}
                onClick={onClickNextFrame}
              />
            </>
          )}
        </ListItem>
      </List>
    </Box>
  );
};

export default ThreeToolbar;
