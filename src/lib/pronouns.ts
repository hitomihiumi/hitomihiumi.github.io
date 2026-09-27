/* Pronouns from https://pronouns.alejo.io (the service used by the Twitch pronouns extension). */

const API = 'https://api.pronouns.alejo.io/v1';

let pronounNames: Promise<Record<string, string>> | null = null;
const userCache = new Map<string, Promise<string>>();

type PronounDef = { subject: string; object: string; singular: boolean };

function loadPronounNames() {
  pronounNames ??= fetch(`${API}/pronouns`)
    .then((r) => (r.ok ? r.json() : {}))
    .then((defs: Record<string, PronounDef>) => {
      const out: Record<string, string> = {};
      for (const [id, d] of Object.entries(defs)) out[id] = d.singular ? d.subject : `${d.subject}/${d.object}`;
      return out;
    })
    .catch(() => ({}));
  return pronounNames;
}

/** Returns e.g. "She/Her" for a login, or an empty string when unknown. */
export function getPronouns(login: string): Promise<string> {
  const key = login.toLowerCase();
  let p = userCache.get(key);
  if (!p) {
    p = Promise.all([
      loadPronounNames(),
      fetch(`${API}/users/${encodeURIComponent(key)}`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([names, user]) => {
        if (!user?.pronoun_id) return '';
        const main = names[user.pronoun_id] ?? '';
        const alt = user.alt_pronoun_id ? names[user.alt_pronoun_id] : '';
        return alt ? `${main.split('/')[0]}/${alt.split('/')[0]}` : main;
      })
      .catch(() => '');
    userCache.set(key, p);
  }
  return p;
}
