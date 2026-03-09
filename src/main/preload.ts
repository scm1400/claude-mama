import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, MamaState, MamaSettings } from '../shared/types';

contextBridge.exposeInMainWorld('electronAPI', {
  onMamaStateUpdate: (callback: (state: MamaState) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, state: MamaState) => callback(state);
    ipcRenderer.on(IPC_CHANNELS.MAMA_STATE_UPDATE, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.MAMA_STATE_UPDATE, listener);
  },

  getSettings: (): Promise<MamaSettings> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET);
  },

  setSettings: (settings: Partial<MamaSettings>): Promise<MamaSettings> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings);
  },

  showSettings: (): void => {
    ipcRenderer.send(IPC_CHANNELS.SHOW_SETTINGS);
  },
});
