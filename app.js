// ===== Theme =====
const html = document.documentElement;
const themeBtn = document.getElementById('themeBtn');
const THEME_KEY = 'wishlist.theme';
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme) { html.setAttribute('data-theme', savedTheme); }
else { html.setAttribute('data-theme', 'light'); }

function updateThemeIcon(){
  const t = html.getAttribute('data-theme') || 'light';
  themeBtn.textContent = (t === 'light' ? '🌞' : '🌚');
  themeBtn.setAttribute('title', t === 'light' ? 'Light mode' : 'Dark mode');
}
themeBtn.addEventListener('click', () => {
  const current = html.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeIcon();
});
updateThemeIcon();

// ===== Confetti (canvas-confetti) =====
function celebrate(){
  if (typeof window.confetti !== 'function') return;
  const base = { origin: { y: 0.3 }, disableForReducedMotion: true };
  confetti({ ...base, particleCount: 120, spread: 70 });
  setTimeout(() => confetti({ ...base, particleCount: 80, spread: 100, scalar: 0.9 }), 120);
}

// ===== State =====
const STORAGE_KEY = 'wishlist.items.v1';
let items = [];

function load(){
  try { items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { items = []; }
  render();
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }

// ===== DOM =====
const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');
const countEl = document.getElementById('count');
const inputEl = document.getElementById('itemInput');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');

inputEl.addEventListener('input', () => { addBtn.disabled = !inputEl.value.trim(); });

function addItem(text){
  const t = text.trim();
  if (!t) return;
  items.unshift({ id: (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()+Math.random())), text: t, done: false });
  save();
  render();
}
function removeItem(id){
  items = items.filter(x => x.id !== id);
  save();
  render();
}
function toggleDone(id){
  items = items.map(x => x.id === id ? { ...x, done: !x.done } : x);
  save();
  render();
}

function render(){
  listEl.innerHTML = '';
  emptyEl.style.display = items.length === 0 ? 'block' : 'none';

  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'row' + (item.done ? ' done' : '');

    const label = document.createElement('label');
    label.className = 'label';
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = item.done;
    cb.addEventListener('change', () => toggleDone(item.id));
    const span = document.createElement('span');
    span.className = 'itemText';
    span.textContent = item.text;
    label.appendChild(cb);
    label.appendChild(span);

    const got = document.createElement('button');
    got.className = 'ghostBtn success';
    got.textContent = 'Got it 🎉';
    got.addEventListener('click', () => {
      celebrate();
      toggleDone(item.id);
    });

    const del = document.createElement('button');
    del.className = 'ghostBtn';
    del.textContent = 'Remove';
    del.addEventListener('click', () => removeItem(item.id));

    row.appendChild(label);
    row.appendChild(got);
    row.appendChild(del);
    listEl.appendChild(row);
  });

  const remaining = items.filter(x => !x.done).length;
  countEl.textContent = `${items.length} item${items.length !== 1 ? 's' : ''} · ${remaining} pending`;
}

addBtn.addEventListener('click', () => {
  addItem(inputEl.value);
  inputEl.value = '';
  addBtn.disabled = true;
  inputEl.focus();
});
inputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && inputEl.value.trim()) {
    addItem(inputEl.value);
    inputEl.value = '';
    addBtn.disabled = true;
  }
});

clearBtn.addEventListener('click', () => {
  if (items.length === 0) return;
  if (confirm('Clear all items?')) { items = []; save(); render(); }
});

// Init
load();
