// 7TV and BetterTTV emotes integration

export type ThirdPartyEmote = {
  code: string;
  url: string;
  provider: 'bttv' | '7tv';
  id: string;
};

export type EmoteMap = Record<string, ThirdPartyEmote>;

// Cache to avoid repeated API calls
let cache: Record<string, { emotes: EmoteMap; timestamp: number }> = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json();
}

async function loadBTTVEmotes(channelId?: string): Promise<EmoteMap> {
  const map: EmoteMap = {};

  try {
    // Load global BTTV emotes
    const globalEmotes = await fetchJSON<any[]>('https://api.betterttv.net/3/cached/emotes/global');

    for (const emote of globalEmotes) {
      map[emote.code] = {
        code: emote.code,
        url: `https://cdn.betterttv.net/emote/${emote.id}/3x.webp`,
        provider: 'bttv',
        id: emote.id
      };
    }

    // Load channel-specific BTTV emotes if channelId is provided
    if (channelId) {
      try {
        const userData = await fetchJSON<any>(`https://api.betterttv.net/3/cached/users/twitch/${channelId}`);
        const channelEmotes = [...(userData.channelEmotes || []), ...(userData.sharedEmotes || [])];

        for (const emote of channelEmotes) {
          map[emote.code] = {
            code: emote.code,
            url: `https://cdn.betterttv.net/emote/${emote.id}/3x.webp`,
            provider: 'bttv',
            id: emote.id
          };
        }
      } catch (error) {
        console.warn('Failed to load BTTV channel emotes:', error);
      }
    }
  } catch (error) {
    console.warn('Failed to load BTTV global emotes:', error);
  }

  return map;
}

async function load7TVEmotes(channelId?: string): Promise<EmoteMap> {
  const map: EmoteMap = {};

  try {
    // Load global 7TV emotes
    const globalData = await fetchJSON<any>('https://7tv.io/v3/emote-sets/global');

    for (const emote of globalData.emotes || []) {
      map[emote.name] = {
        code: emote.name,
        url: `https://cdn.7tv.app/emote/${emote.id}/3x.webp`,
        provider: '7tv',
        id: emote.id
      };
    }

    // Load channel-specific 7TV emotes if channelId is provided
    if (channelId) {
      try {
        const userData = await fetchJSON<any>(`https://7tv.io/v3/users/twitch/${channelId}`);
        const channelEmotes = userData.emote_set?.emotes || [];

        for (const emote of channelEmotes) {
          map[emote.name] = {
            code: emote.name,
            url: `https://cdn.7tv.app/emote/${emote.id}/3x.webp`,
            provider: '7tv',
            id: emote.id
          };
        }
      } catch (error) {
        console.warn('Failed to load 7TV channel emotes:', error);
      }
    }
  } catch (error) {
    console.warn('Failed to load 7TV global emotes:', error);
  }

  return map;
}

export async function loadThirdPartyEmotes(channelId?: string): Promise<EmoteMap> {
  const cacheKey = channelId || 'global';
  const cached = cache[cacheKey];

  // Check if cache is still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.emotes;
  }

  console.log('Loading third-party emotes for channel:', channelId || 'global');

  try {
    // Load both BTTV and 7TV emotes in parallel
    const [bttvEmotes, seventvEmotes] = await Promise.all([
      loadBTTVEmotes(channelId),
      load7TVEmotes(channelId)
    ]);

    // Merge emotes (7TV takes precedence if there are name conflicts)
    const allEmotes = { ...bttvEmotes, ...seventvEmotes };

    // Cache the result
    cache[cacheKey] = {
      emotes: allEmotes,
      timestamp: Date.now()
    };

    console.log(`Loaded ${Object.keys(allEmotes).length} third-party emotes`);
    return allEmotes;
  } catch (error) {
    console.error('Failed to load third-party emotes:', error);
    return {};
  }
}

// Helper function to check if a string is an emote
export function isThirdPartyEmote(text: string, emotes: EmoteMap): boolean {
  return text in emotes;
}

// Helper function to get emote URL
export function getEmoteUrl(emoteName: string, emotes: EmoteMap): string | null {
  const emote = emotes[emoteName];
  return emote ? emote.url : null;
}
