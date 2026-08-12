export function header(active) {
  const links = [
    ['index.html', 'Home', 'home'],
    ['story.html', 'Data', 'story'],
    ['stories.html', 'Stories', 'stories'],
    ['resources.html', 'Find Resources', 'resources'],
    ['visibility.html', 'Dashboard', 'visibility'],
    ['sources.html', 'Sources', 'sources']
  ];

  const navLinks = links
    .map(([href, label, key]) => `<a href="${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('');

  return `
    <header class="site-header">
      <a class="brand" href="index.html"><img class="brand-logo" src="logo-mark.svg" alt="" aria-hidden="true" /><span>Bridge LA</span></a>
      <button class="menu-button" type="button" aria-controls="site-nav" aria-expanded="false" data-nav-toggle>Menu</button>
      <nav class="site-nav" id="site-nav" aria-label="Primary navigation">
        ${navLinks}
        <a class="donate-link" href="donate.html"${active === 'donate' ? ' aria-current="page"' : ''}>Donate Demo</a>
      </nav>
    </header>
  `;
}

export function footer() {
  return `
    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <strong>Bridge LA</strong>
          <p>Making public homelessness and resource data easier to understand, inspect, and act on.</p>
        </div>
        <nav class="footer-links" aria-label="Footer navigation">
          <a href="resources.html">Find Resources</a>
          <a href="stories.html">Stories</a>
          <a href="visibility.html">Dashboard</a>
          <a href="sources.html">Sources</a>
          <a href="donate.html">Donate Demo</a>
        </nav>
      </div>
    </footer>
  `;
}

export function sourceDrawer() {
  return `
    <div class="source-drawer" id="source-drawer" hidden>
      <div class="source-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="source-drawer-title">
        <button class="modal-close" type="button" data-source-close>Close</button>
        <p class="eyebrow">Source note</p>
        <h2 id="source-drawer-title">Source</h2>
        <p id="source-drawer-body"></p>
        <a href="sources.html">Open sources page</a>
      </div>
    </div>
  `;
}

export function mountShell(active) {
  document.body.insertAdjacentHTML('afterbegin', header(active));
  document.body.insertAdjacentHTML('beforeend', footer());
  document.body.insertAdjacentHTML('beforeend', sourceDrawer());
}
