import puppeteer from 'puppeteer-core';
import fs from 'fs';

const BASE = process.env.NEW_BASE || 'https://main--eds-stagwell--dmccntadobe-ctrl.aem.page';
const EDGE = process.env.BROWSER || (fs.existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
  ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Microsoft/Edge/Application/msedge.exe');
const pages = ['', 'about-us', 'our-network', 'meetmark'];
const widths = [2560, 1920, 1564, 1414, 1300, 1240, 1200, 1024, 768, 390];

const detect = () => {
  const items = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    const t = n.textContent.replace(/\s+/g, ' ').trim();
    if (t.length < 2) continue;
    const el = n.parentElement;
    if (!el || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || Number(cs.opacity) === 0) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    [...range.getClientRects()].forEach((r) => {
      if (r.width < 3 || r.height < 3) return;
      // skip content clipped away by overflow containers (e.g. off-screen slides)
      let clipped = false;
      for (let p = el; p && p !== document.body; p = p.parentElement) {
        const o = getComputedStyle(p);
        if (['auto', 'scroll', 'hidden'].includes(o.overflowX)) {
          const pr = p.getBoundingClientRect();
          if (r.right < pr.left + 1 || r.left > pr.right - 1) { clipped = true; break; }
        }
      }
      if (clipped) return;
      items.push({ t: t.slice(0, 30), el, x: r.left, y: r.top + scrollY, w: r.width, h: r.height });
    });
  }
  const hits = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      const a = items[i]; const b = items[j];
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
      const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox > 3 && oy > 4 && ox * oy > 40) hits.push(`"${a.t}" <-> "${b.t}" @y${Math.round(Math.max(a.y, b.y))} (${Math.round(ox)}x${Math.round(oy)})`);
    }
  }
  const overflow = document.documentElement.scrollWidth > window.innerWidth + 1 ? document.documentElement.scrollWidth : 0;
  return { hits: [...new Set(hits)].slice(0, 12), overflow };
};

const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new' });
for (const path of pages) {
  for (const w of widths) {
    const p = await browser.newPage();
    await p.setViewport({ width: w, height: 900 });
    await p.goto(`${BASE}/${path}`, { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1500));
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } window.scrollTo(0, 0); });
    const r = await p.evaluate(detect);
    if (r.hits.length || r.overflow) console.log(`/${path} @${w}${r.overflow ? ` [horizontal overflow ${r.overflow}px]` : ''}\n  ${r.hits.join('\n  ')}`);
    await p.close();
  }
}
await browser.close();
console.log('done');
