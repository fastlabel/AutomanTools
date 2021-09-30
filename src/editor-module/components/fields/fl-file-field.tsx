import {
  createStyles,
  InputAdornment,
  makeStyles,
  TextField,
  Theme,
} from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import FolderIcon from '@material-ui/icons/Folder';
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
      <Box mb={1}>
        <Typography variant="body2" component="div">
          {label}
        </Typography>
      </Box>
      <Box>
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
