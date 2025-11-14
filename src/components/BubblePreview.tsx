'use client';

interface BubblePreviewProps {
  userType: 'broadcaster' | 'mod' | 'subscriber' | 'vip' | 'default';
  usernameBgColor?: string;
  messageBgColor?: string;
  usernameTextColor?: string;
  messageTextColor?: string;
  usernameTextShadowColor?: string;
  messageTextShadowColor?: string;
  username?: string;
  message?: string;
}

export default function BubblePreview({
  userType,
  usernameBgColor,
  messageBgColor,
  usernameTextColor,
  messageTextColor,
  usernameTextShadowColor,
  messageTextShadowColor,
  username = 'TestUser',
  message = 'This is a test message'
}: BubblePreviewProps) {
  const getDefaultColors = () => {
    switch (userType) {
      case 'broadcaster':
        return {
          usernameBg: '#f3ebe8',
          messageBg: '#fa95cd',
          usernameText: '#fa95cd',
          messageText: '#f3ebe8',
          usernameTextShadow: '#ffffff',
          messageTextShadow: '#494949'
        };
      case 'mod':
        return {
          usernameBg: '#fffbfb',
          messageBg: '#a6608d',
          usernameText: '#a6608d',
          messageText: '#fffbfb',
          usernameTextShadow: '#ffffff',
          messageTextShadow: '#3b3b3b'
        };
      case 'subscriber':
        return {
          usernameBg: '#a6608d',
          messageBg: '#f3ebe8',
          usernameText: '#f3ebe8',
          messageText: '#a6608d',
          usernameTextShadow: '#000000',
          messageTextShadow: '#6c6c6c'
        };
      case 'vip':
        return {
          usernameBg: '#a6608d',
          messageBg: '#f3ebe8',
          usernameText: '#f3ebe8',
          messageText: '#a6608d',
          usernameTextShadow: '#000000',
          messageTextShadow: '#6c6c6c'
        };
      default:
        return {
          usernameBg: '#f990c8',
          messageBg: '#ffffff',
          usernameText: '#ffffff',
          messageText: '#f990c8',
          usernameTextShadow: '#000000',
          messageTextShadow: '#4d4d4d'
        };
    }
  };

  const colors = getDefaultColors();

  return (
    <div className="chat-message-container font-(family-name:--font-playpen)" style={{ maxWidth: '300px', margin: '16px auto' }}>
      {/* Username bubble */}
      <div
        className="username-bubble"
        style={{
          background: usernameBgColor || colors.usernameBg,
          color: usernameTextColor || colors.usernameText,
          position: 'relative',
          zIndex: 10,
          padding: '6px 12px',
          borderRadius: '15px',
          fontSize: '0.75rem',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
          marginBottom: '-12px',
          textShadow: usernameTextShadowColor ? `1px 1px 1px ${usernameTextShadowColor}` : `1px 1px 1px ${colors.usernameTextShadow}`
        }}
      >
        {/* Placeholder avatar */}
        <div
          className="h-5 w-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold"
          style={{ flexShrink: 0 }}
        >
          {username.charAt(0).toUpperCase()}
        </div>
        <span>{username}</span>
      </div>

      {/* Message bubble */}
      <div
        className="message-bubble"
        style={{
          background: messageBgColor || colors.messageBg,
          color: messageTextColor || colors.messageText,
          position: 'relative',
          zIndex: 5,
          padding: '20px 20px 12px 20px',
          borderRadius: '20px',
          fontSize: '0.9rem',
          lineHeight: 1.4,
          wordWrap: 'break-word',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          width: '100%',
          textAlign: 'center',
          minWidth: '18rem',
          maxWidth: '18rem',
          textShadow: messageTextShadowColor ? `1px 1px 1px ${messageTextShadowColor}` : `1px 1px 1px ${colors.messageTextShadow}`
        }}
      >
        {message}
      </div>
    </div>
  );
}
