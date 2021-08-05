declare global {
  interface Window {
    workspace: Workspace;
  }
};

export interface Workspace {
  openFolderDialog: () => Promise<string>;
  create: (param: CreateWorkspaceParam) => Promise<void>;
};

export type CreateWorkspaceParam = {
  workspaceFolder: string;
  type: ProjectType;
  targets: { path: string, name: string }[]
};