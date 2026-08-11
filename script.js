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
