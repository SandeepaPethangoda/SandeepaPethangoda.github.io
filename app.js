/* ═══════════════════════════════════════════════════════════════
   SANDEEPA PETHANGODA — Portfolio JavaScript
   Three.js 3D · Scroll choreography · Micro-interactions
   ═══════════════════════════════════════════════════════════════ */

'use strict';

// ─── Global state ───
const state = {
  scrollY: 0,
  scrollProgress: 0,
  mouseX: 0,
  mouseY: 0,
  heroScene: null,
  contactScene: null,
  projectScenes: [],
  reducedMotion: false,
  isMobile: false,
};

// ─── Check preferences ───
state.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
state.isMobile = window.innerWidth <= 768;

// ═══════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function map(v, a, b, c, d) { return c + ((v - a) / (b - a)) * (d - c); }
function degToRad(d) { return d * (Math.PI / 180); }

// ═══════════════════════════════════════════════
// CUSTOM CURSOR
// ═══════════════════════════════════════════════
function initCursor() {
  if (state.isMobile || state.reducedMotion) return;

  const cursor = document.getElementById('cursor');
  const ring = cursor?.querySelector('.cursor-ring');
  const dot = cursor?.querySelector('.cursor-dot');
  if (!cursor || !ring || !dot) return;

  let cx = 0, cy = 0;
  let tx = 0, ty = 0;

  document.addEventListener('mousemove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    dot.style.left = tx + 'px';
    dot.style.top  = ty + 'px';
    state.mouseX = (e.clientX / window.innerWidth) - 0.5;
    state.mouseY = (e.clientY / window.innerHeight) - 0.5;
  });

  // Smooth ring follow
  function animateCursor() {
    cx = lerp(cx, tx, 0.12);
    cy = lerp(cy, ty, 0.12);
    ring.style.left = cx + 'px';
    ring.style.top  = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover state
  document.querySelectorAll('a, button, .skill-tag, .tech-tag, .pipeline-node').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}

