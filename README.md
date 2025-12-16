# 🎬 Multi-Platform Video Downloader

A modern, web-based video downloader that supports multiple social media platforms with a beautiful animated interface.

![Multi-Platform Video Downloader](https://img.shields.io/badge/Platform-Multi--Platform-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🌐 Supported Platforms
- **YouTube** - Multiple format selection (MP3, 144p-1080p)
- **TikTok** - Direct video downloads
- **Instagram** - Photos and videos (including carousels)
- **Facebook** - Video content
- **RedNote (小红书)** - Social media content

### 🎵 YouTube Features
- **Audio Downloads**: MP3 format (128kbps)
- **Video Quality Options**: 144p, 240p, 360p, 480p, 720p, 1080p
- **Format Selection UI**: Interactive quality picker
- **Fast Processing**: Powered by NekoLabs API

### 🎨 Modern UI/UX
- **Animated Interface**: Smooth transitions and effects
- **Glass Morphism Design**: Modern frosted glass effects
- **Particle Animations**: Dynamic background particles
- **Responsive Design**: Works on desktop and mobile
- **Real-time Feedback**: Loading animations and progress indicators
- **Error Handling**: User-friendly error messages with suggestions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/multi-platform-video-downloader.git
cd multi-platform-video-downloader
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the server**
```bash
npm start
```

4. **Open your browser**
Navigate to `http://localhost:3000`

## 📖 Usage

### Basic Usage
1. Select your platform (YouTube, TikTok, Instagram, etc.)
2. Paste the video URL
3. Click "Download Now"
4. For YouTube: Choose your preferred format/quality
5. Download your video!

### YouTube Format Selection
When downloading from YouTube, you'll see format options:
- 🎵 **MP3 Audio** (128kbps) - Audio only
- 📱 **144p/240p** - Low quality (mobile)
- 💻 **360p/480p** - Medium quality (standard)
- 🖥️ **720p/1080p** - High quality (HD/Full HD)

### Supported URL Formats

#### YouTube
```
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
```

#### TikTok
```
https://www.tiktok.com/@username/video/VIDEO_ID
https://vm.tiktok.com/SHORT_ID
```

#### Instagram
```
https://www.instagram.com/p/POST_ID/
https://www.instagram.com/reel/REEL_ID/
```

#### Facebook
```
https://www.facebook.com/watch/?v=VIDEO_ID
https://fb.watch/VIDEO_ID
```

#### RedNote (小红书)
```
https://www.xiaohongshu.com/discovery/item/ITEM_ID
```

## 🛠️ API Endpoints

### Download Video
```http
POST /download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "platform": "youtube",
  "format": "480" // Optional for YouTube
}
```

### Health Check
```http
GET /health
```

### API Information
```http
GET /api/info
```

## 🏗️ Project Structure

```
multi-platform-video-downloader/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML file
│   ├── script.js          # Frontend JavaScript
│   └── styles.css         # CSS styles
├── downloads/             # Downloaded files (auto-created)
├── server.js              # Main server file
├── start.js               # Server startup script
├── package.json           # Dependencies
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000                  # Server port (default: 3000)
NODE_ENV=production        # Environment mode
```

### Server Configuration
The server automatically:
- Finds available ports if 3000 is busy
- Creates downloads directory
- Handles CORS for frontend requests
- Provides error handling and logging

## 🌐 API Integration

This project uses **NekoLabs API** for video processing:
- **YouTube API**: `https://api.nekolabs.web.id/downloader/youtube/v1`
- **AIO API**: `https://api.nekolabs.web.id/downloader/aio/v1` (TikTok, Instagram, Facebook, RedNote)

## 📱 Frontend Features

### Animations & Effects
- **Particle System**: Dynamic floating particles
- **Glass Morphism**: Modern frosted glass design
- **Confetti Animation**: Success celebrations
- **Ripple Effects**: Interactive button feedback
- **Smooth Transitions**: CSS3 animations throughout

### Error Handling
- **Specific Error Messages**: Tailored messages for different error types
- **HTTP Status Codes**: Proper error code handling (400, 403, 404, 429, 503)
- **User Suggestions**: Helpful tips for resolving issues
- **Toast Notifications**: Non-intrusive status updates

## 🧪 Testing

### Run Tests
```bash
# Test all platforms
node test-all-platforms.js

# Test specific RedNote URL
node test-rednote-specific.js

# Test simple fallback system
node test-simple-fallback.js

# Test NekoLabs APIs
node test-nekolabs.js
```

### Manual Testing
1. Start the server: `npm start`
2. Open `http://localhost:3000`
3. Test different platform URLs
4. Verify format selection for YouTube
5. Check error handling with invalid URLs

## 🚨 Error Handling

The application provides comprehensive error handling:

### Client-Side Errors
- **Invalid URL Format**: Validates URL structure
- **Network Issues**: Handles connection problems
- **Timeout Errors**: Manages slow responses

### Server-Side Errors
- **API Failures**: Graceful fallback when external APIs fail
- **Rate Limiting**: Handles API rate limits
- **Service Unavailable**: Clean error messages when services are down

### Error Response Format
```json
{
  "success": false,
  "message": "Service temporarily unavailable",
  "platform": "youtube",
  "originalUrl": "https://...",
  "note": "Service temporarily unavailable",
  "suggestion": "Please try again in a few minutes"
}
```

## 🔒 Security & Privacy

- **No Data Storage**: Videos are not stored on the server
- **Direct Downloads**: Links directly from content providers
- **No User Tracking**: No analytics or user data collection
- **HTTPS Support**: Secure connections supported
- **Input Validation**: All inputs are validated and sanitized

## 🚀 Deployment

### Local Development
```bash
npm start
```

### Production Deployment

#### Using PM2
```bash
npm install -g pm2
pm2 start start.js --name "video-downloader"
pm2 startup
pm2 save
```

#### Using Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### Environment Setup
- Set `NODE_ENV=production`
- Configure reverse proxy (nginx/Apache)
- Set up SSL certificates
- Configure firewall rules

## 📊 Performance

### Optimization Features
- **Efficient API Calls**: Minimal external requests
- **Error Caching**: Prevents repeated failed requests
- **Responsive Design**: Optimized for all devices
- **Lazy Loading**: Resources loaded as needed

### Performance Metrics
- **Average Response Time**: 2-8 seconds (depending on video size)
- **Supported File Sizes**: Up to 2GB per video
- **Concurrent Users**: Handles multiple simultaneous downloads
- **Memory Usage**: ~50MB base memory footprint

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting



## 🙏 Acknowledgments

- **NekoLabs API** - For providing reliable video download APIs
- **Tailwind CSS** - For the utility-first CSS framework
- **Express.js** - For the robust web framework
- **Axios** - For HTTP client functionality

## 📞 Support

If you encounter any issues or have questions:

1. **Check the Issues**: Look for existing solutions
2. **Create an Issue**: Describe your problem with details
3. **Join Discussions**: Participate in community discussions

## 🔄 Changelog

### v1.0.0 (Latest)
- ✅ Multi-platform support (YouTube, TikTok, Instagram, Facebook, RedNote)
- ✅ YouTube format selection (MP3, 144p-1080p)
- ✅ Modern animated UI with glass morphism
- ✅ Comprehensive error handling
- ✅ Simple fallback system
- ✅ Real-time progress indicators
- ✅ Responsive design for all devices

## 🎯 Roadmap

### Upcoming Features
- [ ] Batch download support
- [ ] Download history
- [ ] Custom quality selection for all platforms
- [ ] Playlist support for YouTube
- [ ] Download progress tracking
- [ ] Mobile app version
- [ ] API rate limiting dashboard
- [ ] User preferences storage

---

**Made with ❤️ for the community**

*Enjoy downloading your favorite videos from multiple platforms with ease!*

# Multi-Platform Video Downloader

## Supported Platforms

- 🎵 **YouTube**: Multiple format support (MP3 audio + 144p to 1080p video)
- 🎵 **TikTok**: Direct video downloads
- 📸 **Instagram**: Photos and videos
- 📘 **Facebook**: Video content
- 🔴 **RedNote**: Social media content

## Features

- ✅ Format selection for YouTube (MP3, 144p-1080p)
- ✅ Direct downloads for social media platforms
- ✅ Modern animated UI with Tailwind CSS
- ✅ Error handling with clear messages
- ✅ Responsive design

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file (optional)
4. Start development server: `npm run dev`
5. Open `http://localhost:3000`

## Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the configuration
3. Deploy with one click

### Manual Deployment

```bash
npm install -g vercel
vercel --prod
```

## API Endpoints

- `POST /download` - Download video from supported platforms
- `GET /health` - Health check
- `GET /api/info` - API information

## Environment Variables

No environment variables required. The app works out of the box.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Deployment**: Vercel Serverless Functions

## License

MIT License