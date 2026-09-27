import { OverlayConfig, MESSAGE_KEYS } from '@/types/overlay';
import { normalizeConfig, fill, shadow } from './defaults';
import { PRESETS } from './presets';

/* The config travels inside the overlay URL hash as `cfg=<base64url(deflate(json))>`. */

const toBase64Url = (bytes: Uint8Array) => {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (s: string) => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

const pipe = async (data: Uint8Array, stream: CompressionStream | DecompressionStream) => {
  const res = new Response(new Blob([data as BlobPart]).stream().pipeThrough(stream));
  return new Uint8Array(await res.arrayBuffer());
};

const hasCompression = () => typeof CompressionStream !== 'undefined';

/** Encodes a config into a compact URL-safe string. Prefix `z` = deflated, `j` = raw JSON. */
export async function encodeConfig(config: OverlayConfig): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(config));
  if (hasCompression()) {
    return 'z' + toBase64Url(await pipe(json, new CompressionStream('deflate-raw')));
  }
  return 'j' + toBase64Url(json);
}

export async function decodeConfig(value: string): Promise<OverlayConfig> {
  const bytes = fromBase64Url(value.slice(1));
  const json = value[0] === 'z' ? await pipe(bytes, new DecompressionStream('deflate-raw')) : bytes;
  return normalizeConfig(JSON.parse(new TextDecoder().decode(json)));
}

/** Parses the hash of an overlay URL into key/value pairs (values are URI-decoded). */
export function parseHash(hash: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of hash.replace(/^#/, '').split('&')) {
    if (!part) continue;
    const i = part.indexOf('=');
    const key = i < 0 ? part : part.slice(0, i);
    const raw = i < 0 ? '' : part.slice(i + 1);
    try {
      out[key] = decodeURIComponent(raw.replace(/\+/g, ' '));
    } catch {
      out[key] = raw;
    }
  }
  return out;
}

/**
 * Builds a config from the parameters used by the first version of this
 * overlay (`lifetime`, `limit`, `exclude`, `<role>MessageBg`, ...), so
 * existing OBS browser sources keep working.
 */
export function legacyConfig(hs: Record<string, string>): OverlayConfig {
  const config = PRESETS.find((p) => p.id === 'classic')!.build();
  const g = config.general;
  if (hs.lifetime) g.lifetime = parseInt(hs.lifetime) || g.lifetime;
  if (hs.limit) g.limit = parseInt(hs.limit) || g.limit;
  if (hs.nocommand) g.hideCommands = true;
  if (hs.exclude) g.exclude = hs.exclude.toLowerCase().split(/[\s,]+/).filter(Boolean);
  if (hs.alignment === 'left' || hs.alignment === 'right' || hs.alignment === 'center') g.align = hs.alignment;

  for (const role of MESSAGE_KEYS) {
    const legacyRole = role === 'first' || role === 'highlight' ? 'default' : role;
    const s = config.styles[role];
    const get = (k: string) => hs[`${legacyRole}${k}`];
    if (get('UsernameBg')) s.name.fill = fill(get('UsernameBg'));
    if (get('MessageBg')) s.fill = fill(get('MessageBg'));
    if (get('UsernameTextColor')) s.name.text.color = get('UsernameTextColor');
    if (get('MessageTextColor')) s.text.color = get('MessageTextColor');
    if (get('UsernameTextShadow')) s.name.text.shadow = shadow(get('UsernameTextShadow'), 1, 1, 1);
    if (get('MessageTextShadow')) s.text.shadow = shadow(get('MessageTextShadow'), 1, 1, 1);
  }
  return config;
}

/** Resolves the overlay config from URL hash params. */
export async function configFromHash(hs: Record<string, string>): Promise<OverlayConfig> {
  if (hs.cfg) {
    try {
      return await decodeConfig(hs.cfg);
    } catch (e) {
      console.error('Invalid overlay config in URL, falling back to defaults', e);
    }
  }
  if (hs.preset) {
    const p = PRESETS.find((x) => x.id === hs.preset);
    if (p) return p.build();
  }
  return legacyConfig(hs);
}

export async function buildOverlayUrl(base: string, params: { oauth?: string; channel?: string }, config: OverlayConfig) {
  const parts: string[] = [];
  if (params.oauth) parts.push(`oauth=${encodeURIComponent(params.oauth)}`);
  if (params.channel) parts.push(`channel=${encodeURIComponent(params.channel)}`);
  parts.push(`cfg=${await encodeConfig(config)}`);
  return `${base}#${parts.join('&')}`;
}
