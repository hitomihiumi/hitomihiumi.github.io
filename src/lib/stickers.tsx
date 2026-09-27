import type { ReactElement } from 'react';
import type { StickerKind } from '@/types/overlay';

/**
 * Built-in vector stickers. Every sticker is drawn in a 100x100 box using
 * `c1` as the main color and `c2` as the accent color.
 */
type Draw = (c1: string, c2: string) => ReactElement;

const petals = (n: number, draw: (angle: number, i: number) => ReactElement) =>
  Array.from({ length: n }, (_, i) => draw((360 / n) * i, i));

export const STICKERS: Record<StickerKind, { label: string; draw: Draw }> = {
  sparkle: {
    label: 'Sparkle',
    draw: (c) => <path d="M50 2 C54 38 62 46 98 50 C62 54 54 62 50 98 C46 62 38 54 2 50 C38 46 46 38 50 2Z" fill={c} />,
  },
  star: {
    label: 'Star',
    draw: (c) => (
      <path
        d="M50 5 L62 36 L95 38 L69 58 L78 92 L50 73 L22 92 L31 58 L5 38 L38 36Z"
        fill={c}
        stroke={c}
        strokeWidth="6"
        strokeLinejoin="round"
      />
    ),
  },
  heart: {
    label: 'Heart',
    draw: (c) => <path d="M50 90 C18 68 4 50 6 30 C8 12 30 4 50 24 C70 4 92 12 94 30 C96 50 82 68 50 90Z" fill={c} />,
  },
  flower: {
    label: 'Flower',
    draw: (c1, c2) => (
      <>
        {petals(5, (a, i) => (
          <circle key={i} cx="50" cy="27" r="21" fill={c1} transform={`rotate(${a} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="13" fill={c2} />
      </>
    ),
  },
  daisy: {
    label: 'Daisy',
    draw: (c1, c2) => (
      <>
        {petals(10, (a, i) => (
          <ellipse key={i} cx="50" cy="24" rx="9" ry="22" fill={c1} transform={`rotate(${a} 50 50)`} />
        ))}
        <circle cx="50" cy="50" r="13" fill={c2} />
      </>
    ),
  },
  leaf: {
    label: 'Leaf',
    draw: (c1) => (
      <>
        <path d="M12 88 C8 40 40 8 92 8 C92 60 60 92 12 88Z" fill={c1} />
        <path d="M14 86 C40 60 60 40 80 20" stroke="#00000033" strokeWidth="4" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  sprig: {
    label: 'Sprig',
    draw: (c1) => (
      <g fill={c1}>
        <path d="M50 98 C50 70 48 40 52 4" stroke={c1} strokeWidth="4" fill="none" strokeLinecap="round" />
        {[18, 38, 58, 76].map((y, i) => (
          <g key={i}>
            <ellipse cx="38" cy={y + 4} rx="13" ry="6" transform={`rotate(-35 38 ${y + 4})`} />
            <ellipse cx="62" cy={y} rx="13" ry="6" transform={`rotate(35 62 ${y})`} />
          </g>
        ))}
      </g>
    ),
  },
  crown: {
    label: 'Crown',
    draw: (c1, c2) => (
      <>
        <path d="M8 78 L14 28 L34 52 L50 18 L66 52 L86 28 L92 78Z" fill={c1} strokeLinejoin="round" stroke={c1} strokeWidth="4" />
        <rect x="8" y="78" width="84" height="10" rx="3" fill={c1} />
        <circle cx="50" cy="62" r="7" fill={c2} />
        <circle cx="28" cy="66" r="5" fill={c2} />
        <circle cx="72" cy="66" r="5" fill={c2} />
      </>
    ),
  },
  moon: {
    label: 'Moon',
    draw: (c1) => <path d="M66 6 A46 46 0 1 0 94 70 A36 36 0 1 1 66 6Z" fill={c1} />,
  },
  cloud: {
    label: 'Cloud',
    draw: (c1) => (
      <path d="M24 78 C8 78 4 58 18 52 C16 34 40 28 48 40 C54 22 84 24 82 48 C98 50 98 78 78 78Z" fill={c1} />
    ),
  },
  bunnyEars: {
    label: 'Bunny ears',
    draw: (c1, c2) => (
      <>
        <ellipse cx="32" cy="46" rx="15" ry="42" transform="rotate(-14 32 46)" fill={c1} />
        <ellipse cx="68" cy="46" rx="15" ry="42" transform="rotate(14 68 46)" fill={c1} />
        <ellipse cx="32" cy="48" rx="7" ry="30" transform="rotate(-14 32 48)" fill={c2} opacity="0.8" />
        <ellipse cx="68" cy="48" rx="7" ry="30" transform="rotate(14 68 48)" fill={c2} opacity="0.8" />
      </>
    ),
  },
  catEars: {
    label: 'Cat ears',
    draw: (c1, c2) => (
      <>
        <path d="M6 90 L18 12 L48 70Z" fill={c1} strokeLinejoin="round" stroke={c1} strokeWidth="6" />
        <path d="M94 90 L82 12 L52 70Z" fill={c1} strokeLinejoin="round" stroke={c1} strokeWidth="6" />
        <path d="M16 74 L22 34 L38 66Z" fill={c2} />
        <path d="M84 74 L78 34 L62 66Z" fill={c2} />
      </>
    ),
  },
  wing: {
    label: 'Wing',
    draw: (c1, c2) => (
      <>
        <path d="M6 58 C20 20 60 8 96 14 C86 26 90 30 80 38 C88 42 84 50 72 54 C78 60 70 68 58 68 C60 76 44 82 30 78 C18 76 8 70 6 58Z" fill={c1} />
        <path d="M24 60 C40 44 60 36 84 28 M28 68 C44 58 56 54 70 50" stroke={c2} strokeOpacity="0.35" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
  },
  bow: {
    label: 'Bow',
    draw: (c1, c2) => (
      <>
        <path d="M50 46 C36 20 8 18 8 44 C8 70 36 66 50 54Z" fill={c1} />
        <path d="M50 46 C64 20 92 18 92 44 C92 70 64 66 50 54Z" fill={c1} />
        <path d="M44 54 L30 92 L42 86 L48 94 L50 56Z M56 54 L70 92 L58 86 L52 94 L50 56Z" fill={c1} />
        <circle cx="50" cy="50" r="9" fill={c2} />
      </>
    ),
  },
  cross: {
    label: 'Cross',
    draw: (c1) => <path d="M18 18 L82 82 M82 18 L18 82" stroke={c1} strokeWidth="16" strokeLinecap="round" />,
  },
  plus: {
    label: 'Plus',
    draw: (c1) => <path d="M50 10 V90 M10 50 H90" stroke={c1} strokeWidth="14" strokeLinecap="round" />,
  },
  dots: {
    label: 'Dots',
    draw: (c1) => (
      <g fill={c1}>
        <circle cx="50" cy="14" r="10" />
        <circle cx="50" cy="50" r="10" />
        <circle cx="50" cy="86" r="10" />
      </g>
    ),
  },
  gem: {
    label: 'Gem',
    draw: (c1, c2) => (
      <>
        <path d="M50 4 L84 40 L50 96 L16 40Z" fill={c1} />
        <path d="M50 4 L62 40 L50 96 L38 40Z" fill={c2} opacity="0.55" />
        <path d="M16 40 H84" stroke={c2} strokeOpacity="0.6" strokeWidth="3" />
      </>
    ),
  },
  paw: {
    label: 'Paw',
    draw: (c1) => (
      <g fill={c1}>
        <ellipse cx="50" cy="66" rx="24" ry="20" />
        <ellipse cx="20" cy="44" rx="10" ry="13" />
        <ellipse cx="38" cy="24" rx="10" ry="13" />
        <ellipse cx="62" cy="24" rx="10" ry="13" />
        <ellipse cx="80" cy="44" rx="10" ry="13" />
      </g>
    ),
  },
  sword: {
    label: 'Sword',
    draw: (c1, c2) => (
      <g transform="rotate(45 50 50)">
        <path d="M44 8 L56 8 L56 64 L50 72 L44 64Z" fill={c1} />
        <rect x="30" y="64" width="40" height="8" rx="4" fill={c2} />
        <rect x="45" y="72" width="10" height="16" rx="3" fill={c2} />
        <circle cx="50" cy="92" r="6" fill={c2} />
      </g>
    ),
  },
  camera: {
    label: 'Camera',
    draw: (c1) => (
      <g fill={c1}>
        <rect x="6" y="26" width="62" height="48" rx="10" />
        <path d="M72 44 L94 30 V70 L72 56Z" />
      </g>
    ),
  },
  bolt: {
    label: 'Bolt',
    draw: (c1) => <path d="M58 4 L18 56 H46 L38 96 L82 40 H54Z" fill={c1} strokeLinejoin="round" stroke={c1} strokeWidth="4" />,
  },
  ring: {
    label: 'Ring',
    draw: (c1, c2) => (
      <>
        <circle cx="50" cy="50" r="44" fill={c2} stroke={c1} strokeWidth="5" />
        <circle cx="50" cy="50" r="30" fill="none" stroke={c1} strokeWidth="3" strokeDasharray="60 130" strokeLinecap="round" />
      </>
    ),
  },
  note: {
    label: 'Note',
    draw: (c1) => (
      <g fill={c1}>
        <ellipse cx="30" cy="78" rx="16" ry="12" />
        <ellipse cx="76" cy="68" rx="16" ry="12" />
        <path d="M42 78 V20 L90 8 V68 H84 V22 L48 31 V78Z" />
      </g>
    ),
  },
};

export const STICKER_KINDS = Object.keys(STICKERS) as StickerKind[];

export function Sticker({
  kind,
  color = 'currentColor',
  color2 = '#ffffff',
  size,
  className,
  style,
}: {
  kind: StickerKind;
  color?: string;
  color2?: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const s = STICKERS[kind];
  if (!s) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={{ overflow: 'visible', display: 'block', ...style }}
      aria-hidden
    >
      {s.draw(color, color2)}
    </svg>
  );
}
