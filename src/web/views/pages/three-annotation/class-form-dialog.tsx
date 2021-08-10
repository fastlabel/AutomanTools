import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Grid from '@material-ui/core/Grid';
import React, { FC, Reducer, useCallback, useEffect, useReducer } from "react";
import { FLDialogActions, FLDialogContent, FLDialogTitle } from '../../../components/dialogs/fl-dialog';
import FLTextField from '../../../components/fields/fl-text-field';
import { FormUtil } from '../../../components/fields/form-util';
import { FormAction, FormState } from '../../../components/fields/type';
import { AnnotationClassVO } from '../../../types/vo';
import { AnnotationClassUtil } from '../../../use-case/annotation-class-util';
import FLColorField from './../../../components/fields/fl-color-field';

type Props = {
    open: boolean;
    classVo?: AnnotationClassVO;
    onClose: () => void;
    onSubmit: (vo: AnnotationClassVO) => Promise<void>;
};

const formReducer: Reducer<FormState<AnnotationClassVO>, FormAction> = (state, action) => {
    switch (action.type) {
        case 'change':
            // TODO validation
            const newState = { data: FormUtil.update(action.name, action.value, state.data), helper: state.helper };
            return newState;
        case 'init':
            return { data: action.data, helper: {} };
    }
};

const ClassFormDialog: FC<Props> = ({ open, classVo, onClose, onSubmit }) => {
    const handleClose = useCallback(() => onClose(), []);

    const initialForm = {
        data: classVo || AnnotationClassUtil.create(),
        helper: {}
    };

    const [form, dispatchForm] = useReducer(formReducer, initialForm);

    useEffect(() => {
        dispatchForm({ type: 'init', data: classVo || AnnotationClassUtil.create() });
    }, [open, classVo]);

    const handleClickSaveCreate = () => {
        onSubmit(form.data).then(() => {
            dispatchForm({ type: 'init', data: AnnotationClassUtil.create() })
        });
    };

    const handleClickSaveClose = () => {
        onSubmit(form.data).then(() => {
            onClose();
        });
    };

    const componentCode = 'class-form-dialog-title';
    return (
        <Dialog fullWidth={true} open={open} onClose={handleClose} aria-labelledby={componentCode}>
            <FLDialogTitle id={componentCode} onClose={handleClose}>アノテーションクラスを作成</FLDialogTitle>
            <FLDialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FLTextField label="名称" form={['title', form, dispatchForm]}></FLTextField>
                    </Grid>
                    <Grid item xs={6}>
                        <FLTextField label="値" form={['value', form, dispatchForm]}></FLTextField>
                    </Grid>
                    <Grid item xs={12}>
                        <FLColorField label="色" form={['color', form, dispatchForm]}></FLColorField>
                    </Grid>
                    <Grid item xs={4}>
                        <FLTextField label="長さ（初期値）" inputType="number" form={['defaultSize.x', form, dispatchForm]}></FLTextField>
                    </Grid>
                    <Grid item xs={4}>
                        <FLTextField label="幅（初期値）" inputType="number" form={['defaultSize.y', form, dispatchForm]}></FLTextField>
                    </Grid>
                    <Grid item xs={4}>
                        <FLTextField label="高さ（初期値）" inputType="number" form={['defaultSize.z', form, dispatchForm]}></FLTextField>
                    </Grid>
                </Grid>
            </FLDialogContent>
            <FLDialogActions>
                <Button color="primary" onClick={handleClickSaveCreate}>
                    保存して新規作成
                </Button>
                <Button onClick={handleClickSaveClose} variant="contained" color="primary" disableElevation>
                    作成
                </Button>
            </FLDialogActions>
        </Dialog>
    );
};

export default ClassFormDialog;