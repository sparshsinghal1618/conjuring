export function createIntroScene({ THREE, state, playTone, noiseBurst, flashScreen, showMessage, goMuseum }) {
  const scene = state.scene;
  scene.background = new THREE.Color(0x000000);

  // Subtle ambient for silhouette before scare
  const amb = new THREE.AmbientLight(0x221111, 0.15);
  scene.add(amb);
  const key = new THREE.SpotLight(0xffeedd, 0, 8, Math.PI / 6, 0.5, 1.2);
  key.position.set(0.8, 2.2, 2.5);
  key.target.position.set(0, 1.2, 0);
  scene.add(key); scene.add(key.target);
  const rim = new THREE.PointLight(0x550000, 0, 6);
  rim.position.set(-1.2, 1.0, -1.5);
  scene.add(rim);

  // Floor hint
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ color: 0x050303, roughness: 1, metalness: 0 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0;
  scene.add(floor);

  // Build a stylized 3D Annabelle-like doll (procedural, animated)
  const doll = new THREE.Group();
  doll.position.set(0, 0, 0);
  doll.visible = false;
  scene.add(doll);

  const skin = new THREE.MeshStandardMaterial({ color: 0xd8c3a5, roughness: 0.75 });
  const dress = new THREE.MeshStandardMaterial({ color: 0xf2eee6, roughness: 0.9 });
  const sash = new THREE.MeshStandardMaterial({ color: 0x8b1e1e, roughness: 0.85 });
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x6b2d12, roughness: 0.95 });
  const eyeWhite = new THREE.MeshStandardMaterial({ color: 0xf7f2e8, roughness: 0.4 });
  const eyeIris = new THREE.MeshBasicMaterial({ color: 0x2a4d6e });
  const eyePupil = new THREE.MeshBasicMaterial({ color: 0x050505 });
  const lip = new THREE.MeshStandardMaterial({ color: 0x8a3a3a, roughness: 0.7 });

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.55, 16), dress);
  torso.position.y = 0.72; torso.castShadow = true; doll.add(torso);
  const waist = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 8, 20), sash);
  waist.position.y = 0.58; waist.rotation.x = Math.PI / 2; doll.add(waist);
  const skirt = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.7, 20, 1, true), dress);
  skirt.position.y = 0.35; skirt.castShadow = true; doll.add(skirt);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 12), skin);
  neck.position.y = 1.05; doll.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.y = 1.28;
  doll.add(headGroup);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 20), skin);
  head.scale.set(0.95, 1.05, 0.92);
  head.castShadow = true;
  headGroup.add(head);

  // Hair (stylized)
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.225, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), hairMat);
  hair.position.y = 0.03; hair.scale.set(0.98, 1, 0.96);
  headGroup.add(hair);
  for (let i = 0; i < 10; i++) {
    const strand = new THREE.Mesh(new THREE.CapsuleGeometry(0.018, 0.22, 4, 8), hairMat);
    const a = (i / 10) * Math.PI * 2;
    strand.position.set(Math.cos(a) * 0.17, -0.05, Math.sin(a) * 0.14);
    strand.rotation.z = Math.cos(a) * 0.35;
    strand.rotation.x = Math.sin(a) * 0.2;
    headGroup.add(strand);
  }

  // Eyes
  function makeEye(x) {
    const g = new THREE.Group();
    g.position.set(x, 0.03, 0.19);
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.038, 12, 10), eyeWhite);
    w.scale.z = 0.5; g.add(w);
    const iris = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), eyeIris);
    iris.position.z = 0.02; g.add(iris);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.008, 12), eyePupil);
    pupil.position.z = 0.021; g.add(pupil);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.041, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), skin);
    lid.scale.set(1, 0.25, 0.55);
    lid.position.set(0, 0.015, 0.002);
    lid.rotation.x = Math.PI;
    g.add(lid);
    g.userData.lid = lid;
    return g;
  }
  const leftEye = makeEye(-0.065); const rightEye = makeEye(0.065);
  headGroup.add(leftEye); headGroup.add(rightEye);

  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 8, 16, Math.PI), lip);
  mouth.position.set(0, -0.07, 0.185);
  mouth.rotation.z = Math.PI;
  headGroup.add(mouth);

  // Arms
  function makeArm(side) {
    const g = new THREE.Group();
    g.position.set(side * 0.28, 0.9, 0);
    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.22, 4, 8), dress);
    upper.position.y = -0.11; g.add(upper);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), skin);
    hand.position.y = -0.27; g.add(hand);
    g.rotation.z = side * 0.25;
    return g;
  }
  const leftArm = makeArm(-1), rightArm = makeArm(1);
  doll.add(leftArm); doll.add(rightArm);

  // Legs hint
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.22, 4, 8), dress);
  legL.position.set(-0.09, 0.18, 0); doll.add(legL);
  const legR = legL.clone(); legR.position.x = 0.09; doll.add(legR);

  // Camera
  state.camera.position.set(0, 1.25, 3.4);
  state.camera.lookAt(0, 1.2, 0);
  const baseCam = state.camera.position.clone();

  let t = 0;
  let phase = 0; // 0 black/breath, 1 appear, 2 stare, 3 snap, 4 vanish, 5 message, 6 reveal
  let shake = 0;
  let done = false;
  let messageShown = false;

  function setEyeOpen(amount) {
    [leftEye, rightEye].forEach(e => {
      const lid = e.userData.lid;
      lid.scale.y = 0.25 + (1 - amount) * 0.9;
      lid.position.y = 0.015 + (1 - amount) * 0.03;
    });
  }
  setEyeOpen(0);

  return {
    firstPerson: false,
    update(dt) {
      if (done) return;
      t += dt;
      // Breathing pulses (audio) before reveal
      if (phase === 0) {
        if (t > 0.8 && t < 0.85) playTone(55, 0.5, 'sine', state.lowIntensity ? 0.03 : 0.06);
        if (t > 2.2) { phase = 1; t = 0; doll.visible = true; doll.position.set(0,0,0.4); doll.scale.setScalar(1.3); key.intensity = 2.4; rim.intensity = 1.1; setEyeOpen(0); }
      } else if (phase === 1) {
        // Lunge toward camera
        const p = Math.min(t / 0.55, 1);
        doll.position.z = THREE.MathUtils.lerp(0.4, 2.45, p * p);
        doll.position.y = Math.sin(p * Math.PI) * 0.03;
        headGroup.rotation.x = THREE.MathUtils.lerp(0.05, -0.08, p);
        if (p >= 1) { phase = 2; t = 0; }
      } else if (phase === 2) {
        // Eyes open + stare
        const p = Math.min(t / 0.35, 1);
        setEyeOpen(p);
        headGroup.rotation.y = Math.sin(t * 8) * 0.02;
        if (p >= 1 && t > 0.45) { phase = 3; t = 0; }
      } else if (phase === 3) {
        // Violent head snap + scare
        const p = Math.min(t / 0.18, 1);
        headGroup.rotation.y = THREE.MathUtils.lerp(0, (Math.random() > 0.5 ? 1 : -1) * 0.55, p);
        headGroup.rotation.z = THREE.MathUtils.lerp(0, 0.22, p);
        headGroup.position.z = p * 0.06;
        if (t < dt * 2) {
          noiseBurst(state.lowIntensity ? 0.12 : 0.28, state.lowIntensity ? 0.06 : 0.18);
          playTone(90, 0.25, 'sawtooth', state.lowIntensity ? 0.04 : 0.09);
          playTone(38, 0.35, 'sine', state.lowIntensity ? 0.05 : 0.1);
          flashScreen(state.lowIntensity ? 0.35 : 0.85, 120);
          shake = state.lowIntensity ? 0.02 : 0.08;
        }
        if (p >= 1) { phase = 4; t = 0; }
      } else if (phase === 4) {
        // Vanish
        if (t < 0.12) { doll.visible = t % 0.04 < 0.02; }
        else { doll.visible = false; key.intensity = 0.0; rim.intensity = 0.0; phase = 5; t = 0; }
      } else if (phase === 5) {
        if (!messageShown && t > 0.2) {
          messageShown = true;
          showMessage('SHE WAS WAITING FOR YOU.', 'Welcome to the Warren Files. Enter if you dare. The museum awaits beyond the darkness.');
        }
        if (t > 3.8) { phase = 6; t = 0; }
      } else if (phase === 6) {
        // Reveal transition
        const p = Math.min(t / 2.2, 1);
        scene.fog.density = THREE.MathUtils.lerp(0.06, 0.035, p);
        key.intensity = THREE.MathUtils.lerp(0, 0.5, p);
        amb.intensity = THREE.MathUtils.lerp(0.15, 0.35, p);
        state.camera.position.lerpVectors(baseCam, new THREE.Vector3(0, 1.6, 5.5), p);
        state.camera.lookAt(0, 1.2, 0);
        if (p >= 1) { done = true; goMuseum(); }
      }

      // Idle micro movement when visible
      if (doll.visible && phase >= 1 && phase <= 3) {
        headGroup.position.y = 1.28 + Math.sin(performance.now() * 0.0015) * 0.004;
        doll.rotation.y = Math.sin(performance.now() * 0.0007) * 0.01;
      }
      // Shake
      if (shake > 0 && !state.reducedMotion) {
        state.camera.position.x = baseCam.x + (Math.random() - 0.5) * shake;
        state.camera.position.y = (phase >= 6 ? state.camera.position.y : 1.25) + (Math.random() - 0.5) * shake;
        shake *= 0.86;
        if (shake < 0.001) { shake = 0; state.camera.position.x = baseCam.x; }
      }
    },
    dispose() {
      scene.traverse(obj => { obj.geometry?.dispose?.(); if (Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose?.()); else obj.material?.dispose?.(); });
    }
  };
}
