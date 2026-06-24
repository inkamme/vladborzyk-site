/* ===== Vlad Borzyk — vladborzyk.com =====
   Catalogue data + filter + lightbox + floating UI + reveal. Vanilla JS. */

const PAINTINGS = [
  { slug:'path_to_the_sun',  title:'Path to the Sun',         medium:'Oil on canvas',      dim:'11 × 14 in', price:'$170 CAD', status:'available', note:'A path of light running out across Lake Huron, dune grass in the foreground — painted from the shore.' },
  { slug:'summer_sparks',    title:'Summer Sparks',           medium:'Oil on canvas',      dim:'11 × 14 in', price:'$250 CAD', status:'available', note:'Cut cosmos in a glass against a deep blue ground — warm summer colour caught at the table.' },
  { slug:'broken_balance',   title:'Broken Balance',          medium:'Acrylic on canvas',  dim:'24 × 24 in', price:'$460 CAD', status:'available', note:'Pomegranate and rose — a still life that plays warm reds against a bright blue field.' },
  { slug:'golden_pines',     title:'Golden Pines · Whispered Light', medium:'Oil on canvas', dim:'10 × 10 in', price:'$190 CAD', status:'available', note:'Sunlit trunks in a colourful stand of pines — light filtering low between the trees.' },
  { slug:'the_lake_in_fall', title:'The Lake in Fall',        medium:'Oil on canvas',      dim:'18 × 24 in', price:'$330 CAD', status:'available', note:'Autumn reds mirrored in still water — a quiet Ontario shoreline turning for the season.' },
  { slug:'citrus_wild_daisy',title:'Citrus & Wild Daisy',     medium:'Acrylic on canvas',  dim:'12 × 12 in', price:'$170 CAD', status:'available', note:'A daisy, an orange, and a halved citrus on a pink-and-blue table — small and bright.' },
  { slug:'rose',             title:'Rose',                    medium:'Acrylic on canvas',  dim:'16 × 16 in', price:'$190 CAD', status:'available', note:'A single red rose in a round vase against a textured blue ground.' },
  { slug:'summer_forest',    title:'Summer Forest',           medium:'Oil on canvas',      dim:'18 × 24 in', price:'$330 CAD', status:'available', note:'Light through tall summer trunks — green, blue, and warm orange bark, a path opening to sky.' },

  { slug:'apple_blossom_reverie', title:'Apple Blossom Reverie', medium:'Oil on canvas',   dim:'12 × 12 in', price:'Sold', status:'sold', note:'Apples and apple blossom on a soft blue ground.' },
  { slug:'sun_in_a_glass',   title:'Sun in a Glass',          medium:'Oil on canvas',      dim:'12 × 12 in', price:'Sold', status:'sold', note:'Golden grapes catching the light in a glass — a study in warm translucence.' },
  { slug:'winter_forest',    title:'Winter Forest',           medium:'Acrylic on canvas',  dim:'18 × 24 in', price:'Sold', status:'sold', note:'Last winter light burning gold between snow-laden pines.' },
  { slug:'barn',             title:'Barn',                    medium:'Oil on canvas',      dim:'16 × 24 in', price:'Sold', status:'sold', note:'An Ontario farm under a dramatic blue sky, gold field running to the horizon.' },
  { slug:'cherries',         title:'Cherries',                medium:'Acrylic on canvas',  dim:'12 × 16 in', price:'Sold', status:'sold', note:'A row of ripe cherries, red against warm and blue — bold and close-up.' },
];

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOVER  = window.matchMedia('(hover: hover)').matches;

