import { TextField } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import React, { FC, useCallback } from "react";
import { FormUtil } from './form-util';
import { FormAction, FormState } from './type';

type Props = {
    label: string;
    mode?: 'list' | 'grid';
    readonly?: boolean;
    inputType?: 'text' | 'number'
    form: [name: string, obj: FormState<any>, dispatch?: React.Dispatch<FormAction>];
};

const FLTextField: FC<Props> = ({ label, mode = 'grid', readonly = false, inputType = 'text', form }) => {
    const [name, obj, dispatch] = form;
    const formValue = FormUtil.resolve(name, obj.data);
    const onChange = useCallback((e) => {
        if (dispatch) {
            const newValue = e.target.value;
            dispatch({ type: 'change', name, value: newValue });
        }
    }, [dispatch]);
    return (
        <React.Fragment>
            <Box mb={mode === 'grid' ? 1 : 0} width={mode === 'grid' ? undefined : 120}>
                <Typography variant="body2" component="div">
                    {label}
                </Typography>
            </Box>
            <Box>
                <TextField margin="dense" disabled={readonly} type={inputType} variant="outlined" fullWidth value={formValue} onChange={onChange} />
            </Box>
        </React.Fragment>);
};

export default FLTextField;