import React from 'react';

export default function App() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: '20px',
        background: 'transparent',
      }}
    >
      {/* Placeholder circle representing Claude Mama */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #a78bfa, #7c3aed)',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 48 }}>🤖</span>
      </div>

      <div
        style={{
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          borderRadius: 8,
          padding: '6px 12px',
          color: '#e2e8f0',
          fontSize: 12,
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          maxWidth: 200,
        }}
      >
        Claude Mama Loading...
      </div>
    </div>
  );
}
