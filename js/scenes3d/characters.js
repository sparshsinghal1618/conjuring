function makeStylizedCharacter(THREE, opts = {}) {
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({ color: opts.skin || 0xd8c3a5, roughness: 0.8 });
  const cloth = new THREE.MeshStandardMaterial({ color: opts.cloth || 0x2b2b2b, roughness: 0.9 });
  const accent = new THREE.MeshStandardMaterial({ color: opts.accent || 0x555555, roughness: 0.85 });
  const hair = new THREE.MeshStandardMaterial({ color: opts.hair || 0x3a2416, roughness: 0.95 });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.75, 4, 10), cloth); body.position.y = 1.05; body.castShadow = true; g.add(body);
  const headG = new THREE.Group(); headG.position.y = 1.72; g.add(headG);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 14), skin); head.scale.y = 1.08; head.castShadow = true; headG.add(head);
  const hairMesh = new THREE.Mesh(new THREE.SphereGeometry(0.184, 16, 12, 0, Math.PI*2, 0, Math.PI*(opts.hairCap||0.58)), hair); hairMesh.position.y=0.015; headG.add(hairMesh);
  const eye = new THREE.MeshStandardMaterial({ color: 0xe8eef5, emissive: 0x111111, roughness: 0.3 });
  const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eye); e1.position.set(-0.055, 0.02, 0.155); headG.add(e1);
  const e2 = e1.clone(); e2.position.x = 0.055; headG.add(e2);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.55, 4, 8), accent); armL.position.set(-0.3,1.2,0); armL.rotation.z=0.18; g.add(armL);
  const armR = armL.clone(); armR.position.x=0.3; armR.rotation.z=-0.18; g.add(armR);
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.55, 4, 8), accent); legL.position.set(-0.1,0.38,0); g.add(legL);
  const legR = legL.clone(); legR.position.x=0.1; g.add(legR);
  if (opts.demon) {
    const aura = new THREE.Mesh(new THREE.TorusGeometry(0.34,0.012,8,30), new THREE.MeshBasicMaterial({ color: opts.aura||0x6b0000, transparent:true, opacity:0.55 }));
    aura.position.y=1.72; aura.rotation.x=Math.PI/2; g.add(aura);
    head.material = new THREE.MeshStandardMaterial({ color: opts.skin || 0xd8d2c8, roughness: 0.55, emissive: opts.emissive||0x140000 });
  }
  g.userData = { headG, armL, armR, opts };
  return g;
}

