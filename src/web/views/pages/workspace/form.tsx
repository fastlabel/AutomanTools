import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { ChangeEvent, FC, useCallback } from "react";
import FileField from '../../../components/fields/file-field';
import FolderContentsField from '../../../components/fields/folder-contents-field';
import SelectField from '../../../components/fields/select-field';
import { ProjectType } from '../../../types/const';


const TargetItemTypes = [
    { key: ProjectType.pcd_only, label: 'PCD' },
    { key: ProjectType.pcd_image, label: 'PCD - 画像付き' },
    { key: ProjectType.pcd_image_frames, label: 'PCD - 連続した情報' }];

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
    }),
);

type Props = {
    form: WorkspaceFormState;
    onUpdateForm: React.Dispatch<React.SetStateAction<WorkspaceFormState>>;
};

export type WorkspaceFormState = {
    workspaceFolder?: string;
    type?: ProjectType;
    targets?: File[];
    validState?: 'error' | 'valid';
};

const WorkspaceForm: FC<Props> = ({ form, onUpdateForm }) => {
    const update = (prev: WorkspaceFormState, update: (newState: WorkspaceFormState) => void) => {
        const newState = Object.assign({}, prev);
        update(newState);
        // temp valid
        // TODO impl useCase for valid
        if (newState.workspaceFolder &&
            newState.type &&
            newState.targets &&
            newState.targets.length > 0) {
            newState.validState = 'valid';
        } else {
            newState.validState = 'error';
        }
        return newState;
    };

    const onChangeWorkspaceFolder = useCallback((e: ChangeEvent<any>) => {
        const newWorkspaceFolder = e.target.value;
        onUpdateForm((prevState) => update(prevState, (s => s.workspaceFolder = newWorkspaceFolder)));
    }, []);

    const onChangeType = useCallback((e: ChangeEvent<any>) => {
        const newType = e.target.value;
        onUpdateForm((prevState) => update(prevState, (s => s.type = newType)));
    }, []);

    const onChangeTargets = useCallback((newTargets: File[]) => {
        onUpdateForm((prevState) => update(prevState, (s => s.targets = newTargets)));
    }, []);

    const classes = useStyles();

    return (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <FileField label="ワークスペースフォルダ" value={form.workspaceFolder} onChange={onChangeWorkspaceFolder} />
            </Grid>
            <Grid item>
                <SelectField label="タイプ" disabled value={form.type} items={TargetItemTypes} onChange={onChangeType} />
            </Grid>
            <Grid item >
                <FolderContentsField label="対象"
                    description={({
                        main: "PCDをドラッグ&ドロップしてください",
                        sub: "PCDのみをサポートしています",
                        btn: "PCDをアップロード",
                        btnUpdate: "ファイルを変更"
                    })}
                    maxFiles={1}
                    value={form.targets}
                    onChange={onChangeTargets} />
            </Grid>
        </Grid>
    );
};

export default WorkspaceForm;