const EventCountdown = (() => {
  const start = Date.parse('2026-11-29T05:30:00-03:00');
  function state(now = Date.now()) {
    const remaining = Math.max(0, start - now),
      minutes = Math.floor(remaining / 60000);
    return {
      days: Math.floor(minutes / 1440),
      hours: Math.floor(minutes / 60) % 24,
      minutes: minutes % 60,
      finished: remaining === 0,
      lastMinute: remaining > 0 && minutes === 0,
    };
  }
  function message(now = Date.now()) {
    const value = state(now);
    if (value.finished) return 'A largada chegou! Bom corre!';
    if (value.lastMinute) return 'É agora! Falta menos de 1 minuto.';
    const units = [
      [value.days, 'dia'],
      [value.hours, 'hora'],
      [value.minutes, 'minuto'],
    ].filter(([number]) => number > 0);
    const parts = units.map(([number, label]) => `${number} ${label}${number === 1 ? '' : 's'}`);
    const text =
      parts.length === 1 ? parts[0] : parts.slice(0, -1).join(', ') + ' e ' + parts.at(-1);
    return `${units.length === 1 && units[0][0] === 1 ? 'Falta' : 'Faltam'} apenas ${text}`;
  }
  function render(element, now = Date.now()) {
    const value = state(now),
      text = message(now);
    const set = (selector, text) => {
      const node = element.querySelector(selector);
      if (node.textContent !== text) node.textContent = text;
    };
    set('[data-countdown-label]', value.finished ? 'Largada' : 'Até a largada');
    set('[data-countdown-message]', text);
    for (const unit of ['days', 'hours', 'minutes'])
      set('[data-countdown-' + unit + ']', String(value[unit]).padStart(2, '0'));
    set('[data-countdown-hint]', value.finished || value.lastMinute ? text : '');
    element.querySelector('[data-countdown-hint]').hidden = !value.finished && !value.lastMinute;
  }
  return { start, state, message, render };
})();
if (typeof module !== 'undefined') module.exports = EventCountdown;
