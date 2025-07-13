import { formatMonthYear, parseStartDate } from './utils.js';

export function populateFilters(events) {
  const loc = document.getElementById('filter-location');
  loc.innerHTML = '<option value="">Location</option>';

  const countries = [...new Set(events.filter(e => !e.online).map(e => e.pais))]
    .sort((a, b) => a.localeCompare(b));

  countries.forEach(country => {
    const group = document.createElement('optgroup');
    group.label = country;
    const cities = [...new Set(events.filter(e => !e.online && e.pais === country).map(e => e.cidade))]
      .sort((a, b) => a.localeCompare(b));
    const optAll = document.createElement('option');
    optAll.value = `${country}||`;
    optAll.textContent = `All ${country}`;
    group.appendChild(optAll);
    cities.forEach(city => {
      const opt = document.createElement('option');
      opt.value = `${country}||${city}`;
      opt.textContent = city;
      group.appendChild(opt);
    });
    loc.appendChild(group);
  });

  if (events.some(e => e.online)) {
    const opt = document.createElement('option');
    opt.value = 'ONLINE';
    opt.textContent = 'Online';
    loc.appendChild(opt);
  }

  const dateSel = document.getElementById('filter-date');
  dateSel.innerHTML = '<option value="">Date</option>' +
    [...new Set(events.map(e => formatMonthYear(e.data_inicio)))].map(d => `<option value="${d}">${d}</option>`).join('');

  const priceSel = document.getElementById('filter-price');
  const priceLabel = document.getElementById('price-label');
  const prices = events.map(e => e.preco).filter(p => p != null).sort((a, b) => a - b);
  if (prices.length) {
    priceSel.min = 0;
    priceSel.max = prices[prices.length - 1];
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

export function applyFilters(events, selectedTheme) {
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
  today.setHours(0, 0, 0, 0);

  return events.filter(e => {
    if (term && !e.nome.toLowerCase().includes(term) && !e.summary.toLowerCase().includes(term)) return false;
    if (selectedTheme && !e.temas.includes(selectedTheme)) return false;
    if (locVal) {
      if (locVal === 'ONLINE') {
        if (!e.online) return false;
      } else {
        const [c, city] = locVal.split('||');
        if (city ? e.cidade !== city : e.pais !== c) return false;
      }
    }
    if (maxPrice < priceMax) {
      if (e.preco == null || (e.preco > maxPrice && e.preco !== 0)) return false;
    }
    if (hideNoPrice && e.preco == null) return false;
    if (dateVal && formatMonthYear(e.data_inicio) !== dateVal) return false;
    if (hidePast && parseStartDate(e.data_inicio) < today) return false;
    return true;
  });
}
