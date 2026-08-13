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
    var hoverTargets = "a, button, [data-tilt], .tilt, .skill-card, .term-card";
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
     Terminal card — simple typewriter loop
     ============================================================ */
  function initTerminal() {
    var body = document.getElementById("term-body");
    if (!body) return;

    var script = [
      { cmd: "whoami", out: "localvps" },
      { cmd: "cat skills.txt", out: "TypeScript  ·  Node.js  ·  React  ·  PHP  ·  C#" },
      { cmd: "./status --live", out: "<span class='ok'>●</span>  Open to work" }
    ];

    function buildPrompt() {
      var row = document.createElement("div");
      row.className = "t-row";
      var prompt = document.createElement("span");
      prompt.className = "t-prompt";
      prompt.textContent = "➜";
      var cmd = document.createElement("span");
      cmd.className = "t-cmd";
      row.appendChild(prompt);
      row.appendChild(cmd);
      return { row: row, cmd: cmd };
    }

    function buildOutput(text, cls) {
      var p = document.createElement("p");
      p.className = "t-out";
      p.innerHTML = text;
      return p;
    }

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function renderAll() {
      body.innerHTML = "";
      script.forEach(function (s) {
        var b = buildPrompt();
        b.cmd.textContent = s.cmd;
        body.appendChild(b.row);
        body.appendChild(buildOutput(s.out));
      });
      var c = document.createElement("span");
      c.className = "term-cursor";
      body.appendChild(c);
    }

    if (reduced) { renderAll(); return; }

    var typing = false;

    function start() {
      if (typing) return;
      typing = true;
      body.innerHTML = "";
      var idx = 0;
      var cursor = document.createElement("span");
      cursor.className = "term-cursor";
      body.appendChild(cursor);

      function nextLine() {
        if (idx >= script.length) {
          typing = false;
          return;
        }
        var s = script[idx];
        var b = buildPrompt();
        var ci = 0;
        body.insertBefore(b.row, cursor);
        (function type() {
          if (ci < s.cmd.length) {
            b.cmd.textContent = s.cmd.slice(0, ci + 1);
            ci++;
            setTimeout(type, 46);
          } else {
            body.insertBefore(buildOutput(s.out), cursor);
            idx++;
            setTimeout(nextLine, 420);
          }
        })();
      }
      nextLine();
    }

    /* start when the stage scrolls into view */
    if ("IntersectionObserver" in window) {
      var stage = document.getElementById("hero-stage") || body.parentElement;
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              start();
              io.unobserve(e.target);
            }
          });
        },
        { rootMargin: "300px" }
      );
      io.observe(stage);
    } else {
      start();
    }
  }
  initTerminal();
})();
