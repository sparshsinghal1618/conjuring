import { WIKI, searchAll, movieById, findById, investigationById } from './wiki-data.js';

const PREF = {
  scareSeen: 'ca_scare_seen_v1',
  intenseOff: 'ca_intense_off',
  soundOn: 'ca_sound_on',
  bookmarks: 'ca_bookmarks',
  recent: 'ca_recent'
};

export const prefs = {
  get(k, d=null){ try { const v=localStorage.getItem(PREF[k]??k); return v==null?d:JSON.parse(v); } catch { return localStorage.getItem(PREF[k]??k) ?? d; } },
  set(k,v){ try { localStorage.setItem(PREF[k]??k, JSON.stringify(v)); } catch { localStorage.setItem(PREF[k]??k, String(v)); } }
};

export function escapeHtml(s){ return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function pageUrl(type,id){ return `./article.html?type=${encodeURIComponent(type)}&id=${encodeURIComponent(id)}`; }
export function sectionUrl(name){ return `./${name}.html`; }

function linkForRef(ref){
  // ref can be id or object; try resolve
  const byMovie = movieById(ref); if(byMovie) return pageUrl('movie', byMovie.id);
  const inv = investigationById(ref); if(inv) return pageUrl('investigation', inv.id);
  for (const [t,list] of [['character',WIKI.characters],['location',WIKI.locations],['artifact',WIKI.artifacts],['investigation',WIKI.investigations||[]]]){ const f=findById(list,ref); if(f) return pageUrl(t,f.id); }
  return null;
}
export function refLink(ref, label){
  const href = linkForRef(ref);
  const text = label || (movieById(ref)?.title) || investigationById(ref)?.name || findById(WIKI.characters,ref)?.name || findById(WIKI.locations,ref)?.name || findById(WIKI.artifacts,ref)?.name || ref;
  return href ? `<a href="${href}">${escapeHtml(text)}</a>` : `<span>${escapeHtml(text)}</span>`;
}

export function recordRecent(item){ // {type,id,title,url}
  const list = prefs.get('recent', []) || [];
  const next = [item, ...list.filter(x=>!(x.type===item.type && x.id===item.id))].slice(0,10);
  prefs.set('recent', next);
}
export function toggleBookmark(item){
  const list = prefs.get('bookmarks', []) || [];
  const i = list.findIndex(x=>x.type===item.type && x.id===item.id);
  if(i>=0) list.splice(i,1); else list.unshift(item);
  prefs.set('bookmarks', list.slice(0,50));
  return i<0;
}
export function isBookmarked(type,id){ return (prefs.get('bookmarks',[])||[]).some(x=>x.type===type&&x.id===id); }

function navLinks(root='.', inPages=false){
  const p = inPages ? '.' : './pages';
  const h = inPages ? '../index.html' : './index.html';
  return `
  <a href="${h}">Home</a>
  <a href="${p}/movies.html">Movies</a>
  <a href="${p}/characters.html">Characters</a>
  <a href="${p}/investigations.html">Investigations</a>
  <a href="${p}/locations.html">Locations</a>
  <a href="${p}/artifacts.html">Artifacts</a>
  <a href="${p}/museum.html">Occult Museum</a>
  <a href="${p}/timeline.html">Timeline</a>`;
}

export function mountShell({active='', inPages=false}={}){
  const header = document.querySelector('[data-shell-header]');
  const footer = document.querySelector('[data-shell-footer]');
  const homeHref = inPages ? '../index.html' : './index.html';
  const pagesBase = inPages ? '.' : './pages';
  if(header){
    header.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="site-header">
      <div class="container header-inner">
        <a class="brand" href="${homeHref}" aria-label="The Conjuring Archives home">
          <strong>THE CONJURING ARCHIVES</strong>
          <span>The Complete Supernatural Encyclopedia</span>
        </a>
        <div class="search-wrap">
          <input id="globalSearch" type="search" placeholder="Search movies, characters, artifacts, locations…" aria-label="Search the archive" autocomplete="off" />
          <div id="searchResults" class="search-results" role="listbox" aria-label="Search results"></div>
        </div>
        <div class="header-actions">
          <button class="btn" id="soundToggle" type="button">Sound: Off</button>
          <button class="btn" id="randomBtn" type="button">Random File</button>
        </div>
      </div>
      <nav class="main-nav" aria-label="Main"><div class="container">${navLinks('.', inPages)}</div></nav>
    </div>`;
  }
  if(footer){
    const recent = (prefs.get('recent',[])||[]).slice(0,5);
    const bms = (prefs.get('bookmarks',[])||[]).slice(0,5);
    footer.innerHTML = `
    <footer class="site-footer"><div class="container footer-grid">
      <div><h3>THE CONJURING ARCHIVES</h3><p class="meta">A premium fan encyclopedia of The Conjuring Universe. Content is presented for informational/entertainment purposes; this is an unofficial fan project, not affiliated with Warner Bros. or New Line Cinema.</p><p class="meta">“Know the story. Fear the unknown.”</p></div>
      <div><h4>Recently Viewed</h4><ul class="list-links">${recent.length?recent.map(r=>`<li><a href="${inPages && r.url.startsWith('./article')?r.url: (inPages?'./':'./pages/')+r.url.replace('./','').replace('pages/','')}">${escapeHtml(r.title)}</a></li>`).join(''):'<li class="meta">No recent articles.</li>'}</ul></div>
      <div><h4>Bookmarks</h4><ul class="list-links" id="bmList">${bms.length?bms.map(r=>`<li><a href="${pagesBase}/article.html?type=${encodeURIComponent(r.type)}&id=${encodeURIComponent(r.id)}">${escapeHtml(r.title)}</a></li>`).join(''):'<li class="meta">No bookmarks yet.</li>'}</ul></div>
    </div></footer>`;
  }
  // active nav
  document.querySelectorAll('.main-nav a').forEach(a=>{ const href=a.getAttribute('href')||''; if(active && href.includes(active)) a.classList.add('active'); });
  initSearch(inPages);
  initRandom(inPages);
  initSoundToggle();
}

function initSearch(inPages){
  const input = document.getElementById('globalSearch');
  const box = document.getElementById('searchResults');
  if(!input||!box) return;
  const base = inPages ? './article.html' : './pages/article.html';
  input.addEventListener('input', ()=>{
    const q=input.value; const res=searchAll(q);
    if(!q.trim()){ box.classList.remove('open'); box.innerHTML=''; return; }
    box.innerHTML = res.length ? res.map(r=>`<a href="${base}?type=${encodeURIComponent(r.type.toLowerCase())}&id=${encodeURIComponent(r.id)}"><strong>${escapeHtml(r.title)}</strong><small>${escapeHtml(r.subtitle)}</small></a>`).join('') : `<div class="meta" style="padding:.8rem">No results for “${escapeHtml(q)}”.</div>`;
    box.classList.add('open');
  });
  document.addEventListener('click',(e)=>{ if(!box.contains(e.target) && e.target!==input) box.classList.remove('open'); });
}

function initRandom(inPages){
  const btn = document.getElementById('randomBtn'); if(!btn) return;
  const base = inPages ? './article.html' : './pages/article.html';
  btn.addEventListener('click', ()=>{
    const pools = [['movie',WIKI.movies],['character',WIKI.characters],['location',WIKI.locations],['artifact',WIKI.artifacts],['investigation',WIKI.investigations||[]]].filter(([,l])=>l.length);
    const [type,list] = pools[Math.floor(Math.random()*pools.length)];
    const item = list[Math.floor(Math.random()*list.length)];
    location.href = `${base}?type=${type}&id=${encodeURIComponent(item.id)}`;
  });
}

function initSoundToggle(){
  const btn = document.getElementById('soundToggle'); if(!btn) return;
  const sync=()=>{ btn.textContent = `Sound: ${prefs.get('soundOn', false)?'On':'Off'}`; };
  sync();
  btn.addEventListener('click', ()=>{
    const on = !prefs.get('soundOn', false); prefs.set('soundOn', on); sync();
    window.dispatchEvent(new CustomEvent('ca-sound-change',{detail:{on}}));
  });
}

export function getQuery(){ return Object.fromEntries(new URLSearchParams(location.search).entries()); }
export function setDocTitle(t){ document.title = `${t} | The Conjuring Archives`; }
export function movieList(sortedBy='release'){
  const arr=[...WIKI.movies];
  if(sortedBy==='chrono') arr.sort((a,b)=>(a.chronoOrder??99)-(b.chronoOrder??99)||a.year-b.year);
  else arr.sort((a,b)=>(a.releaseOrder??99)-(b.releaseOrder??99)||a.year-b.year);
  return arr;
}
export function relatedForMovie(m){
  return {
    characters: WIKI.characters.filter(c=>c.movies?.includes(m.id)),
    locations: WIKI.locations.filter(l=>l.movies?.includes(m.id)),
    artifacts: WIKI.artifacts.filter(a=>a.movies?.includes(m.id)),
    timeline: WIKI.timeline.filter(t=>t.links?.includes(m.id))
  };
}
export function relatedForCharacter(c){
  return {
    movies: WIKI.movies.filter(m=>c.movies?.includes(m.id)),
    characters: WIKI.characters.filter(o=>o.id!==c.id && o.movies?.some(mid=>c.movies?.includes(mid))).slice(0,8),
  };
}
export function resolveRef(idOrName){
  if(!idOrName) return null;
  const id=String(idOrName);
  return movieById(id)||findById(WIKI.characters,id)||findById(WIKI.locations,id)||findById(WIKI.artifacts,id)||investigationById(id)||null;
}
export { WIKI };