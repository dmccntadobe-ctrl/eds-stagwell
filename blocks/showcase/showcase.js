import { createOptimizedPicture } from '../../scripts/aem.js';

/** First row = intro (heading, text, list); remaining rows = slides (text | image). */
export default function decorate(block) {
  const [introRow, ...slideRows] = [...block.children];
  const intro = document.createElement('div');
  intro.className = 'showcase-intro';
  intro.append(...introRow.firstElementChild.childNodes);

  const track = document.createElement('ul');
  track.className = 'showcase-track';
  slideRows.forEach((row, i) => {
    const [text, pic] = [...row.children];
    const li = document.createElement('li');
    const num = document.createElement('span');
    num.className = 'showcase-index';
    num.textContent = String(i + 1).padStart(2, '0');
    const body = document.createElement('div');
    body.className = 'showcase-body';
    if (text) body.append(...text.childNodes);
    li.append(num, body);
    const img = pic?.querySelector('img');
    if (img) {
      const p = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
      p.className = 'showcase-image';
      li.append(p);
    }
    track.append(li);
  });

  const nav = document.createElement('div');
  nav.className = 'showcase-nav';
  ['prev', 'next'].forEach((dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', dir === 'prev' ? 'Previous slide' : 'Next slide');
    b.textContent = dir === 'prev' ? '←' : '→';
    b.addEventListener('click', () => {
      const step = track.firstElementChild?.offsetWidth || 300;
      track.scrollBy({ left: dir === 'prev' ? -step : step, behavior: 'smooth' });
    });
    nav.append(b);
  });
  intro.append(nav);
  block.replaceChildren(intro, track);
}
