// Poster player: hover (or tap) a tile and it floats to the middle of the screen, plays once, then floats back.
// Clicking the space around it, or pressing Escape, sends it back early.
(() => {
  const tiles = [...document.querySelectorAll('.jd-play')];
  if (!tiles.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let open = null, hoverTimer = null;

  const target = () => {
    const vw = innerWidth, vh = innerHeight;
    let h = Math.min(vh * 0.9, vw * 0.9 * 1.25), w = h / 1.25;
    return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
  };
  const rectOf = (el) => { const r = el.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; };
  const tween = (el, props, dur, onDone) => {
    if (window.gsap && !reduce) return gsap.to(el, { ...props, duration: dur, ease: 'power3.inOut', onComplete: onDone });
    Object.assign(el.style, Object.fromEntries(Object.entries(props).map(([k, v]) => [k, typeof v === 'number' && k !== 'opacity' ? v + 'px' : String(v)])));
    onDone && onDone();
  };

  function show(tile) {
    if (open) return;
    clearTimeout(hoverTimer);
    const from = rectOf(tile);
    const shade = document.createElement('div');
    shade.className = 'jd-shade';
    shade.style.cssText = 'position:fixed;inset:0;z-index:60;background:rgba(11,11,10,0.18);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);opacity:0;cursor:zoom-out';
    const card = document.createElement('div');
    card.setAttribute('role', 'dialog'); card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', tile.getAttribute('aria-label').replace('Play the ', ''));
    card.style.cssText = `position:fixed;z-index:61;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;overflow:hidden;background:#161514;box-shadow:0 30px 80px rgba(0,0,0,0.6);border:1px solid #2c2a27`;
    const still = document.createElement('img');
    still.src = tile.dataset.still; still.alt = '';
    still.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
    const vid = document.createElement('video');
    vid.src = tile.dataset.video; vid.muted = true; vid.playsInline = true; vid.preload = 'auto';
    vid.setAttribute('playsinline', ''); vid.setAttribute('aria-hidden', 'true');
    vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .25s';
    card.append(still, vid);
    document.body.append(shade, card);
    tile.style.visibility = 'hidden';
    window.jdLenis && window.jdLenis.stop();
    open = { tile, shade, card, vid, closing: false };
    vid.addEventListener('playing', () => { vid.style.opacity = 1; });
    vid.addEventListener('ended', () => hide());
    shade.addEventListener('click', () => hide());
    tween(shade, { opacity: 1 }, 0.6);
    const to = target();
    tween(card, to, 0.7, () => { if (open && !open.closing) vid.play().catch(() => {}); });
  }

  function hide() {
    if (!open || open.closing) return;
    open.closing = true;
    const { tile, shade, card, vid } = open;
    vid.pause();
    if (window.gsap) gsap.killTweensOf([card, shade]);
    const back = rectOf(tile);
    tween(shade, { opacity: 0 }, 0.6);
    tween(card, back, 0.7, () => {
      tile.style.visibility = '';
      tile.dataset.rest = '1';          // don't reopen from hover until the pointer has left this tile
      shade.remove(); card.remove();
      window.jdLenis && window.jdLenis.start();
      open = null;
    });
  }

  tiles.forEach((tile) => {
    tile.addEventListener('click', (e) => { e.preventDefault(); show(tile); });
    if (canHover) {
      tile.addEventListener('mouseenter', () => { clearTimeout(hoverTimer); if (tile.dataset.rest) return; hoverTimer = setTimeout(() => show(tile), 350); });
      tile.addEventListener('mouseleave', () => { clearTimeout(hoverTimer); delete tile.dataset.rest; });
    }
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
  addEventListener('resize', () => { if (open && !open.closing) Object.assign(open.card.style, Object.fromEntries(Object.entries(target()).map(([k, v]) => [k, v + 'px']))); });
})();
