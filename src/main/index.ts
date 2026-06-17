import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { loadConfig } from './config';
import { CaptureWorkflow } from './domain/services/CaptureWorkflow';
import { DigiCamControlAdapter } from './adapters/DigiCamControlAdapter';
import { NodeFileSystemAdapter } from './adapters/NodeFileSystemAdapter';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const config = loadConfig();

  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'OpenPhotobooth',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  const camera = new DigiCamControlAdapter(config.digiCamControlUrl);
  const fileSystem = new NodeFileSystemAdapter();
  const workflow = new CaptureWorkflow(camera, fileSystem, [], {
    saveFolder: config.saveFolder,
    hotPrintFolder: config.hotPrintFolder,
  });

  ipcMain.handle('capture', async (event) => {
    event.sender.send('capture-status', 'capturing');
    try {
      await workflow.run();
      event.sender.send('capture-status', 'ready');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      event.sender.send('capture-status', `error: ${message}`);
      throw err;
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    ipcMain.removeAllListeners('capture');
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
