function makeHouse(THREE, x, z, color=0x5a3a24, roof=0x2a1d14) {
  const g=new THREE.Group(); g.position.set(x,0,z);
  const mat=new THREE.MeshStandardMaterial({color,roughness:0.93});
  const base=new THREE.Mesh(new THREE.BoxGeometry(2.3,1.25,1.7),mat); base.position.y=0.625; base.castShadow=true; base.receiveShadow=true; g.add(base);
  const r=new THREE.Mesh(new THREE.ConeGeometry(1.75,0.95,4),new THREE.MeshStandardMaterial({color:roof,roughness:1})); r.position.y=1.725; r.rotation.y=Math.PI/4; g.add(r);
  const door=new THREE.Mesh(new THREE.PlaneGeometry(0.28,0.5),new THREE.MeshStandardMaterial({color:0x2a1a10})); door.position.set(0,0.35,0.86); g.add(door);
  [[-0.55,0.75],[0.55,0.75]].forEach(p=>{const w=new THREE.Mesh(new THREE.PlaneGeometry(0.26,0.26),new THREE.MeshBasicMaterial({color:0xffcf70})); w.position.set(p[0],p[1],0.86); g.add(w);});
  return g;
}
function makeMonastery(THREE,x,z){
  const g=new THREE.Group(); g.position.set(x,0,z);
  const stone=new THREE.MeshStandardMaterial({color:0x55504a,roughness:1});
  const t=new THREE.Mesh(new THREE.BoxGeometry(1.3,2.8,1.3),stone); t.position.y=1.4; t.castShadow=true; g.add(t);
  const arch=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.7,0.1),new THREE.MeshStandardMaterial({color:0x1a120d})); arch.position.set(0,0.45,0.66); g.add(arch);
  const cv=new THREE.Mesh(new THREE.BoxGeometry(0.07,0.45,0.07),new THREE.MeshBasicMaterial({color:0x7a0000})); cv.position.set(0,3.05,0); g.add(cv);
  const ch=new THREE.Mesh(new THREE.BoxGeometry(0.24,0.07,0.07),cv.material); ch.position.set(0,3.15,0); g.add(ch);
  const win=new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.35),new THREE.MeshBasicMaterial({color:0x8fb0ff,transparent:true,opacity:0.7})); win.position.set(0,2.1,0.66); g.add(win);
  return g;
}
function makeApartment(THREE,x,z){ const g=makeHouse(THREE,x,z,0x5b4a3a,0x2b2520); const s=new THREE.Mesh(new THREE.BoxGeometry(2.5,0.08,1.9),new THREE.MeshStandardMaterial({color:0x444})); s.position.y=1.3; g.add(s); return g; }

