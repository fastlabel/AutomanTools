import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import FolderOpenIcon from '@material-ui/icons/FolderOpen';
import React, { FC, useCallback } from 'react';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { ApplicationConst } from '../../../application/const';
import WorkspaceContext from '../../../context/workspace';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      height: '100vh',
      width: '100vw',
    },
    main: {
      minHeight: 380,
    },
  })
);

const workspaceApi = window.workspace;

const StartPage: FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const workspaceStore = WorkspaceContext.useContainer();

  const onClickStartButton = useCallback(() => {
    // TODO check folder content and control moved page
    const selectFolder = workspaceApi.openFolderDialog();
    selectFolder.then((wkDir) => {
      if (!wkDir) return;
      workspaceStore.setWorkspaceFolder(wkDir);
      workspaceApi
        .exist({ wkDir, query: { meta: { project: true } } })
        .then((res) => {
          if (res.meta?.project) {
            history.push('/threeannotation');
            return;
          }
          history.push('/workspace');
        })
        .catch((err) => {
          // not exist meta/project.json
          history.push('/workspace');
        });
    });
  }, []);

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      className={classes.root}
      spacing={2}>
      <Grid item className={classes.main}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <Typography color="textSecondary" variant="h3">
              {ApplicationConst.name}
            </Typography>
            <Typography color="textSecondary" variant="h4"></Typography>
          </Grid>
          <Grid item>
            <Grid container>
              <Grid item xs={12}>
                <Grid container direction="column" spacing={1}>
                  <Grid item>
                    <Typography color="textSecondary" variant="h6">
                      開始
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<FolderOpenIcon />}
                      onClick={onClickStartButton}>
                      フォルダを開く
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              {/* <Grid item xs={6}>
                <Typography color="textSecondary" variant="h6">
                  最近
                </Typography>
              </Grid> */}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default StartPage;
