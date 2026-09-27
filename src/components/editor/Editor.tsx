'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { BubbleStyle, Decoration, GeneralSettings, OverlayConfig, Position, StyleKey } from '@/types/overlay';
import { EVENT_KEYS, MESSAGE_KEYS, isEventKey } from '@/types/overlay';
import { clone, deco as makeDeco, LABELS, normalizeConfig, uid } from '@/lib/config/defaults';
import { PRESETS, defaultConfig } from '@/lib/config/presets';
import { configFromHash, parseHash } from '@/lib/config/serialize';
import { fontsInConfig, loadFonts } from '@/lib/fonts';
import { sampleData, sampleItem, randomItem } from '@/lib/sample';
import Bubble, { fillCss } from '@/components/bubble/Bubble';
import ChatFeed, { resolveStyle, useFeed } from '@/components/feed/ChatFeed';
import BubbleCanvas from './BubbleCanvas';
import { BubbleInspector, DecorationInspector, GeneralInspector, NameInspector, RoleInspector } from './Inspector';
import { Palette, Layers } from './Palette';
import ExportPanel, { Auth } from './ExportPanel';
import { IconButton, Segmented, Section } from './controls';
import { useHistory } from './useHistory';

const DRAFT_KEY = 'chat-overlay:draft';

type Panel = 'style' | 'general' | 'export';
type Mode = 'design' | 'gallery' | 'live';

const BACKGROUNDS: { id: string; label: string; css: string }[] = [
  { id: 'checker', label: 'Checker', css: '' },
  { id: 'dark', label: 'Dark', css: '#0d0d12' },
  { id: 'light', label: 'Light', css: '#e9e9ef' },
  { id: 'game', label: 'Scene', css: 'linear-gradient(160deg, #1f3b5a 0%, #3d2a5c 45%, #0f1d2b 100%)' },
  { id: 'green', label: 'Green', css: '#00b140' },
];

function loadDraft(): OverlayConfig {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) return normalizeConfig(JSON.parse(raw));
  } catch {
    /* ignore broken drafts */
  }
  return defaultConfig();
}

