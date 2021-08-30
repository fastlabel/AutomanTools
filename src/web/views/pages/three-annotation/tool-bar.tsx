import { createStyles, makeStyles, Theme, Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import ArrowBackIosOutlinedIcon from '@material-ui/icons/ArrowBackIosOutlined';
import ArrowForwardIosOutlinedIcon from '@material-ui/icons/ArrowForwardIosOutlined';
import FormatShapesOutlinedIcon from '@material-ui/icons/FormatShapesOutlined';
import OpenWithOutlinedIcon from '@material-ui/icons/OpenWithOutlined';
import PhotoLibraryOutlinedIcon from '@material-ui/icons/PhotoLibraryOutlined';
import SaveOutlinedIcon from '@material-ui/icons/SaveOutlined';
import TouchAppOutlinedIcon from '@material-ui/icons/TouchAppOutlined';
import React, { FC, useCallback, useMemo } from "react";
import TaskStore from '../../../stores/task-store';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        icon: () => ({
            marginRight: theme.spacing(1)
        })
    }),
);

type ToolButtonProps = {
    toolTip: string;
    icon: JSX.Element;
    disabled?: boolean;
    active?: boolean;
    onClick?: () => void
};

type Props = {

};

const ThreeToolbar: FC<Props> = () => {
    const classes = useStyles();
    const { taskToolBar, taskRom, taskFrame, topicImageDialog, updateTaskToolBar, openImageDialog, changeFrame, saveFrameTaskAnnotations } = TaskStore.useContainer();

    const [disabledBase, disabledShowTopicImageDialog] = useMemo(() => {
        if (taskRom.status === 'loaded') {
            return [false, taskRom.imageTopics.length === 0];
        }
        return [true, true];
    }, [taskRom])

    const _ToolButton: FC<ToolButtonProps> = useCallback(({ toolTip, icon, disabled, active, onClick }) => {
        const classes = useStyles();
        return (
            <Tooltip title={toolTip} arrow>
                <IconButton className={classes.icon} size="small" disabled={disabled} color={active ? "primary" : "default"} onClick={onClick}>
                    {icon}
                </IconButton>
            </Tooltip>
        )
    }, []);

    const [showFramePaging, currentFrameNo, totalFrameNo, onClickBackFrame, onClickNextFrame] = useMemo(() => {
        if (taskRom.status !== 'loaded' || taskFrame.status !== 'loaded') {
            return [false, 0, 0, undefined, undefined];
        }
        const totalFrameNo = taskRom.frames.length;
        if (totalFrameNo === 1) {
            return [false, 1, 1, undefined, undefined];
        }
        const currentFrameNo = Number(taskFrame.currentFrame);
        return [true, currentFrameNo, totalFrameNo, () => {
            changeFrame(taskRom.frames[currentFrameNo - 2]);
        }, () => {
            changeFrame(taskRom.frames[currentFrameNo]);
        }];
    }, [taskRom, taskFrame, changeFrame]);

    return (
        <Paper>
            <List disablePadding>
                <ListItem dense>
                    <_ToolButton toolTip="" active={taskToolBar.selectMode === 'control'} icon={(<OpenWithOutlinedIcon />)} onClick={() => updateTaskToolBar(pre => ({ ...pre, selectMode: 'control' }))} />
                    <_ToolButton toolTip="" active={taskToolBar.selectMode === 'select'} icon={(<TouchAppOutlinedIcon />)} onClick={() => updateTaskToolBar(pre => ({ ...pre, selectMode: 'select' }))} />
                    <Box mr={2} />
                    <_ToolButton toolTip="" active={taskToolBar.showLabel} icon={(<FormatShapesOutlinedIcon />)} onClick={() => updateTaskToolBar(pre => ({ ...pre, showLabel: !pre.showLabel }))} />
                    <_ToolButton toolTip="" disabled={disabledShowTopicImageDialog} active={topicImageDialog.open} icon={(<PhotoLibraryOutlinedIcon />)} onClick={() => openImageDialog(!topicImageDialog.open)} />
                    <Box mr={2} />
                    <_ToolButton toolTip="" icon={(<SaveOutlinedIcon />)} onClick={() => saveFrameTaskAnnotations()} />
                    <Box flexGrow={1} />
                    {showFramePaging &&
                        (<>
                            <_ToolButton toolTip="" disabled={currentFrameNo === 1} icon={(<ArrowBackIosOutlinedIcon />)} onClick={onClickBackFrame} />
                            <Box minWidth={68} display='flex' justifyContent='center'>
                                <Typography variant="body1">{currentFrameNo}/{totalFrameNo}</Typography>
                            </Box>
                            <_ToolButton toolTip="" disabled={currentFrameNo === totalFrameNo} icon={(<ArrowForwardIosOutlinedIcon />)} onClick={onClickNextFrame} />
                        </>)
                    }
                </ListItem>
            </List>
        </Paper>);
};

export default ThreeToolbar;