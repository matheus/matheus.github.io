// Ten-second looping visual simulation. No form submission or external request.
(() => {
  const root = document.querySelector('#conecta-demo');
  if (!root) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const question = document.querySelector('#demo-question');
  const answer = document.querySelector('#demo-answer');
  const selected = root.querySelector('.demo-selected');
  const duration = 10000;
  const checkpoints = [0, 1250, 2375, 3375, 4250, 5250, 6125, 7250, 8125];
  let elapsed = 0, previous = null, frame = 0, rendered = -1;
  let running = false, visible = false;
  function paint(time) {
    let index = 0;
    checkpoints.forEach((checkpoint, i) => { if (time >= checkpoint) index = i; });
    if (index === rendered) return;
    rendered = index;
    root.dataset.scene = index < 2 ? 'website' : index < 8 ? 'dialog' : 'done';
    root.classList.toggle('pointing', index === 1);
    root.dataset.question = index < 4 ? 'name' : index < 6 ? 'contact' : 'employees';
    question.textContent = index < 4 ? 'Como posso chamar você?' : index < 6 ? 'Qual é o seu contato?' : 'Quantas pessoas trabalham com você?';
    answer.textContent = index === 3 ? 'Ana' : index === 5 ? 'ana@empresa.com' : index < 4 ? 'Seu nome aqui…' : 'Seu e-mail ou WhatsApp…';
    answer.classList.toggle('answered', index === 3 || index === 5);
    selected.classList.toggle('active', index >= 7);
  }
  function tick(time) {
    if (!running) return;
    if (previous !== null) elapsed = (elapsed + time - previous) % duration;
    previous = time; paint(elapsed);
    frame = requestAnimationFrame(tick);
  }
  function syncRunning() {
    const value = visible && !document.hidden && !motion.matches;
    if (running === value) return;
    running = value; previous = null; cancelAnimationFrame(frame);
    for (const animation of root.getAnimations({ subtree: true })) value ? animation.play() : animation.pause();
    if (value) frame = requestAnimationFrame(tick);
  }
  function configure() {
    elapsed = 0; previous = null; rendered = -1;
    // A static completed overview respects reduced motion without extra controls.
    paint(motion.matches ? duration - 1 : 0);
    syncRunning();
  }
  motion.addEventListener('change', configure);
  configure();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      syncRunning();
    }, { threshold: .15 });
    observer.observe(root);
  } else { visible = true; syncRunning(); }
  document.addEventListener('visibilitychange', syncRunning);
})();
