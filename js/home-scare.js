import { prefs } from './wiki-app.js';
import { loadThree } from './viewer3d.js';

function allowIntense(){
  if (prefs.get('intenseOff', false)) return false;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) return false;
  return true;
}

function makeAnnabelle(THREE){
  const doll = new THREE.Group();
  doll.scale.setScalar(1.85);
  const skin = new THREE.MeshStandardMaterial({ color: 0xd8c3a5, roughness: 0.72 });
  const skinDark = new THREE.MeshStandardMaterial({ color: 0xc9b08e, roughness: 0.85 });
  const dress = new THREE.MeshStandardMaterial({ color: 0xf3ede3, roughness: 0.92 });
  const sash = new THREE.MeshStandardMaterial({ color: 0x7f1414, roughness: 0.85 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x5a2410, roughness: 0.96 });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8f3ea, roughness: 0.25, emissive: 0x050505 });
  const eyeGlow = new THREE.MeshBasicMaterial({ color: 0x88c8ff });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x020202 });
  const lipMat = new THREE.MeshStandardMaterial({ color: 0x7a2f2f, roughness: 0.65 });
  const mouthVoid = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.29, 0.56, 18), dress); torso.position.y = 0.72; doll.add(torso);
  const waist = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.038, 8, 22), sash); waist.position.y = 0.58; waist.rotation.x = Math.PI/2; doll.add(waist);
  const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.72, 22, 1, true), dress); skirt.position.y = 0.35; doll.add(skirt);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.082, 0.12, 12), skinDark); neck.position.y = 1.05; doll.add(neck);
  const headGroup = new THREE.Group(); headGroup.position.y = 1.29; doll.add(headGroup);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.225, 28, 22), skin); head.scale.set(0.94, 1.06, 0.92); headGroup.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.23, 22, 16, 0, Math.PI*2, 0, Math.PI*0.64), hairMat);
  hair.position.y = 0.03; hair.scale.set(0.985, 1, 0.965); headGroup.add(hair);
  for (let i=0;i<12;i++){ const s=new THREE.Mesh(new THREE.CapsuleGeometry(0.017,0.24,4,8),hairMat); const a=(i/12)*Math.PI*2; s.position.set(Math.cos(a)*0.175,-0.06,Math.sin(a)*0.145); s.rotation.z=Math.cos(a)*0.38; s.rotation.x=Math.sin(a)*0.22; headGroup.add(s); }
  const browL=new THREE.Mesh(new THREE.BoxGeometry(0.075,0.012,0.02),hairMat); browL.position.set(-0.066,0.085,0.19); browL.rotation.z=0.22; headGroup.add(browL);
  const browR=browL.clone(); browR.position.x=0.066; browR.rotation.z=-0.22; headGroup.add(browR);
  function makeEye(x){ const g=new THREE.Group(); g.position.set(x,0.03,0.192); const w=new THREE.Mesh(new THREE.SphereGeometry(0.042,14,12),eyeWhiteMat); w.scale.z=0.45; g.add(w); const iris=new THREE.Mesh(new THREE.CircleGeometry(0.02,18),eyeGlow); iris.position.z=0.02; g.add(iris); const pupil=new THREE.Mesh(new THREE.CircleGeometry(0.009,14),pupilMat); pupil.position.z=0.0215; g.add(pupil); const lidTop=new THREE.Mesh(new THREE.SphereGeometry(0.045,14,10,0,Math.PI*2,0,Math.PI/2),skin); lidTop.scale.set(1,0.22,0.55); lidTop.position.set(0,0.016,0.002); lidTop.rotation.x=Math.PI; g.add(lidTop); const lidBot=new THREE.Mesh(new THREE.SphereGeometry(0.045,14,10,0,Math.PI*2,0,Math.PI/2),skin); lidBot.scale.set(1,0.12,0.55); lidBot.position.set(0,-0.016,0.002); g.add(lidBot); g.userData={lidTop,lidBot,iris}; return g; }
  const leftEye=makeEye(-0.066), rightEye=makeEye(0.066); headGroup.add(leftEye); headGroup.add(rightEye);
  const mouthGroup=new THREE.Group(); mouthGroup.position.set(0,-0.078,0.186); headGroup.add(mouthGroup);
  const lips=new THREE.Mesh(new THREE.TorusGeometry(0.048,0.009,8,18,Math.PI*2),lipMat); lips.rotation.x=Math.PI/2; mouthGroup.add(lips);
  const mouthHole=new THREE.Mesh(new THREE.CircleGeometry(0.028,16),mouthVoid); mouthHole.position.z=0.004; mouthHole.scale.y=0.15; mouthGroup.add(mouthHole);
  function makeArm(side){ const g=new THREE.Group(); g.position.set(side*0.29,0.9,0); const u=new THREE.Mesh(new THREE.CapsuleGeometry(0.046,0.23,4,8),dress); u.position.y=-0.115; g.add(u); const h=new THREE.Mesh(new THREE.SphereGeometry(0.046,10,8),skin); h.position.y=-0.275; g.add(h); g.rotation.z=side*0.22; return g; }
  doll.add(makeArm(-1)); doll.add(makeArm(1));
  const legL=new THREE.Mesh(new THREE.CapsuleGeometry(0.052,0.23,4,8),dress); legL.position.set(-0.095,0.18,0); doll.add(legL); const legR=legL.clone(); legR.position.x=0.095; doll.add(legR);
  return { doll, headGroup, leftEye, rightEye, mouthHole, lips, eyeWhiteMat };
}

