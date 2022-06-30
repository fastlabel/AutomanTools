import CloseIcon from '@mui/icons-material/Close';
import MuiDialogActions from '@mui/material/DialogActions';
import MuiDialogContent from '@mui/material/DialogContent';
import MuiDialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { WithStyles } from '@mui/styles';
import createStyles from '@mui/styles/createStyles';
import withStyles from '@mui/styles/withStyles';
import React from 'react';

const styles = () =>
  createStyles({
    root: {
      m: 0,
      p: 2,
    },
    closeButton: {
      position: 'absolute',
      right: 8,
      top: 8,
      color: 'palette.grey.500',
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const FLDialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, id } = props;
  return (
    <MuiDialogTitle id={id} m={0} p={2} component="div">
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          size="small"
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

export const FLDialogContent = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

export const FLDialogActions = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);
