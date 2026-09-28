// Applies the saved or system theme before first paint, so the page
// never flashes the wrong colours. Loaded without defer on purpose.
(function () {
  var t = null;
  try { t = localStorage.getItem('bw-theme'); } catch (e) {}
  if (t !== 'light' && t !== 'dark') {
    t = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.classList.add('js');
})();
