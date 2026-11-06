/** Each row: number | label. */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('stats-item');
    const [num, label] = row.children;
    num?.classList.add('stats-number');
    label?.classList.add('stats-label');
  });
}
