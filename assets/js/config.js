/* ============================================================
   EDIT THIS FILE TO PERSONALISE YOUR INVITATION
   Everything the guest sees comes from the values below.
   ============================================================ */
window.INVITE = {
  /* --- The couple --- */
  groom: {
    name: "Hussein",                  // shown large, in script
    fullName: "Hussein Zreik",        // shown on the invitation itself
    parents: "Mr & Mrs Zreik"
  },
  bride: {
    name: "Maha",
    fullName: "Maha Maatouk",
    parents: "Mr & Mrs Maatouk"
  },
  arabicNames: "حسين و مها",          // shown under the English, in the hero
  monogram: "H&M",          // shown on the wax seal
  ceremony: "Engagement",          // used in the invitation heading
  welcomeLine: "Welcome to our Engagement",   // shown on the opening screen

  /* --- The date (scratch cards + countdown + calendar file) ---
     `iso` drives the countdown and the "Add to calendar" file.
     Format: YYYY-MM-DDTHH:MM:SS  (local time of the venue)      */
  date: {
    day: "03",                        // the day of the month
    month: "October",
    year: "2026",
    weekday: "Saturday",              // leave empty if unknown
    time: "",                         // e.g. "7:00 PM onwards" — the "Add to
                                      //   calendar" button appears once this is set
    /* `iso` drives the countdown (YYYY-MM-DDTHH:MM:SS, venue local time).
       It is set to the start of the day; put the real start time in here
       together with `time` above once the hour is fixed.                 */
    iso: "2026-10-03T00:00:00",
    durationHours: 5
  },

  /* --- Where --- */
  venue: {
    name: "Maatouk Restaurant",
    address: "",                      // set to "" — the line is hidden until
                                      //   the street address is known
    mapsUrl: "https://maps.app.goo.gl/wttgzM85Fj6KrSnF7"
  },

  /* --- Words --- */
  invitationLine: "Join us for an evening of love, laughter, and unforgettable memories as we begin our forever.",
  closingDuaArabic:
    "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ",
  closingDua:
    "“And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquillity with them, and He has put love and mercy between your hearts.”",
  closingDuaRef: "Surah Ar-Rum · 30:21",

  /* --- RSVP ---
     While `whatsapp` is empty the button just opens the WhatsApp app, with
     no chat and nobody to reply to. Put a number in — international format,
     digits only, no + or spaces (Lebanon: 961XXXXXXXX) — and it opens that
     conversation instead, with `message` pre-typed if one is set.         */
  rsvp: {
    whatsapp: "",
    message: "Assalamu Alaikum! I received your invitation — I would love to attend the engagement of Hussein & Maha.",
    byDate: "20 September 2026"
  },

  /* --- Optional background music ---
     Drop an mp3 in assets/audio/ and put its path here, e.g.
     music: "assets/audio/nasheed.mp3"   (leave "" to hide the button) */
  music: ""
};
