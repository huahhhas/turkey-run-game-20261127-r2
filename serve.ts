// Serves game/ on http://localhost:8080 for local play-testing.
// Run: node serve.ts   (Node 22, standard library only)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const gameDir = join(here, 'game');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg' };

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    const file = await readFile(join(gameDir, path));
    res.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(file);
  } catch {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(8080, () => console.log('Gobble Dash at http://localhost:8080'));
