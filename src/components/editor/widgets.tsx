'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

/* Custom replacements for native form widgets (select, range, number spinners, color picker). */

/* ------------------------------ popover ------------------------------ */

/**
 * Floating panel rendered into <body> with fixed positioning, so it's never
 * clipped by scrolling side panels. Closes on outside click and Escape.
 */
export function Popover({
  anchor,
  open,
  onClose,
  children,
  width,
  matchWidth,
}: {
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
  matchWidth?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' });

  const place = useCallback(() => {
    const a = anchor.current?.getBoundingClientRect();
    const p = panel.current;
    if (!a || !p) return;
    const w = matchWidth ? a.width : width ?? p.offsetWidth;
    const h = p.offsetHeight;
    const below = a.bottom + 4 + h <= window.innerHeight || a.top - 4 - h < 0;
    const top = below ? Math.min(a.bottom + 4, window.innerHeight - h - 4) : a.top - 4 - h;
    const left = Math.max(4, Math.min(a.left, window.innerWidth - w - 4));
    setStyle({ top: Math.max(4, top), left, width: w, visibility: 'visible' });
  }, [anchor, width, matchWidth]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !anchor.current?.contains(t)) onClose();
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('pointerdown', down, true);
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('pointerdown', down, true);
      window.removeEventListener('keydown', key);
    };
  }, [open, onClose, anchor]);

  if (!open || typeof document === 'undefined') return null;
  return createPortal(
    <div
      ref={panel}
      className="fixed z-[1000] bg-zinc-900 border border-white/10 rounded-lg shadow-2xl shadow-black/60 text-zinc-100 text-sm"
      style={{ ...style, fontFamily: 'system-ui, sans-serif' }}
    >
      {children}
    </div>,
    document.body,
  );
}

/* ------------------------------ dropdown ------------------------------ */

export interface Option<T extends string> {
  value: T;
  label: ReactNode;
  style?: CSSProperties;
}

export function Dropdown<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  compact,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  placeholder?: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(-1);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const i = options.findIndex((o) => o.value === value);
    setHover(i);
    requestAnimationFrame(() => list.current?.querySelector<HTMLElement>(`[data-i="${i}"]`)?.scrollIntoView({ block: 'nearest' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const pick = (o: Option<T>) => {
    onChange(o.value);
    setOpen(false);
    btn.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return setOpen(true);
      const n = (hover + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      setHover(n);
      list.current?.querySelector<HTMLElement>(`[data-i="${n}"]`)?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (open && options[hover]) pick(options[hover]);
      else setOpen(true);
    }
  };

  return (
    <>
      <button
        ref={btn}
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={onKey}
        className={`w-full flex items-center gap-2 bg-zinc-900 border rounded-md text-left text-zinc-100 focus:outline-none focus:border-indigo-400 ${
          open ? 'border-indigo-400' : 'border-white/10 hover:border-white/20'
        } ${compact ? 'px-2 py-1 text-xs' : 'px-2 py-1.5 text-sm'}`}
      >
        <span className="flex-1 truncate" style={current?.style}>
          {current ? current.label : <span className="text-zinc-500">{placeholder}</span>}
        </span>
        <svg viewBox="0 0 10 6" className={`w-2.5 h-2.5 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      </button>
      <Popover anchor={btn} open={open} onClose={close} matchWidth>
        <div ref={list} className="max-h-64 overflow-y-auto editor-scroll p-1" onKeyDown={onKey}>
          {options.map((o, i) => (
            <button
              type="button"
              key={o.value}
              data-i={i}
              onMouseEnter={() => setHover(i)}
              onClick={() => pick(o)}
              className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded ${compact ? 'text-xs' : 'text-sm'} ${
                i === hover ? 'bg-indigo-500/25 text-white' : 'text-zinc-300'
              }`}
            >
              <span className="flex-1 truncate" style={o.style}>
                {o.label}
              </span>
              {o.value === value && <span className="text-indigo-300 text-xs">✓</span>}
            </button>
          ))}
        </div>
      </Popover>
    </>
  );
}

/* ------------------------------ slider ------------------------------ */

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const snapStep = (v: number, step: number, min: number) => {
  const decimals = (String(step).split('.')[1] ?? '').length;
  return Number((Math.round((v - min) / step) * step + min).toFixed(decimals));
};

