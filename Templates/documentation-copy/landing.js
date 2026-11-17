// Workspace data: one source for the hero, the chips, the gallery and the viewer.
const W = [
  { id: 'atmospheric', name: 'Atmospheric', who: 'The daydreamer', line: 'Rain on the glass. Nowhere to be.',
    what: 'Rain running down the window, a serif hand, the clock, weather, music and the day in columns.' },
  { id: 'hillside', name: 'Hillside', who: 'The nature lover', line: 'Out the door by seven. Back for second breakfast.',
    what: 'A meadow moving in the wind, the weather up front, field notes on the birds, and walks tracked as habits.' },
  { id: 'terminal', name: 'Terminal', who: 'The hacker', line: 'Your mouse can take the day off.',
    what: 'Black and green, a real shell, a man page and the day in monospace.' },
  { id: 'minimal', light: true, name: 'Minimal', who: 'The minimalist', line: 'One note. One clock. Breathe.',
    what: 'Paper, a clock and one note. Nothing else asked for.' },
  { id: 'mission-control', name: 'Mission control', who: 'The maximalist', line: 'Why choose?',
    what: 'Stars drifting behind every card: agenda, tasks, habits, music, weather and a pomodoro.' },
  { id: 'neo-tokyo', name: 'Neo-Tokyo', who: 'The night owl', line: 'Open late.',
    what: "Neon signs humming, the evening's plans, and synthwave on the speakers." },
  { id: 'the-study', name: 'The study', who: 'The scholar', line: 'Footnotes welcome.',
    what: "Antonello's Saint Jerome at his desk, a reading note, the thesis outline and a year ago today." },
  { id: 'the-reader', name: 'The reader', who: 'The bookworm', line: 'Just one more chapter.',
    what: "Alice down the rabbit-hole, Tenniel's White Rabbit, pages read as a habit, and shelves in the half-light." },
  { id: 'studio', name: 'Studio', who: 'The musician', line: 'Hum it before you forget it.',
    what: 'A record turning in a dark room, lyrics in progress, the recorder one key away, and the session on the agenda.' },
  { id: 'the-kitchen', light: true, name: 'The kitchen', who: 'The home cook', line: 'Taste as you go.',
    what: "Something simmering on the stove, tonight's recipe, a timer, the shopping list and the week's dinners." },
  // Light mode only, in the gallery: the hero keeps to the ten above.
  { id: 'the-garden', light: true, hero: false, name: 'The garden', who: 'The gardener', line: 'Plant in spring. Weed forever.',
    what: "Monet's dahlias at Argenteuil, the planting plan, the month ahead, and watering kept as a habit." },
  { id: 'seaside', light: true, hero: false, name: 'Seaside', who: 'The traveller', line: 'Out of office. Mostly.',
    what: "Sorolla's walk along the shore, the day's trip, a packing list, swims as a habit, and music for the train." },
  { id: 'morning-pages', light: true, hero: false, name: 'Morning pages', who: 'The journaler', line: 'Three pages before coffee.',
    what: "Hammershøi's sunlight on a bare floor, the day's pages, a timer, and what you wrote a year ago today." },
  { id: 'the-planner', light: true, hero: false, name: 'The planner', who: 'The organiser', line: 'Every dot in its place.',
    what: "Seurat's Sunday on La Grande Jatte, the day's agenda, tasks, the month on one page and what's coming up." },
];
const big = w => `/_assets/ws-${w.id}.jpg`;
const small = w => `/_assets/ws-${w.id}-small.jpg`;
const clip = w => `/_assets/ws-${w.id}.mp4`;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = (tag, cls, html) => Object.assign(document.createElement(tag), cls ? { className: cls } : {}, html ? { innerHTML: html } : {});

// A workspace's picture: its clip, large and moving, or its still.
function scene(w, moving) {
  if (moving && !reduce) return el('div', 'scene', `<video src="${clip(w)}" poster="${big(w)}" muted loop playsinline preload="none"></video>`);
  return el('div', 'scene', `<img src="${moving ? big(w) : small(w)}" alt="The ${w.name} workspace" loading="lazy">`);
}
const play = (node, on) => { const v = node.querySelector('video'); if (v) on ? v.play().catch(() => {}) : v.pause(); };

