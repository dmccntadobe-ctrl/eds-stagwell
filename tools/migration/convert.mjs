import fs from 'fs'; import crypto from 'crypto'; import * as cheerio from 'cheerio';
const D = (process.env.SRC_DIR || './source').replace(/[\/]?$/, '/');
const pages = [
  ['Stagwell _ Transforming Marketing (1).html', 'index'],
  ['Stagwell _ About Us - Stagwell.html', 'about-us'],
  ['Stagwell _ Our Network - Stagwell.html', 'our-network'],
  ['Stagwell _ Meet Mark - Stagwell.html', 'meetmark']];
const MEDIA = process.env.MEDIA_BASE || '__MEDIA__';
const extMap = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif' };
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const t = (s) => s.replace(/[\u200b\s]+/g, ' ').trim();
function imgOf($el) {
  const src = $el.attr('src') || '';
  const m = /^data:(image\/[a-z+\-]+);base64,(.*)$/.exec(src);
  if (!m || !extMap[m[1]]) return '';
  const hash = crypto.createHash('sha1').update(Buffer.from(m[2], 'base64')).digest('hex').slice(0, 12);
  return `<img src="${MEDIA}/${hash}.${extMap[m[1]]}" alt="${esc(t($el.attr('alt') || ''))}">`;
}
const block = (name, rows) => `<div class="${name}">${rows.map((r) => `<div>${r.map((c) => `<div>${c}</div>`).join('')}</div>`).join('')}</div>`;
function inlineRaw($, $el) {
  let out = '';
  $el.contents().each((i, n) => {
    if (n.type === 'text') out += esc(n.data.replace(/[​\s]+/g, ' '));
    else if (n.tagName === 'br') out += '<br>';
    else if (n.tagName === 'b' || n.tagName === 'strong') out += `<strong>${inlineRaw($, $(n)).trim()}</strong> `;
    else if (n.tagName === 'a') out += `<a href="${$(n).attr('href')}">${inlineRaw($, $(n)).trim()}</a>`;
    else if (n.type === 'tag') out += inlineRaw($, $(n));
  });
  return out;
}
const inline = ($, $el) => inlineRaw($, $el).replace(/(<br>\s*){2,}/g, '<br>').replace(/^(\s|<br>)+|(\s|<br>)+$/g, '').replace(/\s+/g, ' ');
const SKIP_IMG = /Menu Icon|Menu Close/;

