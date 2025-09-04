import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const PORT = process.env.PORT || 8080;
const DIST = normalize(join(process.cwd(), 'dist'));

const MIME = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.map': 'application/octet-stream',
  '.txt': 'text/plain; charset=UTF-8',
  '.wasm': 'application/wasm',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

const sendFile = (res, path) => {
  const type = MIME[extname(path).toLowerCase()] || 'application/octet-stream';
  res.statusCode = 200;
  res.setHeader('Content-Type', type);
  createReadStream(path).pipe(res);
};

const serve = async (req, res) => {
  try {
    const url = (req.url || '/').split('?')[0];
    // Prevent path traversal
    const safePath = normalize(url).replace(/^\/+/, '');
    let filePath = join(DIST, safePath);

    let s;
    try {
      s = await stat(filePath);
    } catch {}

    if (!s) {
      // If not found and no extension, try adding .html (for pre-rendered routes)
      if (!extname(filePath)) {
        const withHtml = filePath + '.html';
        try {
          await stat(withHtml);
          filePath = withHtml;
          return sendFile(res, filePath);
        } catch {}
      }
      // SPA fallback to index.html
      const indexPath = join(DIST, 'index.html');
      try {
        await stat(indexPath);
        return sendFile(res, indexPath);
      } catch {
        res.statusCode = 404;
        res.end('Not Found');
        return;
      }
    }

    if (s.isDirectory()) {
      const indexPath = join(filePath, 'index.html');
      try {
        await stat(indexPath);
        return sendFile(res, indexPath);
      } catch {
        res.statusCode = 403;
        res.end('Forbidden');
        return;
      }
    }

    return sendFile(res, filePath);
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
    res.end('Internal Server Error');
  }
};

createServer(serve).listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[static] serving dist on http://localhost:${PORT}`);
});

