import { Tray, Menu, nativeImage, BrowserWindow, app } from 'electron';
import { showSettingsWindow } from './settings-window';

let trayInstance: Tray | null = null;

export function createTray(mainWindow: BrowserWindow): Tray {
  const icon = buildTrayIcon();

  trayInstance = new Tray(icon);
  trayInstance.setToolTip('Claude Mama');

  updateContextMenu(mainWindow);

  trayInstance.on('double-click', () => {
    toggleWindowVisibility(mainWindow);
  });

  // Re-build menu when window visibility changes so label stays in sync
  mainWindow.on('show', () => updateContextMenu(mainWindow));
  mainWindow.on('hide', () => updateContextMenu(mainWindow));

  return trayInstance;
}

function buildTrayIcon(): Electron.NativeImage {
  // 16x16 pink circle (#FF69B4) using raw RGBA bitmap
  const size = 16;
  const data = Buffer.alloc(size * size * 4);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const dx = x - cx + 0.5;
      const dy = y - cy + 0.5;
      const inside = Math.sqrt(dx * dx + dy * dy) <= r;

      data[idx]     = inside ? 0xff : 0; // R
      data[idx + 1] = inside ? 0x69 : 0; // G
      data[idx + 2] = inside ? 0xb4 : 0; // B
      data[idx + 3] = inside ? 0xff : 0; // A
    }
  }

  return nativeImage.createFromBitmap(data, { width: size, height: size });
}

function toggleWindowVisibility(win: BrowserWindow): void {
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    win.focus();
  }
}

function updateContextMenu(mainWindow: BrowserWindow): void {
  if (!trayInstance) return;

  const isVisible = mainWindow.isVisible();
  const contextMenu = Menu.buildFromTemplate([
    {
      label: isVisible ? 'Hide Mama' : 'Show Mama',
      click: () => toggleWindowVisibility(mainWindow),
    },
    { type: 'separator' },
    {
      label: 'Settings...',
      click: () => showSettingsWindow(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit(),
    },
  ]);

  trayInstance.setContextMenu(contextMenu);
}
