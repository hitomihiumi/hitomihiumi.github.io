// 7TV, BetterTTV and FrankerFaceZ emotes

export type ThirdPartyEmote = {
  code: string;
  url: string;
  provider: 'bttv' | '7tv' | 'ffz';
  id: string;
  /** zero-width emotes are drawn on top of the previous emote */
  zeroWidth?: boolean;
};

export type EmoteMap = Record<string, ThirdPartyEmote>;

const cache: Record<string, { emotes: Promise<EmoteMap>; timestamp: number }> = {};
const CACHE_DURATION = 30 * 60 * 1000;

/** BTTV emotes that act as overlays on the previous emote */
const BTTV_ZERO_WIDTH = new Set(['SoSnowy', 'IceCold', 'SantaHat', 'TopHat', 'ReinDeer', 'CandyCane', 'cvMask', 'cvHazmat']);

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json();
}

/** Runs loaders independently: one failing source never hides the others. */
async function collect(loaders: (() => Promise<ThirdPartyEmote[]>)[]): Promise<ThirdPartyEmote[]> {
  const results = await Promise.allSettled(loaders.map((l) => l()));
  return results.flatMap((r) => {
    if (r.status === 'rejected') console.warn('[emotes]', r.reason?.message ?? r.reason);
    return r.status === 'fulfilled' ? r.value : [];
  });
}

const bttv = (e: { id: string; code: string }): ThirdPartyEmote => ({
  code: e.code,
  id: e.id,
  provider: 'bttv',
  url: `https://cdn.betterttv.net/emote/${e.id}/2x`,
  zeroWidth: BTTV_ZERO_WIDTH.has(e.code),
});

const ffz = (e: { id: number; code: string; images: Record<string, string | null> }): ThirdPartyEmote => ({
  code: e.code,
  id: String(e.id),
  provider: 'ffz',
  url: e.images['2x'] ?? e.images['1x'] ?? `https://cdn.frankerfacez.com/emote/${e.id}/2`,
});

interface SevenTvEmote {
  id: string;
  name: string;
  flags?: number;
  data?: { flags?: number; host?: { url: string; files?: { name: string }[] } };
}

const seventv = (e: SevenTvEmote): ThirdPartyEmote => {
  const host = e.data?.host;
  const base = host?.url ? (host.url.startsWith('//') ? `https:${host.url}` : host.url) : `https://cdn.7tv.app/emote/${e.id}`;
  const file = host?.files?.find((f) => f.name === '2x.webp') ? '2x.webp' : host?.files?.find((f) => f.name.endsWith('.webp'))?.name ?? '2x.webp';
  return {
    code: e.name,
    id: e.id,
    provider: '7tv',
    url: `${base}/${file}`,
    // active-emote flag 1 = zero width, emote data flag 256 = zero width
    zeroWidth: ((e.flags ?? 0) & 1) === 1 || ((e.data?.flags ?? 0) & 256) === 256,
  };
};

async function load(channelId?: string): Promise<EmoteMap> {
  const list = await collect([
    // Order matters: later sources win name conflicts (7TV > BTTV > FFZ).
    () => fetchJSON<any[]>('https://api.betterttv.net/3/cached/frankerfacez/emotes/global').then((l) => l.map(ffzCached)),
    ...(channelId
      ? [() => fetchJSON<any[]>(`https://api.betterttv.net/3/cached/frankerfacez/users/twitch/${channelId}`).then((l) => l.map(ffzCached))]
      : []),
    () => fetchJSON<any[]>('https://api.betterttv.net/3/cached/emotes/global').then((l) => l.map(bttv)),
    ...(channelId
      ? [
          () =>
            fetchJSON<any>(`https://api.betterttv.net/3/cached/users/twitch/${channelId}`).then((u) =>
              [...(u.channelEmotes ?? []), ...(u.sharedEmotes ?? [])].map(bttv),
            ),
        ]
      : []),
    () => fetchJSON<any>('https://7tv.io/v3/emote-sets/global').then((s) => (s.emotes ?? []).map(seventv)),
    ...(channelId
      ? [() => fetchJSON<any>(`https://7tv.io/v3/users/twitch/${channelId}`).then((u) => (u.emote_set?.emotes ?? []).map(seventv))]
      : []),
  ]);
  const map: EmoteMap = {};
  for (const e of list) map[e.code] = e;
  return map;
}

/** BTTV's cached FFZ endpoint uses `{ id, code, images: { '1x', '2x', '4x' } }` */
const ffzCached = (e: any): ThirdPartyEmote => ffz({ id: e.id, code: e.code, images: e.images ?? {} });

export function loadThirdPartyEmotes(channelId?: string): Promise<EmoteMap> {
  const key = channelId || 'global';
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.emotes;
  const emotes = load(channelId).then((map) => {
    console.log(`[emotes] loaded ${Object.keys(map).length} 7TV / BTTV / FFZ emotes`);
    return map;
  });
  cache[key] = { emotes, timestamp: Date.now() };
  return emotes;
}
