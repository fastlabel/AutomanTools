import { contextBridge, ipcRenderer } from 'electron';
import { WKLoadParam, WKSaveParam } from './@types/global';

contextBridge.exposeInMainWorld('workspace', {
  openFolderDialog: async (): Promise<string> =>
    await ipcRenderer.invoke('workspace/openFolderDialog'),
  save: async (param: WKSaveParam) =>
    ipcRenderer.invoke('workspace/save', param),
  load: async (param: WKLoadParam) =>
    ipcRenderer.invoke('workspace/load', param),
  exist: async (param: WKLoadParam) =>
    ipcRenderer.invoke('workspace/exist', param),
});

contextBridge.exposeInMainWorld('appApi', {
  contextMenu: () => ipcRenderer.send('show-context-menu'),

  close: async () => ipcRenderer.invoke('close'),
  minimize: async () => ipcRenderer.invoke('minimize'),
  maximize: async () => ipcRenderer.invoke('maximize'),
  restore: async () => ipcRenderer.invoke('restore'),

  resized: (listener: () => Promise<void>) =>
    ipcRenderer.on('resized', listener),
  removeResized: () => ipcRenderer.removeAllListeners('resized'),

  maximized: (listener: () => Promise<void>) =>
    ipcRenderer.on('maximized', listener),
  removeMaximized: () => ipcRenderer.removeAllListeners('maximized'),

  unMaximized: (listener: () => Promise<void>) =>
    ipcRenderer.on('unMaximized', listener),
  removeUnMaximized: () => ipcRenderer.removeAllListeners('unMaximized'),

  getFocus: (listener: () => Promise<void>) =>
    ipcRenderer.on('get-focus', listener),
  removeGetFocus: () => ipcRenderer.removeAllListeners('get-focus'),

  getBlur: (listener: () => Promise<void>) =>
    ipcRenderer.on('get-blur', listener),
  removeGetBlur: () => ipcRenderer.removeAllListeners('get-blur'),
});
