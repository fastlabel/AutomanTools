
import { contextBridge, ipcRenderer } from 'electron';
import { CreateWorkspaceParam } from './@types/global';

// 'myAPI' が API キー
contextBridge.exposeInMainWorld('workspace', {
  openFolderDialog: async (): Promise<string> => await ipcRenderer.invoke('workspace/openFolderDialog'),
  create: async (param: CreateWorkspaceParam): Promise<void> => await ipcRenderer.invoke('workspace/create', param),
});