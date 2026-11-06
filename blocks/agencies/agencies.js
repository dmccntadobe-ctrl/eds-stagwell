const PAGE_SIZE = 16;

/** Each row: category | linked name. Builds one tab per category with a "show more" list. */
export default function decorate(block) {
  const groups = new Map();
  [...block.children].forEach((row) => {
    const [catCell, linkCell] = row.children;
    const cat = catCell?.textContent.trim() || 'All';
    const a = linkCell?.querySelector('a');
    if (!a) return;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(a);
  });

  const tabs = document.createElement('div');
  tabs.className = 'agencies-tabs';
  tabs.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'agencies-panels';

  [...groups].forEach(([cat, links], i) => {
    const id = `agencies-${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.innerHTML = `<b>${String(i + 1).padStart(2, '0')}</b> ${cat}`;
    btn.setAttribute('aria-controls', id);
    btn.setAttribute('aria-selected', String(i === 0));

    const panel = document.createElement('div');
    panel.id = id;
    panel.setAttribute('role', 'tabpanel');
    panel.hidden = i !== 0;
    const ul = document.createElement('ul');
    links.forEach((a, n) => {
      const li = document.createElement('li');
      li.append(a);
      li.hidden = n >= PAGE_SIZE;
      ul.append(li);
    });
    panel.append(ul);
    if (links.length > PAGE_SIZE) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'agencies-more';
      more.innerHTML = `Show more (${links.length - PAGE_SIZE} more) <span aria-hidden="true">+</span>`;
      more.addEventListener('click', () => {
        ul.querySelectorAll('li[hidden]').forEach((li) => { li.hidden = false; });
        more.remove();
      });
      panel.append(more);
    }

    btn.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      panels.querySelectorAll('[role="tabpanel"]').forEach((p) => { p.hidden = p !== panel; });
    });
    tabs.append(btn);
    panels.append(panel);
  });
  block.replaceChildren(tabs, panels);
}
