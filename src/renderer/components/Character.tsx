import React, { CSSProperties } from 'react';
import { MamaMood, MamaErrorExpression } from '../../shared/types';

type Expression = MamaMood | MamaErrorExpression;

interface CharacterProps {
  expression: Expression;
}

// Pixel grid unit
const PX = 5;

// Claude's base skin color (from claude.png)
const SKIN = '#C47A5A';
const SKIN_DARK = '#A86244'; // slightly darker for ears/legs variation

// --- Eyes per mood (pixel blocks) ---

function Eyes({ expression }: { expression: Expression }) {
  const dot: CSSProperties = {
    width: PX * 2,
    height: PX * 3,
    background: '#1a1a1a',
  };

  switch (expression) {
    case 'angry':
      return (
        <div style={{ display: 'flex', gap: PX * 5, alignItems: 'flex-start' }}>
          {/* Left eye + brow */}
          <div>
            <div style={{ display: 'flex', marginBottom: PX * 0.5 }}>
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX }} />
            </div>
            <div style={{ ...dot, marginLeft: PX }} />
          </div>
          {/* Right eye + brow */}
          <div>
            <div style={{ display: 'flex', marginBottom: PX * 0.5 }}>
              <div style={{ width: PX, height: PX }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
            </div>
            <div style={{ ...dot, marginLeft: PX }} />
          </div>
        </div>
      );

    case 'worried':
      return (
        <div style={{ display: 'flex', gap: PX * 5, alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', marginBottom: PX * 0.5 }}>
              <div style={{ width: PX, height: PX }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
            </div>
            <div style={{ ...dot, height: PX * 4 }} />
          </div>
          <div>
            <div style={{ display: 'flex', marginBottom: PX * 0.5 }}>
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX }} />
            </div>
            <div style={{ ...dot, height: PX * 4 }} />
          </div>
        </div>
      );

    case 'happy':
      // ^_^ pixel arcs
      return (
        <div style={{ display: 'flex', gap: PX * 5, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX * 2, height: PX }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: PX, height: PX }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX * 2, height: PX }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: PX, height: PX }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX }} />
            </div>
          </div>
        </div>
      );

    case 'proud':
      // Star pixel eyes
      return (
        <div style={{ display: 'flex', gap: PX * 4, alignItems: 'center' }}>
          <span style={{ fontSize: PX * 4, lineHeight: 1, color: '#FFD700', imageRendering: 'pixelated' }}>★</span>
          <span style={{ fontSize: PX * 4, lineHeight: 1, color: '#FFD700', imageRendering: 'pixelated' }}>★</span>
        </div>
      );

    case 'confused':
      return (
        <div style={{ display: 'flex', gap: PX * 4, alignItems: 'center' }}>
          {/* X eyes */}
          <div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: PX, height: PX }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX }} />
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: PX, height: PX }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX }} />
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
              <div style={{ width: PX, height: PX }} />
              <div style={{ width: PX, height: PX, background: '#1a1a1a' }} />
            </div>
          </div>
        </div>
      );

    case 'sleeping':
      // Closed line eyes
      return (
        <div style={{ display: 'flex', gap: PX * 5, alignItems: 'center' }}>
          <div style={{ width: PX * 3, height: PX, background: '#1a1a1a' }} />
          <div style={{ width: PX * 3, height: PX, background: '#1a1a1a' }} />
        </div>
      );

    default:
      return (
        <div style={{ display: 'flex', gap: PX * 5 }}>
          <div style={dot} />
          <div style={dot} />
        </div>
      );
  }
}

// --- Mouth per mood (pixel blocks) ---

function Mouth({ expression }: { expression: Expression }) {
  const px = PX;

  switch (expression) {
    case 'angry':
      // Pixel frown: \_/  flipped
      return (
        <div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px * 3, height: px }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: px, height: px }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px }} />
          </div>
        </div>
      );

    case 'worried':
      // Pixel wavy ~
      return (
        <div style={{ display: 'flex' }}>
          <div style={{ width: px, height: px, background: '#1a1a1a' }} />
          <div style={{ width: px, height: px }} />
          <div style={{ width: px, height: px, background: '#1a1a1a' }} />
          <div style={{ width: px, height: px }} />
          <div style={{ width: px, height: px, background: '#1a1a1a' }} />
        </div>
      );

    case 'happy':
      // Pixel smile: _/ \_
      return (
        <div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: px, height: px }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px }} />
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px * 3, height: px }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
          </div>
        </div>
      );

    case 'proud':
      // Big pixel smile: wide
      return (
        <div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: px, height: px }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px }} />
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px * 5, height: px }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
          </div>
        </div>
      );

    case 'confused':
      // Small flat line
      return (
        <div style={{ width: px * 3, height: px, background: '#1a1a1a' }} />
      );

    case 'sleeping':
      // Small O
      return (
        <div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: px, height: px }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px }} />
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
          </div>
          <div style={{ display: 'flex' }}>
            <div style={{ width: px, height: px }} />
            <div style={{ width: px, height: px, background: '#1a1a1a' }} />
            <div style={{ width: px, height: px }} />
          </div>
        </div>
      );
  }
}

