'use client';

import { useRef, useState, type DragEvent } from 'react';
import type { BubbleStyle, Decoration } from '@/types/overlay';
import { STICKERS, STICKER_KINDS, Sticker } from '@/lib/stickers';
import { DND_MIME } from './BubbleCanvas';

const EMOJIS = ['✨', '💖', '🌸', '⭐', '🌙', '🎀', '🐰', '🐱', '🍓', '🌿', '🔥', '👑', '💎', '🎮', '☁️', '🦋'];

const payload = (p: Partial<Decoration>) => (e: DragEvent) => {
  e.dataTransfer.setData(DND_MIME, JSON.stringify(p));
  e.dataTransfer.effectAllowed = 'copy';
};

/** Draggable sources for new decorations. Click adds to the top-right corner. */
export function Palette({ onAdd }: { onAdd: (p: Partial<Decoration>) => void }) {
  const [url, setUrl] = useState('');
  const tileBase = 'rounded-md border border-white/10 hover:border-indigo-400 hover:bg-white/5 flex items-center justify-center cursor-grab active:cursor-grabbing';
  const tile = `${tileBase} aspect-square`;

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-zinc-500">Drag onto the bubble (or onto the name tag to attach it there). Click to add.</p>
      <div className="grid grid-cols-6 gap-1.5">
        {STICKER_KINDS.map((k) => {
          const p: Partial<Decoration> = { kind: 'sticker', value: k };
          return (
            <button type="button" key={k} title={STICKERS[k].label} draggable onDragStart={payload(p)} onClick={() => onAdd(p)} className={`${tile} p-1.5`}>
              <Sticker kind={k} color="#e4e4e7" color2="#a78bfa" size="100%" />
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-8 gap-1">
        {EMOJIS.map((em) => {
          const p: Partial<Decoration> = { kind: 'emoji', value: em, size: 20 };
          return (
            <button type="button" key={em} draggable onDragStart={payload(p)} onClick={() => onAdd(p)} className={`${tile} text-lg`}>
              {em}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { label: '── Line', p: { kind: 'line', value: '', size: 80, color: '#ffffff', thickness: 1.5, pos: { x: 50, y: 85 } } },
          { label: '│ Vertical line', p: { kind: 'line', value: '', size: 60, vertical: true, lineStyle: 'dotted', color: '#ffffff', thickness: 2, pos: { x: 3, y: 50 } } },
        ].map(({ label, p }) => (
          <button type="button" key={label} draggable onDragStart={payload(p as Partial<Decoration>)} onClick={() => onAdd(p as Partial<Decoration>)} className={`${tileBase} py-2 text-xs text-zinc-300`}>
            {label}
          </button>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          className="flex-1 min-w-0 bg-zinc-900 border border-white/10 rounded-md px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-400"
          placeholder="Image URL (PNG, GIF…)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          type="button"
          draggable={!!url}
          onDragStart={payload({ kind: 'image', value: url, size: 40 })}
          onClick={() => url && onAdd({ kind: 'image', value: url, size: 40 })}
          disabled={!url}
          className="px-3 rounded-md bg-indigo-500 text-white text-xs disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  );
}

/** Element list: bubble, tags and decorations (drag to reorder decorations). */
export function Layers({
  style,
  selected,
  onSelect,
  onReorder,
  onToggleTag,
}: {
  style: BubbleStyle;
  selected: string | null;
  onSelect: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onToggleTag: (tag: 'name' | 'role') => void;
}) {
  const dragIndex = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const row = (active: boolean) =>
    `w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left ${active ? 'bg-indigo-500/25 text-white' : 'text-zinc-300 hover:bg-white/5'}`;

  const decoLabel = (d: Decoration) =>
    d.kind === 'sticker' ? STICKERS[d.value as keyof typeof STICKERS]?.label ?? d.value : d.kind === 'emoji' ? `Emoji ${d.value}` : d.kind === 'line' ? (d.vertical ? 'Vertical line' : 'Line') : 'Image';

  // Top of the list = drawn last (in front)
  const list = style.decorations.map((d, i) => ({ d, i })).reverse();

  return (
    <div className="space-y-0.5">
      {(['name', 'role'] as const).map((tag) => (
        <div key={tag} className={row(selected === tag)}>
          <button type="button" className="flex-1 text-left" onClick={() => onSelect(tag)}>
            {tag === 'name' ? '🏷️ Name tag' : '🔖 Role tag'}
          </button>
          <button type="button" title="Show / hide" className="text-xs opacity-70 hover:opacity-100" onClick={() => onToggleTag(tag)}>
            {style[tag].visible ? '👁' : '—'}
          </button>
        </div>
      ))}
      {list.map(({ d, i }) => (
        <div
          key={d.id}
          draggable
          onDragStart={(e) => {
            dragIndex.current = i;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', d.id);
          }}
          onDragOver={(e) => {
            if (dragIndex.current === null) return;
            e.preventDefault();
            setOver(i);
          }}
          onDragEnd={() => {
            dragIndex.current = null;
            setOver(null);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIndex.current !== null && dragIndex.current !== i) onReorder(dragIndex.current, i);
            dragIndex.current = null;
            setOver(null);
          }}
          className={`${row(selected === d.id)} cursor-grab ${over === i ? 'ring-1 ring-indigo-400' : ''}`}
          onClick={() => onSelect(d.id)}
        >
          <span className="text-zinc-500 text-xs">⋮⋮</span>
          <span className="w-5 h-5 flex items-center justify-center shrink-0">
            {d.kind === 'sticker' ? <Sticker kind={d.value as never} color={d.color} color2={d.color2} size={16} /> : d.kind === 'emoji' ? d.value : d.kind === 'line' ? '─' : '🖼'}
          </span>
          <span className="flex-1 truncate">{decoLabel(d)}</span>
          <span className="text-[10px] text-zinc-500">{d.attach === 'name' ? 'name' : ''}{d.behind ? ' · back' : ''}</span>
        </div>
      ))}
      <button type="button" className={row(selected === 'bubble')} onClick={() => onSelect('bubble')}>
        💬 Bubble
      </button>
    </div>
  );
}
