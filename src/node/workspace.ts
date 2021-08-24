import fs from 'fs';
import { WKLoadParam, WKSaveCommand, WKSaveParam, WKSkeleton } from "../@types/global";
import { FileDriver } from "./file-driver";

const reduceQuery = async <T>(
    target: any,
    reducer: (path: string, value: T) => Promise<any>,
    targetCond?: (value: T) => boolean,
) => {
    const resultObj: any = {};
    const promiseList: Promise<any>[] = [];

    const _targetCond = targetCond || ((val: T) => typeof val === 'object' && val !== null);

    Object.keys(target).forEach(key => {
        const keys = [key];
        const pathStr = keys.join('/');
        const val = target[key];
        if (_targetCond(val)) {
            const current = {};
            resultObj[key] = current;
            _reduceQuery(val as any, reducer, _targetCond, current, keys, promiseList);
        } else if (val) {
            const promise = reducer(pathStr, val);
            promiseList.push(promise);
            promise.then(resolved => {
                resultObj[key] = resolved;
            });
        };
    });
    try {
        await Promise.all(promiseList);
    } catch (err) {
        return err;
    }
    return resultObj;
};

const _reduceQuery = <T>(
    target: any,
    reducer: (path: string, value: T) => Promise<any>,
    targetCond: (value: T) => boolean,
    resultObj: any,
    parentKeys: string[],
    promiseList: Promise<any>[],
) => {
    Object.keys(target).forEach(key => {
        const keys = parentKeys.concat([key]);
        const pathStr = keys.join('/');
        const val = target[key];
        if (targetCond(val)) {
            const current = {};
            resultObj[key] = current;
            _reduceQuery(val as any, reducer, targetCond, current, keys, promiseList);
        } else if (val) {
            const promise = reducer(pathStr, val);
            promiseList.push(promise);
            promise.then(resolved => {
                resultObj[key] = resolved;
            });
        };
    });
};

export const WorkSpaceDriver = {
    saveQuery: (param: WKSaveParam): Promise<void> => {
        return new Promise((resolve, reject) => {
            reduceQuery<WKSaveCommand>(param.query, (path, value) => {
                const targetPath = `${param.wkDir}/${path}`;
                if (value.method === 'json') {
                    return FileDriver.saveJson(targetPath + '.json', value.resource);
                } else if (value.method === 'copy') {
                    return FileDriver.copyFile(targetPath + '.' + value.extension, value.fromPath);
                }
                throw new Error(`not supported method type !! arg:${JSON.stringify(value)}`);
            }, (val) => !val.method).then(() => {
                resolve();
            });
        });
    },
    loadQuery: (param: WKLoadParam): Promise<WKSkeleton<any, ArrayBuffer>> => {
        return new Promise((resolve, reject) => {
            reduceQuery<true | string>(param.query, (path, value) => {
                const targetPath = `${param.wkDir}/${path}`;
                if (value === true) {
                    // load Json
                    return FileDriver.loadJson(targetPath + '.json');
                } else if (value === 'folder') {
                    const folderFiles = fs.readdirSync(targetPath).reduce<any>((r, p) => {
                        const [fileName, extension] = p.split('.');
                        console.debug({ path, fileName, extension });
                        r[fileName] = extension;
                        return r;
                    }, {});
                    return reduceQuery(folderFiles, (path, value) => {
                        const folderFilePath = `${targetPath}/${path}`;
                        if (value === 'yaml' || value === 'yml') {
                            return FileDriver.loadYaml(folderFilePath + '.' + value);
                        }
                        throw new Error('not supported extension:' + value);
                    })
                } else if (value === 'yaml' || value === 'yml') {
                    return FileDriver.loadYaml(targetPath + '.' + value);
                }
                // load resource
                return FileDriver.load(targetPath + '.' + value);
            }).then((result) => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    },
    exist: (param: WKLoadParam): Promise<WKSkeleton<boolean, boolean>> => {
        return new Promise((resolve, reject) => {
            reduceQuery<true | string>(param.query, (path, value) => {
                const targetPath = `${param.wkDir}/${path}`;
                if (value === true) {
                    // load Json
                    return FileDriver.exist(targetPath + '.json');
                }
                // load resource
                return FileDriver.exist(targetPath + '.' + value);
            }).then((result) => {
                resolve(result);
            }).catch(err => {
                reject(err);
            });
        });
    }
}