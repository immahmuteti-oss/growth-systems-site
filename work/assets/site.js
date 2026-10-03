/* Emmanuel Muteti: site motion. Respects prefers-reduced-motion everywhere. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  var body = document.body;

  // page-in transition
  body.classList.add("ready");
  // page-out transition on internal links
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || reduce || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.hash && url.pathname === location.pathname) return;
    if (!/\/work\//.test(url.pathname)) return;
    e.preventDefault(); body.classList.add('leaving');
    setTimeout(function () { location.href = a.href; }, 420);
  });
  addEventListener('pageshow', function (e) { if (e.persisted) body.classList.remove('leaving'); });

  // nav: solid on scroll, hide on scroll-down, progress bar, mobile menu
  var nav = document.querySelector('nav.top'), bar = document.getElementById('progress'), lastY = 0;
  function onScroll() {
    var y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (nav) {
      nav.classList.toggle('solid', y > 40);
      nav.classList.toggle('hide', y > 400 && y > lastY && !body.classList.contains('menu-open'));
    }
    if (bar) bar.style.width = (h > 0 ? y / h * 100 : 0) + '%';
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var mb = document.querySelector('.menu-btn');
  if (mb) mb.addEventListener('click', function () {
    var open = body.classList.toggle('menu-open'); mb.setAttribute('aria-expanded', open);
  });

  // split headline words
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var html = el.innerHTML.trim().split(/(<[^>]+>[^<]*<\/[^>]+>|\s+)/).filter(Boolean);
    el.innerHTML = html.map(function (part, i) {
      if (/^\s+$/.test(part)) return ' ';
      return '<span class="w"><span style="transition-delay:' + (i * 0.035).toFixed(2) + 's">' + part + '</span></span>';
    }).join('');
    el.classList.add('split');
  });

  // reveal + counters
  function count(el) {
    var n = +el.dataset.n; if (reduce) { el.textContent = n; return; }
    var t0 = performance.now();
    (function f(t) { var p = Math.min(1, (t - t0) / 1500); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll('[data-n]').forEach(count);
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal,.split').forEach(function (el) { io.observe(el); });

  if (fine && !reduce) {
    // cursor glow
    var glow = document.getElementById('glow'), gx = innerWidth / 2, gy = innerHeight / 2, cx = gx, cy = gy;
    if (glow) {
      addEventListener('pointermove', function (e) { gx = e.clientX; gy = e.clientY; body.classList.add('has-pointer'); }, { passive: true });
      (function loop() { cx += (gx - cx) * .12; cy += (gy - cy) * .12; glow.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
    }
    // tilt + light on cards
    document.querySelectorAll('.tilt').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        c.style.transform = 'perspective(1000px) rotateX(' + ((.5 - y) * 6) + 'deg) rotateY(' + ((x - .5) * 8) + 'deg) translateY(-4px)';
        c.style.setProperty('--mx', x * 100 + '%'); c.style.setProperty('--my', y * 100 + '%');
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
    // magnetic buttons
    document.querySelectorAll('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18) + 'px,' + ((e.clientY - r.top - r.height / 2) * .28) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  // sub-page hero: living aurora on a 2D canvas
  var au = document.getElementById('aurora');
  if (au) {
    var ctx = au.getContext('2d'), W, H, t = 0, dpr = Math.min(devicePixelRatio || 1, 2);
    var blobs = [
      { c: [164, 108, 255], x: .72, y: .38, r: .42, sx: .00031, sy: .00023 },
      { c: [94, 240, 176], x: .86, y: .7, r: .30, sx: .00027, sy: .00037 },
      { c: [232, 194, 122], x: .55, y: .2, r: .22, sx: .00041, sy: .00019 },
      { c: [123, 63, 224], x: .3, y: .8, r: .34, sx: .00022, sy: .00029 }
    ];
    function size() { W = au.clientWidth; H = au.clientHeight; au.width = W * dpr; au.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    addEventListener('resize', size); size();
    var stars = []; for (var i = 0; i < 140; i++) stars.push([Math.random(), Math.random(), Math.random() * 1.3 + .2, Math.random() * 6]);
    var vis = true; new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(au);
    (function draw() {
      requestAnimationFrame(draw); if (!vis) return; t += reduce ? 0 : 16;
      ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = 'lighter';
      blobs.forEach(function (b, k) {
        var x = (b.x + Math.sin(t * b.sx + k) * .08) * W, y = (b.y + Math.cos(t * b.sy + k * 2) * .1) * H, r = b.r * Math.max(W, H);
        var g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, 'rgba(' + b.c + ',.30)'); g.addColorStop(1, 'rgba(' + b.c + ',0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      });
      ctx.globalCompositeOperation = 'source-over';
      stars.forEach(function (s) { ctx.fillStyle = 'rgba(255,255,255,' + (.25 + .35 * Math.sin(t * .002 + s[3])) + ')'; ctx.fillRect(s[0] * W, s[1] * H, s[2], s[2]); });
    })();
  }

  // home hero: 3D scene
  var gl = document.getElementById('gl');
  if (gl) {
    var fallback = function () { gl.style.background = 'radial-gradient(circle at 72% 42%,rgba(164,108,255,.38),transparent 58%),radial-gradient(circle at 85% 75%,rgba(94,240,176,.18),transparent 50%)'; };
    if (innerWidth < 760 || (navigator.hardwareConcurrency || 8) <= 4) { gl.classList.add('orb-mode'); return; }
    if (!window.THREE) {
      var sc = document.createElement('script');
      sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      sc.integrity = 'sha384-CI3ELBVUz9XQO+97x6nwMDPosPR5XvsxW2ua7N1Xeygeh1IxtgqtCkGfQY9WWdHu'; sc.crossOrigin = 'anonymous';
      sc.onload = function () { start3D(); }; sc.onerror = fallback;
      document.head.appendChild(sc); return;
    }
    start3D(); return;
    function start3D() {
    var R; try { R = new THREE.WebGLRenderer({ canvas: gl, antialias: true, alpha: true }); } catch (e) { return fallback(); }
    var small = innerWidth < 760;
    R.setPixelRatio(small ? 1 : Math.min(devicePixelRatio, 2));
    var go3d = false; var startIt = function () { go3d = true; };
    if (document.readyState === 'complete') setTimeout(startIt, 900); else addEventListener('load', function () { setTimeout(startIt, 900); });
    var S = new THREE.Scene(), C = new THREE.PerspectiveCamera(55, 1, .1, 200); C.position.set(0, 0, 14);
    var G = new THREE.Group(); S.add(G);
    var core = new THREE.Mesh(new THREE.IcosahedronGeometry(3.1, 1), new THREE.MeshBasicMaterial({ color: 0xa46cff, wireframe: true, transparent: true, opacity: .55 }));
    var inner = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9, 0), new THREE.MeshBasicMaterial({ color: 0x5ef0b0, wireframe: true, transparent: true, opacity: .55 }));
    var nucleus = new THREE.Mesh(new THREE.SphereGeometry(.55, 24, 24), new THREE.MeshBasicMaterial({ color: 0xe8c27a, transparent: true, opacity: .85 }));
    var ring = new THREE.Mesh(new THREE.TorusGeometry(4.6, .012, 8, 180), new THREE.MeshBasicMaterial({ color: 0xe8c27a, transparent: true, opacity: .5 }));
    ring.rotation.x = 1.15; var ring2 = ring.clone(); ring2.rotation.set(.4, .6, 0); ring2.scale.setScalar(1.18);
    G.add(core, inner, nucleus, ring, ring2);
    // satellites orbiting on the rings
    var sats = []; for (var s = 0; s < 6; s++) { var m = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 10), new THREE.MeshBasicMaterial({ color: s % 2 ? 0x5ef0b0 : 0xa46cff })); G.add(m); sats.push(m); }
    var N = small ? 450 : 1100, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), c1 = new THREE.Color(0xa46cff), c2 = new THREE.Color(0x5ef0b0), c3 = new THREE.Color(0xe8c27a), tmp = new THREE.Color();
    for (var i = 0; i < N; i++) {
      var r = 6 + Math.random() * 18, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th); pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * .6; pos[i * 3 + 2] = r * Math.cos(ph);
      tmp.copy(Math.random() < .12 ? c3 : c1).lerp(c2, Math.random() * .8); col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
    }
    var pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var dots = new THREE.Points(pg, new THREE.PointsMaterial({ size: .07, vertexColors: true, transparent: true, opacity: .85 })); S.add(dots);
    var mx = 0, my = 0, tx = 0, ty = 0;
    addEventListener('pointermove', function (e) { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
    function sz() {
      var w = gl.clientWidth, h = gl.clientHeight; R.setSize(w, h, false); C.aspect = w / h; C.updateProjectionMatrix();
      G.position.x = w > 980 ? 6.2 : 0; G.position.y = w > 980 ? -.2 : 5.2; G.scale.setScalar(w > 980 ? .95 : .5);
    }
    addEventListener('resize', sz); sz();
    var on = true; new IntersectionObserver(function (e) { on = e[0].isIntersecting; }).observe(gl);
    var T = 0;
    (function loop() {
      requestAnimationFrame(loop); if (!on || !go3d) return;
      T += reduce ? 0 : .004; mx += (tx - mx) * .05; my += (ty - my) * .05;
      var sc = Math.min(1, scrollY / innerHeight);
      core.rotation.y = T * 1.2 + mx * .8; core.rotation.x = T * .6 + my * .6;
      inner.rotation.y = -T * 1.8; inner.rotation.z = T;
      nucleus.scale.setScalar(1 + Math.sin(T * 6) * .08);
      ring.rotation.z = T * .8; ring2.rotation.z = -T * .6;
      sats.forEach(function (m, k) { var a = T * (1.4 + k * .15) + k * 1.05, rr = 4.6 * (k % 2 ? 1.18 : 1); m.position.set(Math.cos(a) * rr, Math.sin(a) * rr * (k % 2 ? .55 : .42), Math.sin(a) * rr * .5); });
      dots.rotation.y = T * .25 + mx * .3; dots.rotation.x = my * .2;
      G.rotation.y = sc * 1.2; C.position.z = 14 + sc * 6; C.position.y = -sc * 2;
      R.render(S, C);
    })();
    }
  }

  // contact form builds a WhatsApp message (nothing is stored or sent anywhere else)
  var f = document.querySelector('form.wa');
  if (f) f.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(f), msg = 'Hi Emmanuel, I\'m ' + (d.get('name') || '') + (d.get('business') ? ' from ' + d.get('business') : '') + '.\n' +
      'I\'m interested in: ' + (d.get('need') || '') + '.\n' + (d.get('message') || '');
    window.open('https://wa.me/254740562812?text=' + encodeURIComponent(msg.trim()), '_blank', 'noopener');
  });
})();

/* v2: rotating industry line + enquiry simulator */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rot = document.querySelector('.rot');
  if (rot && !reduce) {
    var words = rot.dataset.words.split('|'), i = 0;
    setInterval(function () {
      rot.classList.add('out');
      setTimeout(function () { i = (i + 1) % words.length; rot.textContent = words[i]; rot.classList.remove('out'); }, 360);
    }, 2400);
  }
  var chat = document.getElementById('simchat'), log = document.getElementById('simlog');
  if (!chat || !log) return;
  var script = [
    ['them', 'Hi, is the 1 acre near Kenol still available? What\'s the price?', 'Buyer · 10:02 pm'],
    ['me', 'Hi! 👋 Yes, the 1 acre on Thika Road near Kenol is available at KES 27M, with direct road frontage. Are you buying to build, or as an investment?', 'Auto-reply · 10:02 pm'],
    ['them', 'Investment. Can I see it this weekend?', 'Buyer · 10:03 pm'],
    ['me', 'Of course. Saturday 10am or Sunday 2pm? I\'ll send the location pin and the title details. 📍', 'Auto-reply · 10:03 pm'],
    ['them', 'Saturday 10am works', 'Buyer · 10:04 pm'],
    ['me', 'Booked ✅ Saturday 10am, Kenol. You\'ll get a reminder the evening before. See you there!', 'Auto-reply · 10:04 pm']
  ];
  var leads = [
    ['New enquiry · 1 acre, Kenol', [['KES 27M', ''], ['Investment', '']]],
    ['Site visit booked · Sat 10am', [['Hot lead', 'hot'], ['Reminder set', 'ok']]]
  ];
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  function addBubble(m) {
    var b = document.createElement('div'); b.className = 'bub ' + m[0];
    b.innerHTML = esc(m[1]) + '<small>' + esc(m[2]) + '</small>';
    chat.appendChild(b); requestAnimationFrame(function () { requestAnimationFrame(function () { b.classList.add('in'); }); });
  }
  function addLead(l) {
    var e = log.querySelector('.ll-empty'); if (e) e.remove();
    var d = document.createElement('div'); d.className = 'lead';
    d.innerHTML = '<b>' + esc(l[0]) + '</b><div class="row2">' + l[1].map(function (k) { return '<span class="k ' + k[1] + '">' + esc(k[0]) + '</span>'; }).join('') + '</div>';
    log.appendChild(d); requestAnimationFrame(function () { requestAnimationFrame(function () { d.classList.add('in'); }); });
  }
  var typing = document.createElement('div'); typing.className = 'typing'; typing.innerHTML = '<i></i><i></i><i></i>';
  function run() {
    chat.innerHTML = ''; log.innerHTML = '<div class="ll-empty">Waiting for enquiries…</div>'; chat.appendChild(typing);
    if (reduce) { script.forEach(addBubble); leads.forEach(addLead); return; }
    var t = 400;
    script.forEach(function (m, k) {
      if (m[0] === 'me') { setTimeout(function () { chat.appendChild(typing); typing.classList.add('on'); }, t); t += 1100; }
      setTimeout(function () { typing.classList.remove('on'); addBubble(m); if (k === 1) addLead(leads[0]); if (k === 5) addLead(leads[1]); }, t);
      t += m[0] === 'them' ? 1700 : 1500;
    });
    setTimeout(run, t + 5000);
  }
  var started = false;
  new IntersectionObserver(function (es) { if (es[0].isIntersecting && !started) { started = true; run(); } }, { threshold: .3 }).observe(chat);
})();
