import { createOptimizedPicture } from '../../scripts/aem.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function buildPerson(row, featured) {
  const [pic, info] = [...row.children];
  const img = pic?.querySelector('img');
  const a = info?.querySelector('a');
  const wrapper = document.createElement(featured ? 'div' : 'li');
  wrapper.className = featured ? 'people-featured' : 'people-item';
  const card = document.createElement(a && !featured ? 'a' : 'div');
  if (card.tagName === 'A') card.href = a.href;
  if (img) {
    const p = createOptimizedPicture(img.src, img.alt, false, [{ width: featured ? '900' : '500' }]);
    card.append(p);
  }
  const details = document.createElement('div');
  details.className = 'people-details';
  const paras = info ? [...info.querySelectorAll('p')] : [];
  if (featured) {
    // quote, then name link and title
    const quote = paras.find((p) => !p.querySelector('a') && p.textContent.trim().length > 30);
    const rest = paras.filter((p) => p !== quote);
    if (quote) {
      const q = document.createElement('blockquote');
      q.textContent = quote.textContent.trim();
      details.append(q);
    }
    const who = document.createElement('div');
    who.className = 'people-who';
    rest.forEach((p) => who.append(p));
    details.append(who);
  } else {
    const [namePara, titlePara] = paras;
    const name = document.createElement('span');
    name.className = 'people-name';
    name.textContent = namePara?.textContent.trim() || '';
    const role = document.createElement('span');
    role.className = 'people-role';
    role.textContent = titlePara?.textContent.trim() || '';
    details.append(name, role);
  }
  card.append(details);
  wrapper.append(card);
  return wrapper;
}

/**
 * Row 1 = featured leader [photo | quote, name, title].
 * Other rows = slider items [photo | name, title].
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [first, ...rest] = [...block.children];
  if (!first) return;
  const featured = buildPerson(first, true);
  const track = document.createElement('ul');
  track.className = 'people-track';
  track.tabIndex = 0;
  track.setAttribute('aria-label', 'Leadership team');
  rest.forEach((row) => track.append(buildPerson(row, false)));

  const nav = document.createElement('div');
  nav.className = 'people-nav';
  [['Previous', '←', -1], ['Next', '→', 1]].forEach(([label, glyph, dir]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `${label} team members`);
    b.textContent = glyph;
    b.addEventListener('click', () => {
      const step = track.firstElementChild?.offsetWidth || 250;
      track.scrollBy({ left: dir * step * 2, behavior: reduceMotion() ? 'auto' : 'smooth' });
    });
    nav.append(b);
  });
  block.replaceChildren(featured, ...(rest.length ? [track, nav] : []));
}
