// Turns a guide page's markdown into the site's layout: the title and its lead as a header, then each `##`
// section as a row of words beside its first picture or clip. A heading written `Name | Headline` gets
// Name as its small label. A section with no picture keeps the full width, as tables need.
const doc = document.getElementById('doc');

for (const a of document.querySelectorAll('.pages a')) {
  if (a.pathname === location.pathname) a.classList.add('on');
}

const kids = [...doc.children];
const split = (h) => {
  const [label, ...rest] = h.innerHTML.split(' | ');
  if (!rest.length) return;
  h.innerHTML = rest.join(' | ');
  const p = document.createElement('p');
  p.className = 'eyebrow';
  p.innerHTML = label;
  h.before(p);
};

const header = document.createElement('header');
header.className = 'doc-head';
let i = 0;
while (i < kids.length && kids[i].tagName !== 'H2') header.append(kids[i++]);
const h1 = header.querySelector('h1');
if (h1) split(h1);
doc.replaceChildren(header);

let flip = false;
while (i < kids.length) {
  const section = [kids[i++]];
  while (i < kids.length && kids[i].tagName !== 'H2') section.push(kids[i++]);
  const media = section.map((n) => n.matches('video, img') ? n : n.querySelector(':scope > video, :scope > img')).find(Boolean);
  const row = document.createElement('article');
  const copy = document.createElement('div');
  copy.className = 'copy';
  row.append(copy);
  for (const n of section) if (!(media && (n === media || n.contains(media)) && n.textContent.trim() === '')) copy.append(n);
  split(copy.querySelector('h2'));
  if (media) {
    const fig = document.createElement('figure');
    fig.className = 'shot';
    fig.append(media);
    row.append(fig);
    row.className = `feature reveal${flip ? ' flip' : ''}`;
    flip = !flip;
  } else row.className = 'feature wide reveal';
  doc.append(row);
}

// Clips play while in sight, without sound, over and over.
const play = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause()), { threshold: 0.3 });
for (const v of doc.querySelectorAll('video')) {
  Object.assign(v, { muted: true, loop: true, playsInline: true, preload: 'metadata' });
  play.observe(v);
}
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach((n) => io.observe(n));
