import React, { CSSProperties } from 'react';
import { MamaMood, MamaErrorExpression, Locale } from '../../shared/types';
import { t } from '../../shared/i18n';

type Expression = MamaMood | MamaErrorExpression;

interface UsageIndicatorProps {
  utilizationPercent: number;
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

export function UsageIndicator({ utilizationPercent, mood, dataSource, locale = 'ko' }: UsageIndicatorProps) {
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

  const fillColor = MOOD_COLORS[mood] ?? '#9ca3af';
  const clampedPercent = Math.min(100, Math.max(0, utilizationPercent));

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
  };

  const trackStyle: CSSProperties = {
    width: 80,
    height: 6,
    background: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  };

  const fillStyle: CSSProperties = {
    height: '100%',
    width: `${clampedPercent}%`,
    background: fillColor,
    borderRadius: 3,
    transition: 'width 0.5s ease, background 0.3s ease',
  };

  const labelStyle: CSSProperties = {
    fontSize: 10,
    color: '#6b7280',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      <div style={trackStyle}>
        <div style={fillStyle} />
      </div>
      <div style={labelStyle}>{clampedPercent.toFixed(0)}%</div>
    </div>
  );
}