/* ---- render cards (cascade delay + tilt) ---- */
const grid = document.getElementById('grid');
PAINTINGS.forEach((p, i) => {
  const meta = p.dim ? `${p.medium}&nbsp;&nbsp;·&nbsp;&nbsp;${p.dim}` : p.medium;
  const priceCls = p.status === 'sold' ? 'c-price sold' : 'c-price';
  const badge = p.status === 'sold' ? '<span class="badge">Sold</span>' : '';
  const card = document.createElement('button');
  card.className = 'card reveal';
  card.dataset.status = p.status;
  card.style.transitionDelay = (Math.min(i, 8) * 70) + 'ms';   // cascade in
  card.innerHTML = `
    <span class="frame">${badge}<img src="images/${p.slug}.jpg" alt="${p.title} — ${p.medium}${p.dim ? ', ' + p.dim : ''}" loading="lazy"></span>
    <span class="c-title">${p.title}</span>
    <span class="c-meta">${meta}</span>
    <span class="${priceCls}">${p.price}</span>`;
  card.addEventListener('click', () => openLB(i));
  grid.appendChild(card);

  if (!REDUCE && HOVER){
    const frame = card.querySelector('.frame');
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      frame.style.transform = `translateY(-5px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*5).toFixed(2)}deg)`;
    });
    card.addEventListener('pointerleave', () => { frame.style.transform = ''; });
  }
});

/* ---- filters ---- */
const filterBtns = document.querySelectorAll('.filters button');
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const f = btn.dataset.filter;
  document.querySelectorAll('.card').forEach(c => {
    c.style.display = (f === 'all' || c.dataset.status === f) ? '' : 'none';
  });
}));

/* ---- lightbox ---- */
const lb = document.getElementById('lb');
const lbImg = document.getElementById('lbImg');
const lbTitle = document.getElementById('lbTitle');
const lbMeta = document.getElementById('lbMeta');
const lbPrice = document.getElementById('lbPrice');
const lbDesc = document.getElementById('lbDesc');
const lbBtn = document.getElementById('lbBtn');

function openLB(i){
  const p = PAINTINGS[i];
  lbImg.src = `images/${p.slug}.jpg`; lbImg.alt = p.title;
  lbTitle.textContent = p.title;
  lbMeta.innerHTML = p.dim ? `${p.medium}&nbsp;&nbsp;·&nbsp;&nbsp;${p.dim}` : p.medium;
  lbPrice.textContent = p.price;
  lbPrice.className = p.status === 'sold' ? 'p sold' : 'p';
  lbDesc.textContent = p.note;
  lbBtn.style.display = p.status === 'sold' ? 'none' : '';
  lb.classList.add('open'); lb.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function closeLB(){
  lb.classList.remove('open'); lb.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
document.getElementById('lbClose').addEventListener('click', closeLB);
lb.addEventListener('click', e => { if (e.target === lb) closeLB(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLB(); });

/* ---- build side nav dots ---- */
const dotNav = document.getElementById('dotnav');
const STOPS = [['top','Top'],['work','Work'],['teaching','Teaching'],['about','About'],['contact','Contact']];
if (dotNav){
  STOPS.forEach(([id,label]) => {
    const a = document.createElement('a');
    a.href = '#' + id; a.dataset.id = id; a.setAttribute('aria-label', label);
    a.innerHTML = `<span class="d"></span><span class="lbl">${label}</span>`;
    a.addEventListener('click', e => {
      e.preventDefault();
      const el = document.getElementById(id);
      window.scrollTo({ top: id === 'top' ? 0 : el.offsetTop - 60, behavior:'smooth' });
    });
    dotNav.appendChild(a);
  });
}
const dotLinks = dotNav ? dotNav.querySelectorAll('a') : [];

/* ---- sticky nav + FAB + side-dots visibility + scroll-progress stripe ---- */
const nav = document.getElementById('nav');
const fab = document.getElementById('fab');
const edgeFill = document.getElementById('edgeFill');
const menuLinks = document.querySelectorAll('.menu a');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 12);
  fab.classList.toggle('show', y > window.innerHeight * 0.6);
  if (dotNav) dotNav.classList.toggle('show', y > window.innerHeight * 0.5);
  if (edgeFill){
    const max = document.documentElement.scrollHeight - window.innerHeight;
    edgeFill.style.height = (max > 0 ? (y / max) * 100 : 0) + '%';
  }
}, { passive:true });

/* ---- active section for both top-nav and side-dots ---- */
const secObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting){
      const id = e.target.id;
      menuLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
      dotLinks.forEach(a => a.classList.toggle('active', a.dataset.id === id));
    }
  });
}, { rootMargin:'-45% 0px -50% 0px' });
STOPS.forEach(([id]) => { const el = document.getElementById(id); if (el) secObs.observe(el); });