// Hero: crossfade through the workspaces; a chip jumps to one.
const stage = document.getElementById('stage');
const chips = document.getElementById('chips');
const H = W.filter(w => w.hero !== false);
const layers = H.map(w => { const l = el('div', 'layer'); l.dataset.id = w.id; l.append(scene(w, true)); stage.append(l); return l; });
let at = 0, timer;
const show = i => {
  at = (i + H.length) % H.length;
  // Only the one showing plays, so the others don't load until their turn.
  layers.forEach((l, j) => { l.classList.toggle('on', j === at); play(l, j === at); });
  [...chips.children].forEach((c, j) => c.setAttribute('aria-pressed', j === at));
};
H.forEach((w, i) => { const b = el('button', 'chip', w.name); b.onclick = () => { show(i); clearInterval(timer); }; chips.append(b); });
show(0);
if (!reduce) timer = setInterval(() => show(at + 1), 7000);

// Gallery and viewer: a dark set and a light set, with a toggle between them.
const gallery = document.getElementById('gallery');
const viewer = document.getElementById('viewer');
const tone = document.getElementById('tone');
const tile = w => {
  const t = el('button', 'tile');
  // The still, and over it, while pointed at, the clip.
  const still = scene(w);
  t.onmouseenter = () => { if (reduce) return; const s = scene(w, true); s.classList.add('hover-clip'); still.append(s); play(s, true); };
  t.onmouseleave = () => still.querySelector('.hover-clip')?.remove();
  t.append(still, el('span', 'cap', `<b>${w.name}</b><small>${w.who}</small><em>${w.line}</em>`));
  t.onclick = () => {
    const s = scene(w, true);
    viewer.querySelector('.viewer-media').replaceChildren(s);
    play(s, true);
    viewer.querySelector('h3').textContent = w.name;
    viewer.querySelector('.who').textContent = `${w.who}. ${w.line}`;
    viewer.querySelector('.what').textContent = w.what;
    viewer.showModal();
  };
  return t;
};
const sets = [W.filter(w => !w.light).map(tile), W.filter(w => w.light).map(tile)];
sets[0].forEach(t => { t.classList.add('reveal'); gallery.append(t); });

// The toggle: dawn rises behind the page while the tiles turn over, one after another.
let light = false, busy = false;
const turn = (tiles, from, to) => Promise.all(tiles.map((t, i) => t.animate(
  [{ transform: `perspective(1200px) rotateY(${from}deg)`, opacity: from ? 0 : 1 }, { transform: `perspective(1200px) rotateY(${to}deg)`, opacity: to ? 0 : 1 }],
  { duration: 420, delay: i * 70, easing: from ? 'cubic-bezier(0.2, 0.7, 0.2, 1)' : 'cubic-bezier(0.6, 0, 0.8, 0.3)', fill: 'both' }).finished));
tone.onclick = async () => {
  if (busy) return;
  busy = true;
  light = !light;
  tone.setAttribute('aria-pressed', light);
  document.documentElement.classList.toggle('day', light);
  const [out, next] = light ? sets : [sets[1], sets[0]];
  if (!reduce) await turn(out, 0, -90);
  next.forEach(t => t.classList.add('in'));
  gallery.replaceChildren(...next);
  if (!reduce) { await turn(next, 90, 0); next.forEach(t => t.getAnimations().forEach(a => a.cancel())); }
  busy = false;
};
viewer.onclick = e => { if (e.target === viewer) viewer.close(); };

// Workspaces demo: names slide past as the scene changes.
const spaces = document.getElementById('spaces');
['atmospheric', 'hillside', 'neo-tokyo'].forEach((id, i) => {
  const w = W.find(x => x.id === id);
  const s = scene(w);
  s.style.animationDelay = `${i * -4}s`;
  s.append(el('span', 'tag', w.name));
  spaces.append(s);
});

// Sections rise into view once.
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(n => io.observe(n));
