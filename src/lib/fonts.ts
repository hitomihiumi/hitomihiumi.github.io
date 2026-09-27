import type { OverlayConfig } from '@/types/overlay';

/** Google Fonts offered in the editor (any other Google Font name can be typed in). */
export const FONT_OPTIONS = [
  'Quicksand',
  'Nunito',
  'Comfortaa',
  'Playpen Sans',
  'Fredoka',
  'Baloo 2',
  'M PLUS Rounded 1c',
  'Varela Round',
  'Poppins',
  'Montserrat',
  'Inter',
  'Rubik',
  'Manrope',
  'Jost',
  'Cinzel',
  'Press Start 2P',
  'Pacifico',
  'Great Vibes',
  'Dancing Script',
  'Marck Script',
  'Caveat',
];

const loaded = new Set<string>();

/** Injects Google Fonts stylesheets for the given families (once per family). */
export function loadFonts(families: Iterable<string>) {
  if (typeof document === 'undefined') return;
  for (const family of families) {
    const name = family.trim();
    if (!name || loaded.has(name)) continue;
    loaded.add(name);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@300..900&display=swap`;
    link.onerror = () => {
      // Fonts without a variable weight axis: retry with default weights.
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name).replace(/%20/g, '+')}:wght@400;700&display=swap`;
      link.onerror = null;
    };
    document.head.appendChild(link);
  }
}

export function fontsInConfig(config: OverlayConfig): string[] {
  const set = new Set<string>([config.general.font]);
  for (const s of Object.values(config.styles)) {
    for (const t of [s.text, s.name.text, s.role.text, s.event.titleText, s.event.subtitleText]) {
      if (t.font) set.add(t.font);
    }
  }
  return [...set].filter(Boolean);
}

export const fontStack = (font: string) => (font ? `'${font}', system-ui, sans-serif` : undefined);
