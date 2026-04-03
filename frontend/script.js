// =====================
// STATO GLOBALE
// =====================
let currentOffset = 0;
const LIMIT = 6;
let currentFilter = 'all';

// =====================
// API FUNCTIONS
// =====================

async function apiLogin(username, password) {
  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    let message = 'Errore di login';
    try { const data = await response.json(); if (data && data.error) message = data.error; } catch (_) {}
    throw new Error(message);
  }
  return response.json();
}

async function apiGetDestinations(q = '') {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('limit', '1000');
  params.set('offset', '0');
  const response = await fetch(`/destinations?${params.toString()}`);
  if (!response.ok) {
    let message = 'Errore nel caricamento delle destinazioni';
    try { const data = await response.json(); if (data && data.error) message = data.error; } catch (_) {}
    throw new Error(message);
  }
  return response.json();
}

async function apiGetDestinationById(id) {
  const response = await fetch(`/destinations/${id}`);
  if (!response.ok) {
    let message = 'Errore nel caricamento della destinazione';
    try { const data = await response.json(); if (data && data.error) message = data.error; } catch (_) {}
    throw new Error(message);
  }
  return response.json();
}

// =====================
// UTILITIES
// =====================

function formatCurrencyEUR(value) {
  return '€' + Number(value).toFixed(2);
}

function getCurrentUserId() {
  const raw = localStorage.getItem('userId');
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

// =====================
// GESTIONE VISTE
// =====================

function showListView() {
  document.getElementById('list-view').classList.remove('hidden');
  document.getElementById('detail-view').classList.add('hidden');
}

async function showDetailView(id) {
  document.getElementById('list-view').classList.add('hidden');
  document.getElementById('detail-view').classList.remove('hidden');
}

// =====================
// LIST VIEW
// =====================

function renderDestinations(results, total) {
  const list = document.getElementById('destination-list');
  if (!list) return;
  while (list.firstChild) list.removeChild(list.firstChild);

  if (results.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'col-span-full py-10 text-center text-slate-400';
    empty.innerHTML = '<p class="text-sm">Nessuna destinazione trovata</p>';
    list.appendChild(empty);
    return;
  }

  const currentUserId = getCurrentUserId();
  const isLoggedIn = currentUserId !== null;
  const fragment = document.createDocumentFragment();

  results.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'destination-card rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-2 cursor-pointer';
    card.dataset.id = String(item.id);

    const header = document.createElement('div');
    header.className = 'flex items-start justify-between gap-2';

    const titleBox = document.createElement('div');
    titleBox.className = 'min-w-0';
    const title = document.createElement('h3');
    title.className = 'font-semibold text-slate-900 text-sm truncate';
    title.textContent = item.nome;
    const country = document.createElement('p');
    country.className = 'text-xs text-slate-500 mt-0.5';
    country.textContent = item.paese;
    titleBox.appendChild(title);
    titleBox.appendChild(country);
    header.appendChild(titleBox);

    if (isLoggedIn) {
      const badge = document.createElement('span');
      badge.className = 'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0';
      if (item.visitato) {
        badge.classList.add('bg-emerald-50', 'text-emerald-700', 'border', 'border-emerald-200');
        badge.textContent = '✓ Visitata';
      } else {
        badge.classList.add('bg-amber-50', 'text-amber-700', 'border', 'border-amber-200');
        badge.textContent = '📍 Da visitare';
      }
      header.appendChild(badge);
    }

    const meta = document.createElement('div');
    meta.className = 'flex items-center gap-3 text-xs text-slate-500 mt-1';
    const cost = document.createElement('span');
    cost.textContent = formatCurrencyEUR(item.costo_stimato);
    const sep = document.createElement('span');
    sep.textContent = '·';
    const duration = document.createElement('span');
    duration.textContent = `${item.durata_giorni} giorni`;
    meta.appendChild(cost);
    meta.appendChild(sep);
    meta.appendChild(duration);

    const footer = document.createElement('div');
    footer.className = 'flex items-center justify-end mt-auto pt-1';
    const hint = document.createElement('span');
    hint.className = 'text-xs text-blue-500 font-medium';
    hint.textContent = 'Dettagli →';
    footer.appendChild(hint);

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(footer);
    card.addEventListener('click', () => { showDetailView(item.id).catch(() => {}); });
    fragment.appendChild(card);
  });

  list.appendChild(fragment);
}

function renderPagination(total) {
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  if (!pageInfo || !prevBtn || !nextBtn) return;

  if (total === 0) {
    pageInfo.textContent = 'Nessun risultato';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    return;
  }

  const start = currentOffset + 1;
  const end = Math.min(currentOffset + LIMIT, total);
  pageInfo.textContent = `${start}–${end} di ${total}`;
  prevBtn.disabled = currentOffset === 0;
  nextBtn.disabled = currentOffset + LIMIT >= total;
}

async function loadDestinations() {
  try {
    const query = document.getElementById('search-input')?.value.trim() || '';
    const data = await apiGetDestinations(query);
    let results = data.results || [];
    const total = results.length;
    const paginated = results.slice(currentOffset, currentOffset + LIMIT);
    renderDestinations(paginated, total);
    renderPagination(total);
  } catch (error) {
    console.error(error.message);
  }
}

// =====================
// AUTH UI
// =====================

function updateAuthUI(isLoggedIn, username = '') {
  const authStatus = document.getElementById('auth-status');
  const logoutBtn = document.getElementById('logout-btn');
  const loginSection = document.getElementById('login-section');
  const formSection = document.getElementById('form-section');
  const unauthHero = document.getElementById('unauth-hero');
  const filterBar = document.getElementById('filter-bar');
  const filterMine = document.getElementById('filter-mine');

  if (authStatus) authStatus.textContent = isLoggedIn ? `Ciao, ${username}` : 'Non autenticato';
  if (logoutBtn) logoutBtn.classList.toggle('hidden', !isLoggedIn);
  if (loginSection) loginSection.classList.toggle('hidden', isLoggedIn);
  if (formSection) formSection.classList.toggle('hidden', !isLoggedIn);
  if (unauthHero) unauthHero.classList.toggle('hidden', isLoggedIn);
  if (filterBar) filterBar.classList.toggle('hidden', !isLoggedIn);
  if (filterMine) filterMine.classList.toggle('hidden', !isLoggedIn);
}

// =====================
// AVVIO
// =====================

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');

  updateAuthUI(false);
  loadDestinations().catch(() => {});

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(loginForm);
      const username = String(formData.get('username') || '').trim();
      const password = String(formData.get('password') || '').trim();
      try {
        const data = await apiLogin(username, password);
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', String(data.userId));
        localStorage.setItem('username', data.username);
        updateAuthUI(true, data.username);
        await loadDestinations();
      } catch (error) {
        alert('Errore: ' + error.message);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      updateAuthUI(false);
      showListView();
      await loadDestinations();
    });
  }

  loadDestinations().catch(() => {});
});
