#!/usr/bin/env node
/**
 * Simple HTTP Server for PWA with SPA routing support
 * Serves index.html for all navigation requests (not found routes)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const ROOT_DIR = __dirname;

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  // Parse URL and remove query params
  let filePath = req.url.split('?')[0];

  // Decode URI
  filePath = decodeURIComponent(filePath);

  // Default to index.html
  if (filePath === '/') {
    filePath = '/index.html';
  }

  const fullPath = path.join(ROOT_DIR, filePath);
  const ext = path.extname(filePath).toLowerCase();

  // Check if file exists
  fs.stat(fullPath, (err, stats) => {
    if (!err && stats.isFile()) {
      // File exists, serve it
      serveFile(fullPath, ext, res);
    } else {
      // File doesn't exist
      // For SPA routes (not static assets), serve index.html
      if (!ext || ext === '.html') {
        console.log(`[SPA Router] Serving index.html for route: ${filePath}`);
        serveFile(path.join(ROOT_DIR, 'index.html'), '.html', res);
      } else {
        // For static assets that don't exist, return 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
    }
  });
});

function serveFile(filePath, ext, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }

    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    const headers = {
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Service worker should not be cached
    if (filePath.endsWith('sw.js')) {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
      headers['Service-Worker-Allowed'] = '/';
    }

    res.writeHead(200, headers);
    res.end(data);
  });
}

server.listen(PORT, () => {
  console.log(`✓ PWA Development Server running at http://localhost:${PORT}`);
  console.log(`✓ SPA routing enabled - all routes will serve index.html`);
  console.log(`✓ Press Ctrl+C to stop the server\n`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n✓ Server stopped');
  process.exit(0);
});
