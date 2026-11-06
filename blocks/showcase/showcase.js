import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Capabilities / points-of-view slider.
 * Row 1 = intro (heading, text, bullet list). Remaining rows = slides: [title + text | image].
 */
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
  const slides = [...track.children];
  let current = 0;

  const counter = document.createElement('span');
  counter.className = 'showcase-count';

  const goTo = (n) => {
    current = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    counter.innerHTML = `<strong>${String(current + 1).padStart(2, '0')}</strong> | ${String(slides.length).padStart(2, '0')}`;
    track.scrollTo({ left: slides[current].offsetLeft - track.offsetLeft, behavior: 'smooth' });
  };

  const nav = document.createElement('div');
  nav.className = 'showcase-nav';
  nav.append(counter);
  [['prev', '←', -1], ['next', '→', 1]].forEach(([name, label, step]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', name === 'prev' ? 'Previous slide' : 'Next slide');
    b.textContent = label;
    b.addEventListener('click', () => goTo(current + step));
    nav.append(b);
  });
  slides.forEach((s, i) => s.addEventListener('click', () => goTo(i)));
  intro.append(nav);
  block.replaceChildren(intro, track);
  slides[0]?.classList.add('active');
  counter.innerHTML = `<strong>01</strong> | ${String(slides.length).padStart(2, '0')}`;
}
