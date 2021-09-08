declare global {
  interface Window {
    workspace: Workspace;
    appApi: AppApi;
  }
}

export interface Workspace {
  openFolderDialog: () => Promise<string>;
  save: (param: WKSaveParam) => Promise<void>;
  load: (param: WKLoadParam) => Promise<WKSkeleton<any, ArrayBuffer>>;
  exist: (param: WKLoadParam) => Promise<WKSkeleton<boolean, boolean>>;
}

export type WKJsonSaveCommand = {
  method: 'json';
  resource: any;
};

export type WKCopyCommand = {
  method: 'copy';
  fromPath: string;
  extension: string;
};

export type WKSaveCommand = WKJsonSaveCommand | WKCopyCommand;

export type WKSkeleton<J, R> = {
  meta?: {
    project?: J;
    annotation_classes?: J;
  };
  target?: any;
  //  [frameNo: string]: { [topicId: string]: R | J; } | J
  //  target_info?: J;
  //  calibration?: { [topicId: string]: J; } | 'folder'
  output?: {
    annotation_data: J;
  };
};

export type WKLoadParam = {
  wkDir: string;
  query: WKSkeleton<true, string>;
};

export type WKSaveParam = {
  wkDir: string;
  query: WKSkeleton<WKJsonSaveCommand, WKCopyCommand>;
};

export interface AppApi {
  contextMenu: () => void;

  close: () => Promise<void>;
  restore: () => Promise<void>;
  maximize: () => Promise<void>;
  minimize: () => Promise<void>;

  resized: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeResized: () => Electron.IpcRenderer;

  maximized: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeMaximized: () => Electron.IpcRenderer;

  unMaximized: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeUnMaximized: () => Electron.IpcRenderer;

  getFocus: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeGetFocus: () => Electron.IpcRenderer;

  getBlur: (listener: () => Promise<void>) => Electron.IpcRenderer;
  removeGetBlur: () => Electron.IpcRenderer;
}
