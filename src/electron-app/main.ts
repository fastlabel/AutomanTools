import { app, BrowserWindow, dialog, ipcMain, session } from 'electron';
import { searchDevtools } from 'electron-search-devtools';
import fs from 'fs';
import path from 'path';
import { WKExportPram } from './@types/global';
import { WorkSpaceDriver } from './node/workspace';

const isDev = process.env.NODE_ENV === 'development';

/// #if DEBUG
const execPath =
  process.platform === 'win32'
    ? '../node_modules/electron/dist/electron.exe'
    : '../node_modules/.bin/electron';

if (isDev) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('electron-reload')(__dirname, {
    electron: path.resolve(__dirname, execPath),
    forceHardReset: true,
    hardResetMethod: 'exit',
  });
}
/// #endif

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    title: 'FastLabel 3D Annotation',
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      // contextIsolation: false,
      enableWebSQL: false,
      nativeWindowOpen: true,
    },
  });

  mainWindow.setMenuBarVisibility(false);

  ipcMain.handle('workspace/openFolderDialog', async () => {
    const dirPath = await dialog
      .showOpenDialog(mainWindow, {
        properties: ['openDirectory', 'createDirectory'],
      })
      .then((result) => {
        if (result.canceled) return;
        return result.filePaths[0];
      })
      .catch((err) => console.log(err));
    return dirPath;
  });

  ipcMain.handle('workspace/save', async (event, param) => {
    const result = await WorkSpaceDriver.saveQuery(param)
      .then()
      .catch((err) => console.log(err));
    return result;
  });

  ipcMain.handle('workspace/load', async (event, param) => {
    const result = await WorkSpaceDriver.loadQuery(param)
      .then((r) => r)
      .catch((error) => console.log(error));
    return result;
  });

  ipcMain.handle('workspace/exist', async (event, param) => {
    const result = await WorkSpaceDriver.exist(param)
      .then((r) => r)
      .catch((error) => console.log(error));
    return result;
  });

  ipcMain.handle('workspace/checkWorkspace', async (event, param) => {
    const result = await WorkSpaceDriver.checkWorkspace(param)
      .then((r) => r)
      .catch((error) => console.log(error));
    return result;
  });

  ipcMain.handle('workspace/export', async (event, param: WKExportPram) => {
    const path = dialog.showSaveDialogSync(mainWindow, {
      buttonLabel: '保存',
      defaultPath: param.fileName,
      filters: [{ name: '*', extensions: ['json'] }],
      properties: ['createDirectory'],
    });
    // キャンセルで閉じた場合
    if (path === undefined) {
      return { status: undefined };
    }

    // ファイルの内容を返却
    try {
      fs.writeFileSync(path, JSON.stringify(param.dataJson, null, 2));
      return { status: true, path: path };
    } catch (error: any) {
      return { status: false, message: error.message };
    }
  });

  ipcMain.handle('minimize', () => mainWindow.minimize());
  ipcMain.handle('maximize', () => mainWindow.maximize());
  ipcMain.handle('restore', () => mainWindow.unmaximize());
  ipcMain.handle('close', () => mainWindow.close());

  mainWindow.on('maximize', () => mainWindow.webContents.send('maximized'));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('unMaximized'));
  mainWindow.on('resized', () => {
    if (mainWindow.isMaximized()) return;
    mainWindow.webContents.send('resized');
  });
  mainWindow.on('focus', () => mainWindow.webContents.send('get-focus'));
  mainWindow.on('blur', () => mainWindow.webContents.send('get-blur'));

  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

  // bootstrap remote

  mainWindow.loadFile('dist/index.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());
};

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  if (isDev) {
    const devtools = await searchDevtools('REACT');
    if (devtools) {
      await session.defaultSession.loadExtension(devtools, {
        allowFileAccess: true,
      });
    }
  }
  createWindow();
});

app.once('window-all-closed', () => app.quit());
