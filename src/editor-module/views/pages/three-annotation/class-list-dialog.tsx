import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import React, { FC, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FLDialogTitle } from '../../../components/dialogs/fl-dialog';
import AnnotationClassStore from '../../../stores/annotation-class-store';
import { AnnotationClassVO } from '../../../types/vo';
import ClassList from '../../annotation-classes/class-list';
import ClassFormDialog from './class-form-dialog';

type Props = {
  //
};

const ClassListDialog: FC<Props> = () => {
  const [open, setOpen] = React.useState(false);
  const [t] = useTranslation();
  const [formDialog, setFormDialog] = React.useState<{
    open: boolean;
    classVo?: AnnotationClassVO;
  }>({ open: false });

  const { annotationClass, dispatchAnnotationClass } =
    AnnotationClassStore.useContainer();

  useEffect(() => {
    setOpen(annotationClass.status === 'ready');
  }, [annotationClass]);

  const handleClose = useCallback(() => {
    dispatchAnnotationClass({ type: 'save' });
  }, []);

  const handleFormSubmit = (
    vo: AnnotationClassVO,
    type: 'add' | 'update' = 'add'
  ) => {
    return new Promise<void>((resolve) => {
      dispatchAnnotationClass({ type, vo });
      resolve();
    });
  };

  const componentCode = 'class-list-dialog-title';
  return (
    <React.Fragment>
      <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        aria-labelledby={componentCode}>
        <FLDialogTitle id={componentCode} onClose={handleClose}>
          {t('classList-header_label')}
        </FLDialogTitle>
        <DialogContent>
          {annotationClass.status === 'ready' ? (
            <React.Fragment>
              <ClassList
                classes={annotationClass.data}
                onClickItem={(item) =>
                  setFormDialog({ open: true, classVo: item })
                }
              />
            </React.Fragment>
          ) : undefined}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="text">
            {t('classList-action_label__close')}
          </Button>
          <Button
            onClick={() => setFormDialog({ open: true })}
            variant="text"
            color="primary">
            {t('classList-action_label__create')}
          </Button>
        </DialogActions>
      </Dialog>

      <ClassFormDialog
        open={formDialog.open}
        onClose={() => setFormDialog({ open: false })}
        classVo={formDialog.classVo}
        onSubmit={handleFormSubmit}
      />
    </React.Fragment>
  );
};

export default ClassListDialog;
