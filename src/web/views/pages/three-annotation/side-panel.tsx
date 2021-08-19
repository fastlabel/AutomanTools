import { Button, createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/Settings';
import { Resizable, ResizeCallback } from "re-resizable";
import React, { FC, useCallback, useMemo, useState } from "react";
import { useHistory } from 'react-router-dom';
import TaskStore from '../../../stores/task-store';
import ClassList from '../../annotation-classes/class-list';
import InstanceList from '../../annotation-classes/instance-list';

type PanelTitleProps = {
    title: string;
    titleItem?: JSX.Element;
};


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            height: '100vh'
        },
        flexGrow: {
            flexGrow: 1,
        },
        footer: {
            height: 60
        }
    })
);

type Props = {
    onConfigClassesClick: React.MouseEventHandler<HTMLButtonElement>;
};

const ThreeSidePanel: FC<Props> = ({ onConfigClassesClick }) => {
    const classes = useStyles();

    // TODO should move in index.
    const history = useHistory();

    const { taskRom, taskEditor, taskAnnotations, selectAnnotationClass, selectTaskAnnotations, saveFrameTaskAnnotations } = TaskStore.useContainer();

    const [width, setWidth] = useState<number>(360);
    const [height, setHeight] = useState<number>(180);

    const selectedTaskAnnotationIdSet = useMemo<Set<string>>(() => {
        if (taskEditor.editorState.mode === 'selecting_taskAnnotation') {
            return new Set<string>(taskEditor.editorState.selectingTaskAnnotations.map(a => a.id));
        }
        return new Set<string>();
    }, [taskEditor.editorState]);

    const selectedAnnotationClassId = useMemo<string>(() => {
        if (taskEditor.editorState.mode === 'selecting_annotationClass') {
            return taskEditor.editorState.selectingAnnotationClass.id;
        }
        return "";
    }, [taskEditor.editorState])

    const onLeftResizeStop = useCallback<ResizeCallback>((e, direction, ref, d) => {
        setWidth((width) => width + d.width);
    }, []);
    const onInstanceListTopResizeStop = useCallback<ResizeCallback>((e, direction, ref, d) => {
        setHeight((height) => height + d.height);
    }, []);

    const onClickAnnotationClass = useCallback((vo) => {
        selectAnnotationClass(vo);
    }, []);

    const onClickTaskAnnotation = useCallback((vo, mode) => {
        selectTaskAnnotations([vo], mode);
    }, []);

    const _PanelTitle: FC<PanelTitleProps> = ({ title, titleItem, children }) => {
        return (
            <Box>
                <List>
                    <ListItem dense>
                        <Box flexGrow={1}>
                            <Typography variant="subtitle2">{title}</Typography>
                        </Box>
                        {titleItem}
                    </ListItem>
                </List>
                {children}
            </Box>
        )
    }

    // TODO calc max size
    return (
        <Resizable
            size={{ width, height: '100%' }}
            enable={({ left: true })}
            onResizeStop={onLeftResizeStop}>
            <Grid container direction='column' className={classes.root}>
                <Grid item>
                    <Resizable
                        size={{ width: '100%', height }}
                        enable={({ bottom: true })}
                        onResizeStop={onInstanceListTopResizeStop}>
                        <_PanelTitle
                            title="アノテーションクラス"
                            titleItem={(<Box marginRight={0.5}><IconButton size="small" onClick={onConfigClassesClick}><SettingsIcon /></IconButton></Box>)}>
                            {taskRom.status === 'loaded' ? <ClassList classes={taskRom.annotationClasses} onClickItem={onClickAnnotationClass} selectedId={selectedAnnotationClassId} /> : <div />}
                        </_PanelTitle>
                    </Resizable>
                </Grid>
                <Divider />
                <Grid item className={classes.flexGrow}>
                    <_PanelTitle title="アノテーション" titleItem={(<Typography variant="body2" color="textSecondary">{`件数: ${taskAnnotations.length}`}</Typography>)}>
                        <InstanceList instances={taskAnnotations} selectedItems={selectedTaskAnnotationIdSet} onClickItem={onClickTaskAnnotation} />
                    </_PanelTitle>
                </Grid>
                <Divider />
                <Grid item className={classes.footer}>
                    <List>
                        <ListItem dense>
                            <Grid container spacing={2}>
                                <Grid item xs={6}><Button fullWidth variant="contained">取り消す</Button></Grid>
                                <Grid item xs={6}><Button fullWidth variant="contained" color="primary" onClick={() => saveFrameTaskAnnotations()}>保存</Button></Grid>
                            </Grid>
                        </ListItem>
                    </List>
                </Grid>
            </Grid>
        </Resizable>
    );
};

export default ThreeSidePanel;