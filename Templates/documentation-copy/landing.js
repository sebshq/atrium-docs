// Workspace data: one source for the hero, the chips, the gallery and the viewer.
const W = [
  { id: 'calm', name: 'Calm', who: 'The early riser', line: 'Coffee first. Then the day.',
    what: 'An autumn landscape, glass cards, the clock, weather, agenda and a little Liszt.', video: '/_assets/calm.mp4' },
  { id: 'cozy', name: 'Cozy', who: 'The homebody', line: 'Blanket not included.',
    what: "Carl Larsson's lamplight, a serif hand, music, habits and the day's small plans." },
  { id: 'terminal', name: 'Terminal', who: 'The hacker', line: 'Your mouse can take the day off.',
    what: 'Black and green, a real shell, a man page and the day in monospace.' },
  { id: 'minimal', name: 'Minimal', who: 'The minimalist', line: 'One note. One clock. Breathe.',
    what: 'Paper, a clock and one note. Nothing else asked for.' },
  { id: 'mission-control', name: 'Mission control', who: 'The maximalist', line: 'Why choose?',
    what: 'Stars drifting behind every card: agenda, tasks, habits, music, weather and a pomodoro.' },
  { id: 'neo-tokyo', name: 'Neo-Tokyo', who: 'The night owl', line: 'Open late.',
    what: "Kawase Hasui's night rain, neon edges, the evening's plans and something on the speakers." },
  { id: 'the-study', name: 'The study', who: 'The scholar', line: 'Footnotes welcome.',
    what: "Antonello's Saint Jerome, a reading note, the thesis outline and a year ago today." },
  { id: 'finals-week', name: 'Finals week', who: 'The student', line: 'Due Friday. Started Thursday.',
    what: 'Pastels, the calendar, tasks by due date and a stern pomodoro.' },
];
const big = w => w.id === 'calm' ? '/_assets/calm.jpg' : `/_assets/ws-${w.id}.jpg`;
const small = w => w.id === 'calm' ? '/_assets/calm-small.jpg' : `/_assets/ws-${w.id}-small.jpg`;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = (tag, cls, html) => Object.assign(document.createElement(tag), cls ? { className: cls } : {}, html ? { innerHTML: html } : {});

// A workspace's picture: its clip if asked for and it has one, else its screenshot.
function scene(w, large) {
  if (large && w.video && !reduce) return el('div', 'scene', `<video src="${w.video}" poster="${big(w)}" autoplay muted loop playsinline></video>`);
  return el('div', 'scene', `<img src="${large ? big(w) : small(w)}" alt="The ${w.name} workspace" loading="lazy">`);
}

// Hero: crossfade through the workspaces; a chip jumps to one.
const stage = document.getElementById('stage');
const chips = document.getElementById('chips');
const layers = [stage.firstElementChild];
W.slice(1).forEach(w => { const l = el('div', 'layer'); l.dataset.id = w.id; l.append(scene(w, true)); stage.append(l); layers.push(l); });
let at = 0, timer;
const show = i => {
  at = (i + W.length) % W.length;
  layers.forEach((l, j) => l.classList.toggle('on', j === at));
  [...chips.children].forEach((c, j) => c.setAttribute('aria-pressed', j === at));
};
W.forEach((w, i) => { const b = el('button', 'chip', w.name); b.onclick = () => { show(i); clearInterval(timer); }; chips.append(b); });
show(0);
if (!reduce) timer = setInterval(() => show(at + 1), 5000);

// Gallery and viewer.
const gallery = document.getElementById('gallery');
const viewer = document.getElementById('viewer');
W.forEach(w => {
  const t = el('button', 'tile reveal');
  t.append(scene(w), el('span', 'cap', `<b>${w.name}</b><small>${w.who}</small><em>${w.line}</em>`));
  t.onclick = () => {
    viewer.querySelector('.viewer-media').replaceChildren(scene(w, true));
    viewer.querySelector('h3').textContent = w.name;
    viewer.querySelector('.who').textContent = `${w.who}. ${w.line}`;
    viewer.querySelector('.what').textContent = w.what;
    viewer.showModal();
  };
  gallery.append(t);
});
viewer.onclick = e => { if (e.target === viewer) viewer.close(); };

// Workspaces demo: names slide past as the scene changes.
const spaces = document.getElementById('spaces');
['calm', 'cozy', 'neo-tokyo'].forEach((id, i) => {
  const w = W.find(x => x.id === id);
  const s = scene(w);
  s.style.animationDelay = `${i * -4}s`;
  s.append(el('span', 'tag', w.name));
  spaces.append(s);
});

// Sections rise into view once.
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(n => io.observe(n));
