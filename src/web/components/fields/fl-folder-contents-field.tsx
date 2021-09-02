import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import FilterDramaIcon from '@material-ui/icons/FilterDrama';
import PanoramaOutlinedIcon from '@material-ui/icons/PanoramaOutlined';
import PermDataSettingOutlinedIcon from '@material-ui/icons/PermDataSettingOutlined';
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
            <Box mb={1}>
                <Typography variant="body2" component="div">
                    {label}
                </Typography>
            </Box>
            <Box className={styles.itemContent}>
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
