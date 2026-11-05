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
    const aura = new THREE.Mesh(new THREE.TorusGeometry(0.32,0.01,8,30), new THREE.MeshBasicMaterial({ color: 0x6b0000, transparent:true, opacity:0.5 }));
    aura.position.y=1.72; aura.rotation.x=Math.PI/2; g.add(aura);
    head.material = new THREE.MeshStandardMaterial({ color: opts.skin || 0xcfc6bf, roughness: 0.6, emissive: 0x140000 });
  }
  g.userData = { headG, armL, armR, opts };
  return g;
}

export function createCharacterHall({ THREE, state, showMessage }) {
  const scene = state.scene;
  scene.background = new THREE.Color(0x1a1410);
  scene.fog = new THREE.FogExp2(0x221a14, 0.012);
  if (state.renderer) state.renderer.toneMappingExposure = 1.3;
  state.player.pos.set(0,1.7,8); state.input.yaw = 0; state.input.pitch = 0;
  scene.add(new THREE.AmbientLight(0xffe8d2, 0.65));
  scene.add(new THREE.HemisphereLight(0xffe0bf, 0x3a2818, 0.55));
  const spot = new THREE.SpotLight(0xffe6c2, 3.2, 35, Math.PI/4.5, 0.4, 1); spot.position.set(0,6,5); spot.castShadow = state.quality!=='LOW'; scene.add(spot); scene.add(spot.target);
  const fill = new THREE.DirectionalLight(0xffd9a8, 0.5); fill.position.set(-4,4,6); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30,30), new THREE.MeshStandardMaterial({ color: 0x4a3522, roughness: 0.92 })); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x3f3024, roughness: 0.96 });
  const back = new THREE.Mesh(new THREE.PlaneGeometry(30,8), wallMat); back.position.set(0,4,-8); scene.add(back);

  const roster = [
    { name: 'Annabelle (Stylized 3D)', x:-6, cloth:0xf2eee6, hair:0x6b2d12, skin:0xd8c3a5, accent:0x8b1e1e, info: 'A stylized real-time 3D doll representation with scripted idle animation. (Full photoreal licensed character assets can be integrated via GLB pipeline.)' },
    { name: 'Ed Warren', x:-3, cloth:0x2f3a52, hair:0x3b2b1a, skin:0xd7b894, info: 'Stylized 3D representation of Ed Warren for in-scene presentation and navigation.' },
    { name: 'Lorraine Warren', x:0, cloth:0x4a3552, hair:0x4a3528, skin:0xe0c3a0, hairCap:0.72, info: 'Stylized 3D representation of Lorraine Warren.' },
    { name: 'Judy Warren', x:3, cloth:0x355244, hair:0x6a4a2a, skin:0xe3cca8, info: 'Stylized 3D representation of Judy Warren.' },
    { name: 'Valak (Stylized 3D)', x:6, cloth:0x111111, hair:0x111111, skin:0xd8d2c8, demon:true, info: 'A stylized 3D demonic figure inspired by Valak, with animated idle behavior.' },
  ];
  const chars = roster.map(r => { const c = makeStylizedCharacter(THREE, r); c.position.set(r.x,0,-4); scene.add(c); c.userData.info=r.info; c.userData.name=r.name; return c; });
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x24170f, roughness: 0.9 });
  chars.forEach(c => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.55,0.6,0.18,20), plinthMat); p.position.set(c.position.x,0.09,-4); p.receiveShadow=true; scene.add(p); });

  let t=0, shown=false;
  return {
    firstPerson: false,
    update(dt) {
      t += dt;
      state.camera.position.x = Math.sin(t*0.12)*2.2;
      state.camera.position.z = 8 + Math.cos(t*0.08)*0.3;
      state.camera.lookAt(0,1.4,-4);
      chars.forEach((c,i)=>{ c.userData.headG.rotation.y = Math.sin(t*0.7+i)*0.25; c.position.y = Math.sin(t*1.2+i)*0.01; c.rotation.y = Math.sin(t*0.3+i*0.7)*0.08; });
      if (!shown && t>1.2) { shown=true; showMessage('3D CHARACTER HALL', 'This scene presents stylized real-time 3D character models with animation. It is built as a working 3D framework that can load licensed GLB character rigs/animations for higher fidelity. Use the HUD to visit the Museum or Movie Worlds.'); }
    },
    dispose() { scene.traverse(obj => { obj.geometry?.dispose?.(); if (Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose?.()); else obj.material?.dispose?.(); }); }
  };
}
