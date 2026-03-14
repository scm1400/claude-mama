import { MamaState, Locale } from '../shared/types';
import { getMessage } from './messages';
import { DEFAULT_LOCALE } from '../shared/i18n';

export interface UsageInput {
  weeklyUtilization: number | null;
  fiveHourUtilization: number | null;
  error: string | null;
  resetsAt?: string | null;
  fiveHourResetsAt?: string | null;
  dataSource?: 'api' | 'jsonl' | 'none';
  stale?: boolean;
  rateLimited?: boolean;
  locale?: Locale;
}

/**
 * Pure function: derives MamaState from raw usage inputs.
 * No Electron imports. No side effects.
 */
export function computeMood(input: UsageInput): MamaState {
  const {
    weeklyUtilization,
    fiveHourUtilization,
    error,
    resetsAt = null,
    fiveHourResetsAt = null,
    dataSource = 'none',
    stale = false,
    rateLimited = false,
    locale = DEFAULT_LOCALE,
  } = input;

  // No credentials → sleeping
  if (error === 'NO_CREDENTIALS') {
    return {
      mood: 'sleeping',
      utilizationPercent: 0,
      fiveHourPercent: null,
      message: getMessage('sleeping', locale),
      resetsAt: null,
      fiveHourResetsAt: null,
      dataSource: 'none',
      stale: false,
      rateLimited: false,
      error,
    };
  }

  // Rate limited — if we have utilization data (e.g. from JSONL), show normal mood
  // with rateLimited message; if no data, show confused
  if (rateLimited) {
    if (weeklyUtilization !== null) {
      let rlMood: MamaState['mood'];
      if (weeklyUtilization < 15) rlMood = 'angry';
      else if (weeklyUtilization < 50) rlMood = 'worried';
      else if (weeklyUtilization < 85) rlMood = 'happy';
      else rlMood = 'proud';

      return {
        mood: rlMood,
        utilizationPercent: weeklyUtilization,
        fiveHourPercent: fiveHourUtilization,
        message: getMessage('rateLimited', locale),
        resetsAt,
        fiveHourResetsAt,
        dataSource,
        stale,
        rateLimited: true,
        error,
      };
    }
    return {
      mood: 'confused',
      utilizationPercent: 0,
      fiveHourPercent: fiveHourUtilization,
      message: getMessage('rateLimited', locale),
      resetsAt,
      fiveHourResetsAt,
      dataSource,
      stale,
      rateLimited: true,
      error,
    };
  }

  // API error / null data → confused
  if (error !== null || weeklyUtilization === null) {
    return {
      mood: 'confused',
      utilizationPercent: 0,
      fiveHourPercent: fiveHourUtilization,
      message: getMessage('confused', locale),
      resetsAt,
      fiveHourResetsAt,
      dataSource,
      stale,
      rateLimited: false,
      error,
    };
  }

  // Normalize weekly utilization by pacing (elapsed time in reset window)
  // If >= 1 day elapsed and resetsAt is known, use normalized value
  // If < 1 day elapsed or no resetsAt, use absolute value
  let effectiveWeekly = weeklyUtilization;
  if (resetsAt) {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const resetTime = new Date(resetsAt).getTime();
    const now = Date.now();
    const remaining = resetTime - now;
    const elapsed = SEVEN_DAYS_MS - remaining;
    if (elapsed >= ONE_DAY_MS && elapsed > 0) {
      const elapsedFraction = elapsed / SEVEN_DAYS_MS;
      effectiveWeekly = weeklyUtilization / elapsedFraction;
    }
  }

  // Determine mood from 2-axis matrix (effectiveWeekly × 5-hour)
  // When fiveHourUtilization is null, fall back to single-axis thresholds
  let mood: MamaState['mood'];
  if (fiveHourUtilization === null) {
    // Fallback: single-axis thresholds with pacing-normalized value
    if (effectiveWeekly < 25) mood = 'angry';
    else if (effectiveWeekly < 60) mood = 'worried';
    else if (effectiveWeekly < 85) mood = 'happy';
    else mood = 'proud';
  } else {
    // 2-axis mood matrix
    //                          | 5hr < 30%  | 5hr 30-70% | 5hr > 70% |
    // effectiveWeekly < 25%    | angry      | angry      | worried   |
    // effectiveWeekly 25-60%   | worried    | happy      | happy     |
    // effectiveWeekly 60-85%   | worried    | happy      | proud     |
    // effectiveWeekly > 85%    | happy      | proud      | proud     |
    const fiveHourLevel = fiveHourUtilization < 30 ? 0 : fiveHourUtilization <= 70 ? 1 : 2;

    if (effectiveWeekly < 25) {
      mood = fiveHourLevel >= 2 ? 'worried' : 'angry';
    } else if (effectiveWeekly < 60) {
      mood = fiveHourLevel === 0 ? 'worried' : 'happy';
    } else if (effectiveWeekly < 85) {
      mood = fiveHourLevel === 0 ? 'worried' : fiveHourLevel === 1 ? 'happy' : 'proud';
    } else {
      mood = fiveHourLevel === 0 ? 'happy' : 'proud';
    }
  }

  const message = getMessage(mood, locale);

  return {
    mood,
    utilizationPercent: weeklyUtilization,
    fiveHourPercent: fiveHourUtilization,
    message,
    resetsAt,
    fiveHourResetsAt,
    dataSource,
    stale,
    rateLimited: false,
    error: null,
  };
}
