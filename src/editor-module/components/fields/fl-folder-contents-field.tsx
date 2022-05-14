import { Theme } from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import PanoramaOutlinedIcon from '@mui/icons-material/PanoramaOutlined';
import PermDataSettingOutlinedIcon from '@mui/icons-material/PermDataSettingOutlined';
import React, { FC, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { FormUtil } from './form-util';
import { FormAction, FormState } from './type';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    attachedDragzone: {
      minHeight: 184,
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: 'rgba(0, 0, 0, 0.12)',
      borderStyle: 'solid',
      outline: 'none',
      transition: 'border .24s ease-in-out',
      '&:hover': {
        cursor: 'pointer',
        opacity: 0.7,
      },
      '&:focus': {
        outline: 'none',
      },
      maxHeight: 200,
      overflowX: 'hidden',
      overflowY: 'auto',
    },
    dragzone: {
      minHeight: 184,
      display: 'flex',
      alignContent: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      flexGrow: 1,
      borderWidth: 2,
      borderRadius: 4,
      borderColor: 'rgba(0, 0, 0, 0.12)',
      borderStyle: 'dashed',
      outline: 'none',
      transition: 'border .24s ease-in-out',
      '&:hover': {
        cursor: 'pointer',
        opacity: 0.7,
      },
      '&:focus': {
        outline: 'none',
      },
    },
    itemContent: {},
  })
);

const _DropContent: FC<{ icon: any; main: any; btnLabel?: string }> = ({
  icon,
  main,
  btnLabel,
}) => {
  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Grid container justifyContent="center">
          {icon}
        </Grid>
      </Grid>
      <Grid item>
        <Grid container justifyContent="center">
          <Grid item>{main}</Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container justifyContent="center">
          <Button variant="outlined">{btnLabel}</Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

type Props = {
  label: string;
  description?: {
    main?: string;
    sub?: string;
    btn?: string;
    btnUpdate?: string;
  };
  mode?: 'file' | 'folder';
  accept?: string;
  maxFiles?: number;
  form: [
    name: string,
    obj: FormState<any>,
    dispatch: React.Dispatch<FormAction>
  ];
};

const FLFolderContentsField: FC<Props> = ({
  label,
  description,
  mode = 'file',
  accept,
  maxFiles,
  form,
}) => {
  const [name, dispatch, attached, fileList] = useMemo(() => {
    const [name, obj, dispatch] = form;
    const formValue = FormUtil.resolve(name, obj.data) as File[];
    const selectCount = formValue?.length || 0;
    const attached = selectCount > 0;
    const fileList = formValue
      ? formValue.map((v: any, i) => {
          const [fileName, ex] = v.name.split('.');
          const label =
            mode === 'file' ? v.name : v.webkitRelativePath || v.name;
          if (ex === 'pcd') {
            return { id: v.path, label, labelIcon: <FilterDramaIcon /> };
          } else if (ex === 'yaml' || ex === 'yml') {
            return {
              id: v.path,
              label,
              labelIcon: <PermDataSettingOutlinedIcon />,
            };
          }
          return {
            id: v.path,
            label,
            labelIcon: <PanoramaOutlinedIcon />,
          };
        })
      : [];
    return [name, dispatch, attached, fileList];
  }, [form, mode]);

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles,
    accept,
    // noClick: attached,
    onDrop: (acceptedFiles: File[]) => {
      dispatch({ type: 'change', name, value: acceptedFiles });
    },
  });
  const styles = useStyles();

  const dropContentProps = {
    icon: <FileCopyOutlinedIcon />,
    main: (
      <React.Fragment>
        <Typography>{description?.main}</Typography>
        <Typography>{description?.sub}</Typography>
      </React.Fragment>
    ),
    btnLabel: description?.btn,
  };

  const directoryPops =
    mode === 'folder'
      ? {
          directory: '',
          webkitdirectory: '',
        }
      : {};

  return (
    <React.Fragment>
      <Box component="div" mb={1}>
        <Typography variant="body2" component="div">
          {label}
        </Typography>
      </Box>
      <Box component="div" className={styles.itemContent}>
        <div
          {...getRootProps({
            className: attached ? styles.attachedDragzone : styles.dragzone,
          })}>
          <input {...getInputProps()} {...directoryPops} />
          {attached ? (
            <List dense>
              {fileList.map((i) => (
                <ListItem key={i.id}>
                  <ListItemIcon>{i.labelIcon}</ListItemIcon>
                  <ListItemText primary={i.label} />
                  <ListItemSecondaryAction>
                    {/* <IconButton edge="end" aria-label="delete">
                                        <CloseOutlinedIcon />
                                    </IconButton> */}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          ) : (
            // else case
            <_DropContent {...dropContentProps} />
          )}
        </div>
      </Box>
    </React.Fragment>
  );
};

export default FLFolderContentsField;
