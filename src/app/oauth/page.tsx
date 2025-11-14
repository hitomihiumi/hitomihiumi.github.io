'use client';

import { useEffect, useState } from 'react';
import { getHashString } from '@/utils';
import { authHeaders } from '@/lib/twitch';
import { defaultColors } from '@/lib/constants';
import { TwitchUser } from '@/types';
import Link from 'next/link';
import BubblePreview from '@/components/BubblePreview';
import ColorPicker from '@/components/ColorPicker';

export default function OAuthPage() {
  const [user, setUser] = useState<TwitchUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    scroll: false,
    nocommand: false,
    lifetime: '',
    exclude: '',
    limit: '',
    alignment: 'center' as 'left' | 'center' | 'right',
  });

  const [colorSettings, setColorSettings] = useState({
    broadcasterUsernameBg: '',
    broadcasterMessageBg: '',
    broadcasterUsernameTextColor: '',
    broadcasterMessageTextColor: '',
    broadcasterUsernameTextShadow: '',
    broadcasterMessageTextShadow: '',
    modUsernameBg: '',
    modMessageBg: '',
    modUsernameTextColor: '',
    modMessageTextColor: '',
    modUsernameTextShadow: '',
    modMessageTextShadow: '',
    subscriberUsernameBg: '',
    subscriberMessageBg: '',
    subscriberUsernameTextColor: '',
    subscriberMessageTextColor: '',
    subscriberUsernameTextShadow: '',
    subscriberMessageTextShadow: '',
    vipUsernameBg: '',
    vipMessageBg: '',
    vipUsernameTextColor: '',
    vipMessageTextColor: '',
    vipUsernameTextShadow: '',
    vipMessageTextShadow: '',
    defaultUsernameBg: '',
    defaultMessageBg: '',
    defaultUsernameTextColor: '',
    defaultMessageTextColor: '',
    defaultUsernameTextShadow: '',
    defaultMessageTextShadow: '',
  });

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const hs = getHashString();

        if (hs.error) {
          console.error('OAuth error:', hs.error, hs.error_description);
          const errorMsg = hs.error_description
            ? decodeURIComponent(hs.error_description.replace(/\+/g, ' '))
            : hs.error;
          setError(`OAuth Error: ${errorMsg}`);
          setLoading(false);
          return;
        }

        if (!hs.access_token) {
          setLoading(false);
          return;
        }

        const headers = authHeaders('access_token');
        const userData: TwitchUser = await fetch('https://api.twitch.tv/helix/users', { headers })
          .then(r => r.json())
          .then(j => j.data[0]);

        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setError('Failed to fetch user data from Twitch');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    const hs = getHashString();
    const baseUrl = window.location.origin + window.location.pathname.replace('/oauth/', '/');
    let url = `${baseUrl}#oauth=${hs.access_token}&channel=${user.login}`;

    // Add toggles
    if (formData.scroll) {
      url += '&scroll=1';
    }
    if (formData.nocommand) {
      url += '&nocommand=1';
    }

    // Add options
    if (formData.lifetime) {
      url += `&lifetime=${encodeURIComponent(formData.lifetime)}`;
    }
    if (formData.exclude) {
      url += `&exclude=${encodeURIComponent(formData.exclude)}`;
    }
    if (formData.limit) {
      url += `&limit=${encodeURIComponent(formData.limit)}`;
    }

    // Add color settings
    Object.entries(colorSettings).forEach(([key, value]) => {
      if (value) {
        url += `&${key}=${encodeURIComponent(value)}`;
      }
    });

    window.location.href = url;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleColorChange = (field: string, value: string) => {
    setColorSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const exportSettings = () => {
    const settings = {
      formData,
      colorSettings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-overlay-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target?.result as string);

        // Validate the imported settings structure
        if (settings.formData) {
          setFormData(prev => ({
            ...prev,
            ...settings.formData
          }));
        }

        if (settings.colorSettings) {
          setColorSettings(prev => ({
            ...prev,
            ...settings.colorSettings
          }));
        }

        alert('Settings imported successfully!');
      } catch (error) {
        console.error('Error importing settings:', error);
        alert('Error importing settings. Please check the file format.');
      }
    };
    reader.readAsText(file);

    // Reset the input value so the same file can be imported again
    event.target.value = '';
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      setFormData({
        scroll: false,
        nocommand: false,
        lifetime: '',
        exclude: '',
        limit: '',
        alignment: 'center',
      });

      setColorSettings({
        broadcasterUsernameBg: '',
        broadcasterMessageBg: '',
        broadcasterUsernameTextColor: '',
        broadcasterMessageTextColor: '',
        broadcasterUsernameTextShadow: '',
        broadcasterMessageTextShadow: '',
        modUsernameBg: '',
        modMessageBg: '',
        modUsernameTextColor: '',
        modMessageTextColor: '',
        modUsernameTextShadow: '',
        modMessageTextShadow: '',
        subscriberUsernameBg: '',
        subscriberMessageBg: '',
        subscriberUsernameTextColor: '',
        subscriberMessageTextColor: '',
        subscriberUsernameTextShadow: '',
        subscriberMessageTextShadow: '',
        vipUsernameBg: '',
        vipMessageBg: '',
        vipUsernameTextColor: '',
        vipMessageTextColor: '',
        vipUsernameTextShadow: '',
        vipMessageTextShadow: '',
        defaultUsernameBg: '',
        defaultMessageBg: '',
        defaultUsernameTextColor: '',
        defaultMessageTextColor: '',
        defaultUsernameTextShadow: '',
        defaultMessageTextShadow: '',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 border border-gray-700 p-8 rounded-lg shadow-xl text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">
            {error ? 'Authentication Error' : 'Authentication Required'}
          </h1>
          {error ? (
            <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-md">
              <p className="text-red-300 text-sm">{error}</p>
              <p className="text-red-400 text-xs mt-2">
                This usually means the redirect URI doesn&apos;t match what&apos;s configured in your Twitch application.
              </p>
            </div>
          ) : (
            <p className="text-gray-300 mb-4">Please authenticate with Twitch to continue.</p>
          )}
          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Chat Overlay Options</h1>

          <div className="mb-6 p-4 bg-blue-900/50 border border-blue-700 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-300 mb-2">Welcome, {user.display_name}!</h2>
            <p className="text-blue-200">Configure your chat overlay settings below.</p>
          </div>

          <div className="gap-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Toggles */}
                <fieldset className="border border-gray-600 rounded-lg p-6 bg-gray-750">
                  <legend className="text-lg font-semibold text-gray-200 px-2">Toggles</legend>

                  <div className="space-y-4">
                    <div>
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.scroll}
                          onChange={(e) => handleInputChange('scroll', e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <div>
                          <div className="font-medium text-gray-200">Scroll latest message into view</div>
                          <div className="text-sm text-gray-400">
                            Useful when CSS causes new messages to appear at the top of the screen rather than the bottom.
                          </div>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.nocommand}
                          onChange={(e) => handleInputChange('nocommand', e.target.checked)}
                          className="mt-1 h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <div>
                          <div className="font-medium text-gray-200">Hide commands</div>
                          <div className="text-sm text-gray-400">
                            Prevents messages that begin with <code className="bg-gray-700 text-gray-300 px-1 rounded">!</code> from appearing in the overlay.
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </fieldset>

                {/* Options */}
                <fieldset className="border border-gray-600 rounded-lg p-6 bg-gray-750">
                  <legend className="text-lg font-semibold text-gray-200 px-2">Options</legend>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="lifetime" className="block font-medium text-gray-200 mb-2">
                        Message lifetime (in seconds):
                      </label>
                      <input
                        type="number"
                        id="lifetime"
                        value={formData.lifetime}
                        onChange={(e) => handleInputChange('lifetime', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="90"
                      />
                      <div className="text-sm text-gray-400 mt-1">
                        The number of seconds a message will be visible before triggering the{' '}
                        <code className="bg-gray-700 text-gray-300 px-1 rounded">slide-out</code> animation.
                        If left blank, the default value of <code className="bg-gray-700 text-gray-300 px-1 rounded">90</code> seconds will be used.
                      </div>
                    </div>

                    <div>
                      <label htmlFor="exclude" className="block font-medium text-gray-200 mb-2">
                        Exclude:
                      </label>
                      <input
                        type="text"
                        id="exclude"
                        value={formData.exclude}
                        onChange={(e) => handleInputChange('exclude', e.target.value)}
                        placeholder="Space-separated usernames"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="text-sm text-gray-400 mt-1">
                        A space-separated list of usernames (case-insensitive) whose messages will not be displayed in the overlay.
                        Useful for preventing bot chatter.
                      </div>
                    </div>

                    <div>
                      <label htmlFor="limit" className="block font-medium text-gray-200 mb-2">
                        Message limit:
                      </label>
                      <input
                        type="number"
                        id="limit"
                        value={formData.limit}
                        onChange={(e) => handleInputChange('limit', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="100"
                      />
                      <div className="text-sm text-gray-400 mt-1">
                        The maximum number of messages to display in the overlay.
                        If left blank, there is no limit.
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-gray-200 mb-2">
                        Message alignment:
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="alignment"
                            value="left"
                            checked={formData.alignment === 'left'}
                            onChange={(e) => handleInputChange('alignment', e.target.value)}
                            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-gray-200">Left</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="alignment"
                            value="center"
                            checked={formData.alignment === 'center'}
                            onChange={(e) => handleInputChange('alignment', e.target.value)}
                            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-gray-200">Center</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name="alignment"
                            value="right"
                            checked={formData.alignment === 'right'}
                            onChange={(e) => handleInputChange('alignment', e.target.value)}
                            className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-2"
                          />
                          <span className="text-gray-200">Right</span>
                        </label>
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Choose how chat messages are aligned on the screen.
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Color Settings */}
                <fieldset className="border border-gray-600 rounded-lg p-6 bg-gray-750">
                  <legend className="text-lg font-semibold text-gray-200 px-2">Color Settings</legend>

                  <div className="space-y-6 grid grid-cols-2 gap-4">
                    {/* Broadcaster Colors */}
                    <div>
                      <h4 className="font-medium text-gray-200 mb-3">Broadcaster/Streamer</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <ColorPicker
                          value={colorSettings.broadcasterUsernameBg}
                          defaultValue={defaultColors.broadcaster.usernameBg}
                          onChange={(color) => handleColorChange('broadcasterUsernameBg', color)}
                          label="Username Background"
                        />
                        <ColorPicker
                          value={colorSettings.broadcasterMessageBg}
                          defaultValue={defaultColors.broadcaster.messageBg}
                          onChange={(color) => handleColorChange('broadcasterMessageBg', color)}
                          label="Message Background"
                        />
                        <ColorPicker
                          value={colorSettings.broadcasterUsernameTextColor}
                          defaultValue={defaultColors.broadcaster.usernameTextColor}
                          onChange={(color) => handleColorChange('broadcasterUsernameTextColor', color)}
                          label="Username Text Color"
                        />
                        <ColorPicker
                          value={colorSettings.broadcasterMessageTextColor}
                          defaultValue={defaultColors.broadcaster.messageTextColor}
                          onChange={(color) => handleColorChange('broadcasterMessageTextColor', color)}
                          label="Message Text Color"
                        />
                        <ColorPicker
                          value={colorSettings.broadcasterUsernameTextShadow}
                          defaultValue={defaultColors.broadcaster.usernameTextShadow}
                          onChange={(color) => handleColorChange('broadcasterUsernameTextShadow', color)}
                          label="Username Text Shadow"
                        />
                        <ColorPicker
                          value={colorSettings.broadcasterMessageTextShadow}
                          defaultValue={defaultColors.broadcaster.messageTextShadow}
                          onChange={(color) => handleColorChange('broadcasterMessageTextShadow', color)}
                          label="Message Text Shadow"
                        />
                      </div>
                        <BubblePreview
                            userType="broadcaster"
                            usernameBgColor={colorSettings.broadcasterUsernameBg}
                            messageBgColor={colorSettings.broadcasterMessageBg}
                            usernameTextColor={colorSettings.broadcasterUsernameTextColor}
                            messageTextColor={colorSettings.broadcasterMessageTextColor}
                            usernameTextShadowColor={colorSettings.broadcasterUsernameTextShadow}
                            messageTextShadowColor={colorSettings.broadcasterMessageTextShadow}
                            username="Streamer"
                            message="This is a broadcaster message"
                        />
                    </div>

                    {/* Moderator Colors */}
                    <div>
                      <h4 className="font-medium text-gray-200 mb-3">Moderator</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <ColorPicker
                          value={colorSettings.modUsernameBg}
                          defaultValue={defaultColors.mod.usernameBg}
                          onChange={(color) => handleColorChange('modUsernameBg', color)}
                          label="Username Background"
                        />
                        <ColorPicker
                          value={colorSettings.modMessageBg}
                          defaultValue={defaultColors.mod.messageBg}
                          onChange={(color) => handleColorChange('modMessageBg', color)}
                          label="Message Background"
                        />
                        <ColorPicker
                          value={colorSettings.modUsernameTextColor}
                          defaultValue={defaultColors.mod.usernameTextColor}
                          onChange={(color) => handleColorChange('modUsernameTextColor', color)}
                          label="Username Text Color"
                        />
                        <ColorPicker
                          value={colorSettings.modMessageTextColor}
                          defaultValue={defaultColors.mod.messageTextColor}
                          onChange={(color) => handleColorChange('modMessageTextColor', color)}
                          label="Message Text Color"
                        />
                        <ColorPicker
                          value={colorSettings.modUsernameTextShadow}
                          defaultValue={defaultColors.mod.usernameTextShadow}
                          onChange={(color) => handleColorChange('modUsernameTextShadow', color)}
                          label="Username Text Shadow"
                        />
                        <ColorPicker
                          value={colorSettings.modMessageTextShadow}
                          defaultValue={defaultColors.mod.messageTextShadow}
                          onChange={(color) => handleColorChange('modMessageTextShadow', color)}
                          label="Message Text Shadow"
                        />
                      </div>
                        <BubblePreview
                            userType="mod"
                            usernameBgColor={colorSettings.modUsernameBg}
                            messageBgColor={colorSettings.modMessageBg}
                            usernameTextColor={colorSettings.modUsernameTextColor}
                            messageTextColor={colorSettings.modMessageTextColor}
                            usernameTextShadowColor={colorSettings.modUsernameTextShadow}
                            messageTextShadowColor={colorSettings.modMessageTextShadow}
                            username="ModUser"
                            message="This is a moderator message"
                        />
                    </div>

                    {/* Vip Colors */}
                    <div>
                        <h4 className="font-medium text-gray-200 mb-3">VIP</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <ColorPicker
                                value={colorSettings.vipUsernameBg}
                                defaultValue={defaultColors.vip.usernameBg}
                                onChange={(color) => handleColorChange('vipUsernameBg', color)}
                                label="Username Background"
                            />
                            <ColorPicker
                                value={colorSettings.vipMessageBg}
                                defaultValue={defaultColors.vip.messageBg}
                                onChange={(color) => handleColorChange('vipMessageBg', color)}
                                label="Message Background"
                            />
                            <ColorPicker
                                value={colorSettings.vipUsernameTextColor}
                                defaultValue={defaultColors.vip.usernameTextColor}
                                onChange={(color) => handleColorChange('vipUsernameTextColor', color)}
                                label="Username Text Color"
                            />
                            <ColorPicker
                                value={colorSettings.vipMessageTextColor}
                                defaultValue={defaultColors.vip.messageTextColor}
                                onChange={(color) => handleColorChange('vipMessageTextColor', color)}
                                label="Message Text Color"
                            />
                            <ColorPicker
                                value={colorSettings.vipUsernameTextShadow}
                                defaultValue={defaultColors.vip.usernameTextShadow}
                                onChange={(color) => handleColorChange('vipUsernameTextShadow', color)}
                                label="Username Text Shadow"
                            />
                            <ColorPicker
                                value={colorSettings.vipMessageTextShadow}
                                defaultValue={defaultColors.vip.messageTextShadow}
                                onChange={(color) => handleColorChange('vipMessageTextShadow', color)}
                                label="Message Text Shadow"
                            />
                        </div>
                        <BubblePreview
                            userType="vip"
                            usernameBgColor={colorSettings.vipUsernameBg}
                            messageBgColor={colorSettings.vipMessageBg}
                            usernameTextColor={colorSettings.vipUsernameTextColor}
                            messageTextColor={colorSettings.vipMessageTextColor}
                            usernameTextShadowColor={colorSettings.vipUsernameTextShadow}
                            messageTextShadowColor={colorSettings.vipMessageTextShadow}
                            username="VipUser"
                            message="This is a VIP message"
                        />
                    </div>

                    {/* Subscriber Colors */}
                    <div>
                      <h4 className="font-medium text-gray-200 mb-3">Subscriber</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <ColorPicker
                          value={colorSettings.subscriberUsernameBg}
                          defaultValue={defaultColors.subscriber.usernameBg}
                          onChange={(color) => handleColorChange('subscriberUsernameBg', color)}
                          label="Username Background"
                        />
                        <ColorPicker
                          value={colorSettings.subscriberMessageBg}
                          defaultValue={defaultColors.subscriber.messageBg}
                          onChange={(color) => handleColorChange('subscriberMessageBg', color)}
                          label="Message Background"
                        />
                        <ColorPicker
                          value={colorSettings.subscriberUsernameTextColor}
                          defaultValue={defaultColors.subscriber.usernameTextColor}
                          onChange={(color) => handleColorChange('subscriberUsernameTextColor', color)}
                          label="Username Text Color"
                        />
                        <ColorPicker
                          value={colorSettings.subscriberMessageTextColor}
                          defaultValue={defaultColors.subscriber.messageTextColor}
                          onChange={(color) => handleColorChange('subscriberMessageTextColor', color)}
                          label="Message Text Color"
                        />
                        <ColorPicker
                          value={colorSettings.subscriberUsernameTextShadow}
                          defaultValue={defaultColors.subscriber.usernameTextShadow}
                          onChange={(color) => handleColorChange('subscriberUsernameTextShadow', color)}
                          label="Username Text Shadow"
                        />
                        <ColorPicker
                          value={colorSettings.subscriberMessageTextShadow}
                          defaultValue={defaultColors.subscriber.messageTextShadow}
                          onChange={(color) => handleColorChange('subscriberMessageTextShadow', color)}
                          label="Message Text Shadow"
                        />
                      </div>
                        <BubblePreview
                            userType="subscriber"
                            usernameBgColor={colorSettings.subscriberUsernameBg}
                            messageBgColor={colorSettings.subscriberMessageBg}
                            usernameTextColor={colorSettings.subscriberUsernameTextColor}
                            messageTextColor={colorSettings.subscriberMessageTextColor}
                            usernameTextShadowColor={colorSettings.subscriberUsernameTextShadow}
                            messageTextShadowColor={colorSettings.subscriberMessageTextShadow}
                            username="SubUser"
                            message="This is a subscriber message"
                        />
                    </div>

                    {/* Default Colors */}
                    <div>
                      <h4 className="font-medium text-gray-200 mb-3">Default Users</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <ColorPicker
                          value={colorSettings.defaultUsernameBg}
                          defaultValue={defaultColors.default.usernameBg}
                          onChange={(color) => handleColorChange('defaultUsernameBg', color)}
                          label="Username Background"
                        />
                        <ColorPicker
                          value={colorSettings.defaultMessageBg}
                          defaultValue={defaultColors.default.messageBg}
                          onChange={(color) => handleColorChange('defaultMessageBg', color)}
                          label="Message Background"
                        />
                        <ColorPicker
                          value={colorSettings.defaultUsernameTextColor}
                          defaultValue={defaultColors.default.usernameTextColor}
                          onChange={(color) => handleColorChange('defaultUsernameTextColor', color)}
                          label="Username Text Color"
                        />
                        <ColorPicker
                          value={colorSettings.defaultMessageTextColor}
                          defaultValue={defaultColors.default.messageTextColor}
                          onChange={(color) => handleColorChange('defaultMessageTextColor', color)}
                          label="Message Text Color"
                        />
                        <ColorPicker
                          value={colorSettings.defaultUsernameTextShadow}
                          defaultValue={defaultColors.default.usernameTextShadow}
                          onChange={(color) => handleColorChange('defaultUsernameTextShadow', color)}
                          label="Username Text Shadow"
                        />
                        <ColorPicker
                          value={colorSettings.defaultMessageTextShadow}
                          defaultValue={defaultColors.default.messageTextShadow}
                          onChange={(color) => handleColorChange('defaultMessageTextShadow', color)}
                          label="Message Text Shadow"
                        />
                      </div>
                        <BubblePreview
                            userType="default"
                            usernameBgColor={colorSettings.defaultUsernameBg}
                            messageBgColor={colorSettings.defaultMessageBg}
                            usernameTextColor={colorSettings.defaultUsernameTextColor}
                            messageTextColor={colorSettings.defaultMessageTextColor}
                            usernameTextShadowColor={colorSettings.defaultUsernameTextShadow}
                            messageTextShadowColor={colorSettings.defaultMessageTextShadow}
                            username="User123"
                            message="This is a default user message"
                        />
                    </div>
                  </div>
                </fieldset>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors font-medium"
                  >
                    Go!
                  </button>
                </div>
              </form>

              {/* Import/Export and Reset Settings */}
              <div className="mt-8 border-t border-gray-600 pt-8">
                <h3 className="text-xl font-semibold text-white mb-4">Settings Management</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Export Settings */}
                  <button
                    onClick={exportSettings}
                    className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Settings
                  </button>

                  {/* Import Settings */}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={importSettings}
                      id="import-settings"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <label
                      htmlFor="import-settings"
                      className="flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors font-medium cursor-pointer"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                      Import Settings
                    </label>
                  </div>

                  {/* Reset Settings */}
                  <button
                    onClick={resetSettings}
                    className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset Settings
                  </button>
                </div>

                <div className="mt-4 p-4 bg-gray-750 border border-gray-600 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-200 mb-2">How to use:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• <strong>Export:</strong> Save your current settings as a JSON file</li>
                    <li>• <strong>Import:</strong> Load settings from a previously exported JSON file</li>
                    <li>• <strong>Reset:</strong> Restore all settings to their default values</li>
                  </ul>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
