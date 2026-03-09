import { MamaState, MamaSettings } from '../shared/types';

declare global {
  interface Window {
    electronAPI: {
      onMamaStateUpdate: (callback: (state: MamaState) => void) => () => void;
      getMamaState: () => Promise<MamaState | null>;
      getSettings: () => Promise<MamaSettings>;
      setSettings: (settings: Partial<MamaSettings>) => Promise<MamaSettings>;
      showSettings: () => void;
    };
  }
}

export {};
