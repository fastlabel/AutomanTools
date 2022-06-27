import { TextField, Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import React, { FC } from 'react';
import { FormUtil } from './form-util';
import { FormAction, FormState } from './type';

const AnnotationColors = [
  '#0033CC',
  '#428BCA',
  '#44AD8E',
  '#A8D695',
  '#5CB85C',
  '#69D100',
  '#004E00',
  '#34495E',
  '#7F8C8D',
  '#A295D6',
  '#5843AD',
  '#8E44AD',
  '#FFECDB',
  '#AD4363',
  '#D10069',
  '#CC0033',
  '#FF0000',
  '#D9534F',
  '#D1D100',
  '#F0AD4E',
  '#AD8D43',
];

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    tag: () => ({
      borderRadius: '50%',
      width: '16px',
      height: '16px',
    }),
    colorBox: () => ({
      borderRadius: 4,
      width: theme.spacing(4),
      height: theme.spacing(4),
      minWidth: theme.spacing(4),
      minHeight: theme.spacing(4),
      maxWidth: theme.spacing(4),
      maxHeight: theme.spacing(4),
      '&:hover': {
        cursor: 'pointer',
      },
    }),
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

const FLColorField: FC<Props> = ({ label, form }) => {
  const styles = useStyles();
  const [name, obj, dispatch] = form;
  const formValue = FormUtil.resolve(name, obj.data);
  const onClickColor = (color: string) => {
    dispatch({ type: 'change', name, value: color });
  };
  return (
    <React.Fragment>
      <Box component="div" mb={1} display="flex" alignItems="center">
        <Box component="div" mr={1}>
          <Typography variant="body2">{label}</Typography>
        </Box>
        <div
          className={styles.tag}
          style={{ backgroundColor: formValue }}></div>
      </Box>
      <Box component="div" mb={1}>
        <TextField
          margin="dense"
          variant="outlined"
          fullWidth
          value={formValue}
          onChange={(e) => {
            const newValue = e.target.value.trim();
            dispatch({ type: 'change', name, value: newValue });
          }}
        />
      </Box>
      <Box component="div" mb={1}>
        <Grid container spacing={1}>
          {AnnotationColors.map((annotationColor) => (
            <Grid item key={annotationColor}>
              <Box
                component="div"
                className={styles.colorBox}
                style={{ backgroundColor: annotationColor }}
                onClick={() => onClickColor(annotationColor)}></Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </React.Fragment>
  );
};

export default FLColorField;
