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
    day: "TBC",                       // the day of the month, once it is set
    month: "September",
    year: "2026",
    weekday: "",                      // e.g. "Saturday" — leave empty if unknown
    time: "",                         // e.g. "7:00 PM onwards"
    /* Fill `iso` in once the day is fixed (YYYY-MM-DDTHH:MM:SS) and the
       countdown and the "Add to calendar" button appear on their own.
       While it is empty, both stay hidden.                              */
    iso: "",
    durationHours: 5
  },

  /* --- Where --- */
  venue: {
    name: "Noor Banquet Hall",
    address: "12 Rose Garden Avenue, Lahore",
    mapsUrl: "https://maps.google.com/?q=Noor+Banquet+Hall+Lahore"
  },

  /* --- Words --- */
  invitationLine: "Join us for an evening of love, laughter, duas, and unforgettable memories as we begin our forever.",
  closingDua:
    "“And among His signs is that He created for you mates from among yourselves, that you may dwell in tranquillity with them, and He has put love and mercy between your hearts.”",
  closingDuaRef: "Surah Ar-Rum · 30:21",

  /* --- RSVP ---
     Phone in international format, digits only (no + or spaces).  */
  rsvp: {
    whatsapp: "923001234567",
    message: "Assalamu Alaikum! I received your invitation — I would love to attend the engagement of Hussein & Maha.",
    byDate: "1 August 2026"
  },

  /* --- Optional background music ---
     Drop an mp3 in assets/audio/ and put its path here, e.g.
     music: "assets/audio/nasheed.mp3"   (leave "" to hide the button) */
  music: ""
};
