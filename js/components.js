export function header(active) {
  const links = [
    ['index.html', 'Home', 'home'],
    ['story.html', 'The Story', 'story'],
    ['resources.html', 'Resources', 'resources'],
    ['visibility.html', 'Visibility', 'visibility'],
    ['audits.html', 'Audits', 'audits'],
    ['sources.html', 'Methodology', 'sources']
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
        <a class="donate-link" href="donate.html"${active === 'donate' ? ' aria-current="page"' : ''}>Donate</a>
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
          <a href="resources.html">Resources</a>
          <a href="visibility.html">Visibility</a>
          <a href="sources.html">Sources</a>
          <a href="donate.html">Donate</a>
        </nav>
      </div>
    </footer>
  `;
}

export function mountShell(active) {
  document.body.insertAdjacentHTML('afterbegin', header(active));
  document.body.insertAdjacentHTML('beforeend', footer());
}
