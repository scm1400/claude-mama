import React, { CSSProperties, useState, useEffect } from 'react';
import { MamaMood, MamaErrorExpression, Locale } from '../../shared/types';
import { t } from '../../shared/i18n';

type Expression = MamaMood | MamaErrorExpression;

interface UsageIndicatorProps {
  utilizationPercent: number;
  fiveHourPercent: number | null;
  resetsAt: string | null;
  mood: Expression;
  dataSource: 'api' | 'cache' | 'none';
  locale?: Locale;
}

const MOOD_COLORS: Record<Expression, string> = {
  angry: '#ef4444',
  worried: '#eab308',
  happy: '#22c55e',
  proud: '#f59e0b',
  confused: '#9ca3af',
  sleeping: '#9ca3af',
};

function clamp(v: number): number {
  return Math.min(100, Math.max(0, v));
}

function formatTimeLeft(resetsAt: string): string | null {
  const diff = new Date(resetsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h > 0) return `${h}h${m > 0 ? `${m}m` : ''}`;
  return `${m}m`;
}

function useCountdown(resetsAt: string | null): string | null {
  const [text, setText] = useState<string | null>(
    resetsAt ? formatTimeLeft(resetsAt) : null
  );
  useEffect(() => {
    if (!resetsAt) { setText(null); return; }
    setText(formatTimeLeft(resetsAt));
    const id = setInterval(() => {
      setText(formatTimeLeft(resetsAt));
    }, 30_000);
    return () => clearInterval(id);
  }, [resetsAt]);
  return text;
}

function Bar({ percent, color, label }: { percent: number; color: string; label: string }) {
  const clamped = clamp(percent);
  return (
    <div style={styles.barCol}>
      <div style={styles.barLabel}>{label}</div>
      <div style={styles.track}>
        <div style={{ ...styles.fill, width: `${clamped}%`, background: color }} />
      </div>
      <div style={styles.percent}>{clamped.toFixed(0)}%</div>
    </div>
  );
}

export function UsageIndicator({ utilizationPercent, fiveHourPercent, resetsAt, mood, dataSource, locale = 'ko' }: UsageIndicatorProps) {
  const countdown = useCountdown(resetsAt);
  if (dataSource === 'none') {
    return (
      <div style={{
        marginTop: 6,
        fontSize: 11,
        color: '#9ca3af',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center',
      }}>
        {t(locale, 'offline')}
      </div>
    );
  }

  const weeklyColor = MOOD_COLORS[mood] ?? '#9ca3af';
  const fiveHourColor = fiveHourPercent != null && fiveHourPercent > 90 ? '#ef4444' : '#60a5fa';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 6, gap: 2 }}>
      <div style={styles.container}>
        <Bar percent={utilizationPercent} color={weeklyColor} label="7d" />
        {fiveHourPercent != null && (
          <Bar percent={fiveHourPercent} color={fiveHourColor} label="5h" />
        )}
      </div>
      {countdown && (
        <div style={styles.countdown}>↻ {countdown}</div>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countdown: {
    fontSize: 8,
    color: '#9ca3af',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  barCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  barLabel: {
    fontSize: 8,
    color: '#9ca3af',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: 600,
    letterSpacing: '0.05em',
  },
  track: {
    width: 50,
    height: 5,
    background: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
    transition: 'width 0.5s ease, background 0.3s ease',
  },
  percent: {
    fontSize: 9,
    color: '#6b7280',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    textAlign: 'center',
  },
};
