import { CreateWorkspaceParam } from "../@types/global";
import { FileDriver } from "./file-driver";


const FILE_PATH: { [key: string]: string } = {
    projectJson: '/meta/project.json',
    annotationClassesJson: '/meta/annotation_classes.json',
    target: '/target',
    calibration: '/target/calibration',
    targetInfoJson: '/target/target_info.json',
    annotationDataJson: '/output/annotation_data.json'
};

export const WorkSpaceDriver = {
    create: (param: CreateWorkspaceParam): Promise<void> => {
        return new Promise((resolve, reject) => {
            FileDriver.makeDir(param.workspaceFolder).then(() => {
                const promises = Object.values(FILE_PATH).map(path => {
                    if (path.endsWith('.json')) {
                        return FileDriver.saveJson(param.workspaceFolder + path, {});
                    }
                    return FileDriver.makeDir(param.workspaceFolder + path);
                });

                Promise.all(
                    // TODO support frame
                    promises.concat(['001'].flatMap(frameNo => param.targets.map(t => {
                        return FileDriver.copyFile(param.workspaceFolder + FILE_PATH.target + '/' + frameNo + '/' + t.name, t.path);
                    })))
                )
                    .then(() => resolve())
                    .catch(err => reject(err));
            }).catch(err => reject(err));
        });
    }
}