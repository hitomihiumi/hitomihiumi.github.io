'use client';

import { useEffect, useRef, useState } from 'react';
import type { Badge, TwitchUser } from '@/types';
import type { MessageKey, OverlayConfig, StyleKey } from '@/types/overlay';
import { authHeaders, createTwitchClient, isBroadcaster, isModerator } from '@/lib/twitch';
import { loadThirdPartyEmotes, EmoteMap } from '@/lib/emotes';
import { configFromHash, parseHash } from '@/lib/config/serialize';
import { fontsInConfig, loadFonts } from '@/lib/fonts';
import { getPronouns } from '@/lib/pronouns';
import { tokenize } from '@/lib/parse';
import { randomItem } from '@/lib/sample';
import ChatFeed, { useFeed } from '@/components/feed/ChatFeed';
import type { BubbleData } from '@/components/bubble/Bubble';

type BadgeMap = Record<string, Record<string, Badge>>;

const toBadgeMap = (data: { set_id: string; versions: Badge[] }[] = []): BadgeMap =>
  Object.fromEntries(data.map((set) => [set.set_id, Object.fromEntries(set.versions.map((v) => [v.id, v]))]));

/** Picks the message style for a chat message based on its tags. */
export function messageKey(tags: any): MessageKey {
  if (tags['msg-id'] === 'highlighted-message' || tags['custom-reward-id']) return 'highlight';
  if (isBroadcaster(tags)) return 'broadcaster';
  if (isModerator(tags)) return 'mod';
  if (tags.badges?.vip || tags.vip) return 'vip';
  if (tags.badges?.subscriber || tags.badges?.founder) return 'subscriber';
  if (tags['first-msg'] === true || tags['first-msg'] === '1') return 'first';
  return 'default';
}

const tierName = (plan?: string) =>
  plan === 'Prime' ? 'Prime' : plan === '2000' ? 'Tier 2' : plan === '3000' ? 'Tier 3' : 'Tier 1';

export default function ChatOverlay() {
  const [config, setConfig] = useState<OverlayConfig | null>(null);
  const [failed, setFailed] = useState(false);
  const [hash] = useState(() => parseHash(window.location.hash));

  useEffect(() => {
    configFromHash(hash)
      .then((cfg) => {
        if (!hash.demo && (!hash.channel || !hash.oauth)) {
          window.location.href = window.location.pathname.replace(/\/?$/, '/') + 'editor/';
          return;
        }
        loadFonts(fontsInConfig(cfg));
        setConfig(cfg);
      })
      .catch((e) => {
        console.error('Failed to load overlay config', e);
        setFailed(true);
      });
  }, [hash]);

  if (failed) {
    return (
      <div className="fixed top-4 left-4 bg-red-600 text-white text-sm px-3 py-2 rounded-lg">
        Chat overlay failed to start. Check the URL.
      </div>
    );
  }
  return config ? <LiveChat config={config} hash={hash} /> : null;
}

