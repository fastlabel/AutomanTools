import FLFolderContentsField from '@fl-three-editor/components/fields/fl-folder-contents-field';
import FLSelectField from '@fl-three-editor/components/fields/fl-select-field';
import { FormUtil } from '@fl-three-editor/components/fields/form-util';
import { FormAction, FormState } from '@fl-three-editor/components/fields/type';
import { ProjectType } from '@fl-three-editor/types/const';
import { WorkspaceUtil } from '@fl-three-editor/utils/workspace-util';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => createStyles({}));

type Props = {
  form: FormState<WorkspaceFormState>;
  dispatchForm: React.Dispatch<FormAction>;
};

export type WorkspaceFormState = {
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
        <FLSelectField
          label={t('web_workspaceForm-label__type')}
          items={targetItemTypes}
          form={['type', form, dispatchForm]}
        />
      </Grid>
      <Grid item>
        <FLFolderContentsField
          label={t('web_workspaceForm-label__targets')}
          form={['targets', form, dispatchForm]}
          {...folderContentsProps}
        />
      </Grid>
    </Grid>
  );
};

export default WorkspaceForm;
