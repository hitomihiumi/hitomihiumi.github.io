'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { TwitchMessage, TwitchUser, Badge, ChatSettings } from '@/types';
import { getHashString } from '@/utils';
import { constants } from '@/lib/constants';
import { authHeaders, createTwitchClient, isModerator, isBroadcaster } from '@/lib/twitch';
import { loadThirdPartyEmotes, EmoteMap } from '@/lib/emotes';
import ChatMessage from './ChatMessage';

export default function ChatOverlay() {
  const [messages, setMessages] = useState<TwitchMessage[]>([]);
  const [channelBadges, setChannelBadges] = useState<Record<string, Record<string, Badge>>>({});
  const [globalBadges, setGlobalBadges] = useState<Record<string, Record<string, Badge>>>({});
  const [thirdPartyEmotes, setThirdPartyEmotes] = useState<EmoteMap>({});
  const [settings, setSettings] = useState<ChatSettings>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const twitchClientRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Parse settings from URL hash
  useEffect(() => {
    const hs = getHashString();
    setSettings(hs);

    // Redirect to OAuth if missing required parameters
    if (!hs.channel || !hs.oauth) {
      window.location.href = constants.OAUTH_URL;
      return;
    }

    // Wait for TMI.js to load before initializing
    const waitForTMI = () => {
      if (typeof window !== 'undefined' && (window as any).tmi) {
        initializeTwitch(hs);
      } else {
        // Check again in 100ms if TMI is not loaded
        setTimeout(waitForTMI, 100);
      }
    };

    waitForTMI();
  }, []);

  const initializeTwitch = async (hs: ChatSettings) => {
    try {
      const headers = authHeaders();

      // Get user info
      const user: TwitchUser = await fetch(
        `https://api.twitch.tv/helix/users?login=${hs.channel}`,
        { headers }
      )
        .then(r => r.json())
        .then(j => j.data[0]);

      // Get channel badges
      const channelBadgesData = await fetch(
        `https://api.twitch.tv/helix/chat/badges?broadcaster_id=${user.id}`,
        { headers }
      )
        .then(r => r.json())
        .then(j => j.data);

      const channelBadgesMap: Record<string, Record<string, Badge>> = {};
      channelBadgesData.forEach((badgeSet: any) => {
        const badges: Record<string, Badge> = {};
        badgeSet.versions.forEach((version: Badge) => {
          badges[version.id] = version;
        });
        channelBadgesMap[badgeSet.set_id] = badges;
      });
      setChannelBadges(channelBadgesMap);

      // Get global badges
      const globalBadgesData = await fetch(
        'https://api.twitch.tv/helix/chat/badges/global',
        { headers }
      )
        .then(r => r.json())
        .then(j => j.data);

      const globalBadgesMap: Record<string, Record<string, Badge>> = {};
      globalBadgesData.forEach((badgeSet: any) => {
        const badges: Record<string, Badge> = {};
        badgeSet.versions.forEach((version: Badge) => {
          badges[version.id] = version;
        });
        globalBadgesMap[badgeSet.set_id] = badges;
      });
      setGlobalBadges(globalBadgesMap);

      // Load third-party emotes (BTTV and 7TV)
      try {
        const emotes = await loadThirdPartyEmotes(user.id);
        setThirdPartyEmotes(emotes);
      } catch (error) {
        console.warn('Failed to load third-party emotes:', error);
      }

      // Initialize TMI client (теперь снова синхронная функция)
      const client = createTwitchClient();
      if (client) {
        twitchClientRef.current = client;
        setupTwitchEventHandlers(client, hs);
        await client.connect();
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Failed to initialize Twitch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupTwitchEventHandlers = (client: any, hs: ChatSettings) => {
    const excludeList = (hs.exclude?.replace(/\+|%20/g, " ").split(" ") ?? [])
      .map(v => v.toLowerCase())
      .filter(Boolean);

    const messageLimit = parseInt(hs.limit?.toString() ?? "50"); // дефолт 50 сообщений

    client.on('message', (channel: string, tags: any, message: string, self: boolean) => {
      // Handle commands
      if (message.startsWith('!')) {
        if ((isModerator(tags) || isBroadcaster(tags)) && message === '!clear') {
          clearChat();
          return;
        }
        if (hs.nocommand) {
          return;
        }
      }

      // Filter excluded users
      if (excludeList.includes(tags.username)) {
        return;
      }

      // Используем TMI ID для предотвращения дублирования
      const messageId = tags.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newMessage: TwitchMessage = {
        message,
        tags,
        displaying: true,
        expired: false,
        dead: false,
        id: messageId,
      };

      setMessages(prev => {
        // Проверяем, есть ли уже сообщение с таким ID (предотвращение дублирования)
        const existingMessage = prev.find(msg => msg.id === messageId);
        if (existingMessage) {
          return prev; // Не добавляем дубликат
        }

        // Добавляем новое сообщение и применяем лимит
        const newMessages = [...prev, newMessage];

        // Применяем лимит сообщений - удаляем старые сообщения
        if (newMessages.length > messageLimit) {
          const excess = newMessages.length - messageLimit;
          // Помечаем старые сообщения как dead вместо простого удаления
          return newMessages.map((msg, index) =>
            index < excess ? { ...msg, dead: true } : msg
          );
        }

        return newMessages;
      });

      // Set expiration timer
      setTimeout(() => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, expired: true } : msg
          )
        );
      }, constants.DESTRUCT_TIMER);

      scrollMessagesIntoView();
    });

    client.on('clearchat', () => {
      clearChat();
    });

    client.on('ban', (channel: string, username: string) => {
      bannedOrTimedOut(username);
    });

    client.on('timeout', (channel: string, username: string) => {
      bannedOrTimedOut(username);
    });

    client.on('messagedeleted', (channel: string, username: string, deletedMessage: string, tags: any) => {
      setMessages(prev => prev.filter(msg => msg.tags.id !== tags['target-msg-id']));
    });
  };

  const clearChat = () => {
    setMessages([]);
  };

  const bannedOrTimedOut = (username: string) => {
    const lowered = username.toLowerCase();
    setMessages(prev => prev.filter(msg => msg.tags.username !== lowered));
  };

  const scrollMessagesIntoView = useCallback(() => {
    if (settings.scroll && messagesEndRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'start',
        });
      });
    }
  }, [settings.scroll]);

  const handleAnimationEnd = useCallback((messageId: string, animationName: string) => {
    if (animationName === 'slide-in') {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, displaying: false } : msg
        )
      );
      scrollMessagesIntoView();
    } else if (animationName === 'slide-out') {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, dead: true } : msg
        )
      );
    }
  }, [scrollMessagesIntoView]);

  // Cleanup routine
  useEffect(() => {
    const interval = setInterval(() => {
      setMessages(prev => {
        if (prev.length === 0) return prev;

        const aliveMessageIndex = prev.findIndex(msg => !msg.dead);
        if (aliveMessageIndex === 0) return prev;

        return prev.slice(aliveMessageIndex < 0 ? prev.length : aliveMessageIndex);
      });
    }, constants.CLEANUP_TIMER);

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (twitchClientRef.current) {
        twitchClientRef.current.disconnect();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-600 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Initializing chat overlay...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute bottom-0 w-full flex flex-col justify-end gap-2 p-4 max-h-screen overflow-hidden">
        {messages
          .filter(msg => !msg.dead)
          .map(message => (
            <ChatMessage
              key={message.id}
              message={message}
              channelBadges={channelBadges}
              globalBadges={globalBadges}
              thirdPartyEmotes={thirdPartyEmotes}
              onAnimationEnd={handleAnimationEnd}
            />
          ))}
      </div>
      <div ref={messagesEndRef} />
      {!isConnected && settings.channel && !isLoading && (
        <div className="fixed top-4 left-4 bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg">
          Connecting to {settings.channel}...
        </div>
      )}
    </div>
  );
}
