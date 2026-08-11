const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('#site-nav');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
  });
}

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = new Date().getFullYear();
});

document.querySelectorAll('[data-accordion]').forEach((card) => {
  const button = card.querySelector('button');
  button?.addEventListener('click', () => {
    card.toggleAttribute('open');
  });
});

document.addEventListener('click', (event) => {
  const openButton = event.target.closest('[data-source-open]');
  const drawer = document.querySelector('#source-drawer');
  if (openButton && drawer) {
    document.querySelector('#source-drawer-title').textContent = openButton.dataset.sourceTitle || 'Source';
    document.querySelector('#source-drawer-body').textContent = openButton.dataset.sourceBody || 'Source details are listed on the Sources page.';
    drawer.hidden = false;
    drawer.querySelector('[data-source-close]')?.focus();
  }

  if (event.target.closest('[data-source-close]') || event.target === drawer) {
    drawer.hidden = true;
  }
});

document.addEventListener('keydown', (event) => {
  const drawer = document.querySelector('#source-drawer');
  if (event.key === 'Escape' && drawer && !drawer.hidden) {
    drawer.hidden = true;
  }
});
