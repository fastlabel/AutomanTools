import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import React, { FC } from "react";
import { FLDialogActions, FLDialogContent, FLDialogTitle } from '../../../components/dialogs/fl-dialog';
import FLTextField from '../../../components/fields/fl-text-field';
import FLColorField from './../../../components/fields/fl-color-field';

type Props = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ClassFormDialog: FC<Props> = ({ open, setOpen }) => {
    const handleClose = () => {
        setOpen(false);
    };
    const componentCode = 'class-form-dialog-title';
    return (
        <Dialog fullWidth={true} open={open} onClose={handleClose} aria-labelledby={componentCode}>
            <FLDialogTitle id={componentCode} onClose={handleClose}>アノテーションクラスを作成</FLDialogTitle>
            <FLDialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FLTextField label="名称"></FLTextField>
                    </Grid>
                    <Grid item xs={6}>
                        <FLTextField label="値"></FLTextField>
                    </Grid>
                    <Grid item xs={12}>
                        <FLColorField label="色"></FLColorField>
                    </Grid>
                </Grid>
            </FLDialogContent>
            <FLDialogActions>
                <Button onClick={handleClose} color="primary">
                    保存して新規作成
                </Button>
                <Button onClick={handleClose} variant="contained" color="primary" disableElevation>
                    作成
                </Button>
            </FLDialogActions>
        </Dialog>
    );
};

export default ClassFormDialog;