import { createOptimizedPicture } from '../../scripts/aem.js';

function buildPerson(row, featured) {
  const [pic, info] = [...row.children];
  const img = pic?.querySelector('img');
  const a = info?.querySelector('a');
  const li = document.createElement(featured ? 'div' : 'li');
  li.className = featured ? 'people-featured' : 'people-item';
  const card = document.createElement(a && !featured ? 'a' : 'div');
  if (card.tagName === 'A') card.href = a.href;
  if (img) {
    const p = createOptimizedPicture(img.src, img.alt, false, [{ width: featured ? '900' : '400' }]);
    card.append(p);
  }
  const details = document.createElement('div');
  details.className = 'people-details';
  const paras = info ? [...info.querySelectorAll('p')] : [];
  if (featured) {
    // quote, name link, title
    const quote = paras.find((p) => !p.querySelector('a') && p.textContent.length > 30);
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
    const name = document.createElement('strong');
    name.textContent = namePara?.textContent.trim() || '';
    const role = document.createElement('span');
    role.textContent = titlePara?.textContent.trim() || '';
    details.append(name, role);
  }
  card.append(details);
  li.append(card);
  return li;
}

/**
 * Row 1 = featured leader [photo | quote, name, title].
 * Other rows = slider items [photo | name, title].
 */
export default function decorate(block) {
  const [first, ...rest] = [...block.children];
  const featured = buildPerson(first, true);
  const track = document.createElement('ul');
  track.className = 'people-track';
  rest.forEach((row) => track.append(buildPerson(row, false)));

  const nav = document.createElement('div');
  nav.className = 'people-nav';
  [['prev', '←', -1], ['next', '→', 1]].forEach(([name, label, dir]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', name === 'prev' ? 'Previous' : 'Next');
    b.textContent = label;
    b.addEventListener('click', () => {
      const step = track.firstElementChild?.offsetWidth || 200;
      track.scrollBy({ left: dir * step * 2, behavior: 'smooth' });
    });
    nav.append(b);
  });
  block.replaceChildren(featured, track, nav);
}
