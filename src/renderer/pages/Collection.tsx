import React, { useEffect, useState } from 'react';
import { CollectionState, QuoteRarity, Locale, BadgeState, BadgeTier } from '../../shared/types';
import { t, UIStringKey } from '../../shared/i18n';
import { QUOTE_REGISTRY } from '../../core/quote-registry';
import { BADGE_REGISTRY } from '../../core/badge-registry';

const RARITY_ORDER: QuoteRarity[] = ['common', 'rare', 'legendary', 'secret'];
const RARITY_COLORS: Record<QuoteRarity, string> = {
  common: '#6b7280', rare: '#3b82f6', legendary: '#f59e0b', secret: '#8b5cf6',
};
const TIER_ORDER: BadgeTier[] = ['bronze', 'silver', 'gold'];
const TIER_COLORS: Record<BadgeTier, string> = {
  bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700',
};

interface Props {
  locale: Locale;
}

export default function Collection({ locale }: Props) {
  const [collection, setCollection] = useState<CollectionState | null>(null);
  const [badgeState, setBadgeState] = useState<BadgeState | null>(null);
  const [subTab, setSubTab] = useState<'quotes' | 'badges'>('quotes');
  const i = (key: UIStringKey) => t(locale, key);

  useEffect(() => {
    window.electronAPI.getCollection().then((c) => {
      if (c) setCollection(c as CollectionState);
    });
    const unsub = window.electronAPI.onCollectionUpdated((state) => {
      setCollection(state as CollectionState);
    });
    return unsub;
  }, []);

  useEffect(() => {
    window.electronAPI.getBadges().then((b) => {
      if (b) setBadgeState(b as BadgeState);
    });
    const unsubBadge = window.electronAPI.onBadgeUnlocked(() => {
      window.electronAPI.getBadges().then((b) => {
        if (b) setBadgeState(b as BadgeState);
      });
    });
    return () => { unsubBadge(); };
  }, []);

  if (!collection) {
    return <div style={s.empty}>{t(locale, 'loading')}</div>;
  }

  return (
    <div style={s.wrapper}>
      {/* Sub-tab bar */}
      <div style={s.subTabBar}>
        <button
          style={{ ...s.subTab, ...(subTab === 'quotes' ? s.subTabActive : {}) }}
          onClick={() => setSubTab('quotes')}
        >
          {i('tab_collection')}
        </button>
        <button
          style={{ ...s.subTab, ...(subTab === 'badges' ? s.subTabActive : {}) }}
          onClick={() => setSubTab('badges')}
        >
          {i('tab_badges')}
        </button>
      </div>

      {subTab === 'quotes' ? renderQuotes(collection, locale, i) : renderBadges(badgeState, locale, i)}
    </div>
  );
}

