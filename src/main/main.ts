import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import { registerIpcHandlers, getStore } from './ipc-handlers';
import { UsageTracker } from '../core/usage-tracker';
import { computeMood } from '../core/mood-engine';
import { IPC_CHANNELS, MamaState } from '../shared/types';
import { createTray } from './tray';
import { syncAutoLaunch } from './auto-launch';

const isDev = !app.isPackaged;

const usageTracker = new UsageTracker();
let lastMamaState: MamaState | null = null;

function createWindow(): BrowserWindow {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = 250;
  const winHeight = 300;

  const win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: width - winWidth - 16,
    y: height - winHeight - 16,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.setIgnoreMouseEvents(true, { forward: true });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(app.getAppPath(), 'dist/renderer/index.html'));
  }

  // Send state updates to ALL windows on each poll result
  usageTracker.onUpdate((data) => {
    const locale = getStore().get('locale', 'ko') as import('../shared/types').Locale;
    const state = computeMood({ ...data, locale });
    lastMamaState = state;
    for (const w of BrowserWindow.getAllWindows()) {
      if (!w.isDestroyed()) {
        w.webContents.send(IPC_CHANNELS.MAMA_STATE_UPDATE, state);
      }
    }
  });

  return win;
}

app.whenReady().then(async () => {
  const win = createWindow();

  // Register IPC handlers with main window so position changes can be applied
  registerIpcHandlers(win);

  // Return current state on demand (for settings window)
  ipcMain.handle(IPC_CHANNELS.MAMA_STATE_GET, () => lastMamaState);

  // Create system tray
  createTray(win);

  // Sync auto-launch on startup based on stored preference
  const settings = getStore().store;
  await syncAutoLaunch(settings.autoStart);

  // Start polling after window is ready to receive messages
  win.webContents.once('did-finish-load', () => {
    usageTracker.start();
  });

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

app.on('before-quit', () => {
  usageTracker.stop();
});
