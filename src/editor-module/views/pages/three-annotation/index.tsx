import Grid from '@mui/material/Grid';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { useParams } from 'react-router-dom';
import TaskStore, { TaskEditorViewMode } from '@fl-three-editor/stores/task-store';
import BaseViewIndex from './base-view-index';
import ClassListDialog from './class-list-dialog';
import ImageDialog from './image-dialog';
import LabelViewIndex from './label-view-index';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
      height: (props: Props) => props.height || '100vh',
      width: '100vw',
    },
  })
);

type Props = {
  height?: '100%' | '100vh';
};

const ThreeAnnotationPage: React.FC<Props> = (props) => {
  const [windowWidth, setWindowWidth] = React.useState(0);
  const classes = useStyles(props);
  const { projectId } = useParams<{ projectId: string }>();
  const [initialed, setInitialed] = React.useState(false);

  const { open, taskEditorViewMode } = TaskStore.useContainer();

  React.useEffect(() => {
    const onWindowResize = () => {
      setWindowWidth(window.innerWidth);
    };
    setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onWindowResize);

    return () => window.removeEventListener('resize', onWindowResize);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // initialize Editor
  React.useEffect(() => {
    const taskId = '';
    setInitialed(false);
    open(projectId, taskId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  return (
    <React.Fragment>
      <Grid container className={classes.root}>
        {taskEditorViewMode === TaskEditorViewMode.base__normal && (
          <BaseViewIndex
            windowWidth={windowWidth}
            initialed={initialed}
            setInitialed={setInitialed}
          />
        )}
        {taskEditorViewMode === TaskEditorViewMode.anno__multi_frame_view && (
          <LabelViewIndex />
        )}
      </Grid>
      <ClassListDialog />
      <ImageDialog />
    </React.Fragment>
  );
};

export default ThreeAnnotationPage;
