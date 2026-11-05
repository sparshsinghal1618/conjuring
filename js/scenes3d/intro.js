export function createIntroScene({ THREE, state, playTone, noiseBurst, scareHit, flashScreen, showMessage, goMuseum }) {
  const scene = state.scene;
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.09);

  const amb = new THREE.AmbientLight(0x120606, 0.02);
  scene.add(amb);
  const key = new THREE.SpotLight(0xfff0dd, 0, 10, Math.PI / 5, 0.7, 1.1);
  key.position.set(0.6, 2.4, 3.2); key.target.position.set(0, 1.25, 0);
  scene.add(key); scene.add(key.target);
  const red = new THREE.PointLight(0xff1a1a, 0, 7, 2);
  red.position.set(0, 0.9, 2.2); scene.add(red);
  const rim = new THREE.PointLight(0x330000, 0, 5); rim.position.set(-1.4, 1.4, -1.2); scene.add(rim);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshStandardMaterial({ color: 0x020101, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);

  // Procedural 3D Annabelle-style doll (stylized but animated)
  const doll = new THREE.Group();
  doll.visible = false;
  doll.position.set(0, -0.15, 1.2);
  doll.scale.setScalar(1.75);
  scene.add(doll);

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
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.225, 28, 22), skin);
  head.scale.set(0.94, 1.06, 0.92); headGroup.add(head);

  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.23, 22, 16, 0, Math.PI*2, 0, Math.PI*0.64), hairMat);
  hair.position.y = 0.03; hair.scale.set(0.985, 1, 0.965); headGroup.add(hair);
  for (let i = 0; i < 12; i++) {
    const s = new THREE.Mesh(new THREE.CapsuleGeometry(0.017, 0.24, 4, 8), hairMat);
    const a = (i/12)*Math.PI*2;
    s.position.set(Math.cos(a)*0.175, -0.06, Math.sin(a)*0.145);
    s.rotation.z = Math.cos(a)*0.38; s.rotation.x = Math.sin(a)*0.22;
    headGroup.add(s);
  }

  const browL = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.012, 0.02), hairMat);
  browL.position.set(-0.066, 0.085, 0.19); browL.rotation.z = 0.22; headGroup.add(browL);
  const browR = browL.clone(); browR.position.x = 0.066; browR.rotation.z = -0.22; headGroup.add(browR);

  function makeEye(x) {
    const g = new THREE.Group(); g.position.set(x, 0.03, 0.192);
    const w = new THREE.Mesh(new THREE.SphereGeometry(0.042, 14, 12), eyeWhiteMat); w.scale.z = 0.45; g.add(w);
    const iris = new THREE.Mesh(new THREE.CircleGeometry(0.02, 18), eyeGlow); iris.position.z = 0.02; g.add(iris);
    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.009, 14), pupilMat); pupil.position.z = 0.0215; g.add(pupil);
    const lidTop = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10, 0, Math.PI*2, 0, Math.PI/2), skin);
    lidTop.scale.set(1, 0.22, 0.55); lidTop.position.set(0, 0.016, 0.002); lidTop.rotation.x = Math.PI; g.add(lidTop);
    const lidBot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 10, 0, Math.PI*2, 0, Math.PI/2), skin);
    lidBot.scale.set(1, 0.12, 0.55); lidBot.position.set(0, -0.016, 0.002); g.add(lidBot);
    g.userData = { lidTop, lidBot, iris, pupil };
    return g;
  }
  const leftEye = makeEye(-0.066), rightEye = makeEye(0.066);
  headGroup.add(leftEye); headGroup.add(rightEye);

  const mouthGroup = new THREE.Group(); mouthGroup.position.set(0, -0.078, 0.186); headGroup.add(mouthGroup);
  const lips = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.009, 8, 18, Math.PI*2), lipMat); lips.rotation.x = Math.PI/2; mouthGroup.add(lips);
  const mouthHole = new THREE.Mesh(new THREE.CircleGeometry(0.028, 16), mouthVoid); mouthHole.position.z = 0.004; mouthHole.scale.y = 0.15; mouthGroup.add(mouthHole);

  function makeArm(side) {
    const g = new THREE.Group(); g.position.set(side*0.29, 0.9, 0);
    const u = new THREE.Mesh(new THREE.CapsuleGeometry(0.046, 0.23, 4, 8), dress); u.position.y = -0.115; g.add(u);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 8), skin); h.position.y = -0.275; g.add(h);
    g.rotation.z = side*0.22; return g;
  }
  const armL = makeArm(-1), armR = makeArm(1); doll.add(armL); doll.add(armR);
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.052, 0.23, 4, 8), dress); legL.position.set(-0.095,0.18,0); doll.add(legL);
  const legR = legL.clone(); legR.position.x = 0.095; doll.add(legR);

  state.camera.position.set(0, 1.35, 4.2);
  state.camera.fov = 55;
  state.camera.updateProjectionMatrix();
  state.camera.lookAt(0, 1.25, 0);
  const camBase = state.camera.position.clone();

  let t = 0, phase = 0, shake = 0, done = false, messageShown = false, heartbeatN = 0;
  function setEyeOpen(v) {
    [leftEye, rightEye].forEach(e => {
      e.userData.lidTop.scale.y = 0.22 + (1-v)*1.0;
      e.userData.lidTop.position.y = 0.016 + (1-v)*0.034;
      e.userData.lidBot.scale.y = 0.12 + (1-v)*0.25;
      e.userData.iris.material = v > 0.5 ? eyeGlow : new THREE.MeshBasicMaterial({ color: 0x2a4d6e });
    });
  }
  function setMouthOpen(v) { mouthHole.scale.set(1 + v*0.35, 0.15 + v*1.25, 1); lips.scale.set(1 + v*0.12, 1, 1 + v*0.5); }

  setEyeOpen(0); setMouthOpen(0);

  return {
    firstPerson: false,
    update(dt) {
      if (done) return;
      t += dt;
      // Phase 0: black void + heartbeat/breath
      if (phase === 0) {
        if (t > 0.6 + heartbeatN * 0.72 && heartbeatN < 4) {
          const k = state.lowIntensity ? 0.45 : 1;
          playTone(48, 0.12, 'sine', 0.05 * k);
          playTone(42, 0.18, 'sine', 0.04 * k, 0.12);
          heartbeatN++;
        }
        if (t > 1.4 && t < 1.42) noiseBurst(0.9, state.lowIntensity ? 0.015 : 0.03, 180, 'lowpass');
        if (t > 3.15) { phase = 1; t = 0; doll.visible = true; key.intensity = 0.0; red.intensity = 0.0; }
      }
      // Phase 1: faint reveal in distance
      else if (phase === 1) {
        const p = Math.min(t / 1.1, 1);
        key.intensity = p * 0.55;
        rim.intensity = p * 0.35;
        doll.position.z = 1.2 - p * 0.15;
        headGroup.rotation.y = Math.sin(t*1.3) * 0.08;
        if (t > 0.2 && t < 0.22) playTone(62, 0.6, 'triangle', state.lowIntensity ? 0.015 : 0.03);
        if (p >= 1) { phase = 2; t = 0; }
      }
      // Phase 2: SNAP LUNGE into camera
      else if (phase === 2) {
        const p = Math.min(t / 0.22, 1);
        const e = 1 - Math.pow(1 - p, 4);
        doll.position.z = THREE.MathUtils.lerp(1.05, 3.55, e);
        doll.position.y = THREE.MathUtils.lerp(-0.15, -0.05, e);
        headGroup.rotation.x = THREE.MathUtils.lerp(0.0, -0.12, e);
        state.camera.fov = THREE.MathUtils.lerp(55, 42, e);
        state.camera.updateProjectionMatrix();
        key.intensity = 3.8; red.intensity = 2.2; rim.intensity = 1.4;
        if (t < dt * 2) {
          scareHit(1.25);
          flashScreen(state.lowIntensity ? 0.3 : 0.75, 70, '#fff5f5');
          setTimeout(() => flashScreen(state.lowIntensity ? 0.18 : 0.45, 140, '#8b0000'), 60);
          shake = state.lowIntensity ? 0.03 : 0.14;
        }
        if (p >= 1) { phase = 3; t = 0; setEyeOpen(1); setMouthOpen(1); }
      }
      // Phase 3: face horror hold (eyes wide, mouth open, twitch)
      else if (phase === 3) {
        const jit = state.reducedMotion ? 0 : 1;
        headGroup.rotation.z = (Math.random()-0.5) * 0.18 * jit;
        headGroup.rotation.y = (Math.random()-0.5) * 0.22 * jit;
        headGroup.position.z = 0.02 + Math.random()*0.03 * jit;
        doll.position.z = 3.55 + Math.sin(t*40)*0.015 * jit;
        eyeWhiteMat.emissive.setHex(t % 0.12 < 0.06 ? 0x221111 : 0x050505);
        if (t < 0.05) { scareHit(0.6); }
        if (t > 0.22 && t < 0.24) { flashScreen(state.lowIntensity ? 0.15 : 0.35, 90, '#ffffff'); shake = Math.max(shake, state.lowIntensity ? 0.015 : 0.06); }
        if (t > 0.72) { phase = 4; t = 0; }
      }
      // Phase 4: stutter vanish
      else if (phase === 4) {
        if (t < 0.22) {
          const on = (t % 0.055) < 0.028;
          doll.visible = on;
          key.intensity = on ? 2.5 : 0;
          red.intensity = on ? 1.2 : 0;
          if (t < dt*2) noiseBurst(0.18, state.lowIntensity ? 0.04 : 0.09, 1200, 'highpass');
        } else {
          doll.visible = false; key.intensity = 0; red.intensity = 0; rim.intensity = 0;
          phase = 5; t = 0;
        }
      }
      // Phase 5: message
      else if (phase === 5) {
        if (!messageShown && t > 0.35) {
          messageShown = true;
          showMessage('SHE WAS WAITING FOR YOU.', 'The Warren Files are open. Enter the museum if you dare.');
        }
        if (t > 2.8) { phase = 6; t = 0; }
      }
      // Phase 6: reveal museum
      else if (phase === 6) {
        const p = Math.min(t / 1.6, 1);
        scene.fog.density = THREE.MathUtils.lerp(0.09, 0.035, p);
        amb.intensity = THREE.MathUtils.lerp(0.02, 0.22, p);
        state.camera.fov = THREE.MathUtils.lerp(42, 60, p);
        state.camera.updateProjectionMatrix();
        state.camera.position.lerpVectors(new THREE.Vector3(0,1.35,4.2), new THREE.Vector3(0,1.6,5.8), p);
        state.camera.lookAt(0,1.2,0);
        if (p >= 1) { done = true; goMuseum(); }
      }

      // Idle creep when visible pre-lunge
      if (doll.visible && phase === 1) {
        headGroup.position.y = 1.29 + Math.sin(performance.now()*0.002)*0.003;
      }
      // Camera shake
      if (shake > 0 && !state.reducedMotion) {
        state.camera.position.x = camBase.x + (Math.random()-0.5) * shake;
        state.camera.position.y = (phase >= 6 ? state.camera.position.y : 1.35) + (Math.random()-0.5) * shake * 0.8;
        state.camera.position.z = (phase >= 6 ? state.camera.position.z : 4.2) + (Math.random()-0.5) * shake * 0.4;
        shake *= 0.84;
        if (shake < 0.001) shake = 0;
      }
    },
    dispose() {
      scene.traverse(obj => { obj.geometry?.dispose?.(); if (Array.isArray(obj.material)) obj.material.forEach(m=>m.dispose?.()); else obj.material?.dispose?.(); });
    }
  };
}
