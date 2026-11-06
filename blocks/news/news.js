import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Each row: image | date, linked title. Renders a grid of news cards.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const [pic, info] = [...row.children];
    const a = info?.querySelector('a');
    if (!a) return;
    const date = [...(info?.querySelectorAll('p') || [])].find((p) => !p.querySelector('a'));
    const li = document.createElement('li');
    const card = document.createElement('a');
    card.href = a.href;
    const img = pic?.querySelector('img');
    if (img) {
      // decorative: the linked title already names the card
      const p = createOptimizedPicture(img.src, '', false, [{ width: '600' }]);
      p.className = 'news-image';
      card.append(p);
    }
    const body = document.createElement('div');
    body.className = 'news-body';
    const dateText = date?.textContent.trim();
    if (dateText) {
      const d = document.createElement('time');
      d.className = 'news-date';
      d.textContent = dateText;
      const parsed = new Date(dateText);
      if (!Number.isNaN(parsed.getTime())) d.dateTime = parsed.toISOString().slice(0, 10);
      body.append(d);
    }
    const t = document.createElement('h3');
    t.textContent = a.textContent.trim();
    body.append(t);
    card.append(body);
    li.append(card);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
