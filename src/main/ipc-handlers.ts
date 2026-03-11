import { ipcMain, BrowserWindow } from 'electron';
import Store from 'electron-store';
import { IPC_CHANNELS, MamaSettings } from '../shared/types';
import { showSettingsWindow } from './settings-window';
import { updateAutoLaunch } from './auto-launch';
import { QuoteCollectionManager } from '../core/quote-collection';
import { generateShareCard } from './share-card';
import { DEFAULT_LOCALE } from '../shared/i18n';

const defaults: Omit<MamaSettings, 'position'> = {
  autoStart: true,
  characterVisible: true,
  locale: DEFAULT_LOCALE,
};

const store = new Store({ defaults });

export function getStore(): Store<MamaSettings> {
  return store;
}

export function registerIpcHandlers(
  mainWindow?: BrowserWindow,
  collectionManager?: QuoteCollectionManager,
): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => {
    return store.store;
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, async (_event, settings: Partial<MamaSettings>) => {
    for (const [key, value] of Object.entries(settings)) {
      store.set(key as keyof MamaSettings, value);
    }

    // Sync auto-launch preference
    if (typeof settings.autoStart === 'boolean') {
      await updateAutoLaunch(settings.autoStart);
    }

    return store.store;
  });

  ipcMain.on(IPC_CHANNELS.SHOW_SETTINGS, () => {
    showSettingsWindow();
  });

  // Collection
  ipcMain.handle(IPC_CHANNELS.COLLECTION_GET, () => {
    return collectionManager?.getState() ?? null;
  });

  // Share card
  ipcMain.handle(IPC_CHANNELS.SHARE_CARD, async (_event, quoteId?: string) => {
    return generateShareCard(quoteId);
  });
}
