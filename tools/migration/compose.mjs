import fs from 'fs';
import * as cheerio from 'cheerio';

const EM = {
  'Transforming Marketing': 'Transforming <em>Marketing</em>',
  'Creative+Connected= Effective': 'Creative+ Connected= <em>Effective</em>',
  'Our Capabilities': 'Our <em>Capabilities</em>',
  'The Challenger Marketing Network': 'The Challenger <em>Marketing Network</em>',
  'Latest News': 'Latest <em>News</em>',
  'Investing in Stagwell': 'Investing in <em>Stagwell</em>',
  'About Stagwell': 'About <em>Stagwell</em>',
  'Our Network': 'Our <em>Network</em>',
  'Meet Mark Penn': 'Meet <em>Mark Penn</em>',
  'Our Story': 'Our <em>Story</em>',
  'Our Executive Leadership': 'Our Executive <em>Leadership</em>',
  'Our Agencies & Affiliates': 'Our Agencies <em>& Affiliates</em>',
  'Work With Us': 'Work <em>With Us</em>',
  'Contact Us': 'Contact <em>Us</em>',
  'Newsletter Sign Up': 'Newsletter <em>Sign Up</em>',
  'Leadership Highlights': 'Leadership <em>Highlights</em>',
  "Mark's Point of View": "Mark's <em>Point of View</em>",
};
const emify = (html) => html.replace(/<(h[12])>((?:[^<]|<br>)*)<\/\1>/g, (m, tag, txt) => {
  const key = txt.replace(/<br>/g, '').replace(/&amp;/g, '&').trim();
  return EM[key] ? `<${tag}>${EM[key].replace(/&/g, (x, i, s) => (s.slice(i, i + 5) === '&amp;' ? x : '&amp;'))}</${tag}>` : m;
});

const meta = (style) => (style ? `<div class="section-metadata"><div><div>Style</div><div>${style.split(' ').join(', ')}</div></div></div>` : '');
const sec = (style, html) => `<div>${html}${meta(style)}</div>`;
const block = (name, rows) => `<div class="${name}">${rows.map((r) => `<div>${r.map((c) => `<div>${c}</div>`).join('')}</div>`).join('')}</div>`;
const load = (f) => cheerio.load(fs.readFileSync(`content/${f}.html`, 'utf8'));
const secs = ($) => $('main > div').toArray().map((e) => cheerio.load($(e).html(), null, false));
const hh = ($s, sel) => $s(sel).first().html() || '';
const pageMeta = ($) => $('main > div').last().html();
const labelPairs = (arr) => arr.map(([l, v]) => `<p><strong>${l}</strong></p><p>${v}</p>`).join('');

function contact(heading, intro, pairs, single = false) {
  if (single) {
    return sec('contact', block('columns contact single', [[`<h2>${heading}</h2>`, `<p>${intro}</p>${labelPairs(pairs)}`]]));
  }
  // pairs: [[label, valueHtml]]
  const idx = pairs.findIndex(([l]) => /^PHONE$/i.test(l));
  const left = idx > 0 ? pairs.slice(0, idx) : pairs;
  const right = idx > 0 ? pairs.slice(idx) : [];
  const phoneIdx = right.findIndex(([l]) => /ADDRESS/i.test(l));
  const phone = phoneIdx > 0 ? right.slice(0, phoneIdx) : right;
  const addr = phoneIdx > 0 ? right.slice(phoneIdx) : [];
  const rows = [[`<h2>${heading}</h2>`, `<p>${intro}</p>`], [labelPairs(left), labelPairs(phone), labelPairs(addr)]];
  return sec('contact', block('columns contact', rows));
}
function pairsFrom($s, startSel) {
  const out = []; let label = null;
  $s(startSel).each((i, el) => {
    const tx = $s(el).text().replace(/\s+/g, ' ').trim();
    if (!tx) return;
    if ($s(el).is('p') && /^[A-Z][A-Z &]+$/.test(tx)) { label = tx; return; }
    if (label) { out.push([label, $s(el).html().trim()]); label = null; }
  });
  return out;
}
const mailto = (m) => `<a href="mailto:${m}">${m}</a>`;
const newsletter = () => sec('teal', `<h2>Newsletter Sign Up</h2>${block('newsletter', [['<p>Newsletter sign-up form</p>']])}`);
const newsItems = JSON.parse(fs.readFileSync('newsitems.json', 'utf8'));
const escA = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const news = () => sec('', `<h2>Latest News</h2>${block('news', newsItems.map((n) => [`<p><img src="${n.i}" alt=""></p>`, `<p>${n.d}</p><p><a href="${n.u}">${escA(n.t)}</a></p>`]))}<p><strong><a href="https://www.stagwellglobal.com/news/">News &amp; Insights</a></strong></p>`);
const metaBlock = (html) => `<div>${html}</div>`;

function statsOf($s) {
  const rows = [];
  $s('.stats > div').each((i, r) => rows.push([$s(r).children().eq(0).html(), $s(r).children().eq(1).html()]));
  $s('h4').each((i, h) => { const l = $s(h).next('h5'); if (l.length) rows.push([`<p><strong>${$s(h).text()}</strong></p>`, `<p>${l.text()}</p>`]); });
  return rows;
}
const intro = ($s) => `${emify($s.html($s('h1').first()) || '')}`;

const pages = {};

