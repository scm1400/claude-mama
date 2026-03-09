/** Mood stages mapped to utilization thresholds */
export type MamaMood = 'angry' | 'worried' | 'happy' | 'proud';

/** Error expression types */
export type MamaErrorExpression = 'confused' | 'sleeping';

/** Data sent from main to renderer on each update */
export interface MamaState {
  mood: MamaMood | MamaErrorExpression;
  utilizationPercent: number;
  fiveHourPercent: number | null;
  message: string;
  resetsAt: string | null;
  dataSource: 'api' | 'cache' | 'none';
  stale: boolean;
  error: string | null;
}

export type Locale = 'ko' | 'en' | 'ja' | 'zh';

/** User preferences (persisted via electron-store) */
export interface MamaSettings {
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  autoStart: boolean;
  characterVisible: boolean;
  locale: Locale;
}

/** IPC channel names */
export const IPC_CHANNELS = {
  MAMA_STATE_UPDATE: 'mama:state-update',
  MAMA_STATE_GET: 'mama:state-get',
  SETTINGS_GET: 'mama:settings-get',
  SETTINGS_SET: 'mama:settings-set',
  SHOW_SETTINGS: 'mama:show-settings',
} as const;
