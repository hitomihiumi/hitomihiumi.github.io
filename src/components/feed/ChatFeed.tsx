'use client';

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import type { OverlayConfig, StyleKey } from '@/types/overlay';
import { isEventKey } from '@/types/overlay';
import Bubble, { BubbleData } from '@/components/bubble/Bubble';

export interface FeedItem {
  id: string;
  key: StyleKey;
  data: BubbleData;
  /** login of the author, used to drop messages of banned users */
  login?: string;
  leaving?: boolean;
}

/** Style used for an item: disabled message styles fall back to the viewer style. */
export function resolveStyle(config: OverlayConfig, key: StyleKey) {
  const s = config.styles[key];
  if (s.enabled || isEventKey(key)) return s;
  return config.styles.default;
}

/**
 * Message list state with lifetime / limit handling and leave animations.
 * Shared by the live overlay and the editor preview.
 */
export function useFeed(config: OverlayConfig) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const cfg = useRef(config);
  cfg.current = config;
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const later = useCallback((fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  }, []);

  useEffect(() => {
    const set = timers.current;
    return () => set.forEach(clearTimeout);
  }, []);

  const remove = useCallback((pred: (i: FeedItem) => boolean) => {
    setItems((prev) => prev.filter((i) => !pred(i)));
  }, []);

  const leave = useCallback(
    (id: string) => {
      const g = cfg.current.general;
      if (g.animOut === 'none') return remove((i) => i.id === id);
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, leaving: true } : i)));
      later(() => remove((i) => i.id === id), g.animDuration);
    },
    [later, remove],
  );

  const add = useCallback(
    (item: FeedItem) => {
      const g = cfg.current.general;
      setItems((prev) => {
        if (prev.some((i) => i.id === item.id)) return prev;
        let next = [...prev, item];
        const alive = next.filter((i) => !i.leaving);
        if (alive.length > g.limit) {
          const drop = new Set(alive.slice(0, alive.length - g.limit).map((i) => i.id));
          next = next.filter((i) => !drop.has(i.id));
        }
        return next;
      });
      if (g.lifetime > 0) later(() => leave(item.id), g.lifetime * 1000);
    },
    [later, leave],
  );

  const clear = useCallback(() => setItems([]), []);

  return { items, add, remove, leave, clear };
}

export default function ChatFeed({
  config,
  items,
  className = '',
  style,
}: {
  config: OverlayConfig;
  items: FeedItem[];
  className?: string;
  style?: CSSProperties;
}) {
  const g = config.general;
  const ordered = g.stack === 'top' ? [...items].reverse() : items;
  const align = g.align === 'left' ? 'flex-start' : g.align === 'right' ? 'flex-end' : 'center';

  return (
    <div className={`overflow-hidden ${className}`} style={style}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: g.stack === 'top' ? 'flex-start' : 'flex-end',
          alignItems: align,
          gap: g.gap,
          padding: g.padding,
          minHeight: '100%',
          height: '100%',
          zoom: g.scale,
        }}
      >
        {ordered.map((item) => (
          <div
            key={item.id}
            className={`cb-item ${item.leaving ? `cb-out-${g.animOut}` : `cb-in-${g.animIn}`}`}
            style={{ '--cb-dur': `${g.animDuration}ms`, maxWidth: '100%', flexShrink: 0 } as CSSProperties}
          >
            <Bubble
              style={resolveStyle(config, item.key)}
              general={g}
              data={item.data}
              isEvent={isEventKey(item.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
