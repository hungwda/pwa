# PWA Deployment Guide

Complete guide to deploying your Progressive Web App to production.

## 📋 Pre-Deployment Checklist

### 1. Required Files

- [ ] `index.html` - Main app shell
- [ ] `manifest.json` - PWA manifest
- [ ] `sw.js` - Service worker
- [ ] All CSS files in `/css`
- [ ] All JS files in `/js`
- [ ] All icons in `/assets/icons` (at least 192x192 and 512x512)
- [ ] `offline.html` - Offline fallback page

### 2. Configuration Updates

- [ ] Update app name in `manifest.json`
- [ ] Update app description in `manifest.json`
- [ ] Set correct `start_url` in `manifest.json`
- [ ] Update `theme_color` and `background_color`
- [ ] Replace placeholder icons with your branded icons
- [ ] Update meta tags in `index.html`
- [ ] Set correct canonical URL
- [ ] Update Open Graph and Twitter Card tags

### 3. Testing

- [ ] Lighthouse PWA audit score > 90
- [ ] Works offline after first visit
- [ ] Install prompt appears and works
- [ ] App installs successfully
- [ ] Runs in standalone mode
- [ ] All icons load correctly
- [ ] No console errors
- [ ] Responsive on all devices
- [ ] Fast load time (< 5 seconds)
- [ ] Works on slow 3G network

### 4. Optimization

- [ ] Minify HTML, CSS, and JavaScript
- [ ] Optimize images (WebP, correct sizes)
- [ ] Enable compression (gzip/brotli)
- [ ] Set appropriate cache headers
- [ ] Remove console.log statements
- [ ] Update service worker cache version

## 🚀 Deployment Options

### Option 1: Netlify (Recommended for Beginners)

**Pros**: Free, automatic HTTPS, continuous deployment, edge CDN
**Best for**: Static sites, easy setup

#### Method A: Drag & Drop