export default function Editor({ auth, onLogout }: { auth: Auth | null; onLogout: () => void }) {
  const history = useHistory<OverlayConfig>(loadDraft);
  const config = history.value;
  const [styleKey, setStyleKey] = useState<StyleKey>('default');
  const [selected, setSelected] = useState<string | null>('bubble');
  const [panel, setPanel] = useState<Panel>(auth ? 'style' : 'export');
  const [mode, setMode] = useState<Mode>('design');
  const [leftTab, setLeftTab] = useState<'layers' | 'add'>('layers');
  const [zoom, setZoom] = useState(1.5);
  const [bg, setBg] = useState('checker');
  const [sample, setSample] = useState({ name: '', text: '' });
  const [presetOpen, setPresetOpen] = useState(false);

  const style = config.styles[styleKey];
  const isEvent = isEventKey(styleKey);
  const keyRef = useRef(styleKey);
  keyRef.current = styleKey;

  /* ------------------------------ updates ------------------------------ */

  const updateConfig = useCallback(
    (fn: (c: OverlayConfig) => void, coalesce?: string) =>
      history.set((prev) => {
        const next = structuredClone(prev);
        fn(next);
        return next;
      }, coalesce),
    [history],
  );

  const change = useCallback(
    (fn: (s: BubbleStyle) => void, coalesce?: string) =>
      updateConfig((c) => fn(c.styles[keyRef.current]), coalesce && `${coalesce}@${keyRef.current}`),
    [updateConfig],
  );

  const updateGeneral = useCallback(
    (fn: (g: GeneralSettings) => void, coalesce?: string) => updateConfig((c) => fn(c.general), coalesce && `general-${coalesce}`),
    [updateConfig],
  );

  const updateDeco = (id: string, fn: (d: Decoration) => void, key?: string) =>
    change((s) => {
      const d = s.decorations.find((x) => x.id === id);
      if (d) fn(d);
    }, key && `deco-${id}-${key}`);

  const addDecoration = (partial: Partial<Decoration>, attach: Decoration['attach'] = 'bubble', pos?: Position) => {
    const d = makeDeco({ value: '', pos: { x: 96, y: 4 }, ...partial, attach, id: uid() });
    if (pos) d.pos = pos;
    if (attach === 'name' && d.size > 30) d.size = 24;
    change((s) => void s.decorations.push(d));
    setSelected(d.id);
    setPanel('style');
  };

  const deleteSelected = () => {
    if (!selected || ['bubble', 'name', 'role'].includes(selected)) return;
    change((s) => void (s.decorations = s.decorations.filter((d) => d.id !== selected)));
    setSelected('bubble');
  };

  const duplicateSelected = () => {
    const d = style.decorations.find((x) => x.id === selected);
    if (!d) return;
    const copy = { ...clone(d), id: uid(), pos: { x: d.pos.x + 4, y: d.pos.y + 4 } };
    change((s) => void s.decorations.push(copy));
    setSelected(copy.id);
  };

  const moveOrder = (id: string, dir: 1 | -1) =>
    change((s) => {
      const i = s.decorations.findIndex((d) => d.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.decorations.length) return;
      [s.decorations[i], s.decorations[j]] = [s.decorations[j], s.decorations[i]];
    });

  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    const next = p.build();
    updateConfig((c) => {
      c.styles = next.styles;
      c.general.font = next.general.font;
      c.general.align = next.general.align;
      c.general.gap = next.general.gap;
    });
    setSelected('bubble');
    setPresetOpen(false);
  };

  const importConfig = (c: OverlayConfig) => updateConfig((prev) => Object.assign(prev, clone(c)));

  /* ------------------------------ effects ------------------------------ */

  // Open a design passed in the URL (e.g. /editor/#cfg=…)
  useEffect(() => {
    const hs = parseHash(window.location.hash);
    if (hs.cfg || hs.preset) configFromHash(hs).then(importConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadFonts(fontsInConfig(config));
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(config));
      } catch {
        /* storage full or disabled */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [config]);

  useEffect(() => {
    if (selected && !['bubble', 'name', 'role'].includes(selected) && !style.decorations.some((d) => d.id === selected)) {
      setSelected('bubble');
    }
  }, [style, selected]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, textarea, select, [contenteditable]')) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) history.redo();
        else history.undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        history.redo();
      } else if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      } else if (e.key === 'Escape') {
        setSelected('bubble');
      } else if (e.key.startsWith('Arrow') && selected && selected !== 'bubble') {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 0.5;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        change((s) => {
          const target = selected === 'name' ? s.name : selected === 'role' ? s.role : s.decorations.find((d) => d.id === selected);
          if (target) target.pos = { x: target.pos.x + dx, y: target.pos.y + dy };
        }, `nudge-${selected}`);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  /* ------------------------------ preview ------------------------------ */

  const data = useMemo(() => sampleData(styleKey, sample), [styleKey, sample]);
  const background = BACKGROUNDS.find((b) => b.id === bg)?.css ?? '';
  const selectedDeco = style.decorations.find((d) => d.id === selected);

  const selectStyle = (key: StyleKey) => {
    setStyleKey(key);
    setSelected('bubble');
    setPanel('style');
  };

  /* ------------------------------ render ------------------------------ */

  const styleButton = (key: StyleKey) => {
    const s = config.styles[key];
    const active = panel === 'style' && key === styleKey;
    return (
      <button
        type="button"
        key={key}
        onClick={() => selectStyle(key)}
        className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm text-left ${active ? 'bg-indigo-500/25 text-white' : 'text-zinc-300 hover:bg-white/5'}`}
      >
        <span className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ background: fillCss(s.fill) }} />
        <span className="flex-1 truncate">{LABELS[key]}</span>
        {!s.enabled && <span className="text-[10px] text-zinc-500">{isEventKey(key) ? 'off' : '→ viewer'}</span>}
      </button>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 text-sm overflow-hidden" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* ---------------- top bar ---------------- */}
      <header className="h-12 shrink-0 flex items-center gap-3 px-4 border-b border-white/10 bg-zinc-900/60">
        <div className="font-semibold tracking-tight">
          💬 Chat Overlay <span className="text-indigo-300">Studio</span>
        </div>
        <div className="relative">
          <IconButton title="Apply a ready-made theme" onClick={() => setPresetOpen(!presetOpen)} active={presetOpen}>
            🎨 Themes
          </IconButton>
          {presetOpen && (
            <div className="absolute left-0 top-10 z-50 w-80 bg-zinc-900 border border-white/10 rounded-lg shadow-2xl p-2 space-y-1">
              <p className="text-[11px] text-zinc-500 px-2 pb-1">Replaces the look of every bubble. You can undo it.</p>
              {PRESETS.map((p) => (
                <button type="button" key={p.id} onClick={() => applyPreset(p.id)} className="w-full text-left p-2 rounded-md hover:bg-white/5 flex items-center gap-3">
                  <span className="flex -space-x-1.5">
                    {p.swatch.map((c, i) => (
                      <span key={i} className="w-4 h-4 rounded-full border border-zinc-900" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm text-white">{p.name}</span>
                    <span className="block text-[11px] text-zinc-500">{p.description}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <IconButton title="Undo (Ctrl+Z)" onClick={history.undo} disabled={!history.canUndo}>
            ↶
          </IconButton>
          <IconButton title="Redo (Ctrl+Shift+Z)" onClick={history.redo} disabled={!history.canRedo}>
            ↷
          </IconButton>
        </div>
        <div className="flex-1" />
        <div className="w-72">
          <Segmented<Mode>
            value={mode}
            onChange={setMode}
            options={[
              { value: 'design', label: 'Design' },
              { value: 'gallery', label: 'All styles' },
              { value: 'live', label: 'Live preview' },
            ]}
          />
        </div>
        <div className="flex-1" />
        <IconButton title="Overlay settings" onClick={() => setPanel('general')} active={panel === 'general'}>
          ⚙ Settings
        </IconButton>
        <button
          type="button"
          onClick={() => setPanel('export')}
          className={`h-8 px-3 rounded-md text-sm font-medium ${panel === 'export' ? 'bg-emerald-500 text-white' : 'bg-emerald-600/90 hover:bg-emerald-500 text-white'}`}
        >
          Get OBS link
        </button>
      </header>

      <div className="flex-1 flex min-h-0">
        {/* ---------------- left sidebar ---------------- */}
        <aside className="w-64 shrink-0 border-r border-white/10 flex flex-col min-h-0 bg-zinc-900/40">
          <div className="overflow-y-auto editor-scroll p-2 space-y-3 max-h-[46%]">
            <div>
              <div className="px-2.5 pb-1 text-[10px] uppercase tracking-wider text-zinc-500">Chat messages</div>
              {MESSAGE_KEYS.map(styleButton)}
            </div>
            <div>
              <div className="px-2.5 pb-1 text-[10px] uppercase tracking-wider text-zinc-500">Alerts in chat</div>
              {EVENT_KEYS.map(styleButton)}
            </div>
          </div>
          <div className="border-t border-white/10 flex-1 min-h-0 flex flex-col">
            <div className="p-2">
              <Segmented
                value={leftTab}
                onChange={setLeftTab}
                options={[
                  { value: 'layers', label: 'Elements' },
                  { value: 'add', label: '+ Decorations' },
                ]}
              />
            </div>
            <div className="flex-1 overflow-y-auto editor-scroll px-2 pb-3">
              {leftTab === 'layers' ? (
                <Layers
                  style={style}
                  selected={panel === 'style' ? selected : null}
                  onSelect={(id) => {
                    setSelected(id);
                    setPanel('style');
                    setMode('design');
                  }}
                  onReorder={(from, to) =>
                    change((s) => {
                      const [d] = s.decorations.splice(from, 1);
                      s.decorations.splice(to, 0, d);
                    })
                  }
                  onToggleTag={(tag) => change((s) => void (s[tag].visible = !s[tag].visible))}
                />
              ) : (
                <Palette onAdd={(p) => addDecoration(p)} />
              )}
            </div>
          </div>
        </aside>

        {/* ---------------- stage ---------------- */}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="h-11 shrink-0 flex items-center gap-2 px-3 border-b border-white/10 text-xs">
            {mode === 'design' && (
              <>
                <span className="text-zinc-400">{LABELS[styleKey]}</span>
                <input
                  className="w-28 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs"
                  placeholder="Sample name"
                  value={sample.name}
                  onChange={(e) => setSample({ ...sample, name: e.target.value })}
                />
                <input
                  className="flex-1 min-w-0 bg-zinc-900 border border-white/10 rounded px-2 py-1 text-xs"
                  placeholder="Sample message"
                  value={sample.text}
                  onChange={(e) => setSample({ ...sample, text: e.target.value })}
                />
                <select className="bg-zinc-900 border border-white/10 rounded px-1.5 py-1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))}>
                  {[1, 1.25, 1.5, 2, 2.5].map((z) => (
                    <option key={z} value={z}>
                      {Math.round(z * 100)}%
                    </option>
                  ))}
                </select>
              </>
            )}
            {mode !== 'design' && <span className="flex-1 text-zinc-400">{mode === 'gallery' ? 'Click a bubble to edit its style' : 'Simulated chat with your current settings'}</span>}
            <div className="flex gap-1">
              {BACKGROUNDS.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  title={b.label}
                  onClick={() => setBg(b.id)}
                  className={`w-6 h-6 rounded border ${bg === b.id ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-white/20'} ${b.id === 'checker' ? 'editor-checker' : ''}`}
                  style={b.css ? { background: b.css } : undefined}
                />
              ))}
            </div>
          </div>

          <div className={`flex-1 min-h-0 relative ${bg === 'checker' ? 'editor-checker' : ''}`}>
            {mode === 'design' && (
              <BubbleCanvas
                style={style}
                general={config.general}
                data={data}
                isEvent={isEvent}
                selected={panel === 'style' ? selected : null}
                onSelect={(id) => {
                  setSelected(id);
                  setPanel('style');
                }}
                onChange={change}
                onDropDecoration={(p, attach, pos) => addDecoration(p, attach, pos)}
                zoom={zoom}
                background={background}
              />
            )}
            {mode === 'gallery' && <Gallery config={config} background={background} onPick={(k) => { selectStyle(k); setMode('design'); }} />}
            {mode === 'live' && <LivePreview config={config} background={background} />}
            {mode === 'design' && (
              <div className="absolute bottom-2 left-3 text-[11px] text-zinc-400/80 pointer-events-none">
                Drag tags & decorations · Alt = no snapping · Shift+rotate = 15° steps · Del to remove · Ctrl+D duplicate
              </div>
            )}
          </div>
        </main>

        {/* ---------------- inspector ---------------- */}
        <aside className="w-80 shrink-0 border-l border-white/10 overflow-y-auto editor-scroll bg-zinc-900/40">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-[10px] uppercase tracking-wider text-zinc-500">
              {panel === 'general' ? 'Overlay' : panel === 'export' ? 'Publish' : LABELS[styleKey]}
            </div>
            <div className="font-semibold">
              {panel === 'general'
                ? 'Settings'
                : panel === 'export'
                  ? 'Get your overlay'
                  : selected === 'name'
                    ? 'Name tag'
                    : selected === 'role'
                      ? 'Role tag'
                      : selectedDeco
                        ? 'Decoration'
                        : 'Bubble'}
            </div>
          </div>
          {panel === 'general' && <GeneralInspector general={config.general} update={updateGeneral} />}
          {panel === 'export' && <ExportPanel config={config} auth={auth} onLogout={onLogout} onImport={importConfig} />}
          {panel === 'style' &&
            (selected === 'name' ? (
              <NameInspector style={style} change={change} />
            ) : selected === 'role' ? (
              <RoleInspector style={style} change={change} />
            ) : selectedDeco ? (
              <DecorationInspector
                deco={selectedDeco}
                update={(fn, key) => updateDeco(selectedDeco.id, fn, key)}
                onDelete={deleteSelected}
                onDuplicate={duplicateSelected}
                onOrder={(dir) => moveOrder(selectedDeco.id, dir)}
              />
            ) : (
              <BubbleInspector
                style={style}
                styleKey={styleKey}
                change={change}
                onCopyFrom={(from) =>
                  updateConfig((c) => {
                    const src = clone(c.styles[from]);
                    const target = c.styles[styleKey];
                    c.styles[styleKey] = {
                      ...src,
                      enabled: target.enabled,
                      label: target.label,
                      event: target.event,
                      role: { ...src.role, label: target.role.label },
                      decorations: src.decorations.map((d) => ({ ...d, id: uid() })),
                    };
                  })
                }
              />
            ))}
          {panel === 'style' && (
            <Section title="Tip" defaultOpen={false}>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Floating tags keep the edge closest to the bubble border fixed, so long names grow inwards. Position values are percentages of the bubble: 0 = left/top edge, 100 = right/bottom edge.
              </p>
            </Section>
          )}
        </aside>
      </div>
    </div>
  );
}

