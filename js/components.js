export function header(active) {
  const links = [
    ['index.html', 'Home', 'home'],
    ['story.html', 'Data', 'story'],
    ['resources.html', 'Find Resources', 'resources'],
    ['visibility.html', 'Dashboard', 'visibility'],
    ['sources.html', 'Sources', 'sources']
  ];

  const navLinks = links
    .map(([href, label, key]) => `<a href="${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('');

  return `
    <header class="site-header">
      <a class="brand" href="index.html"><span class="brand-mark"></span>Bridge LA</a>
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
          <a href="visibility.html">Dashboard</a>
          <a href="sources.html">Sources</a>
          <a href="donate.html">Donate Demo</a>
        </nav>
      </div>
    </footer>
  `;
}

export function mountShell(active) {
  document.body.insertAdjacentHTML('afterbegin', header(active));
  document.body.insertAdjacentHTML('beforeend', footer());
}
