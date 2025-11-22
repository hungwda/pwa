#!/usr/bin/env python3
"""
Simple HTTP server for PWA with SPA routing support.
Serves index.html for all routes that don't match static files.
"""

import http.server
import socketserver
import os
from urllib.parse import urlparse, unquote

PORT = 8000


class SPAHandler(http.server.SimpleHTTPRequestHandler):
    """Custom handler that serves index.html for SPA routes"""

    def do_GET(self):
        """Handle GET requests with SPA routing support"""
        # Parse the URL
        parsed_path = urlparse(self.path)
        path = unquote(parsed_path.path)

        # Remove leading slash
        if path.startswith('/'):
            path = path[1:]

        # If path is empty, serve index.html
        if not path:
            path = 'index.html'

        # Full path to the file
        full_path = os.path.join(os.getcwd(), path)

        # Check if the file exists
        if os.path.exists(full_path) and os.path.isfile(full_path):
            # File exists, serve it normally
            super().do_GET()
        else:
            # File doesn't exist, check if it's a directory
            if os.path.exists(full_path) and os.path.isdir(full_path):
                # Try to serve index.html from that directory
                index_path = os.path.join(full_path, 'index.html')
                if os.path.exists(index_path):
                    super().do_GET()
                else:
                    # No index.html in directory, serve root index.html for SPA routing
                    self.path = '/index.html'
                    super().do_GET()
            else:
                # Not a file or directory, serve index.html for SPA routing
                self.path = '/index.html'
                super().do_GET()

    def end_headers(self):
        """Add custom headers"""
        # Prevent caching for service worker
        if self.path.endswith('/sw.js'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')

        # Add MIME type for manifest
        if self.path.endswith('/manifest.json'):
            self.send_header('Content-Type', 'application/manifest+json')

        super().end_headers()

    def log_message(self, format, *args):
        """Custom log message with colors"""
        print(f"[{self.log_date_time_string()}] {format % args}")


def run_server():
    """Start the HTTP server"""
    with socketserver.TCPServer(("", PORT), SPAHandler) as httpd:
        print(f"╔═══════════════════════════════════════════════╗")
        print(f"║   PWA Development Server                      ║")
        print(f"╠═══════════════════════════════════════════════╣")
        print(f"║   Server running at: http://localhost:{PORT}   ║")
        print(f"║   Press Ctrl+C to stop the server             ║")
        print(f"╚═══════════════════════════════════════════════╝")
        print()
        print("The server now supports SPA routing!")
        print("You can refresh any route (e.g., /settings) without errors.")
        print()

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nShutting down server...")
            httpd.shutdown()


if __name__ == "__main__":
    run_server()
