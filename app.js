/**
 * Job Notification Tracker — Route Skeleton
 * Client-side routing and navigation
 */

const ROUTES = {
  '': { title: 'Home' },
  dashboard: { title: 'Dashboard' },
  saved: { title: 'Saved' },
  digest: { title: 'Digest' },
  settings: { title: 'Settings' },
  proof: { title: 'Proof' }
};

const SUBTEXT = 'This section will be built in the next step.';

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const path = window.location.pathname.replace(/^\//, '').split('/')[0] || '';
  if (hash) return hash;
  if (path && ROUTES.hasOwnProperty(path)) return path;
  return '';
}

function renderPage(route) {
  const config = ROUTES[route] || ROUTES[''];
  const title = config.title;
  const content = document.getElementById('page-content');
  if (content) {
    content.innerHTML = `
      <h1 class="kn-page__title">${title}</h1>
      <p class="kn-page__subtext">${SUBTEXT}</p>
    `;
  }
}

function setActiveNav(route) {
  document.querySelectorAll('.kn-nav__link').forEach((link) => {
    const linkRoute = link.getAttribute('data-route') || link.getAttribute('href')?.replace(/^#\/?/, '') || '';
    link.classList.toggle('kn-nav__link--active', linkRoute === route);
  });
}

function navigate(route) {
  const hash = route === '' ? '#/' : `#/${route}`;
  window.location.hash = hash;
  renderPage(route);
  setActiveNav(route);
  closeMobileMenu();
}

window.addEventListener('hashchange', () => {
  const route = window.location.hash.replace(/^#\/?/, '') || '';
  if (ROUTES.hasOwnProperty(route)) {
    renderPage(route);
    setActiveNav(route);
  }
});

function closeMobileMenu() {
  const toggle = document.querySelector('.kn-nav__toggle');
  const links = document.querySelector('.kn-nav__links');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
  if (links) links.classList.remove('kn-nav__links--open');
}

function init() {
  const route = getRoute();
  if (!ROUTES.hasOwnProperty(route)) {
    navigate('');
    return;
  }
  renderPage(route);
  setActiveNav(route);

  document.querySelectorAll('.kn-nav__link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href') || '';
      const targetRoute = href === '#/' || href === '/' ? '' : href.replace(/^#\/?/, '');
      navigate(targetRoute);
    });
  });

  document.querySelector('.kn-nav__brand')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigate('');
  });

  document.querySelector('.kn-nav__toggle')?.addEventListener('click', () => {
    const toggle = document.querySelector('.kn-nav__toggle');
    const links = document.querySelector('.kn-nav__links');
    const isOpen = toggle?.getAttribute('aria-expanded') === 'true';
    toggle?.setAttribute('aria-expanded', String(!isOpen));
    links?.classList.toggle('kn-nav__links--open', !isOpen);
  });
}

document.addEventListener('DOMContentLoaded', init);
