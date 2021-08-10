declare global {
  interface Window {
    workspace: Workspace;
  }
};

export interface Workspace {
  openFolderDialog: () => Promise<string>;
  save: (param: WKSaveParam) => Promise<void>;
  load: (param: WKLoadParam) => Promise<WKSkeleton<any, ArrayBuffer>>;
  exist: (param: WKLoadParam) => Promise<WKSkeleton<boolean, boolean>>;
};

export type WKJsonSaveCommand = {
  method: 'json'
  resource: any;
};

export type WKCopyCommand = {
  method: 'copy'
  fromPath: string;
  extension: string;
};

export type WKSaveCommand = WKJsonSaveCommand | WKCopyCommand;

export type WKSkeleton<J, R> = {
  meta?: {
    project?: J;
    annotation_classes?: J;
  };
  target?: {
    [frameNo: string]: { [topicId: string]: R | J; } | J,
  } &
  { target_info?: J } &
  { calibration?: { [topicId: string]: J; } };
  output?: {
    annotation_data: J;
  }
}

export type WKLoadParam = {
  wkDir: string;
  query: WKSkeleton<true, string>
};

export type WKSaveParam = {
  wkDir: string;
  query: WKSkeleton<WKJsonSaveCommand, WKCopyCommand>
};