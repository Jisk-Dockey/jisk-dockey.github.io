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

    // reveal things as they scroll into view, from below on the way down and from above on the way back up
    const reveal = (targets, { axis = 'y', dist = 60, dur = 0.9, ease = 'expo.out', stagger = 0, start = 'top 90%', end = 'bottom 10%' } = {}) => {
      const els = gsap.utils.toArray(targets); if (!els.length) return;
      gsap.set(els, { opacity: 0 });
      const show = (batch, from) => gsap.fromTo(batch, { [axis]: from, opacity: 0 }, { [axis]: 0, opacity: 1, duration: dur, ease, stagger, overwrite: true });
      const hide = (batch) => gsap.to(batch, { opacity: 0, duration: 0.2, overwrite: true });
      ScrollTrigger.batch(els, { start, end,
        onEnter: (b) => show(b, dist), onEnterBack: (b) => show(b, axis === 'y' ? -dist : dist),
        onLeave: hide, onLeaveBack: hide });
    };
    reveal('section h1:not(#top h1), section h2');
    reveal('.jd-tile', { dist: 80, dur: 1, stagger: 0.12, start: 'top 92%', end: 'bottom 8%' });
    reveal('section ol > li', { axis: 'x', dist: -30, dur: 0.6, ease: 'power3.out', stagger: 0.08 });

    // the record spins faster while you scroll
    const rec = document.querySelector('.spin');
    if (rec) {
      const anim = rec.getAnimations()[0];
      lenis.on('scroll', ({ velocity }) => { if (anim) anim.playbackRate = 1 + Math.min(Math.abs(velocity) / 8, 4); });
    }
    return () => { gsap.ticker.remove(tick); lenis.destroy(); window.jdLenis = null; };
  });
})();
