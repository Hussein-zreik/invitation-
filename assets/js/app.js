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
    closingDuaArabic: cfg.closingDuaArabic,
    closingDua:   cfg.closingDua,
    closingDuaRef: cfg.closingDuaRef,
    rsvpBy:       cfg.rsvp && cfg.rsvp.byDate
  };

  /* A value left out of the config (null/undefined) keeps whatever the HTML
     already says; a value set to "" removes the element, so a detail that is
     not known yet leaves no placeholder behind.                            */
  Object.keys(values).forEach(function (key) {
    var text = values[key];
    if (text == null) return;
    document.querySelectorAll('[data-bind="' + key + '"]').forEach(function (el) {
      if (text === "") { el.hidden = true; return; }
      el.hidden = false;
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
  /* Coordinates first: they go through Google's official Maps URL format,
     which opens the app on a phone and never depends on a short link that
     can expire. `mapsUrl` is the fallback, then a plain name search.      */
  var mapsBtn = document.getElementById("mapsBtn");
  if (mapsBtn) {
    var v = cfg.venue || {};
    var coords = (v.coords || "").replace(/\s+/g, "");
    if (coords) {
      mapsBtn.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(coords);
    } else if (v.mapsUrl) {
      mapsBtn.href = v.mapsUrl;
    } else {
      mapsBtn.href = "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent([v.name, v.address].filter(Boolean).join(" "));
    }
  }

  /* With no number set, the button simply opens WhatsApp — no chat, no
     recipient, nothing pre-typed. Put a number in `rsvp.whatsapp` and it
     opens that conversation instead.                                     */
  var waBtn = document.getElementById("waBtn");
  if (waBtn) {
    var phone = (cfg.rsvp && cfg.rsvp.whatsapp || "").replace(/\D/g, "");
    if (phone) {
      waBtn.href = "https://wa.me/" + phone +
        (cfg.rsvp.message ? "?text=" + encodeURIComponent(cfg.rsvp.message) : "");
    } else {
      waBtn.href = "whatsapp://";
      waBtn.removeAttribute("target");
      waBtn.removeAttribute("rel");
    }
  }

  /* The calendar file needs a real start time, not just a date, so the
     button stays hidden until `date.time` is filled in.                  */
  var icsBtn = document.getElementById("icsBtn");
  if (icsBtn) {
    if (!validDate || !(cfg.date && cfg.date.time)) {
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

  /* ---------------- 7. ambient gold ----------------
     Motes of gold leaf drifting slowly upward, over the whole viewport.
     The layer is fixed and never toggles, so the envelope screen and the
     scrolled invitation sit in the same air.                             */
  (function ambientGold() {
    var canvas = document.getElementById("ambient");
    if (!canvas || reduceMotion || !canvas.getContext) return;

    var ctx = canvas.getContext("2d");
    var motes = [];
    var w = 0, h = 0;
    var running = true;

    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    /* density follows the area, so a phone is not as busy as a laptop */
    function seed() {
      var count = Math.round(Math.min(44, Math.max(14, (w * h) / 27000)));
      motes = [];
      for (var i = 0; i < count; i++) motes.push(mote(true));
    }

    function mote(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 12,
        r: 0.6 + Math.random() * 1.6,
        vy: -(0.07 + Math.random() * 0.2),
        drift: (Math.random() - 0.5) * 0.14,
        phase: Math.random() * Math.PI * 2,
        spin: 0.004 + Math.random() * 0.011,
        alpha: 0.3 + Math.random() * 0.45
      };
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.y += m.vy;
        m.phase += m.spin;
        m.x += m.drift + Math.sin(m.phase) * 0.2;
        if (m.y < -14 || m.x < -14 || m.x > w + 14) { motes[i] = mote(false); continue; }

        /* each mote breathes a little, the way leaf catches the light.
           A near-white core inside a gold halo: the core carries the mote
           over the envelope scene's mid-tan, the halo carries it over the
           near-white paper of the invitation. One flat gold could not read
           against both.                                                   */
        var a = m.alpha * (0.55 + 0.45 * Math.sin(m.phase * 1.7));
        var rr = m.r * 3.4;
        var g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, rr);
        g.addColorStop(0,   "rgba(255,247,219," + a + ")");
        g.addColorStop(0.3, "rgba(226,200,135," + (a * 0.85) + ")");
        g.addColorStop(0.62,"rgba(176,141,63,"  + (a * 0.4) + ")");
        g.addColorStop(1,   "rgba(176,141,63,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, rr, 0, Math.PI * 2);
        ctx.fill();
      }
      window.requestAnimationFrame(frame);
    }

    window.addEventListener("resize", size);

    /* a background tab should not burn the battery */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        running = false;
      } else if (!running) {
        running = true;
        window.requestAnimationFrame(frame);
      }
    });

    size();
    window.requestAnimationFrame(frame);
  })();

  /* ---------------- 8. the deck ----------------
     The invitation is read a screen at a time: each section holds the
     whole viewport and crosses into the next instead of scrolling past
     it, and its contents arrive in sequence every time it comes round.
     The envelope is untouched — it is still the gate onto all of this. */
  (function deck() {
    var wrap   = document.getElementById("invite");
    var cue    = document.getElementById("deckCue");
    if (!wrap) return;

    var slides = Array.prototype.slice.call(wrap.children);
    if (slides.length < 2) return;

    var index = 0;
    var busy  = false;
    var STEP  = reduceMotion ? 0 : 820;   /* the length of one crossing */

    /* The reveal observer belongs to a scrolling page: every slide sits at
       inset:0, so it would count them all as arrived at once. On a deck the
       slides hand out their own reveals instead.                          */
    function takeOverReveals() {
      if (revealObserver) { revealObserver.disconnect(); revealObserver = null; }
      wrap.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.remove("is-in");
        el.style.transitionDelay = "";
      });
    }

    /* contents arrive in sequence, the way a hand lays cards down */
    function dealIn(slide) {
      var items = slide.querySelectorAll(".reveal");
      items.forEach(function (el, i) {
        el.style.transitionDelay = reduceMotion ? "0ms" : (90 + i * 130) + "ms";
        el.classList.add("is-in");
      });
    }

    function dealOut(slide) {
      slide.querySelectorAll(".reveal").forEach(function (el) {
        el.style.transitionDelay = "";
        el.classList.remove("is-in");
      });
    }

    function show(n) {
      n = Math.max(0, Math.min(slides.length - 1, n));
      if (n === index || busy) return;

      var from = slides[index];
      var to   = slides[n];
      busy = true;

      from.classList.remove("is-live");
      from.setAttribute("aria-hidden", "true");
      to.classList.add("is-live");
      to.removeAttribute("aria-hidden");
      to.scrollTop = 0;
      index = n;

      dealIn(to);
      /* the one we left only resets once it is out of sight, so nothing
         is seen snapping back mid-cross                                 */
      window.setTimeout(function () { dealOut(from); busy = false; }, STEP);

      cue.classList.toggle("is-on", index < slides.length - 1);
    }

    function next() { show(index + 1); }
    function prev() { show(index - 1); }

    /* --- a scratch card owns its own gestures --- */
    function isScratch(el) {
      return !!(el && el.closest && el.closest(".scratch-card"));
    }

    /* --- a slide taller than the screen scrolls before it hands over --- */
    function atEnd(slide, down) {
      if (slide.scrollHeight <= slide.clientHeight + 2) return true;
      return down
        ? slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 2
        : slide.scrollTop <= 2;
    }

    var wheelLock = 0;
    wrap.addEventListener("wheel", function (e) {
      var now = Date.now();
      if (now - wheelLock < 700 || Math.abs(e.deltaY) < 12) return;
      var down = e.deltaY > 0;
      if (!atEnd(slides[index], down)) return;
      wheelLock = now;
      down ? next() : prev();
    }, { passive: true });

    var y0 = null, t0 = 0;
    wrap.addEventListener("touchstart", function (e) {
      if (isScratch(e.target)) { y0 = null; return; }
      y0 = e.touches[0].clientY;
      t0 = Date.now();
    }, { passive: true });

    wrap.addEventListener("touchend", function (e) {
      if (y0 === null) return;
      var dy = e.changedTouches[0].clientY - y0;
      var quick = Date.now() - t0 < 700;
      y0 = null;
      if (Math.abs(dy) < (quick ? 40 : 70)) return;
      var down = dy < 0;
      if (!atEnd(slides[index], down)) return;
      down ? next() : prev();
    }, { passive: true });

    document.addEventListener("keydown", function (e) {
      if (document.body.classList.contains("is-sealed")) return;
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); next(); }
      else if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); prev(); }
      else if (e.key === "Home") { e.preventDefault(); show(0); }
      else if (e.key === "End")  { e.preventDefault(); show(slides.length - 1); }
    });

    cue.addEventListener("click", next);

    /* the hero's own cue used to jump to an anchor; here it hands over */
    var heroCue = wrap.querySelector(".scroll-cue");
    if (heroCue) heroCue.addEventListener("click", function (e) { e.preventDefault(); next(); });

    /* --- start once the envelope has been opened --- */
    function begin() {
      wrap.classList.add("is-deck");
      takeOverReveals();
      slides.forEach(function (el, i) {
        if (i !== 0) el.setAttribute("aria-hidden", "true");
      });
      slides[0].classList.add("is-live");
      cue.hidden = false;
      dealIn(slides[0]);
      window.setTimeout(function () { cue.classList.add("is-on"); }, 700);
    }

    if (wrap.classList.contains("is-visible")) {
      begin();
    } else {
      new MutationObserver(function (m, obs) {
        if (wrap.classList.contains("is-visible")) { obs.disconnect(); begin(); }
      }).observe(wrap, { attributes: true, attributeFilter: ["class"] });
    }
  })();
})();
