'use client';

import { useRef, useState, type ReactNode } from 'react';
import type { Fill, ShadowStyle, StickerKind, TextStyle } from '@/types/overlay';
import { FONT_OPTIONS } from '@/lib/fonts';
import { STICKERS, STICKER_KINDS, Sticker } from '@/lib/stickers';
import { ColorPicker, Dropdown, Popover, Range, Stepper } from './widgets';

/* ------------------------------ layout ------------------------------ */

export function Section({ title, children, right, defaultOpen = true }: { title: string; children: ReactNode; right?: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-white/5">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <button type="button" onClick={() => setOpen(!open)} className="flex-1 flex items-center gap-2 text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-400 hover:text-zinc-200">
          <span className={`transition-transform text-[9px] ${open ? 'rotate-90' : ''}`}>▶</span>
          {title}
        </button>
        {right}
      </div>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </section>
  );
}

export function Row({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-xs text-zinc-400">{label}</span>
        {hint && <span className="text-[10px] text-zinc-500">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

export const Grid = ({ children, cols = 2 }: { children: ReactNode; cols?: number }) => (
  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
    {children}
  </div>
);

const inputCls =
  'w-full bg-zinc-900 border border-white/10 rounded-md px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-400';

/* ------------------------------ inputs ------------------------------ */

export function TextInput({ value, onChange, placeholder, multiline }: { value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean }) {
  return multiline ? (
    <textarea className={`${inputCls} min-h-16 resize-y`} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  ) : (
    <input className={inputCls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  );
}

export function NumberInput({ value, onChange, min, max, step = 1, suffix }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return <Stepper value={value} onChange={onChange} min={min} max={max} step={step} suffix={suffix} />;
}

export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, suffix }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-zinc-400">{label}</span>
        <div className="w-24">
          <NumberInput value={value} onChange={onChange} step={step} suffix={suffix} />
        </div>
      </div>
      <Range value={value} min={min} max={max} step={step} onChange={onChange} />
    </div>
  );
}

export function Toggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 relative w-8 h-[18px] rounded-full shrink-0 transition-colors ${checked ? 'bg-indigo-500' : 'bg-zinc-700'}`}
      >
        <span className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-all ${checked ? 'left-[16px]' : 'left-[2px]'}`} />
      </button>
      <span>
        <span className="text-sm text-zinc-200">{label}</span>
        {hint && <span className="block text-[11px] text-zinc-500">{hint}</span>}
      </span>
    </label>
  );
}

