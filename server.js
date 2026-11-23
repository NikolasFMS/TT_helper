const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
};

const BLOCKED_PATH = /^\/(server\.js|package(-lock)?\.json|bun\.lock|node_modules(\/|$)|\.)/i;

function resolveSafePath(baseDir, urlPath) {
  const normalized = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const fullPath = path.join(baseDir, normalized);
  if (!fullPath.startsWith(baseDir)) return null;
  return fullPath;
}

function sendFile(res, filePath, method) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache',
    });

    if (method === 'HEAD') {
      res.end();
      return;
    }

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500);
      }
      res.end();
    });
    stream.pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  let pathname = '/';
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
  } catch (_) {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  if (BLOCKED_PATH.test(pathname)) {
    res.writeHead(404);
    res.end();
    return;
  }

  const targetRel = pathname === '/' ? '/index.html' : pathname;

  const publicCandidate = resolveSafePath(PUBLIC_DIR, targetRel);
  if (publicCandidate && fs.existsSync(publicCandidate) && fs.statSync(publicCandidate).isFile()) {
    sendFile(res, publicCandidate, req.method);
    return;
  }

  const rootCandidate = resolveSafePath(ROOT_DIR, targetRel);
  if (rootCandidate && fs.existsSync(rootCandidate) && fs.statSync(rootCandidate).isFile()) {
    sendFile(res, rootCandidate, req.method);
    return;
  }

  // Fallback to index.html for SPA/subpath routes without file extension
  if (!path.extname(pathname)) {
    sendFile(res, path.join(ROOT_DIR, 'index.html'), req.method);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
