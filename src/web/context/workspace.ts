import { useState } from "react";
import { createContainer } from "unstated-next";
import { ProjectType } from "../types/const";


const FILE_PATH: { [key: string]: string } = {
    projectJson: '/meta/project.json',
    annotationClassesJson: '/meta/annotation_classes.json',
    target: '/target',
    calibration: '/target/calibration',
    targetInfoJson: '/target/target_info.json',
    annotationDataJson: '/output/annotation_data.json'
};

const workspace = window.workspace;

const useWorkspace = () => {
    const [workspaceFolder, setWorkspaceFolder] = useState<string>();

    const create = (vo: { workspaceFolder: string; type: ProjectType; targets: File[] }): Promise<void> => {
        return new Promise((resolve, reject) => {
            workspace.create({
                workspaceFolder: vo.workspaceFolder,
                type: vo.type,
                targets: vo.targets.map(t => ({ path: t.path, name: t.name }))
            })
                .then(() => resolve())
                .catch(err => reject(err));
        });
    };
    return {
        workspaceFolder, setWorkspaceFolder, create
    };
}

export default createContainer(useWorkspace);