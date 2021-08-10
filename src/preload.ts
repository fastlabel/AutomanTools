
import { contextBridge, ipcRenderer } from 'electron';
import { WKLoadParam, WKSaveParam } from './@types/global';

contextBridge.exposeInMainWorld('workspace', {
  openFolderDialog: async (): Promise<string> => await ipcRenderer.invoke('workspace/openFolderDialog'),
  save: async (param: WKSaveParam) => ipcRenderer.invoke('workspace/save', param),
  load: async (param: WKLoadParam) => ipcRenderer.invoke('workspace/load', param),
  exist: async (param: WKLoadParam) => ipcRenderer.invoke('workspace/exist', param),
});