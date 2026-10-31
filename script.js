/* ============================================================
   AmirHossein — portfolio
   WebGL particle scene + DOM
   ============================================================ */

import * as THREE from "three";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, r = document) => r.querySelector(s);

/* ── content ─────────────────────────────────────────────── */

const SKILLS = [
  ["TypeScript", "Daily"],
  ["JavaScript", "Daily"],
  ["Node.js", "Daily"],
  ["React", "Daily"],
  ["PHP", "Regular"],
  ["Java", "Regular"],
  ["C#", "Regular"],
  ["HTML / CSS", "Daily"],
  ["Git & GitHub", "Daily"],
  ["Linux / Bash", "Daily"],
];

const WORK = [
  {
    name: "GuardNet",
    desc: "Privacy-first networking suite — fast, auditable, built to stay out of your way.",
    tags: ["TypeScript", "Node.js"],
    href: "https://github.com/localvps/guardnet",
  },
  {
    name: "Pixel Perfect",
    desc: "A pixel-accurate UI reconstruction playground for sharp front-end craft.",
    tags: ["React", "CSS"],
    href: "https://github.com/localvps/pixel-perfect",
  },
  {
    name: "GuardVPN",
    desc: "A streamlined SSH tunnel manager for fast, reliable VPN connections.",
    tags: ["Shell", "Bash"],
    href: "https://github.com/localvps/guardvpn",
  },
  {
    name: "Riyazigo",
    desc: "A practice-and-progress platform, tuned for quick daily reps.",
    tags: ["PHP", "MySQL"],
    href: "https://github.com/localvps/Rayazi-Go",
  },
  {
    name: "The Whispering Dungeon",
    desc: "A free browser dungeon-crawl adventure — explorable, playable, no install.",
    tags: ["HTML", "JS"],
    href: "https://github.com/localvps/whispering-dungeon",
  },
];

/* ── render lists ────────────────────────────────────────── */

$("#skills-list").innerHTML = SKILLS.map(
  ([name, lvl], i) => `
    <li>
      <span class="n">${String(i + 1).padStart(2, "0")}</span>
      <span class="name">${name}</span>
      <span class="lvl">${lvl}</span>
    </li>`
).join("");

$("#work-list").innerHTML = WORK.map(
  (w, i) => `
    <a class="work-item" href="${w.href}" target="_blank" rel="noopener">
      <span class="work-idx">${String(i + 1).padStart(2, "0")}</span>
      <span>
        <h3 class="work-title">${w.name}</h3>
        <p class="work-desc">${w.desc}</p>
      </span>
      <span class="work-tags">${w.tags.map((t) => `<span>${t}</span>`).join("")}</span>
      <span class="work-arrow">↗</span>
    </a>`
).join("");

/* ── split hero chars for stagger ────────────────────────── */

document.querySelectorAll(".hero-title .word").forEach((word) => {
  const base = parseFloat(getComputedStyle(word).getPropertyValue("--d") || 0);
  [...word.querySelectorAll(".ch")].forEach((ch, i) => {
    ch.style.setProperty("--i", i);
    ch.style.animationDelay = `calc(.25s + ${base * 0.12}s + ${i * 0.045}s)`;
  });
});

/* ── reveal on scroll ────────────────────────────────────── */

const revealIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        revealIO.unobserve(e.target);
      }
    }
  },
  { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
);
document.querySelectorAll(".rv").forEach((el) => revealIO.observe(el));

/* ── nav / progress / cursor ─────────────────────────────── */

const nav = $(".nav");
const bar = $(".progress span");
const cursor = $(".cursor");
let pointer = { x: innerWidth / 2, y: innerHeight / 2 };
let cursorPos = { ...pointer };

addEventListener("pointermove", (e) => {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  document.documentElement.style.setProperty("--mx", e.clientX + "px");
  document.documentElement.style.setProperty("--my", e.clientY + "px");
});

document.querySelectorAll("a, button").forEach((el) => {
  el.addEventListener("pointerenter", () => cursor.classList.add("is-hot"));
  el.addEventListener("pointerleave", () => cursor.classList.remove("is-hot"));
});