export function initHomeScare(){
  const overlay = document.getElementById('scareOverlay');
  const canvas = document.getElementById('scareCanvas');
  const flash = document.getElementById('scareFlash');
  const text = document.getElementById('scareText');
  const skipBtn = document.getElementById('scareSkipBtn');
  const replayBtn = document.getElementById('replayScareBtn');
  const intenseBtn = document.getElementById('toggleIntenseBtn');
  const enableSoundBtn = document.getElementById('enableSoundBtn');
  if(!overlay || !canvas) return;

  let audio = { ctx:null, master:null, enabled:false };
  function syncSoundUI(){ if(enableSoundBtn) enableSoundBtn.textContent = audio.enabled ? 'Sound Enabled' : 'Enable Sound'; }
  function ensureAudio(){
    if(audio.ctx) { if(audio.ctx.state==='suspended') audio.ctx.resume().catch(()=>{}); return; }
    const AC = window.AudioContext||window.webkitAudioContext; if(!AC) return;
    try {
      audio.ctx = new AC(); audio.master = audio.ctx.createGain();
      audio.master.gain.value = allowIntense()?0.55:0.25; audio.master.connect(audio.ctx.destination);
      audio.enabled = prefs.get('soundOn', false);
      if(audio.enabled && audio.ctx.state==='suspended') audio.ctx.resume().catch(()=>{});
    } catch(e){}
    syncSoundUI();
  }
  function noise(dur=0.2,gain=0.12,freq=900,type='bandpass'){
    if(!audio.ctx||!audio.enabled) return; const {ctx,master}=audio; const n=Math.floor(ctx.sampleRate*dur); const b=ctx.createBuffer(1,n,ctx.sampleRate); const d=b.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/n,0.7); const s=ctx.createBufferSource(); s.buffer=b; const g=ctx.createGain(); g.gain.setValueAtTime(gain,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+dur); const f=ctx.createBiquadFilter(); f.type=type; f.frequency.value=freq; s.connect(f); f.connect(g); g.connect(master); s.start();
  }
  function hit(k=1){ if(!audio.ctx||!audio.enabled) return; const x=allowIntense()?1:0.35; const tone=(fr,du,tp,ga)=>{const o=audio.ctx.createOscillator(),g=audio.ctx.createGain(); o.type=tp;o.frequency.value=fr; g.gain.setValueAtTime(0.0001,audio.ctx.currentTime); g.gain.exponentialRampToValueAtTime(ga,audio.ctx.currentTime+0.01); g.gain.exponentialRampToValueAtTime(0.0001,audio.ctx.currentTime+du); o.connect(g); g.connect(audio.master); o.start(); o.stop(audio.ctx.currentTime+du+0.02);}; tone(42,0.45,'sine',0.12*k*x); tone(78,0.2,'sawtooth',0.07*k*x); noise(0.3,0.15*k*x,700,'bandpass'); noise(0.16,0.08*k*x,2200,'highpass'); }

  let running=false, raf=0, renderer, scene, camera, parts;
  function revealHome(){
    const home=document.getElementById('homeContent'); if(home) home.removeAttribute('hidden');
  }
  function cleanup(){ if(raf) cancelAnimationFrame(raf); running=false; overlay.classList.remove('active'); overlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; try{ renderer?.dispose?.(); renderer?.forceContextLoss?.(); renderer?.domElement?.remove(); }catch(e){} renderer=null; scene=null; camera=null; parts=null; }
  function finish(){ prefs.set('scareSeen', true); cleanup(); revealHome(); }
  if(skipBtn) skipBtn.addEventListener('click', finish);
  if(replayBtn) replayBtn.addEventListener('click', ()=>{ prefs.set('scareSeen', false); runScare(); });
  if(intenseBtn) intenseBtn.addEventListener('click', ()=>{ const v=!prefs.get('intenseOff', false); prefs.set('intenseOff', v); intenseBtn.textContent = v ? 'Enable Intense Effects' : 'Disable Intense Effects'; if(audio.master) audio.master.gain.value = allowIntense()?0.55:0.25; });
  if(enableSoundBtn) enableSoundBtn.addEventListener('click', ()=>{ ensureAudio(); audio.enabled=true; prefs.set('soundOn', true); if(audio.ctx?.state==='suspended') audio.ctx.resume(); syncSoundUI(); });

  async function runScare(){
    if(!allowIntense()){ finish(); return; }
    if(running) return; running=true;
    overlay.classList.add('active'); overlay.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
    if(text) text.style.opacity='0'; if(flash) flash.style.opacity='0';
    ensureAudio();
    const THREE = await loadThree();
    if(!THREE || !window.WebGLRenderingContext){
      // graceful fallback: show text reveal without 3D
      try {
        if(text){ text.style.opacity='1'; text.textContent='SHE WAS WAITING FOR YOU.'; }
        await new Promise(r=>setTimeout(r, 1400));
        if(text){ text.style.transition='opacity .6s'; text.style.opacity='0'; await new Promise(r=>setTimeout(r, 650)); }
      } catch(e){}
      finish(); return;
    }
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false, powerPreference:'high-performance' });
    } catch(e){ finish(); return; }
    renderer.setSize(window.innerWidth, window.innerHeight); renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75));
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000); scene.fog = new THREE.FogExp2(0x000000,0.09);
    camera = new THREE.PerspectiveCamera(55, window.innerWidth/window.innerHeight, 0.1, 50); camera.position.set(0,1.35,4.2);
    scene.add(new THREE.AmbientLight(0x120606,0.02));
    const key=new THREE.SpotLight(0xfff0dd,0,10,Math.PI/5,0.7,1.1); key.position.set(0.6,2.4,3.2); key.target.position.set(0,1.25,0); scene.add(key); scene.add(key.target);
    const red=new THREE.PointLight(0xff1a1a,0,7,2); red.position.set(0,0.9,2.2); scene.add(red);
    const rim=new THREE.PointLight(0x330000,0,5); rim.position.set(-1.4,1.4,-1.2); scene.add(rim);
    parts = makeAnnabelle(THREE); parts.doll.visible=false; parts.doll.position.set(0,-0.15,1.2); scene.add(parts.doll);
    const setEyeOpen=(v)=>{ [parts.leftEye,parts.rightEye].forEach(e=>{ e.userData.lidTop.scale.y=0.22+(1-v)*1.0; e.userData.lidTop.position.y=0.016+(1-v)*0.034; e.userData.lidBot.scale.y=0.12+(1-v)*0.25; }); };
    const setMouth=(v)=>{ parts.mouthHole.scale.set(1+v*0.35,0.15+v*1.25,1); parts.lips.scale.set(1+v*0.12,1,1+v*0.5); };
    setEyeOpen(0); setMouth(0);
    let t=0, phase=0, shake=0, hb=0; const intense=allowIntense(); const clock=new THREE.Clock();
    const onResize=()=>{ if(!renderer||!camera) return; camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); };
    window.addEventListener('resize', onResize);
    function step(){
      if(!running) return; raf=requestAnimationFrame(step);
      try {
        const dt=Math.min(clock.getDelta(),0.05); t+=dt;
        if(phase===0){ if(t>0.5+hb*0.7 && hb<4){ hit(0.7); hb++; } if(t>3.0){ phase=1; t=0; parts.doll.visible=true; } }
        else if(phase===1){ const p=Math.min(t/1.0,1); key.intensity=p*0.55; rim.intensity=p*0.35; parts.doll.position.z=1.2-p*0.15; parts.headGroup.rotation.y=Math.sin(t*1.3)*0.08; if(p>=1){phase=2;t=0;} }
        else if(phase===2){ const p=Math.min(t/0.22,1); const e=1-Math.pow(1-p,4); parts.doll.position.z=THREE.MathUtils.lerp(1.05,3.55,e); parts.headGroup.rotation.x=THREE.MathUtils.lerp(0,-0.12,e); camera.fov=THREE.MathUtils.lerp(55,42,e); camera.updateProjectionMatrix(); key.intensity=3.8; red.intensity=2.2; rim.intensity=1.4; if(t<dt*2){ hit(1.25); if(flash && intense){ flash.style.transition='none'; flash.style.opacity='0.75'; requestAnimationFrame(()=>{flash.style.transition='opacity 80ms ease-out'; flash.style.opacity='0';}); } shake=intense?0.13:0.03; } if(p>=1){phase=3;t=0; setEyeOpen(1); setMouth(1);} }
        else if(phase===3){ const jit=intense?1:0; parts.headGroup.rotation.z=(Math.random()-0.5)*0.24*jit; parts.headGroup.rotation.y=(Math.random()-0.5)*0.3*jit; parts.headGroup.rotation.x=-0.12+(Math.random()-0.5)*0.1*jit; parts.doll.position.z=3.62+Math.sin(t*55)*0.018*jit; parts.eyeWhiteMat.emissive.setHex(t%0.1<0.05?0x330808:0x110404); if(t<0.05) hit(0.85); if(t>0.62){phase=4;t=0;} }
        else if(phase===4){ if(t<0.22){ parts.doll.visible=(t%0.055)<0.028; if(t<dt*2) noise(0.18,intense?0.09:0.03,1200,'highpass'); } else { parts.doll.visible=false; key.intensity=0; red.intensity=0; rim.intensity=0; phase=5; t=0; if(text) text.style.opacity='1'; } }
        else if(phase===5){ if(t>2.1){ phase=6; t=0; } }
        else if(phase===6){ const p=Math.min(t/0.9,1); if(text) text.style.opacity=String(1-p); if(p>=1){ window.removeEventListener('resize',onResize); finish(); return; } }
        if(shake>0){ camera.position.x=(Math.random()-0.5)*shake; camera.position.y=1.35+(Math.random()-0.5)*shake*0.8; shake*=0.84; if(shake<0.001){shake=0; camera.position.set(0,1.35,4.2);} }
        camera.lookAt(0,1.25,0); renderer.render(scene,camera);
      } catch(e){ window.removeEventListener('resize',onResize); finish(); }
    }
    step();
  }

  window.__caReplayScare = ()=>{ prefs.set('scareSeen', false); runScare(); };
  const gesture = ()=>{ ensureAudio(); if(audio.enabled && audio.ctx?.state==='suspended') audio.ctx.resume().catch(()=>{}); window.removeEventListener('pointerdown',gesture); window.removeEventListener('keydown',gesture); };
  window.addEventListener('pointerdown', gesture, {once:true}); window.addEventListener('keydown', gesture, {once:true});

  if(!prefs.get('scareSeen', false)) {
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ runScare().catch(()=>{ if(window.__caRevealHome) window.__caRevealHome(); else { cleanup(); revealHome(); } }); }));
  } else {
    overlay.classList.remove('active');
    revealHome();
  }
  if(intenseBtn) intenseBtn.textContent = prefs.get('intenseOff', false) ? 'Enable Intense Effects' : 'Disable Intense Effects';
  syncSoundUI();
}