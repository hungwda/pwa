# Development Server Guide

This PWA uses client-side routing (SPA - Single Page Application). To handle routes like `/explore`, `/settings`, etc., you need a server that serves `index.html` for all navigation requests.

## Quick Start

### Option 1: Python Server (Recommended)

```bash
python3 server.py
```

Or make it executable and run directly:
```bash
chmod +x server.py
./server.py
```

### Option 2: Node.js Server

```bash
node server.js
```

Or use npm scripts:
```bash
npm start
```

## Why Do I Need This?

Standard HTTP servers (like `python -m http.server`) return a **404 error** when you try to access routes like `/explore` or `/settings` directly or refresh the page on those routes.

This happens because:
1. The browser makes an HTTP request to `/explore`
2. The server looks for a file at `/explore` (which doesn't exist)
3. The server returns 404

Our custom server solves this by:
1. Serving `index.html` for all navigation requests
2. Letting the client-side JavaScript router handle the route
3. Still serving static assets (CSS, JS, images) normally

## How It Works

```
User navigates to /settings
    ↓
Server serves index.html (200 OK)
    ↓
index.html loads app.js and navigation.js
    ↓
Client-side router detects /settings route
    ↓
Settings page content is rendered
```

## Testing SPA Routing

1. Start the server (Python or Node.js)
2. Open http://localhost:8000
3. Navigate to any page (Explore, Favorites, Settings)
4. Refresh the page (F5 or Ctrl+R)
5. ✅ Page should load correctly without 404

## Testing Offline Support

1. Open DevTools (F12)
2. Go to Application → Service Workers
3. Check "Offline" mode
4. Navigate between pages
5. Refresh on any page
6. ✅ Everything should work offline

## Production Deployment

For production, configure your server:

### Nginx
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Apache (.htaccess)
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

### Netlify (_redirects)
```
/*    /index.html   200
```

### Vercel (vercel.json)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

See DEPLOYMENT.md for more deployment options.
