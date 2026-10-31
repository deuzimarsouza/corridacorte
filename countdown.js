const EventCountdown = (() => {
 const start = Date.parse('2026-11-29T05:30:00-03:00');
 function message(now = Date.now()) {
  const remaining = Math.max(0, Math.ceil((start - now) / 1000));
  if (!remaining) return 'A largada chegou! Bom corre!';
  const units = [
   [Math.floor(remaining / 86400), 'dia'],
   [Math.floor(remaining / 3600) % 24, 'hora'],
   [Math.floor(remaining / 60) % 60, 'minuto'],
   [remaining % 60, 'segundo']
  ];
  const parts = units.filter(([value]) => value > 0).map(([value, label]) => `${value} ${label}${value === 1 ? '' : 's'}`);
  const text = parts.length === 1 ? parts[0] : parts.slice(0, -1).join(', ') + ' e ' + parts.at(-1);
  return `${parts.length === 1 && units.find(([value]) => value > 0)[0] === 1 ? 'Falta' : 'Faltam'} apenas ${text}`;
 }
 function render(element, now = Date.now()) {
  const text = message(now);
  if (element.textContent !== text) element.textContent = text;
 }
 return {start, message, render};
})();
if (typeof module !== 'undefined') module.exports = EventCountdown;
