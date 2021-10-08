import { Button, createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import SettingsIcon from '@material-ui/icons/Settings';
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import { useSnackbar } from 'notistack';
import { Resizable, ResizeCallback } from 're-resizable';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import TaskStore from '../../../stores/task-store';
import ClassList from '../../annotation-classes/class-list';
import InstanceList from '../../annotation-classes/instance-list';

type PanelTitleProps = {
  title: string;
  filterButton?: JSX.Element;
  titleItem?: JSX.Element;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: '100%',
    },
    annotationClasses: {
      overflowY: 'auto',
      overflowX: 'hidden',
    },
    taskAnnotation: {
      flexGrow: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
    },
    footer: {
      height: 60,
    },
  })
);

type Props = {
  onConfigClassesClick: React.MouseEventHandler<HTMLButtonElement>;
};

const ThreeSidePanel: FC<Props> = ({ onConfigClassesClick }) => {
  const classes = useStyles();

  // TODO should move in index.
  const history = useHistory();
  const [t] = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const {
    taskRom,
    taskFrame,
    taskEditor,
    taskAnnotations,
    editingTaskAnnotation,
    selectAnnotationClass,
    selectTaskAnnotations,
    saveFrameTaskAnnotations,
    updateTaskAnnotations,
  } = TaskStore.useContainer();

  const [width, setWidth] = useState<number>(360);
  const [height, setHeight] = useState<number>(240);

  const [taskAnnotationFilterAll, setTaskAnnotationFilterAll] =
    useState<boolean>(false);

  const multiFrame = useMemo(() => {
    if (taskRom.status === 'loaded') {
      return taskRom.frames.length > 1;
    }
    return false;
  }, [taskRom]);

  const selectedTaskAnnotationIdSet = useMemo<Set<string>>(() => {
    if (taskEditor.editorState.mode === 'selecting_taskAnnotation') {
      return new Set<string>(
        taskEditor.editorState.selectingTaskAnnotations.map((a) => a.id)
      );
    }
    return new Set<string>();
  }, [taskEditor.editorState]);

  const selectedAnnotationClassId = useMemo<string>(() => {
    if (taskEditor.editorState.mode === 'selecting_annotationClass') {
      return taskEditor.editorState.selectingAnnotationClass.id;
    }
    return '';
  }, [taskEditor.editorState]);

  const frameNo = useMemo<string>(() => {
    if (taskFrame.status === 'loaded') {
      return taskFrame.currentFrame;
    }
    return '';
  }, [taskFrame]);

  const taskAnnotationHeight = useMemo(() => {
    return height + 62 + 39;
  }, [height]);

  const filteredTaskAnnotations = useMemo(() => {
    if (taskAnnotationFilterAll) {
      return taskAnnotations;
    }
    return taskAnnotations.filter((vo) => vo.points[frameNo]);
  }, [frameNo, taskAnnotations, taskAnnotationFilterAll]);

  const onLeftResizeStop = useCallback<ResizeCallback>(
    (e, direction, ref, d) => {
      setWidth((width) => width + d.width);
    },
    []
  );
  const onInstanceListTopResizeStop = useCallback<ResizeCallback>(
    (e, direction, ref, d) => {
      setHeight((height) => height + d.height);
    },
    []
  );

  const onClickAnnotationClass = useCallback((vo) => {
    selectAnnotationClass(vo);
  }, []);

  const onClickTaskAnnotation = useCallback((vo, mode) => {
    selectTaskAnnotations([vo], mode);
  }, []);

  const _PanelTitle: FC<PanelTitleProps> = ({
    title,
    titleItem,
    filterButton,
    children,
  }) => {
    return (
      <Box>
        <List>
          <ListItem dense>
            <Box flexGrow={1}>
              <Typography variant="subtitle2">{title}</Typography>
            </Box>
            {titleItem}
          </ListItem>
          {filterButton}
        </List>
        {children}
      </Box>
    );
  };

  // TODO calc max size
  return (
    <Resizable
      size={{ width, height: '100%' }}
      enable={{ left: false }}
      onResizeStop={onLeftResizeStop}>
      <Grid container direction="column" className={classes.root}>
        <Grid
          item
          className={classes.annotationClasses}
          style={{ height: height + 5 }}>
          <Resizable
            size={{ width: '100%', height }}
            enable={{ bottom: true }}
            onResizeStop={onInstanceListTopResizeStop}>
            <_PanelTitle
              title={t('sidePanel-header_label__annotationClasses')}
              titleItem={
                <Box marginRight={0.5}>
                  <IconButton size="small" onClick={onConfigClassesClick}>
                    <SettingsIcon />
                  </IconButton>
                </Box>
              }>
              {taskRom.status === 'loaded' ? (
                <ClassList
                  classes={taskRom.annotationClasses}
                  onClickItem={onClickAnnotationClass}
                  selectedId={selectedAnnotationClassId}
                />
              ) : (
                <div />
              )}
            </_PanelTitle>
          </Resizable>
        </Grid>
        <Divider />
        <Grid
          item
          className={classes.taskAnnotation}
          style={{ maxHeight: `calc(100vh - ${taskAnnotationHeight}px)` }}>
          <_PanelTitle
            title={t('sidePanel-header_label__taskAnnotation')}
            filterButton={
              multiFrame ? (
                <ListItem dense>
                  <Button
                    variant="outlined"
                    size="small"
                    color="primary"
                    onClick={() => setTaskAnnotationFilterAll((pre) => !pre)}
                    startIcon={
                      taskAnnotationFilterAll ? (
                        <VisibilityOutlinedIcon />
                      ) : (
                        <VisibilityOffOutlinedIcon />
                      )
                    }>
                    {t('sidePanel-action_label__otherFrameFilter')}
                  </Button>
                </ListItem>
              ) : undefined
            }
            titleItem={
              <Typography variant="body2" color="textSecondary">
                {t('sidePanel-count_label__taskAnnotation', {
                  taskCount: String(filteredTaskAnnotations.length),
                })}
              </Typography>
            }>
            <InstanceList
              editingTaskAnnotation={editingTaskAnnotation}
              frameNo={frameNo}
              instances={filteredTaskAnnotations}
              multiFrame={multiFrame}
              selectedItems={selectedTaskAnnotationIdSet}
              onClickItem={onClickTaskAnnotation}
              onUpdateTaskAnnotation={updateTaskAnnotations}
            />
          </_PanelTitle>
        </Grid>
        <Divider />
        <Grid item className={classes.footer}>
          <List>
            <ListItem dense>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => history.push('/')}>
                    {t('sidePanel-action_label__cancel')}
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      saveFrameTaskAnnotations();
                      enqueueSnackbar(t('sidePanel-message__save'));
                    }}>
                    {t('sidePanel-action_label__save')}
                  </Button>
                </Grid>
              </Grid>
            </ListItem>
          </List>
        </Grid>
      </Grid>
    </Resizable>
  );
};

export default ThreeSidePanel;