// ═══════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════
function initNav() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const overlay = document.getElementById('navOverlay');
  const navStateLabel = document.getElementById('navStateLabel');
  const navLinks = document.querySelectorAll('.nav-link');
  const overlayLinks = document.querySelectorAll('.nav-overlay-link');

  const sectionNames = {
    hero: 'HERO',
    about: 'ABOUT',
    systems: 'SYSTEMS',
    projects: 'PROJECTS',
    experience: 'EXPERIENCE',
    contact: 'CONTACT',
  };

  // Scroll behavior
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    // Update active nav link
    const sections = ['hero', 'about', 'systems', 'projects', 'experience', 'contact'];
    let current = 'hero';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) current = id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });

    if (navStateLabel) {
      navStateLabel.textContent = sectionNames[current] || 'OBSERVING';
    }
  }, { passive: true });

  // Mobile toggle
  if (toggle && overlay) {
    toggle.addEventListener('click', () => {
      const isOpen = overlay.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on overlay link click
    overlayLinks.forEach(link => {
      link.addEventListener('click', () => {
        overlay.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }
}

// ═══════════════════════════════════════════════
// HERO 3D SCENE
// ═══════════════════════════════════════════════
function initHeroScene() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = canvas.clientWidth;
  const H = canvas.clientHeight;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !state.isMobile,
    alpha: false,
  });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, state.isMobile ? 1 : 1.5));
  renderer.setClearColor(0x283618, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
  camera.position.set(0, 0, 8);

  // Colors
  const COL_BRASS   = new THREE.Color(0xdda15e);
  const COL_COPPER  = new THREE.Color(0xbc6c25);
  const COL_OLIVE   = new THREE.Color(0x606c38);
  const COL_PARCH   = new THREE.Color(0xfefae0);

  // ─── Lighting ───
  const ambient = new THREE.AmbientLight(0xfefae0, 0.3);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xdda15e, 1.2);
  dirLight.position.set(4, 6, 3);
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(0x606c38, 0.6);
  rimLight.position.set(-4, -2, -3);
  scene.add(rimLight);

  const pointLight = new THREE.PointLight(0xbc6c25, 0.8, 20);
  pointLight.position.set(0, 0, 4);
  scene.add(pointLight);

  // ─── Materials ───
  const brassMat = new THREE.MeshStandardMaterial({
    color: COL_BRASS,
    metalness: 0.7,
    roughness: 0.4,
  });
  const copperMat = new THREE.MeshStandardMaterial({
    color: COL_COPPER,
    metalness: 0.8,
    roughness: 0.35,
  });
  const oliveMat = new THREE.MeshStandardMaterial({
    color: COL_OLIVE,
    metalness: 0.3,
    roughness: 0.7,
  });
  const wireMat = new THREE.MeshBasicMaterial({
    color: COL_BRASS,
    wireframe: true,
    opacity: 0.15,
    transparent: true,
  });
  const edgeMat = new THREE.LineBasicMaterial({
    color: COL_BRASS,
    opacity: 0.4,
    transparent: true,
  });

  // ─── Central structure: Rotating rings ───
  const systemGroup = new THREE.Group();
  scene.add(systemGroup);

  // Outer ring
  const ring1Geo = new THREE.TorusGeometry(2.8, 0.04, 8, 64);
  const ring1 = new THREE.Mesh(ring1Geo, brassMat.clone());
  ring1.rotation.x = degToRad(70);
  systemGroup.add(ring1);

  // Middle ring
  const ring2Geo = new THREE.TorusGeometry(2.0, 0.035, 8, 64);
  const ring2 = new THREE.Mesh(ring2Geo, copperMat.clone());
  ring2.rotation.x = degToRad(30);
  ring2.rotation.z = degToRad(40);
  systemGroup.add(ring2);

  // Inner ring
  const ring3Geo = new THREE.TorusGeometry(1.3, 0.03, 6, 48);
  const ring3 = new THREE.Mesh(ring3Geo, oliveMat.clone());
  ring3.rotation.y = degToRad(60);
  systemGroup.add(ring3);

  // ─── Central nucleus ───
  const nucleusGeo = new THREE.OctahedronGeometry(0.35, 1);
  const nucleus = new THREE.Mesh(nucleusGeo, brassMat);
  systemGroup.add(nucleus);

  // ─── Orbital nodes ───
  const orbitPositions = [
    { r: 2.8, angle: 0,   ring: ring1 },
    { r: 2.8, angle: 120, ring: ring1 },
    { r: 2.8, angle: 240, ring: ring1 },
    { r: 2.0, angle: 60,  ring: ring2 },
    { r: 2.0, angle: 180, ring: ring2 },
    { r: 1.3, angle: 90,  ring: ring3 },
  ];

  const orbitNodes = [];
  orbitPositions.forEach(({ r, angle }) => {
    const geo = new THREE.OctahedronGeometry(0.08, 0);
    const mesh = new THREE.Mesh(geo, copperMat.clone());
    mesh.userData = { r, angle: degToRad(angle), baseAngle: degToRad(angle) };
    systemGroup.add(mesh);
    orbitNodes.push(mesh);
  });

  // ─── Satellite structures ───
  const satelliteGroup = new THREE.Group();
  systemGroup.add(satelliteGroup);

  // Small geometric forms floating around
  const satData = [
    { geo: new THREE.TetrahedronGeometry(0.2, 0),    pos: [3.2, 0.8, 0.5],   mat: copperMat.clone() },
    { geo: new THREE.BoxGeometry(0.18, 0.18, 0.18),  pos: [-3.0, -0.5, 0.3], mat: brassMat.clone() },
    { geo: new THREE.IcosahedronGeometry(0.15, 0),   pos: [0.5, 2.8, 0.8],   mat: oliveMat.clone() },
    { geo: new THREE.TetrahedronGeometry(0.14, 0),   pos: [-1.0, -2.5, 0.4], mat: copperMat.clone() },
    { geo: new THREE.OctahedronGeometry(0.12, 0),    pos: [2.0, -2.0, -0.5], mat: brassMat.clone() },
    { geo: new THREE.TetrahedronGeometry(0.1, 0),    pos: [-2.5, 1.5, -0.3], mat: oliveMat.clone() },
  ];

  const satellites = [];
  satData.forEach(({ geo, pos, mat }) => {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...pos);
    mesh.userData.basePos = [...pos];
    mesh.userData.floatOffset = Math.random() * Math.PI * 2;
    satelliteGroup.add(mesh);
    satellites.push(mesh);
  });

  // ─── Connection lines between nodes ───
  function makeLine(p1, p2) {
    const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
    return new THREE.Line(geo, edgeMat.clone());
  }

  // Spoke lines from nucleus
  const spokeLines = [];
  orbitNodes.forEach(node => {
    const line = makeLine(new THREE.Vector3(0, 0, 0), node.position.clone());
    systemGroup.add(line);
    spokeLines.push(line);
  });

  // ─── Camera lerp target ───
  let camTx = 0, camTy = 0;

  // ─── Scroll-driven camera ───
  function getScrollProgress() {
    const heroH = document.getElementById('hero')?.offsetHeight || window.innerHeight;
    return clamp(window.scrollY / heroH, 0, 1);
  }

  // ─── Animate ───
  let t = 0;
  let animId;

  function animate() {
    animId = requestAnimationFrame(animate);
    t += state.reducedMotion ? 0 : 0.004;

    const sp = getScrollProgress();

    // Slow deliberate rotations
    systemGroup.rotation.y = t * 0.12 + sp * 0.6;
    systemGroup.rotation.x = Math.sin(t * 0.05) * 0.12 + sp * 0.2;

    ring1.rotation.z = t * 0.15;
    ring2.rotation.z = -t * 0.1;
    ring3.rotation.x = t * 0.2;

    nucleus.rotation.y = t * 0.8;
    nucleus.rotation.x = t * 0.5;

    // Orbital nodes move along rings (simplified)
    orbitNodes.forEach((node, i) => {
      const angle = node.userData.baseAngle + t * (0.08 + i * 0.01);
      const r = node.userData.r;
      node.position.x = Math.cos(angle) * r;
      node.position.z = Math.sin(angle) * r * 0.3; // flatten slightly

      // Update spoke line
      if (spokeLines[i]) {
        const pos = spokeLines[i].geometry.attributes.position;
        pos.setXYZ(1, node.position.x, node.position.y, node.position.z);
        pos.needsUpdate = true;
      }
    });

    // Satellites float
    satellites.forEach((sat, i) => {
      const fo = sat.userData.floatOffset;
      sat.position.y = sat.userData.basePos[1] + Math.sin(t * 0.3 + fo) * 0.15;
      sat.rotation.y += 0.005;
      sat.rotation.x += 0.003;
    });

    // Camera follows mouse subtly
    camTx = lerp(camTx, state.mouseX * 1.5, 0.03);
    camTy = lerp(camTy, state.mouseY * -1.0, 0.03);

    camera.position.x = camTx;
    camera.position.y = camTy + lerp(0, -1.5, sp);
    camera.position.z = lerp(8, 12, sp);
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  animate();

  // Resize
  window.addEventListener('resize', () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }, { passive: true });

  // Stop rendering when hero not visible
  const heroEl = document.getElementById('hero');
  if (heroEl && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        cancelAnimationFrame(animId);
      } else {
        animate();
      }
    }, { threshold: 0.01 });
    obs.observe(heroEl);
  }

  state.heroScene = { renderer, scene, camera };
}

