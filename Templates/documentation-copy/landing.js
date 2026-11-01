// Workspace data: one source for the hero, the chips, the gallery and the viewer.
// A workspace with `img` shows its real screenshot; the rest draw a mock until their screenshots exist.
const W = [
  { id: 'calm', name: 'Calm', who: 'The early riser', line: 'Coffee first. Then the day.',
    what: 'An autumn landscape, glass cards, the clock, weather, agenda and a little Liszt.',
    img: '/_assets/calm.jpg', video: '/_assets/calm.mp4' },
  { id: 'cozy', name: 'Cozy', who: 'The homebody', line: 'Blanket not included.',
    what: 'Warm light, a serif hand, podcasts, habits and the daily note.',
    cards: [['Podcasts', 4, 3, 'Ep. 212'], ['Daily', 5, 6, 'Sunday, November 1'], ['Habits', 3, 3, '● ● ● ○'], ['Music', 4, 3, 'Rain, softly'], ['Weather', 3, 3, '48°']] },
  { id: 'terminal', name: 'Terminal', who: 'The hacker', line: 'Your mouse can take the day off.',
    what: 'Black and green, monospace, a shell, a web page and a dense tiled layout.',
    cards: [['Terminal', 7, 4, '$ npm run dev_'], ['Web page', 5, 6, 'github.com'], ['Agenda', 3, 2, '10:00 standup'], ['Daily', 4, 2, '2026-11-01']] },
  { id: 'minimal', name: 'Minimal', who: 'The minimalist', line: 'One note. One clock. Breathe.',
    what: 'Off-white paper, no frames, the daily note and a small clock.',
    cards: [['', 2, 6, ''], ['Daily', 7, 6, 'Sunday'], ['Clock', 3, 2, '9:41']] },
  { id: 'mission', name: 'Mission control', who: 'The maximalist', line: 'Why choose?',
    what: 'The stars video background and every card there is, stacked and floating.',
    bg: '/_assets/bg-stars.jpg',
    cards: ['Clock', 'Weather', 'Agenda', 'Daily', 'Tasks', 'Music', 'Calendar', 'Habits', 'Podcasts', 'Recorder', 'Pomodoro', 'Web page'].map(t => [t, 3, 2, '']) },
  { id: 'tokyo', name: 'Neo-Tokyo', who: 'The night owl', line: 'Open late.',
    what: 'Neon rain, magenta and cyan, the agenda timeline and lo-fi on repeat.',
    cards: [['Agenda', 4, 6, '23:00'], ['Daily', 5, 4, '日曜日'], ['Clock', 3, 3, '23:47'], ['Music', 3, 3, 'lo-fi'], ['Web page', 5, 2, '']] },
  { id: 'study', name: 'The study', who: 'The scholar', line: 'Footnotes welcome.',
    what: 'Saint Jerome at his desk, a reading note, the index and a year ago today.',
    bg: '/_assets/bg-study.jpg',
    cards: [['Note', 5, 6, 'On method'], ['Index', 3, 3, ''], ['Time machine', 4, 3, 'A year ago'], ['Web page', 4, 3, 'arxiv.org'], ['Pomodoro', 3, 3, '25:00']] },
  { id: 'finals', name: 'Finals week', who: 'The student', line: 'Due Friday. Started Thursday.',
    what: 'Pastels, the calendar, tasks by due date and a stern pomodoro.',
    cards: [['Calendar', 5, 4, 'November'], ['Tasks', 4, 6, '3 overdue'], ['Pomodoro', 3, 3, '25:00'], ['Upcoming', 3, 3, 'Fri: essay'], ['Daily', 5, 2, '']] },
];

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = (tag, cls, html) => Object.assign(document.createElement(tag), cls ? { className: cls } : {}, html ? { innerHTML: html } : {});

// A workspace's picture: its screenshot, or a mock drawn from its cards.
function scene(w, big) {
  if (w.img) {
    if (big && w.video && !reduce) return el('div', 'scene', `<video src="${w.video}" poster="${w.img}" autoplay muted loop playsinline></video>`);
    return el('div', 'scene', `<img src="${w.img}" alt="The ${w.name} workspace" loading="lazy">`);
  }
  const s = el('div', `scene mock m-${w.id}`);
  if (w.bg) s.style.backgroundImage = `url(${w.bg})`;
  s.append(el('p', 'm-date', 'Sunday, November 1'));
  const grid = el('div', 'm-grid');
  for (const [t, c, r, big] of w.cards) {
    const card = el('div', t ? 'm-card' : 'm-gap');
    card.style.gridColumn = `span ${c}`;
    card.style.gridRow = `span ${r}`;
    if (t) card.innerHTML = `<b>${t}</b>${big ? `<span>${big}</span>` : ''}<i></i><i></i>`;
    grid.append(card);
  }
  s.append(grid);
  return s;
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
['calm', 'cozy', 'tokyo'].forEach((id, i) => {
  const w = W.find(x => x.id === id);
  const s = scene(w);
  s.style.animationDelay = `${i * -4}s`;
  s.append(el('span', 'tag', w.name));
  spaces.append(s);
});

// Sections rise into view once.
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(n => io.observe(n));
