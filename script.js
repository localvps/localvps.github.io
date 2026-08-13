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
      card.style.animationDelay = (i * 0.06) + "s";
      card.innerHTML =
        '<span class="skill-idx">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="skill-glow" aria-hidden="true"></span>' +
        s;
      grid.appendChild(card);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  var d3Els = Array.prototype.slice.call(document.querySelectorAll(".d3"));

  function markVisible() {
    revealEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight - 40 && r.bottom > 0) el.classList.add("in");
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
      bindTilt(el, { max: 8, scale: 1.03 });
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

  /* ---------- Moving gradient border fallback for browsers without @property ---------- */
  var gradientBtns = document.querySelectorAll("[data-gradient-border]");
  var propertyAPI = window.CSS && (CSS.registerProperty || CSS.supports("(animation-timeline: none)"));
  if (gradientBtns.length && !propertyAPI) {
    var started = false;
    gradientBtns.forEach(function (el) {
      if (started) return;
      started = true;
      var deg = 0;
      (function tick() {
        deg = (deg + 2) % 360;
        gradientBtns.forEach(function (b) {
          b.style.setProperty("--angle", deg + "deg");
        });
        requestAnimationFrame(tick);
      })();
    });
  }
})();
