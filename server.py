#!/usr/bin/env python3
"""
Simple HTTP Server for PWA with SPA routing support
Serves index.html for all navigation requests (not found routes)
"""

import http.server
import socketserver
import os
from pathlib import Path

PORT = 8000


class SPAHandler(http.server.SimpleHTTPRequestHandler):
    """
    Custom HTTP handler that serves index.html for SPA routes
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.path.dirname(os.path.abspath(__file__)), **kwargs)

    def do_GET(self):
        # Get the file path
        path = self.translate_path(self.path)

        # If the path is a file and it exists, serve it normally
        if os.path.isfile(path):
            return super().do_GET()

        # If the path is a directory with an index.html, serve it normally
        if os.path.isdir(path):
            index_path = os.path.join(path, 'index.html')
            if os.path.exists(index_path):
                return super().do_GET()

        # For all other paths (SPA routes like /explore, /settings, etc.)
        # Serve index.html to let the client-side router handle it
        if not self.path.startswith('/assets/') and \
           not self.path.startswith('/css/') and \
           not self.path.startswith('/js/') and \
           not self.path.endswith(('.json', '.png', '.jpg', '.svg', '.ico', '.html', '.css', '.js')):

            # Rewrite the path to index.html
            self.path = '/index.html'
            print(f"[SPA Router] Serving index.html for route: {self.path}")

        return super().do_GET()

    def end_headers(self):
        # Add CORS headers for development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

        # Cache control for service worker
        if self.path.endswith('sw.js'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Service-Worker-Allowed', '/')

        super().end_headers()


if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
        print(f"✓ PWA Development Server running at http://localhost:{PORT}")
        print(f"✓ SPA routing enabled - all routes will serve index.html")
        print(f"✓ Press Ctrl+C to stop the server\n")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n✓ Server stopped")
            httpd.shutdown()