// PROJECT MINI-SCENES — removed: projects are now image-centric.
// Kept as no-op so hero + contact 3D stay, but no per-project WebGL cost.
function initProjectScenes() {
  return;
}


// ═══════════════════════════════════════════════
// CONTACT SCENE
// ═══════════════════════════════════════════════
function initContactScene() {
  const canvas = document.getElementById('contactCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  const dir = new THREE.DirectionalLight(0xdda15e, 1);
  dir.position.set(2, 3, 2);
  scene.add(dir);

  const mat = new THREE.MeshStandardMaterial({
    color: 0xdda15e,
    metalness: 0.8,
    roughness: 0.3,
    transparent: true,
    opacity: 0.7,
  });
  const wireMat = new THREE.LineBasicMaterial({ color: 0xdda15e, opacity: 0.2, transparent: true });

  const group = new THREE.Group();
  scene.add(group);

  // Equilibrium: nested rings
  for (let i = 0; i < 4; i++) {
    const r = 1.0 + i * 0.6;
    const geo = new THREE.TorusGeometry(r, 0.025, 6, 60);
    const m = new THREE.Mesh(geo, mat.clone());
    m.rotation.x = degToRad(60 + i * 15);
    m.rotation.z = degToRad(i * 25);
    group.add(m);
  }

  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 2), mat.clone());
  group.add(core);

  // Stable orbit
  let t = 0;
  let animId;

  function resize() {
    const parent = canvas.parentElement;
    const w = parent.offsetWidth;
    const h = parent.offsetHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();

  function animate() {
    animId = requestAnimationFrame(animate);
    if (!state.reducedMotion) {
      t += 0.003; // Slower — equilibrium
      group.rotation.y = t * 0.15;
      group.rotation.x = Math.sin(t * 0.08) * 0.06;
      core.rotation.y = t * 0.5;
    }
    renderer.render(scene, camera);
  }

  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { resize(); animate(); }
    else cancelAnimationFrame(animId);
  }, { threshold: 0.1 });
  obs.observe(canvas.parentElement);

  window.addEventListener('resize', () => { resize(); }, { passive: true });
}

