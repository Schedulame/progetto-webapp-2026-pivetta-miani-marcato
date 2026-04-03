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
      } catch (error) {
        alert('Errore: ' + error.message);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      updateAuthUI(false);
      showListView();
    });
  }
});
