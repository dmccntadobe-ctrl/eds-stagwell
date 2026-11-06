/**
 * Stagwell home hero.
 * Row 1: [logo image | link paragraph + h1]. The stage below plays a <video> (or a link to a
 * publicly reachable .mp4) if present, otherwise it shows the tagline with a play button that
 * opens the linked call-to-action.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  const [logoCell, textCell] = row ? [...row.children] : [];
  const top = document.createElement('div');
  top.className = 'hero-top';
  if (logoCell) {
    logoCell.classList.add('hero-logo');
    top.append(logoCell);
  }
  if (textCell) {
    textCell.classList.add('hero-text');
    top.append(textCell);
  }

  const stage = document.createElement('div');
  stage.className = 'hero-stage';
  const callLink = textCell?.querySelector('a:not([href*=".mp4"])');
  const videoLink = top.querySelector('a[href*=".mp4"]');
  let video = top.querySelector('video');
  if (!video && videoLink) {
    video = document.createElement('video');
    video.src = videoLink.href;
    videoLink.closest('p')?.remove();
  }
  if (video) {
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.setAttribute('aria-label', 'Stagwell brand video');
    stage.append(video);
  } else {
    const tag = document.createElement('p');
    tag.className = 'hero-tagline';
    tag.append('That’s why the world’s');
    tag.append(document.createElement('br'));
    tag.append('most ');
    const strong = document.createElement('strong');
    strong.textContent = 'ambitious';
    tag.append(strong, ' brands choose us');
    stage.append(tag);
    if (callLink) {
      const play = document.createElement('a');
      play.className = 'hero-play';
      play.href = callLink.href;
      play.setAttribute('aria-label', callLink.closest('p')?.textContent.trim() || 'Watch the video');
      play.tabIndex = -1;
      stage.append(play);
    }
  }
  block.replaceChildren(top, stage);
}
