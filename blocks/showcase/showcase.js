import { createOptimizedPicture } from '../../scripts/aem.js';

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Capabilities / points-of-view slider.
 * Row 1 = intro (heading, text, bullet list). Remaining rows = slides: [title + text | image].
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const [introRow, ...slideRows] = [...block.children];
  const intro = document.createElement('div');
  intro.className = 'showcase-intro';
  const introCell = introRow?.firstElementChild;
  if (introCell) intro.append(...introCell.childNodes);
  if (!slideRows.length) {
    block.replaceChildren(intro);
    return;
  }

  const track = document.createElement('ul');
  track.className = 'showcase-track';
  track.tabIndex = 0;
  track.setAttribute('aria-label', 'Slides');
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
  const total = String(slides.length).padStart(2, '0');
  let current = 0;

  const counter = document.createElement('span');
  counter.className = 'showcase-count';
  counter.setAttribute('aria-live', 'polite');

  const prev = document.createElement('button');
  const next = document.createElement('button');

  const update = (n) => {
    current = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, i) => s.classList.toggle('active', i === current));
    counter.replaceChildren();
    const cur = document.createElement('strong');
    cur.textContent = String(current + 1).padStart(2, '0');
    counter.append(cur, ` | ${total}`);
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
  };

  const goTo = (n) => {
    update(n);
    track.scrollTo({
      left: slides[current].offsetLeft - track.offsetLeft,
      behavior: reduceMotion() ? 'auto' : 'smooth',
    });
  };

  const nav = document.createElement('div');
  nav.className = 'showcase-nav';
  [[prev, 'Previous slide', '←', -1], [next, 'Next slide', '→', 1]].forEach(([b, label, glyph, step]) => {
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.textContent = glyph;
    b.addEventListener('click', () => goTo(current + step));
  });
  nav.append(counter, prev, next);

  // keep the active slide in sync when the visitor swipes or scrolls the track
  let ticking = false;
  track.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const w = slides[0].offsetWidth || 1;
      update(Math.round(track.scrollLeft / w));
      ticking = false;
    });
  }, { passive: true });

  intro.append(nav);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', intro.querySelector('h2')?.textContent.trim() || 'Slides');
  block.replaceChildren(intro, track);
  update(0);
}
