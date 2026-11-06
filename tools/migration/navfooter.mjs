import fs from 'fs'; import crypto from 'crypto'; import * as cheerio from 'cheerio';
const BASE = 'https://content.da.live/dmccntadobe-ctrl/eds-stagwell/media/stagwell';
const extMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif' };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const t = (s) => s.replace(/\s+/g, ' ').trim();
function save($el) {
  const m = /^data:(image\/[a-z+\-]+);base64,(.*)$/.exec($el.attr('src') || '');
  if (!m) return '';
  const buf = Buffer.from(m[2], 'base64');
  const name = `${crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12)}.${extMap[m[1]]}`;
  fs.mkdirSync('media', { recursive: true });
  fs.writeFileSync(`media/${name}`, buf);
  return `${BASE}/${name}`;
}
const $ = cheerio.load(fs.readFileSync(`${(process.env.SRC_DIR || './source').replace(/[\/]?$/, '/')}Stagwell _ Meet Mark - Stagwell.html`, 'utf8'));
const link = (a) => `<a href="${a.attr('href')}">${esc(t(a.text()))}</a>`;

const logo = save($('header .header__logo img').first());
const items = [];
$('header #menu-main-navigation > li').each((i, li) => {
  const $li = $(li);
  const top = $li.children('a').first();
  const subs = $li.find('ul.sub-menu > li > a').toArray().map((a) => `<li>${link($(a))}</li>`).join('');
  if (subs) items.push(`<li><p>${esc(t(top.text()))}</p><ul>${subs}</ul></li>`);
  else items.push(`<li>${link(top)}</li>`);
});
const nav = `<body><header></header><main><div><p><a href="/"><img src="${logo}" alt="Stagwell"></a></p></div><div><ul>${items.join('')}</ul></div></main><footer></footer></body>`;
fs.writeFileSync('content/nav.html', nav);

const f = $('footer');
const flogo = save(f.find('.logo__link img').first());
const socials = f.find('a.footer__socials-link').toArray().map((a) => {
  const href = $(a).attr('href');
  const name = /linkedin/.test(href) ? 'LinkedIn' : /twitter/.test(href) ? 'X' : 'Instagram';
  return `<a href="${href}"><img src="${save($(a).find('img').first())}" alt="${name}"></a>`;
}).join(' ');
const flinks = f.find('ul.nav-footer__list a').toArray().map((a) => link($(a))).join(' ');
const foot = `<body><header></header><main><div><p><img src="${flogo}" alt="Stagwell"></p><p>${socials}</p><p>${flinks}</p><p>Stagwell Global | Copyright © ${new Date().getFullYear()}</p></div></main><footer></footer></body>`;
fs.writeFileSync('content/footer.html', foot);
console.log(items.length, 'nav items; logos', logo.slice(-20), flogo.slice(-20));
