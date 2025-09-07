import { constants } from "./constants";
import { getHashString } from "@/utils";

/**
 * Twitch API auth headers
 * @param tokenKey Optional key to use when pulling the auth token from
 * the current URL's hash string; defaults to `oauth` if unset
 * @returns The HTTP headers to use for Twitch API authentication
 */
export const authHeaders = (tokenKey?: string): HeadersInit => {
  const hs = getHashString();
  const token = tokenKey ? hs[tokenKey] : hs.oauth;

  return {
    Authorization: `Bearer ${token}`,
    "Client-ID": constants.CLIENT_ID,
  };
};

/** Twitch client factory function */
export const createTwitchClient = () => {
  if (typeof window === 'undefined') return null;

  // Проверяем, что TMI.js загружен
  if (!(window as any).tmi) {
    console.error('TMI.js not loaded');
    return null;
  }

  const hs = getHashString();

  // Проверяем наличие необходимых параметров
  if (!hs.channel || !hs.oauth) {
    console.error('Missing channel or oauth token');
    return null;
  }

  try {
    // @ts-expect-error - TMI types not available
    return new window.tmi.Client({
      channels: [hs.channel],
      identity: {
        username: hs.channel,
        password: `oauth:${hs.oauth}`,
      },
      options: { debug: true },
    });
  } catch (error) {
    console.error('Failed to create TMI client:', error);
    return null;
  }
};

/** based on tags, is this user the broadcaster? */
export const isBroadcaster = (tags: any): boolean =>
  tags.badges?.hasOwnProperty("broadcaster") ?? false;

/** based on tags, is this user a moderator? */
export const isModerator = (tags: any): boolean => tags.mod;