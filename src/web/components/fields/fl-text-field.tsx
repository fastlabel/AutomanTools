import { TextField } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import React, { ChangeEvent, FC } from "react";
import { FormUtil } from './form-util';
import { FormAction, FormState } from './type';

type Props = {
    label: string;
    value?: string;
    inputType?: 'text' | 'number'
    onChange?: (e: ChangeEvent<any>) => void;
    form?: [name: string, obj: FormState<any>, dispatch: React.Dispatch<FormAction>];
};

const FLTextField: FC<Props> = ({ label, inputType, value, onChange, form }) => {
    if (form) {
        const [name, obj, dispatch] = form;
        const formValue = FormUtil.resolve(name, obj.data);
        return (
            <React.Fragment>
                <Box mb={1}>
                    <Typography variant="body2" component="div">
                        {label}
                    </Typography>
                </Box>
                <Box>
                    <TextField margin="dense" type={inputType} variant="outlined" fullWidth value={formValue} onChange={(e) => {
                        const newValue = e.target.value;
                        dispatch({ type: 'change', name, value: newValue });
                    }} />
                </Box>
            </React.Fragment>);
    }
    // TODO remove below
    return (
        <React.Fragment>
            <Box mb={1}>
                <Typography variant="body2" component="div">
                    {label}
                </Typography>
            </Box>
            <Box>
                <TextField margin="dense" variant="outlined" fullWidth value={value} onChange={onChange} />
            </Box>
        </React.Fragment>);
};

export default FLTextField;