// --- Accessories (pixel style) ---

function Accessories({ expression }: { expression: Expression }) {
  switch (expression) {
    case 'angry':
      return (
        <>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              position: 'absolute', top: -PX * 2 - i * PX * 2, left: PX * 5 + i * PX * 4,
              width: PX * 2, height: PX * 2, background: '#E05050',
              animation: `steamPuff 1s ease-out ${i * 0.3}s infinite`,
            }} />
          ))}
        </>
      );

    case 'worried':
      return (
        <div style={{
          position: 'absolute', right: -PX * 2, top: PX * 3,
          animation: 'sweatDrop 1.2s ease-in infinite',
        }}>
          <div style={{ width: PX * 2, height: PX * 2, background: '#60A5FA' }} />
          <div style={{ width: PX, height: PX, background: '#60A5FA', marginLeft: PX * 0.5 }} />
        </div>
      );

    case 'happy':
      // Pixel blush squares on body
      return (
        <>
          <div style={{ position: 'absolute', left: PX * 2, bottom: PX * 4, width: PX * 3, height: PX * 2, background: '#E8A0A0', opacity: 0.7 }} />
          <div style={{ position: 'absolute', right: PX * 2, bottom: PX * 4, width: PX * 3, height: PX * 2, background: '#E8A0A0', opacity: 0.7 }} />
        </>
      );

    case 'proud':
      return (
        <>
          {[
            { top: -PX * 4, left: 0, delay: '0s' },
            { top: -PX * 4, right: 0, delay: '0.5s' },
            { top: PX, left: -PX * 4, delay: '0.25s' },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos,
              width: PX * 2, height: PX * 2, background: '#FFD700',
              animation: `sparkle 1.4s ease-in-out ${pos.delay} infinite`,
            }} />
          ))}
        </>
      );

    case 'confused':
      return (
        <div style={{
          position: 'absolute', top: -PX * 6, right: -PX * 2,
          fontSize: PX * 5, fontWeight: 'bold', color: '#666',
          fontFamily: 'monospace',
          animation: 'floatQuestion 1.5s ease-in-out infinite',
          imageRendering: 'pixelated',
        }}>
          ?
        </div>
      );

    case 'sleeping':
      return (
        <>
          {['z', 'z', 'Z'].map((ch, i) => (
            <div key={i} style={{
              position: 'absolute', top: -PX * 3, right: -PX * 3,
              fontSize: PX * (3 + i), fontWeight: 'bold', color: '#3B82F6',
              fontFamily: 'monospace', imageRendering: 'pixelated',
              animation: `zzz 2s ease-out ${i * 0.65}s infinite`,
              lineHeight: 1,
            }}>
              {ch}
            </div>
          ))}
        </>
      );
  }
}

// --- Mama pixel flower on ear ---

function MamaFlower() {
  const p = PX;
  return (
    <div style={{ position: 'absolute', top: -p * 2, left: p, pointerEvents: 'none' }}>
      {/* 5-pixel cross flower */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: p, height: p, background: '#F472B6' }} />
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: p, height: p, background: '#F472B6' }} />
        <div style={{ width: p, height: p, background: '#FBBF24' }} />
        <div style={{ width: p, height: p, background: '#F472B6' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: p, height: p, background: '#F472B6' }} />
      </div>
    </div>
  );
}

// --- Main Character ---

export function Character({ expression }: CharacterProps) {
  const BODY_W = PX * 16;
  const BODY_H = PX * 12;
  const EAR_W = PX * 2;
  const EAR_H = PX * 5;
  const LEG_W = PX * 2;
  const LEG_H = PX * 4;

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: BODY_W,
    height: EAR_H + BODY_H + LEG_H,
    imageRendering: 'pixelated',
    animation: 'breathe 3s ease-in-out infinite',
  };

  const bodyStyle: CSSProperties = {
    position: 'absolute',
    top: EAR_H,
    left: 0,
    width: BODY_W,
    height: BODY_H,
    background: SKIN,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PX * 1.5,
  };

  const earStyle = (side: 'left' | 'right'): CSSProperties => ({
    position: 'absolute',
    top: 0,
    [side]: PX * 2,
    width: EAR_W,
    height: EAR_H,
    background: SKIN,
  });

  const legPositions = [PX * 1, PX * 5, BODY_W - PX * 7, BODY_W - PX * 3];

  return (
    <div style={containerStyle}>
      {/* Ears */}
      <div style={earStyle('left')} />
      <div style={earStyle('right')} />

      {/* Mama flower */}
      <MamaFlower />

      {/* Body */}
      <div style={bodyStyle}>
        <Accessories expression={expression} />
        <Eyes expression={expression} />
        <Mouth expression={expression} />
      </div>

      {/* Legs */}
      {legPositions.map((pos, i) => (
        <div key={i} style={{
          position: 'absolute',
          bottom: 0,
          left: pos,
          width: LEG_W,
          height: LEG_H,
          background: SKIN,
        }} />
      ))}
    </div>
  );
}
