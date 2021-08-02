import { createStyles, makeStyles, Theme } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import React, { ChangeEvent, FC, useCallback, useState } from "react";
import { useDropzone } from 'react-dropzone';
import FileField from '../../../components/fields/file-field';
import FolderContentsField from '../../../components/fields/folder-contents-field';
import SelectField from '../../../components/fields/select-field';


const TargetItemTypes = [
    { key: 'pcd', label: 'PCD' },
    { key: 'pac_image', label: 'PCD - 画像付き' },
    { key: 'multi_pcd', label: 'PCD - 連続した情報' }];

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
    }),
);

type Props = {
    workspaceFolder?: string;
    type?: string;
}

const WorkspaceForm: FC<Props> = (props) => {
    const [workspaceFolder, setWorkspaceFolder] = useState<string>(props.workspaceFolder || '');
    const [type, setType] = useState<string>(props.type || 'pcd');

    const onChangeType = useCallback((e: ChangeEvent<any>) => {
        const newType = e.target.value;
        setType(newType);
    }, []);

    const onFileSelect = useCallback(() => {
        alert('onFileSelect');
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        accept: '.pcd', onDrop: (acceptedFiles) => {

        }
    });

    const classes = useStyles();

    return (
        <Grid container direction="column" spacing={2}>
            <Grid item>
                <FileField label="ワークスペースフォルダ" value={workspaceFolder} onFileSelect={onFileSelect} />
            </Grid>
            <Grid item>
                <SelectField label="タイプ" value={type} items={TargetItemTypes} onChange={onChangeType} />
            </Grid>
            <Grid item >
                <FolderContentsField label="対象"
                    description="PCDをドラッグ&ドロップしてください"
                    subDescription="PCDのみをサポートしています"
                    btnDescription="PCDをアップロード" />
            </Grid>
        </Grid>
    );
};

export default WorkspaceForm;