// Compatibility entry point for older HTML; the current page loads the new file directly.
(() => {
  const script = document.createElement('script');
  script.src = new URL('./conversation-v3.js', document.currentScript?.src || document.baseURI).href;
  document.head.append(script);
})();
