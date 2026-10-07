import http.server
import os
import sys

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        url_path = self.path.split('?')[0].split('#')[0]
        if url_path != '/':
            rel_path = url_path.lstrip('/')
            file_path = os.path.join(DIRECTORY, rel_path)
            if not os.path.exists(file_path) and os.path.exists(file_path + '.html'):
                query = ('?' + self.path.split('?', 1)[1]) if '?' in self.path else ''
                self.path = url_path + '.html' + query
        return super().do_GET()

if __name__ == '__main__':
    server_address = ('', PORT)
    httpd = http.server.ThreadingHTTPServer(server_address, CleanURLHandler)
    print(f"AttendTa Server running on http://localhost:{PORT}", flush=True)
    httpd.serve_forever()
