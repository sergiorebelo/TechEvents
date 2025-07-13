let showAllThemes = false;
const maxThemes = 20;

export function populateCloud(events, selectedTheme, onThemeSelect) {
  const cloud = document.getElementById('theme-cloud');
  cloud.innerHTML = '';
  const counts = {};
  events.forEach(e => e.temas.forEach(t => { counts[t] = (counts[t] || 0) + 1; }));
  let themes = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  if (!showAllThemes) {
    themes = themes.slice(0, maxThemes);
  }
  const maxCount = Math.max(...Object.values(counts));
  themes.forEach(theme => {
    const span = document.createElement('span');
    const size = 12 + (counts[theme] / maxCount) * 12;
    span.style.fontSize = `${size}px`;
    span.textContent = theme;
    span.addEventListener('click', () => onThemeSelect(theme));
    cloud.appendChild(span);
  });
  if (Object.keys(counts).length > maxThemes) {
    const btn = document.createElement('button');
    btn.id = 'toggle-cloud';
    btn.className = 'cloud-toggle';
    btn.textContent = showAllThemes ? 'See less ▲' : 'See all ▼';
    btn.addEventListener('click', () => {
      showAllThemes = !showAllThemes;
      populateCloud(events, selectedTheme, onThemeSelect);
    });
    cloud.appendChild(btn);
  }
}
