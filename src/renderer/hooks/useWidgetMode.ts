import { useState, useCallback } from 'react';

export type WidgetMode = 'mini' | 'expanded';

interface UseWidgetModeReturn {
  mode: WidgetMode;
  onToggle: () => void;
}

export function useWidgetMode(): UseWidgetModeReturn {
  const [mode, setMode] = useState<WidgetMode>('mini');

  const onToggle = useCallback(() => {
    setMode(prev => prev === 'mini' ? 'expanded' : 'mini');
  }, []);

  return { mode, onToggle };
}