for (const [file, out] of pages) {
  const $ = cheerio.load(fs.readFileSync(D + file, 'utf8'));
  const title = t($('meta[property="og:title"]').attr('content') || $('title').text());
  const desc = t($('meta[name="description"]').attr('content') || '');
  const secs = []; let sawAgencies = false;
  $('main .et_pb_section').each((i, sec) => {
    const $s = $(sec); let h = '';
    if ($s.find('.stagwell-main-slider').length) {
      const $m = $s.find('.stagwell-main-slider');
      const ttl = t($m.find('.stagwell-main-slider__title').first().text());
      const $txt = $m.find('.stagwell-main-slider__text').first();
      const intro = $txt.find('p').toArray().map((p) => `<p>${esc(t($(p).text()))}</p>`).join('');
      const list = $txt.find('li').toArray().map((l) => `<li>${esc(t($(l).text()))}</li>`).join('');
      const rows = [[`<h2>${esc(ttl)}</h2>${intro}${list ? `<ul>${list}</ul>` : ''}`]];
      $m.find('.slick-slide:not(.slick-cloned) .stagwell-main-slider__info').each((j, inf) => {
        const $i = $(inf);
        const img = $i.parent().find('.stagwell-main-slider__image').first();
        rows.push([`<p><strong>${esc(t($i.find('.stagwell-main-slider__name').text()))}</strong></p><p>${esc(t($i.find('.stagwell-main-slider__text').text()))}</p>`, img.length ? imgOf(img) : '']);
      });
      h = block('showcase', rows);
    } else if ($s.find('.stw-people-slider-wrapper').length) {
      const rows = [];
      const feat = $s.find('img.image[alt="Mark Penn photo"]').first();
      if (feat.length) rows.push([imgOf(feat), '<p><a href="https://www.stagwellglobal.com/people/mark-penn/">Mark Penn</a></p><p>Chairman &amp; CEO, Stagwell</p>']);
      $s.find('a').filter((j, x) => $(x).find('.name').length && $(x).find('img.image').length).each((j, p) => {
        const $p = $(p); const a = $p;
        rows.push([imgOf($p.find('img.image').first()), `<p><a href="${a.attr('href')}">${esc(t($p.find('.name').text()))}</a></p><p>${esc(t($p.find('.position').text()))}</p>`]);
      });
      const hd = $s.find('h2').toArray().map((x) => t($(x).text())).join(' ');
      const quote = t($s.find('.quote').first().text());
      h = `<h2>${esc(hd)}</h2>${block('people', rows)}${quote ? `<p>${esc(quote)}</p>` : ''}`;
    } else if ($s.find('.stagwell-network-module').length) {
      if (sawAgencies) return;
      sawAgencies = true;
      const rows = []; const names = { 'network-agencies': 'Agencies', 'network-affiliates': 'Affiliates', 'network-products': 'The Marketing Cloud' };
      $s.find('.stagwell-network-module').each((j, m) => {
        const cat = names[$(m).attr('id')] || '';
        $(m).find('.network-item-name').each((k, a) => rows.push([cat, `<a href="${$(a).attr('href')}">${esc(t($(a).text()))}</a>`]));
      });
      h = block('agencies', rows);
    } else if (/^\s*Latest\s*News/i.test($s.find('h2').text().replace(/\s+/g, ' ')) || (/Latest/.test($s.find('h2').first().text()) && /News/.test($s.find('h2').eq(1).text()))) {
      h = '<h2>Latest News</h2><p><a href="https://www.stagwellglobal.com/news/">News &amp; Insights</a></p>';
    } else if (/Newsletter/.test($s.find('h2').text())) {
      h = '<h2>Newsletter Sign Up</h2><p><a href="https://www.stagwellglobal.com/">Sign up on stagwellglobal.com</a></p>';
    } else {
      const parts = [];
      $s.find('h1,h2,h3,h4,h5,p,ul,a.sw-btn__link,a.et_pb_button,img').each((j, el) => {
        const $e = $(el); if ($e.closest('.slick-cloned').length) return;
        const tag = el.tagName;
        if (tag === 'img') {
          if (SKIP_IMG.test($e.attr('alt') || '') || $e.closest('a.sw-btn__link').length || $e.closest('a').find('.et_pb_video_play').length) return;
          const im = imgOf($e); if (im) parts.push(`<p>${im}</p>`); return;
        }
        if (tag === 'ul') { if ($e.parents('ul').length) return; parts.push(`<ul>${$e.children('li').toArray().map((l) => `<li>${inline($, $(l))}</li>`).join('')}</ul>`); return; }
        if (tag === 'a') { parts.push(`<p><strong><a href="${$e.attr('href')}">${esc(t($e.text()))}</a></strong></p>`); return; }
        if ($e.parents('ul').length || (tag !== 'p' && $e.parents('p').length)) return;
        const tx = t($e.text()); if (!tx) return;
        if (tag === 'p') { parts.push(`<p>${inline($, $e)}</p>`); return; }
        parts.push(`<${tag}>${inline($, $e)}</${tag}>`);
      });
      let html = parts.join('').replace(/<\/(h[1-3])><\1>/g, ' ');
      html = html.replace(/(<h4>[^<]*<\/h4><h5>[^<]*<\/h5>)+/g, (m) => block('stats', [...m.matchAll(/<h4>([^<]*)<\/h4><h5>([^<]*)<\/h5>/g)].map((x) => [`<p><strong>${x[1]}</strong></p>`, `<p>${x[2]}</p>`])));
      html = html.replace(/(<h3>[^<]*<\/h3><p><img [^>]*><\/p><p>[^<]*<\/p>){2,}/g, (m) => block('cards', [...m.matchAll(/<h3>([^<]*)<\/h3><p>(<img [^>]*>)<\/p><p>([^<]*)<\/p>/g)].map((x) => [x[2], `<h3>${x[1]}</h3><p>${x[3]}</p>`])));
      const im = html.match(/^<p>(<img [^>]*>)<\/p>(.+)$/s) || html.match(/^(.+)<p>(<img [^>]*>)<\/p>$/s);
      if (im && !html.includes('class="') && !(out === 'index' && i === 0)) {
        const imgFirst = html.startsWith('<p><img');
        const rest = imgFirst ? im[2] : im[1];
        const pic = imgFirst ? im[1] : im[2];
        if (rest.length > 80) html = block('columns', [imgFirst ? [pic, rest] : [rest, pic]]);
      }
      h = html;
    }
    if (h) secs.push(h);
  });
  if (out === 'index') secs[0] = block('hero', [[secs[0].replace(/<p><img [^>]*alt="Stagwell Logo"[^>]*><\/p>/, '')]]);
  const meta = block('metadata', [['<p>Title</p>', `<p>${esc(title)}</p>`], ['<p>Description</p>', `<p>${esc(desc)}</p>`]]);
  const body = `${secs.map((s) => `<div>${s}</div>`).join('')}<div>${meta}</div>`;
  fs.mkdirSync('content', { recursive: true });
  fs.writeFileSync(`content/${out}.html`, `<body><header></header><main>${body}</main><footer></footer></body>`);
  console.log(out, secs.length, 'sections', body.length);
}
