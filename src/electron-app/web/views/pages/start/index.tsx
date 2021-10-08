import { ApplicationConst } from '@fl-three-editor/application/const';
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
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import WorkspaceContext from '../../../context/workspace';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      height: '100%',
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
  const [t] = useTranslation();
  const workspaceStore = WorkspaceContext.useContainer();

  const onClickStartButton = useCallback(() => {
    // TODO check folder content and control moved page
    const selectFolder = workspaceApi.openFolderDialog();
    selectFolder.then((wkDir) => {
      if (!wkDir) return;
      workspaceStore.setWorkspaceFolder(wkDir);
      workspaceApi
        .load({ wkDir, query: { meta: { project: true } } })
        .then((res) => {
          if (res.meta?.project) {
            const projectId = res.meta?.project.projectId;
            history.push(`/threeannotation/${projectId}`);
            return;
          }
          history.push('/workspace?from=');
        })
        .catch((err) => {
          // not exist meta/project.json
          history.push('/workspace?from=');
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
                      {t('app_start-header_label__open')}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<FolderOpenIcon />}
                      onClick={onClickStartButton}>
                      {t('app_start-header_action_label__folder_open')}
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