1. Visit [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag your project folder
3. Done! Your app is live with HTTPS

#### Method B: Git Integration

1. Push code to GitHub/GitLab/Bitbucket
2. Sign in to [netlify.com](https://www.netlify.com)
3. Click "New site from Git"
4. Select repository
5. Build settings:
   - Build command: (leave empty for static sites)
   - Publish directory: `/` or `./`
6. Deploy!

#### Method C: Netlify CLI

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize (first time)
netlify init

# Deploy
netlify deploy --prod
```

#### Custom Domain on Netlify

1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records at your registrar
4. Netlify auto-provisions SSL certificate

---

### Option 2: Vercel (Best for Developers)

**Pros**: Fast deployments, preview URLs, serverless functions
**Best for**: Projects needing API routes

#### Deploy with Vercel

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Or via GitHub

1. Visit [vercel.com](https://vercel.com)
2. Import from Git repository
3. Configure and deploy
4. Auto-deploys on push

#### Configuration (vercel.json)

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/sw.js",
      "headers": {
        "cache-control": "public, max-age=0, must-revalidate",
        "service-worker-allowed": "/"
      }
    }
  ]
}
```

---

### Option 3: GitHub Pages (Free & Simple)

**Pros**: Free, integrated with GitHub
**Cons**: Public repos only for free tier

#### Setup

1. Push code to GitHub repository
2. Go to Settings → Pages
3. Source: Select branch (usually `main`)
4. Folder: `/` (root)
5. Save

Access at: `https://username.github.io/repository-name`

#### Custom Domain

1. Add CNAME file with your domain:
   ```
   example.com
   ```
2. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: username.github.io
   ```
3. Enable HTTPS in GitHub Pages settings

---

### Option 4: Firebase Hosting

**Pros**: Google infrastructure, great performance, free tier
**Best for**: Apps using Firebase services

#### Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting
```

Answer prompts:
- Public directory: `.` or `./`
- Single-page app: Yes
- Rewrites: Configure if needed

#### Deploy

```bash
firebase deploy --only hosting
```

#### firebase.json Configuration

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

---

### Option 5: Cloudflare Pages

**Pros**: Global CDN, fast, DDoS protection, free
**Best for**: High-traffic sites

#### Deploy via Git

1. Visit [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub/GitLab account
3. Select repository
4. Configure:
   - Build command: (leave empty)
   - Build output: `/`
5. Deploy

#### Deploy via CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Initialize
wrangler pages project create pwa

# Deploy
wrangler pages publish . --project-name=pwa
```

---

### Option 6: AWS S3 + CloudFront

**Pros**: Scalable, customizable, enterprise-ready
**Cons**: More complex setup

#### Steps

1. **Create S3 Bucket**:
   - Name: your-pwa-bucket
   - Enable static website hosting
   - Set index document: `index.html`

2. **Upload Files**:
   ```bash
   aws s3 sync . s3://your-pwa-bucket --exclude ".git/*"
   ```

3. **Create CloudFront Distribution**:
   - Origin: S3 bucket
   - Enable HTTPS
   - Set default root object: `index.html`

4. **Configure Headers** (via Lambda@Edge):
   ```javascript
   exports.handler = (event, context, callback) => {
     const response = event.Records[0].cf.response;
     const headers = response.headers;

     headers['cache-control'] = [{
       key: 'Cache-Control',
       value: 'max-age=31536000'
     }];

     callback(null, response);
   };
   ```

---

## 🔧 Post-Deployment Configuration

### 1. Update Service Worker Cache Version

After deployment, increment cache version in `sw.js`:

```javascript
const CACHE_VERSION = 'v1.0.1'; // Increment this
```

### 2. Configure HTTP Headers

Add these headers on your server:

```
# Cache static assets
Cache-Control: public, max-age=31536000, immutable
(for: *.js, *.css, *.png, *.jpg, *.svg, *.woff2)

# Don't cache service worker
Cache-Control: no-cache
(for: sw.js)

# Don't cache HTML
Cache-Control: no-cache
(for: *.html)

# Security headers
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### 3. Enable Compression

Enable gzip or brotli compression:

#### Netlify (_headers file)

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block

/sw.js
  Cache-Control: no-cache

/*.js
  Cache-Control: public, max-age=31536000

/*.css
  Cache-Control: public, max-age=31536000
```

#### Nginx

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 4. Set Up Custom Domain

1. Purchase domain (Namecheap, GoDaddy, Google Domains)
2. Add DNS records at your registrar
3. Configure SSL certificate (usually automatic)

### 5. Configure Redirects

Ensure HTTPS redirect:

#### Netlify (netlify.toml)

```toml
[[redirects]]
  from = "http://example.com/*"
  to = "https://example.com/:splat"
  status = 301
  force = true
```

## 📊 Monitoring & Analytics

### 1. Add Analytics

#### Google Analytics 4

Add to `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### 2. Monitor Performance

- [Google Search Console](https://search.google.com/search-console)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)

### 3. Error Tracking

Consider adding:
- [Sentry](https://sentry.io)
- [Bugsnag](https://www.bugsnag.com)
- [Rollbar](https://rollbar.com)

## 🔄 Continuous Deployment

### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy PWA

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: '.'
        production-deploy: true
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## ✅ Verification

After deployment:

1. **Test PWA Score**:
   ```bash
   npx lighthouse https://your-app.com --view
   ```

2. **Check HTTPS**:
   - Visit https://your-app.com
   - Look for padlock icon
   - Check certificate is valid

3. **Test Installation**:
   - Visit site on mobile
   - Click "Add to Home Screen"
   - Open from home screen
   - Verify standalone mode

4. **Test Offline**:
   - Open app
   - Turn off network
   - Reload page
   - Should work offline

5. **Check Service Worker**:
   - DevTools → Application → Service Workers
   - Should show "activated and running"

## 🐛 Common Issues

### Service Worker Not Updating

**Solution**: Clear cache and hard reload, or update cache version

### Install Prompt Not Showing

**Solution**: Check Lighthouse report for PWA requirements

### HTTPS Not Working

**Solution**: Verify DNS records, wait for SSL provisioning (up to 24 hours)

### Icons Not Loading

**Solution**: Check paths in manifest.json, verify files exist

## 📱 App Store Distribution (Optional)

### PWABuilder

1. Visit [pwabuilder.com](https://www.pwabuilder.com)
2. Enter your PWA URL
3. Download packages for:
   - Google Play Store
   - Microsoft Store
   - iOS App Store (via App Store wrapper)

## 🎉 Launch Checklist

- [ ] App deployed and accessible via HTTPS
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Lighthouse PWA score > 90
- [ ] Tested on multiple devices
- [ ] Analytics configured
- [ ] Error tracking set up
- [ ] Monitoring in place
- [ ] Documentation updated
- [ ] Team notified

---

**Your PWA is now live! 🚀**

Share it with the world and monitor its performance.
