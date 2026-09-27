import type { StyleKey } from '@/types/overlay';
import type { BubbleData } from '@/components/bubble/Bubble';
import type { FeedItem } from '@/components/feed/ChatFeed';
import { tokenize } from './parse';

const SAMPLES: Record<StyleKey, { name: string; color: string; text: string; vars?: BubbleData['vars']; pronouns?: string }> = {
  broadcaster: { name: 'Hitomi', color: '#ff7ac6', text: 'Welcome to the stream everyone! ✨', pronouns: 'She/Her' },
  mod: { name: 'ModeratorMia', color: '#34d17c', text: 'Please be kind in chat, thank you!' },
  vip: { name: 'VipVincent', color: '#e05cf5', text: 'This is a VIP user message, recognized with a special badge' },
  subscriber: { name: 'nasmediaa', color: '#8f7bff', text: 'Hey @Hitomi, I just resubscribed! Love you streamer' },
  first: { name: 'NewVisitor', color: '#4fb3ff', text: 'Hi! This is my first message here' },
  highlight: { name: 'MilaeShop', color: '#ffb84d', text: 'Highlighted my message with channel points!' },
  default: { name: 'viewer_42', color: '#ff9966', text: 'This is a regular viewer test message, a bit longer to show how text wraps inside the bubble.' },
  sub: { name: 'Felice', color: '#ff7ac6', text: '', vars: { tier: 'Tier 1', months: 1 } },
  resub: { name: 'I_M_KINDA_BUSY', color: '#8f7bff', text: 'Hi, I just resubscribed!', vars: { tier: 'Tier 1', months: 10 } },
  giftsub: { name: 'Jerry', color: '#34d17c', text: '', vars: { amount: 5, tier: 'Tier 1' } },
  cheer: { name: 'Tiphanie', color: '#e05cf5', text: 'Take my bits!', vars: { amount: 49 } },
  raid: { name: 'Ilyse', color: '#4fb3ff', text: '', vars: { amount: 35 } },
};

const avatarFor = (name: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="${color}"/><text x="20" y="27" font-family="sans-serif" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">${name[0].toUpperCase()}</text></svg>`,
  )}`;

export function sampleData(key: StyleKey, override?: { name?: string; text?: string }): BubbleData {
  const s = SAMPLES[key];
  const name = override?.name || s.name;
  return {
    name,
    color: s.color,
    avatar: avatarFor(name, s.color),
    badges: [],
    pronouns: s.pronouns ?? 'They/Them',
    tokens: tokenize(override?.text || s.text, null),
    vars: s.vars,
  };
}

const RANDOM_TEXT = [
  'hello chat!',
  'LUL that was close',
  'this overlay looks so cute',
  'GG! Let\'s go!!',
  'can we play another round?',
  'first time here, love the vibe ✨',
  '@Hitomi what game is next?',
  'hydrate reminder 💧',
  'Kappa',
  'the music is so good today',
];
const KEYS: StyleKey[] = ['default', 'default', 'default', 'subscriber', 'subscriber', 'vip', 'mod', 'first', 'broadcaster', 'highlight', 'sub', 'resub', 'giftsub', 'cheer', 'raid'];

let counter = 0;

/** A random message or event for simulated chat. */
export function randomItem(): FeedItem {
  const key = KEYS[Math.floor(Math.random() * KEYS.length)];
  const base = sampleData(key);
  if (key !== 'broadcaster' && !['sub', 'resub', 'giftsub', 'cheer', 'raid'].includes(key) && Math.random() < 0.7) {
    base.tokens = tokenize(RANDOM_TEXT[Math.floor(Math.random() * RANDOM_TEXT.length)], null);
  }
  return { id: `sim-${++counter}-${Date.now()}`, key, data: base };
}

export function sampleItem(key: StyleKey): FeedItem {
  return { id: `sample-${key}`, key, data: sampleData(key) };
}
