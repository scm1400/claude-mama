import React, { useEffect, useRef, useState, CSSProperties } from 'react';

interface SpeechBubbleProps {
  message: string;
  mood: string;
}

export function SpeechBubble({ message, mood }: SpeechBubbleProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [visible, setVisible] = useState(true);
  const [animState, setAnimState] = useState<'in' | 'visible' | 'out'>('in');
  const typewriterRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMessageRef = useRef<string>('');
  const prevMoodRef = useRef<string>('');

  // Split message into Unicode code points (handles multi-byte Korean correctly)
  const codePoints = (str: string): string[] => {
    return [...str]; // spread iterates by code point
  };

  useEffect(() => {
    // Only restart if message or mood changed
    if (message === prevMessageRef.current && mood === prevMoodRef.current) return;
    prevMessageRef.current = message;
    prevMoodRef.current = mood;

    // Clear existing timers
    if (typewriterRef.current) clearTimeout(typewriterRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    // Reset and show
    setDisplayedText('');
    setVisible(true);
    setAnimState('in');

    const chars = codePoints(message);
    let index = 0;

    const typeNext = () => {
      if (index < chars.length) {
        const currentIndex = index;
        setDisplayedText(chars.slice(0, currentIndex + 1).join(''));
        index++;
        typewriterRef.current = setTimeout(typeNext, 50);
      } else {
        setAnimState('visible');
        // Auto-hide after 5 seconds
        hideTimerRef.current = setTimeout(() => {
          setAnimState('out');
          setTimeout(() => setVisible(false), 400);
        }, 5000);
      }
    };

    // Small delay before starting typewriter (allow fade-in)
    typewriterRef.current = setTimeout(typeNext, 50);

    return () => {
      if (typewriterRef.current) clearTimeout(typewriterRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [message, mood]);

  if (!visible) return null;

  const bubbleStyle: CSSProperties = {
    position: 'relative',
    background: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: '8px 12px',
    maxWidth: 200,
    minWidth: 80,
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 1px 4px rgba(0, 0, 0, 0.1)',
    fontSize: 14,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    lineHeight: 1.5,
    color: '#1f2937',
    wordBreak: 'keep-all',
    overflowWrap: 'break-word',
    animation: animState === 'in'
      ? 'bubbleFadeIn 0.25s ease forwards'
      : animState === 'out'
        ? 'bubbleFadeOut 0.4s ease forwards'
        : 'none',
    marginBottom: 8,
  };

  // Triangle tail pointing down toward the character
  const tailStyle: CSSProperties = {
    position: 'absolute',
    bottom: -10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '8px solid transparent',
    borderRight: '8px solid transparent',
    borderTop: '10px solid rgba(255, 255, 255, 0.95)',
    filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.1))',
  };

  return (
    <div style={bubbleStyle}>
      <span>{displayedText}</span>
      {/* Blinking cursor while typing */}
      {animState === 'in' && (
        <span style={{
          display: 'inline-block',
          width: 2,
          height: '1em',
          background: '#6b7280',
          marginLeft: 2,
          verticalAlign: 'text-bottom',
          animation: 'cheekPulse 0.7s ease-in-out infinite',
        }} />
      )}
      <div style={tailStyle} />
    </div>
  );
}
