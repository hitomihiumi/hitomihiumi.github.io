import { BubbleStyle, EventKey, OverlayConfig, StyleKey, EVENT_KEYS } from '@/types/overlay';
import { buildConfig, deco, DeepPartial, fill, merge, shadow, text } from './defaults';

export interface Preset {
  id: string;
  name: string;
  description: string;
  swatch: string[];
  build: () => OverlayConfig;
}

type Patches = Partial<Record<StyleKey, DeepPartial<BubbleStyle>>>;

const forEvents = (patch: DeepPartial<BubbleStyle>, extra: Patches = {}): Patches => {
  const out: Patches = {};
  for (const k of EVENT_KEYS) out[k as EventKey] = merge(patch, extra[k] as DeepPartial<DeepPartial<BubbleStyle>>);
  return out;
};

/* ------------------------------------------------------------------ */
/* Lavender Bloom — notched purple bubbles with gold trim and flowers  */
/* ------------------------------------------------------------------ */
const lavender = (): OverlayConfig => {
  const flowers = () => [
    deco({ value: 'flower', pos: { x: 2, y: 96 }, size: 26, color: '#c9b8ff', color2: '#fff1b8', rotate: -12 }),
    deco({ value: 'flower', pos: { x: 99, y: 94 }, size: 22, color: '#b9a4ff', color2: '#fff1b8', rotate: 18 }),
    deco({ value: 'sprig', pos: { x: -1, y: 18 }, size: 24, color: '#a998e8', rotate: -30 }),
    deco({ value: 'sprig', pos: { x: 101, y: 22 }, size: 22, color: '#a998e8', rotate: 30, flip: true }),
    deco({ kind: 'line', value: '', pos: { x: 50, y: 100 }, size: 30, color: '#e8d9a8', thickness: 1.5, lineStyle: 'solid' }),
  ];
  const tag = {
    pos: { x: 50, y: 0 },
    fill: fill('#f1e2b1'),
    text: { color: '#3a2a5a', size: 11, weight: 700 },
    padX: 12,
  };
  return buildConfig(
    {
      shape: 'notched',
      cut: 10,
      radius: [22, 22, 22, 22],
      padding: [16, 22, 12, 22],
      minWidth: 260,
      maxWidth: 420,
      margin: [14, 12],
      fill: fill('#241a3d', '#3a2466', 'linear', 90),
      borderWidth: 1.5,
      borderColor: '#e8d9a8',
      shadow: shadow('#b99cff55', 14),
      text: { color: '#f3eeff', size: 15 },
      name: tag,
      role: { visible: true, placement: 'withName', fill: fill('#1b1430'), text: { color: '#f1e2b1', size: 9 }, radius: 999 },
      decorations: flowers(),
    },
    {
      broadcaster: { role: { icon: 'camera', label: '' }, effect: 'glow', effectColor: '#f1e2b1' },
      mod: {
        fill: fill('#ece6ff', '#d9cffc', 'linear', 90),
        text: { color: '#3a2a5a' },
        role: { icon: 'sword', label: '' },
      },
      vip: {
        fill: fill('#4f55e6', '#7a6cf2', 'linear', 90),
        role: { icon: 'heart', label: '' },
        effect: 'glow',
        effectColor: '#f7d98a',
      },
      subscriber: {
        fill: fill('#3d1488', '#6b2bc8', 'linear', 90),
        role: { icon: 'crown', label: '' },
        effect: 'shine',
      },
      first: {
        fill: fill('#f1ecff', '#e2d9ff', 'linear', 90),
        text: { color: '#3a2a5a' },
        name: { fill: fill('#1b1430'), text: { color: '#f1e2b1' } },
        role: { visible: false },
      },
      highlight: { fill: fill('#6b2bc8', '#b25cf0', 'linear', 90), effect: 'pulse', effectColor: '#e3c8ff' },
      default: {
        fill: fill('#ece6ff', '#f7f3ff', 'linear', 90),
        text: { color: '#3a2a5a' },
        name: { fill: fill('#1b1430'), text: { color: '#ffffff' } },
      },
      ...forEvents({
        shape: 'notched',
        minWidth: 300,
        maxWidth: 340,
        fill: fill('#4a1a9a', '#6a25c0', 'linear', 90),
        name: { visible: false },
        role: { visible: false },
        event: {
          titleText: text({ size: 18, weight: 700, align: 'center', letterSpacing: 4, uppercase: true, color: '#f3eeff' }),
          subtitleText: text({ size: 14, align: 'center', color: '#e8dcff' }),
        },
      }),
    },
    { font: 'Comfortaa', align: 'center' },
  );
};

