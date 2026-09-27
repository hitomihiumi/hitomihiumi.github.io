'use client';

import { useEffect, useRef, useState } from 'react';
import type { OverlayConfig } from '@/types/overlay';
import type { TwitchUser } from '@/types';
import { buildOverlayUrl, configFromHash, parseHash } from '@/lib/config/serialize';
import { normalizeConfig } from '@/lib/config/defaults';
import { constants, siteBase } from '@/lib/constants';
import { Row, Section } from './controls';

export interface Auth {
  token: string;
  user: TwitchUser;
}

function CopyField({ value, secret }: { value: string; secret?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [reveal, setReveal] = useState(false);
  const shown = secret && !reveal ? value.replace(/oauth=[^&]+/, 'oauth=••••••••') : value;
  return (
    <div className="space-y-1.5">
      <div className="bg-zinc-900 border border-white/10 rounded-md px-2 py-1.5 text-[11px] font-mono text-zinc-300 break-all max-h-24 overflow-auto editor-scroll">
        {shown || '…'}
      </div>
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={!value}
          onClick={() => {
            navigator.clipboard.writeText(value).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            });
          }}
          className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white text-sm rounded-md py-1.5 disabled:opacity-40"
        >
          {copied ? 'Copied!' : 'Copy link'}
        </button>
        {secret && (
          <button type="button" onClick={() => setReveal(!reveal)} className="px-3 text-xs rounded-md border border-white/10 text-zinc-300 hover:bg-white/10">
            {reveal ? 'Hide' : 'Show'}
          </button>
        )}
        <a href={value} target="_blank" rel="noreferrer" className="px-3 text-xs rounded-md border border-white/10 text-zinc-300 hover:bg-white/10 flex items-center">
          Open
        </a>
      </div>
    </div>
  );
}

export default function ExportPanel({
  config,
  auth,
  onLogout,
  onImport,
}: {
  config: OverlayConfig;
  auth: Auth | null;
  onLogout: () => void;
  onImport: (c: OverlayConfig) => void;
}) {
  const [url, setUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [pasted, setPasted] = useState('');
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      const base = siteBase();
      const [u, d] = await Promise.all([
        auth ? buildOverlayUrl(base, { oauth: auth.token, channel: auth.user.login }, config) : Promise.resolve(''),
        buildOverlayUrl(base, {}, config).then((x) => x.replace('#', '#demo=1&')),
      ]);
      if (alive) {
        setUrl(u);
        setDemoUrl(d);
      }
    }, 250);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [config, auth]);

  const flash = (m: string) => {
    setMessage(m);
    setTimeout(() => setMessage(''), 2500);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chat-overlay-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJson = (file: File) => {
    file
      .text()
      .then((t) => {
        const json = JSON.parse(t);
        if (json.version !== 2) throw new Error('Unsupported file');
        onImport(normalizeConfig(json));
        flash('Design imported');
      })
      .catch(() => flash('This file is not a chat overlay design'));
  };

  const importUrl = async () => {
    const i = pasted.indexOf('#');
    if (i < 0) return flash('The link has no settings (#…) part');
    onImport(await configFromHash(parseHash(pasted.slice(i))));
    setPasted('');
    flash('Design loaded from the link');
  };

  return (
    <>
      <Section title="Twitch account">
        {auth ? (
          <div className="flex items-center gap-3">
            <img src={auth.user.profile_image_url} alt="" className="w-9 h-9 rounded-full" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{auth.user.display_name}</div>
              <div className="text-[11px] text-zinc-500">connected</div>
            </div>
            <button type="button" onClick={onLogout} className="text-xs text-zinc-400 hover:text-white">
              Log out
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400">Connect your Twitch account to get a link for OBS. Your design is kept in this browser meanwhile.</p>
            <a href={constants.OAUTH_URL} className="block text-center bg-[#9146ff] hover:bg-[#a970ff] text-white text-sm rounded-md py-2">
              Connect with Twitch
            </a>
          </div>
        )}
      </Section>

      {auth && (
        <Section title="Overlay link for OBS">
          <CopyField value={url} secret />
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Add a <b>Browser source</b> in OBS with this URL (e.g. 500×800). The link contains your access token — don&apos;t show it on stream.
          </p>
        </Section>
      )}

      <Section title="Demo link" defaultOpen={!auth}>
        <p className="text-[11px] text-zinc-500">Shows fake messages — handy for positioning in OBS or sharing the design.</p>
        <CopyField value={demoUrl} />
      </Section>

      <Section title="Backup & import">
        <div className="grid grid-cols-2 gap-1.5">
          <button type="button" onClick={exportJson} className="text-sm rounded-md border border-white/10 text-zinc-200 hover:bg-white/10 py-1.5">
            Export .json
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className="text-sm rounded-md border border-white/10 text-zinc-200 hover:bg-white/10 py-1.5">
            Import .json
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = '';
            }}
          />
        </div>
        <Row label="Load from an overlay link" hint="old links work too">
          <div className="flex gap-1.5">
            <input
              className="flex-1 min-w-0 bg-zinc-900 border border-white/10 rounded-md px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-400"
              value={pasted}
              placeholder="https://…/#…"
              onChange={(e) => setPasted(e.target.value)}
            />
            <button type="button" disabled={!pasted} onClick={importUrl} className="px-3 rounded-md bg-indigo-500 text-white text-xs disabled:opacity-40">
              Load
            </button>
          </div>
        </Row>
        {message && <div className="text-xs text-emerald-300">{message}</div>}
      </Section>
    </>
  );
}
