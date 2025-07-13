import { populateCloud } from './tagcloud.js';
import { populateFilters, applyFilters } from './filters.js';
import { renderEvents } from './event-renderer.js';
import { initSubmitEvent } from './submit-event.js';
import { parseStartDate } from './utils.js';

const body = document.body;
const toggle = document.getElementById('toggle-mode');
const savedMode = localStorage.getItem('mode');
if (savedMode === 'dark') {
  body.classList.add('dark-mode');
}
toggle.textContent = body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
toggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  localStorage.setItem('mode', body.classList.contains('dark-mode') ? 'dark' : 'light');
  toggle.textContent = body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
});

const sheetId = '142KcWCCWPXomn5ujQqIRFdRACRalHIXAHql61MRirDM';
const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=Sheet1`;
let events = [];
let selectedTheme = '';

function updateDisplayedEvents() {
  const filtered = applyFilters(events, selectedTheme);
  renderEvents(filtered);
  document.querySelectorAll('#theme-cloud span').forEach(span => {
    span.style.opacity = selectedTheme && span.textContent !== selectedTheme ? '0.3' : '1';
  });
}

function fetchEvents() {
  fetch(url)
    .then(res => res.text())
    .then(txt => {
      const data = JSON.parse(txt.substr(47).slice(0, -2));
      events = data.table.rows.map(r => ({
        nome: r.c[0]?.v || '',
        pais: r.c[1]?.v || '',
        cidade: r.c[2]?.v || '',
        online: /true/i.test(String(r.c[3]?.v)),
        data_inicio: r.c[4]?.v || '',
        summary: r.c[6]?.v || '',
        link: r.c[8]?.v || '#',
        temas: (r.c[9]?.v || '').split(/\s+/).map(t => t.replace(/^#/, '')).filter(t => t),
        preco: r.c[10]?.v ? parseFloat(r.c[10].v) : null
      }));
      events.sort((a, b) => parseStartDate(a.data_inicio) - parseStartDate(b.data_inicio));
      populateFilters(events);
      populateCloud(events, selectedTheme, theme => {
        selectedTheme = selectedTheme === theme ? '' : theme;
        updateDisplayedEvents();
      });
      updateDisplayedEvents();
    });
}

['search','filter-location','filter-date','filter-past','filter-noprice'].forEach(id => {
  document.getElementById(id).addEventListener(id === 'search' ? 'input' : 'change', updateDisplayedEvents);
});
document.getElementById('filter-price').addEventListener('input', updateDisplayedEvents);

fetchEvents();
initSubmitEvent();
initConsentBanner();

function initConsentBanner() {
  const banner = document.getElementById('consent-banner');
  const accept = document.getElementById('accept-consent');
  if (localStorage.getItem('analyticsConsent') === 'accepted') {
    banner.style.display = 'none';
    return;
  }
  accept.addEventListener('click', () => {
    localStorage.setItem('analyticsConsent', 'accepted');
    banner.remove();
  });
}
