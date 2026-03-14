import { describe, it, expect, vi, afterEach } from 'vitest';
import { computeMood } from '../mood-engine';
import { MESSAGE_POOLS } from '../messages';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('computeMood — single-axis fallback (fiveHourUtilization = null)', () => {
  it('0% → angry', () => {
    const state = computeMood({ weeklyUtilization: 0, fiveHourUtilization: null, error: null });
    expect(state.mood).toBe('angry');
  });

  it('24% → angry', () => {
    const state = computeMood({ weeklyUtilization: 24, fiveHourUtilization: null, error: null });
    expect(state.mood).toBe('angry');
  });

  it('25% → worried', () => {
    const state = computeMood({ weeklyUtilization: 25, fiveHourUtilization: null, error: null });
    expect(state.mood).toBe('worried');
  });

  it('59% → worried', () => {
    const state = computeMood({ weeklyUtilization: 59, fiveHourUtilization: null, error: null });
    expect(state.mood).toBe('worried');
  });

  it('60% → happy', () => {
    const state = computeMood({ weeklyUtilization: 60, fiveHourUtilization: null, error: null });
    expect(state.mood).toBe('happy');
  });

  it('84% → happy', () => {
    const state = computeMood({ weeklyUtilization: 84, fiveHourUtilization: null, error: null });
    expect(state.mood).toBe('happy');
  });

  it('85% → proud', () => {
    const state = computeMood({ weeklyUtilization: 85, fiveHourUtilization: null, error: null });
    expect(state.mood).toBe('proud');
  });

  it('100% → proud', () => {
    const state = computeMood({ weeklyUtilization: 100, fiveHourUtilization: null, error: null });
    expect(state.mood).toBe('proud');
  });
});

describe('computeMood — 2-axis mood matrix', () => {
  // weekly < 25%
  it('weekly=10, 5hr=20 (low/low) → angry', () => {
    const state = computeMood({ weeklyUtilization: 10, fiveHourUtilization: 20, error: null });
    expect(state.mood).toBe('angry');
  });

  it('weekly=10, 5hr=50 (low/mid) → angry', () => {
    const state = computeMood({ weeklyUtilization: 10, fiveHourUtilization: 50, error: null });
    expect(state.mood).toBe('angry');
  });

  it('weekly=10, 5hr=80 (low/high) → worried', () => {
    const state = computeMood({ weeklyUtilization: 10, fiveHourUtilization: 80, error: null });
    expect(state.mood).toBe('worried');
  });

  // weekly 25-60%
  it('weekly=40, 5hr=10 (mid-low/low) → worried', () => {
    const state = computeMood({ weeklyUtilization: 40, fiveHourUtilization: 10, error: null });
    expect(state.mood).toBe('worried');
  });

  it('weekly=40, 5hr=50 (mid-low/mid) → happy', () => {
    const state = computeMood({ weeklyUtilization: 40, fiveHourUtilization: 50, error: null });
    expect(state.mood).toBe('happy');
  });

  it('weekly=40, 5hr=80 (mid-low/high) → happy', () => {
    const state = computeMood({ weeklyUtilization: 40, fiveHourUtilization: 80, error: null });
    expect(state.mood).toBe('happy');
  });

  // weekly 60-85%
  it('weekly=70, 5hr=10 (mid-high/low) → worried', () => {
    const state = computeMood({ weeklyUtilization: 70, fiveHourUtilization: 10, error: null });
    expect(state.mood).toBe('worried');
  });

  it('weekly=70, 5hr=50 (mid-high/mid) → happy', () => {
    const state = computeMood({ weeklyUtilization: 70, fiveHourUtilization: 50, error: null });
    expect(state.mood).toBe('happy');
  });

  it('weekly=70, 5hr=80 (mid-high/high) → proud', () => {
    const state = computeMood({ weeklyUtilization: 70, fiveHourUtilization: 80, error: null });
    expect(state.mood).toBe('proud');
  });

  // weekly > 85%
  it('weekly=90, 5hr=10 (high/low) → happy', () => {
    const state = computeMood({ weeklyUtilization: 90, fiveHourUtilization: 10, error: null });
    expect(state.mood).toBe('happy');
  });

  it('weekly=90, 5hr=50 (high/mid) → proud', () => {
    const state = computeMood({ weeklyUtilization: 90, fiveHourUtilization: 50, error: null });
    expect(state.mood).toBe('proud');
  });

  it('weekly=90, 5hr=80 (high/high) → proud', () => {
    const state = computeMood({ weeklyUtilization: 90, fiveHourUtilization: 80, error: null });
    expect(state.mood).toBe('proud');
  });

  // Boundary tests for 5-hour ranges
  it('5hr=29 (boundary low) → treated as low', () => {
    const state = computeMood({ weeklyUtilization: 40, fiveHourUtilization: 29, error: null });
    expect(state.mood).toBe('worried');
  });

  it('5hr=30 (boundary mid) → treated as mid', () => {
    const state = computeMood({ weeklyUtilization: 40, fiveHourUtilization: 30, error: null });
    expect(state.mood).toBe('happy');
  });

  it('5hr=70 (boundary mid upper) → treated as mid', () => {
    const state = computeMood({ weeklyUtilization: 40, fiveHourUtilization: 70, error: null });
    expect(state.mood).toBe('happy');
  });

  it('5hr=71 (boundary high) → treated as high', () => {
    const state = computeMood({ weeklyUtilization: 40, fiveHourUtilization: 71, error: null });
    expect(state.mood).toBe('happy');
  });
});

