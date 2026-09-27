import type { EmoteMap } from './emotes';

export interface EmoteImage {
  url: string;
  name: string;
}

export type Token =
  | { type: 'text'; text: string }
  | { type: 'emote'; url: string; name: string; /** zero-width emotes stacked on top */ overlays?: EmoteImage[] }
  | { type: 'mention'; text: string };

const twitchEmoteUrl = (id: string) => `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/2.0`;

type EmoteTag = Record<string, string[] | string> | string | null | undefined;

/** Accepts tmi.js' parsed `{ id: ['0-4'] }` object as well as the raw `id:0-4,6-10/id2:…` IRC tag. */
function parseEmoteTag(tag: EmoteTag): { id: string; start: number; end: number }[] {
  const out: { id: string; start: number; end: number }[] = [];
  const add = (id: string, range: string) => {
    const [a, b] = range.split('-').map(Number);
    if (id && Number.isInteger(a) && Number.isInteger(b) && b >= a) out.push({ id, start: a, end: b });
  };
  if (!tag) return out;
  if (typeof tag === 'string') {
    for (const part of tag.split('/')) {
      const [id, ranges = ''] = part.split(':');
      ranges.split(',').forEach((r) => add(id, r));
    }
  } else {
    for (const [id, ranges] of Object.entries(tag)) {
      (Array.isArray(ranges) ? ranges : String(ranges).split(',')).forEach((r) => add(id, r));
    }
  }
  return out.sort((x, y) => x.start - y.start);
}

/**
 * Twitch reports emote positions in code points, but some clients/libraries
 * count UTF-16 units. Pick the indexing where every range covers a word and
 * all occurrences of the same emote read the same.
 */
function pickIndexing(message: string, ranges: { id: string; start: number; end: number }[]) {
  const codePoints = Array.from(message);
  const units = message.split('');
  const score = (chars: string[]) => {
    const seen = new Map<string, string>();
    let ok = 0;
    for (const r of ranges) {
      const word = chars.slice(r.start, r.end + 1).join('');
      if (!word || /\s/.test(word) || r.end >= chars.length) continue;
      const prev = seen.get(r.id);
      if (prev !== undefined && prev !== word) continue;
      seen.set(r.id, word);
      ok++;
    }
    return ok;
  };
  return score(codePoints) >= score(units) ? codePoints : units;
}

/** Splits a chat message into text / emote / mention tokens. */
export function tokenize(message: string, twitchEmotes: EmoteTag, thirdParty: EmoteMap = {}): Token[] {
  const ranges = parseEmoteTag(twitchEmotes);
  const chars = ranges.length ? pickIndexing(message, ranges) : Array.from(message);

  const raw: Token[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start < cursor || r.end >= chars.length) continue;
    if (r.start > cursor) raw.push({ type: 'text', text: chars.slice(cursor, r.start).join('') });
    raw.push({ type: 'emote', url: twitchEmoteUrl(r.id), name: chars.slice(r.start, r.end + 1).join('') });
    cursor = r.end + 1;
  }
  if (cursor < chars.length) raw.push({ type: 'text', text: chars.slice(cursor).join('') });

  // Third-party emotes, zero-width overlays and @mentions inside the remaining text.
  const out: Token[] = [];
  const lastEmote = () => {
    // the previous emote, skipping the whitespace between them
    for (let i = out.length - 1; i >= 0; i--) {
      const t = out[i];
      if (t.type === 'emote') return { t, i };
      if (t.type !== 'text' || t.text.trim()) return null;
    }
    return null;
  };
  const push = (t: Token) => {
    const last = out[out.length - 1];
    if (t.type === 'text' && last?.type === 'text') last.text += t.text;
    else out.push(t);
  };
  for (const t of raw) {
    if (t.type !== 'text') {
      push(t);
      continue;
    }
    for (const part of t.text.split(/(\s+)/)) {
      if (!part) continue;
      const emote = thirdParty[part];
      if (emote?.zeroWidth) {
        const prev = lastEmote();
        if (prev) {
          out.length = prev.i + 1; // drop the whitespace between them
          prev.t.overlays = [...(prev.t.overlays ?? []), { url: emote.url, name: emote.code }];
          continue;
        }
      }
      if (emote) push({ type: 'emote', url: emote.url, name: emote.code });
      else if (/^@\w+/.test(part)) push({ type: 'mention', text: part });
      else push({ type: 'text', text: part });
    }
  }
  return out;
}

/** True when a message consists of emotes only (shown bigger). */
export const isEmoteOnly = (tokens: Token[]) =>
  tokens.some((t) => t.type === 'emote') && tokens.every((t) => t.type === 'emote' || (t.type === 'text' && !t.text.trim()));

/** Fills `{placeholders}` in event templates. */
export const fillTemplate = (tpl: string, vars: Record<string, string | number | undefined>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined ? '' : String(vars[k])));
