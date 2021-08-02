import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { FC } from "react";
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
            minWidth: 380
        }
    }),
);

const ThreeAnnotationPage: FC = () => {
    const classes = useStyles();
    return (
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
                <ThreeSidePanel />
            </Grid>
        </Grid>
    );
};

export default ThreeAnnotationPage;