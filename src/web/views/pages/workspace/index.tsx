import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import React, { FC, Reducer, useReducer } from "react";
import { useHistory } from "react-router-dom";
import { FormUtil } from "../../../components/fields/form-util";
import { FormAction, FormState } from "../../../components/fields/type";
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
            height: '100%',
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


const formReducer: Reducer<FormState<WorkspaceFormState>, FormAction> = (state, action) => {
    switch (action.type) {
        case 'change':
            let newState = FormUtil.update(action.name, action.value, state.data);
            if (action.name === 'type') {
                newState = FormUtil.update('targets', [], newState);
            }
            const helper = { validState: 'valid' };

            if (newState.workspaceFolder &&
                newState.type &&
                newState.targets &&
                newState.targets.length > 0) {
                helper.validState = 'valid';
            } else {
                helper.validState = 'error';
            }
            return { data: newState, helper };
        case 'init':
            return { data: action.data, helper: {} };
    }
};

const WorkspacePage: FC = () => {
    const classes = useStyles();
    const history = useHistory();
    const workspace = WorkspaceContext.useContainer();
    const projectRepository = React.useContext(ProjectRepositoryContext);

    const initialForm = {
        data: {
            workspaceFolder: workspace.workspaceFolder,
            type: ProjectType.pcd_only
        },
        helper: {}
    };

    const [form, dispatchForm] = useReducer(formReducer, initialForm);

    const handleCreate = () => {
        // TODO should updated workspace folder
        projectRepository.create(form.data as any).then(() =>
            history.push('/threeannotation')
        );
    };

    const handleBack = () => {
        history.push('/');
    };


    return (
        <Grid container justifyContent="center" alignItems="center" direction="column" className={classes.root} >
            <Grid item>
                <Grid container justifyContent="center" direction="column" spacing={2} className={classes.main}>
                    <Grid item className={classes.item}>
                        <Typography color='textSecondary' variant="h4">ワークスペースを作成</Typography>
                    </Grid>
                    <Grid item className={classes.item}>
                        <WorkspaceForm form={form} dispatchForm={dispatchForm} />
                    </Grid>
                    <Grid item className={classes.item}>
                        <Grid container justifyContent="space-between">
                            <Grid item>
                                <Button onClick={handleBack}>戻る</Button>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" disabled={form.helper.validState !== 'valid'} color="primary" onClick={handleCreate}>
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