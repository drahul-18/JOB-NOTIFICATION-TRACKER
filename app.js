/**
 * Job Notification Tracker — Premium SaaS App
 * Client-side routing and page rendering
 */

const ROUTES = ['', 'dashboard', 'saved', 'digest', 'settings', 'proof'];

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const path = window.location.pathname.replace(/^\//, '').split('/')[0] || '';
  if (hash) return hash;
  if (path && ROUTES.includes(path)) return path;
  return '';
}

function renderPage(route) {
  const content = document.getElementById('page-content');
  if (!content) return;

  const pages = {
    '': renderLanding,
    dashboard: renderDashboard,
    saved: renderSaved,
    digest: renderDigest,
    settings: renderSettings,
    proof: renderProof
  };

  const render = pages[route] || renderLanding;
  content.innerHTML = render();
  bindPageEvents(content, route);
}

function bindPageEvents(content, route) {
  if (route === '') {
    const cta = content.querySelector('[data-action="start-tracking"]');
    cta?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('settings');
    });
  }
}

function renderLanding() {
  return `
    <div class="kn-landing">
      <h1 class="kn-landing__headline">Stop Missing The Right Jobs.</h1>
      <p class="kn-landing__subtext">Precision-matched job discovery delivered daily at 9AM.</p>
      <a href="#/settings" class="kn-btn kn-btn--primary kn-landing__cta" data-action="start-tracking">Start Tracking</a>
    </div>
  `;
}

function renderDashboard() {
  return `
    <div class="kn-page__header">
      <h1 class="kn-page__title">Dashboard</h1>
    </div>
    <div class="kn-empty">
      <p class="kn-empty__message">No jobs yet. In the next step, you will load a realistic dataset.</p>
    </div>
  `;
}

function renderSaved() {
  return `
    <div class="kn-page__header">
      <h1 class="kn-page__title">Saved</h1>
    </div>
    <div class="kn-empty">
      <p class="kn-empty__message">No saved jobs yet. Jobs you save will appear here.</p>
    </div>
  `;
}

function renderDigest() {
  return `
    <div class="kn-page__header">
      <h1 class="kn-page__title">Digest</h1>
    </div>
    <div class="kn-empty">
      <p class="kn-empty__message">Your daily digest will appear here once you configure your preferences.</p>
    </div>
  `;
}

function renderSettings() {
  return `
    <div class="kn-page__header">
      <h1 class="kn-page__title">Settings</h1>
      <p class="kn-page__subtext">Configure your job preferences.</p>
    </div>
    <div class="kn-settings">
      <div class="kn-settings__field">
        <label class="kn-settings__label" for="role-keywords">Role keywords</label>
        <input type="text" id="role-keywords" class="kn-input" placeholder="e.g. Frontend, React, Full Stack">
      </div>
      <div class="kn-settings__field">
        <label class="kn-settings__label" for="locations">Preferred locations</label>
        <input type="text" id="locations" class="kn-input" placeholder="e.g. Bangalore, Remote">
      </div>
      <div class="kn-settings__field">
        <label class="kn-settings__label" for="mode">Mode</label>
        <select id="mode" class="kn-input kn-input--select">
          <option value="">Select mode</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>
      </div>
      <div class="kn-settings__field">
        <label class="kn-settings__label" for="experience">Experience level</label>
        <select id="experience" class="kn-input kn-input--select">
          <option value="">Select level</option>
          <option value="entry">Entry</option>
          <option value="mid">Mid</option>
          <option value="senior">Senior</option>
          <option value="lead">Lead</option>
        </select>
      </div>
    </div>
  `;
}

function renderProof() {
  return `
    <div class="kn-page__header">
      <h1 class="kn-page__title">Proof</h1>
      <p class="kn-page__subtext">Artifact collection placeholder. This section will be built in the next step.</p>
    </div>
    <div class="kn-empty">
      <p class="kn-empty__message">Proof artifacts will be collected here.</p>
    </div>
  `;
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

function closeMobileMenu() {
  const toggle = document.querySelector('.kn-nav__toggle');
  const links = document.querySelector('.kn-nav__links');
  if (toggle) toggle.setAttribute('aria-expanded', 'false');
  if (links) links.classList.remove('kn-nav__links--open');
}

window.addEventListener('hashchange', () => {
  const route = window.location.hash.replace(/^#\/?/, '') || '';
  if (ROUTES.includes(route)) {
    renderPage(route);
    setActiveNav(route);
  }
});

function init() {
  const route = getRoute();
  if (!ROUTES.includes(route)) {
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
