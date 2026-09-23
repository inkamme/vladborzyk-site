/* ===== Vlad Borzyk — vladborzyk.com =====
   Catalogue data + filter + lightbox + floating UI + reveal. Vanilla JS. */

const PAINTINGS = [
  { slug:'silver_water', title:'Silver Water', medium:'Oil on canvas', dim:'8 × 10 in', price:'$120 CAD', status:'available', note:'Silver light reflected on blue water beside the shore.' },
  { slug:'evening_bloom', title:'Evening Bloom', medium:'Oil on canvas', dim:'12 × 12 in', price:'Sold', status:'sold', note:'Yellow leaves in a glass vase against a rich blue background.' },
  { slug:'harvest_glow', title:'Harvest Glow', medium:'Oil on canvas', dim:'12 × 16 in', price:'Sold', status:'sold', note:'Grapes and lemon with glass vessels, set against a deep blue background.' },
  { slug:'quiet_forest_rhythm', title:'Quiet Forest Rhythm', medium:'Oil on canvas', dim:'11 × 14 in', price:'Sold', status:'sold', note:'Warm light between cool blue trees and a path through the forest.' },
  { slug:'orange_umbrella', title:'Orange Umbrella', medium:'Oil on canvas', dim:'8 × 10 in', price:'$120 CAD', status:'available', note:'An orange umbrella and a beach chair beside sunlit water.' },
  { slug:'summer_sparks',    title:'Summer Sparks',           medium:'Oil on canvas',      dim:'11 × 14 in', price:'Sold', status:'sold', note:'Cut cosmos in a glass against a deep blue ground — warm summer colour caught at the table.' },
  { slug:'broken_balance',   title:'Broken Balance',          medium:'Acrylic on canvas',  dim:'24 × 24 in', price:'Sold', status:'sold', note:'Pomegranate and rose — a still life that plays warm reds against a bright blue field.' },
  { slug:'golden_pines',     title:'Golden Pines · Whispered Light', medium:'Oil on canvas', dim:'10 × 10 in', price:'Sold', status:'sold', note:'Sunlit trunks in a colourful stand of pines — light filtering low between the trees.' },
  { slug:'the_lake_in_fall', title:'The Lake in Fall',        medium:'Oil on canvas',      dim:'18 × 24 in', price:'$330 CAD', status:'available', note:'Autumn reds mirrored in still water — a quiet Ontario shoreline turning for the season.' },
  { slug:'citrus_wild_daisy',title:'Citrus & Wild Daisy',     medium:'Acrylic on canvas',  dim:'12 × 12 in', price:'$170 CAD', status:'available', note:'A daisy, an orange, and a halved citrus on a pink-and-blue table — small and bright.' },
  { slug:'rose',             title:'Rose',                    medium:'Acrylic on canvas',  dim:'16 × 16 in', price:'Sold', status:'sold', note:'A single red rose in a round vase against a textured blue ground.' },

  { slug:'apple_blossom_reverie', title:'Apple Blossom Reverie', medium:'Oil on canvas',   dim:'12 × 12 in', price:'Sold', status:'sold', note:'Apples and apple blossom on a soft blue ground.' },
  { slug:'sun_in_a_glass',   title:'Sun in a Glass',          medium:'Oil on canvas',      dim:'12 × 12 in', price:'Sold', status:'sold', note:'Golden grapes catching the light in a glass — a study in warm translucence.' },
  { slug:'winter_forest',    title:'Winter Forest',           medium:'Acrylic on canvas',  dim:'18 × 24 in', price:'Sold', status:'sold', note:'Last winter light burning gold between snow-laden pines.' },
  { slug:'barn',             title:'Barn',                    medium:'Oil on canvas',      dim:'16 × 24 in', price:'Sold', status:'sold', note:'An Ontario farm under a dramatic blue sky, gold field running to the horizon.' },
  { slug:'cherries',         title:'Cherries',                medium:'Acrylic on canvas',  dim:'12 × 16 in', price:'Sold', status:'sold', note:'A row of ripe cherries, red against warm and blue — bold and close-up.' },
];

const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const PRINTS = new Set(['barn', 'winter_forest', 'the_lake_in_fall']);
const IMAGE_SIZES = {silver_water:[2148,2740],evening_bloom:[2514,2428],harvest_glow:[3269,2456],quiet_forest_rhythm:[4504,3496],orange_umbrella:[2141,2681],summer_sparks:[1500,1175],broken_balance:[1500,1483],golden_pines:[1481,1500],the_lake_in_fall:[1500,1127],citrus_wild_daisy:[669,669],rose:[1500,1486],apple_blossom_reverie:[1472,1500],sun_in_a_glass:[1495,1500],winter_forest:[1500,1112],barn:[1500,990],cherries:[1500,1093]};
const LANDSCAPES = new Set(['silver_water', 'quiet_forest_rhythm', 'orange_umbrella', 'golden_pines', 'the_lake_in_fall', 'winter_forest', 'barn']);
const HOVER  = window.matchMedia('(hover: hover)').matches;

let activeDialog = null;
let dialogTrigger = null;
function activateDialog(dialog){
  dialogTrigger = document.activeElement;
  activeDialog = dialog;
  for (const sibling of document.body.children){
    if (sibling !== dialog) sibling.inert = true;
  }
  dialog.querySelector('button').focus();
}
function deactivateDialog(dialog){
  if (activeDialog !== dialog) return;
  for (const sibling of document.body.children) sibling.inert = false;
  activeDialog = null;
  if (dialogTrigger && dialogTrigger.isConnected) dialogTrigger.focus();
  dialogTrigger = null;
}
document.addEventListener('keydown', e => {
  if (e.key !== 'Tab' || !activeDialog) return;
  const items = [...activeDialog.querySelectorAll('button,a[href]')].filter(el => el.getClientRects().length && !el.disabled);
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
});

