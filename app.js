/**
 * Job Notification Tracker — Premium SaaS App
 * Client-side routing, filtering, match scoring, and job rendering
 */

const ROUTES = ['', 'dashboard', 'saved', 'digest', 'settings', 'proof', 'jt/07-test', 'jt/08-ship', 'jt/proof'];
const PROOF_ARTIFACTS_KEY = 'jobTrackerProofArtifacts';
const TEST_CHECKLIST_KEY = 'jobTrackerTestChecklist';

const TEST_ITEMS = [
  { id: 0, label: 'Preferences persist after refresh', hint: 'Save preferences in Settings, refresh page, confirm values are still there.' },
  { id: 1, label: 'Match score calculates correctly', hint: 'Set preferences, check job cards show numeric scores matching spec rules.' },
  { id: 2, label: '"Show only matches" toggle works', hint: 'Enable toggle on Dashboard, confirm only jobs above threshold appear.' },
  { id: 3, label: 'Save job persists after refresh', hint: 'Save a job, refresh, go to Saved — job should still appear.' },
  { id: 4, label: 'Apply opens in new tab', hint: 'Click Apply on any job card, confirm it opens in a new tab.' },
  { id: 5, label: 'Status update persists after refresh', hint: 'Change status to Applied/Rejected/Selected, refresh — status should remain.' },
  { id: 6, label: 'Status filter works correctly', hint: 'Filter by Applied on Dashboard, confirm only Applied jobs show.' },
  { id: 7, label: 'Digest generates top 10 by score', hint: 'Generate digest, confirm 10 jobs sorted by match score.' },
  { id: 8, label: 'Digest persists for the day', hint: 'Generate digest, refresh page — digest should still be visible.' },
  { id: 9, label: 'No console errors on main pages', hint: 'Navigate Dashboard, Saved, Digest, Settings — check DevTools console for errors.' }
];
const SAVED_IDS_KEY = 'job-tracker-saved-ids';
const PREFERENCES_KEY = 'jobTrackerPreferences';
const STATUS_KEY = 'jobTrackerStatus';
const STATUS_UPDATES_KEY = 'jobTrackerStatusUpdates';

const JOB_STATUSES = ['Not Applied', 'Applied', 'Rejected', 'Selected'];

const DEFAULT_PREFERENCES = {
  roleKeywords: '',
  preferredLocations: [],
  preferredMode: [],
  experienceLevel: '',
  skills: '',
  minMatchScore: 40
};

let filterState = {
  keyword: '',
  location: '',
  mode: '',
  experience: '',
  source: '',
  status: '',
  sort: 'latest',
  showMatchesOnly: false
};

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const path = window.location.pathname.replace(/^\//, '').split('/')[0] || '';
  if (hash) return hash;
  if (path && ROUTES.includes(path)) return path;
  return '';
}

function getPreferences() {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return null;
  }
}

