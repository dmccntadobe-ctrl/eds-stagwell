/**
 * Newsletter sign-up form. Authors may add a link in the block: its URL is used as the
 * form endpoint (POST of the form fields). Only https endpoints are accepted.
 * Without one the form renders but cannot be submitted.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  let endpoint = '';
  try {
    const url = new URL(block.querySelector('a')?.href || '');
    if (url.protocol === 'https:') endpoint = url.href;
  } catch (e) {
    endpoint = '';
  }

  const form = document.createElement('form');
  form.className = 'newsletter-form';

  const field = (name, label, type, autocomplete, required = false) => {
    const wrap = document.createElement('label');
    wrap.className = 'newsletter-field';
    const text = document.createElement('span');
    text.append(label);
    if (required) {
      const star = document.createElement('span');
      star.setAttribute('aria-hidden', 'true');
      star.textContent = ' *';
      text.append(star);
    }
    const input = document.createElement('input');
    input.type = type;
    input.name = name;
    input.required = required;
    input.autocomplete = autocomplete;
    wrap.append(text, input);
    return wrap;
  };

  const interests = document.createElement('fieldset');
  const legend = document.createElement('legend');
  legend.textContent = 'I am interested in information about:';
  interests.append(legend);
  ['Investor Relations', 'General News'].forEach((label) => {
    const l = document.createElement('label');
    l.className = 'newsletter-check';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.name = 'interests';
    cb.value = label;
    l.append(cb, label);
    interests.append(l);
  });

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'newsletter-submit';
  submit.append('Submit ');
  const arrow = document.createElement('span');
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';
  submit.append(arrow);

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
    status.textContent = '';
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
    field('firstName', 'First Name', 'text', 'given-name'),
    field('lastName', 'Last Name', 'text', 'family-name'),
    field('email', 'Email', 'email', 'email', true),
    interests,
    submit,
    status,
  );
  block.replaceChildren(form);
}