describe('computeMood — no fiveHourWarning override', () => {
  it('fiveHourUtilization > 90 does NOT produce fiveHourWarning message', () => {
    const state = computeMood({ weeklyUtilization: 20, fiveHourUtilization: 95, error: null });
    // 5hr=95 is high bucket → weekly<25 + 5hr high → worried
    expect(state.mood).toBe('worried');
    // Message should be mood message, NOT fiveHourWarning
    expect(MESSAGE_POOLS.ko.fiveHourWarning).not.toContain(state.message);
    expect(MESSAGE_POOLS.ko.worried).toContain(state.message);
  });

  it('fiveHourPercent is still reported in state', () => {
    const state = computeMood({ weeklyUtilization: 60, fiveHourUtilization: 95, error: null });
    expect(state.fiveHourPercent).toBe(95);
  });
});

describe('computeMood — error / null input', () => {
  it('error !== null → confused mood', () => {
    const state = computeMood({ weeklyUtilization: null, fiveHourUtilization: null, error: 'Network error' });
    expect(state.mood).toBe('confused');
    expect(MESSAGE_POOLS.ko.confused).toContain(state.message);
  });

  it('weeklyUtilization = null with no error → confused mood', () => {
    const state = computeMood({ weeklyUtilization: null, fiveHourUtilization: null, error: null });
    expect(state.mood).toBe('confused');
  });

  it('dataSource is propagated on error state', () => {
    const state = computeMood({
      weeklyUtilization: null,
      fiveHourUtilization: null,
      error: 'Cache unavailable',
      dataSource: 'cache',
      stale: true,
    });
    expect(state.dataSource).toBe('cache');
    expect(state.stale).toBe(true);
  });
});

describe('computeMood — no credentials → sleeping', () => {
  it('NO_CREDENTIALS error → sleeping mood', () => {
    const state = computeMood({ weeklyUtilization: null, fiveHourUtilization: null, error: 'NO_CREDENTIALS' });
    expect(state.mood).toBe('sleeping');
    expect(MESSAGE_POOLS.ko.sleeping).toContain(state.message);
  });

  it('sleeping state has dataSource none', () => {
    const state = computeMood({ weeklyUtilization: null, fiveHourUtilization: null, error: 'NO_CREDENTIALS' });
    expect(state.dataSource).toBe('none');
    expect(state.stale).toBe(false);
  });
});

describe('computeMood — message stability', () => {
  it('same input in the same 2-min window produces the same message', () => {
    const input = { weeklyUtilization: 60, fiveHourUtilization: null, error: null };
    const state1 = computeMood(input);
    const state2 = computeMood(input);
    expect(state1.message).toBe(state2.message);
  });

  it('messages may differ across 2-min windows', () => {
    const input = { weeklyUtilization: 60, fiveHourUtilization: null, error: null };
    const baseWindow = Math.floor(Date.now() / 120_000);
    vi.spyOn(Date, 'now').mockReturnValue(baseWindow * 120_000);
    const state1 = computeMood(input);
    vi.spyOn(Date, 'now').mockReturnValue((baseWindow + 1) * 120_000);
    const state2 = computeMood(input);
    expect(MESSAGE_POOLS.ko.happy).toContain(state1.message);
    expect(MESSAGE_POOLS.ko.happy).toContain(state2.message);
  });
});

describe('computeMood — state shape', () => {
  it('returns all required MamaState fields', () => {
    const state = computeMood({ weeklyUtilization: 60, fiveHourUtilization: 50, error: null, resetsAt: '2026-03-10T00:00:00Z', fiveHourResetsAt: '2026-03-09T18:00:00Z', dataSource: 'api', stale: false });
    expect(state).toHaveProperty('mood');
    expect(state).toHaveProperty('utilizationPercent', 60);
    expect(state).toHaveProperty('fiveHourPercent', 50);
    expect(state).toHaveProperty('message');
    expect(state).toHaveProperty('resetsAt', '2026-03-10T00:00:00Z');
    expect(state).toHaveProperty('fiveHourResetsAt', '2026-03-09T18:00:00Z');
    expect(state).toHaveProperty('dataSource', 'api');
    expect(state).toHaveProperty('stale', false);
    expect(state).toHaveProperty('error', null);
  });
});
