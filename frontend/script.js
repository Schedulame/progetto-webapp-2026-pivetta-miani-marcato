// =====================
// STATO GLOBALE
// =====================
let currentOffset = 0;
const LIMIT = 6;
let currentFilter = 'all'; // 'all' | 'mine' | 'visited' | 'unvisited'

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
    try {
      const data = await response.json();
      if (data && data.error) message = data.error;
    } catch (_) {}
    throw new Error(message);
  }

  return response.json();
}

async function apiGetDestinations(q = '') {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('limit', '1000'); // carica tutto, filtriamo lato client
  params.set('offset', '0');

  const response = await fetch(`/destinations?${params.toString()}`);

  if (!response.ok) {
    let message = 'Errore nel caricamento delle destinazioni';
    try {
      const data = await response.json();
      if (data && data.error) message = data.error;
    } catch (_) {}
    throw new Error(message);
  }

  return response.json();
}

async function apiGetDestinationById(id) {
  const response = await fetch(`/destinations/${id}`);

  if (!response.ok) {
    let message = 'Errore nel caricamento della destinazione';
    try {
      const data = await response.json();
      if (data && data.error) message = data.error;
    } catch (_) {}
    throw new Error(message);
  }

  return response.json();
}

async function apiGetDestinationWeather(id) {
  const response = await fetch(`/destinations/${id}/weather`);

  if (!response.ok) {
    let message = 'Errore nel caricamento del meteo';
    try {
      const data = await response.json();
      if (data && data.error) message = data.error;
    } catch (_) {}
    throw new Error(message);
  }

  return response.json();
}

async function apiGenerateItinerary(id) {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`/destinations/${id}/itinerary`, {
    method: 'POST',
    headers: { 'X-Auth-Token': token || '' },
  });

  if (!response.ok) {
    let message = "Errore nella generazione dell'itinerario";
    try {
      const data = await response.json();
      if (data && data.error) message = data.error;
    } catch (_) {}
    throw new Error(message);
  }

  return response.json();
}

async function apiCreateDestination(data) {
  const token = localStorage.getItem('authToken');

  const response = await fetch('/destinations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token || '',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = 'Errore nella creazione della destinazione';
    try {
      const body = await response.json();
      if (body && body.error) message = body.error;
    } catch (_) {}
    throw new Error(message);
  }

  return response.json();
}