function renderQuotes(collection: CollectionState, locale: Locale, i: (key: UIStringKey) => string) {
  const totalUnlocked = Object.values(collection.byRarity).reduce((sum, r) => sum + r.unlocked, 0);
  const progressPct = collection.totalCount > 0 ? (totalUnlocked / collection.totalCount) * 100 : 0;
  const recentUnlocks = [...collection.unlocked]
    .sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt))
    .slice(0, 5);

  return (
    <>
      <div style={s.card}>
        <div style={s.cardLabel}>{i('collection_progress')}</div>
        <div style={s.progressText}>{totalUnlocked} / {collection.totalCount} ({progressPct.toFixed(0)}%)</div>
        <div style={s.barTrack}><div style={{ ...s.barFill, width: `${progressPct}%` }} /></div>
      </div>
      <div style={s.card}>
        {RARITY_ORDER.map((rarity) => {
          const data = collection.byRarity[rarity];
          const pct = data.total > 0 ? (data.unlocked / data.total) * 100 : 0;
          return (
            <div key={rarity} style={s.rarityRow}>
              <span style={{ ...s.rarityDot, background: RARITY_COLORS[rarity] }} />
              <span style={s.rarityLabel}>{i(`rarity_${rarity}` as UIStringKey)}</span>
              <span style={s.rarityCount}>{data.unlocked}/{data.total}</span>
              <div style={s.rarityBarTrack}>
                <div style={{ ...s.rarityBarFill, width: `${pct}%`, background: RARITY_COLORS[rarity] }} />
              </div>
              {data.unlocked === data.total && data.total > 0 && <span style={s.checkmark}>✓</span>}
            </div>
          );
        })}
      </div>
      {recentUnlocks.length > 0 && (
        <div style={s.card}>
          <div style={s.cardLabel}>{i('recent_unlock')}</div>
          {recentUnlocks.map((unlock) => {
            const entry = QUOTE_REGISTRY.find((q) => q.id === unlock.id);
            if (!entry) return null;
            const msg = entry.messages[locale] || entry.messages.ko;
            const date = new Date(unlock.unlockedAt).toLocaleDateString();
            return (
              <div key={unlock.id} style={s.unlockItem}>
                <span style={{ ...s.rarityDot, background: RARITY_COLORS[entry.rarity] }} />
                <div style={s.unlockText}>
                  <div style={s.unlockMsg}>"{msg}"</div>
                  <div style={s.unlockDate}>{date}</div>
                </div>
                {entry.rarity !== 'common' && (
                  <button style={s.shareBtn} onClick={() => window.electronAPI.shareCard(unlock.id)} title={i('share_this_quote')}>📤</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function renderBadges(badgeState: BadgeState | null, locale: Locale, i: (key: UIStringKey) => string) {
  if (!badgeState) return <div style={s.empty}>{i('loading' as UIStringKey)}</div>;

  const unlockedIds = new Set(badgeState.unlocked.map((b) => b.id));

  return (
    <>
      {/* Progress by tier */}
      <div style={s.card}>
        <div style={s.cardLabel}>{i('collection_progress')}</div>
        {TIER_ORDER.map((tier) => {
          const data = badgeState.byTier[tier];
          const pct = data.total > 0 ? (data.unlocked / data.total) * 100 : 0;
          return (
            <div key={tier} style={s.rarityRow}>
              <span style={{ ...s.rarityDot, background: TIER_COLORS[tier] }} />
              <span style={s.rarityLabel}>{i(`tier_${tier}` as UIStringKey)}</span>
              <span style={s.rarityCount}>{data.unlocked}/{data.total}</span>
              <div style={s.rarityBarTrack}>
                <div style={{ ...s.rarityBarFill, width: `${pct}%`, background: TIER_COLORS[tier] }} />
              </div>
              {data.unlocked === data.total && data.total > 0 && <span style={s.checkmark}>✓</span>}
            </div>
          );
        })}
      </div>

      {/* Badge grid */}
      <div style={s.card}>
        <div style={s.badgeGrid}>
          {BADGE_REGISTRY.map((badge) => {
            const isUnlocked = unlockedIds.has(badge.id);
            const tierColor = TIER_COLORS[badge.tier];
            return (
              <div
                key={badge.id}
                style={{
                  ...s.badgeCard,
                  borderColor: isUnlocked ? tierColor : '#e5e7eb',
                  opacity: isUnlocked ? 1 : 0.5,
                  boxShadow: isUnlocked ? `0 0 8px ${tierColor}40` : 'none',
                }}
              >
                <div style={s.badgeIcon}>
                  {isUnlocked ? badge.icon : '🔒'}
                </div>
                <div style={s.badgeName}>
                  {isUnlocked ? badge.name[locale] : i('undiscovered')}
                </div>
                <div style={s.badgeDesc}>
                  {isUnlocked ? badge.description[locale] : ''}
                </div>
                <div style={{ ...s.badgeTierLabel, color: tierColor }}>
                  {i(`tier_${badge.tier}` as UIStringKey)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', gap: 10 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  subTabBar: { display: 'flex', gap: 4, marginBottom: 4 },
  subTab: {
    flex: 1, padding: '8px 0', fontSize: 12, fontWeight: 500,
    border: '1px solid #e5e7eb', borderRadius: 6,
    background: '#f9fafb', color: '#6b7280', cursor: 'pointer', textAlign: 'center',
  },
  subTabActive: {
    background: '#fce7f3', borderColor: '#ec4899', color: '#be185d', fontWeight: 600,
  },
  card: {
    background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #e5e7eb',
  },
  cardLabel: {
    fontSize: 11, fontWeight: 700, color: '#9ca3af',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
  },
  progressText: { fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 8 },
  barTrack: { height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', background: '#ec4899', borderRadius: 4 },
  rarityRow: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', fontSize: 13,
  },
  rarityDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  rarityLabel: { width: 40, fontWeight: 600, color: '#374151' },
  rarityCount: { width: 40, fontSize: 12, color: '#6b7280', textAlign: 'right' as const },
  rarityBarTrack: {
    flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden',
  },
  rarityBarFill: { height: '100%', borderRadius: 3 },
  checkmark: { color: '#22c55e', fontWeight: 700, fontSize: 14 },
  unlockItem: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  unlockText: { flex: 1 },
  unlockMsg: { fontSize: 13, color: '#374151', fontStyle: 'italic' },
  unlockDate: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  shareBtn: {
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4,
  },
  badgeGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
  },
  badgeCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '12px 8px', borderRadius: 10, border: '2px solid #e5e7eb',
    textAlign: 'center', transition: 'all 0.2s',
  },
  badgeIcon: { fontSize: 24, marginBottom: 4 },
  badgeName: { fontSize: 11, fontWeight: 600, color: '#374151', marginBottom: 2 },
  badgeDesc: { fontSize: 9, color: '#9ca3af', lineHeight: 1.3 },
  badgeTierLabel: { fontSize: 9, fontWeight: 700, marginTop: 4, textTransform: 'uppercase' },
};