export function createMovieHub({ THREE, state, playTone, showMessage, startAmbience }) {
  const scene=state.scene;
  scene.background=new THREE.Color(0x18120d);
  scene.fog=new THREE.FogExp2(0x201811,0.009);
  if(state.renderer) state.renderer.toneMappingExposure=1.32;
  startAmbience?.();
  scene.add(new THREE.AmbientLight(0xffe8d2,0.62));
  scene.add(new THREE.HemisphereLight(0xffdfbf,0x3a2818,0.52));
  const key=new THREE.DirectionalLight(0xffe6c2,1.15); key.position.set(4,7,5); if(state.quality!=='LOW') key.castShadow=true; scene.add(key);
  const fill=new THREE.PointLight(0xffd8a8,1.1,30,1.5); fill.position.set(-4,3,6); scene.add(fill);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(50,30), new THREE.MeshStandardMaterial({color:0x463220,roughness:0.94})); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);

  const worlds=[
    { label:'The Conjuring', pos:[-9,-4], obj:makeHouse(THREE,-9,-4,0x6a4a30), title:'THE CONJURING (2013)', body:'1971, Harrisville, Rhode Island. The Perron family moves into a secluded farmhouse and experiences terrifying paranormal activity. Ed and Lorraine Warren investigate, uncovering the land’s history and a malevolent presence linked to Bathsheba. Key figures: Ed & Lorraine Warren, the Perron family, Bathsheba Sherman.' },
    { label:'The Conjuring 2', pos:[-4.5,-4], obj:makeHouse(THREE,-4.5,-4,0x4a4f58,0x222830), title:'THE CONJURING 2 (2016)', body:'1977, Enfield, London. The Hodgson family faces violent poltergeist phenomena, especially around Janet Hodgson. The Warrens encounter the demon Valak, who manifests in terrifying ways, including the Nun. Key figures: Ed & Lorraine Warren, Hodgson family, Valak.' },
    { label:'The Devil Made Me Do It', pos:[0,-4], obj:makeHouse(THREE,0,-4,0x5a5040,0x2a261f), title:'THE CONJURING: THE DEVIL MADE ME DO IT (2021)', body:'1981, Connecticut. After a harrowing exorcism connected to young David Glatzel, Arne Cheyenne Johnson’s case becomes known as the first U.S. murder trial to cite demonic possession in defense. The Warrens investigate an occult thread behind the events. Key figures: Ed & Lorraine Warren, Arne Johnson, David Glatzel.' },
    { label:'Annabelle Films', pos:[4.5,-4], obj:makeApartment(THREE,4.5,-4), title:'ANNABELLE TRILOGY', body:'Annabelle (2014): a young couple faces terror after the doll becomes a conduit. Annabelle: Creation (2017): origins tied to a dollmaker and a tragic loss. Annabelle Comes Home (2019): the doll’s presence in the Warrens’ artifact room unleashes chaos. The doll serves as a beacon for evil in the Conjuring Universe.' },
    { label:'The Nun I & II', pos:[9,-4], obj:makeMonastery(THREE,9,-4), title:'THE NUN (2018) / THE NUN II (2023)', body:'1952, Romania (Cârța Monastery): Father Burke and Sister Irene confront Valak, a powerful demonic entity. 1956, France: Sister Irene faces Valak again as the demon spreads terror. Valak’s presence echoes through the Warrens’ later cases. Key figures: Sister Irene, Father Burke, Valak.' },
  ];
  worlds.forEach(w=>scene.add(w.obj));

  const rings=[];
  worlds.forEach((w,i)=>{
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.78,0.035,10,44), new THREE.MeshBasicMaterial({color:0xd4af37,transparent:true,opacity:0.3}));
    ring.position.set(w.pos[0],1.15,-2.1); scene.add(ring);
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.75,0.02,24), new THREE.MeshBasicMaterial({color:0xd4af37,transparent:true,opacity:0.08}));
    beam.position.set(w.pos[0],0.02,-2.1); scene.add(beam);
    rings.push({ring,beam,w,i});
  });

  // back wall panels for timeline feel
  const panelMat=new THREE.MeshStandardMaterial({color:0x3a2c20,roughness:0.95});
  for(let i=0;i<5;i++){const p=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.1),panelMat); p.position.set(-9+i*4.5,2.0,-7.2); scene.add(p);}

  let t=0, shown=false, sel=2;
  function currentInfo(){ const w=worlds[sel]; return { label:w.label, title:w.title, body:w.body }; }
  function interact(){ const c=currentInfo(); showMessage(c.title,c.body); playTone(260,0.05,'triangle',0.015); sel=(sel+1)%worlds.length; }

  const onKey = (e) => {
    if (state.active !== api) return;
    if(e.code==='ArrowRight'){ sel=(sel+1)%worlds.length; playTone(300,0.04,'sine',0.01);}
    if(e.code==='ArrowLeft'){ sel=(sel+worlds.length-1)%worlds.length; playTone(240,0.04,'sine',0.01);}
  };
  window.addEventListener('keydown', onKey);

  const api = {
    firstPerson:false, getHotspot:()=>currentInfo(), interact, currentInfo,
    update(dt){
      t+=dt;
      const tx=worlds[sel].pos[0]*0.35;
      state.camera.position.x += (tx - state.camera.position.x)*Math.min(dt*1.8,1);
      state.camera.position.z = 8.5 + Math.sin(t*0.18)*0.25;
      state.camera.position.y = 2.0;
      state.camera.lookAt(worlds[sel].pos[0],1.0,-4);
      rings.forEach((r,i)=>{
        const active=i===sel;
        r.ring.rotation.y += dt*(active?1.4:0.45);
        r.ring.material.opacity = active ? 0.65+Math.sin(t*4)*0.12 : 0.22;
        r.ring.scale.setScalar(active?1.15:1.0);
        r.beam.material.opacity = active ? 0.14 : 0.04;
        r.w.obj.position.y = Math.sin(t*1.1+i)*0.015 + (active?0.03:0);
      });
      if(!shown&&t>1.0){ shown=true; showMessage('MOVIE WORLDS — CONJURING UNIVERSE', 'Browse with ← → arrow keys or the View button. Each portal covers a Conjuring Universe story: The Conjuring (Perron/Bathsheba), The Conjuring 2 (Enfield/Valak), The Devil Made Me Do It (Arne Johnson case), the Annabelle trilogy, and The Nun I & II — all tied to Ed & Lorraine Warren and the forces they confronted.'); }
    },
    dispose(){ window.removeEventListener('keydown', onKey); scene.traverse(o=>{o.geometry?.dispose?.(); if(Array.isArray(o.material)) o.material.forEach(m=>m.dispose?.()); else o.material?.dispose?.();}); }
  };
  return api;
}