function savePreferences(prefs) {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
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

function getJobStatuses() {
  try {
    const raw = localStorage.getItem(STATUS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function getJobStatus(jobId) {
  const statuses = getJobStatuses();
  return statuses[jobId] || 'Not Applied';
}

function setJobStatus(jobId, status, job) {
  const statuses = getJobStatuses();
  statuses[jobId] = status;
  localStorage.setItem(STATUS_KEY, JSON.stringify(statuses));

  if (['Applied', 'Rejected', 'Selected'].includes(status) && job) {
    const updates = getStatusUpdates();
    updates.unshift({
      jobId,
      title: job.title,
      company: job.company,
      status,
      dateChanged: new Date().toISOString()
    });
    localStorage.setItem(STATUS_UPDATES_KEY, JSON.stringify(updates.slice(0, 50)));
  }
}

function getStatusUpdates() {
  try {
    const raw = localStorage.getItem(STATUS_UPDATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getTestChecklist() {
  try {
    const raw = localStorage.getItem(TEST_CHECKLIST_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setTestChecklistItem(id, checked) {
  const checklist = getTestChecklist();
  checklist[id] = checked;
  localStorage.setItem(TEST_CHECKLIST_KEY, JSON.stringify(checklist));
}

function resetTestChecklist() {
  localStorage.removeItem(TEST_CHECKLIST_KEY);
}

function getAllTestsPassed() {
  const checklist = getTestChecklist();
  return TEST_ITEMS.every((item) => checklist[item.id] === true);
}

function getProofArtifacts() {
  try {
    const raw = localStorage.getItem(PROOF_ARTIFACTS_KEY);
    return raw ? JSON.parse(raw) : { githubUrl: '', deployedUrl: '' };
  } catch {
    return { githubUrl: '', deployedUrl: '' };
  }
}

function saveProofArtifacts(artifacts) {
  localStorage.setItem(PROOF_ARTIFACTS_KEY, JSON.stringify(artifacts));
}

function isValidUrl(str) {
  if (!str || typeof str !== 'string') return false;
  try {
    const url = new URL(str.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function getProjectStatus() {
  const artifacts = getProofArtifacts();
  const hasGithub = isValidUrl(artifacts.githubUrl);
  const hasDeployed = isValidUrl(artifacts.deployedUrl);
  const allTestsPassed = getAllTestsPassed();

  if (allTestsPassed && hasGithub && hasDeployed) return 'shipped';
  if (hasGithub || hasDeployed || allTestsPassed) return 'in-progress';
  return 'not-started';
}

const PROOF_STEPS = [
  { id: 1, label: 'Design system created', check: () => true },
  { id: 2, label: 'Route skeleton', check: () => true },
  { id: 3, label: 'Landing and app skeleton', check: () => true },
  { id: 4, label: 'Job dataset and rendering', check: () => true },
  { id: 5, label: 'Preferences and match scoring', check: () => !!getPreferences() },
  { id: 6, label: 'Digest engine', check: () => !!getTodayDigest() },
  { id: 7, label: 'Status tracking', check: () => Object.keys(getJobStatuses()).length > 0 || getStatusUpdates().length > 0 },
  { id: 8, label: 'Test checklist', check: () => getAllTestsPassed() }
];

function getTestsPassedCount() {
  const checklist = getTestChecklist();
  return TEST_ITEMS.filter((item) => checklist[item.id] === true).length;
}

function showToast(message) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = 'kn-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('kn-toast--visible'));
  setTimeout(() => {
    toast.classList.remove('kn-toast--visible');
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}

function getDigestKey(date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `jobTrackerDigest_${y}-${m}-${day}`;
}

function getTodayDigest() {
  try {
    const raw = localStorage.getItem(getDigestKey());
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function generateTodayDigest() {
  const prefs = getPreferences();
  if (!prefs) return null;

  const jobsWithScores = JOBS.map((j) => ({
    ...j,
    matchScore: computeMatchScore(j, prefs)
  }));

  const sorted = [...jobsWithScores].sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    return a.postedDaysAgo - b.postedDaysAgo;
  });

  const top10 = sorted.slice(0, 10);
  const digest = { date: getDigestKey().replace('jobTrackerDigest_', ''), jobs: top10 };
  localStorage.setItem(getDigestKey(), JSON.stringify(digest));
  return digest;
}

function getOrGenerateDigest() {
  const existing = getTodayDigest();
  if (existing) return existing;
  return generateTodayDigest();
}

function formatStatusDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function renderStatusUpdatesSection() {
  const updates = getStatusUpdates();
  if (updates.length === 0) return '';

  return `
    <div class="kn-digest-status-updates">
      <h3 class="kn-digest-status-updates__title">Recent Status Updates</h3>
      <div class="kn-digest-status-updates__list">
        ${updates.slice(0, 10).map((u) => `
          <div class="kn-digest-status-update">
            <span class="kn-digest-status-update__title">${u.title}</span>
            <span class="kn-digest-status-update__company">${u.company}</span>
            <span class="kn-digest-status-update__status kn-digest-status-update__status--${u.status.toLowerCase().replace(/\s+/g, '-')}">${u.status}</span>
            <span class="kn-digest-status-update__date">${formatStatusDate(u.dateChanged)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function formatDigestAsPlainText(jobs) {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const header = `Top 10 Jobs For You — 9AM Digest\n${dateStr}\n\n`;
  const body = jobs
    .map(
      (j, i) =>
        `${i + 1}. ${j.title} — ${j.company}\n   ${j.location} · ${j.experience} · Match: ${j.matchScore}\n   ${j.applyUrl}`
    )
    .join('\n\n');
  return header + body;
}

/**
 * Match score engine — exact rules per specification:
 * +25 if any roleKeyword in job.title (case-insensitive)
 * +15 if any roleKeyword in job.description
 * +15 if job.location in preferredLocations
 * +10 if job.mode in preferredMode
 * +10 if job.experience matches experienceLevel
 * +15 if overlap between job.skills and user.skills
 * +5 if postedDaysAgo <= 2
 * +5 if source is LinkedIn
 * Cap at 100
 */
function computeMatchScore(job, prefs) {
  if (!prefs) return 0;

  let score = 0;

  const roleKeywords = (prefs.roleKeywords || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const userSkills = (prefs.skills || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const preferredLocations = (prefs.preferredLocations || []).map((l) =>
    l.toLowerCase()
  );
  const preferredMode = (prefs.preferredMode || []).map((m) => m.toLowerCase());

  if (roleKeywords.length > 0) {
    const titleLower = job.title.toLowerCase();
    if (roleKeywords.some((k) => titleLower.includes(k))) score += 25;
  }

  if (roleKeywords.length > 0 && job.description) {
    const descLower = job.description.toLowerCase();
    if (roleKeywords.some((k) => descLower.includes(k))) score += 15;
  }

  if (preferredLocations.length > 0) {
    if (preferredLocations.includes(job.location.toLowerCase())) score += 15;
  }

  if (preferredMode.length > 0) {
    if (preferredMode.includes(job.mode.toLowerCase())) score += 10;
  }

  if (prefs.experienceLevel) {
    if (
      job.experience.toLowerCase() === prefs.experienceLevel.toLowerCase()
    ) {
      score += 10;
    }
  }

  if (userSkills.length > 0 && job.skills) {
    const jobSkillsLower = job.skills.map((s) => s.toLowerCase());
    const hasOverlap = userSkills.some((us) =>
      jobSkillsLower.some((js) => js.includes(us) || us.includes(js))
    );
    if (hasOverlap) score += 15;
  }

  if (job.postedDaysAgo <= 2) score += 5;

  if (job.source && job.source.toLowerCase() === 'linkedin') score += 5;

  return Math.min(score, 100);
}

function getMatchScoreBadgeClass(score) {
  if (score >= 80) return 'kn-job-card__score--high';
  if (score >= 60) return 'kn-job-card__score--medium';
  if (score >= 40) return 'kn-job-card__score--neutral';
  return 'kn-job-card__score--low';
}

function extractSalaryValue(salaryRange) {
  if (!salaryRange) return 0;
  const match = salaryRange.match(/₹?(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function getFilteredJobs(jobs) {
  const prefs = getPreferences();
  let result = jobs.map((job) => ({
    ...job,
    matchScore: computeMatchScore(job, prefs)
  }));

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

  if (filterState.status) {
    result = result.filter((j) => getJobStatus(j.id) === filterState.status);
  }

  if (filterState.showMatchesOnly && prefs) {
    const threshold = prefs.minMatchScore ?? 40;
    result = result.filter((j) => j.matchScore >= threshold);
  }

  if (filterState.sort === 'latest') {
    result.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
  } else if (filterState.sort === 'oldest') {
    result.sort((a, b) => b.postedDaysAgo - a.postedDaysAgo);
  } else if (filterState.sort === 'match') {
    result.sort((a, b) => b.matchScore - a.matchScore);
  } else if (filterState.sort === 'salary') {
    result.sort(
      (a, b) =>
        extractSalaryValue(b.salaryRange) - extractSalaryValue(a.salaryRange)
    );
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
  const prefs = getPreferences();

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
      <select class="kn-input kn-input--select kn-filters__select" data-filter="status">
        <option value="">All</option>
        ${JOB_STATUSES.map((s) => `<option value="${s}" ${filterState.status === s ? 'selected' : ''}>${s}</option>`).join('')}
      </select>
      <select class="kn-input kn-input--select kn-filters__select" data-filter="sort">
        <option value="latest" ${filterState.sort === 'latest' ? 'selected' : ''}>Latest</option>
        <option value="oldest" ${filterState.sort === 'oldest' ? 'selected' : ''}>Oldest</option>
        <option value="match" ${filterState.sort === 'match' ? 'selected' : ''}>Match Score</option>
        <option value="salary" ${filterState.sort === 'salary' ? 'selected' : ''}>Salary</option>
      </select>
    </div>
    <label class="kn-filters__toggle">
      <input type="checkbox" class="kn-filters__checkbox" ${filterState.showMatchesOnly ? 'checked' : ''} data-action="show-matches">
      <span>Show only jobs above my threshold</span>
    </label>
  `;

  let searchTimeout;
  container.querySelector('.kn-filters__search').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      filterState.keyword = e.target.value;
      renderPage(getRoute());
    }, 200);
  });
  container.querySelectorAll('[data-filter]').forEach((el) => {
    el.addEventListener('change', (e) => {
      filterState[e.target.dataset.filter] = e.target.value;
      renderPage(getRoute());
    });
  });
  container.querySelector('[data-action="show-matches"]')?.addEventListener('change', (e) => {
    filterState.showMatchesOnly = e.target.checked;
    renderPage(getRoute());
  });
}

function getStatusBadgeClass(status) {
  const map = {
    'Not Applied': 'kn-job-card__status--neutral',
    Applied: 'kn-job-card__status--applied',
    Rejected: 'kn-job-card__status--rejected',
    Selected: 'kn-job-card__status--selected'
  };
  return map[status] || 'kn-job-card__status--neutral';
}

function renderJobCard(job, showUnsave = false) {
  const saved = isSaved(job.id);
  const score = job.matchScore ?? 0;
  const scoreClass = getMatchScoreBadgeClass(score);
  const status = getJobStatus(job.id);
  const statusClass = getStatusBadgeClass(status);

  return `
    <article class="kn-job-card" data-id="${job.id}">
      <div class="kn-job-card__header">
        <h3 class="kn-job-card__title">${job.title}</h3>
        <div class="kn-job-card__badges">
          <span class="kn-job-card__score ${scoreClass}">${score}</span>
          <span class="kn-job-card__badge kn-job-card__badge--${job.source.toLowerCase()}">${job.source}</span>
        </div>
      </div>
      <p class="kn-job-card__company">${job.company}</p>
      <p class="kn-job-card__meta">${job.location} · ${job.mode} · ${job.experience}</p>
      <p class="kn-job-card__salary">${job.salaryRange}</p>
      <p class="kn-job-card__posted">${formatPosted(job.postedDaysAgo)}</p>
      <div class="kn-job-card__status-group">
        ${JOB_STATUSES.map((s) => `<button type="button" class="kn-job-card__status-btn ${status === s ? statusClass : ''}" data-action="set-status" data-id="${job.id}" data-status="${s}">${s}</button>`).join('')}
      </div>
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
    proof: renderProof,
    'jt/07-test': renderTestChecklist,
    'jt/08-ship': renderShip,
    'jt/proof': renderJtProof
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

  if (route === 'settings') {
    const slider = content.querySelector('#min-match-score');
    const valueEl = content.querySelector('#min-match-value');
    slider?.addEventListener('input', (e) => {
      if (valueEl) valueEl.textContent = e.target.value;
    });

    const form = content.querySelector('#settings-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const prefs = {
        roleKeywords: content.querySelector('#role-keywords')?.value?.trim() || '',
        preferredLocations: Array.from(
          content.querySelector('#preferred-locations')?.selectedOptions || []
        ).map((o) => o.value),
        preferredMode: Array.from(
          content.querySelectorAll('input[name="preferred-mode"]:checked')
        ).map((c) => c.value),
        experienceLevel: content.querySelector('#experience-level')?.value || '',
        skills: content.querySelector('#skills')?.value?.trim() || '',
        minMatchScore: parseInt(
          content.querySelector('#min-match-score')?.value || '40',
          10
        )
      };
      savePreferences(prefs);
      navigate('dashboard');
    });
  }

  if (route === 'jt/proof') {
    content.querySelector('[data-action="save-proof"]')?.addEventListener('click', () => {
      const github = content.querySelector('#proof-github')?.value?.trim() || '';
      const deployed = content.querySelector('#proof-deployed')?.value?.trim() || '';
      const githubError = content.querySelector('#proof-github-error');
      const deployedError = content.querySelector('#proof-deployed-error');
      let valid = true;
      if (github && !isValidUrl(github)) {
        if (githubError) githubError.textContent = 'Enter a valid URL';
        valid = false;
      } else if (githubError) githubError.textContent = '';
      if (deployed && !isValidUrl(deployed)) {
        if (deployedError) deployedError.textContent = 'Enter a valid URL';
        valid = false;
      } else if (deployedError) deployedError.textContent = '';
      if (valid) {
        saveProofArtifacts({ githubUrl: github, deployedUrl: deployed });
        if (githubError) githubError.textContent = '';
        if (deployedError) deployedError.textContent = '';
        renderPage('jt/proof');
        setActiveNav('jt/proof');
      }
    });
    content.querySelector('[data-action="copy-submission"]')?.addEventListener('click', () => {
      const github = content.querySelector('#proof-github')?.value?.trim() || '';
      const deployed = content.querySelector('#proof-deployed')?.value?.trim() || '';
      const artifacts = getProofArtifacts();
      if (github && isValidUrl(github)) artifacts.githubUrl = github;
      if (deployed && isValidUrl(deployed)) artifacts.deployedUrl = deployed;
      saveProofArtifacts(artifacts);
      const text = `------------------------------------------
Job Notification Tracker — Final Submission

GitHub Repository:
${artifacts.githubUrl || '(not provided)'}

Live Deployment:
${artifacts.deployedUrl || '(not provided)'}

Core Features:
- Intelligent match scoring
- Daily digest simulation
- Status tracking
- Test checklist enforced
------------------------------------------`;
      navigator.clipboard.writeText(text).then(() => {
        showToast('Submission copied to clipboard');
      });
    });
    content.querySelector('#proof-github')?.addEventListener('blur', (e) => {
      const v = e.target.value?.trim();
      const err = content.querySelector('#proof-github-error');
      if (v && !isValidUrl(v) && err) err.textContent = 'Enter a valid URL';
      else if (err) err.textContent = '';
    });
    content.querySelector('#proof-deployed')?.addEventListener('blur', (e) => {
      const v = e.target.value?.trim();
      const err = content.querySelector('#proof-deployed-error');
      if (v && !isValidUrl(v) && err) err.textContent = 'Enter a valid URL';
      else if (err) err.textContent = '';
    });
  }

  if (route === 'jt/07-test') {
    content.querySelectorAll('.kn-test-item__checkbox').forEach((cb) => {
      cb.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.testId, 10);
        setTestChecklistItem(id, e.target.checked);
        renderPage('jt/07-test');
      });
    });
    content.querySelector('[data-action="reset-tests"]')?.addEventListener('click', () => {
      resetTestChecklist();
      renderPage('jt/07-test');
    });
  }

  if (route === 'digest') {
    content.querySelector('[data-action="generate-digest"]')?.addEventListener('click', () => {
      getOrGenerateDigest();
      renderPage('digest');
    });
    content.querySelector('[data-action="copy-digest"]')?.addEventListener('click', () => {
      const digest = getTodayDigest();
      if (digest?.jobs?.length) {
        const text = formatDigestAsPlainText(digest.jobs);
        navigator.clipboard.writeText(text).then(() => {
          const btn = content.querySelector('[data-action="copy-digest"]');
          if (btn) {
            const orig = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = orig; }, 1500);
          }
        });
      }
    });
    content.querySelector('[data-action="email-draft"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      const digest = getTodayDigest();
      if (digest?.jobs?.length) {
        const body = encodeURIComponent(formatDigestAsPlainText(digest.jobs));
        const subject = encodeURIComponent('My 9AM Job Digest');
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
    });
  }

  if (route === 'dashboard' || route === 'saved') {
    content.querySelectorAll('[data-action="set-status"]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id, 10);
        const status = e.target.dataset.status;
        const job = JOBS.find((j) => j.id === id);
        if (job) {
          setJobStatus(id, status, job);
          if (['Applied', 'Rejected', 'Selected'].includes(status)) {
            showToast(`Status updated: ${status}`);
          }
          renderPage(route);
        }
      });
    });
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
  const prefs = getPreferences();
  const filtered = getFilteredJobs(JOBS);

  const emptyMessage =
    filterState.showMatchesOnly && prefs
      ? 'No roles match your criteria. Adjust filters or lower threshold.'
      : 'No jobs match your filters. Try adjusting your search.';

  const banner = !prefs
    ? '<div class="kn-banner">Set your preferences to activate intelligent matching.</div>'
    : '';

  return `
    <div class="kn-page kn-page--wide">
    ${banner}
    <div class="kn-page__header">
      <h1 class="kn-page__title">Dashboard</h1>
    </div>
    <div class="kn-filters-wrap" id="filters-container"></div>
    <div class="kn-jobs">
      ${filtered.length === 0
        ? `<div class="kn-empty"><p class="kn-empty__message">${emptyMessage}</p></div>`
        : filtered.map((j) => renderJobCard(j, false)).join('')}
    </div>
    </div>
  `;
}

function renderSaved() {
  const savedIds = getSavedIds();
  const savedJobs = JOBS.filter((j) => savedIds.includes(j.id)).map((j) => ({
    ...j,
    matchScore: computeMatchScore(j, getPreferences())
  }));

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
  const prefs = getPreferences();
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!prefs) {
    return `
      <div class="kn-page">
        <div class="kn-page__header">
          <h1 class="kn-page__title">Digest</h1>
        </div>
        <div class="kn-digest-block">
          <p class="kn-digest-block__message">Set preferences to generate a personalized digest.</p>
          <a href="#/settings" class="kn-btn kn-btn--primary">Go to Settings</a>
        </div>
      </div>
    `;
  }

  const digest = getTodayDigest();
  const digestJobs = digest?.jobs || [];
  const hasDigest = digest !== null;

  if (hasDigest && digestJobs.length === 0) {
    return `
      <div class="kn-page kn-page--digest">
        <div class="kn-page__header">
          <h1 class="kn-page__title">Digest</h1>
        </div>
        <div class="kn-digest-actions">
          <button type="button" class="kn-btn kn-btn--secondary" data-action="generate-digest">Generate Today's 9AM Digest (Simulated)</button>
        </div>
        <p class="kn-digest__note">Demo Mode: Daily 9AM trigger simulated manually.</p>
        <div class="kn-digest-block">
          <p class="kn-digest-block__message">No matching roles today. Check again tomorrow.</p>
        </div>
        ${renderStatusUpdatesSection()}
      </div>
    `;
  }

  if (!hasDigest) {
    return `
      <div class="kn-page kn-page--digest">
        <div class="kn-page__header">
          <h1 class="kn-page__title">Digest</h1>
        </div>
        <div class="kn-digest-actions">
          <button type="button" class="kn-btn kn-btn--secondary" data-action="generate-digest">Generate Today's 9AM Digest (Simulated)</button>
        </div>
        <p class="kn-digest__note">Demo Mode: Daily 9AM trigger simulated manually.</p>
        ${renderStatusUpdatesSection()}
      </div>
    `;
  }

  return `
    <div class="kn-page kn-page--digest">
      <div class="kn-page__header">
        <h1 class="kn-page__title">Digest</h1>
      </div>
      <div class="kn-digest-actions">
        <button type="button" class="kn-btn kn-btn--secondary" data-action="generate-digest">Generate Today's 9AM Digest (Simulated)</button>
      </div>
      <p class="kn-digest__note">Demo Mode: Daily 9AM trigger simulated manually.</p>
      <div class="kn-digest-card">
        <h2 class="kn-digest-card__title">Top 10 Jobs For You — 9AM Digest</h2>
        <p class="kn-digest-card__date">${dateStr}</p>
        <div class="kn-digest-card__jobs">
          ${digestJobs
            .map(
              (j) => `
            <div class="kn-digest-item">
              <div class="kn-digest-item__header">
                <h3 class="kn-digest-item__title">${j.title}</h3>
                <span class="kn-digest-item__score">${j.matchScore}</span>
              </div>
              <p class="kn-digest-item__company">${j.company}</p>
              <p class="kn-digest-item__meta">${j.location} · ${j.experience}</p>
              <a href="${j.applyUrl}" target="_blank" rel="noopener" class="kn-btn kn-btn--primary kn-digest-item__apply">Apply</a>
            </div>
          `
            )
            .join('')}
        </div>
        <p class="kn-digest-card__footer">This digest was generated based on your preferences.</p>
        <div class="kn-digest-card__actions">
          <button type="button" class="kn-btn kn-btn--secondary" data-action="copy-digest">Copy Digest to Clipboard</button>
          <a href="#" class="kn-btn kn-btn--secondary" data-action="email-draft">Create Email Draft</a>
        </div>
      </div>
      ${renderStatusUpdatesSection()}
    </div>
  `;
}

function renderSettings() {
  const prefs = getPreferences() || DEFAULT_PREFERENCES;
  const locations = getUniqueValues(JOBS, 'location');

  return `
    <div class="kn-page__header">
      <h1 class="kn-page__title">Settings</h1>
      <p class="kn-page__subtext">Configure your job preferences.</p>
    </div>
    <form id="settings-form" class="kn-settings">
      <div class="kn-settings__field">
        <label class="kn-settings__label" for="role-keywords">Role keywords</label>
        <input type="text" id="role-keywords" class="kn-input" placeholder="e.g. Frontend, React, Full Stack" value="${prefs.roleKeywords || ''}">
      </div>
      <div class="kn-settings__field">
        <label class="kn-settings__label" for="preferred-locations">Preferred locations</label>
        <select id="preferred-locations" class="kn-input kn-input--select kn-input--multi" multiple>
          ${locations.map((l) => `<option value="${l}" ${(prefs.preferredLocations || []).includes(l) ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
        <span class="kn-settings__hint">Hold Ctrl/Cmd to select multiple</span>
      </div>
      <div class="kn-settings__field">
        <label class="kn-settings__label">Preferred mode</label>
        <div class="kn-settings__checkboxes">
          <label class="kn-settings__checkbox-label"><input type="checkbox" name="preferred-mode" value="Remote" ${(prefs.preferredMode || []).includes('Remote') ? 'checked' : ''}> Remote</label>
          <label class="kn-settings__checkbox-label"><input type="checkbox" name="preferred-mode" value="Hybrid" ${(prefs.preferredMode || []).includes('Hybrid') ? 'checked' : ''}> Hybrid</label>
          <label class="kn-settings__checkbox-label"><input type="checkbox" name="preferred-mode" value="Onsite" ${(prefs.preferredMode || []).includes('Onsite') ? 'checked' : ''}> Onsite</label>
        </div>
      </div>
      <div class="kn-settings__field">
        <label class="kn-settings__label" for="experience-level">Experience level</label>
        <select id="experience-level" class="kn-input kn-input--select">
          <option value="">Select level</option>
          <option value="Fresher" ${prefs.experienceLevel === 'Fresher' ? 'selected' : ''}>Fresher</option>
          <option value="0-1" ${prefs.experienceLevel === '0-1' ? 'selected' : ''}>0-1</option>
          <option value="1-3" ${prefs.experienceLevel === '1-3' ? 'selected' : ''}>1-3</option>
          <option value="3-5" ${prefs.experienceLevel === '3-5' ? 'selected' : ''}>3-5</option>
        </select>
      </div>
      <div class="kn-settings__field">
        <label class="kn-settings__label" for="skills">Skills</label>
        <input type="text" id="skills" class="kn-input" placeholder="e.g. React, Python, Java" value="${prefs.skills || ''}">
      </div>
      <div class="kn-settings__field">
        <label class="kn-settings__label" for="min-match-score">Minimum match threshold: <span id="min-match-value">${prefs.minMatchScore ?? 40}</span></label>
        <input type="range" id="min-match-score" class="kn-slider" min="0" max="100" value="${prefs.minMatchScore ?? 40}">
      </div>
      <button type="submit" class="kn-btn kn-btn--primary">Save Preferences</button>
    </form>
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

function renderTestChecklist() {
  const passed = getTestsPassedCount();
  const total = TEST_ITEMS.length;
  const allPassed = passed === total;
  const checklist = getTestChecklist();

  return `
    <div class="kn-page kn-page--test">
      <div class="kn-page__header">
        <h1 class="kn-page__title">Test Checklist</h1>
        <p class="kn-page__subtext">Verify all features before shipping.</p>
      </div>
      <div class="kn-test-summary ${allPassed ? 'kn-test-summary--pass' : 'kn-test-summary--warn'}">
        <span class="kn-test-summary__count">Tests Passed: ${passed} / ${total}</span>
        ${!allPassed ? '<p class="kn-test-summary__warning">Resolve all issues before shipping.</p>' : ''}
      </div>
      <div class="kn-test-actions">
        <button type="button" class="kn-btn kn-btn--secondary kn-btn--sm" data-action="reset-tests">Reset Test Status</button>
      </div>
      <div class="kn-test-checklist">
        ${TEST_ITEMS.map(
          (item) => `
          <label class="kn-test-item">
            <input type="checkbox" class="kn-test-item__checkbox" data-test-id="${item.id}" ${checklist[item.id] ? 'checked' : ''}>
            <span class="kn-test-item__label">${item.label}</span>
            <span class="kn-test-item__hint" title="${item.hint}">?</span>
          </label>
        `
        ).join('')}
      </div>
    </div>
  `;
}

function renderJtProof() {
  const artifacts = getProofArtifacts();
  const status = getProjectStatus();
  const statusLabels = { 'not-started': 'Not Started', 'in-progress': 'In Progress', shipped: 'Shipped' };

  return `
    <div class="kn-page kn-page--proof">
      <div class="kn-page__header">
        <h1 class="kn-page__title">Project 1 — Job Notification Tracker</h1>
        <span class="kn-proof-badge kn-proof-badge--${status}">${statusLabels[status]}</span>
      </div>

      <section class="kn-proof-section">
        <h2 class="kn-proof-section__title">A) Step Completion Summary</h2>
        <div class="kn-proof-steps">
          ${PROOF_STEPS.map((s) => {
            const done = s.check();
            return `
            <div class="kn-proof-step ${done ? 'kn-proof-step--done' : ''}">
              <span class="kn-proof-step__status">${done ? 'Completed' : 'Pending'}</span>
              <span class="kn-proof-step__label">${s.label}</span>
            </div>
          `;
          }).join('')}
        </div>
      </section>

      <section class="kn-proof-section">
        <h2 class="kn-proof-section__title">B) Artifact Collection Inputs</h2>
        <div class="kn-proof-artifacts">
          <div class="kn-settings__field">
            <label class="kn-settings__label" for="proof-github">GitHub Repository Link</label>
            <input type="url" id="proof-github" class="kn-input" placeholder="https://github.com/..." value="${artifacts.githubUrl || ''}">
            <span class="kn-proof-error" id="proof-github-error"></span>
          </div>
          <div class="kn-settings__field">
            <label class="kn-settings__label" for="proof-deployed">Deployed URL (Vercel or equivalent)</label>
            <input type="url" id="proof-deployed" class="kn-input" placeholder="https://your-app.vercel.app" value="${artifacts.deployedUrl || ''}">
            <span class="kn-proof-error" id="proof-deployed-error"></span>
          </div>
        </div>
      </section>

      <div class="kn-proof-actions">
        <button type="button" class="kn-btn kn-btn--secondary" data-action="save-proof">Save Artifacts</button>
        <button type="button" class="kn-btn kn-btn--primary" data-action="copy-submission">Copy Final Submission</button>
      </div>

      ${status === 'shipped' ? '<p class="kn-proof-shipped">Project 1 Shipped Successfully.</p>' : ''}
    </div>
  `;
}

function renderShip() {
  const allPassed = getAllTestsPassed();
  const status = getProjectStatus();

  if (!allPassed) {
    return `
      <div class="kn-page kn-page--ship">
        <div class="kn-page__header">
          <h1 class="kn-page__title">Ship</h1>
        </div>
        <div class="kn-ship-lock">
          <p class="kn-ship-lock__message">Complete all 10 test checklist items to unlock Ship.</p>
          <a href="#/jt/07-test" class="kn-btn kn-btn--primary">Go to Test Checklist</a>
        </div>
      </div>
    `;
  }

  if (status === 'shipped') {
    return `
      <div class="kn-page kn-page--ship">
        <div class="kn-page__header">
          <h1 class="kn-page__title">Ship</h1>
          <span class="kn-proof-badge kn-proof-badge--shipped">Shipped</span>
        </div>
        <div class="kn-ship-unlocked">
          <p class="kn-proof-shipped">Project 1 Shipped Successfully.</p>
          <p class="kn-ship-unlocked__message">All quality checks complete. You may proceed with deployment.</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="kn-page kn-page--ship">
      <div class="kn-page__header">
        <h1 class="kn-page__title">Ship</h1>
        <p class="kn-page__subtext">All tests passed. Add proof artifacts to mark as Shipped.</p>
      </div>
      <div class="kn-ship-unlocked">
        <p class="kn-ship-unlocked__message">Complete artifact collection on the Proof page to mark Project 1 as Shipped.</p>
        <a href="#/jt/proof" class="kn-btn kn-btn--primary">Go to Proof</a>
      </div>
    </div>
  `;
}

function setActiveNav(route) {
  document.querySelectorAll('.kn-nav__link').forEach((link) => {
    const linkRoute = link.getAttribute('data-route') || link.getAttribute('href')?.replace(/^#\/?/, '') || '';
    link.classList.toggle('kn-nav__link--active', linkRoute === route);
  });
  const shipLink = document.querySelector('[data-route="jt/08-ship"]');
  if (shipLink) {
    shipLink.classList.toggle('kn-nav__link--locked', !getAllTestsPassed());
    shipLink.title = getAllTestsPassed() ? 'Ship' : 'Complete all tests to unlock';
  }
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
