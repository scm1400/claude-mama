import { useEffect, useState } from 'react';
import { MamaState } from '../../shared/types';

export function useMamaState(): MamaState | null {
  const [state, setState] = useState<MamaState | null>(null);

  useEffect(() => {
    const cleanup = window.electronAPI.onMamaStateUpdate((newState: MamaState) => {
      setState(newState);
    });
    return cleanup;
  }, []);

  return state;
}
