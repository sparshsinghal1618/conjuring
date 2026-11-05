function makeHouse(THREE, x, z, color=0x2a1a12) {
  const g = new THREE.Group(); g.position.set(x,0,z);
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.95 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.2,1.2,1.6), mat); base.position.y=0.6; base.castShadow=true; g.add(base);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.7,0.9,4), new THREE.MeshStandardMaterial({ color: 0x1a120d, roughness: 1 }));
  roof.position.y=1.65; roof.rotation.y=Math.PI/4; g.add(roof);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(0.28,0.28), new THREE.MeshBasicMaterial({ color: 0xffcf70 }));
  win.position.set(0,0.75,0.81); g.add(win);
  return g;
}
function makeMonastery(THREE, x, z) {
  const g = new THREE.Group(); g.position.set(x,0,z);
  const stone = new THREE.MeshStandardMaterial({ color: 0x2b2b2b, roughness: 1 });
  const tower = new THREE.Mesh(new THREE.BoxGeometry(1.2,2.6,1.2), stone); tower.position.y=1.3; g.add(tower);
  const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.08,0.5,0.08), new THREE.MeshBasicMaterial({ color: 0x550000 })); crossV.position.set(0,2.85,0); g.add(crossV);
  const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.28,0.08,0.08), crossV.material); crossH.position.set(0,2.95,0); g.add(crossH);
  return g;
}

export function createMovieHub({ THREE, state, showMessage }) {
  const scene = state.scene;
  scene.background = new THREE.Color(0x18120d);
  scene.fog = new THREE.FogExp2(0x201811, 0.01);
  if (state.renderer) state.renderer.toneMappingExposure = 1.3;
  state.player.pos.set(0,1.7,9); state.input.yaw = 0; state.input.pitch = 0;
  scene.add(new THREE.AmbientLight(0xffe8d2, 0.6));
  scene.add(new THREE.HemisphereLight(0xffdfbf, 0x3a2818, 0.5));
  const key = new THREE.DirectionalLight(0xffe6c2, 1.1); key.position.set(4,7,5); key.castShadow = state.quality!=='LOW'; scene.add(key);
  const fill = new THREE.PointLight(0xffd8a8, 1.2, 30, 1.5); fill.position.set(-4,3,6); scene.add(fill);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40,40), new THREE.MeshStandardMaterial({ color: 0x463220, roughness: 0.94 })); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);

  const worlds = [
    { name: 'The Conjuring — Perron Farmhouse', obj: makeHouse(THREE,-7,-4,0x2a1a12), info: 'A stylized 3D vignette representing the Perron farmhouse setting.' },
    { name: 'The Conjuring 2 — Enfield', obj: makeHouse(THREE,-3.5,-4,0x1f2228), info: 'A stylized 3D vignette representing the Enfield house.' },
    { name: 'The Devil Made Me Do It', obj: makeHouse(THREE,0,-4,0x242018), info: 'A stylized 3D vignette for investigation locations.' },
    { name: 'Annabelle Trilogy', obj: makeHouse(THREE,3.5,-4,0x2d1f1f), info: 'A stylized 3D vignette representing Annabelle settings.' },
    { name: 'The Nun — Monastery', obj: makeMonastery(THREE,7,-4), info: 'A stylized 3D gothic monastery vignette inspired by The Nun.' },
  ];
  worlds.forEach(w => scene.add(w.obj));

  // Portals
  worlds.forEach(w => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75,0.03,10,40), new THREE.MeshBasicMaterial({ color: 0xd4af37, transparent:true, opacity:0.35 }));
    ring.position.set(w.obj.position.x,1.1,-2.2); scene.add(ring); w.ring = ring;
  });

  let t=0, shown=false;
  return {
    firstPerson: false,
    update(dt) {
      t += dt;
      state.camera.position.x = Math.sin(t*0.15)*3.5;
      state.camera.lookAt(0,1,-4);
      worlds.forEach((w,i)=>{ w.ring.rotation.y += dt*0.5; w.ring.material.opacity = 0.25 + Math.sin(t*2+i)*0.12; w.obj.position.y = Math.sin(t*1.1+i)*0.02; });
      if (!shown && t>1.0) { shown=true; showMessage('3D MOVIE WORLDS', 'This hub presents stylized 3D vignettes for each film area. The architecture is modular so full explorable GLB environments, character rigs, and cinematic triggers can be added per movie. Use the HUD to return to the Museum or Character Hall.'); }
    },
    dispose() { scene.traverse(obj => { obj.geometry?.dispose?.(); if (Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose?.()); else obj.material?.dispose?.(); }); }
  };
}
