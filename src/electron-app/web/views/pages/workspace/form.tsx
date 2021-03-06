import FLFileField from '@fl-three-editor/components/fields/fl-file-field';
import FLFolderContentsField from '@fl-three-editor/components/fields/fl-folder-contents-field';
import FLSelectField from '@fl-three-editor/components/fields/fl-select-field';
import { FormUtil } from '@fl-three-editor/components/fields/form-util';
import { FormAction, FormState } from '@fl-three-editor/components/fields/type';
import { ProjectType } from '@fl-three-editor/types/const';
import { WorkspaceUtil } from '@fl-three-editor/utils/workspace-util';
import Grid from '@mui/material/Grid';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(() => createStyles({}));

type Props = {
  form: FormState<WorkspaceFormState>;
  dispatchForm: React.Dispatch<FormAction>;
};

export type WorkspaceFormState = {
  workspaceFolder?: string;
  type?: ProjectType;
  targets?: File[];
};

const WorkspaceForm: FC<Props> = ({ form, dispatchForm }) => {
  const classes = useStyles();
  const [t] = useTranslation();
  const typeValue = FormUtil.resolve('type', form.data);

  const folderContentsProps = useMemo(
    () => WorkspaceUtil.folderContentsProps(t, typeValue),
    [typeValue]
  );

  const targetItemTypes = useMemo(() => WorkspaceUtil.targetItemTypes(t), []);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <FLFileField
          label={t('app_workspaceForm-label_workspaceFolder')}
          form={['workspaceFolder', form, dispatchForm]}
        />
      </Grid>
      <Grid item>
        <FLSelectField
          label={t('app_workspaceForm-label_type')}
          items={targetItemTypes}
          form={['type', form, dispatchForm]}
        />
      </Grid>
      <Grid item>
        <FLFolderContentsField
          label={t('app_workspaceForm-label_targets')}
          form={['targets', form, dispatchForm]}
          {...folderContentsProps}
        />
      </Grid>
    </Grid>
  );
};

export default WorkspaceForm;
