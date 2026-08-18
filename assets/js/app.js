/* ============================================================
   Engagement invitation — behaviour
   (envelope, scratch-to-reveal, countdown, calendar, RSVP)
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.INVITE || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- content binding ---------------- */
  var eventDate = new Date(cfg.date && cfg.date.iso ? cfg.date.iso : "");
  var validDate = !isNaN(eventDate.getTime());

  function pad(n) { return String(n).padStart(2, "0"); }

  var values = {
    monogram:     cfg.monogram,
    arabicNames:  cfg.arabicNames,
    welcomeLine:  cfg.welcomeLine,
    groomName:    cfg.groom && cfg.groom.name,
    brideName:    cfg.bride && cfg.bride.name,
    groomFullName: cfg.groom && (cfg.groom.fullName || cfg.groom.name),
    brideFullName: cfg.bride && (cfg.bride.fullName || cfg.bride.name),
    groomParents: cfg.groom && cfg.groom.parents,
    brideParents: cfg.bride && cfg.bride.parents,
    ceremonyCaps: (cfg.ceremony || "") + " of",
    day:          cfg.date && cfg.date.day,
    month:        cfg.date && cfg.date.month,
    year:         cfg.date && cfg.date.year,
    weekday:      cfg.date && cfg.date.weekday,
    time:         cfg.date && cfg.date.time,
    /* until the exact day is set, the hero and the line under the cards show
       only what is actually known */
    heroDate:     validDate
      ? pad(eventDate.getDate()) + " · " + pad(eventDate.getMonth() + 1) + " · " + eventDate.getFullYear()
      : [cfg.date && cfg.date.day, cfg.date && cfg.date.month, cfg.date && cfg.date.year]
          .filter(function (part) { return part && part !== "TBC"; }).join(" · "),
    dateLine:     [cfg.date && cfg.date.weekday, cfg.date && cfg.date.time]
                    .filter(Boolean).join(" · "),
    venueName:    cfg.venue && cfg.venue.name,
    venueAddress: cfg.venue && cfg.venue.address,
    invitationLine: cfg.invitationLine,
    closingDua:   cfg.closingDua,
    closingDuaRef: cfg.closingDuaRef,
    rsvpBy:       cfg.rsvp && cfg.rsvp.byDate
  };

  Object.keys(values).forEach(function (key) {
    var text = values[key];
    if (text == null || text === "") return;
    document.querySelectorAll('[data-bind="' + key + '"]').forEach(function (el) {
      el.textContent = text;
    });
  });

  var coupleTitle = [values.groomName, values.brideName].filter(Boolean).join(" & ");
  if (coupleTitle) {
    document.title = coupleTitle + " — " + (cfg.ceremony || "") + " Invitation";
  }

  /* ---------------- 1. envelope ---------------- */
  var scene    = document.getElementById("envelopeScene");
  var envelope = document.getElementById("envelope");
  var invite   = document.getElementById("invite");
  var opened   = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;

    envelope.classList.add("is-opening");
    scene.classList.add("is-lit");

    // the four panels swing open (1.15s, the last starting at 0.12s), then the
    // card settles (1.12s in, 0.7s long), then a beat before the scene goes
    var flapDelay = reduceMotion ? 0 : 2150;
    window.setTimeout(function () {
      scene.classList.add("is-open");
      document.body.classList.remove("is-sealed");
      invite.setAttribute("aria-hidden", "false");
      invite.classList.add("is-visible");
      window.scrollTo(0, 0);
      startReveals();
      if (music && cfg.music) tryPlayMusic();
    }, flapDelay);
  }

  if (envelope) {
    envelope.addEventListener("click", openEnvelope);
    envelope.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEnvelope(); }
    });
  }

  /* ---------------- 2. reveal on scroll ---------------- */
  var revealObserver = null;

  function startReveals() {
    var targets = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    targets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------- 3. scratch to reveal ---------------- */
  var cards   = Array.prototype.slice.call(document.querySelectorAll(".scratch-card"));
  var hint    = document.getElementById("scratchHint");
  var weekday = document.querySelector(".weekday");
  var revealedCount = 0;

  function markRevealed(card) {
    if (card.classList.contains("is-revealed")) return;
    card.classList.add("is-revealed");
    revealedCount++;
    if (revealedCount === cards.length) {
      if (hint) hint.classList.add("is-done");
      if (weekday) weekday.classList.add("is-shown");
    }
  }

  function setupScratch(card) {
    var canvas = card.querySelector(".scratch-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d", { willReadFrequently: true });
    var drawing = false;
    var checkQueued = false;

    function paintCover() {
      var rect = canvas.getBoundingClientRect();
      var dpr  = Math.min(window.devicePixelRatio || 1, 2);
      if (!rect.width || !rect.height) return;

      canvas.width  = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // gold foil: a multi-stop diagonal so the "metal" catches light along the card
      var g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      g.addColorStop(0,    "#c9a558");
      g.addColorStop(0.18, "#e8d5a9");
      g.addColorStop(0.34, "#f7efd6");
      g.addColorStop(0.5,  "#c9a558");
      g.addColorStop(0.66, "#8c6d2a");
      g.addColorStop(0.82, "#e2c887");
      g.addColorStop(1,    "#a8813c");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // a brighter band across the corner, the way foil creases
      var sheen = ctx.createLinearGradient(0, rect.height, rect.width, 0);
      sheen.addColorStop(0,    "rgba(255,255,255,0)");
      sheen.addColorStop(0.42, "rgba(255,252,240,.55)");
      sheen.addColorStop(0.55, "rgba(255,255,255,0)");
      ctx.fillStyle = sheen;
      ctx.fillRect(0, 0, rect.width, rect.height);

      ctx.fillStyle = "rgba(255,250,235,.75)";
      ctx.font = (rect.width * 0.22) + "px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("\u2726", rect.width / 2, rect.height / 2);
    }

    function scratchAt(x, y) {
      var rect = canvas.getBoundingClientRect();
      var radius = Math.max(rect.width, rect.height) * 0.2;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x - rect.left, y - rect.top, radius, 0, Math.PI * 2);
      ctx.fill();
      queueCheck();
    }

    function queueCheck() {
      if (checkQueued) return;
      checkQueued = true;
      window.setTimeout(function () {
        checkQueued = false;
        if (clearedRatio() > 0.4) markRevealed(card);
      }, 160);
    }

    function clearedRatio() {
      var w = canvas.width, h = canvas.height;
      if (!w || !h) return 0;
      var data = ctx.getImageData(0, 0, w, h).data;
      var clear = 0, total = 0;
      for (var i = 3; i < data.length; i += 4 * 24) { // sample every 24th pixel
        total++;
        if (data[i] < 40) clear++;
      }
      return total ? clear / total : 0;
    }

    canvas.addEventListener("pointerdown", function (e) {
      drawing = true;
      canvas.setPointerCapture(e.pointerId);
      scratchAt(e.clientX, e.clientY);
    });
    canvas.addEventListener("pointermove", function (e) {
      if (!drawing) return;
      e.preventDefault();
      scratchAt(e.clientX, e.clientY);
    });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (evt) {
      canvas.addEventListener(evt, function () {
        if (!drawing) return;
        drawing = false;
        // a generous finish: a decent scratch is enough, no need to clear it all
        if (clearedRatio() > 0.3) markRevealed(card);
      });
    });

    // keyboard / assistive fallback: double-tap or Enter reveals instantly
    canvas.addEventListener("dblclick", function () { markRevealed(card); });

    card.__repaint = paintCover;
    paintCover();
  }

  if (reduceMotion) {
    cards.forEach(markRevealed);
  } else {
    cards.forEach(setupScratch);
    var repaintTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(repaintTimer);
      repaintTimer = window.setTimeout(function () {
        cards.forEach(function (card) {
          if (!card.classList.contains("is-revealed") && card.__repaint) card.__repaint();
        });
      }, 200);
    });
  }

  /* ---------------- 4. countdown ---------------- */
  var countdown = document.getElementById("countdown");

  function tick() {
    if (!countdown || !validDate) return;
    var diff = eventDate.getTime() - Date.now();
    if (diff <= 0) {
      countdown.innerHTML = '<p class="body-text" style="grid-column:1/-1;margin:0">Today is the day ✦</p>';
      window.clearInterval(timer);
      return;
    }
    var s = Math.floor(diff / 1000);
    var parts = {
      days:    Math.floor(s / 86400),
      hours:   Math.floor(s / 3600) % 24,
      minutes: Math.floor(s / 60) % 60,
      seconds: s % 60
    };
    Object.keys(parts).forEach(function (k) {
      var el = countdown.querySelector('[data-cd="' + k + '"]');
      if (el) el.textContent = k === "days" ? parts[k] : pad(parts[k]);
    });
  }

  var timer = null;
  if (countdown) {
    if (!validDate) {
      countdown.hidden = true;
    } else {
      tick();
      timer = window.setInterval(tick, 1000);
    }
  }

  /* ---------------- 5. maps, calendar, RSVP ---------------- */
  var mapsBtn = document.getElementById("mapsBtn");
  if (mapsBtn) {
    var mapsUrl = (cfg.venue && cfg.venue.mapsUrl) ||
      ("https://maps.google.com/?q=" + encodeURIComponent([cfg.venue && cfg.venue.name, cfg.venue && cfg.venue.address].filter(Boolean).join(" ")));
    mapsBtn.href = mapsUrl;
  }

  var waBtn = document.getElementById("waBtn");
  if (waBtn) {
    var phone = (cfg.rsvp && cfg.rsvp.whatsapp || "").replace(/\D/g, "");
    if (phone) {
      waBtn.href = "https://wa.me/" + phone + "?text=" + encodeURIComponent(cfg.rsvp.message || "");
    } else {
      waBtn.hidden = true;
    }
  }

  var icsBtn = document.getElementById("icsBtn");
  if (icsBtn) {
    if (!validDate) {
      icsBtn.hidden = true;
    } else {
      icsBtn.addEventListener("click", function () {
        var end = new Date(eventDate.getTime() +
          ((cfg.date && cfg.date.durationHours) || 4) * 3600 * 1000);

        function stamp(d) {
          return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + "T" +
                 pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + "00Z";
        }
        function esc(str) {
          return String(str || "").replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
        }

        var lines = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//invitation//EN",
          "BEGIN:VEVENT",
          "UID:" + Date.now() + "@invitation",
          "DTSTAMP:" + stamp(new Date()),
          "DTSTART:" + stamp(eventDate),
          "DTEND:" + stamp(end),
          "SUMMARY:" + esc(coupleTitle + " — " + (cfg.ceremony || "Celebration")),
          "LOCATION:" + esc([cfg.venue && cfg.venue.name, cfg.venue && cfg.venue.address].filter(Boolean).join(", ")),
          "DESCRIPTION:" + esc(cfg.invitationLine),
          "END:VEVENT",
          "END:VCALENDAR"
        ];

        var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = (coupleTitle || "invitation").replace(/\s+/g, "-").toLowerCase() + ".ics";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      });
    }
  }

  /* ---------------- 6. optional music ---------------- */
  var music = null;
  var musicBtn = document.getElementById("musicToggle");

  if (cfg.music && musicBtn) {
    music = new Audio(cfg.music);
    music.loop = true;
    music.volume = 0.4;
    musicBtn.hidden = false;
    musicBtn.addEventListener("click", function () {
      if (music.paused) { tryPlayMusic(); } else { music.pause(); musicBtn.setAttribute("aria-pressed", "false"); }
    });
  }

  function tryPlayMusic() {
    if (!music) return;
    var p = music.play();
    if (p && typeof p.then === "function") {
      p.then(function () { musicBtn.setAttribute("aria-pressed", "true"); })
       .catch(function () { musicBtn.setAttribute("aria-pressed", "false"); });
    }
  }
})();
