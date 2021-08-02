import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import FileCopyOutlinedIcon from '@material-ui/icons/FileCopyOutlined';
import React, { FC } from "react";
import { useDropzone } from "react-dropzone";

type Props = {
    label: string;
    description?: string;
    subDescription?: string;
    btnDescription?: string;
    value?: string;
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        dragzone: {
            minHeight: 230,
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

const FolderContentsField: FC<Props> = ({ label, value, description, subDescription, btnDescription }) => {
    const { getRootProps, getInputProps } = useDropzone({
        accept: '.pcd', onDrop: (acceptedFiles) => {

        }
    });
    const classes = useStyles();

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
                    <Grid container direction="column" spacing={2}>
                        <Grid item >
                            <Grid container justifyContent="center">
                                <FileCopyOutlinedIcon />
                            </Grid>
                        </Grid>
                        <Grid item >
                            <Grid container justifyContent="center" >
                                <Grid item >
                                    <Typography>{description}</Typography>
                                    <Typography>{subDescription}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid container justifyContent="center">
                                <Button variant="outlined">{btnDescription}</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
            </Box>
        </React.Fragment>
    );
};

export default FolderContentsField;