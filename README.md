# Twitch Chat Overlay

A modern, customizable Twitch chat overlay built with Next.js and TailwindCSS. Perfect for streamers who want to display chat messages with beautiful, customizable bubble designs during their streams.

## ✨ Features

- **Beautiful Chat Bubbles**: Modern bubble-style message display with username badges
- **Full Customization**: Customize colors, backgrounds, text shadows, and more for different user types
- **User Role Support**: Different styling for broadcasters, moderators, subscribers, VIPs, and regular users
- **Real-time Chat**: Live chat integration with Twitch using TMI.js
- **Emote Support**: Full support for Twitch, BetterTTV and 7TV emotes with proper sizing and scaling
- **Message Management**: Configurable message lifetime, limits, and user exclusion
- **Advanced Color Picker**: Photoshop-style color picker with HEX, RGB, HSL support
- **Settings Import/Export**: Save and share your overlay configurations
- **Static Export Ready**: Built for serverless deployment and static hosting
- **Responsive Design**: Works perfectly in OBS and other streaming software

## 🚀 Quick Start

### 1. Setup Twitch Application

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Create a new application with these settings:
   - **Name**: Your overlay name
   - **OAuth Redirect URLs**: `https://yourdomain.com/oauth/`
   - **Category**: Chat Bot or Other
3. Note down your **Client ID**

### 2. Configure the Application

Update the Client ID in `src/lib/constants.ts`:

```typescript
export const constants = {
  CLIENT_ID: "your_client_id_here",
  // ...other constants
};
```

### 3. Deploy

#### Option A: GitHub Pages (Recommended)
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Set source to "GitHub Actions"
4. Push your changes - the site will auto-deploy

#### Option B: Vercel/Netlify
1. Connect your repository to Vercel or Netlify
2. Set build command: `npm run build`
3. Set output directory: `out`
4. Deploy

### 4. Setup in OBS

1. Add a "Browser Source" in OBS
2. Set URL to: `https://yourdomain.com/oauth`
3. Configure your overlay settings
4. Copy the generated overlay URL
5. Update the Browser Source URL with your overlay URL
6. Set Width: 400, Height: 600
7. Check "Shutdown source when not visible"

## 🎨 Customization Options

### User Role Styling

Configure different appearances for:
- **Broadcasters/Streamers**: Special styling for the channel owner
- **Moderators**: Distinctive look for channel moderators  
- **Subscribers**: Custom styling for subscribers
- **VIPs**: Special appearance for VIP users
- **Default Users**: Standard styling for regular viewers

### Color Customization

For each user role, customize:
- Username bubble background color
- Message bubble background color
- Username text color (separate from message text)
- Message text color (separate from username text)
- Username text shadow
- Message text shadow

### Advanced Settings

- **Message Lifetime**: How long messages stay visible (default: 90 seconds)
- **Message Limit**: Maximum number of messages on screen
- **User Exclusion**: Hide messages from specific users (useful for bots)
- **Command Filtering**: Hide messages starting with "!" 
- **Auto-scroll**: Automatically scroll to latest messages

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/twitch-chat-overlay.git
cd twitch-chat-overlay

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
# Build static export
npm run build

# The output will be in the 'out' directory
```

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main chat overlay page
│   └── oauth/
│       └── page.tsx       # OAuth setup and configuration
├── components/
│   ├── BubblePreview.tsx  # Color preview component
│   ├── ChatMessage.tsx    # Individual chat message component  
│   ├── ChatOverlay.tsx    # Main overlay logic
│   └── ColorPicker.tsx    # Advanced color picker
├── lib/
│   ├── constants.ts       # App configuration and defaults
│   └── twitch.ts         # Twitch API integration
├── types/
│   └── index.ts          # TypeScript type definitions
└── utils/
    └── index.ts          # Utility functions
```

## 🔧 Configuration

### Environment Variables

No environment variables required! All configuration is done through the web interface and stored in URL parameters.

### TMI.js Integration

The overlay uses TMI.js for Twitch chat connection. The library is included statically for serverless compatibility.

### Message Processing

- **Emote Handling**: Automatic emote replacement with proper sizing
- **Emote-only Messages**: Special handling for emote-only messages with larger display
- **Message Filtering**: Commands and excluded users are filtered automatically
- **Duplicate Prevention**: Built-in duplicate message detection

## 📱 Usage in Streaming Software

### OBS Studio
1. Add "Browser Source"
2. Use your overlay URL
3. Set dimensions to 400x600
4. Enable "Shutdown source when not visible"

### Streamlabs OBS
1. Add "Custom Widget"
2. Paste your overlay URL
3. Adjust size as needed

### XSplit
1. Add "Web page" source
2. Enter your overlay URL
3. Configure size and position

## 🎯 Tips for Best Results

### Performance
- Use message limits to prevent memory issues during long streams
- Enable "Shutdown source when not visible" in OBS
- Consider shorter message lifetimes for busy chats

### Visual Design
- Test colors with different backgrounds
- Use text shadows for better readability
- Preview different user types before going live
- Export settings as backup before major changes

### Chat Management
- Add bots to exclusion list to reduce clutter
- Use command filtering if you use many bot commands
- Adjust message lifetime based on chat activity

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow existing code style and conventions
2. Test changes thoroughly with real Twitch chat
3. Update documentation for new features
4. Ensure static export compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMI.js](https://github.com/tmijs/tmi.js) - Twitch chat client
- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Twitch API](https://dev.twitch.tv/) - Chat integration

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/twitch-chat-overlay/issues) page
2. Create a new issue with detailed information
3. Include browser console logs if applicable

---

**Happy Streaming!** 🎮✨
