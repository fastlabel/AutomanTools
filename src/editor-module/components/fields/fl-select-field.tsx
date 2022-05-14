import { TextField } from '@mui/material';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import React, { FC } from 'react';
import { FormUtil } from './form-util';
import { FormAction, FormState } from './type';

type Props = {
  label: string;
  items: { key: string; label: string; value?: string }[];
  form: [
    name: string,
    obj: FormState<any>,
    dispatch: React.Dispatch<FormAction>
  ];
  disabled?: boolean;
};

const FLSelectField: FC<Props> = ({ label, items, form, disabled }) => {
  const [name, obj, dispatch] = form;
  const formValue = FormUtil.resolve(name, obj.data);
  return (
    <React.Fragment>
      <Box component="div" mb={1}>
        <Typography variant="body2" component="div">
          {label}
        </Typography>
      </Box>
      <Box component="div">
        <TextField
          margin="dense"
          disabled={disabled}
          variant="outlined"
          select
          fullWidth
          value={formValue}
          onChange={(e) => {
            const newValue = e.target.value;
            dispatch({ type: 'change', name, value: newValue });
          }}>
          {items.map((item) => (
            <MenuItem key={item.key} value={item.value || item.key}>
              {item.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </React.Fragment>
  );
};

export default FLSelectField;
