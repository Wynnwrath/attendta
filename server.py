"""
AttendTa v2 - Local Development & Evaluation Web Server
Serves all AttendTa v2 pages, clean URL routing, and static assets.
Zero external pip dependencies required - runs on standard Python 3.
"""

import http.server
import os
import sys

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class AttendTaServerHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        # Redirect root to v2 portal
        if self.path in ('/', '/v2', '/v2/'):
            self.send_response(302)
            self.send_header('Location', '/v2/index.html')
            self.end_headers()
            return

        # Support clean URLs (e.g. /v2/kiosk -> /v2/kiosk/index.html or .html)
        url_path = self.path.split('?')[0].split('#')[0]
        rel_path = url_path.lstrip('/')
        full_path = os.path.join(BASE_DIR, rel_path)

        query = ('?' + self.path.split('?', 1)[1]) if '?' in self.path else ''

        if not os.path.exists(full_path):
            if os.path.exists(full_path + '.html'):
                self.path = url_path + '.html' + query
            elif os.path.isdir(full_path) and os.path.exists(os.path.join(full_path, 'index.html')):
                self.path = url_path.rstrip('/') + '/index.html' + query

        return super().do_GET()

def run_server(port=PORT):
    server_address = ('', port)
    try:
        httpd = http.server.ThreadingHTTPServer(server_address, AttendTaServerHandler)
        print("=" * 65)
        print(f"🚀 AttendTa v2 Server is LIVE at: http://localhost:{port}")
        print(f"📂 Serving root: {BASE_DIR}")
        print("=" * 65)
        print(f"• Portal Gateway:     http://localhost:{port}/v2/index.html")
        print(f"• Student Portal:     http://localhost:{port}/v2/student/events.html")
        print(f"• QR Passes:          http://localhost:{port}/v2/student/passes.html")
        print(f"• Attendance Kiosk:   http://localhost:{port}/v2/kiosk/index.html")
        print(f"• Officers & Roles:   http://localhost:{port}/v2/admin/users.html")
        print("=" * 65)
        print("Press Ctrl+C to terminate server.\n")
        httpd.serve_forever()
    except OSError as e:
        if "Address already in use" in str(e) or getattr(e, 'winerror', None) == 10048:
            print(f"⚠️ Port {port} is already in use by another instance. Exiting.")
        else:
            raise

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(port)
