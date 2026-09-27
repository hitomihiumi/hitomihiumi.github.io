'use client';

import { useEffect, useState } from 'react';
import { fetchTokenUser, saveAuth } from '@/lib/auth';
import { parseHash } from '@/lib/config/serialize';
import { siteBase } from '@/lib/constants';

/** Twitch redirects here with `#access_token=…`; the token is stored and the editor opened. */
export default function OAuthPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hs = parseHash(window.location.hash);
    if (hs.error) {
      setError(hs.error_description || hs.error);
      return;
    }
    if (!hs.access_token) {
      window.location.replace(siteBase() + 'editor/');
      return;
    }
    fetchTokenUser(hs.access_token)
      .then((user) => {
        if (!user) throw new Error('Twitch did not accept the token');
        saveAuth({ token: hs.access_token, user });
        window.location.replace(siteBase() + 'editor/');
      })
      .catch((e) => setError(String(e.message ?? e)));
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-200 font-sans">
      {error ? (
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-xl text-center max-w-md space-y-4">
          <h1 className="text-xl font-semibold text-white">Authentication error</h1>
          <p className="text-sm text-red-300">{error}</p>
          <p className="text-xs text-zinc-500">
            This usually means the redirect URI doesn&apos;t match the one configured in your Twitch application.
          </p>
          <a href={siteBase() + 'editor/'} className="inline-block bg-indigo-500 hover:bg-indigo-400 text-white px-5 py-2 rounded-md text-sm">
            Back to the editor
          </a>
        </div>
      ) : (
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400 mx-auto mb-4" />
          <p className="text-sm text-zinc-400">Connecting your Twitch account…</p>
        </div>
      )}
    </div>
  );
}
