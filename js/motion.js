// Smooth scroll (Lenis) + scroll animations (GSAP). Everything is visible without JS;
// motion is skipped for people who have "reduce motion" switched on.
(() => {
  if (!window.gsap || !window.Lenis) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const lenis = new Lenis({ lerp: 0.1, anchors: true }); window.jdLenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);

    // hero headline: words rise in on load
    const h1 = document.querySelector('#top h1');
    if (h1) SplitText.create(h1, { type: 'words,lines', mask: 'lines', autoSplit: true,
      onSplit: (s) => gsap.from(s.words, { yPercent: 110, duration: 0.9, ease: 'expo.out', stagger: 0.05, delay: 0.1 }) });

    // section headings slide up as they come into view
    gsap.utils.toArray('section h2').forEach((h) => gsap.from(h, {
      y: 60, opacity: 0, duration: 0.9, ease: 'expo.out',
      scrollTrigger: { trigger: h, start: 'top 88%' } }));

    // poster tiles: staggered rise
    const tiles = gsap.utils.toArray('.jd-tile');
    gsap.from(tiles, { y: 80, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.12,
      scrollTrigger: { trigger: '#work', start: 'top 75%' } });

    // launch-pack tracklist and how-it-works steps tick in one by one
    document.querySelectorAll('section ol').forEach((ol) => gsap.from(ol.children, {
      x: -30, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: ol, start: 'top 85%' } }));

    // the record spins faster while you scroll
    const rec = document.querySelector('.spin');
    if (rec) {
      const anim = rec.getAnimations()[0];
      lenis.on('scroll', ({ velocity }) => { if (anim) anim.playbackRate = 1 + Math.min(Math.abs(velocity) / 8, 4); });
    }
    return () => { gsap.ticker.remove(tick); lenis.destroy(); window.jdLenis = null; };
  });
})();
