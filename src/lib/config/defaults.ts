import {
  BubbleStyle,
  Decoration,
  EventKey,
  Fill,
  GeneralSettings,
  MessageKey,
  NameTagStyle,
  OverlayConfig,
  RoleTagStyle,
  ShadowStyle,
  StyleKey,
  TextStyle,
  EVENT_KEYS,
  MESSAGE_KEYS,
} from '@/types/overlay';

/** Deep partial used by preset builders. Arrays are replaced, not merged. */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends unknown[] ? T[K] : T[K] extends object ? DeepPartial<T[K]> : T[K];
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Recursively merges `patch` into a copy of `base`. */
export function merge<T>(base: T, patch: DeepPartial<T> | undefined | null): T {
  if (!patch) return clone(base);
  if (!isPlainObject(base)) return clone(patch as T);
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const current = out[key];
    out[key] = isPlainObject(current) && isPlainObject(value) ? merge(current, value) : clone(value);
  }
  return out as T;
}

export const clone = <T>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

export const uid = () => Math.random().toString(36).slice(2, 9);

export const LABELS: Record<StyleKey, string> = {
  broadcaster: 'Broadcaster',
  mod: 'Moderator',
  vip: 'VIP',
  subscriber: 'Subscriber',
  first: 'First message',
  highlight: 'Highlighted / redeem',
  default: 'Viewer',
  sub: 'New subscriber',
  resub: 'Resubscribe',
  giftsub: 'Gift subs',
  cheer: 'Cheer (bits)',
  raid: 'Raid',
};

export const fill = (color: string, color2 = color, type: Fill['type'] = color2 === color ? 'solid' : 'linear', angle = 135): Fill => ({
  type,
  color,
  color2,
  angle,
});

export const noShadow = (): ShadowStyle => ({ enabled: false, color: '#00000055', blur: 6, x: 0, y: 2 });

export const shadow = (color: string, blur = 8, x = 0, y = 2): ShadowStyle => ({ enabled: true, color, blur, x, y });

export const text = (patch: Partial<TextStyle> = {}): TextStyle => ({
  font: '',
  size: 15,
  weight: 500,
  color: '#ffffff',
  align: 'left',
  uppercase: false,
  letterSpacing: 0,
  shadow: noShadow(),
  ...patch,
});

const baseName = (): NameTagStyle => ({
  visible: true,
  placement: 'floating',
  pos: { x: 8, y: 0 },
  fill: fill('#ffffff'),
  text: text({ size: 12, weight: 700, color: '#333333' }),
  radius: 999,
  padX: 10,
  padY: 3,
  borderWidth: 0,
  borderColor: '#ffffff',
  shadow: noShadow(),
  icon: '',
  iconColor: '#ffffff',
  useUserColor: false,
  showAvatar: false,
  showBadges: true,
  showPronouns: false,
});

const baseRole = (): RoleTagStyle => ({
  visible: false,
  placement: 'floating',
  pos: { x: 96, y: 100 },
  fill: fill('#ffffff'),
  text: text({ size: 10, weight: 700, color: '#333333', uppercase: true, letterSpacing: 1 }),
  radius: 6,
  padX: 8,
  padY: 2,
  borderWidth: 0,
  borderColor: '#ffffff',
  shadow: noShadow(),
  icon: '',
  iconColor: '#333333',
  label: '',
  tail: false,
});

export function baseStyle(label = 'Viewer'): BubbleStyle {
  return {
    enabled: true,
    label,
    shape: 'rounded',
    radius: [18, 18, 18, 18],
    cut: 12,
    padding: [18, 18, 12, 18],
    minWidth: 180,
    maxWidth: 380,
    margin: [14, 10],
    fill: fill('#2b2540'),
    bgImage: '',
    borderWidth: 0,
    borderColor: '#ffffff',
    borderFill: null,
    shadow: shadow('#00000066', 10, 0, 3),
    backLayer: { enabled: false, color: '#f48fc8', x: -6, y: 6 },
    effect: 'none',
    effectColor: '#ffffff',
    text: text(),
    name: baseName(),
    role: baseRole(),
    event: {
      title: '{name}',
      subtitle: '',
      titleText: text({ size: 20, weight: 700, align: 'center', letterSpacing: 3, uppercase: true }),
      subtitleText: text({ size: 14, align: 'center' }),
      showMessage: true,
    },
    decorations: [],
  };
}

