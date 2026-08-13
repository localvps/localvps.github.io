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
    var hoverTargets = "a, button, [data-tilt], .tilt, .skill-card";
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
    var max = (opts && opts.max) || 8;
    var scale = (opts && opts.scale) || 1.03;
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
    var count = window.innerWidth < 640 ? 60 : 120;

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
        r: Math.random() * 1.7 + 0.4,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22 - 0.14,
        a: Math.random() * 0.5 + 0.12,
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
     3D Globe (Three.js) — originkit-style dot-matrix earth
     ============================================================ */
  function initGlobe() {
    var canvas = document.getElementById("globe");
    if (!canvas || !window.THREE) return;

    var wrap = canvas.parentElement;
    var THREE = window.THREE;
    var RADIUS = 1;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 3.1);

    var globeGroup = new THREE.Group();
    globeGroup.rotation.x = 0.42;
    scene.add(globeGroup);

    var rotY = 0.6;
    var tilt = 0.42;
    var tiltTarget = 0.42;
    var inertiaX = 0, inertiaY = 0;
    var dragging = false;
    var hovered = false;
    var visible = true;
    var parX = 0, parY = 0;

    /* ---- ocean sphere ---- */
    var ocean = new THREE.Mesh(
      new THREE.SphereGeometry(RADIUS, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x0b0b16, transparent: true, opacity: 0.94 })
    );
    globeGroup.add(ocean);

    /* ---- atmosphere glow sprite ---- */
    function makeGlow(rgb, opacity, size) {
      var s = 256;
      var c = document.createElement("canvas");
      c.width = c.height = s;
      var cx = c.getContext("2d");
      var g = cx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      g.addColorStop(0, "rgba(" + rgb + ",1)");
      g.addColorStop(0.35, "rgba(" + rgb + ",0.4)");
      g.addColorStop(1, "rgba(" + rgb + ",0)");
      cx.fillStyle = g;
      cx.fillRect(0, 0, s, s);
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
    var glowMain = makeGlow("124,58,237", 0.55, 3.4);
    scene.add(glowMain);
    var glowCyan = makeGlow("34,211,238", 0.18, 2.9);
    scene.add(glowCyan);

    /* ---- graticule grid lines ---- */
    var gridMat = new THREE.LineBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.25 });
    function addLatCircle(lat) {
      var pts = [];
      for (var i = 0; i <= 72; i++) {
        var lng = (i / 72) * 360 - 180;
        pts.push(llToVec(lat, lng, RADIUS * 1.006));
      }
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      globeGroup.add(new THREE.Line(geo, gridMat));
    }
    function addLonCircle(lng) {
      var pts = [];
      for (var i = 0; i <= 72; i++) {
        var lat = (i / 72) * 180 - 90;
        pts.push(llToVec(lat, lng, RADIUS * 1.006));
      }
      var geo = new THREE.BufferGeometry().setFromPoints(pts);
      globeGroup.add(new THREE.Line(geo, gridMat));
    }
    for (var lat = -60; lat <= 60; lat += 15) addLatCircle(lat);
    for (var lng = 0; lng < 360; lng += 15) addLonCircle(lng);

    function llToVec(lat, lng, r) {
      var phi = (90 - lat) * Math.PI / 180;
      var theta = (lng + 180) * Math.PI / 180;
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    /* ---- land dots from real geojson ---- */
    function buildDots(data) {
      var MW = 2048, MH = 1024;
      var cv = document.createElement("canvas");
      cv.width = MW; cv.height = MH;
      var cx = cv.getContext("2d", { willReadFrequently: true });
      cx.fillStyle = "#000";
      cx.fillRect(0, 0, MW, MH);
      cx.fillStyle = "#fff";
      data.features.forEach(function (f) {
        var geom = f.geometry;
        if (!geom || geom.type !== "Polygon" && geom.type !== "MultiPolygon") return;
        var polys = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
        polys.forEach(function (poly) {
          cx.beginPath();
          poly.forEach(function (ring) {
            ring.forEach(function (pt, i) {
              var x = (pt[0] + 180) / 360 * MW;
              var y = (90 - pt[1]) / 180 * MH;
              if (i === 0) cx.moveTo(x, y);
              else cx.lineTo(x, y);
            });
            cx.closePath();
          });
          cx.fill();
        });
      });
      var img = cx.getImageData(0, 0, MW, MH).data;
      var dots = [];
      var step = 4;
      for (var y = 0; y < MH; y += step) {
        for (var x = 0; x < MW; x += step) {
          if (img[(y * MW + x) * 4 + 3] > 128) {
            var la = 90 - (y / MH) * 180;
            var lo = (x / MW) * 360 - 180;
            dots.push(llToVec(la, lo, RADIUS * 1.002));
          }
        }
      }
      return dots;
    }

    function addDots(dots) {
      if (!dots.length) return;
      var aCount = 0, bCount = 0;
      dots.forEach(function (_, i) { if (i % 7 === 0) bCount++; else aCount++; });
      var dotGeo = new THREE.SphereGeometry(RADIUS * 0.017, 4, 4);
      var matPurple = new THREE.MeshBasicMaterial({ color: 0x8b5cf6 });
      var matBright = new THREE.MeshBasicMaterial({ color: 0x5eead4 });
      var meshA = new THREE.InstancedMesh(dotGeo, matPurple, aCount);
      var meshB = new THREE.InstancedMesh(dotGeo, matBright, bCount);
      var m = new THREE.Matrix4();
      var ai = 0, bi = 0;
      dots.forEach(function (p, i) {
        if (i % 7 === 0) {
          meshB.setMatrixAt(bi++, m.setPosition(p.x, p.y, p.z));
        } else {
          meshA.setMatrixAt(ai++, m.setPosition(p.x, p.y, p.z));
        }
      });
      globeGroup.add(meshA);
      globeGroup.add(meshB);
    }

    /* ---- interaction ---- */
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var lastHover = 0;
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
    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      var now = performance.now();
      if (now - lastHover > 90) {
        lastHover = now;
        raycaster.setFromCamera(mouse, camera);
        hovered = raycaster.intersectObject(ocean, false).length > 0;
      }
    });

    function clamp(v, lo, hi) {
      return Math.max(lo, Math.min(hi, v));
    }

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

    /* ---- load data + run ---- */
    fetch("ne_50m_land.json")
      .then(function (r) { return r.json(); })
      .then(function (data) {
        addDots(buildDots(data));
        canvas.classList.add("ready");
        if (reduced) {
          globeGroup.rotation.y = rotY;
          globeGroup.rotation.x = tilt;
          renderer.render(scene, camera);
          return;
        }
        (function tick() {
          requestAnimationFrame(tick);
          if (!visible) return;
          if (!dragging && !hovered) rotY += 0.0032;
          rotY += inertiaX;
          tiltTarget += inertiaY;
          inertiaX *= 0.9;
          inertiaY *= 0.9;
          globeGroup.rotation.y = rotY;
          tilt += (clamp(tiltTarget, -1.25, 1.25) - tilt) * 0.05;
          globeGroup.rotation.x = tilt;
          camera.position.x += (parX - camera.position.x) * 0.045;
          camera.position.y += (parY - camera.position.y) * 0.045;
          camera.lookAt(0, 0, 0);
          renderer.render(scene, camera);
        })();
      })
      .catch(function () {
        canvas.classList.add("ready");
      });
  }
  initGlobe();
})();
