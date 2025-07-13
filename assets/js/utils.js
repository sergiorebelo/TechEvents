export function formatMonthYear(str) {
  if (typeof str === 'string') {
    const dp = /^Date\(\s*([0-9]{4})\s*,\s*([0-9]{1,2})\s*,\s*([0-9]{1,2})\s*\)/.exec(str);
    if (dp) {
      const [, year, month, day] = dp;
      const mm = String(Number(month) + 1).padStart(2, '0');
      const dd = day.padStart(2, '0');
      str = `${year}-${mm}-${dd}`;
    }
  }
  const m = /^([0-9]{4})-([0-9]{2})/.exec(str);
  if (m) {
    const date = new Date(m[1], m[2] - 1);
    return date.toLocaleDateString('en', { month: 'long', year: 'numeric' });
  }
  return str;
}

export function parseStartDate(str) {
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