export const EVENT_DEFAULTS: Record<EventKey, { label: string; title: string; subtitle: string }> = {
  sub: { label: 'New sub', title: '{name}', subtitle: 'Just subscribed! ({tier})' },
  resub: { label: 'Resub', title: '{name}', subtitle: 'Subscribed for {months} months!' },
  giftsub: { label: 'Gift', title: '{name}', subtitle: 'Gifted {amount} sub(s)!' },
  cheer: { label: 'Cheer', title: '{name}', subtitle: 'Cheered {amount} bits!' },
  raid: { label: 'Raid', title: '{name}', subtitle: 'Raided with {amount} viewers!' },
};

export const ROLE_LABELS: Record<MessageKey, string> = {
  broadcaster: 'Streamer',
  mod: 'Mod',
  vip: 'VIP',
  subscriber: 'Sub',
  first: 'First chat',
  highlight: 'Redeemed',
  default: '',
};

export const defaultGeneral = (): GeneralSettings => ({
  lifetime: 90,
  limit: 20,
  hideCommands: false,
  exclude: ['nightbot', 'streamelements', 'moobot', 'streamlabs', 'fossabot'],
  stack: 'bottom',
  align: 'left',
  gap: 6,
  padding: 16,
  font: 'Quicksand',
  scale: 1,
  emoteSize: 26,
  animIn: 'slide-up',
  animOut: 'fade',
  animDuration: 450,
});

export const deco = (patch: Partial<Decoration> & Pick<Decoration, 'value'>): Decoration => ({
  id: uid(),
  kind: 'sticker',
  attach: 'bubble',
  pos: { x: 100, y: 0 },
  size: 22,
  rotate: 0,
  flip: false,
  color: '#ffffff',
  color2: '#ffd36e',
  opacity: 1,
  behind: false,
  anim: 'none',
  animDelay: 0,
  thickness: 2,
  lineStyle: 'dashed',
  vertical: false,
  ...patch,
});

/** Builds a full config where every style starts from `base` and gets a per-key patch. */
export function buildConfig(
  base: DeepPartial<BubbleStyle>,
  perKey: Partial<Record<StyleKey, DeepPartial<BubbleStyle>>>,
  general: Partial<GeneralSettings> = {},
): OverlayConfig {
  const styles = {} as Record<StyleKey, BubbleStyle>;
  for (const key of [...MESSAGE_KEYS, ...EVENT_KEYS]) {
    let s = merge(baseStyle(LABELS[key]), base);
    s.label = LABELS[key];
    if ((EVENT_KEYS as readonly string[]).includes(key)) {
      const e = EVENT_DEFAULTS[key as EventKey];
      s.event.title = e.title;
      s.event.subtitle = e.subtitle;
      s.role.label = e.label;
      s.padding = [16, 20, 14, 20];
      s.text.align = 'center';
    } else {
      s.role.label = ROLE_LABELS[key as MessageKey];
      if (key === 'default') s.role.visible = false;
    }
    s = merge(s, perKey[key]);
    // Decorations always get fresh ids so presets can share definitions.
    s.decorations = s.decorations.map((d) => ({ ...deco(d), ...d, id: uid() }));
    styles[key] = s;
  }
  return { version: 2, general: { ...defaultGeneral(), ...general }, styles };
}

/** Ensures a (possibly older / partial) config has every field. */
export function normalizeConfig(input: unknown): OverlayConfig {
  const src = isPlainObject(input) ? input : {};
  const general = merge(defaultGeneral(), (src.general as DeepPartial<GeneralSettings>) ?? {});
  const styles = {} as Record<StyleKey, BubbleStyle>;
  const srcStyles = isPlainObject(src.styles) ? src.styles : {};
  const fallback = buildConfig({}, {});
  for (const key of [...MESSAGE_KEYS, ...EVENT_KEYS]) {
    const raw = srcStyles[key];
    const s = merge(fallback.styles[key], raw as DeepPartial<BubbleStyle>);
    s.decorations = (Array.isArray(s.decorations) ? s.decorations : []).map((d) => deco(d));
    styles[key] = s;
  }
  return { version: 2, general, styles };
}
