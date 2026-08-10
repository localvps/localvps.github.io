(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Skills grid ---------- */
  var skills = ["TypeScript", "Node.js", "React", "PHP", "Java", "CSS / HTML", "C#"];
  var grid = document.getElementById("skills-grid");
  if (grid) {
    skills.forEach(function (s) {
      var card = document.createElement("div");
      card.className = "skill-card";
      card.setAttribute("data-tilt", "");
      card.textContent = s;
      grid.appendChild(card);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
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
    var mx = -100, my = -100, rx = -100, ry = -100;
    var raf = null;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
      if (!raf) loop();
    });
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      raf = requestAnimationFrame(loop);
    }
    var hoverTargets = "a, button, .skill-card, .project, .magnetic";
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

  /* ---------- Magnetic buttons ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      var strength = 0.3;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + x * strength + "px," + y * strength + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ---------- 3D tilt ---------- */
  if (finePointer && !reduced) {
    document.querySelectorAll("[data-tilt], .tilt").forEach(function (el) {
      var max = 8;
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform =
          "perspective(900px) rotateX(" + (-py * max).toFixed(2) + "deg) rotateY(" +
          (px * max).toFixed(2) + "deg)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ---------- WebGL scene ---------- */
  var canvas = document.getElementById("bg");
  if (canvas && window.THREE && !reduced) {
    try {
      var renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);

      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      );
      camera.position.set(0, 0, 8);

      var group = new THREE.Group();
      scene.add(group);

      /* large wireframe icosahedron */
      var ico = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.4, 1),
        new THREE.MeshBasicMaterial({
          color: 0xc8f542,
          wireframe: true,
          transparent: true,
          opacity: 0.14,
        })
      );
      ico.position.set(-2.6, 1.1, -3);
      group.add(ico);

      /* torus knot */
      var knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.9, 0.28, 120, 18),
        new THREE.MeshBasicMaterial({
          color: 0xff6b35,
          wireframe: true,
          transparent: true,
          opacity: 0.1,
        })
      );
      knot.position.set(3.1, -1.4, -4);
      group.add(knot);

      /* small octahedron */
      var oct = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55, 0),
        new THREE.MeshBasicMaterial({
          color: 0xf4f4f2,
          wireframe: true,
          transparent: true,
          opacity: 0.2,
        })
      );
      oct.position.set(3.6, 1.7, -2);
      group.add(oct);

      /* particle field */
      var count = 1400;
      var pos = new Float32Array(count * 3);
      for (var i = 0; i < count * 3; i++) {
        pos[i] = (Math.random() - 0.5) * 34;
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      var pts = new THREE.Points(
        geo,
        new THREE.PointsMaterial({
          color: 0xf4f4f2,
          size: 0.018,
          transparent: true,
          opacity: 0.55,
        })
      );
      scene.add(pts);

      var mouse = { x: 0, y: 0 };
      var tX = 0, tY = 0;
      window.addEventListener("mousemove", function (e) {
        mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
      });

      var clock = new THREE.Clock();
      function animate() {
        requestAnimationFrame(animate);
        var t = clock.getElapsedTime();

        ico.rotation.x = t * 0.12;
        ico.rotation.y = t * 0.16;
        ico.position.y = 1.1 + Math.sin(t * 0.6) * 0.3;

        knot.rotation.x = t * 0.22;
        knot.rotation.y = t * 0.14;

        oct.rotation.x = t * 0.4;
        oct.rotation.y = t * 0.3;
        oct.position.y = 1.7 + Math.cos(t * 0.8) * 0.35;

        pts.rotation.y = t * 0.02;

        tX += (mouse.x * 1.3 - tX) * 0.04;
        tY += (mouse.y * 0.9 - tY) * 0.04;
        camera.position.x = tX;
        camera.position.y = tY;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener("resize", function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    } catch (err) {
      if (canvas) canvas.remove();
    }
  }
})();
