import fs from 'fs';
import path from 'path';
import YAML from 'yaml';

const resolveParent = <T>(
  pathStr: string,
  fileFunc: () => Promise<void>
): Promise<string> => {
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
      });
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
    return resolveParent(
      pathStr,
      () =>
        new Promise((resolver, reject) => {
          file.arrayBuffer().then((b) => {
            fs.writeFile(pathStr, Buffer.from(b), () => resolver());
          });
        })
    );
  },
  copyFile: <T>(pathStr: string, srcPath: string): Promise<string> => {
    console.debug('copyFile :' + pathStr);
    return resolveParent(
      pathStr,
      () =>
        new Promise((resolver, reject) => {
          fs.copyFile(srcPath, pathStr, () => resolver());
        })
    );
  },
  saveJson: <T>(pathStr: string, data: T): Promise<string> => {
    console.debug('saveJson :' + pathStr);
    return resolveParent(
      pathStr,
      () =>
        new Promise((resolver, reject) => {
          fs.writeFile(pathStr, JSON.stringify(data), 'utf8', () => resolver());
        })
    );
  },
  exist: (pathStr: string): Promise<boolean> => {
    return new Promise((resolver, reject) => {
      fs.readFile(pathStr, (err, data) => {
        if (err) reject(err);
        resolver(!!data);
      });
    });
  },
  emptyDir: (pathStr: string): Promise<boolean> => {
    return new Promise((resolver, reject) => {
      fs.readdir(pathStr, (err, files) => {
        if (err) reject(err);
        resolver(files.length === 0);
      });
    });
  },
  load: (pathStr: string): Promise<ArrayBuffer> => {
    console.debug('load :' + pathStr);
    return new Promise((resolver, reject) => {
      fs.readFile(pathStr, (err, data) => {
        if (err) reject(err);
        const ab = new ArrayBuffer(data.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < data.length; ++i) {
          view[i] = data[i];
        }
        resolver(ab);
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
    console.debug('loadJson :' + pathStr);
    return new Promise((resolver, reject) => {
      fs.readFile(pathStr, 'utf8', (err, data) => {
        if (err) reject(err);
        resolver(JSON.parse(data));
      });
    });
  },
  loadYaml: <T>(pathStr: string): Promise<T> => {
    console.debug('loadYaml :' + pathStr);
    return new Promise((resolver, reject) => {
      fs.readFile(pathStr, 'utf8', (err, data) => {
        if (err) reject(err);
        resolver(YAML.parse(data));
      });
    });
  },
};
