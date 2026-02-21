import { useEffect, useRef } from 'react';

export function useAutoSave(callback, deps, delay = 30000) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!deps.some(d => d)) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      await callback();
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, deps);
}