function tickCursor() {
  cursorPos.x += (pointer.x - cursorPos.x) * 0.16;
  cursorPos.y += (pointer.y - cursorPos.y) * 0.16;
  cursor.style.transform = `translate(${cursorPos.x}px, ${cursorPos.y}px)`;
  requestAnimationFrame(tickCursor);
}
if (!reduced) tickCursor();

let scrollY = 0;
function onScroll() {
  scrollY = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? scrollY / max : 0;
  bar.style.width = (p * 100).toFixed(2) + "%";
  nav.classList.toggle("is-stuck", scrollY > 40);
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ── scene names ─────────────────────────────────────────── */

const SCENE_NAMES = ["sphere", "knot", "helix", "wave"];
const sceneNameEl = $("#scene-name");

/* ============================================================
   WebGL
   ============================================================ */

const canvas = $("#webgl");
let renderer, scene, camera, points, geo;

const COUNT = 14000;
const positions = new Float32Array(COUNT * 3);
const targets = [new Float32Array(COUNT * 3), new Float32Array(COUNT * 3), new Float32Array(COUNT * 3), new Float32Array(COUNT * 3)];
const colors = new Float32Array(COUNT * 3);

const C_ACCENT = new THREE.Color("#ff5a3c");
const C_VIOLET = new THREE.Color("#7f6bff");
const C_ICE = new THREE.Color("#d9e2ff");

/* --- shape generators ------------------------------------- */

function genSphere(a) {
  const R = 26;
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = phi * i;
    const jitter = 0.94 + Math.random() * 0.12;
    a[i * 3] = Math.cos(th) * r * R * jitter;
    a[i * 3 + 1] = y * R * jitter;
    a[i * 3 + 2] = Math.sin(th) * r * R * jitter;
  }
}

function genKnot(a) {
  // (2,3) torus knot, points spread across the tube cross-section
  const p = 2, q = 3, R = 20, r = 8;
  for (let i = 0; i < COUNT; i++) {
    const u = (i / COUNT) * Math.PI * 2;
    const cx = Math.cos(p * u) * (R + Math.cos(q * u) * r);
    const cy = Math.sin(p * u) * (R + Math.cos(q * u) * r);
    const cz = Math.sin(q * u) * r;

    const ang = Math.random() * Math.PI * 2;
    const rad = Math.pow(Math.random(), 0.62) * 2.4;
    // a ring perpendicular-ish to the curve
    const nx = Math.cos(ang) * rad;
    const ny = Math.sin(ang) * rad;

    a[i * 3] = cx * 1.15 + nx;
    a[i * 3 + 1] = cy * 1.15 + ny;
    a[i * 3 + 2] = cz * 1.9 + nx * 0.5;
  }
}

function genHelix(a) {
  for (let i = 0; i < COUNT; i++) {
    const strand = i % 2;
    const t = (Math.floor(i / 2) / (COUNT / 2)) * Math.PI * 2 * 3.2;
    const rad = 13;
    const y = (Math.floor(i / 2) / (COUNT / 2) - 0.5) * 62;
    const ang = t + strand * Math.PI;
    const wob = 1 + Math.sin(t * 0.5) * 0.06;
    a[i * 3] = Math.cos(ang) * rad * wob + (Math.random() - 0.5) * 1.2;
    a[i * 3 + 1] = y + (Math.random() - 0.5) * 1.2;
    a[i * 3 + 2] = Math.sin(ang) * rad * wob + (Math.random() - 0.5) * 1.2;
  }
}

function genWave(a) {
  const W = 62, D = 42;
  for (let i = 0; i < COUNT; i++) {
    const u = Math.random();
    const v = Math.random();
    const x = (u - 0.5) * W;
    const z = (v - 0.5) * D;
    const d = Math.sqrt(x * x + z * z);
    a[i * 3] = x;
    a[i * 3 + 1] = Math.sin(d * 0.32) * 6 * Math.exp(-d * 0.03) - 4;
    a[i * 3 + 2] = z;
  }
}