// ═══════════════════════════════════════════════
// SCROLL ANIMATIONS (IntersectionObserver)
// ═══════════════════════════════════════════════
function initScrollAnimations() {
  // Project artifacts reveal
  const artObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.project-artifact').forEach((el, i) => {
    el.style.transitionDelay = '0ms';
    artObs.observe(el);
  });

  // Timeline items reveal
  const tlObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.timeline-item').forEach((el, i) => {
    el.style.transitionDelay = `${i * 80}ms`;
    tlObs.observe(el);
  });

  // Pipeline nodes animate in
  const pipeObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const nodes = entry.target.querySelectorAll('.pipeline-node');
        nodes.forEach((node, i) => {
          setTimeout(() => node.classList.add('active'), i * 120);
        });
      }
    });
  }, { threshold: 0.4 });

  const pipeline = document.querySelector('.pipeline');
  if (pipeline) pipeObs.observe(pipeline);

  // Section interlude quotes fade in
  const quoteObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('.section-interlude, .interlude-statement').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    quoteObs.observe(el);
  });
}

// ═══════════════════════════════════════════════
// PIPELINE ANIMATION
// ═══════════════════════════════════════════════
function initPipelineAnimation() {
  const nodes = document.querySelectorAll('.pipeline-node');

  // Reset — remove active from all
  nodes.forEach(n => n.classList.remove('active'));

  // Sequential activation on scroll into view
  let activated = false;

  const obs = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !activated) {
      activated = true;
      nodes.forEach((node, i) => {
        setTimeout(() => {
          nodes.forEach(n => n.classList.remove('active'));
          node.classList.add('active');
          if (i === nodes.length - 1) {
            setTimeout(() => nodes.forEach(n => n.classList.add('active')), 400);
          }
        }, i * 300);
      });
    }
  }, { threshold: 0.5 });

  const pipeline = document.querySelector('.pipeline');
  if (pipeline) obs.observe(pipeline);
}

// ═══════════════════════════════════════════════
// SKILL TAGS INTERACTION
// ═══════════════════════════════════════════════
function initSkillInteractions() {
  document.querySelectorAll('.skill-tag').forEach(tag => {
    tag.addEventListener('mouseenter', function () {
      // Subtle glow on hover — CSS handles the rest
      this.style.transform = 'translateY(-1px)';
    });
    tag.addEventListener('mouseleave', function () {
      this.style.transform = '';
    });
  });
}

