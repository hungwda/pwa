# Modern PWA Template

A fast, reliable, and engaging Progressive Web App with comprehensive offline support, designed with modern best practices.

## ✨ Features

### Core Functionality
- ⚡ **Fast**: Loads in under 5 seconds with optimized performance
- 📡 **Offline Support**: Full offline functionality with smart caching
- 🔄 **Reliable**: Works on low-quality networks with graceful degradation
- 📱 **Responsive**: Adapts seamlessly to all devices and screen sizes
- 🔒 **Secure**: Served over HTTPS (required for PWA)

### User Experience
- 🎯 **App-like Feel**: Standalone display mode without browser chrome
- 📲 **Installable**: Easy installation with custom install prompts
- 🧭 **Simple Navigation**: Intuitive bottom navigation for mobile
- 👋 **Onboarding**: Clear first-time user experience with skip option
- 👆 **Touch Feedback**: Responsive touch interactions
- 🔗 **Shareable**: Built-in share functionality with Web Share API

### Technical Features
- 📄 **Manifest File**: Complete PWA manifest with app metadata
- 🖼️ **Icons**: Full icon set (72px to 512px)
- 🔐 **HTTPS Ready**: Security-first architecture
- 🔍 **SEO Optimized**: Discoverable by search engines
- 🎨 **Skeleton Screens**: Improved perceived performance
- 🔔 **Push Notifications**: Support for engagement (optional)
- ⚙️ **Service Worker**: Advanced caching strategies

## 🏗️ Architecture

```
pwa/
├── index.html              # App shell with semantic HTML
├── manifest.json           # PWA manifest configuration
├── sw.js                   # Service worker with caching
├── offline.html            # Offline fallback page
├── css/
│   ├── main.css           # Core styles with CSS variables
│   ├── skeleton.css       # Loading placeholders
│   ├── modal.css          # Modal and onboarding styles
│   └── responsive.css     # Mobile-first responsive design
├── js/
│   ├── app.js             # Main application logic
│   ├── modules/
│   │   ├── install.js     # Install prompt handling
│   │   ├── onboarding.js  # User onboarding flow
│   │   ├── navigation.js  # App navigation & routing
│   │   └── share.js       # Web Share API integration
│   └── utils/
│       └── helpers.js     # Utility functions
└── assets/
    ├── icons/             # PWA icons (all sizes)
    └── screenshots/       # App screenshots
```

## 🚀 Quick Start

### 1. Clone or Download

```bash
git clone <repository-url>
cd pwa
```

### 2. Generate Icons

```bash
# Make sure ImageMagick is installed
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Generate all icon sizes from SVG
./generate-icons.sh
```

### 3. Customize

1. **Update manifest.json**:
   - Change app name and description
   - Update theme colors
   - Set your app's URL

2. **Replace icon.svg**:
   - Design your own icon
   - Run `./generate-icons.sh` to regenerate PNGs

3. **Customize colors**:
   - Edit CSS variables in `css/main.css`
   - Update theme-color in `index.html` and `manifest.json`

4. **Update metadata**:
   - SEO tags in `index.html`
   - App name in various files
   - Author information

### 4. Test Locally

#### Option 1: Using Custom Python Server (Recommended for SPA Routing)

```bash
# Run the included server with SPA routing support
python3 server.py
```

This server properly handles client-side routing, so you can refresh on any route (like `/settings`) without getting a 404 error.

#### Option 2: Using Python Simple HTTP Server

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Note**: This doesn't support SPA routing - refreshing on routes like `/settings` will show a 404.

#### Option 3: Using Node.js

```bash
# Install http-server globally
npm install -g http-server

# Run server with SPA support
http-server -p 8000 --proxy http://localhost:8000?
```

#### Option 4: Using PHP

```bash
php -S localhost:8000
```

**Note**: PHP's built-in server doesn't support SPA routing out of the box.

Visit `http://localhost:8000` in your browser.

> **Note**: Service workers require HTTPS in production. Use localhost for development.
>
> **SPA Routing**: If you need to refresh pages on client-side routes (like `/settings`, `/explore`, etc.), use the custom Python server (`server.py`) or configure your server to redirect all routes to `index.html`.

### 5. Test PWA Features

1. **Open Chrome DevTools**:
   - Application tab → Manifest
   - Check manifest loads correctly
   - Verify icons are present

2. **Run Lighthouse Audit**:
   - DevTools → Lighthouse
   - Select "Progressive Web App"
   - Run audit and fix any issues

3. **Test Offline**:
   - Open the app
   - DevTools → Network → Offline
   - Reload the page (should work offline)

4. **Test Installation**:
   - Look for install prompt
   - Install the app
   - Verify standalone mode works

## 📦 Deployment

### Deploy to HTTPS

PWAs **must** be served over HTTPS (except localhost). Choose a hosting option:

### Option 1: Netlify (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

