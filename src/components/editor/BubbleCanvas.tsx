'use client';

import { useRef, useState, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react';
import type { BubbleStyle, Decoration, GeneralSettings, Position } from '@/types/overlay';
import Bubble, { BubbleData } from '@/components/bubble/Bubble';

export const DND_MIME = 'application/x-chat-decoration';

type Change = (fn: (s: BubbleStyle) => void, coalesce?: string) => void;

interface Props {
  style: BubbleStyle;
  general: GeneralSettings;
  data: BubbleData;
  isEvent: boolean;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onChange: Change;
  onDropDecoration: (partial: Partial<Decoration>, attach: Decoration['attach'], pos: Position) => void;
  zoom: number;
  background: string;
}

const SNAP_POINTS = [0, 50, 100];
const SNAP = 2.5;
const round = (v: number) => Math.round(v * 2) / 2;

interface Guides {
  /** screen-space lines relative to the stage */
  x: number[];
  y: number[];
}

/** Interactive single-bubble stage: drag tags & decorations, resize and rotate decorations, drop new ones. */
export default function BubbleCanvas({ style, general, data, isEvent, selected, onSelect, onChange, onDropDecoration, zoom, background }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [guides, setGuides] = useState<Guides>({ x: [], y: [] });
  const [dropping, setDropping] = useState(false);

  const findDeco = (id: string) => style.decorations.find((d) => d.id === id);

  const snap = (v: number, free: boolean) => {
    if (free) return { v: round(v), hit: null as number | null };
    for (const p of SNAP_POINTS) if (Math.abs(v - p) < SNAP) return { v: p, hit: p };
    return { v: round(v), hit: null };
  };

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const stage = stageRef.current;
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-handle],[data-deco],[data-el]');
    if (!stage || !target || !stage.contains(target)) {
      onSelect('bubble');
      return;
    }
    const body = stage.querySelector<HTMLElement>('[data-el="bubble"]');
    if (!body) return;
    e.preventDefault();

    const dragKey = `drag:${Date.now()}`;
    const handle = target.dataset.handle;

    /* ------ resize / rotate the selected decoration ------ */
    if (handle && selected) {
      const decoEl = target.closest<HTMLElement>('[data-deco]');
      const deco = findDeco(selected);
      if (!decoEl || !deco) return;
      const r = decoEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const startDist = Math.hypot(e.clientX - cx, e.clientY - cy) || 1;
      const startSize = deco.size;
      const move = (ev: PointerEvent) => {
        if (handle === 'resize') {
          const dist = Math.hypot(ev.clientX - cx, ev.clientY - cy);
          const size = Math.max(2, Math.round((startSize * dist) / startDist));
          onChange((s) => {
            const d = s.decorations.find((x) => x.id === deco.id);
            if (d) d.size = size;
          }, dragKey);
        } else {
          let angle = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI + 90;
          angle = ((Math.round(angle) % 360) + 540) % 360 - 180;
          if (ev.shiftKey) angle = Math.round(angle / 15) * 15;
          onChange((s) => {
            const d = s.decorations.find((x) => x.id === deco.id);
            if (d) d.rotate = angle;
          }, dragKey);
        }
      };
      track(move);
      return;
    }

    /* ------ move tags / decorations ------ */
    let id: string;
    let refEl: HTMLElement = body;
    let pos: Position | null = null;
    if (target.dataset.deco) {
      id = target.dataset.deco;
      const deco = findDeco(id);
      if (!deco) return;
      pos = deco.pos;
      if (deco.attach === 'name') refEl = target.parentElement?.closest<HTMLElement>('[data-el="name"]') ?? body;
    } else {
      id = target.dataset.el!;
      if (id === 'name' && style.name.placement === 'floating') pos = style.name.pos;
      if (id === 'role' && style.role.placement === 'floating') pos = style.role.pos;
    }
    onSelect(id);
    if (!pos) return;

    const ref = refEl.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const offX = e.clientX - (ref.left + (pos.x / 100) * ref.width);
    const offY = e.clientY - (ref.top + (pos.y / 100) * ref.height);

    const move = (ev: PointerEvent) => {
      const rawX = ((ev.clientX - offX - ref.left) / ref.width) * 100;
      const rawY = ((ev.clientY - offY - ref.top) / ref.height) * 100;
      const sx = snap(rawX, ev.altKey);
      const sy = snap(rawY, ev.altKey);
      setGuides({
        x: sx.hit === null ? [] : [ref.left - stageRect.left + (sx.hit / 100) * ref.width],
        y: sy.hit === null ? [] : [ref.top - stageRect.top + (sy.hit / 100) * ref.height],
      });
      const next = { x: sx.v, y: sy.v };
      onChange((s) => {
        if (id === 'name') s.name.pos = next;
        else if (id === 'role') s.role.pos = next;
        else {
          const d = s.decorations.find((x) => x.id === id);
          if (d) d.pos = next;
        }
      }, dragKey);
    };
    track(move, () => setGuides({ x: [], y: [] }));
  };

  const track = (move: (ev: PointerEvent) => void, done?: () => void) => {
    document.body.style.cursor = 'grabbing';
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      document.body.style.cursor = '';
      done?.();
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  /* ------ drop new decorations from the palette ------ */
  const onDragOver = (e: DragEvent) => {
    if (!e.dataTransfer.types.includes(DND_MIME)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDropping(true);
  };

  const onDrop = (e: DragEvent) => {
    setDropping(false);
    const raw = e.dataTransfer.getData(DND_MIME);
    const stage = stageRef.current;
    if (!raw || !stage) return;
    e.preventDefault();
    const partial = JSON.parse(raw) as Partial<Decoration>;
    const nameEl = (e.target as HTMLElement).closest<HTMLElement>('[data-el="name"]');
    const attachToName = !!nameEl && style.name.placement === 'floating' && partial.kind !== 'line';
    const refEl = attachToName ? nameEl! : stage.querySelector<HTMLElement>('[data-el="bubble"]');
    if (!refEl) return;
    const r = refEl.getBoundingClientRect();
    onDropDecoration(partial, attachToName ? 'name' : 'bubble', {
      x: round(((e.clientX - r.left) / r.width) * 100),
      y: round(((e.clientY - r.top) / r.height) * 100),
    });
  };

  return (
    <div
      ref={stageRef}
      className={`relative w-full h-full min-h-[320px] flex items-center justify-center overflow-hidden select-none ${dropping ? 'ring-2 ring-inset ring-indigo-400/60' : ''}`}
      style={{ background }}
      onPointerDown={startDrag}
      onDragOver={onDragOver}
      onDragLeave={() => setDropping(false)}
      onDrop={onDrop}
    >
      <div style={{ transform: `scale(${zoom})`, transformOrigin: 'center', padding: 48 }}>
        <Bubble style={style} general={general} data={data} isEvent={isEvent} editable selected={selected} />
      </div>
      {guides.x.map((x, i) => (
        <div key={`gx${i}`} className="absolute top-0 bottom-0 w-px bg-pink-400/80 pointer-events-none" style={{ left: x }} />
      ))}
      {guides.y.map((y, i) => (
        <div key={`gy${i}`} className="absolute left-0 right-0 h-px bg-pink-400/80 pointer-events-none" style={{ top: y }} />
      ))}
    </div>
  );
}
