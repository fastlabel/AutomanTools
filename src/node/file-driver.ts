import fs from 'fs';
import path from 'path';

const resolveParent = <T>(pathStr: string, fileFunc: () => Promise<void>): Promise<string> => {
    const dirPath = path.dirname(pathStr);
    return new Promise<string>((resolver, reject) => {
        try {
            fs.stat(dirPath, (err, stats) => {
                if (err) {
                    FileDriver.makeDir(dirPath).then(() => {
                        fileFunc().then(() => resolver(pathStr));
                    });
                } else {
                    fileFunc().then(() => resolver(pathStr));
                }
            })
        } catch (error) {
            reject(error);
        }
    });
};

export const FileDriver = {
    makeDir: (pathStr: string): Promise<string> => {
        return new Promise<string>((resolver, reject) => {
            try {
                fs.mkdir(pathStr, { recursive: true }, () => resolver(pathStr));
            } catch (error) {
                reject(error);
            }
        });
    },
    remove: (pathStr: string): Promise<string> => {
        return new Promise<string>((resolver, reject) => {
            try {
                fs.rm(pathStr, () => resolver(pathStr));
            } catch (error) {
                reject(error);
            }
        });
    },
    removeDir: (pathStr: string): Promise<string> => {
        return new Promise<string>((resolver, reject) => {
            try {
                fs.rmdir(pathStr, { recursive: true }, () => resolver(pathStr));
            } catch (error) {
                reject(error);
            }
        });
    },
    saveFile: <T>(pathStr: string, file: File): Promise<string> => {
        return resolveParent(pathStr, () => new Promise((resolver, reject) => {
            file.arrayBuffer().then(b => {
                fs.writeFile(pathStr, Buffer.from(b), () => resolver());
            });
        }));
    },
    copyFile: <T>(pathStr: string, srcPath: string): Promise<string> => {
        return resolveParent(pathStr, () => new Promise((resolver, reject) => {
            fs.copyFile(srcPath, pathStr, () => resolver());
        }));
    },
    saveJson: <T>(pathStr: string, data: T): Promise<string> => {
        return resolveParent(pathStr, () => new Promise((resolver, reject) => {
            fs.writeFile(pathStr, JSON.stringify(data), 'utf8', () => resolver());
        }));
    },
    loadImage: (pathStr: string): Promise<Buffer> => {
        return new Promise((resolver, reject) => {
            fs.readFile(pathStr, (err, data) => {
                if (err) reject(err);
                resolver(data);
            });
        });
    },
    loadText: (pathStr: string): Promise<string> => {
        return new Promise((resolver, reject) => {
            fs.readFile(pathStr, 'utf8', (err, data) => {
                if (err) reject(err);
                resolver(data);
            });
        });
    },
    loadJson: <T>(pathStr: string): Promise<T> => {
        return new Promise((resolver, reject) => {
            fs.readFile(pathStr, 'utf8', (err, data) => {
                if (err) reject(err);
                resolver(JSON.parse(data));
            });
        });
    }
};