Or drag and drop your folder at [netlify.com/drop](https://app.netlify.com/drop)

### Option 2: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Option 3: GitHub Pages

```bash
# Enable GitHub Pages in repository settings
# Choose branch and folder
# Access via https://username.github.io/repository
```

### Option 4: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize
firebase init hosting

# Deploy
firebase deploy
```

### Option 5: Cloudflare Pages

- Connect your repository at [pages.cloudflare.com](https://pages.cloudflare.com)
- Auto-deploys on git push

## 🔧 Configuration

### Service Worker Caching Strategy

Edit `sw.js` to customize caching:

```javascript
// Cache-first: Try cache, fallback to network
// Good for: Static assets, images, fonts

// Network-first: Try network, fallback to cache
// Good for: API calls, dynamic content

// Customize PRECACHE_ASSETS array for files to cache on install
```

### Manifest Options

Edit `manifest.json`:

- `name`: Full app name
- `short_name`: Short name (12 chars max)
- `description`: App description
- `theme_color`: Browser UI color
- `background_color`: Splash screen background
- `display`: "standalone", "fullscreen", or "minimal-ui"
- `orientation`: "portrait" or "landscape"

### Analytics Integration

Add your analytics in `js/modules/*.js`:

```javascript
// Example: Google Analytics
function trackEvent(eventName, params) {
  gtag('event', eventName, params);
}
```

## 🎨 Customization

### Colors

Edit CSS variables in `css/main.css`:

```css
:root {
  --primary-color: #2196F3;
  --primary-dark: #1976D2;
  --accent-color: #FF5722;
  /* ... more variables */
}
```

### Typography

```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...;
  --font-size-base: 16px;
  /* ... more sizes */
}
```

### Layout

The app uses CSS Grid and Flexbox for responsive layouts. Breakpoints:

- Mobile: < 576px
- Tablet: 576px - 768px
- Desktop: 768px - 992px
- Large: 992px+

## 📊 Performance Optimization

### Best Practices Implemented

1. **Critical CSS Inline**: Consider inlining critical CSS
2. **Lazy Loading**: Implement for images and routes
3. **Code Splitting**: Split JS bundles for faster loads
4. **Image Optimization**: Use WebP, optimize sizes
5. **Minification**: Minify HTML, CSS, JS for production
6. **Compression**: Enable gzip/brotli on server

### Recommended Tools

```bash
# Minify CSS
npm install -g clean-css-cli
cleancss -o css/main.min.css css/main.css

# Minify JS
npm install -g terser
terser js/app.js -o js/app.min.js -c -m

# Optimize images
npm install -g imagemin-cli
imagemin assets/icons/*.png --out-dir=assets/icons-optimized
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] App loads in < 5 seconds
- [ ] Works offline after first visit
- [ ] Install prompt appears
- [ ] App installs successfully
- [ ] Standalone mode works
- [ ] Navigation works correctly
- [ ] Share button works
- [ ] Responsive on all devices
- [ ] Works on slow 3G
- [ ] Accessible (keyboard, screen readers)

### Automated Testing

```bash
# Run Lighthouse CI
npm install -g @lhci/cli
lhci autorun

# Run PWA audit
npx pwmetrics http://localhost:8000
```

## 🌐 Browser Support

- ✅ Chrome 67+
- ✅ Edge 79+
- ✅ Firefox 82+
- ✅ Safari 11.1+ (partial)
- ✅ Opera 54+
- ✅ Samsung Internet 8.2+

### Progressive Enhancement

The app works on all browsers with graceful degradation:
- Older browsers: Regular website
- Modern browsers: Full PWA features

## 📱 Platform-Specific Features

### iOS

- Add to home screen support
- Status bar customization
- Safe area insets for notched devices

### Android

- Install prompts
- Maskable icons support
- Custom splash screens
- App shortcuts

## 🔐 Security

- Served over HTTPS
- Content Security Policy headers (recommended)
- No inline scripts (uses external JS)
- Secure service worker scope
- Input sanitization in helpers.js

## 🐛 Troubleshooting

### Service Worker Not Registering

1. Check HTTPS (or localhost)
2. Check browser console for errors
3. Clear cache and hard reload
4. Check sw.js path is correct

### Install Prompt Not Showing

1. Manifest must be valid
2. Service worker must be registered
3. HTTPS required
4. Icons must be correct sizes
5. User must visit site at least twice

### Offline Not Working

1. Visit site while online first
2. Check service worker is active
3. Verify cache strategy in sw.js
4. Check DevTools → Application → Service Workers

### Icons Not Displaying

1. Generate icons: `./generate-icons.sh`
2. Check file paths in manifest.json
3. Verify icon sizes are correct
4. Clear browser cache

## 📚 Resources

### Documentation

- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)

### Tools

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox](https://developers.google.com/web/tools/workbox) - Advanced service worker library

### Communities

- [PWA Discord](https://aka.ms/pwadiscord)
- [Web.dev Community](https://web.dev/community/)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with modern web standards and best practices from:
- Google Web.dev team
- MDN Web Docs
- PWA community

## 📞 Support

- Issues: [GitHub Issues](https://github.com/yourusername/pwa/issues)
- Discussions: [GitHub Discussions](https://github.com/yourusername/pwa/discussions)

---

**Made with ❤️ for the modern web**
