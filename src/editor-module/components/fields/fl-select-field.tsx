import { TextField } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
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
      <Box mb={1}>
        <Typography variant="body2" component="div">
          {label}
        </Typography>
      </Box>
      <Box>
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
