/**
 * Stagwell home hero.
 * Row 1: [logo image | link paragraph + h1]. The video stage below plays the linked
 * <video> if the block contains one, otherwise it links to the call-to-action.
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
  const callLink = textCell?.querySelector('a');
  const video = top.querySelector('video');
  if (video) {
    video.controls = true;
    video.playsInline = true;
    video.preload = 'metadata';
    stage.append(video);
  } else {
    const tag = document.createElement('p');
    tag.className = 'hero-tagline';
    tag.innerHTML = 'That’s why the world’s<br>most <strong>ambitious</strong> brands choose us';
    stage.append(tag);
    if (callLink) {
      const play = document.createElement('a');
      play.className = 'hero-play';
      play.href = callLink.href;
      play.setAttribute('aria-label', 'Watch Stagwell’s earnings call');
      stage.append(play);
    }
  }
  block.replaceChildren(top, stage);
}