export function Select<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] | readonly T[] }) {
  const opts = (options as (T | { value: T; label: string })[]).map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return <Dropdown value={value} onChange={onChange} options={opts} />;
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode; title?: string }[] }) {
  return (
    <div className="flex bg-zinc-900 border border-white/10 rounded-md p-0.5 gap-0.5">
      {options.map((o) => (
        <button
          type="button"
          key={o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`flex-1 text-xs px-2 py-1 rounded ${value === o.value ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------- color ------------------------------- */

export function ColorInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  return (
    <div>
      {label && <div className="text-xs text-zinc-400 mb-1">{label}</div>}
      <button
        ref={anchor}
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 bg-zinc-900 border rounded-md p-1 pr-2 text-left ${open ? 'border-indigo-400' : 'border-white/10 hover:border-white/20'}`}
      >
        <span className="relative w-7 h-7 rounded editor-checker overflow-hidden border border-white/15 shrink-0">
          <span className="absolute inset-0" style={{ background: value }} />
        </span>
        <span className="flex-1 font-mono text-xs text-zinc-200 truncate">{value}</span>
      </button>
      <Popover anchor={anchor} open={open} onClose={() => setOpen(false)}>
        <ColorPicker value={value} onChange={onChange} />
      </Popover>
    </div>
  );
}

export function FillInput({ value, onChange }: { value: Fill; onChange: (v: Fill) => void }) {
  return (
    <div className="space-y-2">
      <Segmented
        value={value.type}
        onChange={(type) => onChange({ ...value, type })}
        options={[
          { value: 'solid', label: 'Solid' },
          { value: 'linear', label: 'Linear' },
          { value: 'radial', label: 'Radial' },
        ]}
      />
      <ColorInput value={value.color} onChange={(color) => onChange({ ...value, color, color2: value.type === 'solid' ? color : value.color2 })} />
      {value.type !== 'solid' && <ColorInput value={value.color2} onChange={(color2) => onChange({ ...value, color2 })} />}
      {value.type === 'linear' && <Slider label="Angle" value={value.angle} min={0} max={360} suffix="°" onChange={(angle) => onChange({ ...value, angle })} />}
    </div>
  );
}

export function ShadowInput({ value, onChange, label = 'Shadow' }: { value: ShadowStyle; onChange: (v: ShadowStyle) => void; label?: string }) {
  return (
    <div className="space-y-2">
      <Toggle label={label} checked={value.enabled} onChange={(enabled) => onChange({ ...value, enabled })} />
      {value.enabled && (
        <div className="space-y-2 pl-3 border-l border-white/10">
          <ColorInput value={value.color} onChange={(color) => onChange({ ...value, color })} />
          <Grid cols={3}>
            <Row label="X">
              <NumberInput value={value.x} onChange={(x) => onChange({ ...value, x })} />
            </Row>
            <Row label="Y">
              <NumberInput value={value.y} onChange={(y) => onChange({ ...value, y })} />
            </Row>
            <Row label="Blur">
              <NumberInput value={value.blur} min={0} onChange={(blur) => onChange({ ...value, blur })} />
            </Row>
          </Grid>
        </div>
      )}
    </div>
  );
}

export function FontInput({ value, onChange, allowInherit }: { value: string; onChange: (v: string) => void; allowInherit?: boolean }) {
  const custom = !!value && !FONT_OPTIONS.includes(value);
  const [other, setOther] = useState(custom);
  const options = [
    ...(allowInherit ? [{ value: '', label: 'Default font' }] : []),
    ...FONT_OPTIONS.map((f) => ({ value: f, label: f, style: { fontFamily: `'${f}', system-ui` } })),
    { value: '__custom', label: 'Other Google Font…' },
  ];
  return (
    <div className="space-y-1.5">
      <Dropdown
        value={custom || other ? '__custom' : value}
        onChange={(v) => {
          setOther(v === '__custom');
          if (v !== '__custom') onChange(v);
        }}
        options={options}
      />
      {(custom || other) && <TextInput value={value} onChange={onChange} placeholder="Google Font name, e.g. Roboto" />}
    </div>
  );
}

export function TextStyleInput({ value, onChange, showAlign = true }: { value: TextStyle; onChange: (v: TextStyle) => void; showAlign?: boolean }) {
  const set = (patch: Partial<TextStyle>) => onChange({ ...value, ...patch });
  return (
    <div className="space-y-2">
      <FontInput value={value.font} onChange={(font) => set({ font })} allowInherit />
      <ColorInput label="Color" value={value.color} onChange={(color) => set({ color })} />
      <Grid cols={3}>
        <Row label="Size">
          <NumberInput value={value.size} min={6} max={80} onChange={(size) => set({ size })} suffix="px" />
        </Row>
        <Row label="Weight">
          <Select
            value={String(value.weight)}
            onChange={(w) => set({ weight: parseInt(w) })}
            options={['300', '400', '500', '600', '700', '800', '900']}
          />
        </Row>
        <Row label="Spacing">
          <NumberInput value={value.letterSpacing} step={0.5} onChange={(letterSpacing) => set({ letterSpacing })} />
        </Row>
      </Grid>
      {showAlign && (
        <Segmented
          value={value.align}
          onChange={(align) => set({ align })}
          options={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ]}
        />
      )}
      <Toggle label="UPPERCASE" checked={value.uppercase} onChange={(uppercase) => set({ uppercase })} />
      <ShadowInput label="Text shadow" value={value.shadow} onChange={(shadow) => set({ shadow })} />
    </div>
  );
}

export function StickerPicker({ value, onChange, allowNone, color = '#e4e4e7' }: { value: StickerKind | ''; onChange: (v: StickerKind | '') => void; allowNone?: boolean; color?: string }) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {allowNone && (
        <button type="button" onClick={() => onChange('')} className={`aspect-square rounded text-[10px] text-zinc-400 border ${value === '' ? 'border-indigo-400 bg-indigo-500/20' : 'border-white/10 hover:bg-white/5'}`}>
          none
        </button>
      )}
      {STICKER_KINDS.map((k) => (
        <button
          type="button"
          key={k}
          title={STICKERS[k].label}
          onClick={() => onChange(k)}
          className={`aspect-square rounded p-1 border ${value === k ? 'border-indigo-400 bg-indigo-500/20' : 'border-white/10 hover:bg-white/5'}`}
        >
          <Sticker kind={k} color={color} color2="#a1a1aa" size="100%" />
        </button>
      ))}
    </div>
  );
}

export function IconButton({ onClick, title, children, disabled, active, danger }: { onClick: () => void; title: string; children: ReactNode; disabled?: boolean; active?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`h-8 min-w-8 px-2 rounded-md text-sm inline-flex items-center justify-center gap-1.5 border transition-colors disabled:opacity-30 disabled:pointer-events-none ${
        active ? 'bg-indigo-500 border-indigo-400 text-white' : danger ? 'border-red-500/30 text-red-300 hover:bg-red-500/15' : 'border-white/10 text-zinc-300 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}
