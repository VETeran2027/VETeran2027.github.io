/* VETeran site behavior. Content lives in content.js; you shouldn't need to edit this file. */
(function () {
  var SITE = window.SITE || {};

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(name) {
    var parts = String(name).trim().split(/\s+/);
    return ((parts[0] || "")[0] || "") + (parts.length > 1 ? parts[parts.length - 1][0] : "");
  }

  /* ---------- "Edit site" tab: only in browsers signed in to the editor ---------- */
  (function editTab() {
    var signedIn = false;
    try {
      signedIn = !!(window.localStorage.getItem("veteran-admin-token") || window.sessionStorage.getItem("veteran-admin-token"));
    } catch (e) {}
    var tabs = document.querySelector(".tabs");
    if (!signedIn || !tabs || tabs.querySelector('a[href="admin.html"]')) return;
    var li = document.createElement("li");
    li.innerHTML = '<a href="admin.html">Edit site</a>';
    tabs.appendChild(li);
    document.body.classList.add("is-editor");
  })();

  /* ---------- Floating bubbles ---------- */
  (function bubbles() {
    var box = document.querySelector(".bubbles");
    if (!box) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var w = window.innerWidth, h = window.innerHeight;
    var count = w < 700 ? 8 : 15;
    var tints = [
      "radial-gradient(circle at 30% 30%, rgba(255,255,255,.9), rgba(205,232,203,.85) 45%, rgba(170,214,167,.8))",
      "radial-gradient(circle at 30% 30%, rgba(255,255,255,.9), rgba(200,226,239,.85) 45%, rgba(160,204,226,.8))",
      "radial-gradient(circle at 30% 30%, rgba(255,255,255,.9), rgba(224,226,225,.85) 45%, rgba(196,199,198,.8))"
    ];
    var list = [];
    for (var i = 0; i < count; i++) {
      var size = Math.random() * 110 + 40;
      var el = document.createElement("div");
      el.className = "bubble";
      el.style.width = el.style.height = size + "px";
      el.style.background = tints[i % tints.length];
      box.appendChild(el);
      list.push({
        el: el, size: size,
        x: Math.random() * Math.max(1, w - size), y: Math.random() * Math.max(1, h - size),
        vx: (Math.random() - 0.5) * 1.0, vy: (Math.random() - 0.5) * 1.0
      });
    }
    function place(b) { b.el.style.transform = "translate3d(" + b.x + "px," + b.y + "px,0)"; }
    list.forEach(place);
    if (reduce) return;
    window.addEventListener("resize", function () { w = window.innerWidth; h = window.innerHeight; });
    (function tick() {
      list.forEach(function (b) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
        if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); }
        if (b.x + b.size > w) { b.x = w - b.size; b.vx = -Math.abs(b.vx); }
        if (b.y + b.size > h) { b.y = h - b.size; b.vy = -Math.abs(b.vy); }
        place(b);
      });
      requestAnimationFrame(tick);
    })();
  })();

  /* ---------- Team ---------- */
  (function team() {
    var box = document.getElementById("team-grid");
    if (!box) return;
    var role = SITE.teamRole || "";
    box.innerHTML = (SITE.team || []).map(function (m) {
      var img = m.photo ? '<img src="' + esc(m.photo) + '" alt="' + esc(m.name) + '" onerror="this.remove()">' : "";
      var log = m.logbook
        ? '<a class="logbook" href="' + esc(m.logbook) + '" target="_blank" rel="noopener noreferrer">Logbook</a>'
        : '<span class="logbook off" title="Logbook link not added yet">Logbook</span>';
      return '<div class="member">' +
        '<div class="avatar">' + esc(initials(m.name)) + img + '</div>' +
        '<div class="name">' + esc(m.name) + '</div>' +
        (role ? '<div class="role">' + esc(role) + '</div>' : "") +
        log + '</div>';
    }).join("");
  })();

  /* ---------- Gallery ---------- */
  (function gallery() {
    var root = document.getElementById("gallery");
    if (!root) return;
    var items = SITE.gallery || [];
    if (!items.length) { root.innerHTML = '<p class="caption">Photos coming soon.</p>'; return; }
    var i = 0;
    root.innerHTML =
      '<div class="frame"><img id="g-img" alt=""></div>' +
      '<div class="caption" id="g-cap"></div>' +
      '<div class="gallery-controls">' +
        '<button class="btn" id="g-prev" type="button">Back</button>' +
        '<span class="counter" id="g-count"></span>' +
        '<button class="btn" id="g-next" type="button">Forward</button>' +
      '</div>';
    var img = document.getElementById("g-img"), cap = document.getElementById("g-cap"), cnt = document.getElementById("g-count");
    function show(n) {
      i = (n + items.length) % items.length;
      img.classList.add("fading");
      setTimeout(function () {
        img.src = items[i].src;
        img.alt = items[i].caption || ("Gallery photo " + (i + 1));
        cap.textContent = items[i].caption || "";
        cnt.textContent = (i + 1) + " / " + items.length;
        img.classList.remove("fading");
      }, 150);
    }
    document.getElementById("g-prev").onclick = function () { show(i - 1); };
    document.getElementById("g-next").onclick = function () { show(i + 1); };
    var sx = null;
    root.addEventListener("touchstart", function (e) { sx = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (sx == null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
      sx = null;
    });
    // Preload so clicking through is instant
    items.forEach(function (it) { var p = new Image(); p.src = it.src; });
    show(0);
  })();

  /* ---------- Contact ---------- */
  (function contact() {
    var box = document.getElementById("contact-list");
    if (!box) return;
    var c = SITE.contact || {};
    var icons = {
      email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
      address: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
      github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>',
      website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>'
    };
    var rows = [
      ["email", "Email", c.email ? '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a>' : ""],
      ["address", "Address", c.address ? '<span>' + esc(c.address) + '</span>' : ""],
      ["github", "GitHub", c.github ? '<a href="' + esc(c.github) + '" target="_blank" rel="noopener">' + esc(c.github.replace(/^https?:\/\//, "")) + '</a>' : ""],
      ["website", "Website", c.website ? '<a href="' + esc(c.website) + '">' + esc(c.website.replace(/^https?:\/\//, "")) + '</a>' : ""]
    ];
    box.innerHTML = rows.filter(function (r) { return r[2]; }).map(function (r) {
      return '<div class="contact-row"><div class="ico">' + icons[r[0]] + '</div><div><strong>' + r[1] + '</strong>' + r[2] + '</div></div>';
    }).join("");
  })();

  /* ---------- Documents ---------- */
  (function documents() {
    var root = document.getElementById("courses");
    if (!root) return;
    var fileIco = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>';
    var linkIco = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>';
    var clockIco = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
    function isPdf(link) { return /\.pdf(\?|#|$)/i.test(link) && !/^https?:/i.test(link); }

    root.innerHTML = (SITE.documents || []).map(function (course, ci) {
      var items = (course.items || []).map(function (d, di) {
        if (!d.link) {
          return '<li><div class="doc off"><span class="ico">' + clockIco + '</span><span class="t">' + esc(d.title) + '</span><span class="hint">Coming soon</span></div></li>';
        }
        if (isPdf(d.link)) {
          return '<li><button class="doc" type="button" aria-expanded="false" data-course="' + ci + '" data-src="' + esc(d.link) + '" data-title="' + esc(d.title) + '">' +
            '<span class="ico">' + fileIco + '</span><span class="t">' + esc(d.title) + '</span><span class="hint">View PDF</span></button></li>';
        }
        return '<li><a class="doc" href="' + esc(d.link) + '" target="_blank" rel="noopener noreferrer">' +
          '<span class="ico">' + linkIco + '</span><span class="t">' + esc(d.title) + '</span><span class="hint">Open ↗</span></a></li>';
      }).join("");
      return '<section class="course"><h2>' + esc(course.course) + '</h2><ul class="doc-list">' + items + '</ul><div class="viewer" id="viewer-' + ci + '" hidden></div></section>';
    }).join("") || '<p class="page-sub">No documents yet.</p>';

    root.addEventListener("click", function (e) {
      var btn = e.target.closest("button.doc");
      if (btn) {
        var ci = btn.getAttribute("data-course"), viewer = document.getElementById("viewer-" + ci);
        var open = btn.getAttribute("aria-expanded") === "true";
        root.querySelectorAll('button.doc[data-course="' + ci + '"]').forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
        if (open) { viewer.hidden = true; viewer.innerHTML = ""; return; }
        btn.setAttribute("aria-expanded", "true");
        var src = btn.getAttribute("data-src");
        viewer.innerHTML =
          '<div class="viewer-bar"><span><b>' + esc(btn.getAttribute("data-title")) + '</b></span>' +
          '<span><a href="' + esc(src) + '" target="_blank" rel="noopener">Open in new tab ↗</a> &nbsp; <button type="button" class="close-viewer">Close ✕</button></span></div>' +
          '<iframe src="' + esc(src) + '" title="' + esc(btn.getAttribute("data-title")) + '">' +
          'This browser can\'t show PDFs inline. <a href="' + esc(src) + '">Download the PDF</a>.</iframe>';
        viewer.hidden = false;
        viewer.scrollIntoView({ behavior: "smooth", block: "nearest" });
        return;
      }
      var close = e.target.closest(".close-viewer");
      if (close) {
        var v = close.closest(".viewer");
        v.hidden = true; v.innerHTML = "";
        root.querySelectorAll("button.doc").forEach(function (b) {
          if ("viewer-" + b.getAttribute("data-course") === v.id) b.setAttribute("aria-expanded", "false");
        });
      }
    });
  })();
})();