/* ---- scroll reveal ---- */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); revObs.unobserve(e.target); } });
}, { threshold:0.08 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ---- drifting mosaic dots (hero ambient) ---- */
const dots = document.getElementById('dots');
if (dots && !REDUCE){
  for (let i = 0; i < 14; i++){
    const d = document.createElement('i');
    d.style.left = Math.random()*100 + '%';
    d.style.top = Math.random()*100 + '%';
    d.style.animationDuration = (7 + Math.random()*9) + 's';
    d.style.animationDelay = (-Math.random()*8) + 's';
    d.style.transform = `scale(${0.6 + Math.random()*1.2})`;
    dots.appendChild(d);
  }
}

/* ---- gentle parallax on artwork frames ---- */
if (!REDUCE){
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const vh = window.innerHeight;
      document.querySelectorAll('.frame img').forEach(img => {
        const r = img.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh){
          const off = ((r.top + r.height/2) - vh/2) / vh;
          img.style.translate = `0 ${(-off*12).toFixed(1)}px`;
        }
      });
      ticking = false;
    });
  }, { passive:true });
}

/* ---- teaching photo galleries ---- */
const TEACH_GALLERY = {
  mosaic: [
    { src:'mosaic_detail.jpg', cap:'A snowflake mosaic in smalti' },
    { src:'mosaic_class.jpg',  cap:'Mosaic workshop at SHAC' },
    { src:'mosaic_smile.jpg',  cap:'A finished tile coming together' },
  ],
  leaf: [
    { src:'leaf_class.jpg',  cap:'Leaf printing in progress' },
    { src:'leaf_result.jpg', cap:'Prints laid out to dry' },
    { src:'leaf_detail.jpg', cap:'A single fern print' },
    { src:'mixed_wall.jpg',  cap:'Mixed-media still lifes from class' },
  ],
  acrylic: [
    { src:'acrylic_studio.jpg', cap:'The studio at work' },
    { src:'acrylic_class.jpg',  cap:'Adult beginners painting' },
    { src:'acrylic_work.jpg',   cap:'Palette and a sunset-forest canvas' },
    { src:'acrylic_table.jpg',  cap:'Paints and brushes mid-session' },
  ],
};

const tgal = document.getElementById('tgal');
const tgalImg = document.getElementById('tgalImg');
const tgalCap = document.getElementById('tgalCap');
const tgalNum = document.getElementById('tgalNum');
let tgalSet = [], tgalIdx = 0;

function tgalShow(i){
  const n = tgalSet.length;
  tgalIdx = (i + n) % n;
  const item = tgalSet[tgalIdx];
  tgalImg.src = 'images/teaching/' + item.src;
  tgalImg.alt = item.cap;
  tgalCap.textContent = item.cap;
  tgalNum.textContent = (tgalIdx + 1) + ' / ' + n;
}
function tgalOpen(dir){
  tgalSet = TEACH_GALLERY[dir] || [];
  if (!tgalSet.length) return;
  tgalShow(0);
  tgal.classList.add('open');
  tgal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
}
function tgalClose(){
  tgal.classList.remove('open');
  tgal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}
document.querySelectorAll('.t-photo[data-gallery]').forEach(btn => {
  btn.addEventListener('click', () => tgalOpen(btn.dataset.gallery));
});
document.getElementById('tgalClose').addEventListener('click', tgalClose);
document.getElementById('tgalPrev').addEventListener('click', () => tgalShow(tgalIdx - 1));
document.getElementById('tgalNext').addEventListener('click', () => tgalShow(tgalIdx + 1));
tgal.addEventListener('click', e => { if (e.target === tgal) tgalClose(); });
document.addEventListener('keydown', e => {
  if (!tgal.classList.contains('open')) return;
  if (e.key === 'Escape') tgalClose();
  if (e.key === 'ArrowLeft') tgalShow(tgalIdx - 1);
  if (e.key === 'ArrowRight') tgalShow(tgalIdx + 1);
});
