"""One-shot localhost redirect so a login URL is opened without ever being printed.

Usage: python3 -I launch-redirect.py <ISSUE-KEY>
The directory is the same one screen-dir.mjs creates:
  ~/.agents/capture-screen/<ISSUE-KEY>/s.json
That file holds {"launchUrls": {"local": "<url>"}} and is deleted once the port is bound
and the URL is read, so a busy port keeps the session.
Then open http://127.0.0.1:9777/ in the browser tab; the server redirects once and exits.
Do not run this and shoot.mjs against the same s.json.
"""
import json, os, re, sys, http.server

key = sys.argv[1] if len(sys.argv) > 1 else ''
if not re.fullmatch(r'[A-Za-z][A-Za-z0-9]+-\d+', key):
    sys.exit('Pass the issue key, for example PROJ-123. This script chooses the directory.')
d = os.path.join(os.path.expanduser('~'), '.agents', 'capture-screen', key)
session_path = os.path.join(d, 's.json')
if not os.path.exists(session_path):
    sys.exit('No s.json in ' + d + '. Run the session helper first.')


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(302)
        self.send_header('Location', self.server.url)
        self.end_headers()
        self.server.done = True

    def log_message(self, *args):
        pass


# Bind first: if 9777 is busy this exits with s.json untouched.
server = http.server.HTTPServer(('127.0.0.1', 9777), Handler)
with open(session_path, encoding='utf-8') as f:
    text = f.read()
server.url = json.loads(re.search(r'\{.*\}', text, re.S).group(0))['launchUrls']['local']
os.remove(session_path)
server.done = False
while not server.done:
    server.handle_request()
