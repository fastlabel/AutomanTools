import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import React, {
  FC,
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  FLDialogActions,
  FLDialogContent,
  FLDialogTitle,
} from '../../../components/dialogs/fl-dialog';
import FLTextField from '../../../components/fields/fl-text-field';
import { FormUtil } from '../../../components/fields/form-util';
import { FormAction, FormState } from '../../../components/fields/type';
import { AnnotationClassVO } from '../../../types/vo';
import { AnnotationClassUtil } from '../../../utils/annotation-class-util';
import FLColorField from './../../../components/fields/fl-color-field';

type Props = {
  open: boolean;
  classVo?: AnnotationClassVO;
  onClose: () => void;
  onSubmit: (vo: AnnotationClassVO, type: 'add' | 'update') => Promise<void>;
};

const formReducer: Reducer<FormState<AnnotationClassVO>, FormAction> = (
  state,
  action
) => {
  switch (action.type) {
    case 'change':
      // TODO validation
      const newState = {
        data: FormUtil.update(action.name, action.value, state.data),
        helper: state.helper,
      };
      return newState;
    case 'init':
      return { data: action.data, helper: {} };
  }
};

const ClassFormDialog: FC<Props> = ({ open, classVo, onClose, onSubmit }) => {
  const handleClose = useCallback(() => onClose(), []);
  const [t] = useTranslation();

  const [submitType, setSubmitType] = useState<'add' | 'update'>(
    classVo ? 'update' : 'add'
  );

  const initialForm = {
    data: classVo || AnnotationClassUtil.create(),
    helper: {},
  };

  const [form, dispatchForm] = useReducer(formReducer, initialForm);

  useEffect(() => {
    setSubmitType(classVo ? 'update' : 'add');
    dispatchForm({
      type: 'init',
      data: classVo || AnnotationClassUtil.create(),
    });
  }, [open, classVo]);

  const handleClickSaveCreate = () => {
    onSubmit(form.data, submitType).then(() => {
      setSubmitType('add');
      dispatchForm({ type: 'init', data: AnnotationClassUtil.create() });
    });
  };

  const handleClickSaveClose = () => {
    onSubmit(form.data, submitType).then(() => {
      onClose();
    });
  };

  const componentCode = 'class-form-dialog-title';
  return (
    <Dialog
      fullWidth={true}
      open={open}
      onClose={handleClose}
      aria-labelledby={componentCode}>
      <FLDialogTitle id={componentCode} onClose={handleClose}>
        {submitType === 'update'
          ? t('classForm-header_label__edit')
          : t('classForm-header_label__create')}
      </FLDialogTitle>
      <FLDialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FLTextField
              label={t('classForm-label__title')}
              form={['title', form, dispatchForm]}></FLTextField>
          </Grid>
          <Grid item xs={6}>
            <FLTextField
              label={t('classForm-label__value')}
              form={['value', form, dispatchForm]}></FLTextField>
          </Grid>
          <Grid item xs={12}>
            <FLColorField
              label={t('classForm-label__color')}
              form={['color', form, dispatchForm]}></FLColorField>
          </Grid>
          <Grid item xs={4}>
            <FLTextField
              label={t('classForm-label__defaultSizeX')}
              inputType="number"
              form={['defaultSize.x', form, dispatchForm]}></FLTextField>
          </Grid>
          <Grid item xs={4}>
            <FLTextField
              label={t('classForm-label__defaultSizeY')}
              inputType="number"
              form={['defaultSize.y', form, dispatchForm]}></FLTextField>
          </Grid>
          <Grid item xs={4}>
            <FLTextField
              label={t('classForm-label__defaultSizeZ')}
              inputType="number"
              form={['defaultSize.z', form, dispatchForm]}></FLTextField>
          </Grid>
        </Grid>
      </FLDialogContent>
      <FLDialogActions>
        <Button variant="text" onClick={handleClickSaveCreate}>
          {t('classForm-action_label__saveCreate')}
        </Button>
        <Button onClick={handleClickSaveClose} variant="text" color="primary">
          {submitType === 'update'
            ? t('classForm-action_label__save')
            : t('classForm-action_label__create')}
        </Button>
      </FLDialogActions>
    </Dialog>
  );
};

export default ClassFormDialog;
