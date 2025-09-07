'use client';

import { useEffect, useState } from 'react';
import { TwitchMessage, Badge } from '@/types';
import { isBroadcaster, isModerator } from '@/lib/twitch';
import { EmoteMap } from '@/lib/emotes';

interface ChatMessageProps {
  message: TwitchMessage;
  channelBadges: Record<string, Record<string, Badge>>;
  globalBadges: Record<string, Record<string, Badge>>;
  thirdPartyEmotes?: EmoteMap;
  onAnimationEnd: (messageId: string, animationName: string) => void;
}

export default function ChatMessage({
  message,
  channelBadges,
  globalBadges,
  thirdPartyEmotes = {},
  onAnimationEnd,
}: ChatMessageProps) {
  const [localMessage, setLocalMessage] = useState(message);

  useEffect(() => {
    setLocalMessage(message);
  }, [message]);

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    onAnimationEnd(localMessage.id || '', e.animationName);
  };

  const clean = (text: string) => {
    return text.replace(/\x01/g, "&lt;");
  };

  const badges = Object.keys(localMessage.tags.badges || {}).map((v) => {
    const version = localMessage.tags.badges![v];
    const pool = channelBadges.hasOwnProperty(v) ? channelBadges : globalBadges;
    return pool[v]?.[version]?.image_url_1x;
  }).filter(Boolean);

  const getUserRole = () => {
    if (isBroadcaster(localMessage.tags)) return 'broadcaster';
    if (isModerator(localMessage.tags)) return 'mod';
    if (localMessage.tags.badges?.subscriber) return 'subscriber';
    if (localMessage.tags.badges?.vip) return 'vip';
    return 'default';
  };

  const getCustomColors = () => {
    if (typeof window === 'undefined') return null;

    const params = new URLSearchParams(window.location.hash.substring(1));
    const role = getUserRole();

    return {
      usernameBg: params.get(`${role}UsernameBg`),
      messageBg: params.get(`${role}MessageBg`),
      usernameTextColor: params.get(`${role}UsernameTextColor`),
      messageTextColor: params.get(`${role}MessageTextColor`),
      usernameTextShadow: params.get(`${role}UsernameTextShadow`),
      messageTextShadow: params.get(`${role}MessageTextShadow`)
    };
  };

  const getBubbleClass = () => {
    const role = getUserRole();
    const baseClasses = [
      "chat-message-container",
      `chat-bubble-${role}`,
      "font-(family-name:--font-playpen)",
      localMessage.displaying && "animate-slide-in",
      localMessage.expired && "animate-slide-out",
      localMessage.dead && "!hidden",
    ].filter(Boolean).join(" ");

    return baseClasses;
  };

  const parsedMessage = () => {
    let parsed = localMessage.message.replace(/</g, "\x01");

    if (localMessage.tags.emotes === null || !localMessage.tags.emotes) {
      return clean(parsed);
    }

    const all: Array<{ emote: string; start: number; end: number }> = [];

    for (const key of Object.keys(localMessage.tags.emotes)) {
      const emote = localMessage.tags.emotes[key];

      for (const range of emote) {
        const split = range.split("-");
        all.push({
          emote: key,
          start: parseInt(split[0]),
          end: parseInt(split[1]),
        });
      }
    }

    all.sort((a, b) => a.start - b.start);

    let offset = 0;

    for (const emote of all) {
      const tag = `<img class="inline relative z-10 h-6 w-6 -my-1 align-middle" src="https://static-cdn.jtvnw.net/emoticons/v2/${emote.emote}/default/dark/1.0" />`;
      const keyword = parsed.slice(offset + emote.start, offset + emote.end + 1);

      parsed = parsed.slice(0, offset + emote.start) + tag + parsed.slice(offset + emote.end + 1);
      offset = offset + tag.length - keyword.length;
    }

    return clean(parsed).replace(/> </g, "><");
  };

  const processedMessage = () => {
    let message = parsedMessage();

    // Process third-party emotes (BTTV and 7TV)
    if (thirdPartyEmotes && Object.keys(thirdPartyEmotes).length > 0) {
      // Split message into words while preserving spaces
      const words = message.split(/(\s+)/);

      for (let i = 0; i < words.length; i++) {
        const word = words[i].trim();
        if (word && thirdPartyEmotes[word]) {
          const emote = thirdPartyEmotes[word];
          const emoteSizeClass = "h-6 w-auto"; // Match Twitch emote size
          words[i] = words[i].replace(
            word,
            `<img class="inline relative z-10 ${emoteSizeClass} -my-1 align-middle" src="${emote.url}" alt="${emote.code}" title="${emote.code} (${emote.provider})" loading="lazy" />`
          );
        }
      }

      message = words.join('');
    }

    return message;
  };

  if (localMessage.dead) {
    return null;
  }

  const customColors = getCustomColors();

  return (
    <div
      className={getBubbleClass()}
      onAnimationEnd={handleAnimationEnd}
    >
      {/* Username bubble */}
      <div
        className="username-bubble"
        style={{
          background: customColors?.usernameBg || undefined,
          color: customColors?.usernameTextColor || undefined,
          textShadow: customColors?.usernameTextShadow ? `1px 1px 1px ${customColors.usernameTextShadow}` : undefined
        }}
      >
        {badges.map((badge, index) => (
          <img
            key={index}
            className="inline h-4 w-4 align-middle"
            src={badge}
            alt=""
          />
        ))}
        <span>
          {localMessage.tags['display-name'] || localMessage.tags.username}
        </span>
      </div>

      {/* Message bubble */}
      <div
        className="message-bubble"
        style={{
          background: customColors?.messageBg || undefined,
          color: customColors?.messageTextColor || undefined,
          textShadow: customColors?.messageTextShadow ? `1px 1px 1px ${customColors.messageTextShadow}` : undefined
        }}
        dangerouslySetInnerHTML={{ __html: processedMessage() }}
      />
    </div>
  );
}
