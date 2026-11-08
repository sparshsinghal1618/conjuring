let THREE_CACHE = null;
let THREE_FAIL = false;

async function getTHREE(){
  if (THREE_CACHE) return THREE_CACHE;
  if (THREE_FAIL) return null;
  const urls = [
    'https://unpkg.com/three@0.160.0/build/three.module.js',
    'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js',
    'https://esm.sh/three@0.160.0'
  ];
  for (const url of urls){
    try { THREE_CACHE = await import(url); return THREE_CACHE; } catch(e){ /* try next */ }
  }
  THREE_FAIL = true;
  return null;
}

function showViewerFallback(el, kind){
  const label = kind==='annabelle-doll' ? 'Annabelle (3D)' : kind==='music-box' ? 'Music Box (3D)' : kind==='bride-dress' ? 'Haunted Dress (3D)' : kind==='samurai-armor'||kind==='haunted-armor' ? 'Artifact (3D)' : '3D Object';
  el.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:16px;text-align:center;background:radial-gradient(ellipse at 50% 35%, #2a2118, #120f0c 60%, #090706)">
    <div><div class="kicker" style="margin-bottom:6px">${label}</div>
    <p class="meta" style="margin:0 0 8px">3D viewer unavailable (WebGL/Three.js could not load). Serve this site over HTTP and ensure internet access for the 3D library, or add a local Three.js module.</p>
    <p class="meta" style="margin:0">The archive entry remains available below.</p></div></div>`;
}

function buildAnnabelleDoll(THREE){
  const doll = new THREE.Group(); doll.scale.setScalar(1.45);
  const skin = new THREE.MeshStandardMaterial({ color: 0xd8c3a5, roughness: 0.72 });
  const skinDark = new THREE.MeshStandardMaterial({ color: 0xc9b08e, roughness: 0.85 });
  const dress = new THREE.MeshStandardMaterial({ color: 0xf3ede3, roughness: 0.92 });
  const sash = new THREE.MeshStandardMaterial({ color: 0x7f1414, roughness: 0.85 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x5a2410, roughness: 0.96 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xf8f3ea, roughness: 0.25 });
  const iris = new THREE.MeshBasicMaterial({ color: 0x2b4d6e });
  const pupil = new THREE.MeshBasicMaterial({ color: 0x020202 });
  const lip = new THREE.MeshStandardMaterial({ color: 0x7a2f2f, roughness: 0.65 });
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.29,0.56,18), dress); torso.position.y=0.72; doll.add(torso);
  doll.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(0.245,0.038,8,22), sash),{position:new THREE.Vector3(0,0.58,0),rotation:new THREE.Euler(Math.PI/2,0,0)}));
  doll.add(Object.assign(new THREE.Mesh(new THREE.ConeGeometry(0.5,0.72,22,1,true),dress),{position:new THREE.Vector3(0,0.35,0)}));
  doll.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.072,0.082,0.12,12),skinDark),{position:new THREE.Vector3(0,1.05,0)}));
  const headG=new THREE.Group(); headG.position.y=1.29; doll.add(headG);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.225,28,22),skin); head.scale.set(0.94,1.06,0.92); headG.add(head);
  headG.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.23,22,16,0,Math.PI*2,0,Math.PI*0.64),hairMat),{position:new THREE.Vector3(0,0.03,0),scale:new THREE.Vector3(0.985,1,0.965)}));
  for(let i=0;i<12;i++){const s=new THREE.Mesh(new THREE.CapsuleGeometry(0.017,0.24,4,8),hairMat); const a=(i/12)*Math.PI*2; s.position.set(Math.cos(a)*0.175,-0.06,Math.sin(a)*0.145); s.rotation.z=Math.cos(a)*0.38; headG.add(s);}
  function eye(x){const g=new THREE.Group(); g.position.set(x,0.03,0.192); g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.042,14,12),eyeMat),{scale:new THREE.Vector3(1,1,0.45)})); g.add(Object.assign(new THREE.Mesh(new THREE.CircleGeometry(0.02,18),iris),{position:new THREE.Vector3(0,0,0.02)})); g.add(Object.assign(new THREE.Mesh(new THREE.CircleGeometry(0.009,14),pupil),{position:new THREE.Vector3(0,0,0.0215)})); return g;}
  headG.add(eye(-0.066)); headG.add(eye(0.066));
  const mouth=new THREE.Group(); mouth.position.set(0,-0.078,0.186); headG.add(mouth); mouth.add(Object.assign(new THREE.Mesh(new THREE.TorusGeometry(0.048,0.009,8,18,Math.PI*2),lip),{rotation:new THREE.Euler(Math.PI/2,0,0)}));
  function arm(side){const g=new THREE.Group(); g.position.set(side*0.29,0.9,0); g.add(Object.assign(new THREE.Mesh(new THREE.CapsuleGeometry(0.046,0.23,4,8),dress),{position:new THREE.Vector3(0,-0.115,0)})); g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.046,10,8),skin),{position:new THREE.Vector3(0,-0.275,0)})); g.rotation.z=side*0.22; return g;}
  doll.add(arm(-1)); doll.add(arm(1));
  doll.userData.animate=(t)=>{ headG.rotation.y=Math.sin(t*0.5)*0.18; headG.rotation.x=Math.sin(t*0.7)*0.03; doll.position.y=Math.sin(t*1.1)*0.01; };
  return doll;
}
function buildMusicBox(THREE){ const g=new THREE.Group(); const wood=new THREE.MeshStandardMaterial({color:0x5a3a22,roughness:0.8}); g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.9,0.45,0.6),wood),{position:new THREE.Vector3(0,0.225,0)})); const lid=new THREE.Mesh(new THREE.BoxGeometry(0.88,0.06,0.58),new THREE.MeshStandardMaterial({color:0x6b4528,roughness:0.78})); lid.position.set(0,0.48,-0.05); lid.rotation.x=-0.35; g.add(lid); const mirror=new THREE.Mesh(new THREE.PlaneGeometry(0.4,0.22),new THREE.MeshStandardMaterial({color:0xcfe3ff,metalness:0.6,roughness:0.1})); mirror.position.set(0,0.62,0.05); mirror.rotation.x=-0.35; g.add(mirror); g.userData.animate=(t)=>{ lid.rotation.x=-0.35+Math.sin(t*1.2)*0.04; }; return g; }
function buildArmor(THREE){ const g=new THREE.Group(); const m=new THREE.MeshStandardMaterial({color:0x4a4d52,metalness:0.55,roughness:0.45}); g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.55,0.8,0.35),m),{position:new THREE.Vector3(0,0.95,0)})); g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.18,16,12),m),{position:new THREE.Vector3(0,1.52,0)})); g.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(0.7,0.12,0.5),new THREE.MeshStandardMaterial({color:0x3a2a18,roughness:0.9})),{position:new THREE.Vector3(0,0.06,0)})); g.userData.animate=(t)=>{ g.rotation.y=Math.sin(t*0.35)*0.15; }; return g; }
function buildDress(THREE){ const g=new THREE.Group(); const fabric=new THREE.MeshStandardMaterial({color:0xe8e0d4,roughness:0.95}); const skirt=new THREE.Mesh(new THREE.ConeGeometry(0.42,0.95,20,1,true),fabric); skirt.position.y=0.48; g.add(skirt); const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.22,0.38,16),fabric); torso.position.y=1.05; g.add(torso); const hanger=new THREE.Mesh(new THREE.TorusGeometry(0.16,0.012,8,20,Math.PI),new THREE.MeshStandardMaterial({color:0x6b5a48,metalness:0.2,roughness:0.7})); hanger.position.y=1.28; hanger.rotation.z=Math.PI; g.add(hanger); g.userData.animate=(t)=>{ g.rotation.y=Math.sin(t*0.35)*0.25; skirt.rotation.z=Math.sin(t*1.1)*0.02; }; return g; }
function buildGeneric(THREE){ const g=new THREE.Group(); g.add(Object.assign(new THREE.Mesh(new THREE.IcosahedronGeometry(0.45,1),new THREE.MeshStandardMaterial({color:0x6b563f,roughness:0.7,metalness:0.1})),{position:new THREE.Vector3(0,0.6,0)})); g.userData.animate=(t)=>{ g.rotation.y=t*0.4; g.position.y=Math.sin(t)*0.03; }; return g; }
function buildValakManifest(THREE){
  const g=new THREE.Group();
  const robe=new THREE.MeshStandardMaterial({color:0x141416,roughness:0.95,metalness:0.02});
  const pale=new THREE.MeshStandardMaterial({color:0xcfc8bf,roughness:0.8});
  const shadow=new THREE.MeshStandardMaterial({color:0x050506,roughness:1});
  const glow=new THREE.MeshBasicMaterial({color:0xf2e8d8});
  const body=new THREE.Mesh(new THREE.ConeGeometry(0.62,1.55,24,1,true), robe); body.position.y=0.78; g.add(body);
  const hood=new THREE.Mesh(new THREE.SphereGeometry(0.34,22,18,0,Math.PI*2,0,Math.PI*0.72), robe); hood.position.y=1.48; hood.scale.set(1,1.05,0.95); g.add(hood);
  const face=new THREE.Mesh(new THREE.SphereGeometry(0.22,22,18), pale); face.position.set(0,1.38,0.12); face.scale.set(0.85,1.05,0.55); g.add(face);
  [-0.065,0.065].forEach(x=>{ const eye=new THREE.Mesh(new THREE.SphereGeometry(0.028,12,10), glow); eye.position.set(x,1.42,0.235); g.add(eye); const ring=new THREE.Mesh(new THREE.RingGeometry(0.04,0.075,24), new THREE.MeshBasicMaterial({color:0x6b5a3a,side:THREE.DoubleSide,transparent:true,opacity:0.55})); ring.position.set(x,1.42,0.232); g.add(ring); });
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(0.05,0.01,8,20,Math.PI), shadow); mouth.position.set(0,1.3,0.24); mouth.rotation.z=Math.PI; g.add(mouth);
  const cross=new THREE.Group(); cross.position.set(0,0.95,0.48); const v=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.22,0.02), new THREE.MeshStandardMaterial({color:0x8a6b3e,metalness:0.35,roughness:0.5})); const h=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.03,0.02), v.material); h.position.y=0.04; cross.add(v,h); g.add(cross);
  g.userData.animate=(t)=>{ g.rotation.y=Math.sin(t*0.28)*0.35; hood.position.y=1.48+Math.sin(t*1.4)*0.01; g.position.y=Math.sin(t*0.9)*0.015; };
  return g;
}
function buildBathshebaManifest(THREE){
  const g=new THREE.Group();
  const mat=new THREE.MeshStandardMaterial({color:0x3a3530,roughness:0.98,transparent:true,opacity:0.92});
  const mist=new THREE.MeshStandardMaterial({color:0x6a6258,roughness:1,transparent:true,opacity:0.28});
  const form=new THREE.Mesh(new THREE.CapsuleGeometry(0.28,0.95,6,16), mat); form.position.y=1.0; g.add(form);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.2,16,14), mat); head.position.y=1.72; head.scale.set(0.9,1.05,0.85); g.add(head);
  for(let i=0;i<5;i++){ const w=new THREE.Mesh(new THREE.PlaneGeometry(0.9,1.2), mist); w.position.set((i-2)*0.08,0.9,-0.05-i*0.02); w.rotation.y=(i-2)*0.08; g.add(w); }
  const eyes=new THREE.MeshBasicMaterial({color:0x8fb3c9});
  [-0.055,0.055].forEach(x=>g.add(Object.assign(new THREE.Mesh(new THREE.CircleGeometry(0.018,10),eyes),{position:new THREE.Vector3(x,1.74,0.16)})));
  g.userData.animate=(t)=>{ g.rotation.y=Math.sin(t*0.22)*0.25; g.children.forEach((c,i)=>{ if(c.material&&c.material.opacity!==undefined && c.material.opacity<0.5) c.position.x=(i-4)*0.08+Math.sin(t*0.7+i)*0.03; }); g.position.y=Math.sin(t*0.8)*0.02; };
  return g;
}
function buildCrookedManifest(THREE){
  const g=new THREE.Group();
  const dark=new THREE.MeshStandardMaterial({color:0x1b1a18,roughness:0.9});
  const pale=new THREE.MeshStandardMaterial({color:0xbfb7aa,roughness:0.85});
  const hat=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.34,0.28,12), dark); hat.position.y=1.78; g.add(hat);
  g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.38,0.38,0.03,16),dark),{position:new THREE.Vector3(0,1.64,0)}));
  g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.16,14,12),pale),{position:new THREE.Vector3(0.04,1.52,0.05),scale:new THREE.Vector3(0.85,1.15,0.8)}));
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.14,0.7,10), dark); torso.position.set(0.05,1.05,0); torso.rotation.z=0.18; g.add(torso);
  const limbs=[[ -0.02,0.95,0,0.5,0.35,0],[0.14,0.98,0,-0.25,-0.5,0],[0.02,0.55,0,0.15,0.2,0],[0.12,0.52,0,-0.05,0.45,0]];
  limbs.forEach(([x,y,z,rz,ry,h])=>{ const l=new THREE.Mesh(new THREE.CapsuleGeometry(0.03,h||0.42,4,8),dark); l.position.set(x,y,z); l.rotation.z=rz; l.rotation.y=ry; g.add(l); });
  g.userData.animate=(t)=>{ g.rotation.y=Math.sin(t*0.45)*0.5; g.rotation.z=Math.sin(t*0.9)*0.06; hat.rotation.z=Math.sin(t*1.2)*0.08; };
  return g;
}
function buildMalthusManifest(THREE){
  const g=new THREE.Group();
  const core=new THREE.MeshStandardMaterial({color:0x2a1114,emissive:0x180406,roughness:0.6,metalness:0.1});
  const horn=new THREE.MeshStandardMaterial({color:0x4a3a2a,roughness:0.8});
  const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(0.42,2), core); orb.position.y=1.05; g.add(orb);
  for(let i=0;i<2;i++){ const h=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.38,8), horn); h.position.set(i?0.18:-0.18,1.38,0.05); h.rotation.z=i?-0.45:0.45; g.add(h); }
  const eye=new THREE.MeshBasicMaterial({color:0xd4a04a});
  [-0.12,0.12].forEach(x=>g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.045,12,10),eye),{position:new THREE.Vector3(x,1.08,0.34)})));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.012,8,40), new THREE.MeshBasicMaterial({color:0x7a2b3a,transparent:true,opacity:0.65})); ring.position.y=1.05; ring.rotation.x=Math.PI/2; g.add(ring);
  g.userData.animate=(t)=>{ g.rotation.y=t*0.35; ring.rotation.z=t*0.8; orb.scale.setScalar(1+Math.sin(t*2)*0.03); };
  return g;
}
function buildFerrymanManifest(THREE){
  const g=new THREE.Group();
  const dark=new THREE.MeshStandardMaterial({color:0x121214,roughness:0.98});
  const cloak=new THREE.Mesh(new THREE.ConeGeometry(0.55,1.5,18,1,true), dark); cloak.position.y=0.75; g.add(cloak);
  const hood=new THREE.Mesh(new THREE.SphereGeometry(0.26,16,14,0,Math.PI*2,0,Math.PI*0.75), dark); hood.position.y=1.42; g.add(hood);
  const coin=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.015,24), new THREE.MeshStandardMaterial({color:0xc4a467,metalness:0.7,roughness:0.35})); coin.position.set(0.22,1.05,0.35); coin.rotation.x=Math.PI/2; g.add(coin);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,1.8,8), new THREE.MeshStandardMaterial({color:0x3b2a18,roughness:0.9})); pole.position.set(-0.35,0.9,0.1); pole.rotation.z=0.12; g.add(pole);
  g.userData.animate=(t)=>{ g.rotation.y=Math.sin(t*0.25)*0.3; coin.rotation.z=t*1.2; coin.position.y=1.05+Math.sin(t*1.8)*0.03; };
  return g;
}
function buildBrideManifest(THREE){
  const g=new THREE.Group();
  const veil=new THREE.MeshStandardMaterial({color:0xe8e0d4,roughness:0.95,transparent:true,opacity:0.88,side:THREE.DoubleSide});
  const dress=new THREE.MeshStandardMaterial({color:0xd8d0c4,roughness:0.96});
  const skirt=new THREE.Mesh(new THREE.ConeGeometry(0.48,1.05,20,1,true), dress); skirt.position.y=0.52; g.add(skirt);
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(0.15,0.22,0.42,14), dress); torso.position.y=1.15; g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.14,16,14), new THREE.MeshStandardMaterial({color:0xcfc6ba,roughness:0.9})); head.position.y=1.48; g.add(head);
  const v=new THREE.Mesh(new THREE.PlaneGeometry(0.75,0.9), veil); v.position.set(0,1.25,0.08); g.add(v);
  [-0.04,0.04].forEach(x=>g.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.012,8,8),new THREE.MeshBasicMaterial({color:0x111111})),{position:new THREE.Vector3(x,1.5,0.13)})));
  g.userData.animate=(t)=>{ g.rotation.y=Math.sin(t*0.3)*0.25; v.rotation.y=Math.sin(t*0.8)*0.06; skirt.rotation.z=Math.sin(t*1.1)*0.015; };
  return g;
}

async function initOne(el, THREE){
  if(el.dataset.inited) return; el.dataset.inited='1';
  const kind = el.dataset.viewer3d || 'generic';
  try {
    if (!window.WebGLRenderingContext) { showViewerFallback(el, kind); return; }
    const canvas = document.createElement('canvas'); el.appendChild(canvas);
    let renderer;
    try { renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true}); }
    catch(e){ el.removeChild(canvas); showViewerFallback(el, kind); return; }
    const resize=()=>{ const w=el.clientWidth||600,h=el.clientHeight||360; renderer.setSize(w,h,false); renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5)); camera.aspect=w/h; camera.updateProjectionMatrix(); };
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(45,1,0.1,50); camera.position.set(0,1.1,3.0);
    scene.add(new THREE.AmbientLight(0xffe8d2,0.75)); const key=new THREE.DirectionalLight(0xffe6c2,1.2); key.position.set(2,3,3); scene.add(key); const fill=new THREE.PointLight(0xffc080,0.8,10); fill.position.set(-2,1.2,2); scene.add(fill);
    const obj = kind==='annabelle-doll'?buildAnnabelleDoll(THREE)
      :kind==='music-box'?buildMusicBox(THREE)
      :kind==='samurai-armor'||kind==='haunted-armor'?buildArmor(THREE)
      :kind==='bride-dress'?buildDress(THREE)
      :kind==='valak-manifest'?buildValakManifest(THREE)
      :kind==='bathsheba-manifest'?buildBathshebaManifest(THREE)
      :kind==='crooked-manifest'?buildCrookedManifest(THREE)
      :kind==='malthus-manifest'?buildMalthusManifest(THREE)
      :kind==='ferryman-manifest'?buildFerrymanManifest(THREE)
      :kind==='bride-manifest'?buildBrideManifest(THREE)
      :buildGeneric(THREE);
    scene.add(obj);
    let drag=false,px=0,rotY=0,auto=true,zoom=3;
    const onDown=(e)=>{drag=true;auto=false;px=e.clientX??e.touches?.[0]?.clientX??0;};
    const onMove=(e)=>{ if(!drag) return; const x=e.clientX??e.touches?.[0]?.clientX??px; rotY += (x-px)*0.01; px=x; };
    const onUp=()=>{drag=false;};
    el.addEventListener('pointerdown',onDown); window.addEventListener('pointermove',onMove); window.addEventListener('pointerup',onUp);
    el.addEventListener('wheel',(e)=>{ e.preventDefault(); zoom=Math.max(1.8,Math.min(5,zoom+e.deltaY*0.003)); camera.position.z=zoom; },{passive:false});
    const controls=document.createElement('div'); controls.className='viewer-ui'; controls.innerHTML=`<button class="btn" data-vact="auto">Auto Rotate</button><button class="btn" data-vact="reset">Reset</button>`;
    el.appendChild(controls);
    controls.addEventListener('click',(e)=>{ const a=e.target.closest('[data-vact]')?.dataset.vact; if(a==='auto') auto=!auto; if(a==='reset'){auto=true;rotY=0;zoom=3;camera.position.set(0,1.1,3);} });
    let t=0, alive=true; const clock=new THREE.Clock();
    const io=('IntersectionObserver' in window)?new IntersectionObserver((ents)=>{ alive=ents[0]?.isIntersecting; }):null; io?.observe(el);
    resize(); window.addEventListener('resize', resize);
    (function loop(){ requestAnimationFrame(loop); if(!alive) return; const dt=Math.min(clock.getDelta(),0.05); t+=dt; if(auto) rotY += dt*0.35; obj.rotation.y=rotY; obj.userData.animate?.(t); camera.lookAt(0,0.85,0); renderer.render(scene,camera); })();
  } catch(e){ console.warn('3D viewer failed', e); showViewerFallback(el, kind); }
}

export async function initViewers(){
  const els = document.querySelectorAll('[data-viewer3d]');
  if(!els.length) return;
  const THREE = await getTHREE();
  if(!THREE){ els.forEach(el=>{ if(!el.dataset.inited){ el.dataset.inited='1'; showViewerFallback(el, el.dataset.viewer3d||'generic'); } }); return; }
  for (const el of els) await initOne(el, THREE);
}

export async function loadThree(){ return getTHREE(); }
