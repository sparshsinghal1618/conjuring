export function createMuseumScene({ THREE, state, playTone, showMessage }) {
  const scene = state.scene;
  scene.background = new THREE.Color(0x070404);
  state.player.pos.set(0, 1.7, 7);
  state.input.yaw = Math.PI; state.input.pitch = 0;

  const amb = new THREE.AmbientLight(0x3b2a1f, 0.28);
  scene.add(amb);

  function addLamp(x, y, z, intensity = 1.1) {
    const p = new THREE.PointLight(0xffc98a, intensity, 10, 2);
    p.position.set(x, y, z);
    p.castShadow = state.quality !== 'LOW';
    scene.add(p);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffe2b8 }));
    bulb.position.copy(p.position);
    scene.add(bulb);
    return p;
  }
  const lamps = [addLamp(-4, 2.6, -3), addLamp(4, 2.6, -3), addLamp(-4, 2.6, 3), addLamp(4, 2.6, 3), addLamp(0, 2.8, 0, 0.9)];

  // Room shell
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a120d, roughness: 0.95 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x2b1b12, roughness: 0.9 });
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0x120c09, roughness: 1 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), floorMat); floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), ceilMat); ceil.rotation.x = Math.PI/2; ceil.position.y = 3.2; scene.add(ceil);
  const makeWall = (w,h,x,y,z,ry=0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w,h), wallMat); m.position.set(x,y,z); m.rotation.y=ry; m.receiveShadow=true; scene.add(m); };
  makeWall(20,3.2,0,1.6,-10,0); makeWall(20,3.2,0,1.6,10,Math.PI);
  makeWall(20,3.2,-10,1.6,0,Math.PI/2); makeWall(20,3.2,10,1.6,0,-Math.PI/2);

  // Display cases & artifacts
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xaed4ff, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0, transmission: 0.2 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x3a2314, roughness: 0.85 });
  function caseBox(x,z,label) {
    const g = new THREE.Group(); g.position.set(x,0,z);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.3,0.7,0.9), wood); base.position.y=0.35; base.castShadow=true; base.receiveShadow=true; g.add(base);
    const vit = new THREE.Mesh(new THREE.BoxGeometry(1.15,0.9,0.75), glass); vit.position.y=1.15; g.add(vit);
    scene.add(g);
    g.userData.label = label;
    return g;
  }
  caseBox(-5, -5, 'Shadow artifacts and cursed curios.');
  caseBox(5, -5, 'Occult texts and ritual objects.');
  caseBox(-5, 4, 'Haunted photographs and evidence.');
  caseBox(5, 4, 'Religious relics and protective items.');

  // Annabelle cabinet centerpiece
  const cabinet = new THREE.Group(); cabinet.position.set(0,0,-6.5); scene.add(cabinet);
  const cBase = new THREE.Mesh(new THREE.BoxGeometry(1.7,1.0,1.1), wood); cBase.position.y=0.5; cBase.castShadow=true; cabinet.add(cBase);
  const cFrame = new THREE.Mesh(new THREE.BoxGeometry(1.55,1.35,0.95), wood); cFrame.position.y=1.68; cabinet.add(cFrame);
  const cGlass = new THREE.Mesh(new THREE.BoxGeometry(1.4,1.2,0.82), glass); cGlass.position.y=1.68; cabinet.add(cGlass);
  const signMat = new THREE.MeshStandardMaterial({ color: 0xf5efe2, roughness: 0.8 });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(1.1,0.12,0.03), signMat); sign.position.set(0,2.38,0.49); cabinet.add(sign);

  // Mini Annabelle inside cabinet (animated)
  const doll = new THREE.Group(); doll.position.set(0,1.02,0); doll.scale.setScalar(0.55); cabinet.add(doll);
  const skin = new THREE.MeshStandardMaterial({ color: 0xd8c3a5, roughness: 0.75 });
  const dress = new THREE.MeshStandardMaterial({ color: 0xf2eee6, roughness: 0.9 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x6b2d12, roughness: 0.95 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.22,0.42,14), dress); body.position.y=0.36; doll.add(body);
  const headG = new THREE.Group(); headG.position.y=0.72; doll.add(headG);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16,18,14), skin); head.scale.set(0.95,1.05,0.92); headG.add(head);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.165,16,12,0,Math.PI*2,0,Math.PI*0.62), hairMat); hair.position.y=0.02; headG.add(hair);
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1b2a3a });
  const e1 = new THREE.Mesh(new THREE.CircleGeometry(0.018,10), eyeMat); e1.position.set(-0.045,0.02,0.145); headG.add(e1);
  const e2 = e1.clone(); e2.position.x=0.045; headG.add(e2);
  const cLight = new THREE.PointLight(0xffe6c7, 1.2, 4, 2); cLight.position.set(0,2.15,-6.2); scene.add(cLight);

  // Floating dust (simple points)
  const dustCount = state.quality === 'LOW' ? 120 : 260;
  const dustGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(dustCount * 3);
  for (let i=0;i<dustCount;i++){ pos[i*3]=(Math.random()-0.5)*18; pos[i*3+1]=Math.random()*3; pos[i*3+2]=(Math.random()-0.5)*18; }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: 0xc9b08a, size: 0.015, transparent: true, opacity: 0.35 }));
  scene.add(dust);

  // Hotspot markers
  function marker(x,z,color=0xd4af37) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.18,0.24,24), new THREE.MeshBasicMaterial({ color, transparent:true, opacity:0.55, side:THREE.DoubleSide }));
    m.rotation.x = -Math.PI/2; m.position.set(x,0.02,z); scene.add(m); return m;
  }
  const annMarker = marker(0,-4.8,0x8b1e1e);

  let t = 0; let flicker = 0; let prompted = false;
  return {
    firstPerson: true,
    update(dt) {
      t += dt;
      // lamp flicker
      if (!state.reducedMotion && Math.random() < 0.01) flicker = 0.25;
      if (flicker > 0) { flicker -= dt; lamps[4].intensity = 0.2 + Math.random()*0.6; cLight.intensity = 0.4 + Math.random()*1.2; }
      else { lamps[4].intensity = 0.9 + Math.sin(t*1.7)*0.05; cLight.intensity = 1.1 + Math.sin(t*2.1)*0.08; }
      // Annabelle idle animation
      headG.rotation.y = Math.sin(t * 0.35) * 0.18;
      headG.rotation.x = Math.sin(t * 0.7) * 0.03;
      doll.position.y = 1.02 + Math.sin(t * 1.2) * 0.004;
      if (!state.reducedMotion && Math.floor(t) % 17 === 9 && Math.random() < 0.02) {
        headG.rotation.y = (Math.random()-0.5)*0.8;
        playTone(70, 0.08, 'triangle', 0.02);
      }
      // dust drift
      const arr = dust.geometry.attributes.position.array;
      for (let i=0;i<dustCount;i++){ arr[i*3+1]+=dt*0.03; if (arr[i*3+1]>3) arr[i*3+1]=0; }
      dust.geometry.attributes.position.needsUpdate = true;
      // proximity prompt
      const d = state.player.pos.distanceTo(new THREE.Vector3(0,1.7,-4.8));
      annMarker.material.opacity = 0.35 + Math.sin(t*3)*0.15 + (d<2.2?0.25:0);
      if (d < 2.0 && !prompted) {
        prompted = true;
        showMessage('ANNABELLE CASE', 'A stylized 3D Annabelle display sits inside the museum case. In this experience, the cabinet light flickers and the doll performs scripted idle animations. Click "Characters" or "Movie Worlds" in the HUD to explore more areas.');
      }
      if (d > 3.2) prompted = false;
    },
    dispose() {
      scene.traverse(obj => { obj.geometry?.dispose?.(); if (Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose?.()); else obj.material?.dispose?.(); });
    }
  };
}
