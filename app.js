/**
 * Job Notification Tracker — Premium SaaS App
 * Client-side routing, filtering, and job rendering
 */

const ROUTES = ['', 'dashboard', 'saved', 'digest', 'settings', 'proof'];
const SAVED_IDS_KEY = 'job-tracker-saved-ids';

let filterState = {
  keyword: '',
  location: '',
  mode: '',
  experience: '',
  source: '',
  sort: 'latest'
};

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const path = window.location.pathname.replace(/^\//, '').split('/')[0] || '';
  if (hash) return hash;
  if (path && ROUTES.includes(path)) return path;
  return '';
}

function getSavedIds() {
  try {
    const raw = localStorage.getItem(SAVED_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveJobId(id) {
  const ids = getSavedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    localStorage.setItem(SAVED_IDS_KEY, JSON.stringify(ids));
  }
}

function unsaveJobId(id) {
  const ids = getSavedIds().filter((i) => i !== id);
  localStorage.setItem(SAVED_IDS_KEY, JSON.stringify(ids));
}

function isSaved(id) {
  return getSavedIds().includes(id);
}

function getFilteredJobs(jobs) {
  let result = [...jobs];

  if (filterState.keyword) {
    const k = filterState.keyword.toLowerCase();
    result = result.filter(
      (j) =>
        j.title.toLowerCase().includes(k) || j.company.toLowerCase().includes(k)
    );
  }
  if (filterState.location) {
    result = result.filter(
      (j) => j.location.toLowerCase() === filterState.location.toLowerCase()
    );
  }
  if (filterState.mode) {
    result = result.filter(
      (j) => j.mode.toLowerCase() === filterState.mode.toLowerCase()
    );
  }
  if (filterState.experience) {
    result = result.filter(
      (j) =>
        j.experience.toLowerCase() === filterState.experience.toLowerCase()
    );
  }
  if (filterState.source) {
    result = result.filter(
      (j) => j.source.toLowerCase() === filterState.source.toLowerCase()
    );
  }

  if (filterState.sort === 'latest') {
    result.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
  } else if (filterState.sort === 'oldest') {
    result.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
  }

  return result;
}

function getUniqueValues(jobs, key) {
  const set = new Set(jobs.map((j) => j[key]).filter(Boolean));
  return [...set].sort();
}

function formatPosted(days) {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function renderFilterBar(container, jobs) {
  const locations = getUniqueValues(jobs, 'location');
  const modes = getUniqueValues(jobs, 'mode');
  const experiences = getUniqueValues(jobs, 'experience');
  const sources = getUniqueValues(jobs, 'source');

  container.innerHTML = `
    <div class="kn-filters">
      <input type="text" class="kn-input kn-filters__search" placeholder="Search title or company" value="${filterState.keyword}">
      <select class="kn-input kn-input--select kn-filters__select" data-filter="location">
        <option value="">All locations</option>
        ${locations.map((l) => `<option value="${l}" ${filterState.location === l ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      <select class="kn-input kn-input--select kn-filters__select" data-filter="mode">
        <option value="">All modes</option>
        ${modes.map((m) => `<option value="${m}" ${filterState.mode === m ? 'selected' : ''}>${m}</option>`).join('')}
      </select>
      <select class="kn-input kn-input--select kn-filters__select" data-filter="experience">
        <option value="">All experience</option>
        ${experiences.map((e) => `<option value="${e}" ${filterState.experience === e ? 'selected' : ''}>${e}</option>`).join('')}
      </select>
      <select class="kn-input kn-input--select kn-filters__select" data-filter="source">
        <option value="">All sources</option>
        ${sources.map((s) => `<option value="${s}" ${filterState.source === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
      <select class="kn-input kn-input--select kn-filters__select" data-filter="sort">
        <option value="latest" ${filterState.sort === 'latest' ? 'selected' : ''}>Latest</option>
        <option value="oldest" ${filterState.sort === 'oldest' ? 'selected' : ''}>Oldest</option>
      </select>
    </div>
  `;

  container.querySelector('.kn-filters__search').addEventListener('input', (e) => {
    filterState.keyword = e.target.value;
    renderPage(getRoute());
  });
  container.querySelectorAll('[data-filter]').forEach((el) => {
    el.addEventListener('change', (e) => {
      filterState[e.target.dataset.filter] = e.target.value;
      renderPage(getRoute());
    });
  });
}

function renderJobCard(job, showUnsave = false) {
  const saved = isSaved(job.id);
  return `
    <article class="kn-job-card" data-id="${job.id}">
      <div class="kn-job-card__header">
        <h3 class="kn-job-card__title">${job.title}</h3>
        <span class="kn-job-card__badge kn-job-card__badge--${job.source.toLowerCase()}">${job.source}</span>
      </div>
      <p class="kn-job-card__company">${job.company}</p>
      <p class="kn-job-card__meta">${job.location} · ${job.mode} · ${job.experience}</p>
      <p class="kn-job-card__salary">${job.salaryRange}</p>
      <p class="kn-job-card__posted">${formatPosted(job.postedDaysAgo)}</p>
      <div class="kn-job-card__actions">
        <button type="button" class="kn-btn kn-btn--secondary kn-job-card__btn" data-action="view" data-id="${job.id}">View</button>
        <button type="button" class="kn-btn kn-btn--secondary kn-job-card__btn" data-action="${saved && showUnsave ? 'unsave' : 'save'}" data-id="${job.id}">${saved && showUnsave ? 'Unsave' : 'Save'}</button>
        <a href="${job.applyUrl}" target="_blank" rel="noopener" class="kn-btn kn-btn--primary kn-job-card__btn">Apply</a>
      </div>
    </article>
  `;
}

function openModal(job) {
  const backdrop = document.getElementById('modal-backdrop');
  const modal = document.getElementById('modal');
  if (!backdrop || !modal) return;

  modal.querySelector('.kn-modal__title').textContent = job.title;
  modal.querySelector('.kn-modal__company').textContent = job.company;
  modal.querySelector('.kn-modal__skills').innerHTML = `
    <span class="kn-modal__skills-label">Skills:</span>
    ${job.skills.map((s) => `<span class="kn-modal__skill">${s}</span>`).join('')}
  `;
  modal.querySelector('.kn-modal__description').textContent = job.description;

  backdrop.classList.add('kn-modal-backdrop--visible');
  modal.classList.add('kn-modal--visible');
  modal.setAttribute('aria-hidden', 'false');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const backdrop = document.getElementById('modal-backdrop');
  const modal = document.getElementById('modal');
  if (!backdrop || !modal) return;

  backdrop.classList.remove('kn-modal-backdrop--visible');
  modal.classList.remove('kn-modal--visible');
  modal.setAttribute('aria-hidden', 'true');
  backdrop.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
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

  if (route === 'dashboard') {
    const container = document.getElementById('filters-container');
    if (container) renderFilterBar(container, JOBS);
  }
}

function bindPageEvents(content, route) {
  if (route === '') {
    const cta = content.querySelector('[data-action="start-tracking"]');
    cta?.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('settings');
    });
  }

  if (route === 'dashboard' || route === 'saved') {
    content.querySelectorAll('[data-action="view"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        const job = JOBS.find((j) => j.id === id);
        if (job) openModal(job);
      });
    });
    content.querySelectorAll('[data-action="save"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        saveJobId(id);
        renderPage(route);
      });
    });
    content.querySelectorAll('[data-action="unsave"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        unsaveJobId(id);
        renderPage(route);
      });
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
  const filtered = getFilteredJobs(JOBS);

  return `
    <div class="kn-page kn-page--wide">
    <div class="kn-page__header">
      <h1 class="kn-page__title">Dashboard</h1>
    </div>
    <div class="kn-filters-wrap" id="filters-container"></div>
    <div class="kn-jobs">
      ${filtered.length === 0
        ? '<div class="kn-empty"><p class="kn-empty__message">No jobs match your filters. Try adjusting your search.</p></div>'
        : filtered.map((j) => renderJobCard(j, false)).join('')}
    </div>
    </div>
  `;
}

function renderSaved() {
  const savedIds = getSavedIds();
  const savedJobs = JOBS.filter((j) => savedIds.includes(j.id));

  if (savedJobs.length === 0) {
    return `
      <div class="kn-page">
      <div class="kn-page__header">
        <h1 class="kn-page__title">Saved</h1>
      </div>
      <div class="kn-empty">
        <p class="kn-empty__message">No saved jobs yet. Jobs you save will appear here.</p>
      </div>
      </div>
    `;
  }

  return `
    <div class="kn-page kn-page--wide">
    <div class="kn-page__header">
      <h1 class="kn-page__title">Saved</h1>
    </div>
    <div class="kn-jobs">
      ${savedJobs.map((j) => renderJobCard(j, true)).join('')}
    </div>
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

  document.getElementById('modal-backdrop')?.addEventListener('click', closeModal);
  document.querySelector('.kn-modal__close')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

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