/* ------------------------------------------------------------------ */
/* Forest Axolotl — green pills with daisies, wings and vines          */
/* ------------------------------------------------------------------ */
const forest = (): OverlayConfig => {
  const daisies = () => [
    deco({ value: 'daisy', pos: { x: 97, y: 4 }, size: 22, color: '#ffffff', color2: '#e9b949' }),
    deco({ value: 'daisy', pos: { x: 92, y: -14 }, size: 14, color: '#ffffff', color2: '#e9b949' }),
    deco({ value: 'leaf', pos: { x: 102, y: 60 }, size: 18, color: '#7fbf4d', rotate: 40, anim: 'sway' }),
    deco({ value: 'moon', pos: { x: 5, y: 50 }, size: 18, color: '#ffffff', opacity: 0.85 }),
  ];
  return buildConfig(
    {
      shape: 'rounded',
      radius: [28, 28, 28, 28],
      padding: [16, 22, 14, 38],
      minWidth: 260,
      maxWidth: 400,
      fill: fill('#3f7d27', '#a6cf6a', 'linear', 90),
      borderWidth: 2,
      borderColor: '#cfe7a3',
      shadow: shadow('#9be26a44', 16),
      text: { color: '#ffffff', size: 15, weight: 600, shadow: shadow('#1d3b1044', 2, 0, 1) },
      name: {
        pos: { x: 50, y: 0 },
        fill: fill('#e9f3c9'),
        text: { color: '#3f6d24', size: 12 },
        showAvatar: true,
      },
      role: {
        visible: true,
        placement: 'withName',
        fill: fill('#6fa84a'),
        text: { color: '#ffffff', size: 9 },
        radius: 999,
      },
      decorations: daisies(),
    },
    {
      broadcaster: { role: { icon: 'camera', label: '' }, fill: fill('#2f6a1d', '#86c152', 'linear', 90) },
      mod: { role: { icon: 'sword', label: '' } },
      vip: { role: { icon: 'gem', label: '' } },
      subscriber: {
        fill: fill('#f6f3d8', '#fbf9ea', 'linear', 90),
        text: { color: '#4b6b35', shadow: { enabled: false } },
        role: { icon: 'heart', label: '' },
        decorations: [
          ...daisies().slice(0, 2),
          deco({ value: 'moon', pos: { x: 5, y: 50 }, size: 18, color: '#d9d4a8' }),
          deco({ value: 'wing', pos: { x: 99, y: -6 }, size: 26, color: '#ffffff', rotate: -15 }),
          deco({ value: 'heart', pos: { x: 101, y: -4 }, size: 16, color: '#8bd158' }),
        ],
      },
      first: {
        decorations: [
          deco({ value: 'wing', pos: { x: -3, y: 50 }, size: 34, color: '#ffffff', flip: true, behind: true, anim: 'sway' }),
          deco({ value: 'wing', pos: { x: 103, y: 50 }, size: 34, color: '#ffffff', behind: true, anim: 'sway' }),
          deco({ value: 'flower', pos: { x: 50, y: 104 }, size: 18, color: '#7fbf4d', color2: '#e9f3c9' }),
        ],
        padding: [16, 26, 14, 26],
        role: { visible: false },
      },
      highlight: { effect: 'glow', effectColor: '#d9ff9c' },
      default: {
        fill: fill('#f6f3d8', '#fbf9ea', 'linear', 90),
        text: { color: '#4b6b35', shadow: { enabled: false } },
        name: { fill: fill('#6fa84a'), text: { color: '#ffffff' } },
        decorations: [
          deco({ value: 'sprig', pos: { x: 1, y: 30 }, size: 30, color: '#6fa84a', rotate: -20 }),
          deco({ value: 'sprig', pos: { x: 98, y: 30 }, size: 26, color: '#6fa84a', rotate: 20, flip: true }),
        ],
      },
      ...forEvents({
        fill: fill('#00000000'),
        borderWidth: 0,
        shadow: { enabled: false },
        minWidth: 240,
        padding: [10, 18, 10, 56],
        name: { visible: false },
        role: { visible: false },
        event: {
          titleText: text({ size: 14, weight: 700, color: '#ffffff', align: 'left' }),
          subtitleText: text({ size: 14, weight: 600, color: '#d9f0b8', align: 'left' }),
        },
        decorations: [deco({ value: 'gem', pos: { x: 6, y: 50 }, size: 30, color: '#6fcf3f', color2: '#c8f59f', anim: 'float' })],
      }),
    },
    { font: 'Quicksand', align: 'center' },
  );
};

