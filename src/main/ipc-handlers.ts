import { ipcMain } from 'electron';
import Store from 'electron-store';
import { IPC_CHANNELS, MamaSettings } from '../shared/types';

const defaults: MamaSettings = {
  position: 'bottom-right',
  autoStart: true,
  characterVisible: true,
};

const store = new Store<MamaSettings>({ defaults });

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => {
    return store.store;
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, (_event, settings: Partial<MamaSettings>) => {
    for (const [key, value] of Object.entries(settings)) {
      store.set(key as keyof MamaSettings, value);
    }
    return store.store;
  });
}
