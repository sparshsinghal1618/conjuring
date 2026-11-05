import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { createIntroScene } from './scenes3d/intro.js';
import { createMuseumScene } from './scenes3d/museum.js';
import { createCharacterHall } from './scenes3d/characters.js';
import { createMovieHub } from './scenes3d/movies.js';

const app = document.getElementById('app');
const gate = document.getElementById('gate');
const enterBtn = document.getElementById('enterBtn');
const skipIntroBtn = document.getElementById('skipIntroBtn');
const safeBtn = document.getElementById('safeBtn');
const reducedFx = document.getElementById('reducedFx');
const hud = document.getElementById('hud');
const crosshair = document.getElementById('crosshair');
const flash = document.getElementById('flash');
const message = document.getElementById('message');
const messageTitle = document.getElementById('messageTitle');
const messageBody = document.getElementById('messageBody');
const messageClose = document.getElementById('messageClose');
const skipScare = document.getElementById('skipScare');
const skipScareBtn = document.getElementById('skipScareBtn');

const state = {
  renderer: null, scene: null, camera: null, clock: new THREE.Clock(),
  active: null, quality: 'HIGH', lowIntensity: false, reducedMotion: false,
  audio: { ctx: null, master: null, enabled: false },
  input: { keys: {}, pointerLocked: false, yaw: 0, pitch: 0 },
  player: { pos: new THREE.Vector3(0, 1.7, 6), vel: new THREE.Vector3(), onGround: true },
};

function detectQuality() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mem = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;
  const mobile = /Mobi|Android/i.test(navigator.userAgent);
  if (mobile || mem <= 4 || cores <= 4) return 'MEDIUM';
  if (mem >= 8 && cores >= 8 && dpr >= 1.5) return 'HIGH';
  return 'MEDIUM';
}

function initRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: state.quality !== 'LOW', powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  const dprCap = state.quality === 'ULTRA' ? 2 : state.quality === 'HIGH' ? 1.75 : state.quality === 'MEDIUM' ? 1.25 : 1;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.shadowMap.enabled = state.quality !== 'LOW';
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  app.appendChild(renderer.domElement);
  state.renderer = renderer;
}

function ensureAudio() {
  if (state.audio.ctx) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = state.lowIntensity ? 0.35 : 0.6;
  master.connect(ctx.destination);
  state.audio.ctx = ctx;
  state.audio.master = master;
  state.audio.enabled = true;
}

function playTone(freq = 80, dur = 0.2, type = 'sine', gain = 0.2, when = 0) {
  if (!state.audio.enabled) return;
  const { ctx, master } = state.audio;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, ctx.currentTime + when);
  g.gain.exponentialRampToValueAtTime(gain, ctx.currentTime + when + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + when + dur);
  o.connect(g); g.connect(master);
  o.start(ctx.currentTime + when); o.stop(ctx.currentTime + when + dur + 0.02);
}

function noiseBurst(dur = 0.25, gain = 0.12, freq = 900, type = 'bandpass') {
  if (!state.audio.enabled) return;
  const { ctx, master } = state.audio;
  const bufferSize = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.7);
  const src = ctx.createBufferSource(); src.buffer = buffer;
  const g = ctx.createGain(); g.gain.setValueAtTime(gain, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
  src.connect(f); f.connect(g); g.connect(master);
  src.start();
}

export function scareHit(intensity = 1) {
  if (!state.audio.enabled) return;
  const k = state.lowIntensity ? 0.35 : 1;
  const i = intensity * k;
  playTone(42, 0.5, 'sine', 0.12 * i);
  playTone(78, 0.22, 'sawtooth', 0.07 * i);
  playTone(120, 0.14, 'square', 0.035 * i);
  noiseBurst(0.35, 0.16 * i, 700, 'bandpass');
  noiseBurst(0.18, 0.09 * i, 2200, 'highpass');
}

export function flashScreen(opacity = 0.9, ms = 90, color = '#ffffff') {
  if (state.reducedMotion) return;
  flash.style.background = color;
  flash.style.transition = 'none';
  flash.style.opacity = String(Math.min(1, opacity));
  requestAnimationFrame(() => {
    flash.style.transition = `opacity ${ms}ms ease-out`;
    flash.style.opacity = '0';
  });
}

export function showMessage(title, body) {
  messageTitle.textContent = title;
  messageBody.textContent = body;
  message.style.display = 'flex';
}
messageClose.addEventListener('click', () => message.style.display = 'none');

function setScene(factory, opts = {}) {
  if (state.active?.dispose) state.active.dispose();
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050203, opts.fog ?? 0.045);
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.copy(opts.cameraPos || new THREE.Vector3(0, 1.7, 6));
  state.scene = scene; state.camera = camera;
  state.active = factory({ THREE, state, playTone, noiseBurst, scareHit, flashScreen, showMessage, setScene, goMuseum, goCharacters, goMovies });
  hud.style.display = opts.hud ? 'flex' : 'none';
  crosshair.style.display = opts.crosshair ? 'block' : 'none';
  skipScare.style.display = opts.skipScare ? 'block' : 'none';
}