// ---------- HOME ----------
{
  const $ = load('index'); const S = secs($);
  const heroHtml = $.html($('main > div').eq(0));
  const logo = `<img src="${process.env.MEDIA_BASE}/36f5e67cc6e9.webp" alt="Stagwell">`;
  const out = [];
  out.push(sec('', block('hero', [[`<p>${logo}</p>`, '<p><a href="https://edge.media-server.com/mmc/p/qudoyxam">Watch Stagwell’s Q3 2026 Earnings Call HERE</a></p><h1>Transforming Marketing</h1>']])));
  out.push(sec('statement', block('columns statement', [[`<h2>${hh(S[1], 'h2')}</h2>`, `${S[1]('p').toArray().map((p) => S[1].html(p)).join('')}`]])));
  out.push(sec('features', S[2].html()));
  out.push(sec('full', S[3].html()));
  out.push(sec('split', S[4].html()));
  out.push(news());
  out.push(sec('navy split', S[6].html()));
  out.push(metaBlock(pageMeta($)));
  pages.index = out;
}

// ---------- ABOUT ----------
{
  const $ = load('about-us'); const S = secs($); const out = [];
  out.push(sec('intro', S[0].html()));
  out.push(sec('', S[1].html().replace('class="columns"', 'class="columns story"')));
  out.push(sec('band', block('columns band', [[`<h4>${hh(S[2], 'h4')}</h4>`, `<p>${hh(S[2], 'p')}</p>`]])));
  const quote = S[3].root().children('p').last().text();
  const ppl = cheerio.load(S[3].html(S[3]('.people')), null, false);
  const rows = ppl('.people > div').toArray().map((r) => [ppl(r).children().eq(0).html(), ppl(r).children().eq(1).html()]);
  rows[0][1] = `<p>${quote}</p>${rows[0][1]}`;
  out.push(sec('', `<h2>${hh(S[3], 'h2')}</h2>${block('people', rows)}`));
  out.push(sec('full', S[4].html()));
  const st = statsOf(S[5]);
  out.push(sec('split', `${S[5].html(S[5]('h2'))}${S[5].html(S[5]('p').slice(0, 1))}${S[5].html(S[5]('p').slice(1, 2))}${block('stats', st)}`));
  out.push(sec('', S[6].html().replace('class="columns"', 'class="columns story"')));
  const c = S[7];
  out.push(contact('Contact Us', 'Want to get in touch?<br>Send us a message and we’ll get right back to you.', pairsFrom(c, 'p').map(([l, v]) => [l, /@/.test(v) ? mailto(v.replace(/<[^>]*>/g, '').trim()) : v])));
  out.push(newsletter());
  out.push(metaBlock(pageMeta($)));
  pages['about-us'] = out;
}

// ---------- NETWORK ----------
{
  const $ = load('our-network'); const S = secs($); const out = [];
  out.push(sec('intro', S[0].html()));
  out.push(sec('', `<h2>Our Agencies &amp; Affiliates</h2>${S[2].html(S[2]('.agencies'))}`));
  out.push(news());
  const email = S[4]('h5').text().trim();
  out.push(contact('Work With Us', 'Interested in partnering with us?<br>Send us a message and we’ll get the ball rolling.', [['EMAIL', mailto(email.toLowerCase())]], true));
  out.push(newsletter());
  out.push(metaBlock(pageMeta($)));
  pages['our-network'] = out;
}

// ---------- MEET MARK ----------
{
  const $ = load('meetmark'); const S = secs($); const out = [];
  const c0 = S[0]; const cols = c0('.columns > div > div');
  const left = cheerio.load(`<div>${c0.html(cols.eq(0).contents())}</div>`, null, false);
  const lines = left('h3').first().text().split('–').map((x) => x.trim()).filter(Boolean).map((x) => `<h3>– ${x}</h3>`).join('');
  const leftHtml = `${left.html(left('h1'))}${left.html(left('h4'))}${lines}${left.html(left('p').filter((i, e) => left(e).find('a').length))}`;
  out.push(sec('sky', block('columns sky', [[leftHtml, c0.html(cols.eq(1).contents())]])));
  out.push(sec('light', block('columns highlights', [[`<h2>${hh(S[1], 'h2')}</h2>`, `${S[1].html(S[1]('ul'))}${S[1].html(S[1]('p'))}`]])));
  out.push(sec('full', S[2].html()));
  out.push(sec('teal', S[3].html().replace('The OutsiderBrands', 'The Outsider').replace('class="columns"', 'class="columns outsider"')));
  const c = S[4];
  out.push(contact('Contact Us', 'Want to connect with Mark?<br>Send us a message and we’ll get right back to you.', pairsFrom(c, 'p').map(([l, v]) => [l, /@/.test(v) ? mailto(v.replace(/<[^>]*>/g, '').trim()) : v])));
  out.push(newsletter());
  out.push(metaBlock(pageMeta($)));
  pages.meetmark = out;
}

for (const [name, out] of Object.entries(pages)) {
  // keep the metadata block inside the last content section so it does not add an empty section
  const metaSec = out.pop();
  const lastSec = out.pop();
  out.push(lastSec.replace(/<\/div>$/, `${metaSec.replace(/^<div>/, '').replace(/<\/div>$/, '')}</div>`));
  const html = emify(`<body><header></header><main>${out.join('')}</main><footer></footer></body>`);
  fs.writeFileSync(`final/${name}.html`, html);
  console.log(name, out.length, 'sections', html.length);
}
