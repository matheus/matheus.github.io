// Animate only while the scene is visible. Reduced motion uses a static image.
(() => {
  const scene = document.querySelector('#climate-scene');
  if (!scene) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  const update = () => scene.classList.toggle('scene-playing', visible && !document.hidden && !motion.matches);
  motion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting; update();
    }, { threshold: .1 });
    observer.observe(scene);
  } else { visible = true; update(); }
})();
