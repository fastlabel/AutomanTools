import { FormUtil } from '@fl-three-editor/components/fields/form-util';
import { FormAction, FormState } from '@fl-three-editor/components/fields/type';
import { ProjectRepositoryContext } from '@fl-three-editor/repositories/project-repository';
import { ProjectType } from '@fl-three-editor/types/const';
import { Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import React, { FC, Reducer, useEffect, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import WorkspaceForm, { WorkspaceFormState } from './form';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      backgroundColor: '#F5F5F5',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    },
    main: {
      width: '100%',
      maxWidth: 720,
      padding: 24,
      backgroundColor: '#FFF',
      borderRadius: 16,
    },
    item: {
      width: '100%',
    },
    itemGlow: {
      flexGrow: 1,
      width: '100%',
    },
  })
);

const formReducer: Reducer<FormState<WorkspaceFormState>, FormAction> = (
  state,
  action
) => {
  let newState: WorkspaceFormState = {};
  switch (action.type) {
    case 'change':
      newState = FormUtil.update(action.name, action.value, state.data);
      if (action.name === 'type') {
        newState = FormUtil.update('targets', [], newState);
      }
      if (newState.type && newState.targets && newState.targets.length > 0) {
        return { data: newState, helper: { validState: 'valid' } };
      } else {
        return { data: newState, helper: { validState: 'error' } };
      }
    case 'init':
      return { data: action.data, helper: {} };
  }
};

const NewPage: FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const [t] = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const search = useLocation().search;
  const queryParam = new URLSearchParams(search);
  const formStartPage = !queryParam.get('from');

  const projectRepository = React.useContext(ProjectRepositoryContext);

  const initialForm = {
    data: {
      workspaceFolder: '',
      type: ProjectType.pcd_only,
    },
    helper: {},
  };

  const [form, dispatchForm] = useReducer(formReducer, initialForm);

  const handleCreate = () => {
    projectRepository
      .create({ ...form.data, projectId: uuid().toString() } as any)
      .then(({ projectId, errorCode }) => {
        if (errorCode) {
          switch (errorCode) {
            default:
              enqueueSnackbar(errorCode, { variant: 'error' });
              return;
          }
        }
        history.push(`/threeannotation/${projectId}`);
      })
      .catch((err) => enqueueSnackbar(err, { variant: 'error' }));
  };

  const handleBack = () => {
    history.push('/');
  };

  useEffect(() => {
    //
  }, [form]);

  return (
    <Box component="div" className={classes.root}>
      <Grid
        container
        justifyContent="center"
        direction="column"
        spacing={2}
        className={classes.main}>
        <Grid item className={classes.item}>
          <Typography color="textSecondary" variant="h4">
            {t('web_new-header_label')}
          </Typography>
        </Grid>
        <Grid item className={classes.item}>
          <WorkspaceForm form={form} dispatchForm={dispatchForm} />
        </Grid>
        <Grid item className={classes.item}>
          <Grid container justifyContent="space-between">
            <Grid item>
              {formStartPage && (
                <Button onClick={handleBack}>
                  {t('web_workspaceForm-action_label__back')}
                </Button>
              )}
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                disabled={form.helper.validState !== 'valid'}
                color="primary"
                onClick={handleCreate}>
                {t('web_new-action_label_new')}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NewPage;
