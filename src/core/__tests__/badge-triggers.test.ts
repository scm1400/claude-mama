import { describe, it, expect } from 'vitest';
import { evaluateBadgeTriggers } from '../badge-triggers';
import { BadgeTriggerContext } from '../../shared/types';

function makeCtx(overrides: Partial<BadgeTriggerContext> = {}): BadgeTriggerContext {
  return {
    weeklyUtilization: 30,
    fiveHourUtilization: null,
    dailyHistory: [],
    installDate: '2026-01-01T00:00:00Z',
    firstApiCallSeen: true,
    now: new Date('2026-03-14T10:00:00Z'),
    resetsAt: null,
    proudCount: 0,
    angryCount: 0,
    ...overrides,
  };
}

describe('evaluateBadgeTriggers', () => {
  it('triggers badge_first_call on firstApiCallSeen transition', () => {
    const ctx = makeCtx({ firstApiCallSeen: false, weeklyUtilization: 5 });
    expect(evaluateBadgeTriggers(ctx)).toContain('badge_first_call');
  });

  it('does not trigger badge_first_call when already seen', () => {
    const ctx = makeCtx({ firstApiCallSeen: true });
    expect(evaluateBadgeTriggers(ctx)).not.toContain('badge_first_call');
  });

  it('triggers badge_streak_3 with 3 consecutive days', () => {
    const ctx = makeCtx({
      dailyHistory: [
        { date: '2026-03-12', percent: 10 },
        { date: '2026-03-13', percent: 20 },
        { date: '2026-03-14', percent: 30 },
      ],
    });
    expect(evaluateBadgeTriggers(ctx)).toContain('badge_streak_3');
  });

  it('triggers badge_mama_7days after 7 days', () => {
    const ctx = makeCtx({
      installDate: '2026-03-07T00:00:00Z',
      now: new Date('2026-03-14T10:00:00Z'),
    });
    expect(evaluateBadgeTriggers(ctx)).toContain('badge_mama_7days');
  });

  it('triggers badge_half at 50%', () => {
    const ctx = makeCtx({ weeklyUtilization: 50 });
    expect(evaluateBadgeTriggers(ctx)).toContain('badge_half');
  });

  it('triggers badge_full at 100%', () => {
    const ctx = makeCtx({ weeklyUtilization: 100 });
    expect(evaluateBadgeTriggers(ctx)).toContain('badge_full');
  });

  it('triggers badge_proud_10 at proudCount >= 10', () => {
    const ctx = makeCtx({ proudCount: 10 });
    expect(evaluateBadgeTriggers(ctx)).toContain('badge_proud_10');
  });

  it('triggers badge_survivor at angryCount >= 10 with active usage', () => {
    const ctx = makeCtx({ angryCount: 10, weeklyUtilization: 20 });
    expect(evaluateBadgeTriggers(ctx)).toContain('badge_survivor');
  });

  it('does not trigger badge_survivor at angryCount >= 10 with zero usage', () => {
    const ctx = makeCtx({ angryCount: 10, weeklyUtilization: 0 });
    expect(evaluateBadgeTriggers(ctx)).not.toContain('badge_survivor');
  });

  it('triggers badge_streak_7 with 7 consecutive days', () => {
    const history = Array.from({ length: 7 }, (_, i) => ({
      date: `2026-03-${String(8 + i).padStart(2, '0')}`,
      percent: 10 + i,
    }));
    const ctx = makeCtx({ dailyHistory: history });
    expect(evaluateBadgeTriggers(ctx)).toContain('badge_streak_7');
  });
});
