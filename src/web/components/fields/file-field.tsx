import { createStyles, InputAdornment, makeStyles, TextField, Theme } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import FolderIcon from '@material-ui/icons/Folder';
import React, { FC } from "react";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(1),
        },
    }),
);


type Props = {
    label: string;
    value?: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
};

const FileField: FC<Props> = ({ label, value, onChange }) => {
    const classes = useStyles();
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
                    value={value}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FolderIcon />
                            </InputAdornment>
                        ),
                    }}
                    onChange={onChange}
                />
            </Box>
        </React.Fragment>
    );
};

export default FileField;