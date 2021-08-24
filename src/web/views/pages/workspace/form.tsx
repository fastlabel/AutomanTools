import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { FC } from "react";
import FLFileField from '../../../components/fields/fl-file-field';
import FLFolderContentsField from '../../../components/fields/fl-folder-contents-field';
import FLSelectField from '../../../components/fields/fl-select-field';
import { FormUtil } from '../../../components/fields/form-util';
import { FormAction, FormState } from '../../../components/fields/type';
import { ProjectType } from '../../../types/const';


const TargetItemTypes = [
    { key: ProjectType.pcd_only, label: 'PCD' },
    { key: ProjectType.pcd_image, label: 'PCD - 画像付き' },
    // { key: ProjectType.pcd_image_frames, label: 'PCD - 連続した情報' }
];

const CONST_FILE_PROPS: any = {
    pcd_only: {
        description: {
            main: "PCDをドラッグ&ドロップしてください",
            sub: "PCDのみをサポートしています",
            btn: "PCDをアップロード",
            btnUpdate: "ファイルを変更"
        },
        accept: '.pcd',
        maxFiles: 1
    },
    pcd_image: {
        description: {
            main: "PCD/画像をドラッグ&ドロップしてください",
            sub: "PCD/PNG/JPEGのみをサポートしています",
            btn: "PCD/画像をアップロード",
            btnUpdate: "ファイルを変更"
        },
        accept: ['.pcd', 'image/jpeg', 'image/png', '.yaml']
    },
};

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

    const typeValue = FormUtil.resolve('type', form.data);
    const folderContentsProps = CONST_FILE_PROPS[typeValue];

    return (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <FLFileField label="ワークスペースフォルダ" form={['workspaceFolder', form, dispatchForm]} />
            </Grid>
            <Grid item>
                <FLSelectField label="タイプ" items={TargetItemTypes} form={['type', form, dispatchForm]} />
            </Grid>
            <Grid item >
                <FLFolderContentsField label="対象"
                    form={['targets', form, dispatchForm]}
                    {...folderContentsProps} />
            </Grid>
        </Grid>
    );
};

export default WorkspaceForm;