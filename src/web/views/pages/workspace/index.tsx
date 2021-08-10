import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import React, { FC, useState } from "react";
import { useHistory } from "react-router-dom";
import WorkspaceContext from "../../../context/workspace";
import { ProjectRepositoryContext } from "../../../repositories/project-repository";
import { ProjectType } from "../../../types/const";
import WorkspaceForm, { WorkspaceFormState } from "./form";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1
        },
        main: {
            minHeight: 600,
            maxWidth: 700,
            height: '100vh',
            width: '90vw',
        },
        item: {
            width: '100%',
        },
        itemGlow: {
            flexGrow: 1,
            width: '100%',
        }
    }),
);

type WorkspaceState = {

};

const WorkspacePage: FC = () => {
    const classes = useStyles();
    const history = useHistory();
    const workspace = WorkspaceContext.useContainer();
    const projectRepository = React.useContext(ProjectRepositoryContext);

    const [form, setForm] = useState<WorkspaceFormState>({
        workspaceFolder: workspace.workspaceFolder,
        type: ProjectType.pcd_only
    });

    const handleCreate = () => {
        // TODO should updated workspace folder
        projectRepository.create(form as any).then(() =>
            history.push('/threeannotation')
        );
    };

    const handleBack = () => {
        history.push('/');
    };


    return (
        <Grid container justifyContent="center" alignItems="center" direction="column" className={classes.root} >
            <Grid item>
                <Grid container direction="column" spacing={2} className={classes.main}>
                    <Grid item className={classes.item}>
                        <Typography color='textSecondary' variant="h4">ワークスペースを作成</Typography>
                    </Grid>
                    <Grid item className={classes.itemGlow}>
                        <WorkspaceForm form={form} onUpdateForm={setForm} />
                    </Grid>
                    <Grid item className={classes.item}>
                        <Grid container justifyContent="space-between">
                            <Grid item>
                                <Button onClick={handleBack}>戻る</Button>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" disabled={form.validState !== 'valid'} color="primary" onClick={handleCreate}>
                                    ワークスペースを作成
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>);
};

export default WorkspacePage;