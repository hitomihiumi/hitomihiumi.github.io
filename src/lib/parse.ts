import type { EmoteMap } from './emotes';

export type Token =
  | { type: 'text'; text: string }
  | { type: 'emote'; url: string; name: string }
  | { type: 'mention'; text: string };

const twitchEmoteUrl = (id: string) => `https://static-cdn.jtvnw.net/emoticons/v2/${id}/default/dark/3.0`;

/**
 * Splits a chat message into text / emote / mention tokens.
 * Twitch emote ranges are code point indices, so the message is handled as
 * an array of code points rather than UTF-16 units.
 */
export function tokenize(
  message: string,
  twitchEmotes: Record<string, string[]> | null | undefined,
  thirdParty: EmoteMap = {},
): Token[] {
  const chars = Array.from(message);
  const ranges: { start: number; end: number; id: string }[] = [];
  for (const [id, list] of Object.entries(twitchEmotes ?? {})) {
    for (const r of list) {
      const [a, b] = r.split('-').map(Number);
      if (Number.isFinite(a) && Number.isFinite(b)) ranges.push({ start: a, end: b, id });
    }
  }
  ranges.sort((a, b) => a.start - b.start);

  const raw: Token[] = [];
  let cursor = 0;
  for (const r of ranges) {
    if (r.start < cursor) continue;
    if (r.start > cursor) raw.push({ type: 'text', text: chars.slice(cursor, r.start).join('') });
    raw.push({ type: 'emote', url: twitchEmoteUrl(r.id), name: chars.slice(r.start, r.end + 1).join('') });
    cursor = r.end + 1;
  }
  if (cursor < chars.length) raw.push({ type: 'text', text: chars.slice(cursor).join('') });

  // Third-party emotes and @mentions inside the remaining text.
  const out: Token[] = [];
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
      if (emote) push({ type: 'emote', url: emote.url, name: emote.code });
      else if (/^@\w+/.test(part)) push({ type: 'mention', text: part });
      else push({ type: 'text', text: part });
    }
  }
  return out;
}

/** Fills `{placeholders}` in event templates. */
export const fillTemplate = (tpl: string, vars: Record<string, string | number | undefined>) =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined ? '' : String(vars[k])));