/** Pointer-driven range slider (no native range input). */
export function Range({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
  trackStyle,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  trackStyle?: CSSProperties;
}) {
  const track = useRef<HTMLDivElement>(null);
  const pct = ((clamp(value, min, max) - min) / (max - min || 1)) * 100;

  const fromEvent = (clientX: number) => {
    const r = track.current!.getBoundingClientRect();
    return snapStep(clamp(min + ((clientX - r.left) / r.width) * (max - min), min, max), step, min);
  };

  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).focus();
    onChange(fromEvent(e.clientX));
    const move = (ev: PointerEvent) => onChange(fromEvent(ev.clientX));
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const key = (e: React.KeyboardEvent) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    e.stopPropagation();
    onChange(snapStep(clamp(value + d * step * (e.shiftKey ? 10 : 1), min, max), step, min));
  };

  return (
    <div
      role="slider"
      tabIndex={0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      onPointerDown={down}
      onKeyDown={key}
      className={`group relative h-4 flex items-center cursor-pointer touch-none focus:outline-none ${className}`}
    >
      <div ref={track} className="relative w-full h-1.5 rounded-full bg-zinc-700/80" style={trackStyle}>
        {!trackStyle && <div className="absolute inset-y-0 left-0 rounded-full bg-indigo-400" style={{ width: `${pct}%` }} />}
        <div
          className="absolute top-1/2 w-3.5 h-3.5 -mt-[7px] -ml-[7px] rounded-full bg-white shadow ring-2 ring-indigo-400 group-focus-visible:ring-4 transition-shadow"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------ stepper ------------------------------ */

/** Number field with custom ▲▼ buttons (native spinners are hidden via CSS). */
export function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const lo = min ?? -Infinity;
  const hi = max ?? Infinity;
  const add = (v: number, d: number) => clamp(Number((v + d).toFixed(6)), lo, hi);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (hold.current) clearTimeout(hold.current);
  }, []);

  /** click = one step, press and hold = repeat */
  const startHold = (d: number) => {
    let v = add(value, d * step);
    onChange(v);
    const tick = (delay: number) => {
      hold.current = setTimeout(() => {
        v = add(v, d * step);
        onChange(v);
        tick(50);
      }, delay);
    };
    tick(400);
  };
  const stopHold = () => {
    if (hold.current) clearTimeout(hold.current);
    hold.current = null;
  };

  const arrow = (d: 1 | -1) => (
    <button
      type="button"
      tabIndex={-1}
      onPointerDown={(e) => {
        e.preventDefault();
        startHold(d);
      }}
      onPointerUp={stopHold}
      onPointerLeave={stopHold}
      className="flex-1 w-4 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10"
    >
      <svg viewBox="0 0 10 6" className={`w-2 h-2 ${d > 0 ? 'rotate-180' : ''}`}>
        <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      </svg>
    </button>
  );

  return (
    <div className="group relative flex items-stretch bg-zinc-900 border border-white/10 rounded-md focus-within:border-indigo-400 hover:border-white/20 overflow-hidden">
      <input
        type="text"
        inputMode="decimal"
        className="flex-1 min-w-0 bg-transparent px-2 py-1.5 text-sm text-zinc-100 focus:outline-none"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = parseFloat(e.target.value.replace(',', '.'));
          if (Number.isFinite(n)) onChange(clamp(n, lo, hi));
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            onChange(add(value, (e.key === 'ArrowUp' ? 1 : -1) * step * (e.shiftKey ? 10 : 1)));
          }
        }}
        onBlur={() => setDraft(String(value))}
      />
      {suffix && <span className="self-center pr-1 text-[10px] text-zinc-500 pointer-events-none">{suffix}</span>}
      <div className="flex flex-col border-l border-white/10 opacity-60 group-hover:opacity-100">
        {arrow(1)}
        {arrow(-1)}
      </div>
    </div>
  );
}

/* ------------------------------ color ------------------------------ */

interface Hsva {
  h: number;
  s: number;
  v: number;
  a: number;
}