/* ---- render cards (cascade delay + tilt) ---- */
const grid = document.getElementById('grid');
const genreGrids = {};
['Still Life', 'Landscapes'].forEach((genre, index) => {
  const section = document.createElement('section');
  section.className = 'work-group';
  section.setAttribute('aria-labelledby', 'genre-' + index);
  section.innerHTML = `<h3 id="genre-${index}" class="genre-title">${genre}</h3><div class="grid"></div>`;
  grid.appendChild(section);
  genreGrids[genre] = section.querySelector('.grid');
});
PAINTINGS.map((p, i) => ({p, i})).sort((a, b) => Number(a.p.status === 'sold') - Number(b.p.status === 'sold')).forEach(({p, i}) => {
  const meta = p.dim ? `${p.medium}&nbsp;&nbsp;·&nbsp;&nbsp;${p.dim}` : p.medium;
  const priceCls = p.status === 'sold' ? 'c-price sold' : 'c-price';
  const card = document.createElement('button');
  card.className = 'card reveal';
  card.dataset.status = p.status;
  const genreGrid = genreGrids[LANDSCAPES.has(p.slug) ? 'Landscapes' : 'Still Life'];
  card.style.transitionDelay = ((genreGrid.children.length % 3) * 120) + 'ms';
  card.innerHTML = `
    <span class="frame"><img src="images/${p.slug}.jpg" width="${IMAGE_SIZES[p.slug][0]}" height="${IMAGE_SIZES[p.slug][1]}" alt="${p.title} — ${p.medium}${p.dim ? ', ' + p.dim : ''}" loading="lazy"></span>
    <span class="c-title">${p.title}</span>
    <span class="c-meta">${meta}</span>
    <span class="${priceCls}">${p.status === 'sold' ? 'Original sold' : p.price}</span>
    ${PRINTS.has(p.slug) ? '<span class="c-print">Print available</span>' : ''}`;
  card.addEventListener('click', () => openLB(i));
  genreGrids[LANDSCAPES.has(p.slug) ? 'Landscapes' : 'Still Life'].appendChild(card);

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
  document.querySelectorAll('.work-group').forEach(group => {
    group.hidden = ![...group.querySelectorAll('.card')].some(card => card.style.display !== 'none');
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
  lbPrice.textContent = p.status === 'available' ? p.price + ' · At Sunset Arts Gallery' : 'Original sold';
  lbPrice.className = p.status === 'sold' ? 'p sold' : 'p';
  lbDesc.textContent = p.note;
  lbBtn.href = '#contact';
  lbBtn.dataset.enquiry = 'Painting enquiry: ' + p.title;
  lbBtn.style.display = p.status === 'sold' ? 'none' : '';
  const printAvailable = PRINTS.has(p.slug);
  document.getElementById('lbPrintStatus').textContent = printAvailable ? 'Print available at Sunset Arts Gallery, 63 River Road, Grand Bend. Email for sizes and prices.' : 'Interested in a print? Email to ask about options.';
  const printLink = document.getElementById('lbPrint');
  printLink.textContent = printAvailable ? 'Enquire about this print' : 'Ask about a print';
  printLink.href = '#contact';
  printLink.dataset.enquiry = 'Print enquiry: ' + p.title;
  lb.classList.add('open'); lb.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  activateDialog(lb);
}
function closeLB(){
  if (!lb.classList.contains('open')) return;
  lb.classList.remove('open'); lb.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  deactivateDialog(lb);
}
document.getElementById('lbClose').addEventListener('click', closeLB);
[lbBtn, document.getElementById('lbPrint')].forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const subject = link.dataset.enquiry;
    const context = document.getElementById('enquiryContext');
    context.textContent = subject + ' — email me or contact me on Facebook. You can copy the email address below.';
    context.hidden = false;
    document.querySelector('#contact a[href^="mailto:"]').href = 'mailto:inkamme@gmail.com?subject=' + encodeURIComponent(subject);
    closeLB();
    context.focus({preventScroll:true});
    document.getElementById('contact').scrollIntoView({behavior:REDUCE ? 'instant' : 'smooth'});
  });
});
document.getElementById('featuredPainting').addEventListener('click', () => openLB(PAINTINGS.findIndex(p => p.slug === 'winter_forest')));
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
function updateDotContrast(){
  const teachingBounds = document.getElementById('teaching').getBoundingClientRect();
  dotLinks.forEach(link => {
    const bounds = link.getBoundingClientRect();
    const centre = bounds.top + bounds.height / 2;
    link.classList.toggle('on-dark', centre >= teachingBounds.top && centre <= teachingBounds.bottom);
  });
}
window.addEventListener('resize', updateDotContrast, { passive:true });
window.addEventListener('load', updateDotContrast);
updateDotContrast();

/* ---- sticky nav + FAB + side-dots visibility + scroll-progress stripe ---- */
const nav = document.getElementById('nav');
const fab = document.getElementById('fab');
const edgeFill = document.getElementById('edgeFill');
const menuLinks = document.querySelectorAll('.menu a');
window.addEventListener('scroll', () => {
  updateDotContrast();
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
    { src:'mosaic_detail.jpg', cap:'A snowflake mosaic' },
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
  activateDialog(tgal);
}
function tgalClose(){
  tgal.classList.remove('open');
  tgal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  deactivateDialog(tgal);
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