/* ------------------------------------------------------------------ */
/* Bunny Pink — cream cards with an offset back layer and bunny ears   */
/* ------------------------------------------------------------------ */
const bunny = (): OverlayConfig => {
  const decos = (color: string) => [
    deco({ value: 'bunnyEars', attach: 'name', pos: { x: 22, y: -30 }, size: 26, color, color2: '#ffffff', behind: true }),
    deco({ kind: 'line', value: '', pos: { x: 50, y: 84 }, size: 88, color: '#f4a6cf', thickness: 1.5, lineStyle: 'dashed' }),
    deco({ value: 'sparkle', pos: { x: 104, y: -8 }, size: 12, color: '#ffffff', anim: 'twinkle' }),
    deco({ value: 'dots', pos: { x: 108, y: -2 }, size: 8, color: '#ffffff', opacity: 0.7 }),
  ];
  return buildConfig(
    {
      shape: 'rounded',
      radius: [14, 14, 14, 14],
      padding: [18, 20, 20, 20],
      minWidth: 280,
      maxWidth: 420,
      margin: [22, 14],
      fill: fill('#f7efee'),
      shadow: shadow('#00000033', 8, 0, 2),
      backLayer: { enabled: true, color: '#f7a8d3', x: -7, y: 8 },
      text: { color: '#7c4b66', size: 14 },
      name: {
        pos: { x: 6, y: 0 },
        fill: fill('#f7a8d3'),
        radius: 5,
        text: { color: '#ffffff', size: 12 },
      },
      role: {
        visible: true,
        pos: { x: 97, y: 100 },
        fill: fill('#f7a8d3'),
        radius: 3,
        tail: true,
        text: { color: '#ffffff', size: 11, uppercase: false, letterSpacing: 0.5 },
      },
      decorations: decos('#f7a8d3'),
    },
    {
      broadcaster: {
        fill: fill('#f8b8dc', '#f58fc9', 'linear', 135),
        backLayer: { color: '#f7efee' },
        text: { color: '#ffffff' },
        name: { fill: fill('#f7efee'), text: { color: '#e46aa9' } },
        role: { fill: fill('#f7efee'), text: { color: '#e46aa9' } },
        effect: 'glow',
        effectColor: '#ffc3e4',
      },
      mod: {
        backLayer: { color: '#a86a8e' },
        name: { fill: fill('#a86a8e') },
        role: { fill: fill('#a86a8e'), label: 'mod' },
        decorations: decos('#a86a8e'),
      },
      vip: { role: { label: 'vip' } },
      subscriber: {
        fill: fill('#f8b4dc', '#f58fc9', 'linear', 120),
        backLayer: { color: '#f7efee' },
        text: { color: '#ffffff' },
        name: { fill: fill('#f7efee'), text: { color: '#c86a9a' } },
        role: { fill: fill('#f7efee'), text: { color: '#c86a9a' }, label: 'sub' },
        decorations: [...decos('#f7efee').slice(0, 1), deco({ kind: 'line', value: '', pos: { x: 50, y: 84 }, size: 88, color: '#ffffff', thickness: 1.5, lineStyle: 'dashed', opacity: 0.6 })],
        effect: 'shine',
      },
      first: { role: { label: 'new!' }, effect: 'pulse', effectColor: '#f7a8d3' },
      default: { role: { visible: false } },
      ...forEvents({
        fill: fill('#f8b4dc', '#f58fc9', 'linear', 120),
        backLayer: { color: '#f7efee' },
        name: { visible: false },
        role: { visible: false },
        text: { color: '#ffffff' },
        event: {
          titleText: text({ size: 18, weight: 700, color: '#ffffff', align: 'center', letterSpacing: 2 }),
          subtitleText: text({ size: 13, color: '#fff3fa', align: 'center' }),
        },
        decorations: [
          deco({ value: 'bunnyEars', pos: { x: 50, y: -24 }, size: 34, color: '#f7efee', color2: '#f7a8d3', behind: true, anim: 'bounce' }),
          deco({ value: 'sparkle', pos: { x: 104, y: -8 }, size: 14, color: '#ffffff', anim: 'twinkle' }),
          deco({ value: 'sparkle', pos: { x: -4, y: 90 }, size: 10, color: '#ffffff', anim: 'twinkle', animDelay: 0.6 }),
        ],
      }),
    },
    { font: 'Quicksand', align: 'left' },
  );
};

