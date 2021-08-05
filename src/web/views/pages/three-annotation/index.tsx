import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { FC, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import ClassListDialog from './class-list-dialog';
import ThreeSidePanel from "./side-panel";
import ThreeToolbar from './tool-bar';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
            height: '100vh',
            width: '100vw',
        },
        mainPanel: {
            flexGrow: 1
        },
        mainContentPanel: {
            height: '100vh'
        },
        mainContent: {
            flexGrow: 1,
            background: '#000'
        },
        sidePanel: {
        }
    }),
);

const ThreeAnnotationPage: FC = () => {
    const classes = useStyles();
    const history = useHistory();
    const [openClassListDialog, setOpenClassListDialog] = React.useState(false);

    const onConfigClassesClick = () => {
        setOpenClassListDialog(true);
    }

    useEffect(() => {
        // initialize
    }, [])

    return (
        <React.Fragment>
            <Grid container className={classes.root}>
                <Grid item className={classes.mainPanel} >
                    <Grid container direction="column" className={classes.mainContentPanel}>
                        <Grid item>
                            <ThreeToolbar />
                        </Grid>
                        <Grid item className={classes.mainContent}>

                        </Grid>
                    </Grid>
                </Grid>
                <Grid item className={classes.sidePanel}>
                    <ThreeSidePanel onConfigClassesClick={onConfigClassesClick} />
                </Grid>
            </Grid>
            <ClassListDialog open={openClassListDialog} setOpen={setOpenClassListDialog} />
        </React.Fragment>
    );
};

export default ThreeAnnotationPage;