import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function prerender() {
  console.log('====================================================');
  console.log('    PORTFOLIO STATIC PRERENDER & METADATA INJECTION ');
  console.log('====================================================\n');

  const templatePath = path.resolve(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error(`Error: Base template not found at ${templatePath}. Run vite build first.`);
    process.exit(1);
  }

  const baseTemplate = fs.readFileSync(templatePath, 'utf-8');

  // Start temporary Vite SSR instance
  const vite = await createServer({
    root: rootDir,
    server: { middlewareMode: true },
    appType: 'custom'
  });

  const { default: App } = await vite.ssrLoadModule('/src/App.jsx');
  const { services } = await vite.ssrLoadModule('/src/data/projects.js');

  const routes = [
    {
      route: '/',
      title: 'Charles Naveen — Freelance Web Developer | Websites for Businesses & Agencies',
      description:
        'Websites built to turn business attention into enquiries. Charles Naveen designs and develops modern, responsive websites for businesses and provides dependable development.'
    },
    {
      route: '/work',
      title: 'Selected Work & Demonstrations — Charles Naveen | Freelance Web Developer',
      description:
        'A curated index of production client engineering and bespoke concept demonstrations. Engineered with custom React, modern typography, and responsive craftsmanship.'
    },
    {
      route: '/services',
      title: 'Services & Capabilities — Charles Naveen | Freelance Web Developer',
      description:
        'Explore web development services: business websites, landing pages, e-commerce stores, mobile applications, and custom feature integrations.'
    },
    {
      route: '/contact',
      title: 'Contact & Start a Project — Charles Naveen | Freelance Web Developer',
      description:
        'Direct communication channels, interactive scope blueprint, and prompt developer turnaround for businesses.'
    },
    ...services.map((s) => ({
      route: s.slug,
      title: s.metaTitle || `${s.title} — Charles Naveen | Freelance Web Developer`,
      description:
        s.metaDescription ||
        `Professional ${s.title.toLowerCase()} services engineered for performance, conversion, and clean craftsmanship.`
    }))
  ];

  console.log(`Prerendering ${routes.length} static routes for full crawler indexability...\n`);

  for (const item of routes) {
    const { route, title, description } = item;
    const url = `https://charlesportfolio-self.vercel.app${route === '/' ? '' : route}`;

    // 1. Render React tree for this route
    const appHtml = renderToString(React.createElement(App, { initialRoute: route }));

    // 2. Inject rendered HTML into root
    let html = baseTemplate.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    // 3. Inject route-specific metadata
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
    html = html.replace(/<meta\s+name="title"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="title" content="${escapeHtml(title)}" />`);
    html = html.replace(/<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(description)}" />`);
    html = html.replace(/<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/?>/i, `<link rel="canonical" href="${url}" />`);

    html = html.replace(/<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(title)}" />`);
    html = html.replace(/<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(description)}" />`);
    html = html.replace(/<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:url" content="${url}" />`);

    html = html.replace(/<meta\s+property="twitter:title"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="twitter:title" content="${escapeHtml(title)}" />`);
    html = html.replace(/<meta\s+property="twitter:description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="twitter:description" content="${escapeHtml(description)}" />`);
    html = html.replace(/<meta\s+property="twitter:url"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="twitter:url" content="${url}" />`);

    // 4. Save destination HTML file
    let destPath;
    if (route === '/') {
      destPath = path.resolve(distDir, 'index.html');
    } else {
      const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
      const routeDir = path.resolve(distDir, cleanRoute);
      fs.mkdirSync(routeDir, { recursive: true });
      destPath = path.resolve(routeDir, 'index.html');
    }

    fs.writeFileSync(destPath, html, 'utf-8');
    const relDest = path.relative(rootDir, destPath);
    console.log(`✓ ${route.padEnd(36)} -> ${relDest} (${(html.length / 1024).toFixed(1)} KB)`);
  }

  await vite.close();
  console.log('\nPrerendering complete! All routes now contain full static HTML content.');
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