/* ------------------------------------------------------------------ */
/* Night Sky — compact navy glass with sparkles and tags               */
/* ------------------------------------------------------------------ */
const night = (): OverlayConfig => {
  const decos = (color: string) => [
    deco({ kind: 'line', value: '', pos: { x: 2.5, y: 50 }, size: 55, color, thickness: 2, lineStyle: 'dotted', vertical: true }),
    deco({ value: 'cross', pos: { x: 100, y: 100 }, size: 14, color: '#ffffff' }),
    deco({ value: 'sparkle', pos: { x: -3, y: 22 }, size: 10, color: '#ffffff', anim: 'twinkle' }),
    deco({ value: 'plus', pos: { x: 103, y: 12 }, size: 8, color: '#ffffff', opacity: 0.8 }),
  ];
  return buildConfig(
    {
      shape: 'rounded',
      radius: [4, 14, 14, 14],
      padding: [16, 18, 12, 22],
      minWidth: 200,
      maxWidth: 420,
      margin: [14, 8],
      fill: fill('#23225ce6', '#3a3a8ce6', 'linear', 100),
      borderWidth: 1,
      borderColor: '#9c98ff66',
      shadow: shadow('#6f6cff55', 14),
      text: { color: '#eef0ff', size: 14, weight: 600 },
      name: {
        pos: { x: 3, y: 0 },
        fill: fill('#8a7cf5'),
        radius: 3,
        padX: 8,
        padY: 2,
        text: { color: '#ffffff', size: 10, uppercase: true, letterSpacing: 1.5 },
      },
      role: {
        visible: true,
        pos: { x: 97, y: 100 },
        fill: fill('#eef0ff'),
        radius: 3,
        text: { color: '#2e2c7a', size: 8, letterSpacing: 1.2 },
      },
      decorations: decos('#b7b3ff'),
    },
    {
      broadcaster: {
        fill: fill('#f4f3ff', '#cfcaff', 'linear', 100),
        text: { color: '#2b2970' },
        role: { label: 'Live', pos: { x: 97, y: 0 }, fill: fill('#8a7cf5'), text: { color: '#ffffff' } },
        decorations: decos('#8a7cf5'),
      },
      mod: {
        fill: fill('#f4f3ff', '#cfcaff', 'linear', 100),
        text: { color: '#2b2970' },
        decorations: decos('#8a7cf5'),
      },
      vip: { role: { label: 'VIP' } },
      subscriber: { role: { label: 'Sub' }, effect: 'shine' },
      first: { role: { label: 'First chat' } },
      highlight: { effect: 'glow', effectColor: '#b3adff' },
      ...forEvents({
        shape: 'slanted',
        cut: 14,
        minWidth: 320,
        maxWidth: 420,
        padding: [14, 30, 14, 30],
        fill: fill('#2a2870', '#4a47b8', 'linear', 90),
        name: { visible: false },
        role: { visible: false },
        event: {
          title: 'New Subscriber',
          subtitle: '· {name} ·',
          titleText: text({ font: 'Great Vibes', size: 32, weight: 400, align: 'center', color: '#ffffff' }),
          subtitleText: text({ size: 12, weight: 700, align: 'center', color: '#e6e4ff', uppercase: true, letterSpacing: 2 }),
        },
        decorations: [
          deco({ value: 'sparkle', pos: { x: 101, y: 100 }, size: 14, color: '#ffffff', anim: 'twinkle' }),
          deco({ value: 'plus', pos: { x: 97, y: -6 }, size: 10, color: '#ffffff', anim: 'twinkle', animDelay: 0.4 }),
          deco({ value: 'ring', pos: { x: 0, y: 50 }, size: 44, color: '#b7b3ff', color2: '#2a2870' }),
        ],
      }, {
        resub: { event: { title: 'Resubscribed', subtitle: '· {name} · x{months}' } },
        giftsub: { event: { title: 'Gift Subs', subtitle: '· {name} · x{amount}' } },
        cheer: { event: { title: 'Cheer', subtitle: '· {name} · {amount} bits' } },
        raid: { event: { title: 'Raid', subtitle: '· {name} · {amount} viewers' } },
      }),
    },
    { font: 'Nunito', align: 'left' },
  );
};

