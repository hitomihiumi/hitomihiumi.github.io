import type { TwitchUser } from '@/types';
import { constants } from './constants';

const AUTH_KEY = 'chat-overlay:auth';

export interface StoredAuth {
  token: string;
  user: TwitchUser;
}

export function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth: StoredAuth | null) {
  try {
    if (auth) localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    else localStorage.removeItem(AUTH_KEY);
  } catch {
    /* storage disabled */
  }
}

/** Fetches the user that owns the token, or null when the token is invalid / expired. */
export async function fetchTokenUser(token: string): Promise<TwitchUser | null> {
  const res = await fetch('https://api.twitch.tv/helix/users', {
    headers: { Authorization: `Bearer ${token}`, 'Client-ID': constants.CLIENT_ID },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data?.[0] ?? null;
}