export function parseColor(c: string): Hsva {
  let m = /^#?([0-9a-f]{3,8})$/i.exec(c.trim());
  let r = 0,
    g = 0,
    b = 0,
    a = 1;
  if (m) {
    let hex = m[1];
    if (hex.length === 3 || hex.length === 4) hex = hex.split('').map((x) => x + x).join('');
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
    if (hex.length === 8) a = parseInt(hex.slice(6, 8), 16) / 255;
  } else if ((m = /rgba?\(([^)]+)\)/i.exec(c))) {
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    [r, g, b] = p;
    a = p[3] ?? 1;
  }
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const d = max - min;
  let h = 0;
  if (d) {
    const rr = r / 255,
      gg = g / 255,
      bb = b / 255;
    h = max === rr ? ((gg - bb) / d) % 6 : max === gg ? (bb - rr) / d + 2 : (rr - gg) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max ? d / max : 0, v: max, a };
}

const hex2 = (n: number) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');

export function toHex({ h, s, v, a }: Hsva) {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const base = `#${hex2(f(5) * 255)}${hex2(f(3) * 255)}${hex2(f(1) * 255)}`;
  return a >= 0.999 ? base : base + hex2(a * 255);
}

const SWATCHES = ['#ffffff', '#000000', '#f7a8d3', '#fa95cd', '#a86a8e', '#c9b8ff', '#8a7cf5', '#6b2bc8', '#4f55e6', '#23225c', '#a6cf6a', '#3f7d27', '#f1e2b1', '#ffd36e', '#ff7a7a', '#00000000'];

/** Drag area helper: reports the pointer position inside `el` as 0..1 fractions. */
function useDrag2d(onMove: (x: number, y: number) => void) {
  return (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const el = e.currentTarget;
    const report = (cx: number, cy: number) => {
      const r = el.getBoundingClientRect();
      onMove(clamp((cx - r.left) / r.width, 0, 1), clamp((cy - r.top) / r.height, 0, 1));
    };
    report(e.clientX, e.clientY);
    const move = (ev: PointerEvent) => report(ev.clientX, ev.clientY);
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
}

export function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Keep hue/saturation locally so they survive passing through black/white/transparent.
  const [hsva, setHsva] = useState<Hsva>(() => parseColor(value));
  const last = useRef(value);
  useEffect(() => {
    if (value !== last.current) {
      last.current = value;
      setHsva(parseColor(value));
    }
  }, [value]);

  const set = (patch: Partial<Hsva>) => {
    const next = { ...hsva, ...patch };
    setHsva(next);
    const hex = toHex(next);
    last.current = hex;
    onChange(hex);
  };

  const sv = useDrag2d((x, y) => set({ s: x, v: 1 - y }));
  const pure = toHex({ h: hsva.h, s: 1, v: 1, a: 1 });
  const solid = toHex({ ...hsva, a: 1 });

  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <div className="p-3 space-y-3 w-60">
      <div
        onPointerDown={sv}
        className="relative h-36 rounded-md cursor-crosshair touch-none"
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${pure})` }}
      >
        <div
          className="absolute w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,.5)] pointer-events-none"
          style={{ left: `${hsva.s * 100}%`, top: `${(1 - hsva.v) * 100}%`, background: solid }}
        />
      </div>
      <Range
        value={hsva.h}
        min={0}
        max={360}
        step={1}
        onChange={(h) => set({ h })}
        trackStyle={{ height: 10, background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
      />
      <div className="editor-checker rounded-full">
        <Range
          value={Math.round(hsva.a * 100)}
          min={0}
          max={100}
          step={1}
          onChange={(a) => set({ a: a / 100 })}
          trackStyle={{ height: 10, background: `linear-gradient(to right, transparent, ${solid})` }}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          className="flex-1 min-w-0 bg-zinc-950 border border-white/10 rounded px-2 py-1 font-mono text-xs text-zinc-100 focus:outline-none focus:border-indigo-400"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(e.target.value)) {
              last.current = e.target.value;
              setHsva(parseColor(e.target.value));
              onChange(e.target.value);
            }
          }}
        />
        <span className="text-[11px] text-zinc-400 w-9 text-right">{Math.round(hsva.a * 100)}%</span>
      </div>
      <div className="grid grid-cols-8 gap-1">
        {SWATCHES.map((c) => (
          <button
            type="button"
            key={c}
            title={c}
            onClick={() => {
              last.current = c;
              setHsva(parseColor(c));
              onChange(c);
            }}
            className="aspect-square rounded border border-white/15 editor-checker overflow-hidden"
          >
            <span className="block w-full h-full" style={{ background: c }} />
          </button>
        ))}
      </div>
    </div>
  );
}