function goMuseum() { setScene(createMuseumScene, { hud: true, crosshair: true, fog: 0.035, cameraPos: new THREE.Vector3(0,1.7,7) }); }
function goCharacters() { setScene(createCharacterHall, { hud: true, fog: 0.03, cameraPos: new THREE.Vector3(0,1.7,8) }); }
function goMovies() { setScene(createMovieHub, { hud: true, fog: 0.03, cameraPos: new THREE.Vector3(0,1.7,9) }); }

function startExperience(skipIntro = false) {
  ensureAudio();
  gate.style.display = 'none';
  message.style.display = 'none';
  if (skipIntro || sessionStorage.getItem('warren_intro_seen') === '1') {
    goMuseum();
    showMessage('WELCOME TO THE WARREN FILES', 'Enter the Warren Occult Museum. Desktop: click the scene and use WASD + mouse. Mobile: use the HUD to navigate. Headphones recommended.');
  } else {
    sessionStorage.setItem('warren_intro_seen', '1');
    setScene(createIntroScene, { hud: false, crosshair: false, skipScare: true, fog: 0.08, cameraPos: new THREE.Vector3(0,1.35,4.2) });
  }
}

enterBtn.addEventListener('click', () => startExperience(false));
skipIntroBtn.addEventListener('click', () => startExperience(true));
skipScareBtn.addEventListener('click', () => { message.style.display = 'none'; goMuseum(); });
safeBtn.addEventListener('click', () => { state.lowIntensity = true; state.reducedMotion = true; reducedFx.checked = true; if (state.audio.master) state.audio.master.gain.value = 0.25; startExperience(true); });
reducedFx.addEventListener('change', () => { state.reducedMotion = reducedFx.checked; });

document.getElementById('hudMuseum').addEventListener('click', goMuseum);
document.getElementById('hudCharacters').addEventListener('click', goCharacters);
document.getElementById('hudMovies').addEventListener('click', goMovies);
document.getElementById('hudReplay').addEventListener('click', () => { sessionStorage.removeItem('warren_intro_seen'); startExperience(false); });
document.getElementById('hudSettings').addEventListener('click', () => {
  showMessage('SETTINGS', `Quality: ${state.quality}. Low-intensity: ${state.lowIntensity ? 'On' : 'Off'}. Reduced motion: ${state.reducedMotion ? 'On' : 'Off'}. For performance, reload and choose Low-Intensity Mode on slower devices.`);
});

window.addEventListener('keydown', (e) => { state.input.keys[e.code] = true; if (e.code === 'Escape') document.exitPointerLock?.(); });
window.addEventListener('keyup', (e) => { state.input.keys[e.code] = false; });
window.addEventListener('mousemove', (e) => {
  if (!state.input.pointerLocked || !state.active?.firstPerson) return;
  const s = 0.0022;
  state.input.yaw -= e.movementX * s;
  state.input.pitch -= e.movementY * s;
  state.input.pitch = Math.max(-1.2, Math.min(1.2, state.input.pitch));
});
document.addEventListener('pointerlockchange', () => { state.input.pointerLocked = document.pointerLockElement === state.renderer?.domElement; });
app.addEventListener('click', () => { if (state.active?.firstPerson && state.renderer && !state.input.pointerLocked) state.renderer.domElement.requestPointerLock?.(); });

window.addEventListener('resize', () => {
  if (!state.renderer || !state.camera) return;
  state.camera.aspect = window.innerWidth / window.innerHeight;
  state.camera.updateProjectionMatrix();
  state.renderer.setSize(window.innerWidth, window.innerHeight);
});

function updateFirstPerson(dt) {
  if (!state.active?.firstPerson || !state.camera) return;
  const speed = (state.input.keys['ShiftLeft'] ? 4.2 : 2.6);
  const dir = new THREE.Vector3();
  if (state.input.keys['KeyW']) dir.z -= 1;
  if (state.input.keys['KeyS']) dir.z += 1;
  if (state.input.keys['KeyA']) dir.x -= 1;
  if (state.input.keys['KeyD']) dir.x += 1;
  if (dir.lengthSq() > 0) dir.normalize();
  const yaw = state.input.yaw;
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw) * -1).normalize();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0,1,0)).normalize().multiplyScalar(-1);
  state.player.pos.addScaledVector(forward, -dir.z * speed * dt);
  state.player.pos.addScaledVector(right, dir.x * speed * dt);
  // bounds
  state.player.pos.x = Math.max(-9, Math.min(9, state.player.pos.x));
  state.player.pos.z = Math.max(-9, Math.min(9, state.player.pos.z));
  state.camera.position.set(state.player.pos.x, 1.7, state.player.pos.z);
  state.camera.rotation.order = 'YXZ';
  state.camera.rotation.y = yaw;
  state.camera.rotation.x = state.input.pitch;
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(state.clock.getDelta(), 0.05);
  if (state.active?.update) state.active.update(dt);
  updateFirstPerson(dt);
  if (state.renderer && state.scene && state.camera) state.renderer.render(state.scene, state.camera);
}

state.quality = detectQuality();
state.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
if (state.reducedMotion) reducedFx.checked = true;
initRenderer();
animate();
