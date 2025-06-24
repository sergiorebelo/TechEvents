    // Dark mode toggle
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
    // Data & filters
    const sheetId = '142KcWCCWPXomn5ujQqIRFdRACRalHIXAHql61MRirDM';
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=Sheet1`;
    let events = [];
    let selectedTheme = '';


    let showAllThemes = false;
    const maxThemes = 20;
    function formatMonthYear(str) {
      // 1) Detecta e “desembrulha” Date(YYYY,MM,DD)
      if (typeof str === 'string') {
        const dp = /^Date\(\s*([0-9]{4})\s*,\s*([0-9]{1,2})\s*,\s*([0-9]{1,2})\s*\)/.exec(str);
        if (dp) {
          const [ , year, month, day ] = dp;
          // Google Sheets usa mês baseado em zero (0=Jan). Ajusta para 1-12
          const mm = String(Number(month) + 1).padStart(2, '0');
          const dd = day.padStart(2, '0');
          str = `${year}-${mm}-${dd}`;
        }
      }
    
      // 2) Regex original para capturar "YYYY-MM"
      const m = /^([0-9]{4})-([0-9]{2})/.exec(str);
      if (m) {
        // constrói Date(year, monthIndex)
        const date = new Date(m[1], m[2] - 1);
        // format to "month year" in English
        return date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
      }
    
      // 3) fallback: devolve o original
      return str;
    }

    function parseStartDate(str) {
      if (typeof str === 'string') {
        const dp = /^Date\(\s*([0-9]{4})\s*,\s*([0-9]{1,2})\s*,\s*([0-9]{1,2})\s*\)/.exec(str);
        if (dp) {
          const [, y, m, d] = dp;
          return new Date(y, m, d);
        }
      }
      const full = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(str);
      if (full) {
        return new Date(full[1], full[2] - 1, full[3]);
      }
      const ym = /^([0-9]{4})-([0-9]{2})/.exec(str);
      if (ym) {
        return new Date(ym[1], ym[2] - 1);
      }
      const d = new Date(str);
      return isNaN(d) ? new Date(0) : d;
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
          populateFilters();
          populateCloud();
          applyFilters();
        });
    }


function populateCloud() {
  const cloud = document.getElementById("theme-cloud");
  cloud.innerHTML = "";
  const counts = {};
  events.forEach(e => e.temas.forEach(t => counts[t] = (counts[t] || 0) + 1));
  let themes = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  if (!showAllThemes) {
    themes = themes.slice(0, maxThemes);
  }
  const maxCount = Math.max(...Object.values(counts));
  themes.forEach(theme => {
    const span = document.createElement("span");
    const size = 12 + (counts[theme] / maxCount) * 12;
    span.style.fontSize = `${size}px`;
    span.textContent = theme;
    span.addEventListener("click", () => {
      selectedTheme = selectedTheme === theme ? "" : theme;
      applyFilters();
    });
    cloud.appendChild(span);
  });
  if (Object.keys(counts).length > maxThemes) {
    const btn = document.createElement("button");
    btn.id = "toggle-cloud";
    btn.className = "cloud-toggle";
    btn.textContent = showAllThemes ? "See less ▲" : "See all ▼";
    btn.addEventListener("click", () => {
      showAllThemes = !showAllThemes;
      populateCloud();
    });
    cloud.appendChild(btn);
  }
}
    function populateFilters() {
      // Location
      const loc = document.getElementById('filter-location');
      loc.innerHTML = '<option value="">Location</option>';
      [...new Set(events.map(e => e.pais))].sort((a, b) => a.localeCompare(b)).forEach(country => {
        const group = document.createElement('optgroup'); group.label = country;
        const cities = [...new Set(events.filter(e => e.pais === country).map(e => e.cidade))]
          .sort((a, b) => a.localeCompare(b));
        const optAll = document.createElement('option'); optAll.value = `${country}||`; optAll.textContent = `All ${country}`;
        group.appendChild(optAll);
        cities.forEach(city => {
          const opt = document.createElement('option'); opt.value = `${country}||${city}`; opt.textContent = city;
          group.appendChild(opt);
        });
        loc.appendChild(group);
      });
      // Date
      const dateSel = document.getElementById('filter-date');
      dateSel.innerHTML = '<option value="">Date</option>' +
        [...new Set(events.map(e => formatMonthYear(e.data_inicio)))].map(d => `<option value="${d}">${d}</option>`).join('');
      // Price slider
      const priceSel = document.getElementById('filter-price');
      const priceLabel = document.getElementById('price-label');
      const prices = events.map(e => e.preco).filter(p => p!=null).sort((a,b)=>a-b);
      if (prices.length) {
        priceSel.min = 0;
        priceSel.max = prices[prices.length-1];
        priceSel.step = 1;
        priceSel.value = priceSel.max;
        priceLabel.textContent = 'ANY';
      } else {
        priceSel.min = 0;
        priceSel.max = 0;
        priceSel.value = 0;
        priceSel.disabled = true;
        priceLabel.textContent = 'No price data';
      }
    }

    function applyFilters() {
      const term = document.getElementById('search').value.toLowerCase();
      const locVal = document.getElementById('filter-location').value;
      const priceInput = document.getElementById('filter-price');
      const maxPrice = parseFloat(priceInput.value);
      const priceMax = parseFloat(priceInput.max);
      const priceLabel = document.getElementById('price-label');
      if (maxPrice >= priceMax) {
        priceLabel.textContent = 'ANY';
      } else if (maxPrice === 0) {
        priceLabel.textContent = 'FREE';
      } else {
        priceLabel.textContent = `≤ €${maxPrice}`;
      }
      const dateVal = document.getElementById('filter-date').value;
      const hidePast = document.getElementById('filter-past').checked;
      const hideNoPrice = document.getElementById('filter-noprice').checked;
      const today = new Date();
      today.setHours(0,0,0,0);
      const filtered = events.filter(e => {
        if (term && !e.nome.toLowerCase().includes(term) && !e.summary.toLowerCase().includes(term)) return false;
        if (selectedTheme && !e.temas.includes(selectedTheme)) return false;
        if (locVal) {
          const [c, city] = locVal.split('||');
          if (city ? e.cidade !== city : e.pais !== c) return false;
        }
        if (maxPrice < priceMax) {
          if (e.preco==null || (e.preco>maxPrice && e.preco!==0)) return false;
        }
        if (hideNoPrice && e.preco==null) return false;
        if (dateVal && formatMonthYear(e.data_inicio)!==dateVal) return false;
        if (hidePast && parseStartDate(e.data_inicio) < today) return false;
        return true;
      });
      renderEvents(filtered);
      document.querySelectorAll('#theme-cloud span').forEach(span=>{
        span.style.opacity = selectedTheme && span.textContent!==selectedTheme?'0.3':'1';
      });
    }

function renderEvents(list) {
  const c = document.getElementById('events-list'); c.innerHTML='';
  list.forEach(e=>{
        const card=document.createElement('div'); card.className='card';
        const online = e.online ? ' • Online' : '';
        const priceText = e.preco!=null ? (e.preco===0 ? 'FREE' : '€'+e.preco) : '';
        card.innerHTML=`<div class="card-content"><h3>${e.nome}</h3><p class="meta">${e.pais}, ${e.cidade} • ${formatMonthYear(e.data_inicio)}${priceText?' • '+priceText:''}${online}</p><p>${e.summary}</p><div class="tags">${e.temas.map(t=>`<span class="tag">${t}</span>`).join('')}</div><a href="${e.link}" class="btn" target="_blank">View Event</a></div>`;
        c.appendChild(card);
  });
}


    ['search','filter-location','filter-date','filter-past','filter-noprice'].forEach(id=>
      document.getElementById(id).addEventListener(id==='search'?'input':'change',applyFilters));
    document.getElementById('filter-price').addEventListener('input', applyFilters);
    fetchEvents();
    initConsentBanner();

    // Overlay for submitting events
    const addEventLink = document.getElementById('add-event');
    const overlay = document.getElementById('submit-overlay');
    const closeOverlay = document.getElementById('close-overlay');
    if (addEventLink && overlay && closeOverlay) {
      const hideOverlay = () => overlay.classList.add('hidden');
      addEventLink.addEventListener('click', e => {
        e.preventDefault();
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
      const hideModal = () => {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
      };
      closeOverlay.addEventListener('click', hideModal);
      overlay.addEventListener('click', e => {
        if (e.target === overlay) hideModal();


      });
    }

    if (overlay) {
      const form = document.getElementById('event-form');
      const nameInput = form.querySelector('input[name="nome"]');
      const descInput = form.querySelector('textarea[name="summary"]');
      const tagsInput = form.querySelector('input[name="temas"]');
      const suggestionsDiv = document.getElementById('tag-suggestions');

      function updateSuggestions() {
        const text = `${nameInput.value} ${descInput.value}`.toLowerCase();
        const words = text.match(/\b[a-z]{4,}\b/g);
        if (!words) { suggestionsDiv.textContent = ''; return; }
        const uniq = [...new Set(words)].slice(0,5);
        suggestionsDiv.innerHTML = uniq.map(w => `<span style="cursor:pointer;margin-right:6px;">#${w}</span>`).join(' ');
        suggestionsDiv.querySelectorAll('span').forEach(span => {
          span.onclick = () => {
            const tag = span.textContent;
            tagsInput.value = tagsInput.value ? `${tagsInput.value} ${tag}` : tag;
          };
        });
      }

      nameInput.addEventListener('input', updateSuggestions);
      descInput.addEventListener('input', updateSuggestions);

      const submitUrl = 'https://script.google.com/macros/s/AKfycbzPEdZylvlL0-aWGVy29VxgCgKl-ZHLJTgZfb06uNUxKn6G7fy-F_kMqS4nUiaYrhFz/exec';
      form.addEventListener('submit', e => {
        e.preventDefault();
        const data = new FormData(form);
        data.append('sheet', 'Sheet1');
        fetch(submitUrl, { method: 'POST', body: data, mode: 'no-cors' })
          .then(() => { form.reset(); overlay.classList.add('hidden'); })
          .catch(() => alert('There was an error submitting the event.'));
      });
    }

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
