/** Each row: category | linked name. Builds one tab per category. */
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

  [...groups].forEach(([cat, links], i) => {
    const id = `agencies-${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.textContent = `${String(i + 1).padStart(2, '0')} ${cat}`;
    btn.setAttribute('aria-controls', id);
    btn.setAttribute('aria-selected', String(i === 0));
    const panel = document.createElement('ul');
    panel.id = id;
    panel.setAttribute('role', 'tabpanel');
    panel.hidden = i !== 0;
    links.forEach((a) => {
      const li = document.createElement('li');
      li.append(a);
      panel.append(li);
    });
    btn.addEventListener('click', () => {
      tabs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      panels.querySelectorAll('ul').forEach((p) => { p.hidden = p !== panel; });
    });
    tabs.append(btn);
    panels.append(panel);
  });
  block.replaceChildren(tabs, panels);
}