// ═══════════════════════════════════════════════
// ROBOT SCENE — geometric "Auron Unit", centred and large,
// gazing at the cursor. Foreground layer above the hero rings;
// a cursor-following blob punches a window through it
// (see initBlobReveal), revealing the art layer behind.
// ═══════════════════════════════════════════════
function initRobotScene() {
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('robotCanvas');
  if (!hero || !canvas || typeof THREE === 'undefined') {
    if (hero) hero.classList.add('no-robot');
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (err) {
    hero.classList.add('no-robot');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const CAM_Z = 7;
  camera.position.set(0, 0, CAM_Z);
  camera.lookAt(0, -0.1, 0);

  scene.add(new THREE.HemisphereLight(0xfefae0, 0x283618, 0.85));
  const key = new THREE.DirectionalLight(0xffe9c4, 1.35);
  key.position.set(3, 4, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xdda15e, 0.8);
  rim.position.set(-4, 2, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0x606c38, 0.4);
  fill.position.set(-2, -1, 4);
  scene.add(fill);

  const MAT = {
    brass:  new THREE.MeshStandardMaterial({ color: 0xdda15e, metalness: 0.75, roughness: 0.32 }),
    copper: new THREE.MeshStandardMaterial({ color: 0xbc6c25, metalness: 0.8,  roughness: 0.3 }),
    olive:  new THREE.MeshStandardMaterial({ color: 0x606c38, metalness: 0.35, roughness: 0.6 }),
    parch:  new THREE.MeshStandardMaterial({ color: 0xfefae0, metalness: 0.15, roughness: 0.55 }),
    dark:   new THREE.MeshStandardMaterial({ color: 0x1c2412, metalness: 0.45, roughness: 0.55 }),
    glow:   new THREE.MeshBasicMaterial({ color: 0xffd9a0 }),
  };

  // Rig: gaze rotates this group; the unit is centred inside it.
  const rig = new THREE.Group();
  scene.add(rig);
  const rigBaseY = -0.15;
  rig.position.set(0, rigBaseY, 0);

  const unit = new THREE.Group();
  rig.add(unit);

  // ─── Torso: tapered olive shell ───
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 1.3, 40), MAT.olive);
  unit.add(torso);
  // Parchment inlay strips
  [-1, 1].forEach(side => {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.9, 0.06), MAT.parch);
    strip.position.set(side * 0.42, 0, 0.52);
    strip.rotation.y = side * -0.35;
    unit.add(strip);
  });
  // Chest emblem: copper ring + glowing core
  const chestRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 12, 40), MAT.copper);
  chestRing.position.set(0, 0.22, 0.62);
  unit.add(chestRing);
  const chestCore = new THREE.Mesh(new THREE.CircleGeometry(0.14, 32), MAT.glow);
  chestCore.position.set(0, 0.22, 0.625);
  unit.add(chestCore);
  // Waist belt
  const belt = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.05, 12, 48), MAT.copper);
  belt.position.y = -0.68;
  belt.rotation.x = Math.PI / 2;
  unit.add(belt);
  const waist = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.45, 0.3, 32), MAT.dark);
  waist.position.y = -0.85;
  unit.add(waist);

  // ─── Arms ───
  const arms = [];
  [-1, 1].forEach(side => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.72, 0.42, 0);
    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 18), MAT.brass);
    arm.add(shoulder);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.55, 20), MAT.copper);
    upper.position.y = -0.36;
    arm.add(upper);
    const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.5, 20), MAT.olive);
    fore.position.y = -0.85;
    arm.add(fore);
    const claw = new THREE.Mesh(new THREE.SphereGeometry(0.12, 18, 14), MAT.dark);
    claw.position.y = -1.18;
    claw.scale.set(1, 0.8, 1);
    arm.add(claw);
    arm.rotation.z = side * 0.14;
    unit.add(arm);
    arms.push(arm);
  });

  // ─── Neck + head (gaze group) ───
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 12, 32), MAT.brass);
  collar.position.y = 0.72;
  collar.rotation.x = Math.PI / 2;
  unit.add(collar);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 20), MAT.dark);
  neck.position.y = 0.78;
  unit.add(neck);

  const head = new THREE.Group();
  head.position.y = 1.32;
  unit.add(head);
  // Brass dome
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.52, 48, 32), MAT.brass);
  skull.scale.set(1, 0.92, 0.95);
  head.add(skull);
  // Dark visor band across the face
  const visor = new THREE.Mesh(new THREE.SphereGeometry(0.47, 48, 24, -Math.PI / 3.2, Math.PI / 1.6, Math.PI / 3.4, Math.PI / 4.2), MAT.dark);
  visor.position.z = 0.05;
  head.add(visor);
  // Glowing eyes on the visor
  const pupils = [];
  [-1, 1].forEach(side => {
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.06, 18, 14), MAT.glow.clone());
    pupil.position.set(side * 0.18, 0.02, 0.47);
    pupil.userData.base = pupil.position.clone();
    head.add(pupil);
    pupils.push(pupil);
  });
  // Copper brow ridge
  const brow = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.035, 10, 40, Math.PI), MAT.copper);
  brow.position.set(0, 0.2, 0.3);
  brow.rotation.x = -0.35;
  head.add(brow);
  // Antenna + tip
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.34, 12), MAT.copper);
  antenna.position.set(0.3, 0.62, 0);
  antenna.rotation.z = -0.18;
  head.add(antenna);
  const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 16, 12), MAT.glow.clone());
  antennaTip.position.set(0.33, 0.8, 0);
  head.add(antennaTip);
  // Ear discs
  [-1, 1].forEach(side => {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 24), MAT.copper);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(side * 0.53, -0.02, 0);
    head.add(ear);
    const earCap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 16), MAT.dark);
    earCap.rotation.z = Math.PI / 2;
    earCap.position.set(side * 0.54, -0.02, 0);
    head.add(earCap);
  });

  // ─── Halo: orbit rings + shadow (excluded from framing) ───
  const halo = new THREE.Group();
  rig.add(halo);
  // ─── Orbit rings echoing the art behind ───
  const orbit1 = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.028, 10, 72), MAT.brass);
  orbit1.position.y = -0.2;
  orbit1.rotation.x = degToRad(74);
  halo.add(orbit1);
  const orbit2 = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.02, 10, 72), MAT.copper);
  orbit2.position.y = -0.2;
  orbit2.rotation.x = degToRad(64);
  orbit2.rotation.y = degToRad(18);
  halo.add(orbit2);
  // Soft contact shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.85, 40),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28 })
  );
  shadow.position.y = -1.55;
  shadow.rotation.x = -Math.PI / 2;
  halo.add(shadow);

  // ─── Frame: big, centred ───
  function frameMiddle() {
    const box = new THREE.Box3().setFromObject(unit);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    if (size.y <= 0) return;
    const fH = 2 * Math.tan(degToRad(camera.fov / 2)) * CAM_Z;
    const fW = fH * camera.aspect;
    const targetH = fH * 1.0;
    const targetW = fW * (fW < fH ? 1.0 : 2.2);
    const s = Math.min(targetH / size.y, targetW / size.x);
    unit.scale.setScalar(s);
    unit.position.set(-center.x * s, -center.y * s, -center.z * s);
    // Halo follows the same transform so rings + shadow track the body
    halo.scale.setScalar(s);
    halo.position.copy(unit.position);
  }
  frameMiddle();

  function layout() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    frameMiddle();
  }

  // ─── Gaze + idle animation ───
  let hx = 0, hy = 0, px = 0, py = 0;
  let t = Math.random() * 100;
  let nextBlink = 3;
  let animId = null;

  function animate() {
    animId = requestAnimationFrame(animate);
    t += 0.008;

    // Head + pupils track the cursor; body follows faintly
    hx = lerp(hx, clamp(state.mouseX * 1.2, -0.5, 0.5), 0.07);
    hy = lerp(hy, clamp(state.mouseY * 0.9, -0.32, 0.32), 0.07);
    head.rotation.y = hx;
    head.rotation.x = hy;
    rig.rotation.y = lerp(rig.rotation.y, hx * 0.22, 0.05);
    rig.rotation.x = lerp(rig.rotation.x, hy * 0.2, 0.05);
    px = lerp(px, state.mouseX * 0.1, 0.1);
    py = lerp(py, -state.mouseY * 0.08, 0.1);
    pupils.forEach(p => {
      p.position.x = p.userData.base.x + px;
      p.position.y = p.userData.base.y + py;
    });

    // Blink
    if (t > nextBlink) {
      pupils.forEach(p => { p.scale.y = 0.12; });
      if (t > nextBlink + 0.12) {
        pupils.forEach(p => { p.scale.y = 1; });
        nextBlink = t + 2.5 + Math.random() * 3;
      }
    }

    // Idle: slow hover, arm sway, core pulse, orbit drift
    rig.position.y = rigBaseY + Math.sin(t * 0.9) * 0.05;
    arms[0].rotation.x = Math.sin(t * 0.9) * 0.07;
    arms[1].rotation.x = -Math.sin(t * 0.9) * 0.07;
    orbit1.rotation.z = t * 0.18;
    orbit2.rotation.z = -t * 0.12;
    const pulse = 1 + Math.sin(t * 2.2) * 0.07;
    chestCore.scale.set(pulse, pulse, 1);
    antennaTip.scale.set(pulse, pulse, pulse);

    renderer.render(scene, camera);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && animId === null) animate();
      else if (!entry.isIntersecting && animId !== null) { cancelAnimationFrame(animId); animId = null; }
    }, { threshold: 0.02 }).observe(hero);
  }
  layout();
  animate();
  hero.classList.remove('robot-loading');
  hero.classList.add('robot-ready');

  window.addEventListener('resize', layout, { passive: true });
  state.robotScene = { renderer, scene, camera };
}