async function apiUpdateDestination(id, data) {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`/destinations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token || '',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = "Errore nell'aggiornamento della destinazione";
    try {
      const body = await response.json();
      if (body && body.error) message = body.error;
    } catch (_) {}
    throw new Error(message);
  }

  return response.json();
}

async function apiDeleteDestination(id) {
  const token = localStorage.getItem('authToken');

  const response = await fetch(`/destinations/${id}`, {
    method: 'DELETE',
    headers: { 'X-Auth-Token': token || '' },
  });

  if (!response.ok) {
    let message = "Errore nell'eliminazione della destinazione";
    try {
      const body = await response.json();
      if (body && body.error) message = body.error;
    } catch (_) {}
    throw new Error(message);
  }
}

// =====================
// UTILITIES
// =====================

function formatCurrencyEUR(value) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
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
  await loadDetailPage(id);
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
    empty.innerHTML = '<p class="text-3xl mb-2"><i class="fa-solid fa-map text-slate-300"></i></p><p class="text-sm">Nessuna destinazione trovata</p>';
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

    // Header: titolo + badge (solo se loggato)
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
        badge.innerHTML = '<i class="fa-solid fa-check mr-1"></i>Visitata';
      } else {
        badge.classList.add('bg-amber-50', 'text-amber-700', 'border', 'border-amber-200');
        badge.innerHTML = '<i class="fa-solid fa-location-dot mr-1"></i>Da visitare';
      }
      header.appendChild(badge);
    }

    // Meta info
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

    // Footer: indicatore "clicca per dettagli"
    const footer = document.createElement('div');
    footer.className = 'flex items-center justify-end mt-auto pt-1';
    const hint = document.createElement('span');
    hint.className = 'text-xs text-blue-500 font-medium';
    hint.textContent = 'Dettagli →';
    footer.appendChild(hint);

    card.appendChild(header);
    card.appendChild(meta);
    card.appendChild(footer);

    card.addEventListener('click', () => {
      showDetailView(item.id).catch(() => {});
    });

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
    const currentUserId = getCurrentUserId();

    const data = await apiGetDestinations(query);
    let results = data.results || [];

    // Filtro lato client
    if (currentFilter === 'visited') {
      results = results.filter((d) => d.visitato === true);
    } else if (currentFilter === 'unvisited') {
      results = results.filter((d) => d.visitato === false);
    } else if (currentFilter === 'mine' && currentUserId !== null) {
      results = results.filter((d) => d.ownerId === currentUserId);
    }

    const total = results.length;
    const paginated = results.slice(currentOffset, currentOffset + LIMIT);

    renderDestinations(paginated, total);
    renderPagination(total);
  } catch (error) {
    showError(error.message);
  }
}

// =====================
// FILTRI
// =====================

function setFilter(filter) {
  currentFilter = filter;
  currentOffset = 0;

  document.querySelectorAll('.filter-pill').forEach((btn) => {
    const isActive = btn.dataset.filter === filter;
    btn.classList.toggle('bg-blue-500', isActive);
    btn.classList.toggle('text-white', isActive);
    btn.classList.toggle('border-blue-500', isActive);
    btn.classList.toggle('bg-white', !isActive);
    btn.classList.toggle('text-slate-700', !isActive);
    btn.classList.toggle('border-slate-300', !isActive);
  });

  loadDestinations().catch(() => {});
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
  const filterMine = document.getElementById('filter-mine');
  const filterBar = document.getElementById('filter-bar');

  if (authStatus) authStatus.textContent = isLoggedIn ? `Ciao, ${username}` : 'Non autenticato';
  if (logoutBtn) logoutBtn.classList.toggle('hidden', !isLoggedIn);
  if (loginSection) loginSection.classList.toggle('hidden', isLoggedIn);
  if (formSection) formSection.classList.toggle('hidden', !isLoggedIn);
  if (unauthHero) unauthHero.classList.toggle('hidden', isLoggedIn);
  if (filterBar) filterBar.classList.toggle('hidden', !isLoggedIn);
  if (filterMine) filterMine.classList.toggle('hidden', !isLoggedIn);

  // Se si fa logout mentre il filtro "mine" è attivo, torna a "Tutte"
  if (!isLoggedIn && currentFilter === 'mine') {
    setFilter('all');
  }
}

// =====================
// FEEDBACK
// =====================

let feedbackTimeoutId = null;

function clearFeedback() {
  const feedback = document.getElementById('feedback');
  if (!feedback) return;
  feedback.textContent = '';
  feedback.classList.remove('feedback-error', 'feedback-success', 'feedback-hide');
}

function showError(message) {
  const feedback = document.getElementById('feedback');
  if (!feedback) return;

  if (feedbackTimeoutId !== null) {
    window.clearTimeout(feedbackTimeoutId);
    feedbackTimeoutId = null;
  }

  feedback.classList.remove('feedback-success', 'feedback-error', 'feedback-hide');
  feedback.classList.add('feedback-error');
  feedback.textContent = message;

  feedbackTimeoutId = window.setTimeout(() => {
    feedback.classList.add('feedback-hide');
    window.setTimeout(() => clearFeedback(), 500);
  }, 5000);
}

function showSuccess(message) {
  const feedback = document.getElementById('feedback');
  if (!feedback) return;

  if (feedbackTimeoutId !== null) {
    window.clearTimeout(feedbackTimeoutId);
    feedbackTimeoutId = null;
  }

  feedback.classList.remove('feedback-success', 'feedback-error', 'feedback-hide');
  feedback.classList.add('feedback-success');
  feedback.textContent = message;

  feedbackTimeoutId = window.setTimeout(() => {
    feedback.classList.add('feedback-hide');
    window.setTimeout(() => clearFeedback(), 500);
  }, 3000);
}

// =====================
// DETAIL VIEW
// =====================

async function loadDetailPage(id) {
  const content = document.getElementById('detail-content');
  if (!content) return;
  content.innerHTML = '<p class="text-slate-400 text-sm py-6 text-center">Caricamento...</p>';

  try {
    const dest = await apiGetDestinationById(id);
    const currentUserId = getCurrentUserId();
    const isOwner = currentUserId !== null && dest.ownerId === currentUserId;
    const isLoggedIn = currentUserId !== null;
    renderDetailPage(dest, isOwner, isLoggedIn);
  } catch (error) {
    showError(error.message);
    showListView();
  }
}

function renderDetailPage(dest, isOwner, isLoggedIn) {
  const content = document.getElementById('detail-content');
  if (!content) return;
  content.innerHTML = '';

  // --- Bottone torna alla lista ---
  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.textContent = '← Torna alla lista';
  backBtn.className = 'text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors';
  backBtn.addEventListener('click', () => {
    showListView();
    loadDestinations().catch(() => {});
  });

  // --- Header card ---
  const headerCard = document.createElement('div');
  headerCard.className = 'bg-white rounded-xl shadow-sm border border-slate-200 p-5';

  const titleRow = document.createElement('div');
  titleRow.className = 'flex items-start justify-between gap-3 mb-3';

  const titleInfo = document.createElement('div');
  const h2 = document.createElement('h2');
  h2.textContent = dest.nome;
  h2.className = 'text-xl font-bold text-slate-900';
  const paeseEl = document.createElement('p');
  paeseEl.textContent = dest.paese;
  paeseEl.className = 'text-sm text-slate-500 mt-0.5';
  titleInfo.appendChild(h2);
  titleInfo.appendChild(paeseEl);
  titleRow.appendChild(titleInfo);

  if (isLoggedIn) {
    const badge = document.createElement('span');
    badge.className = 'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shrink-0';
    if (dest.visitato) {
      badge.classList.add('bg-emerald-50', 'text-emerald-700', 'border', 'border-emerald-200');
      badge.textContent = '✓ Visitata';
    } else {
      badge.classList.add('bg-amber-50', 'text-amber-700', 'border', 'border-amber-200');
      badge.textContent = '📍 Da visitare';
    }
    titleRow.appendChild(badge);
  }

  const meta = document.createElement('div');
  meta.className = 'flex flex-wrap gap-4 text-sm text-slate-600';
  meta.innerHTML = `
    <span class="flex items-center gap-1.5"><i class="fa-solid fa-euro-sign text-slate-400"></i> <strong>${formatCurrencyEUR(dest.costo_stimato)}</strong></span>
    <span class="flex items-center gap-1.5"><i class="fa-solid fa-calendar-days text-slate-400"></i> <strong>${dest.durata_giorni} giorni</strong></span>
  `;

  headerCard.appendChild(titleRow);
  headerCard.appendChild(meta);

  // --- Sezione meteo ---
  const weatherCard = createWeatherSection(dest.id);

  // --- Sezione itinerario (solo se loggato) ---
  const itineraryCard = isLoggedIn ? createItinerarySection(dest.id, dest.nome, dest.durata_giorni) : null;

  // --- Sezione gestione (solo owner) ---
  let manageCard = null;
  if (isOwner) {
    manageCard = createManageSection(dest);
  }

  content.appendChild(backBtn);
  content.appendChild(headerCard);
  content.appendChild(weatherCard);
  if (itineraryCard) content.appendChild(itineraryCard);
  if (manageCard) content.appendChild(manageCard);
}

function createWeatherSection(id) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl shadow-sm border border-slate-200 p-5';

  const headerRow = document.createElement('div');
  headerRow.className = 'flex items-center justify-between';

  const title = document.createElement('h3');
  title.className = 'text-sm font-semibold text-slate-900';
  title.innerHTML = '<i class="fa-solid fa-cloud-sun mr-1.5"></i>Meteo attuale';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Carica meteo';
  btn.className = 'px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 hover:bg-blue-100 transition-colors';

  const panel = document.createElement('div');
  panel.className = 'hidden mt-4';

  btn.addEventListener('click', async () => {
    if (!panel.classList.contains('hidden')) {
      panel.classList.add('hidden');
      panel.innerHTML = '';
      btn.textContent = 'Carica meteo';
      return;
    }

    btn.textContent = 'Caricamento...';
    btn.disabled = true;
    panel.classList.remove('hidden');
    panel.innerHTML = '<p class="text-xs text-slate-400 animate-pulse">Recupero dati meteo...</p>';

    try {
      const weather = await apiGetDestinationWeather(id);
      panel.innerHTML = '';

      const box = document.createElement('div');
      box.className = 'flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100';

      const iconImg = document.createElement('img');
      iconImg.src = weather.icona_url;
      iconImg.alt = weather.descrizione;
      iconImg.className = 'w-14 h-14 shrink-0';

      const left = document.createElement('div');
      const temp = document.createElement('p');
      temp.textContent = `${weather.temperatura} °C`;
      temp.className = 'text-2xl font-bold text-slate-900';
      const desc = document.createElement('p');
      desc.textContent = weather.descrizione;
      desc.className = 'text-sm text-slate-600 capitalize mt-0.5';
      left.appendChild(temp);
      left.appendChild(desc);

      const right = document.createElement('div');
      right.className = 'ml-auto text-right text-xs text-slate-600 space-y-1';
      right.innerHTML = `<p>💧 Umidità: <strong>${weather.umidita}%</strong></p><p>💨 Vento: <strong>${weather.vento_kmh} km/h</strong></p>`;

      box.appendChild(iconImg);
      box.appendChild(left);
      box.appendChild(right);
      panel.appendChild(box);

      btn.textContent = 'Nascondi meteo';
    } catch (error) {
      panel.classList.add('hidden');
      panel.innerHTML = '';
      btn.textContent = 'Carica meteo';
      showError(error.message);
    } finally {
      btn.disabled = false;
    }
  });

  headerRow.appendChild(title);
  headerRow.appendChild(btn);
  card.appendChild(headerRow);
  card.appendChild(panel);
  return card;
}

function createItinerarySection(id, nome, durata) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl shadow-sm border border-slate-200 p-5';

  const headerRow = document.createElement('div');
  headerRow.className = 'flex items-center justify-between';

  const title = document.createElement('h3');
  title.className = 'text-sm font-semibold text-slate-900';
  title.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles mr-1.5"></i>Itinerario AI';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = 'Genera itinerario';
  btn.className = 'px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200 hover:bg-indigo-100 transition-colors';

  const panel = document.createElement('div');
  panel.className = 'hidden mt-4 space-y-2';

  btn.addEventListener('click', async () => {
    if (!panel.classList.contains('hidden')) {
      panel.classList.add('hidden');
      panel.innerHTML = '';
      btn.textContent = 'Genera itinerario';
      return;
    }

    btn.textContent = 'Generazione...';
    btn.disabled = true;
    panel.classList.remove('hidden');
    panel.innerHTML = '<p class="text-xs text-slate-400 animate-pulse">Generazione in corso, attendi...</p>';

    try {
      const itinerary = await apiGenerateItinerary(id);
      const giorni = itinerary?.giorni;
      if (!Array.isArray(giorni)) throw new Error('Itinerario non valido');

      panel.innerHTML = '';

      const itTitle = document.createElement('p');
      itTitle.className = 'text-xs font-semibold text-slate-600 mb-1';
      itTitle.textContent = `Itinerario per ${nome} — ${durata} giorni`;
      panel.appendChild(itTitle);

      giorni.forEach((day) => {
        if (typeof day.giorno !== 'number' || !Array.isArray(day.attivita)) return;

        const dayDiv = document.createElement('div');
        dayDiv.className = 'rounded-lg border-l-4 border-indigo-400 bg-indigo-50 px-4 py-3';

        const dayTitle = document.createElement('p');
        dayTitle.className = 'text-xs font-bold text-indigo-700 mb-2 uppercase tracking-wide';
        dayTitle.textContent = `Giorno ${day.giorno}`;

        const ul = document.createElement('ul');
        ul.className = 'space-y-1';

        day.attivita.forEach((act) => {
          const li = document.createElement('li');
          li.className = 'text-xs text-slate-700 flex items-start gap-2';
          li.innerHTML = `<span class="text-indigo-400 font-bold shrink-0 mt-0.5">•</span><span>${String(act)}</span>`;
          ul.appendChild(li);
        });

        dayDiv.appendChild(dayTitle);
        dayDiv.appendChild(ul);
        panel.appendChild(dayDiv);
      });

      btn.textContent = 'Nascondi itinerario';
    } catch (error) {
      panel.classList.add('hidden');
      panel.innerHTML = '';
      btn.textContent = 'Genera itinerario';
      showError(error.message);
    } finally {
      btn.disabled = false;
    }
  });

  headerRow.appendChild(title);
  headerRow.appendChild(btn);
  card.appendChild(headerRow);
  card.appendChild(panel);
  return card;
}

function createManageSection(dest) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-xl shadow-sm border border-slate-200 p-5';

  // Titolo + bottone elimina
  const titleRow = document.createElement('div');
  titleRow.className = 'flex items-center justify-between mb-4';

  const title = document.createElement('h3');
  title.className = 'text-sm font-semibold text-slate-900';
  title.innerHTML = '<i class="fa-solid fa-pen mr-1.5"></i>Modifica destinazione';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.textContent = 'Elimina';
  deleteBtn.className = 'px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200 hover:bg-rose-100 transition-colors';
  deleteBtn.addEventListener('click', async () => {
    if (!window.confirm(`Eliminare "${dest.nome}"?`)) return;
    try {
      await apiDeleteDestination(dest.id);
      showSuccess('Destinazione eliminata');
      showListView();
      await loadDestinations();
    } catch (error) {
      showError(error.message);
    }
  });

  titleRow.appendChild(title);
  titleRow.appendChild(deleteBtn);

  // Form modifica
  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white';

  const form = document.createElement('form');
  form.className = 'grid grid-cols-1 sm:grid-cols-2 gap-4';

  const fields = [
    { id: 'edit-nome', label: 'Nome', type: 'text', value: dest.nome, min: '2', max: '100' },
    { id: 'edit-paese', label: 'Paese', type: 'text', value: dest.paese, min: '2', max: '60' },
    { id: 'edit-costo', label: 'Costo stimato (€)', type: 'number', value: String(dest.costo_stimato), min: '0', max: '50000', step: '0.01' },
    { id: 'edit-durata', label: 'Durata (giorni)', type: 'number', value: String(dest.durata_giorni), min: '1', max: '365', step: '1' },
  ];

  fields.forEach((f) => {
    const div = document.createElement('div');
    div.className = 'flex flex-col gap-1';

    const label = document.createElement('label');
    label.htmlFor = f.id;
    label.className = 'text-xs font-medium text-slate-600';
    label.textContent = f.label;

    const input = document.createElement('input');
    input.id = f.id;
    input.type = f.type;
    input.value = f.value;
    input.required = true;
    input.className = inputClass;
    if (f.type === 'text') {
      input.minLength = parseInt(f.min);
      input.maxLength = parseInt(f.max);
    } else {
      input.min = f.min;
      input.max = f.max;
    }
    if (f.step) input.step = f.step;

    div.appendChild(label);
    div.appendChild(input);
    form.appendChild(div);
  });

  // Checkbox visitato
  const checkDiv = document.createElement('div');
  checkDiv.className = 'flex items-center gap-2 mt-1';
  const checkInput = document.createElement('input');
  checkInput.type = 'checkbox';
  checkInput.id = 'edit-visitato';
  checkInput.checked = Boolean(dest.visitato);
  checkInput.className = 'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500';
  const checkLabel = document.createElement('label');
  checkLabel.htmlFor = 'edit-visitato';
  checkLabel.className = 'text-sm text-slate-700';
  checkLabel.textContent = 'Già visitata';
  checkDiv.appendChild(checkInput);
  checkDiv.appendChild(checkLabel);
  form.appendChild(checkDiv);

  // Bottone salva
  const submitDiv = document.createElement('div');
  submitDiv.className = 'flex justify-end sm:col-span-2 mt-1';
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Salva modifiche';
  submitBtn.className = 'px-5 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors';
  submitDiv.appendChild(submitBtn);
  form.appendChild(submitDiv);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const data = {
      nome: document.getElementById('edit-nome').value.trim(),
      paese: document.getElementById('edit-paese').value.trim(),
      costo_stimato: parseFloat(document.getElementById('edit-costo').value),
      durata_giorni: parseInt(document.getElementById('edit-durata').value, 10),
      visitato: document.getElementById('edit-visitato').checked,
    };

    try {
      await apiUpdateDestination(dest.id, data);
      showSuccess('Destinazione aggiornata');
      await loadDetailPage(dest.id);
    } catch (error) {
      showError(error.message);
    }
  });

  card.appendChild(titleRow);
  card.appendChild(form);
  return card;
}

// =====================
// AVVIO
// =====================

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const destinationForm = document.getElementById('destination-form');
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');

  // Ripristina sessione da localStorage
  const storedToken = localStorage.getItem('authToken');
  const storedUsername = localStorage.getItem('username') || '';
  if (storedToken) {
    updateAuthUI(true, storedUsername);
  } else {
    updateAuthUI(false);
  }

  // Validazione form "aggiungi" con classe touched
  if (destinationForm) {
    destinationForm.querySelectorAll('input').forEach((input) => {
      if (input.type !== 'hidden') {
        input.addEventListener('blur', () => input.classList.add('touched'));
      }
    });
  }

  // Login
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
        showSuccess('Login effettuato');
      } catch (error) {
        showError(error.message);
      }
    });
  }

  // Logout
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

  // Crea nuova destinazione
  if (destinationForm) {
    destinationForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!destinationForm.checkValidity()) { destinationForm.reportValidity(); return; }

      const data = {
        nome: String(destinationForm.elements.nome.value).trim(),
        paese: String(destinationForm.elements.paese.value).trim(),
        costo_stimato: parseFloat(destinationForm.elements.costo_stimato.value),
        durata_giorni: parseInt(destinationForm.elements.durata_giorni.value, 10),
        visitato: Boolean(destinationForm.elements.visitato.checked),
      };

      try {
        await apiCreateDestination(data);
        showSuccess('Destinazione aggiunta');
        destinationForm.reset();
        destinationForm.querySelectorAll('input').forEach((i) => i.classList.remove('touched'));
        await loadDestinations();
      } catch (error) {
        showError(error.message);
      }
    });
  }

  // Cerca
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      currentOffset = 0;
      loadDestinations().catch(() => {});
    });
  }

  // Cerca anche con Enter
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        currentOffset = 0;
        loadDestinations().catch(() => {});
      }
    });
  }

  // Paginazione
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentOffset = Math.max(0, currentOffset - LIMIT);
      loadDestinations().catch(() => {});
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentOffset += LIMIT;
      loadDestinations().catch(() => {});
    });
  }

  // Filtri pill
  document.querySelectorAll('.filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      setFilter(btn.dataset.filter);
    });
  });

  // Carica destinazioni all'avvio
  loadDestinations().catch(() => {});
});
