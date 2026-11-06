import { createOptimizedPicture } from '../../scripts/aem.js';

/** Each row: image | date, linked title. Renders a grid of news cards. */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const [pic, info] = [...row.children];
    const a = info?.querySelector('a');
    const paras = info ? [...info.querySelectorAll('p')] : [];
    const date = paras.find((p) => !p.querySelector('a'));
    const li = document.createElement('li');
    const card = document.createElement(a ? 'a' : 'div');
    if (a) card.href = a.href;
    const img = pic?.querySelector('img');
    if (img) {
      const p = createOptimizedPicture(img.src, img.alt, false, [{ width: '600' }]);
      p.className = 'news-image';
      card.append(p);
    }
    const body = document.createElement('div');
    body.className = 'news-body';
    if (date) {
      const d = document.createElement('span');
      d.className = 'news-date';
      d.textContent = date.textContent.trim();
      body.append(d);
    }
    const t = document.createElement('strong');
    t.textContent = a?.textContent.trim() || '';
    body.append(t);
    card.append(body);
    li.append(card);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
