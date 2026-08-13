(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Skills grid ---------- */
  var skills = ["TypeScript", "Node.js", "React", "PHP", "Java", "CSS / HTML", "C#"];
  var grid = document.getElementById("skills-grid");
  if (grid) {
    skills.forEach(function (s, i) {
      var card = document.createElement("div");
      card.className = "skill-card";
      card.setAttribute("data-tilt", "");
      card.style.animationDelay = (i * 0.08) + "s";
      card.innerHTML =
        '<span class="skill-idx">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="skill-glow" aria-hidden="true"></span>' +
        s;
      grid.appendChild(card);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  function inView(el) {
    var r = el.getBoundingClientRect();
    return r.top < window.innerHeight - 40 && r.bottom > 0;
  }

  function markVisible() {
    revealEls.forEach(function (el) {
      if (inView(el)) el.classList.add("in");
    });
  }

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  window.addEventListener("load", markVisible);
  setTimeout(markVisible, 900);

  /* ---------- Progress bar + nav ---------- */
  var progressBar = document.querySelector(".progress span");
  var nav = document.querySelector(".nav");
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? (h.scrollTop || window.pageYOffset) / max : 0;
    if (progressBar) progressBar.style.width = p * 100 + "%";
    if (nav) nav.classList.toggle("scrolled", (h.scrollTop || window.pageYOffset) > 30);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Custom cursor ---------- */
  var dot = document.querySelector(".cursor-dot");
  var ring = document.querySelector(".cursor-ring");
  if (dot && ring && finePointer && !reduced) {
    document.body.classList.add("custom-cursor");
    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });
    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    })();
    var hoverTargets = "a, button, [data-tilt], .tilt, .skill-card, #globe";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hoverTargets)) ring.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hoverTargets)) ring.classList.remove("is-hover");
    });
    document.addEventListener("mouseleave", function () {
      ring.style.opacity = "0";
      dot.style.opacity = "0";
    });
    document.addEventListener("mouseenter", function () {
      ring.style.opacity = "1";
      dot.style.opacity = "1";
    });
  }

  /* ---------- Magnetic buttons (spring-smoothed) ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      var strength = 0.32;
      var tx = 0, ty = 0, x = 0, y = 0, on = false;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - r.left - r.width / 2) * strength;
        ty = (e.clientY - r.top - r.height / 2) * strength;
        if (!on) { on = true; requestAnimationFrame(loop); }
      });
      el.addEventListener("mouseleave", function () {
        tx = 0; ty = 0;
      });
      function loop() {
        x += (tx - x) * 0.2;
        y += (ty - y) * 0.2;
        el.style.transform = "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px)";
        if (Math.abs(tx - x) > 0.05 || Math.abs(ty - y) > 0.05) {
          requestAnimationFrame(loop);
        } else {
          on = false;
        }
      }
    });
  }

  /* ---------- 3D tilt with lerp + shine tracking ---------- */
  function bindTilt(el, opts) {
    var max = (opts && opts.max) || 10;
    var scale = (opts && opts.scale) || 1.04;
    var t = { x: 0, y: 0, tx: 0, ty: 0, s: 1, ts: 1 };

    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width - 0.5;
      var ny = (e.clientY - r.top) / r.height - 0.5;
      t.ty = nx * max;
      t.tx = -ny * max * 0.7;
      t.ts = scale;
      el.style.setProperty("--gx", ((nx + 0.5) * 100).toFixed(2) + "%");
      el.style.setProperty("--gy", ((ny + 0.5) * 100).toFixed(2) + "%");
    });
    el.addEventListener("mouseleave", function () {
      t.tx = 0; t.ty = 0; t.ts = 1;
    });

    (function loop() {
      t.x += (t.tx - t.x) * 0.12;
      t.y += (t.ty - t.y) * 0.12;
      t.s += (t.ts - t.s) * 0.12;
      el.style.transform =
        "perspective(900px) rotateX(" + t.x.toFixed(2) + "deg) rotateY(" +
        t.y.toFixed(2) + "deg) scale(" + t.s.toFixed(3) + ")";
      requestAnimationFrame(loop);
    })();
  }

  if (finePointer && !reduced) {
    document.querySelectorAll("[data-tilt], .tilt").forEach(function (el) {
      bindTilt(el, { max: 10, scale: 1.04 });
    });
  }

  /* ---------- Spotlight on work card ---------- */
  if (finePointer) {
    document.querySelectorAll(".work-card").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
    document.querySelectorAll(".contact-link").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--gx", ((e.clientX - r.left) / r.width) * 100 + "%");
        el.style.setProperty("--gy", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ============================================================
     Stardust particle background
     ============================================================ */
  function initStardust() {
    var canvas = document.getElementById("stardust");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0;
    var colors = ["167,139,250", "255,255,255", "34,211,238", "192,132,252", "124,58,237"];
    var particles = [];
    var count = window.innerWidth < 640 ? 70 : 140;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function make() {
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.24,
        vy: (Math.random() - 0.5) * 0.24 - 0.15,
        a: Math.random() * 0.55 + 0.15,
        tw: Math.random() * Math.PI * 2,
        c: colors[Math.floor(Math.random() * colors.length)]
      };
    }

    function drawStatic() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function (p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + p.c + "," + p.a + ")";
        ctx.fill();
      });
    }

    resize();
    for (var i = 0; i < count; i++) particles.push(make());

    if (!reduced) {
      (function tick() {
        requestAnimationFrame(tick);
        ctx.clearRect(0, 0, W, H);
        particles.forEach(function (p) {
          p.x += p.vx;
          p.y += p.vy;
          p.tw += 0.035;
          var alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(" + p.c + "," + alpha.toFixed(3) + ")";
          ctx.fill();
          if (p.y < -20) p.y = H + 20;
          if (p.x < -20) p.x = W + 20;
          if (p.x > W + 20) p.x = -20;
        });
      })();
    } else {
      drawStatic();
    }

    window.addEventListener("resize", resize);
  }
  initStardust();

  /* ============================================================
     Energy Orb (Three.js) — elegant particle core + orbit rings
     ============================================================ */
  function initOrb() {
    var canvas = document.getElementById("globe");
    if (!canvas || !window.THREE) return;

    var THREE = window.THREE;
    var wrap = canvas.parentElement;
    var R = 1;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 3.1);

    var root = new THREE.Group();
    root.rotation.x = 0.45;
    scene.add(root);

    var orb = new THREE.Group();
    root.add(orb);

    var rotY = 0.6;
    var tilt = 0.45;
    var tiltTarget = 0.45;
    var inertiaX = 0, inertiaY = 0;
    var dragging = false;
    var visible = true;
    var parX = 0, parY = 0;
    var time = 0;

    function clamp(v, lo, hi) {
      return Math.max(lo, Math.min(hi, v));
    }

    /* ---- soft round point texture ---- */
    function makeDotTexture() {
      var s = 64;
      var c = document.createElement("canvas");
      c.width = c.height = s;
      var ctx = c.getContext("2d");
      var g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.35, "rgba(255,255,255,0.65)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
      return new THREE.CanvasTexture(c);
    }
    var dotTex = makeDotTexture();

    /* ---- particle sphere (fibonacci distribution) ---- */
    function fibSphere(n) {
      var pts = [];
      var golden = Math.PI * (3 - Math.sqrt(5));
      for (var i = 0; i < n; i++) {
        var y = 1 - (i / (n - 1)) * 2;
        var rad = Math.sqrt(Math.max(0, 1 - y * y));
        var theta = golden * i;
        pts.push(new THREE.Vector3(Math.cos(theta) * rad, y, Math.sin(theta) * rad));
      }
      return pts;
    }

    var N = 3200;
    var base = fibSphere(N);
    var posArr = new Float32Array(N * 3);
    var colArr = new Float32Array(N * 3);
    var white = [235, 240, 255], violet = [197, 181, 253], cyan = [110, 231, 248], deep = [160, 130, 245];

    base.forEach(function (v, i) {
      var jit = R + (Math.random() - 0.5) * 0.09;
      posArr[i * 3] = v.x * jit;
      posArr[i * 3 + 1] = v.y * jit;
      posArr[i * 3 + 2] = v.z * jit;
      var col;
      if (i % 9 === 0) col = cyan;
      else if (i % 4 === 0) col = white;
      else if (i % 2 === 0) col = violet;
      else col = deep;
      var f = 0.75 + Math.random() * 0.35;
      colArr[i * 3] = col[0] * f;
      colArr[i * 3 + 1] = col[1] * f;
      colArr[i * 3 + 2] = col[2] * f;
    });

    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(colArr, 3));

    var pMat = new THREE.PointsMaterial({
      size: 0.05,
      map: dotTex,
      transparent: true,
      opacity: 0.95,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    var points = new THREE.Points(pGeo, pMat);
    orb.add(points);

    /* ---- faint inner sphere for depth ---- */
    var inner = new THREE.Mesh(
      new THREE.SphereGeometry(R * 0.62, 48, 48),
      new THREE.MeshBasicMaterial({
        color: 0x5b21b6,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    orb.add(inner);

    /* ---- glowing core ---- */
    function makeGlow(rgb, opacity, size) {
      var s = 256;
      var c = document.createElement("canvas");
      c.width = c.height = s;
      var ctx = c.getContext("2d");
      var g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, "rgba(" + rgb + ",1)");
      g.addColorStop(0.35, "rgba(" + rgb + ",0.4)");
      g.addColorStop(1, "rgba(" + rgb + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, s, s);
      var sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(c),
          transparent: true,
          opacity: opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      sp.scale.set(size, size, 1);
      return sp;
    }
    var core = makeGlow("168,85,247", 0.85, 2.4);
    orb.add(core);
    var coreCyan = makeGlow("34,211,238", 0.25, 1.6);
    orb.add(coreCyan);

    var glowMain = makeGlow("124,58,237", 0.65, 3.9);
    scene.add(glowMain);
    var glowSoft = makeGlow("192,132,252", 0.35, 3.1);
    scene.add(glowSoft);

    /* ---- orbit rings + satellites ---- */
    var ringGroup = new THREE.Group();
    root.add(ringGroup);

    var rings = [];
    function addRing(radius, thickness, color, opacity, rx, ry, rz) {
      var mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      var mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, thickness, 8, 180), mat);
      mesh.rotation.set(rx, ry, rz);
      ringGroup.add(mesh);
      rings.push(mesh);
    }
    addRing(R * 1.55, 0.0045, 0xa78bfa, 0.6, 1.15, 0.35, 0);
    addRing(R * 1.78, 0.0032, 0x67e8f9, 0.4, -1.25, -0.45, 0.35);
    addRing(R * 2.0, 0.0026, 0x8b5cf6, 0.32, 0.95, 1.15, -0.25);

    /* satellites riding the rings */
    var sats = [];
    function addSat(ring, radius, color, size) {
      var sp = makeGlow(color, 1, size);
      ringGroup.add(sp);
      sats.push({ sprite: sp, ring: ring, radius: radius, angle: Math.random() * Math.PI * 2 });
    }
    addSat(rings[0], R * 1.55, "34,211,238", 0.34);
    addSat(rings[1], R * 1.78, "196,181,253", 0.3);
    addSat(rings[2], R * 2.0, "168,85,247", 0.28);

    /* ---- interaction ---- */
    var lastX = 0, lastY = 0;
    canvas.addEventListener("pointerdown", function (e) {
      dragging = true;
      canvas.classList.add("grabbing");
      lastX = e.clientX;
      lastY = e.clientY;
      inertiaX = 0;
      inertiaY = 0;
    });
    window.addEventListener("pointermove", function (e) {
      if (dragging) {
        var dx = e.clientX - lastX;
        var dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        rotY += dx * 0.007;
        tiltTarget = clamp(tiltTarget + dy * 0.005, -1.25, 1.25);
        inertiaX = dx * 0.0016;
        inertiaY = dy * 0.0011;
      }
      var r = wrap.getBoundingClientRect();
      parX = ((e.clientX - r.left) / r.width - 0.5) * 0.9;
      parY = ((e.clientY - r.top) / r.height - 0.5) * 0.9;
    });
    window.addEventListener("pointerup", function () {
      if (dragging) {
        dragging = false;
        canvas.classList.remove("grabbing");
      }
    });

    function resize() {
      var w = wrap.clientWidth;
      var h = wrap.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    resize();
    window.addEventListener("resize", resize);

    var inView = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
    }, { rootMargin: "240px" });
    inView.observe(wrap);

    /* ---- run ---- */
    canvas.classList.add("ready");

    if (reduced) {
      root.rotation.x = tilt;
      orb.rotation.y = rotY;
      renderer.render(scene, camera);
      return;
    }

    (function tick() {
      requestAnimationFrame(tick);
      time += 0.016;
      if (!visible) return;

      if (!dragging) rotY += 0.0022;
      rotY += inertiaX;
      tiltTarget += inertiaY;
      inertiaX *= 0.9;
      inertiaY *= 0.9;

      orb.rotation.y = rotY;
      tilt += (clamp(tiltTarget, -1.25, 1.25) - tilt) * 0.05;
      root.rotation.x = tilt;

      ringGroup.rotation.y += 0.0028;

      sats.forEach(function (s) {
        s.angle += 0.012;
        var a = s.angle;
        var p = new THREE.Vector3(Math.cos(a) * s.radius, 0, Math.sin(a) * s.radius);
        p.applyEuler(s.ring.rotation);
        s.sprite.position.copy(p);
        var pulse = 0.75 + 0.35 * Math.sin(time * 2.6 + s.angle);
        s.sprite.material.opacity = pulse;
        s.sprite.scale.set(s.sprite.scale.x * 0.99 + (0.2 + 0.22 * pulse), 0, 1);
        var sc = 0.2 + 0.22 * pulse;
        s.sprite.scale.set(sc, sc, 1);
      });

      /* breathing glow */
      var b = 0.85 + 0.12 * Math.sin(time * 1.3);
      core.material.opacity = b;
      core.scale.set(2.4 * (0.9 + 0.1 * b), 2.4 * (0.9 + 0.1 * b), 1);
      points.material.opacity = 0.9 + 0.1 * Math.sin(time * 1.1);

      camera.position.x += (parX - camera.position.x) * 0.045;
      camera.position.y += (parY - camera.position.y) * 0.045;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    })();
  }
  initOrb();
})();
