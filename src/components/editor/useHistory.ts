'use client';

import { useCallback, useState } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
  /** key of the last change; consecutive changes with the same key are merged */
  key: string | null;
  time: number;
}

const LIMIT = 100;

/**
 * Undo/redo state. Changes that share a `coalesce` key within a second (or
 * during one drag gesture, keys starting with `drag:`) form one history step.
 */
export function useHistory<T>(init: () => T) {
  const [s, setS] = useState<HistoryState<T>>(() => ({ past: [], present: init(), future: [], key: null, time: 0 }));

  const set = useCallback((updater: (prev: T) => T, coalesce?: string) => {
    setS((st) => {
      const next = updater(st.present);
      if (next === st.present) return st;
      const now = Date.now();
      const merge = !!coalesce && coalesce === st.key && (coalesce.startsWith('drag:') || now - st.time < 1000);
      return {
        past: merge ? st.past : [...st.past, st.present].slice(-LIMIT),
        present: next,
        future: [],
        key: coalesce ?? null,
        time: now,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setS((st) =>
      st.past.length
        ? { past: st.past.slice(0, -1), present: st.past[st.past.length - 1], future: [st.present, ...st.future], key: null, time: 0 }
        : st,
    );
  }, []);

  const redo = useCallback(() => {
    setS((st) =>
      st.future.length
        ? { past: [...st.past, st.present], present: st.future[0], future: st.future.slice(1), key: null, time: 0 }
        : st,
    );
  }, []);

  return { value: s.present, set, undo, redo, canUndo: s.past.length > 0, canRedo: s.future.length > 0 };
}
