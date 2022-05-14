import { InputAdornment, TextField, Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import React, { FC } from 'react';
import { FormUtil } from './form-util';
import { FormAction, FormState } from './type';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    margin: {
      margin: theme.spacing(1),
    },
  })
);

type Props = {
  label: string;
  form: [
    name: string,
    obj: FormState<any>,
    dispatch: React.Dispatch<FormAction>
  ];
};

const FLFileField: FC<Props> = ({ label, form }) => {
  const classes = useStyles();
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
          variant="outlined"
          margin="dense"
          fullWidth
          value={formValue}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FolderIcon />
              </InputAdornment>
            ),
          }}
          onChange={(e) => {
            const newValue = e.target.value;
            dispatch({ type: 'change', name, value: newValue });
          }}
        />
      </Box>
    </React.Fragment>
  );
};

export default FLFileField;
