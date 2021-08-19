import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { FC } from "react";
import FLFileField from '../../../components/fields/fl-file-field';
import FLFolderContentsField from '../../../components/fields/fl-folder-contents-field';
import FLSelectField from '../../../components/fields/fl-select-field';
import { FormAction, FormState } from '../../../components/fields/type';
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
    form: FormState<WorkspaceFormState>;
    dispatchForm: React.Dispatch<FormAction>;
};

export type WorkspaceFormState = {
    workspaceFolder?: string;
    type?: ProjectType;
    targets?: File[];
};

const WorkspaceForm: FC<Props> = ({ form, dispatchForm }) => {
    const classes = useStyles();

    return (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <FLFileField label="ワークスペースフォルダ" form={['workspaceFolder', form, dispatchForm]} />
            </Grid>
            <Grid item>
                <FLSelectField label="タイプ" disabled items={TargetItemTypes} form={['type', form, dispatchForm]} />
            </Grid>
            <Grid item >
                <FLFolderContentsField label="対象"
                    description={({
                        main: "PCDをドラッグ&ドロップしてください",
                        sub: "PCDのみをサポートしています",
                        btn: "PCDをアップロード",
                        btnUpdate: "ファイルを変更"
                    })}
                    maxFiles={1}
                    form={['targets', form, dispatchForm]} />
            </Grid>
        </Grid>
    );
};

export default WorkspaceForm;