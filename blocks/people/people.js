import { createOptimizedPicture } from '../../scripts/aem.js';

/** Each row: photo | name (linked) + title. */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const [pic, info] = [...row.children];
    const img = pic?.querySelector('img');
    const a = info?.querySelector('a');
    const card = document.createElement(a ? 'a' : 'div');
    if (a) card.href = a.href;
    if (img) card.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '400' }]));
    const details = document.createElement('div');
    details.className = 'people-details';
    const [namePara, titlePara] = info ? [...info.querySelectorAll('p')] : [];
    const name = document.createElement('strong');
    name.textContent = namePara?.textContent.trim() || '';
    const role = document.createElement('span');
    role.textContent = titlePara?.textContent.trim() || '';
    details.append(name, role);
    card.append(details);
    li.append(card);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
