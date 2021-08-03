import { TextField } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import React, { ChangeEvent, FC } from "react";

type Props = {
    label: string;
    value?: string;
    onChange?: (e: ChangeEvent<any>) => void;
};

const FLTextField: FC<Props> = ({ label, value, onChange }) => {
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