export function createCharacterHall({ THREE, state, playTone, showMessage, startAmbience }) {
  const scene = state.scene;
  scene.background = new THREE.Color(0x1a1410);
  scene.fog = new THREE.FogExp2(0x221a14, 0.011);
  if (state.renderer) state.renderer.toneMappingExposure = 1.32;
  startAmbience?.();
  state.player.pos.set(0,1.7,8); state.input.yaw = 0; state.input.pitch = 0;
  scene.add(new THREE.AmbientLight(0xffe8d2, 0.68));
  scene.add(new THREE.HemisphereLight(0xffe0bf, 0x3a2818, 0.58));
  const spot = new THREE.SpotLight(0xffe6c2, 3.4, 38, Math.PI/4.5, 0.4, 1); spot.position.set(0,6.5,6); if(state.quality!=='LOW') spot.castShadow=true; scene.add(spot); scene.add(spot.target);
  const fill = new THREE.DirectionalLight(0xffd9a8, 0.55); fill.position.set(-5,4,6); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(36,20), new THREE.MeshStandardMaterial({ color: 0x4a3522, roughness: 0.92 })); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(36,8), new THREE.MeshStandardMaterial({ color: 0x3f3024, roughness: 0.96 })); back.position.set(0,4,-6.5); scene.add(back);

  const roster = [
    { label:'Ed Warren', x:-7.5, cloth:0x2f3a52, hair:0x3b2b1a, skin:0xd7b894, accent:0x4a5568, title:'ED WARREN', body:'Ed Warren (1926–2006) was a demonologist and paranormal investigator. With his wife Lorraine, he co-founded the New England Society for Psychic Research and investigated cases that inspired The Conjuring Universe, including the Perron haunting and the Enfield poltergeist.' },
    { label:'Lorraine Warren', x:-4.5, cloth:0x4a3552, hair:0x4a3528, skin:0xe0c3a0, accent:0x6b5a72, hairCap:0.72, title:'LORRAINE WARREN', body:'Lorraine Warren (1927–2019) was a clairvoyant and trance medium who worked alongside Ed Warren. Her reported visions and sensitivity to spiritual presence play a central role in the investigations depicted in The Conjuring films.' },
    { label:'Judy Warren', x:-1.5, cloth:0x355244, hair:0x6a4a2a, skin:0xe3cca8, accent:0x4a6a58, title:'JUDY WARREN', body:'Judy Warren is the daughter of Ed and Lorraine Warren. She appears in the Conjuring Universe stories connected to the Warren home and the artifact room, including Annabelle Comes Home, where the dangers of the contained objects are explored.' },
    { label:'Annabelle', x:1.5, cloth:0xf2eee6, hair:0x6b2d12, skin:0xd8c3a5, accent:0x8b1e1e, title:'ANNABELLE (ENTITY)', body:'Annabelle is depicted as a conduit for a malevolent inhuman presence attached to a doll. In the films, the doll is linked to terror across multiple stories and is ultimately secured in the Warrens’ artifact collection. The Annabelle trilogy explores its influence and origins.' },
    { label:'Valak', x:4.5, cloth:0x141414, hair:0x141414, skin:0xd8d2c8, accent:0x222, demon:true, emissive:0x180000, title:'VALAK (THE DEMON NUN)', body:'Valak is a powerful demonic entity in The Conjuring Universe, taking the form of a nun to mock faith. It appears in The Conjuring 2 and is central to The Nun and The Nun II, with origins tied to Cârța Monastery in Romania (1952) and later manifestations in France.' },
    { label:'Bathsheba', x:7.5, cloth:0x3a2a2a, hair:0x2a1a1a, skin:0xcdb8a0, accent:0x4a3a3a, demon:true, aura:0x3a0000, emissive:0x100505, title:'BATHSHEBA SHERMAN', body:'In The Conjuring (2013), Bathsheba is portrayed as a dark presence tied to the history of the Perron farmhouse in Harrisville, Rhode Island. Her legend becomes central to the haunting the Warrens investigate in 1971.' },
  ];
  const chars = roster.map(r => { const c = makeStylizedCharacter(THREE, r); c.position.set(r.x,0,-3.2); scene.add(c); const p=new THREE.Mesh(new THREE.CylinderGeometry(0.6,0.66,0.2,22), new THREE.MeshStandardMaterial({color:0x3a2718,roughness:0.9})); p.position.set(r.x,0.1,-3.2); p.receiveShadow=true; scene.add(p); return {c,r}; });

  let t=0, shown=false, sel=0;
  const onKey=(e)=>{ if(state.active!==api) return; if(e.code==='ArrowRight'){sel=(sel+1)%roster.length; playTone(320,0.04,'sine',0.01);} if(e.code==='ArrowLeft'){sel=(sel+roster.length-1)%roster.length; playTone(250,0.04,'sine',0.01);} };
  window.addEventListener('keydown', onKey);
  function currentInfo(){ const r=roster[sel]; return {label:r.label,title:r.title,body:r.body}; }
  function interact(){ const c=currentInfo(); showMessage(c.title,c.body); playTone(260,0.05,'triangle',0.015); sel=(sel+1)%roster.length; }

  const api={
    firstPerson:false, getHotspot:()=>currentInfo(), interact, currentInfo,
    update(dt){
      t+=dt;
      const tx=roster[sel].x*0.3;
      state.camera.position.x += (tx-state.camera.position.x)*Math.min(dt*2,1);
      state.camera.position.z = 7.8 + Math.sin(t*0.2)*0.2;
      state.camera.position.y=2.0;
      state.camera.lookAt(roster[sel].x,1.25,-3.2);
      chars.forEach(({c,r},i)=>{
        const active=i===sel;
        c.userData.headG.rotation.y = Math.sin(t*0.8+i)* (active?0.35:0.18);
        c.position.y = Math.sin(t*1.3+i)*0.01 + (active?0.04:0);
        c.rotation.y = (active?Math.sin(t*0.5)*0.12:Math.sin(t*0.25+i)*0.06);
        if(r.demon && c.userData.headG.children.find(ch=>ch.geometry?.type==='TorusGeometry')) {
          const aura=c.children.find(ch=>ch.geometry?.type==='TorusGeometry'); if(aura) aura.rotation.z += dt*(active?1.2:0.5);
        }
      });
      if(!shown&&t>1.0){ shown=true; showMessage('CHARACTERS & ENTITIES', 'Browse with ← → or the View button. Meet the Warrens (Ed, Lorraine, Judy) and key forces from The Conjuring Universe — including Annabelle, Valak, and Bathsheba. This hall uses stylized real-time 3D models; the scene structure supports swapping in licensed GLB character rigs/animations for higher fidelity.'); }
    },
    dispose(){ window.removeEventListener('keydown', onKey); scene.traverse(o=>{o.geometry?.dispose?.(); if(Array.isArray(o.material)) o.material.forEach(m=>m.dispose?.()); else o.material?.dispose?.();}); }
  };
  return api;
}
