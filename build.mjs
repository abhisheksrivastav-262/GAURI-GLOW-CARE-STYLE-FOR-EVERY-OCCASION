import { cp, copyFile, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const output = resolve(root, 'dist');
const pages = [
  'index.html',
  'about.html',
  'collections.html',
  'womens-fashion.html',
  'mens-fashion.html',
  'new-arrivals.html',
  'gallery.html',
  'contact.html',
  '404.html',
  'styles.css',
  'site.js',
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of pages) {
  await cp(resolve(root, file), resolve(output, file));
}
const imageOutput = resolve(output, 'images');
await mkdir(imageOutput, { recursive: true });
for (const file of await readdir(resolve(root, 'public/images'))) {
  if (file.endsWith('.webp') || file === 'brand-round.png') {
    await copyFile(resolve(root, 'public/images', file), resolve(imageOutput, file));
  }
}

const siteUrl = (process.env.SITE_URL || 'https://gauri-glow-care.vercel.app').replace(/\/$/, '');
const routes = ['/', '/about', '/collections', '/womens-fashion', '/mens-fashion', '/new-arrivals', '/gallery', '/contact'];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${siteUrl}${route === '/' ? '/' : route}</loc></url>`).join('')}</urlset>`;
await writeFile(resolve(output, 'sitemap.xml'), sitemap);
await writeFile(resolve(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`);

console.log(`Built ${pages.length - 3} pages into ${output}`);
