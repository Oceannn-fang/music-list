import http.server
import socketserver
import os

PORT = 5173

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

os.chdir(r'C:\Users\86185\.openclaw\workspace\dist')

with socketserver.TCPServer(("127.0.0.1", PORT), MyHTTPRequestHandler) as httpd:
    print(f"Server running at http://127.0.0.1:{PORT}/")
    httpd.serve_forever()
