import { autoUpdater } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';

export function initAutoUpdater(): void {
  // Don't check for updates in development
  if (!require('electron').app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('update-available', (info) => {
    console.log(`[auto-updater] Update available: v${info.version}`);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log(`[auto-updater] Update downloaded: v${info.version}`);

    const win = BrowserWindow.getFocusedWindow();
    dialog.showMessageBox(win ?? ({} as BrowserWindow), {
      type: 'info',
      title: 'Claude Mama Update',
      message: `v${info.version} is ready to install.`,
      detail: 'The update will be applied when you restart the app.',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
    }).then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    console.log(`[auto-updater] Error: ${err.message}`);
  });

  // Check for updates after a short delay to avoid slowing startup
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      console.log(`[auto-updater] Check failed: ${err.message}`);
    });
  }, 10_000);
}
