/* ============================================================
   EDIT THIS FILE TO PERSONALISE YOUR INVITATION
   Everything the guest sees comes from the values below.
   ============================================================ */
window.INVITE = {
  /* --- The couple --- */
  groom: {
    name: "Daanish",
    parents: "Mr & Mrs Ch. Hussaini"
  },
  bride: {
    name: "Adeena",
    parents: "Mr & Mrs Ch. Farooqi"
  },
  monogram: "D&A",          // shown on the wax seal
  ceremony: "Engagement",          // used in the invitation heading
  welcomeLine: "Welcome to our Engagement",   // shown on the opening screen

  /* --- The date (scratch cards + countdown + calendar file) ---
     `iso` drives the countdown and the "Add to calendar" file.
     Format: YYYY-MM-DDTHH:MM:SS  (local time of the venue)      */
  date: {
    day: "10",
    month: "January",
    year: "2027",
    weekday: "Sunday",
    time: "5:00 PM onwards",
    iso: "2027-01-10T17:00:00",
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
    message: "Assalamu Alaikum! I received your invitation — I would love to attend the engagement of Daanish & Adeena.",
    byDate: "20 December 2026"
  },

  /* --- Optional background music ---
     Drop an mp3 in assets/audio/ and put its path here, e.g.
     music: "assets/audio/nasheed.mp3"   (leave "" to hide the button) */
  music: ""
};
