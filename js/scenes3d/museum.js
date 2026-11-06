export function createMuseumScene({ THREE, state, playTone, noiseBurst, scareHit, flashScreen, showMessage, startAmbience }) {
  const scene = state.scene;
  scene.background = new THREE.Color(0x1a1410);
  scene.fog = new THREE.FogExp2(0x241a14, 0.011);
  if (state.renderer) state.renderer.toneMappingExposure = 1.35;
  state.player.pos.set(0, 1.7, 5.8);
  state.input.yaw = 0; state.input.pitch = -0.04;
  state.bounds = { x: 8.7, z: 8.7 };
  startAmbience?.();

  scene.add(new THREE.AmbientLight(0xffe8cc, 0.58));
  scene.add(new THREE.HemisphereLight(0xffddaa, 0x2a1a10, 0.52));
  const fill = new THREE.DirectionalLight(0xffe0b8, 0.6); fill.position.set(2, 6, 4); scene.add(fill);

  const hotspots = [];
  function addHotspot(x, z, label, title, body, radius = 1.6) { hotspots.push({ x, z, label, title, body, radius }); }
  function addLamp(x, y, z, intensity = 2.0, dist = 18) {
    const p = new THREE.PointLight(0xffd49a, intensity, dist, 1.2); p.position.set(x, y, z);
    if (state.quality !== 'LOW') { p.castShadow = true; p.shadow.mapSize.set(512,512); p.shadow.bias = -0.0006; }
    scene.add(p);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff1cf }));
    bulb.position.copy(p.position); scene.add(bulb);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.18,0.12,12,1,true), new THREE.MeshStandardMaterial({ color: 0x3a2414, roughness: 0.9, side: THREE.DoubleSide }));
    shade.position.set(x, y-0.1, z); scene.add(shade);
    return p;
  }
  const lamps = [addLamp(-4,2.75,-3,2.1), addLamp(4,2.75,-3,2.1), addLamp(-4,2.75,3,1.8), addLamp(4,2.75,3,1.8), addLamp(0,2.85,0.5,1.9), addLamp(0,2.65,-6.1,2.5,12)];

  // Shell
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.92 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x5a4028, roughness: 0.88 });
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1d, roughness: 1 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20,20), floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20,20),ceilMat); ceil.rotation.x=Math.PI/2; ceil.position.y=3.25; scene.add(ceil);
  const W=(w,h,x,y,z,ry=0)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),wallMat);m.position.set(x,y,z);m.rotation.y=ry;m.receiveShadow=true;scene.add(m);};
  W(20,3.25,0,1.625,-10,0); W(20,3.25,0,1.625,10,Math.PI); W(20,3.25,-10,1.625,0,Math.PI/2); W(20,3.25,10,1.625,0,-Math.PI/2);
  // rug
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(5.5,9), new THREE.MeshStandardMaterial({ color: 0x4a1f1a, roughness: 0.98 })); rug.rotation.x=-Math.PI/2; rug.position.set(0,0.01,-1); rug.receiveShadow=true; scene.add(rug);

  const glass = new THREE.MeshPhysicalMaterial({ color: 0xd8efff, transparent: true, opacity: 0.2, roughness: 0.04, transmission: 0.12 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.82 });
  const darkWood = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.86 });
  function caseBox(x,z,label,title,body,w=1.3,h=0.7,d=0.9) {
    const g=new THREE.Group(); g.position.set(x,0,z);
    const base=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wood); base.position.y=h/2; base.castShadow=true; base.receiveShadow=true; g.add(base);
    const vit=new THREE.Mesh(new THREE.BoxGeometry(w*0.88,h*1.28,d*0.84),glass); vit.position.y=h+ (h*0.64); g.add(vit);
    const pl=new THREE.Mesh(new THREE.BoxGeometry(w*0.7,0.06,0.02), new THREE.MeshStandardMaterial({color:0xf3eadc,roughness:0.7})); pl.position.set(0,0.18,d/2+0.01); g.add(pl);
    scene.add(g); addHotspot(x,z,label,title,body); return g;
  }
  function propBook(x,y,z,s=1) { const b=new THREE.Mesh(new THREE.BoxGeometry(0.22*s,0.035*s,0.16*s), new THREE.MeshStandardMaterial({color:0x3b1f1a,roughness:0.9})); b.position.set(x,y,z); b.rotation.y=Math.random()*0.5; scene.add(b); }
  function cross(x,y,z) { const m=new THREE.MeshStandardMaterial({color:0x8b7348,roughness:0.6,metalness:0.1}); const v=new THREE.Mesh(new THREE.BoxGeometry(0.03,0.22,0.03),m); v.position.set(x,y,z); scene.add(v); const h=new THREE.Mesh(new THREE.BoxGeometry(0.14,0.03,0.03),m); h.position.set(x,y+0.04,z); scene.add(h); }

  // Lore artifacts (Conjuring Universe info)
  caseBox(-5.2,-4.8,'Perron Case File','PERRON FARMHOUSE (1971)','Harrisville, Rhode Island. The Perron family reported escalating disturbances in their farmhouse. Ed and Lorraine Warren investigated claims tied to the property’s dark history, including the spirit associated with Bathsheba. Featured in The Conjuring (2013).',1.45,0.75,1.0);
  propBook(-5.2,0.78,-4.8); cross(-5.45,1.25,-4.55);

  caseBox(5.2,-4.8,'Enfield Evidence','ENFIELD POLTERGEIST (1977)','Enfield, London. The Hodgson family experienced violent phenomena centered around Janet Hodgson. The Warrens’ involvement and the demonic presence linked to Valak are depicted in The Conjuring 2 (2016).',1.45,0.75,1.0);
  propBook(5.05,0.78,-4.75); propBook(5.35,0.81,-4.85,0.9);

  caseBox(-5.2,4.2,'Occult Tools','WARREN INVESTIGATION TOOLS','Case files, audio recorders for EVP sessions, cameras, religious items, and research materials used by Ed (demonologist) and Lorraine (clairvoyant/medium) Warren during investigations.',1.4,0.72,0.95);
  cross(-5.2,1.22,4.2);

  caseBox(5.2,4.2,'Cursed Objects','CURSED & HAUNTED OBJECTS','The Warrens collected objects believed to be connected to dangerous phenomena, storing them for containment and study. The museum’s rule: do not touch the artifacts.',1.4,0.72,0.95);

  addHotspot(0,2.2,'Case Table','THE WARREN FILES','Ed and Lorraine Warren documented paranormal cases through the New England Society for Psychic Research. Their files span hauntings, possessions, and occult artifacts — inspiring The Conjuring Universe films. Explore the museum, then visit Character Hall and Movie Worlds from the HUD.');
  const table=new THREE.Group(); table.position.set(0,0,2.2);
  table.add(Object.assign(new THREE.Mesh(new THREE.BoxGeometry(1.8,0.08,1.0),darkWood),{position:new THREE.Vector3(0,0.78,0),castShadow:true,receiveShadow:true}));
  [[-0.75,0.39,-0.4],[0.75,0.39,-0.4],[-0.75,0.39,0.4],[0.75,0.39,0.4]].forEach(p=>{const l=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.78,0.08),darkWood);l.position.set(...p);table.add(l);});
  scene.add(table); propBook(-0.3,0.84,2.15,1.1); propBook(0.15,0.84,2.3,0.95); cross(0.55,0.93,2.15);

  // Annabelle cabinet centerpiece
  const cabinet=new THREE.Group(); cabinet.position.set(0,0,-6.6); scene.add(cabinet);
  const cBase=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.0,1.15),wood); cBase.position.y=0.5; cBase.castShadow=true; cabinet.add(cBase);
  const cFrame=new THREE.Mesh(new THREE.BoxGeometry(1.62,1.4,1.0),wood); cFrame.position.y=1.7; cabinet.add(cFrame);
  const cGlass=new THREE.Mesh(new THREE.BoxGeometry(1.46,1.24,0.86),glass); cGlass.position.y=1.7; cabinet.add(cGlass);
  const plaque=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.14,0.03), new THREE.MeshStandardMaterial({color:0xf5efe2,roughness:0.75})); plaque.position.set(0,2.45,0.51); cabinet.add(plaque);
  addHotspot(0,-4.9,'Annabelle','ANNABELLE — THE CASE','In 1970, a Raggedy Ann doll became associated with disturbing activity reported by a nursing student and her roommate. The Warrens concluded the doll was manipulated by an inhuman presence and secured it in their collection. “Positively do not open.” Featured across The Conjuring and the Annabelle films.',1.7);

  // Doll inside cabinet
  const doll=new THREE.Group(); doll.position.set(0,1.03,0); doll.scale.setScalar(0.56); cabinet.add(doll);
  const skin=new THREE.MeshStandardMaterial({color:0xd8c3a5,roughness:0.75});
  const dress=new THREE.MeshStandardMaterial({color:0xf2eee6,roughness:0.9});
  const hairMat=new THREE.MeshStandardMaterial({color:0x6b2d12,roughness:0.95});
  doll.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.22,0.42,14),dress),{position:new THREE.Vector3(0,0.36,0)}));
  const headG=new THREE.Group(); headG.position.y=0.72; doll.add(headG);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.16,18,14),skin); head.scale.set(0.95,1.05,0.92); headG.add(head);
  headG.add(Object.assign(new THREE.Mesh(new THREE.SphereGeometry(0.165,16,12,0,Math.PI*2,0,Math.PI*0.62),hairMat),{position:new THREE.Vector3(0,0.02,0)}));
  const eyeMat=new THREE.MeshBasicMaterial({color:0x1b2a3a});
  const e1=new THREE.Mesh(new THREE.CircleGeometry(0.018,10),eyeMat); e1.position.set(-0.045,0.02,0.145); headG.add(e1); const e2=e1.clone(); e2.position.x=0.045; headG.add(e2);
  const mouth=new THREE.Mesh(new THREE.TorusGeometry(0.03,0.005,6,12,Math.PI), new THREE.MeshStandardMaterial({color:0x8a3a3a})); mouth.position.set(0,-0.05,0.148); mouth.rotation.z=Math.PI; headG.add(mouth);
  const cLight=new THREE.PointLight(0xffe6c7,2.3,7,1.5); cLight.position.set(0,2.25,-6.2); scene.add(cLight);

  // Candles (animated emissive)
  const candles=[];
  function addCandle(x,z){
    const g=new THREE.Group(); g.position.set(x,0.82,z);
    g.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.03,0.14,10), new THREE.MeshStandardMaterial({color:0xe8dcc2,roughness:0.9})),{position:new THREE.Vector3(0,0.07,0)}));
    const flame=new THREE.Mesh(new THREE.SphereGeometry(0.018,8,8), new THREE.MeshBasicMaterial({color:0xffb347})); flame.position.y=0.155; flame.scale.set(0.7,1.4,0.7); g.add(flame);
    const fl=new THREE.PointLight(0xffa040,0.35,2.2,2); fl.position.y=0.16; g.add(fl);
    table.add(g); candles.push({flame,fl,o:Math.random()*10});
  }
  addCandle(-0.65,0.1); addCandle(0.7,-0.15);

  // Dust
  const dustCount = state.quality==='LOW'?120:280;
  const dustGeo=new THREE.BufferGeometry(); const dpos=new Float32Array(dustCount*3);
  for(let i=0;i<dustCount;i++){dpos[i*3]=(Math.random()-0.5)*18; dpos[i*3+1]=Math.random()*3.1; dpos[i*3+2]=(Math.random()-0.5)*18;}
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dpos,3));
  const dust=new THREE.Points(dustGeo,new THREE.PointsMaterial({color:0xc9b08a,size:0.014,transparent:true,opacity:0.32})); scene.add(dust);

  // Floor marker
  const ring=new THREE.Mesh(new THREE.RingGeometry(0.2,0.28,28), new THREE.MeshBasicMaterial({color:0x8b1e1e,transparent:true,opacity:0.45,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2; ring.position.set(0,0.02,-4.9); scene.add(ring);

  let t=0, flicker=0, creep=0, nextCreak=6+Math.random()*8;
  function getHotspot(){ for(const h of hotspots){ const dx=state.player.pos.x-h.x, dz=state.player.pos.z-h.z; if(dx*dx+dz*dz < h.radius*h.radius) return h; } return null; }
  function interact(h){ if(!h) return; showMessage(h.title, h.body); playTone(220,0.06,'triangle',0.015); }

  return {
    firstPerson:true, getHotspot, interact,
    update(dt){
      t+=dt;
      if(!state.reducedMotion && Math.random()<0.007) flicker=0.2;
      if(flicker>0){ flicker-=dt; lamps[4].intensity=1.0+Math.random()*0.7; cLight.intensity=1.3+Math.random()*0.9; }
      else { lamps[4].intensity=1.85+Math.sin(t*1.7)*0.06; cLight.intensity=2.25+Math.sin(t*2.1)*0.1; }
      headG.rotation.y=Math.sin(t*0.35)*0.16; headG.rotation.x=Math.sin(t*0.7)*0.025; doll.position.y=1.03+Math.sin(t*1.2)*0.004;
      // creepy events
      if(!state.reducedMotion && t>8 && Math.random()<0.003){ headG.rotation.y=(Math.random()-0.5)*0.9; playTone(65,0.07,'triangle',0.02); }
      if(!state.reducedMotion && t>nextCreak){ nextCreak=t+10+Math.random()*14; noiseBurst(0.12,0.018,420,'bandpass'); playTone(95,0.08,'sine',0.012); }
      if(!state.lowIntensity && !state.reducedMotion && t>15 && creep<=0 && Math.random()<0.0015){ creep=0.5; flashScreen(0.06,180,'#1a0000'); }
      if(creep>0) creep-=dt;
      // candles
      candles.forEach(c=>{ const f=1+Math.sin(t*10+c.o)*0.12; c.flame.scale.set(0.7*f,1.35*f,0.7*f); c.fl.intensity=0.28+Math.sin(t*11+c.o)*0.08; });
      // dust
      const a=dust.geometry.attributes.position.array; for(let i=0;i<dustCount;i++){ a[i*3+1]+=dt*0.028; if(a[i*3+1]>3.1) a[i*3+1]=0; } dust.geometry.attributes.position.needsUpdate=true;
      ring.material.opacity=0.3+Math.sin(t*2.5)*0.12;
    },
    dispose(){ scene.traverse(o=>{o.geometry?.dispose?.(); if(Array.isArray(o.material)) o.material.forEach(m=>m.dispose?.()); else o.material?.dispose?.();}); }
  };
}
