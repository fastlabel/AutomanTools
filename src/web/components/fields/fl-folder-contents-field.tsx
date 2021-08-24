import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import FilterDramaIcon from '@material-ui/icons/FilterDrama';
import React, { FC } from "react";
import { useDropzone } from "react-dropzone";
import FLFileList from "../lists/fl-file-list";
import { FormUtil } from "./form-util";
import { FormAction, FormState } from "./type";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        dragzone: {
            minHeight: 184,
            display: 'flex',
            alignContent: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
            borderWidth: 2,
            borderRadius: 2,
            borderColor: '#eeeeee',
            borderStyle: 'dashed',
            outline: 'none',
            transition: 'border .24s ease-in-out',
            "&:hover": {
                cursor: "pointer",
                opacity: 0.7,
            },
            "&:focus": {
                outline: "none",
            },
        }
    }),
);

const _DropContent: FC<{ icon: any, main: any, btnLabel?: string }> = ({ icon, main, btnLabel }) => {
    return (
        <Grid container direction="column" spacing={2}>
            <Grid item >
                <Grid container justifyContent="center">
                    {icon}
                </Grid>
            </Grid>
            <Grid item >
                <Grid container justifyContent="center" >
                    <Grid item >
                        {main}
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Grid container justifyContent="center">
                    <Button variant="outlined">{btnLabel}</Button>
                </Grid>
            </Grid>
        </Grid>
    );
}

type Props = {
    label: string;
    description?: {
        main?: string;
        sub?: string;
        btn?: string;
        btnUpdate?: string;
    };
    accept?: string;
    maxFiles?: number;
    form: [name: string, obj: FormState<any>, dispatch: React.Dispatch<FormAction>];
};


const FLFolderContentsField: FC<Props> = ({ label, description, accept, maxFiles, form }) => {
    const [name, obj, dispatch] = form;
    const formValue = FormUtil.resolve(name, obj.data) as File[];

    const { getRootProps, getInputProps } = useDropzone({
        maxFiles,
        accept,
        onDrop: (acceptedFiles: File[]) => {
            dispatch({ type: 'change', name, value: acceptedFiles });
        }
    });
    const classes = useStyles();

    const selectCount = formValue?.length || 0;
    const showFileList = selectCount > 0 && maxFiles !== 1;
    const fileList = showFileList && formValue ?
        formValue.map((v, i) => ({ id: v.path, label: v.name, labelIcon: FilterDramaIcon })) : [];
    const fileItem = selectCount === 1 && formValue ? formValue[0] : { name: '' };

    const dropContentProps = selectCount === 0 ?
        {
            icon: (<FileCopyOutlinedIcon />),
            main: (<React.Fragment>
                <Typography>{description?.main}</Typography>
                <Typography>{description?.sub}</Typography>
            </React.Fragment>),
            btnLabel: description?.btn
        } :
        // else case
        {
            icon: (<FilterDramaIcon />),
            main: (<Typography>{`${fileItem.name} が選択されています`}</Typography>),
            btnLabel: description?.btnUpdate
        };

    return (
        <React.Fragment>
            <Box mb={1}>
                <Typography variant="body2" component="div">
                    {label}
                </Typography>
            </Box>
            <Box>
                <div {...getRootProps({ className: classes.dragzone })}>
                    <input {...getInputProps()} />
                    {showFileList ?
                        <FLFileList items={fileList} /> :
                        // else case
                        <_DropContent {...dropContentProps} />
                    }
                </div>
            </Box>
        </React.Fragment>
    );
};

export default FLFolderContentsField;