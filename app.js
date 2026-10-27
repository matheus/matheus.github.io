// Page animation only. Lead collection lives in the individual service pages.
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window)) return;
  if (!motion.matches) document.documentElement.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
})();
