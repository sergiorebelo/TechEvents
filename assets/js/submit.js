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
        .then(() => { form.reset(); location.href = 'index.html'; })
        .catch(() => alert('There was an error submitting the event.'));
    });

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