function LiveChat({ config, hash }: { config: OverlayConfig; hash: Record<string, string> }) {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>(hash.demo ? 'connected' : 'connecting');
  const feed = useFeed(config);
  const feedRef = useRef(feed);
  feedRef.current = feed;

  useEffect(() => {
    if (hash.demo) {
      const timer = setInterval(() => feedRef.current.add(randomItem()), 2500);
      return () => clearInterval(timer);
    }
    let client: any = null;
    let disposed = false;
    connect(hash, config)
      .then((c) => {
        client = c;
        if (disposed) c.disconnect();
      })
      .catch((e) => {
        console.error('Failed to connect to Twitch', e);
        setStatus('error');
      });
    return () => {
      disposed = true;
      client?.disconnect?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function connect(hs: Record<string, string>, cfg: OverlayConfig) {
    const headers = authHeaders();
    const user: TwitchUser | undefined = await fetch(`https://api.twitch.tv/helix/users?login=${hs.channel}`, { headers })
      .then((r) => r.json())
      .then((j) => j.data?.[0]);
    if (!user) throw new Error('Channel not found or token expired');

    let [channelBadges, globalBadges, emotes] = await Promise.all([
      fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${user.id}`, { headers })
        .then((r) => r.json())
        .then((j) => toBadgeMap(j.data))
        .catch(() => ({}) as BadgeMap),
      fetch('https://api.twitch.tv/helix/chat/badges/global', { headers })
        .then((r) => r.json())
        .then((j) => toBadgeMap(j.data))
        .catch(() => ({}) as BadgeMap),
      loadThirdPartyEmotes(user.id).catch(() => ({}) as EmoteMap),
    ]);

    // 7TV / BTTV / FFZ emotes added during the stream show up after a refresh.
    const emoteRefresh = setInterval(() => {
      loadThirdPartyEmotes(user.id)
        .then((m) => {
          if (Object.keys(m).length) emotes = m;
        })
        .catch(() => {});
    }, 31 * 60 * 1000);

    const g = cfg.general;
    const exclude = new Set(g.exclude.map((v) => v.toLowerCase()));
    const styles = Object.values(cfg.styles);
    const wantAvatars = styles.some((s) => s.name.visible && s.name.showAvatar);
    const wantPronouns = styles.some((s) => s.name.visible && s.name.showPronouns);
    const avatarCache = new Map<string, Promise<string | undefined>>();

    const avatar = (login: string) => {
      if (!wantAvatars) return Promise.resolve(undefined);
      let p = avatarCache.get(login);
      if (!p) {
        p = fetch(`https://api.twitch.tv/helix/users?login=${encodeURIComponent(login)}`, { headers })
          .then((r) => r.json())
          .then((j) => j.data?.[0]?.profile_image_url as string | undefined)
          .catch(() => undefined);
        avatarCache.set(login, p);
      }
      return p;
    };

    const badges = (tags: any): string[] =>
      Object.entries((tags.badges ?? {}) as Record<string, string>)
        .map(([set, version]) => (channelBadges[set]?.[version] ?? globalBadges[set]?.[version])?.image_url_2x)
        .filter(Boolean) as string[];

    const push = async (
      key: StyleKey,
      tags: any,
      text: string,
      vars?: BubbleData['vars'],
      login = tags.username as string,
    ) => {
      const [avatarUrl, pronouns] = await Promise.all([
        avatar(login),
        wantPronouns && login ? getPronouns(login) : Promise.resolve(''),
      ]);
      feedRef.current.add({
        id: tags.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        key,
        login,
        data: {
          name: tags['display-name'] || login,
          color: tags.color || undefined,
          avatar: avatarUrl,
          badges: badges(tags),
          pronouns,
          tokens: text ? tokenize(text, tags.emotes ?? tags['emotes-raw'], emotes) : [],
          vars,
        },
      });
    };

    const eventOn = (key: StyleKey) => cfg.styles[key].enabled;

    const client = createTwitchClient();
    if (!client) throw new Error('Failed to create Twitch client');

    client.on('message', (_channel: string, tags: any, message: string, self: boolean) => {
      if (message.startsWith('!')) {
        if ((isModerator(tags) || isBroadcaster(tags)) && message.trim() === '!clear') {
          feedRef.current.clear();
          return;
        }
        if (g.hideCommands) return;
      }
      if (exclude.has(tags.username)) return;
      push(messageKey(tags), tags, message);
    });

    client.on('cheer', (_channel: string, tags: any, message: string) => {
      if (exclude.has(tags.username)) return;
      const bits = Number(tags.bits) || 0;
      // strip "Cheer100" style tokens from the text
      const text = message.replace(/(^|\s)[a-z]+\d+(?=\s|$)/gi, ' ').trim();
      if (eventOn('cheer')) push('cheer', tags, text, { amount: bits });
      else push(messageKey(tags), tags, message);
    });

    client.on('subscription', (_c: string, username: string, methods: any, message: string, tags: any) => {
      if (eventOn('sub')) push('sub', tags, message ?? '', { tier: tierName(methods?.plan), months: 1 }, username);
    });

    client.on('resub', (_c: string, username: string, months: number, message: string, tags: any, methods: any) => {
      const total = Number(tags['msg-param-cumulative-months']) || months || 0;
      if (eventOn('resub')) push('resub', tags, message ?? '', { tier: tierName(methods?.plan), months: total }, username);
    });

    const gifted = new Set<string>();
    client.on('submysterygift', (_c: string, username: string, count: number, methods: any, tags: any) => {
      if (!eventOn('giftsub')) return;
      gifted.add(tags['msg-param-origin-id'] ?? '');
      push('giftsub', tags, '', { amount: count, tier: tierName(methods?.plan) }, username);
    });

    client.on('subgift', (_c: string, username: string, _streak: number, recipient: string, methods: any, tags: any) => {
      if (!eventOn('giftsub')) return;
      // single gifts that are part of a mystery gift were already announced
      if (gifted.has(tags['msg-param-origin-id'] ?? '-')) return;
      push('giftsub', tags, '', { amount: 1, recipient, tier: tierName(methods?.plan) }, username);
    });

    client.on('raided', (_c: string, username: string, viewers: number, tags: any) => {
      if (!eventOn('raid')) return;
      push('raid', tags ?? { username, 'display-name': username }, '', { amount: viewers }, username.toLowerCase());
    });

    client.on('clearchat', () => feedRef.current.clear());
    const dropUser = (_c: string, username: string) =>
      feedRef.current.remove((i) => i.login === username.toLowerCase());
    client.on('ban', dropUser);
    client.on('timeout', dropUser);
    client.on('messagedeleted', (_c: string, _u: string, _m: string, tags: any) =>
      feedRef.current.remove((i) => i.id === tags['target-msg-id']),
    );
    client.on('connected', () => setStatus('connected'));
    client.on('disconnected', () => setStatus('connecting'));

    const disconnect = client.disconnect.bind(client);
    client.disconnect = () => {
      clearInterval(emoteRefresh);
      return disconnect();
    };

    await client.connect();
    return client;
  }

  return (
    <div className="fixed inset-0 pointer-events-none">
      <ChatFeed config={config} items={feed.items} className="absolute inset-0" />
      {status !== 'connected' && (
        <div className="fixed top-3 left-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full">
          {status === 'error' ? 'Connection failed — reopen the editor to refresh your token' : 'Connecting to chat…'}
        </div>
      )}
    </div>
  );
}

