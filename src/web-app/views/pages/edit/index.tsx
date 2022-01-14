import { FormUtil } from '@fl-three-editor/components/fields/form-util';
import { FormAction, FormState } from '@fl-three-editor/components/fields/type';
import { ProjectRepositoryContext } from '@fl-three-editor/repositories/project-repository';
import { ProjectType } from '@fl-three-editor/types/const';
import {
  AnnotationClassVO,
  TaskAnnotationOriginVO,
  TaskAnnotationVO,
} from '@fl-three-editor/types/vo';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { useSnackbar } from 'notistack';
import React, { FC, Reducer, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { ProjectWebRepository } from '../../../repositories/project-web-repository';
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

const isTaskAnnotations = (arrays: any[]) => {
  if (!(arrays && typeof arrays.length === 'number')) {
    // is Array
    return false;
  }
  if (arrays && arrays.length > 0) {
    const item = arrays[0];
    return (
      typeof item['id'] === 'string' &&
      typeof item['annotationClassId'] === 'string' &&
      typeof item['points'] === 'object'
    );
  }
  return true;
};

const isAnnotationClasses = (arrays: any[]) => {
  if (!(arrays && typeof arrays.length === 'number')) {
    // is Array
    return false;
  }
  if (arrays && arrays.length > 0) {
    const item = arrays[0];
    return (
      typeof item['id'] === 'string' &&
      typeof item['type'] === 'string' &&
      typeof item['title'] === 'string' &&
      typeof item['value'] === 'string' &&
      typeof item['color'] === 'string' &&
      typeof item['defaultSize'] === 'object' &&
      typeof item['createdAt'] === 'string' &&
      typeof item['updatedAt'] === 'string'
    );
  }
  // annotationClasses is required!!
  return false;
};

const readJson = (files: File[]) => {
  return new Promise<{
    annotationClasses?: AnnotationClassVO[];
    taskAnnotations?: TaskAnnotationVO[];
  }>((resolve, reject) => {
    const result: {
      annotationClasses?: AnnotationClassVO[];
      taskAnnotations?: TaskAnnotationVO[];
    } = {};
    Promise.all(
      files.map((f) => {
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev: ProgressEvent<FileReader>) => {
            if (!ev.target) return;
            const jsonObj = JSON.parse(ev.target.result as string);
            if (isAnnotationClasses(jsonObj)) {
              result.annotationClasses = jsonObj;
            } else if (isTaskAnnotations(jsonObj)) {
              result.taskAnnotations = jsonObj;
            } else if (
              jsonObj &&
              isAnnotationClasses(jsonObj.annotationClasses) &&
              isTaskAnnotations(jsonObj.taskAnnotations)
            ) {
              result.annotationClasses = jsonObj.annotationClasses;
              result.taskAnnotations = jsonObj.taskAnnotations;
            }
            resolve();
          };
          reader.readAsText(f, 'UTF-8');
        });
      })
    ).then(() => {
      resolve(result);
    });
  });
};

const formReducerFactory: (
  setEditResource: React.Dispatch<
    React.SetStateAction<{
      annotationClasses?: AnnotationClassVO[] | undefined;
      taskAnnotations?: TaskAnnotationOriginVO[] | undefined;
    }>
  >
) => Reducer<FormState<WorkspaceFormState>, FormAction> = (setEditResource) => {
  return (state, action) => {
    switch (action.type) {
      case 'change':
        let newState = FormUtil.update(action.name, action.value, state.data);
        if (action.name === 'type') {
          newState = FormUtil.update('targets', [], newState);
        } else if (action.name === 'editTargets') {
          readJson(action.value).then((res) => {
            setEditResource(res);
          });
        }
        const helper = { validState: 'valid' };

        if (newState.type && newState.targets && newState.targets.length > 0) {
          helper.validState = 'valid';
        } else {
          helper.validState = 'error';
        }
        return { data: newState, helper };
      case 'init':
        return { data: action.data, helper: {} };
    }
  };
};

const EditPage: FC = () => {
  const classes = useStyles();
  const history = useHistory();
  const [t] = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const search = useLocation().search;
  const queryParam = new URLSearchParams(search);
  const formStartPage = !queryParam.get('from');

  const projectRepository = React.useContext(
    ProjectRepositoryContext
  ) as ProjectWebRepository;

  const initialForm = {
    data: {
      type: ProjectType.pcd_only,
    },
    helper: {},
  };

  const [editResource, setEditResource] = useState<{
    annotationClasses?: AnnotationClassVO[];
    taskAnnotations?: TaskAnnotationOriginVO[];
  }>({});
  const [form, dispatchForm] = useReducer(
    formReducerFactory(setEditResource),
    initialForm
  );

  const handleCreate = () => {
    const type = form.data.type;
    const targets = form.data.targets;
    const annotationClasses = editResource.annotationClasses;
    const taskAnnotations = editResource.taskAnnotations;
    if (
      !(annotationClasses && annotationClasses.length > 0) ||
      !(taskAnnotations && taskAnnotations.length > 0)
    ) {
      enqueueSnackbar(t('web_edit-message_empty_edit_target'), {
        variant: 'error',
      });
      return;
    }
    projectRepository.setEditTarget(annotationClasses, taskAnnotations);
    projectRepository
      .create({ type, targets, projectId: uuid().toString() } as any)
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

  useEffect(() => {}, [form]);

  return (
    <Box
      className={classes.root}>
        <Grid
          container
          justifyContent="center"
          direction="column"
          spacing={2}
          className={classes.main}>
          <Grid item className={classes.item}>
            <Typography color="textSecondary" variant="h4">
              {t('web_edit-header_label')}
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
                  {t('web_edit-action_label_edit')}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
    </Box>
  );
};

export default EditPage;
