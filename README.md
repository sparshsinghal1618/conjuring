# The Warren Files — Conjuring Universe 3D Experience

A real-time, browser-based **3D horror experience** (Three.js, no build step required) inspired by *The Conjuring Universe*. It includes a cinematic Annabelle intro jump scare, an explorable first-person Warren Occult Museum, a 3D character hall, and a movie-world hub.

## What’s implemented
- **Intro jump scare (real 3D):** black-screen lead-in, synthesized breathing/sting audio (after user interaction), a procedural animated 3D Annabelle-style doll that lunges toward the camera, eye-open/head-snap animation, screen flash/shake (respects reduced-motion/low-intensity), “SHE WAS WAITING FOR YOU” reveal, and museum transition. Plays once per session by default; **Skip Intro**, **Replay Intro**, and **Low-Intensity Mode** included.
- **Warren Occult Museum (first-person 3D):** explorable room (WASD + mouse look), lighting/fog/dust particles, display cases, and an animated Annabelle cabinet centerpiece with scripted idle/flicker events.
- **3D Character Hall:** real-time 3D stylized character presentations (Annabelle, Ed/Lorraine/Judy Warren, Valak-inspired figure) with idle animation and camera choreography.
- **3D Movie Worlds hub:** stylized 3D vignettes/portals for major film settings (Perron farmhouse, Enfield, investigations, Annabelle trilogy, monastery).
- **Performance/safety controls:** quality detection hooks, low-intensity mode, reduced-motion/flash support, audio gated behind interaction.

## Running
Open `index.html` via a local web server (ES modules require HTTP). Example:
```bash
# Python
python -m http.server 8080
# then visit http://localhost:8080
```

## Tech
- Three.js (ES modules via CDN)
- WebGL, Web Audio API (synthesized cues), pointer lock for first-person controls

## Asset pipeline (important)
This repo ships a **working real-time 3D framework with procedural/stylized models** so it runs without external copyrighted assets. For the “ultimate” photoreal version described in the brief, integrate **properly licensed/original GLB/GLTF** assets:
- Character rigs/animations (skeletal + morph targets) via `GLTFLoader` + `AnimationMixer`
- High-detail environments (PBR textures, baked/real-time lighting)
- Licensed audio/spatial SFX

The scene architecture (`js/experience.js`, `js/scenes3d/*`) is modular to support swapping procedural models for production GLB assets, LODs, and per-movie explorable levels.

## Notes
Fan-made experience inspired by *The Conjuring Universe*. Not affiliated with Warner Bros. or New Line Cinema. Use only original or properly licensed assets for any public/production deployment.
