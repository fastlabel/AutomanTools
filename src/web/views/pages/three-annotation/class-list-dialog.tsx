import { createStyles, InputAdornment, ListItemText, makeStyles, Theme, withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import AddBoxIcon from '@material-ui/icons/AddBox';
import SearchIcon from '@material-ui/icons/Search';
import React, { FC, useCallback, useEffect } from "react";
import { FLDialogTitle } from '../../../components/dialogs/fl-dialog';
import AnnotationClassStore from '../../../stores/annotation-class-store';
import { AnnotationClassVO } from '../../../types/vo';
import ClassList from '../../annotation-classes/class-list';
import ClassFormDialog from './class-form-dialog';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
    }));

const OwnDialogContent = withStyles((theme: Theme) => ({
    root: {
        padding: 0,
    },
}))(MuiDialogContent);

type Props = {
};

const ClassListDialog: FC<Props> = () => {
    const [open, setOpen] = React.useState(false);
    const [formDialog, setFormDialog] = React.useState<{ open: boolean, classVo?: AnnotationClassVO }>({ open: false });

    const { annotationClass, dispatchAnnotationClass } = AnnotationClassStore.useContainer();

    useEffect(() => {
        setOpen(annotationClass.status === 'ready');
    }, [annotationClass])

    const handleClose = useCallback(() => {
        dispatchAnnotationClass({ type: 'save' });
    }, []);

    const handleFormSubmit = (vo: AnnotationClassVO) => {
        return new Promise<void>((resolve) => {
            dispatchAnnotationClass({ type: 'add', vo });
            resolve();
        });
    };


    const componentCode = 'class-list-dialog-title';
    return (
        <React.Fragment>
            <Dialog fullWidth open={open} onClose={handleClose} aria-labelledby={componentCode}>
                <FLDialogTitle id={componentCode} onClose={handleClose}>アノテーションクラス</FLDialogTitle>
                {annotationClass.status === 'ready' ? (
                    <OwnDialogContent>
                        <List disablePadding>
                            <ListItem dense>
                                <TextField
                                    margin="dense"
                                    variant="outlined"
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </ListItem>
                            <ListItem button dense onClick={() => setFormDialog({ open: true })}>
                                <AddBoxIcon />
                                <ListItemText>アノテーションクラスを追加する</ListItemText>
                            </ListItem>
                        </List>
                        <ClassList classes={annotationClass.data} />
                    </OwnDialogContent>) : undefined}
            </Dialog>
            <ClassFormDialog
                open={formDialog.open} onClose={() => setFormDialog({ open: false })}
                classVo={formDialog.classVo} onSubmit={handleFormSubmit} />
        </React.Fragment>
    );
};

export default ClassListDialog;