/* ------------------------------------------------------------------ */
/* Classic — the original look of this overlay                         */
/* ------------------------------------------------------------------ */
const classic = (): OverlayConfig => {
  const role = (usernameBg: string, messageBg: string, nameColor: string, textColor: string, nameShadow: string, textShadow: string): DeepPartial<BubbleStyle> => ({
    fill: fill(messageBg),
    text: { color: textColor, shadow: shadow(textShadow, 1, 1, 1) },
    name: { fill: fill(usernameBg), text: { color: nameColor, shadow: shadow(nameShadow, 1, 1, 1) } },
  });
  return buildConfig(
    {
      radius: [20, 20, 20, 20],
      padding: [20, 20, 12, 20],
      minWidth: 288,
      maxWidth: 288,
      shadow: shadow('#00000026', 8, 0, 2),
      text: { align: 'center', size: 14 },
      name: { pos: { x: 50, y: 0 }, padX: 12, padY: 5, showAvatar: true, text: { size: 12, weight: 600 } },
    },
    {
      broadcaster: { ...role('#f3ebe8', '#fa95cd', '#fa95cd', '#f3ebe8', '#ffffff', '#494949'), effect: 'glow' },
      mod: role('#fffbfb', '#a6608d', '#a6608d', '#fffbfb', '#ffffff', '#3b3b3b'),
      subscriber: role('#a6608d', '#f3ebe8', '#f3ebe8', '#a6608d', '#000000', '#6c6c6c'),
      vip: role('#a6608d', '#f3ebe8', '#f3ebe8', '#a6608d', '#000000', '#6c6c6c'),
      first: role('#f990c8', '#ffffff', '#ffffff', '#f990c8', '#000000', '#4d4d4d'),
      highlight: { ...role('#f990c8', '#ffe3f2', '#ffffff', '#c2407f', '#000000', '#ffffff'), effect: 'pulse', effectColor: '#fa95cd' },
      default: role('#f990c8', '#ffffff', '#ffffff', '#f990c8', '#000000', '#4d4d4d'),
      ...forEvents({ ...role('#f3ebe8', '#fa95cd', '#fa95cd', '#ffffff', '#ffffff', '#494949'), name: { visible: false } }),
    },
    { font: 'Playpen Sans', align: 'center' },
  );
};

/* ------------------------------------------------------------------ */
/* Minimal — compact inline names, no decorations                      */
/* ------------------------------------------------------------------ */
const minimal = (): OverlayConfig =>
  buildConfig(
    {
      radius: [12, 12, 12, 12],
      padding: [8, 12, 8, 12],
      minWidth: 0,
      maxWidth: 440,
      margin: [2, 2],
      fill: fill('#101014cc'),
      shadow: { enabled: false },
      text: { size: 15, color: '#f2f2f5' },
      name: {
        placement: 'inline',
        fill: fill('#00000000'),
        padX: 0,
        padY: 0,
        useUserColor: true,
        showPronouns: true,
        text: { size: 14, weight: 800 },
      },
    },
    {
      broadcaster: { borderWidth: 2, borderColor: '#ff5f8f' },
      mod: { borderWidth: 2, borderColor: '#34d17c' },
      vip: { borderWidth: 2, borderColor: '#e05cf5' },
      subscriber: { borderWidth: 2, borderColor: '#8f7bff' },
      highlight: { fill: fill('#5b3ad6cc') },
      ...forEvents({ fill: fill('#5b3ad6', '#9446e0', 'linear', 90), name: { visible: false }, padding: [10, 16, 10, 16] }),
    },
    { font: 'Inter', align: 'left', gap: 4 },
  );

export const PRESETS: Preset[] = [
  { id: 'lavender', name: 'Lavender Bloom', description: 'Notched purple bubbles, gold trim, flowers', swatch: ['#241a3d', '#6b2bc8', '#7a6cf2', '#ece6ff', '#f1e2b1'], build: lavender },
  { id: 'forest', name: 'Forest Axolotl', description: 'Green pills, daisies, wings and leaves', swatch: ['#3f7d27', '#a6cf6a', '#f6f3d8', '#e9f3c9', '#6fa84a'], build: forest },
  { id: 'bunny', name: 'Bunny Pink', description: 'Cream cards, offset layer, bunny ears', swatch: ['#f7efee', '#f7a8d3', '#f58fc9', '#a86a8e', '#7c4b66'], build: bunny },
  { id: 'night', name: 'Night Sky', description: 'Navy glass, sparkles, corner tags', swatch: ['#23225c', '#3a3a8c', '#8a7cf5', '#cfcaff', '#eef0ff'], build: night },
  { id: 'classic', name: 'Classic', description: 'The original pink bubble look', swatch: ['#fa95cd', '#f3ebe8', '#a6608d', '#f990c8', '#ffffff'], build: classic },
  { id: 'minimal', name: 'Minimal', description: 'Compact, inline names, colored borders', swatch: ['#101014', '#ff5f8f', '#34d17c', '#e05cf5', '#8f7bff'], build: minimal },
];

export const DEFAULT_PRESET = 'lavender';

export const defaultConfig = (): OverlayConfig => PRESETS.find((p) => p.id === DEFAULT_PRESET)!.build();
