/**
 * Overlay configuration model.
 *
 * The whole configuration is serialized into the overlay URL (see
 * `src/lib/config/serialize.ts`), so everything here must stay JSON friendly.
 */

/** Chat message bubble kinds (one style per user role). */
export const MESSAGE_KEYS = [
  'broadcaster',
  'mod',
  'vip',
  'subscriber',
  'first',
  'highlight',
  'default',
] as const;

/** In-chat alert bubble kinds. */
export const EVENT_KEYS = ['sub', 'resub', 'giftsub', 'cheer', 'raid'] as const;

export type MessageKey = (typeof MESSAGE_KEYS)[number];
export type EventKey = (typeof EVENT_KEYS)[number];
export type StyleKey = MessageKey | EventKey;

export const isEventKey = (key: StyleKey): key is EventKey =>
  (EVENT_KEYS as readonly string[]).includes(key);

/** Point inside a box, in percent (0..100, may go outside to overflow). */
export interface Position {
  x: number;
  y: number;
}

export type FillType = 'solid' | 'linear' | 'radial';

export interface Fill {
  type: FillType;
  color: string;
  color2: string;
  angle: number;
}

export interface ShadowStyle {
  enabled: boolean;
  color: string;
  blur: number;
  x: number;
  y: number;
}

export type ShapeKind = 'rounded' | 'notched' | 'slanted';

export type BubbleEffect = 'none' | 'glow' | 'shine' | 'pulse' | 'float';

export type StickerKind =
  | 'sparkle'
  | 'star'
  | 'heart'
  | 'flower'
  | 'daisy'
  | 'leaf'
  | 'sprig'
  | 'crown'
  | 'moon'
  | 'cloud'
  | 'bunnyEars'
  | 'catEars'
  | 'wing'
  | 'bow'
  | 'cross'
  | 'plus'
  | 'dots'
  | 'gem'
  | 'paw'
  | 'sword'
  | 'camera'
  | 'bolt'
  | 'ring'
  | 'note';

export type DecorationKind = 'sticker' | 'emoji' | 'image' | 'line';

export type DecorationAnim = 'none' | 'float' | 'spin' | 'pulse' | 'twinkle' | 'sway' | 'bounce';

export interface Decoration {
  id: string;
  kind: DecorationKind;
  /** sticker kind for `sticker`, the emoji for `emoji`, the URL for `image` */
  value: string;
  /** what the position is relative to */
  attach: 'bubble' | 'name';
  pos: Position;
  /** size in px (width for lines) */
  size: number;
  rotate: number;
  flip: boolean;
  color: string;
  color2: string;
  opacity: number;
  /** drawn behind the bubble / name tag instead of in front of it */
  behind: boolean;
  anim: DecorationAnim;
  animDelay: number;
  /** line only */
  thickness: number;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  vertical: boolean;
}

export interface TextStyle {
  font: string;
  size: number;
  weight: number;
  color: string;
  align: 'left' | 'center' | 'right';
  uppercase: boolean;
  letterSpacing: number;
  shadow: ShadowStyle;
}

export interface TagStyle {
  visible: boolean;
  /**
   * `floating` tags are positioned with `pos`; `inline` tags sit in the text flow;
   * `withName` (role tag only) sits right before the floating name tag.
   */
  placement: 'floating' | 'inline' | 'withName';
  pos: Position;
  fill: Fill;
  text: TextStyle;
  radius: number;
  padX: number;
  padY: number;
  borderWidth: number;
  borderColor: string;
  shadow: ShadowStyle;
  icon: StickerKind | '';
  iconColor: string;
}

export interface NameTagStyle extends TagStyle {
  useUserColor: boolean;
  showAvatar: boolean;
  showBadges: boolean;
  showPronouns: boolean;
}

export interface RoleTagStyle extends TagStyle {
  label: string;
  /** little speech-bubble tail under the tag */
  tail: boolean;
}

export interface BubbleStyle {
  /** disabled message styles fall back to `default`; disabled events are not shown */
  enabled: boolean;
  label: string;
  shape: ShapeKind;
  /** corner radii: top-left, top-right, bottom-right, bottom-left */
  radius: [number, number, number, number];
  /** notch radius for `notched`, skew in px for `slanted` */
  cut: number;
  padding: [number, number, number, number];
  minWidth: number;
  maxWidth: number;
  /** extra space kept free around the bubble for floating tags/decorations */
  margin: [number, number];
  fill: Fill;
  bgImage: string;
  borderWidth: number;
  borderColor: string;
  borderFill: Fill | null;
  shadow: ShadowStyle;
  backLayer: { enabled: boolean; color: string; x: number; y: number };
  effect: BubbleEffect;
  effectColor: string;
  text: TextStyle;
  name: NameTagStyle;
  role: RoleTagStyle;
  /** only used by event styles */
  event: {
    title: string;
    subtitle: string;
    titleText: TextStyle;
    subtitleText: TextStyle;
    showMessage: boolean;
  };
  decorations: Decoration[];
}

export type AnimIn = 'none' | 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'pop' | 'drop';
export type AnimOut = 'none' | 'fade' | 'slide-left' | 'slide-right' | 'shrink' | 'rise';

export interface GeneralSettings {
  /** seconds a message stays on screen, 0 = forever */
  lifetime: number;
  /** max messages on screen */
  limit: number;
  hideCommands: boolean;
  /** logins that are never shown */
  exclude: string[];
  /** newest message at the bottom (`bottom`) or at the top (`top`) */
  stack: 'bottom' | 'top';
  align: 'left' | 'center' | 'right';
  gap: number;
  padding: number;
  font: string;
  scale: number;
  emoteSize: number;
  animIn: AnimIn;
  animOut: AnimOut;
  animDuration: number;
}

export interface OverlayConfig {
  version: 2;
  general: GeneralSettings;
  styles: Record<StyleKey, BubbleStyle>;
}
