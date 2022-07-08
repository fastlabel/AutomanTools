import { TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, { FC, useCallback } from 'react';
import { FormUtil } from './form-util';
import { FormAction, FormState } from './type';

type Props = {
  label: string;
  mode?: 'list' | 'grid';
  readonly?: boolean;
  inputType?: 'text' | 'number';
  form: [
    name: string,
    obj: FormState<any>,
    dispatch?: React.Dispatch<FormAction>
  ];
};

const FLTextField: FC<Props> = ({
  label,
  mode = 'grid',
  readonly = false,
  inputType = 'text',
  form,
}) => {
  const [name, obj, dispatch] = form;
  let formValue = FormUtil.resolve(name, obj.data);
  if (inputType === 'number') {
    formValue = Number(formValue).toFixed(2);
  }
  const onChange = useCallback(
    (e) => {
      if (dispatch) {
        const newValue = e.target.value;
        dispatch({ type: 'change', name, value: newValue });
      }
    },
    [dispatch]
  );
  return (
    <React.Fragment>
      <Box
        component="div"
        mb={mode === 'grid' ? 1 : 0}
        width={mode === 'grid' ? undefined : 120}>
        <Typography variant="body2" component="div">
          {label}
        </Typography>
      </Box>
      <Box component="div">
        <TextField
          margin="dense"
          disabled={readonly}
          type={inputType}
          variant="outlined"
          fullWidth
          value={formValue}
          inputProps={{
            step: inputType === 'number' ? 0.01 : undefined,
            sx: inputType === 'number' ? { textAlign: 'right' } : undefined,
          }}
          onChange={onChange}
        />
      </Box>
    </React.Fragment>
  );
};

export default FLTextField;
