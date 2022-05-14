import FLFolderContentsField from '@fl-three-editor/components/fields/fl-folder-contents-field';
import FLSelectField from '@fl-three-editor/components/fields/fl-select-field';
import { FormUtil } from '@fl-three-editor/components/fields/form-util';
import { FormAction, FormState } from '@fl-three-editor/components/fields/type';
import { ProjectType } from '@fl-three-editor/types/const';
import { WorkspaceUtil } from '@fl-three-editor/utils/workspace-util';
import { Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Grid from '@mui/material/Grid';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) => createStyles({}));

type Props = {
  form: FormState<WorkspaceFormState>;
  dispatchForm: React.Dispatch<FormAction>;
};

export type WorkspaceFormState = {
  editTargets?: File[];
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
        <FLFolderContentsField
          label={t('web_edit-label__editTargets')}
          form={['editTargets', form, dispatchForm]}
          description={{
            main: t('web_edit-description_main__editTargets'),
            sub: t('web_edit-description_sub__editTargets'),
            btn: t('web_edit-description_btn__editTargets'),
            btnUpdate: t('web_edit-description_btnUpdate__editTargets'),
          }}
          accept={'.json'}
          maxFiles={2}
        />
      </Grid>
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