/* ------------------------------ previews ------------------------------ */

function Gallery({ config, background, onPick }: { config: OverlayConfig; background: string; onPick: (k: StyleKey) => void }) {
  const keys = [...MESSAGE_KEYS, ...EVENT_KEYS.filter((k) => config.styles[k].enabled)];
  const g = config.general;
  return (
    <div className="absolute inset-0 overflow-auto editor-scroll" style={{ background }}>
      <div
        className="flex flex-col py-8 px-6 min-h-full justify-center"
        style={{ alignItems: g.align === 'left' ? 'flex-start' : g.align === 'right' ? 'flex-end' : 'center', gap: g.gap, zoom: g.scale }}
      >
        {keys.map((k) => {
          const item = sampleItem(k);
          return (
            <button type="button" key={k} onClick={() => onPick(k)} className="relative group text-left max-w-full" title={`Edit “${LABELS[k]}”`}>
              <Bubble style={resolveStyle(config, k)} general={g} data={item.data} isEvent={isEventKey(k)} />
              <span className="absolute -left-2 top-1/2 -translate-x-full -translate-y-1/2 text-[10px] text-white/60 bg-black/50 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                {LABELS[k]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LivePreview({ config, background }: { config: OverlayConfig; background: string }) {
  const feed = useFeed(config);
  const [running, setRunning] = useState(true);
  const [speed, setSpeed] = useState(1800);
  const [width, setWidth] = useState(480);

  useEffect(() => {
    if (!running) return;
    feed.add(randomItem());
    const t = setInterval(() => feed.add(randomItem()), speed);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, speed]);

  const send = (k: StyleKey) => feed.add({ ...sampleItem(k), id: `manual-${k}-${Date.now()}` });

  return (
    <div className="absolute inset-0 flex" style={{ background }}>
      <div className="flex-1 flex justify-center py-4 min-w-0">
        <div className="relative h-full border border-dashed border-white/20" style={{ width }}>
          <ChatFeed config={config} items={feed.items} className="absolute inset-0" />
        </div>
      </div>
      <div className="w-52 shrink-0 bg-zinc-950/80 border-l border-white/10 p-3 space-y-3 overflow-y-auto editor-scroll text-xs">
        <button type="button" onClick={() => setRunning(!running)} className={`w-full py-1.5 rounded-md ${running ? 'bg-zinc-700' : 'bg-indigo-500'} text-white`}>
          {running ? '⏸ Pause' : '▶ Resume'}
        </button>
        <button type="button" onClick={feed.clear} className="w-full py-1.5 rounded-md border border-white/10 text-zinc-300 hover:bg-white/10">
          Clear
        </button>
        <label className="block text-zinc-400">
          Interval: {(speed / 1000).toFixed(1)}s
          <input type="range" className="editor-range w-full" min={400} max={5000} step={100} value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} />
        </label>
        <label className="block text-zinc-400">
          Source width: {width}px
          <input type="range" className="editor-range w-full" min={280} max={1000} step={10} value={width} onChange={(e) => setWidth(parseInt(e.target.value))} />
        </label>
        <div className="text-zinc-500 pt-1">Send a test</div>
        <div className="grid grid-cols-2 gap-1">
          {[...MESSAGE_KEYS, ...EVENT_KEYS].map((k) => (
            <button type="button" key={k} onClick={() => send(k)} className="py-1 px-1.5 rounded border border-white/10 text-zinc-300 hover:bg-white/10 truncate">
              {LABELS[k]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
