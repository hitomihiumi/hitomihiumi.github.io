# Twitch Chat Overlay

A modern, customizable Twitch chat overlay built with Next.js and TailwindCSS. Perfect for streamers who want to display chat messages with beautiful, customizable bubble designs during their streams.

## ✨ Features

- **Visual editor** (`/editor/`): design every bubble with drag'n'drop — move name/role tags, drop stickers, emoji, images and lines onto the bubble, resize and rotate them, reorder layers, undo/redo
- **Bubble designer**: rounded / notched / slanted shapes, solid & gradient fills, background images, gradient borders, offset back layer, shadows, glow / shine / pulse / float effects
- **Per-role styles**: broadcaster, moderator, VIP, subscriber, first-time chatter, highlighted / channel-point messages and viewers — or fall back to the viewer style
- **In-chat alerts**: new subs, resubs, gift subs, cheers and raids with their own bubble designs and text templates
- **Themes**: ready-made presets (Lavender Bloom, Forest Axolotl, Bunny Pink, Night Sky, Classic, Minimal) to start from
- **Fonts**: any Google Font per element, uppercase / letter spacing / text shadows
- **Name tag extras**: avatars, Twitch badges, pronouns (pronouns.alejo.io), viewer name colors
- **Emotes**: Twitch, BetterTTV and 7TV
- **Live preview**: simulated chat, gallery of all styles, demo link for OBS
- **Portable**: the whole design is compressed into the overlay URL; export/import as JSON; old overlay links keep working
- **Static export**: runs on GitHub Pages, no server needed

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

### 4. Design and add to OBS

1. Open `https://yourdomain.com/editor/`
2. Pick a theme and customize the bubbles (select a style on the left, drag elements on the canvas, tweak properties on the right)
3. Click **Get OBS link** → **Connect with Twitch**
4. Copy the overlay link and add it as a **Browser Source** in OBS (e.g. 500×800)

The design is kept in your browser, so you can come back to the editor at any time and copy a fresh link.
Paste an existing overlay link into *Backup & import* to continue editing it.

## 🎨 Editor

| Area | What it does |
| --- | --- |
| Left: styles | Chat message styles per role and alert styles per event |
| Left: Elements | Name tag, role tag and decorations — click to select, drag to reorder |
| Left: + Decorations | Stickers, emoji, lines and images — drag onto the bubble or the name tag |
| Canvas | Drag tags & decorations (snaps to edges/center, hold Alt to disable), resize/rotate handles |
| Right: inspector | Every property of the selected element |
| ⚙ Settings | Lifetime, limit, hidden users, !commands, stacking, alignment, font, scale, animations |

Shortcuts: `Ctrl+Z` / `Ctrl+Shift+Z` undo/redo, `Del` delete, `Ctrl+D` duplicate, arrows nudge (Shift = larger steps), `Esc` select the bubble.

Event templates support `{name}`, `{amount}`, `{months}`, `{tier}` and `{recipient}`.

### Overlay URL parameters

| Parameter | Meaning |
| --- | --- |
| `channel`, `oauth` | Channel and token (added by the editor) |
| `cfg` | Compressed design (added by the editor) |
| `preset` | Use a built-in theme instead of `cfg` (e.g. `preset=night`) |
| `demo=1` | Show fake messages instead of connecting to Twitch |

Links from the previous version (`lifetime`, `limit`, `exclude`, `nocommand`, `alignment`, `<role>MessageBg`, …) are still understood.

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
├── app/
│   ├── page.tsx              # The overlay (OBS browser source)
│   ├── editor/page.tsx       # Visual editor
│   └── oauth/page.tsx        # Twitch OAuth redirect → editor
├── components/
│   ├── bubble/Bubble.tsx     # Renders one bubble from a style (shared by overlay & editor)
│   ├── feed/ChatFeed.tsx     # Message list, lifetime/limit, enter/leave animations
│   ├── overlay/ChatOverlay.tsx  # Twitch connection and event handling
│   └── editor/               # Editor UI: canvas (drag'n'drop), inspector, palette, export
├── lib/
│   ├── config/               # Defaults, themes, URL (de)serialization
│   ├── stickers.tsx          # Built-in vector stickers
│   ├── parse.ts              # Message → text / emote / mention tokens
│   ├── emotes.ts, pronouns.ts, fonts.ts, twitch.ts, constants.ts
└── types/
    ├── index.ts              # Twitch API types
    └── overlay.ts            # Overlay design model
```

## 🔧 Configuration

### Environment Variables

No environment variables required! All configuration is done through the web interface and stored in URL parameters.

### TMI.js Integration

The overlay uses TMI.js for Twitch chat connection. The library is included statically for serverless compatibility.

### Message Processing

- **Emote Handling**: Automatic emote replacement with proper sizing
- **Message Filtering**: Commands and excluded users are filtered automatically
- **Duplicate Prevention**: Built-in duplicate message detection

## 📱 Usage in Streaming Software

### OBS Studio
1. Add "Browser Source"
2. Use your overlay URL
3. Set dimensions to e.g. 500x800
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
- Check your design on different backgrounds (canvas background buttons in the editor)
- Use text shadows for better readability
- Use the *All styles* and *Live preview* tabs before going live
- Export the design as JSON before major changes

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