function buildTargets() {
  genSphere(targets[0]);
  genKnot(targets[1]);
  genHelix(targets[2]);
  genWave(targets[3]);

  // seed current positions from sphere
  positions.set(targets[0]);

  const c = new THREE.Color();
  for (let i = 0; i < COUNT; i++) {
    const t = i / COUNT;
    if (t < 0.55) c.copy(C_ICE).lerp(C_VIOLET, t / 0.55);
    else c.copy(C_VIOLET).lerp(C_ACCENT, (t - 0.55) / 0.45);
    const k = 0.55 + Math.random() * 0.45;
    colors[i * 3] = c.r * k;
    colors[i * 3 + 1] = c.g * k;
    colors[i * 3 + 2] = c.b * k;
  }
}

/* --- init ------------------------------------------------- */

function initGL() {
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
  } catch {
    canvas.style.display = "none";
    return;
  }

  const mobile = innerWidth < 720;
  const DPR = Math.min(devicePixelRatio || 1, mobile ? 1.35 : 1.75);
  renderer.setPixelRatio(DPR);
  renderer.setSize(innerWidth, innerHeight);
  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x07080a, 0.0135);

  camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 400);
  camera.position.set(0, 0, innerWidth < 720 ? 120 : 78);

  buildTargets();

  geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uSize: { value: DPR * 300 },
      uOpacity: { value: mobile ? 0.62 : 1 },
    },
    vertexShader: /* glsl */ `
      uniform float uSize;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vDepth;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uSize * (1.0 / max(vDepth, 1.0));
        gl_PointSize = clamp(gl_PointSize, 0.6, 9.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec3 vColor;
      varying float vDepth;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.05, d);
        float fade = smoothstep(230.0, 40.0, vDepth);
        gl_FragColor = vec4(vColor, a * fade * uOpacity * 0.9);
      }
    `,
  });

  points = new THREE.Points(geo, mat);
  scene.add(points);

  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
}

/* --- morph ------------------------------------------------- */

let active = 0;
let morph = 1;              // 1 = settled on `active`
let from = new Float32Array(COUNT * 3);
const rot = { x: 0, y: 0, tx: 0, ty: 0 };
let pageMax = 1;

function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

function frame(t) {
  if (!renderer) return;
  requestAnimationFrame(frame);

  const time = t * 0.001;

  // which scene are we targeting, based on scroll
  pageMax = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const p = Math.min(1, Math.max(0, scrollY / pageMax));
  const wanted = Math.round(p * (SCENE_NAMES.length - 1));

  if (wanted !== active) {
    from.set(positions);
    morph = 0;
    active = wanted;
    if (sceneNameEl) sceneNameEl.textContent = SCENE_NAMES[wanted];
  }

  // ease current -> target positions
  if (morph < 1) {
    morph = Math.min(1, morph + 0.017);
    const e = smoothstep(0, 1, morph);
    const dst = targets[active];
    for (let i = 0; i < COUNT * 3; i++) {
      positions[i] = from[i] + (dst[i] - from[i]) * e;
    }
    geo.attributes.position.needsUpdate = true;
  }

  // gentle drift + parallax
  const mx = (pointer.x / innerWidth - 0.5);
  const my = (pointer.y / innerHeight - 0.5);
  rot.tx = -my * 0.32;
  rot.ty = mx * 0.5;
  rot.x += (rot.tx - rot.x) * 0.045;
  rot.y += (rot.ty - rot.y) * 0.045;

  points.rotation.x = rot.x + Math.sin(time * 0.13) * 0.06;
  points.rotation.y = rot.y + time * 0.045;
  points.position.y = Math.sin(time * 0.4) * 0.8;

  // camera breathes in slightly on lower scenes
  const cz = (innerWidth < 720 ? 120 : 78) - p * 10;
  camera.position.z += (cz - camera.position.z) * 0.05;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}

if (!reduced) {
  initGL();
  if (renderer) requestAnimationFrame(frame);
} else {
  // static fallback: hide canvas, keep DOM
  canvas.style.display = "none";
}

/* ── final polish: year ──────────────────────────────────── */
const yearEl = document.querySelector(".footer span");
if (yearEl) yearEl.textContent = `© ${new Date().getFullYear()} AmirHossein`;
