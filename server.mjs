import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const routes = new Map([['/','index.html'],['/about','about.html'],['/collections','collections.html'],['/womens-fashion','womens-fashion.html'],['/mens-fashion','mens-fashion.html'],['/new-arrivals','new-arrivals.html'],['/gallery','gallery.html'],['/contact','contact.html']]);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/sitemap.xml') {
      const origin = (process.env.SITE_URL || `http://${req.headers.host || 'localhost:5173'}`).replace(/\/$/, '');
      const urls = [...routes.keys()].map(path => `<url><loc>${origin}${path === '/' ? '/' : path}</loc></url>`).join('');
      res.writeHead(200, { 'Content-Type': types['.xml'] });
      res.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`);
      return;
    }
    if (pathname === '/robots.txt') {
      const origin = (process.env.SITE_URL || `http://${req.headers.host || 'localhost:5173'}`).replace(/\/$/, '');
      res.writeHead(200, { 'Content-Type': types['.txt'] });
      res.end(`User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`);
      return;
    }
    const cleanPath = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
    const routeFile = routes.get(cleanPath);
    const staticResource = cleanPath.startsWith('/images/') || ['/styles.css','/site.js','/404.html'].includes(cleanPath);
    const relativePath = routeFile || (cleanPath.startsWith('/images/') ? `public${cleanPath}` : cleanPath.slice(1));
    let file = resolve(join(root, relativePath || '404.html'));
    if (file !== root && !file.startsWith(`${root}/`)) throw new Error('Invalid path');
    if (!routeFile && !staticResource) file = resolve(join(root, '404.html'));
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    const status = routeFile || staticResource ? 200 : 404;
    res.writeHead(status, { 'Content-Type': types[extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});
const port = Number(process.env.PORT || 5173);
server.listen(port, '127.0.0.1', () => console.log(`Gauri Glow Care running at http://localhost:${port}`));
