
import { app, BrowserWindow, dialog, ipcMain, session } from 'electron';
import { searchDevtools } from 'electron-search-devtools';
import path from 'path';
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
    width: 700,
    height: 580,
    title: 'FastLabel 3D Annotation',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      // contextIsolation: false,
      enableWebSQL: false,
      nativeWindowOpen: true
    },
  });

  mainWindow.setMenuBarVisibility(false);

  ipcMain.handle('workspace/openFolderDialog', async () => {
    const dirPath = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] })
      .then((result) => {
        if (result.canceled) return;
        return result.filePaths[0];
      }).catch((err) => console.log(err));
    return dirPath;
  });

  ipcMain.handle('workspace/save', async (event, param) => {
    const result = await WorkSpaceDriver.saveQuery(param).then().catch((err) => console.log(err));
    return result;
  });

  ipcMain.handle('workspace/load', async (event, param) => {
    const result = await WorkSpaceDriver.loadQuery(param).then(r => r).catch(error => console.log(error));
    return result;
  });

  ipcMain.handle('workspace/exist', async (event, param) => {
    const result = await WorkSpaceDriver.exist(param).then(r => r).catch(error => console.log(error));
    return result;
  });

  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

  // bootstrap remote



  mainWindow.loadFile('dist/index.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());
};

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
