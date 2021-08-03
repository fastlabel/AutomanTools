import { createStyles, InputAdornment, ListItemText, makeStyles, Theme, withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import MuiDialogContent from '@material-ui/core/DialogContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import AddBoxIcon from '@material-ui/icons/AddBox';
import SearchIcon from '@material-ui/icons/Search';
import React, { FC } from "react";
import { AnnotationType } from '../../../application/const';
import { FLDialogTitle } from '../../../components/dialogs/fl-dialog';
import ClassList, { ClassItem } from '../../annotation-classes/class-list';
import ClassFormDialog from './class-form-dialog';

const MOCK_CLASSES: ClassItem[] = [
    {
        id: 'car',
        title: '普通車',
        type: AnnotationType.cuboid,
        color: '#ffd700'
    },
    {
        id: 'bike',
        title: '二輪車',
        type: AnnotationType.cuboid,
        color: '#adff2f'
    },
    {
        id: 'track',
        title: '普通貨物車',
        type: AnnotationType.cuboid,
        color: '#1e90ff'
    }
];

const useStyles = makeStyles((theme: Theme) =>
    createStyles({

    }));

const OwnDialogContent = withStyles((theme: Theme) => ({
    root: {
        padding: 0,
    },
}))(MuiDialogContent);

type Props = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const ClassListDialog: FC<Props> = ({ open, setOpen }) => {
    const [openFormDialog, setOpenFormDialog] = React.useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    const componentCode = 'class-list-dialog-title';
    return (
        <React.Fragment>
            <Dialog fullWidth={true} open={open} onClose={handleClose} aria-labelledby={componentCode}>
                <FLDialogTitle id={componentCode} onClose={handleClose}>アノテーションクラス</FLDialogTitle>
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
                        <ListItem button dense onClick={() => setOpenFormDialog(true)}>
                            <AddBoxIcon />
                            <ListItemText>アノテーションクラスを追加する</ListItemText>
                        </ListItem>
                    </List>
                    <ClassList classes={MOCK_CLASSES} />
                </OwnDialogContent>
            </Dialog>
            <ClassFormDialog open={openFormDialog} setOpen={setOpenFormDialog} />
        </React.Fragment>
    );
};

export default ClassListDialog;