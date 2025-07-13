export function initSubmitEvent() {
  const addEventLink = document.getElementById('add-event');
  const overlay = document.getElementById('submit-overlay');
  const closeOverlay = document.getElementById('close-overlay');

  const hideModal = () => {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  };

  if (overlay) hideModal();

  if (addEventLink && overlay && closeOverlay) {
    addEventLink.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.remove('hidden');
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });

    closeOverlay.addEventListener('click', hideModal);
    overlay.addEventListener('click', e => {
      if (e.target === overlay) hideModal();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
        hideModal();
      }
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
      const uniq = [...new Set(words)].slice(0, 5);
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
        .then(() => { form.reset(); hideModal(); })
        .catch(() => alert('There was an error submitting the event.'));
    });
  }
}
