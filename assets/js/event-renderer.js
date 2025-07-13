import { formatMonthYear } from './utils.js';

export function renderEvents(list) {
  const c = document.getElementById('events-list');
  c.innerHTML = '';
  list.forEach(e => {
    const card = document.createElement('div');
    card.className = 'card';
    const priceText = e.preco != null ? (e.preco === 0 ? 'FREE' : '€' + e.preco) : '';
    const locationText = e.online ? 'Online' : `${e.pais}, ${e.cidade}`;
    card.innerHTML = `<div class="card-content"><h3>${e.nome}</h3><p class="meta">${locationText} • ${formatMonthYear(e.data_inicio)}${priceText ? ' • ' + priceText : ''}</p><p>${e.summary}</p><div class="tags">${e.temas.map(t => `<span class="tag">${t}</span>`).join('')}</div><a href="${e.link}" class="btn" target="_blank">View Event</a></div>`;
    c.appendChild(card);
  });
}
