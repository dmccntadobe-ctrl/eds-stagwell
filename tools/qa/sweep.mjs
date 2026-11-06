import puppeteer from 'puppeteer-core';
import fs from 'fs';
const BASE = process.env.NEW_BASE;
const EDGE = process.env.BROWSER || (fs.existsSync('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe')
  ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' : 'C:/Program Files/Microsoft/Edge/Application/msedge.exe');
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new' });
for (const w of [1000, 1100, 1200, 1300, 1414, 1564, 1700, 1920, 2200, 2560]) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: 900 });
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 90000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1200));
  const r = await p.evaluate(() => {
    const q = (s) => { const e = document.querySelector(s); if (!e) return 'none'; const b = e.getBoundingClientRect(); return `x${Math.round(b.left)} w${Math.round(b.width)}`; };
    const split = document.querySelector('main > .section.split');
    const kids = split ? [...split.children].map((c) => { const b = c.getBoundingClientRect(); return `${Math.round(b.left)}/${Math.round(b.width)}`; }).join(' ') : '';
    const sw = document.documentElement.scrollWidth;
    return `split kids ${kids} | footer wrapper ${q('footer .default-content-wrapper')} p1 ${q('footer .default-content-wrapper p:nth-child(1)')} p3 ${q('footer .default-content-wrapper p:nth-child(3)')} | scrollW ${sw}`;
  });
  console.log(w, r);
  await p.close();
}
await b.close();
