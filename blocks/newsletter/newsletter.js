/**
 * Newsletter sign-up form. Authors may add a link in the block: its URL is used as the
 * form endpoint (POST of the form fields). Without it, the form renders but cannot submit.
 */
export default function decorate(block) {
  const endpoint = block.querySelector('a')?.href;
  const form = document.createElement('form');
  form.className = 'newsletter-form';
  form.noValidate = false;

  const field = (name, label, type = 'text', required = false) => {
    const wrap = document.createElement('label');
    wrap.className = 'newsletter-field';
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.required = required;
    input.placeholder = ' ';
    const span = document.createElement('span');
    span.textContent = required ? `${label} *` : label;
    wrap.append(input, span);
    return wrap;
  };

  const interests = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = 'I am interested in information about :';
  interests.append(legend);
  ['Investor Relations', 'General News'].forEach((label) => {
    const l = document.createElement('label');
    l.className = 'newsletter-check';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = 'interests';
    cb.value = label;
    l.append(cb, ` ${label}`);
    interests.append(l);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'newsletter-submit';
  submit.innerHTML = 'Submit <span aria-hidden="true">→</span>';
  const status = document.createElement('p');
  status.className = 'newsletter-status';
  status.setAttribute('role', 'status');

  if (!endpoint) {
    submit.disabled = true;
    status.textContent = 'Sign-up is not connected yet.';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!endpoint) return;
    submit.disabled = true;
    try {
      const resp = await fetch(endpoint, { method: 'POST', body: new FormData(form) });
      status.textContent = resp.ok ? 'Thank you for signing up.' : 'Something went wrong. Please try again.';
      if (resp.ok) form.reset();
    } catch (err) {
      status.textContent = 'Something went wrong. Please try again.';
    }
    submit.disabled = false;
  });

  form.append(
    field('firstName', 'First Name'),
    field('lastName', 'Last Name'),
    field('email', 'Email', 'email', true),
    interests,
    submit,
    status,
  );
  block.replaceChildren(form);
}
