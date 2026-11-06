const PAGE_SIZE = 16;
let uid = 0;

/**
 * Each row: category | linked name. Builds one tab per category with a "show more" list.
 * Implements the WAI-ARIA tabs pattern (roving tabindex, arrow/Home/End keys).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  uid += 1;
  const prefix = `agencies-${uid}`;
  const groups = new Map();
  [...block.children].forEach((row) => {
    const [catCell, linkCell] = row.children;
    const cat = catCell?.textContent.trim() || 'All';
    const a = linkCell?.querySelector('a');
    if (!a) return;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    if (!a.querySelector('.agencies-sr')) {
      const sr = document.createElement('span');
      sr.className = 'agencies-sr';
      sr.textContent = ' (opens in a new tab)';
      a.append(sr);
    }
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat).push(a);
  });

  const tabs = document.createElement('div');
  tabs.className = 'agencies-tabs';
  tabs.setAttribute('role', 'tablist');
  const panels = document.createElement('div');
  panels.className = 'agencies-panels';
  const buttons = [];
  const panelEls = [];

  const select = (index, focus = false) => {
    buttons.forEach((b, i) => {
      const on = i === index;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      panelEls[i].hidden = !on;
    });
    if (focus) buttons[index].focus();
  };

  [...groups].forEach(([cat, links], i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = `${prefix}-tab-${i}`;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-controls', `${prefix}-panel-${i}`);
    const num = document.createElement('span');
    num.className = 'agencies-num';
    num.textContent = String(i + 1).padStart(2, '0');
    btn.append(num, ` ${cat}`);

    const panel = document.createElement('div');
    panel.id = `${prefix}-panel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', btn.id);
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
      more.append(`Show more (${links.length - PAGE_SIZE} more) `);
      const plus = document.createElement('span');
      plus.setAttribute('aria-hidden', 'true');
      plus.textContent = '+';
      more.append(plus);
      more.addEventListener('click', () => {
        const hidden = [...ul.querySelectorAll('li[hidden]')];
        hidden.forEach((li) => { li.hidden = false; });
        hidden[0]?.querySelector('a')?.focus();
        more.remove();
      });
      panel.append(more);
    }

    btn.addEventListener('click', () => select(i));
    btn.addEventListener('keydown', (e) => {
      const last = buttons.length - 1;
      const keys = {
        ArrowRight: i === last ? 0 : i + 1,
        ArrowLeft: i === 0 ? last : i - 1,
        Home: 0,
        End: last,
      };
      if (e.key in keys) {
        e.preventDefault();
        select(keys[e.key], true);
      }
    });
    buttons.push(btn);
    panelEls.push(panel);
    tabs.append(btn);
    panels.append(panel);
  });
  block.replaceChildren(tabs, panels);
  if (buttons.length) select(0);
}
