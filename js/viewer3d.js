import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

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

export function initViewers(){
  document.querySelectorAll('[data-viewer3d]').forEach(el=>{
    if(el.dataset.inited) return; el.dataset.inited='1';
    const kind = el.dataset.viewer3d || 'generic';
    const canvas = document.createElement('canvas'); el.appendChild(canvas);
    const renderer = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
    const resize=()=>{ const w=el.clientWidth||600,h=el.clientHeight||360; renderer.setSize(w,h,false); renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5)); camera.aspect=w/h; camera.updateProjectionMatrix(); };
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(45,1,0.1,50); camera.position.set(0,1.1,3.0);
    scene.add(new THREE.AmbientLight(0xffe8d2,0.75)); const key=new THREE.DirectionalLight(0xffe6c2,1.2); key.position.set(2,3,3); scene.add(key); const fill=new THREE.PointLight(0xffc080,0.8,10); fill.position.set(-2,1.2,2); scene.add(fill);
    const obj = kind==='annabelle-doll'?buildAnnabelleDoll(THREE):kind==='music-box'?buildMusicBox(THREE):kind==='samurai-armor'||kind==='haunted-armor'?buildArmor(THREE):kind==='bride-dress'?buildDress(THREE):buildGeneric(THREE);
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
    const io=new IntersectionObserver((ents)=>{ alive=ents[0]?.isIntersecting; }); io.observe(el);
    resize(); window.addEventListener('resize', resize);
    (function loop(){ requestAnimationFrame(loop); if(!alive) return; const dt=Math.min(clock.getDelta(),0.05); t+=dt; if(auto) rotY += dt*0.35; obj.rotation.y=rotY; obj.userData.animate?.(t); camera.lookAt(0,0.85,0); renderer.render(scene,camera); })();
  });
}