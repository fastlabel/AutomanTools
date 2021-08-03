import { TextField } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import React, { ChangeEvent, FC } from "react";

type Props = {
    label: string;
    items: { key: string, label: string, value?: string }[];
    value?: string;
    onChange: (e: ChangeEvent<any>) => void;
};

const SelectField: FC<Props> = ({ label, items, value, onChange }) => {
    return (
        <React.Fragment>
            <Box mb={1}>
                <Typography variant="body2" component="div">
                    {label}
                </Typography>
            </Box>
            <Box>
                <TextField margin="dense" variant="outlined" select fullWidth value={value} onChange={onChange}>
                    {items.map((item) =>
                        <MenuItem key={item.key} value={item.value || item.key}>
                            {item.label}
                        </MenuItem>
                    )}
                </TextField>
            </Box>
        </React.Fragment>);
};

export default SelectField;