// ═══════════════════════════════════════════════
// BLOB REVEAL — cursor-following window through the robot,
// landonorris-style. Desktop: hover. Touch: tap to lock + drag.
// ═══════════════════════════════════════════════
function initBlobReveal() {
  const hero = document.getElementById('hero');
  const ring = document.getElementById('blobRing');
  if (!hero || !ring || hero.classList.contains('no-robot')) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let tx = -999, ty = -999, bx = -999, by = -999;
  let raf = null;

  function heroPoint(clientX, clientY) {
    const r = hero.getBoundingClientRect();
    return [clientX - r.left, clientY - r.top];
  }
  function apply() {
    hero.style.setProperty('--bx', bx.toFixed(1) + 'px');
    hero.style.setProperty('--by', by.toFixed(1) + 'px');
    ring.style.transform = 'translate(' + bx.toFixed(1) + 'px,' + by.toFixed(1) + 'px) translate(-50%,-50%)';
  }
  function loop() {
    raf = requestAnimationFrame(loop);
    bx = lerp(bx, tx, 0.2);
    by = lerp(by, ty, 0.2);
    apply();
  }
  function start() { if (raf === null) loop(); }
  function stop() {
    if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
    hero.classList.remove('revealing');
  }
  function center() {
    const r = hero.getBoundingClientRect();
    bx = tx = r.width * 0.5;
    by = ty = r.height * 0.42;
    apply();
  }
  center();

  if (fine) {
    hero.addEventListener('mouseenter', e => {
      const [x, y] = heroPoint(e.clientX, e.clientY);
      tx = x; ty = y; bx = x; by = y;
      hero.classList.add('revealing');
      start();
    });
    hero.addEventListener('mousemove', e => {
      const [x, y] = heroPoint(e.clientX, e.clientY);
      tx = x; ty = y;
    });
    hero.addEventListener('mouseleave', stop);
  } else {
    // Touch: tap locks a blob at the finger; drag moves it; it fades after idle.
    let timer = null;
    hero.addEventListener('touchstart', e => {
      const touch = e.touches[0];
      const [x, y] = heroPoint(touch.clientX, touch.clientY);
      tx = x; ty = y; bx = x; by = y;
      hero.classList.add('revealing');
      start();
      // Let the robot track the finger too
      state.mouseX = clamp(x / hero.clientWidth - 0.5, -0.5, 0.5);
      state.mouseY = clamp(y / hero.clientHeight - 0.5, -0.5, 0.5);
      if (timer) clearTimeout(timer);
    }, { passive: true });
    hero.addEventListener('touchmove', e => {
      const touch = e.touches[0];
      const [x, y] = heroPoint(touch.clientX, touch.clientY);
      tx = x; ty = y;
      state.mouseX = clamp(x / hero.clientWidth - 0.5, -0.5, 0.5);
      state.mouseY = clamp(y / hero.clientHeight - 0.5, -0.5, 0.5);
    }, { passive: true });
    hero.addEventListener('touchend', () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(stop, 2600);
    });
  }
}

// ═══════════════════════════════════════════════
// MAIN INIT
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  // Core interactions (available with or without motion)
  initCursor();
  initNav();
  initScrollAnimations();
  initPipelineAnimation();
  initSkillInteractions();
  initBlobReveal();

  // 3D Scenes — stagger init to not block main thread
  if (!state.reducedMotion) {
    requestIdleCallback
      ? requestIdleCallback(() => {
          initHeroScene();
          initRobotScene();
          initProjectScenes();
          initContactScene();
        }, { timeout: 2000 })
      : setTimeout(() => {
          initHeroScene();
          initRobotScene();
          initProjectScenes();
          initContactScene();
        }, 100);
  }
});

// ─── Smooth scrolling for nav links ───
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});
