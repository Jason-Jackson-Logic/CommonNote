import { useEffect } from 'react';

export function useKeyboard(handlers) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      if (ctrlOrMeta && key === 'n') {
        e.preventDefault();
        handlers.onNew?.();
      }
      if (ctrlOrMeta && key === 's') {
        e.preventDefault();
        handlers.onSave?.();
      }
      if (key === 'escape') {
        handlers.onEscape?.();
      }
      if (ctrlOrMeta && key === '/') {
        e.preventDefault();
        handlers.onToggleMode?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
