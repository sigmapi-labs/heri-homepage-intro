/**
 * Vue wrap can import this object as-is.
 * YouTube longform/shorts load from the live channel — do not hardcode new video IDs.
 * Restrict youtubeApiKey HTTP referrer to heri2go.com.
 * Channel Talk stays on the live site. This intro does not include it.
 */
window.HERI_INTRO_CONFIG = {
  youtubeApiKey: "AIzaSyAosasgexPNin_0KpjwZ4mfkKdYfL4-8EE",

  /* Used only when youtubeApiKey is empty. */
  rssJson: "https://api.rss2json.com/v1/api.json?rss_url=",
  rssProxy: "https://api.allorigins.win/raw?url=",

  youtubeLive: {
    cacheMinutes: 30,
    longformFeatured: 2,
    longformExtra: 3,
    shortsCount: 10,
    shortsVisible: 4,
    shortsRollMs: 5000
  },

  loginUrl: "https://clinic.heri2go.com/clinic/login",
  signupUrl: "https://clinic.heri2go.com/clinic/public/signup",

  companyDeckUrl: "assets/HERI2go_Service_Introduction.pdf",
  labsDeckUrl: "assets/HERI2go_Our_Labs.pdf",

  appStoreUrl: "https://apps.apple.com/us/app/heri2go-clinic/id6767798415",
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.heri2go.clinic",

  reviews: [
    { name: "Dr. M. P••••", practice: "•••• Dental Clinic", role: "General practice", place: "Seoul", stars: 5, text: "We used to call the lab three times on a single shade. That stopped after the first month." },
    { name: "Dr. E. V••••", practice: "•••• Dental Studio", role: "Prosthodontics", place: "Los Angeles, CA", stars: 5, text: "Tried two implant cases first. Fit was tight enough that we moved the rest of the schedule over." },
    { name: "J. W••••, DDS", practice: "•••• Family Dental", role: "General practice", place: "Houston, TX", stars: 4, text: "Not magic — we still check the draft — but chairside time on new orders is down." },
    { name: "Dr. S. K••••", practice: "•••• Implant Center", role: "Implant", place: "Busan", stars: 5, text: "Medit scans landing on the case is the part that matters. Files used to disappear in between." },
    { name: "Dr. P. R••••", practice: "•••• Prosthodontics", role: "Prosthodontics", place: "Boston, MA", stars: 5, text: "One dashboard for Medit and 3Shape. I did not expect that to be the thing that sold the team." },
    { name: "Dr. M. W••••", practice: "•••• Dental Care", role: "General practice", place: "Chicago, IL", stars: 4, text: "Pricing landed where I wanted. A couple of shipping updates lagged; support caught it the same day." },
    { name: "Dr. C. M••••", practice: "•••• Smiles", role: "General practice", place: "Montreal, QC", stars: 5, text: "The 7-day promise sounded like marketing. Our first crown came back on day six." },
    { name: "Dr. S. C••••", practice: "•••• Dentistry", role: "Prosthodontics", place: "New York, NY", stars: 5, text: "Overseas lab, local turnaround. Patients do not ask where it was milled. They ask when they can come in." },
    { name: "Dr. J. L••••", practice: "•••• Dental Clinic", role: "General practice", place: "Incheon", stars: 5, text: "We show patients the sterile packaging. That one photo shortens the consult." },
    { name: "Dr. R. H••••", practice: "•••• Family Dental", role: "General practice", place: "Toronto, ON", stars: 5, text: "Warranty language is actually readable. We stopped padding every case for a mystery remake." },
    { name: "Dr. C. D••••", practice: "•••• Implant Center", role: "Implant", place: "Miami, FL", stars: 5, text: "We ran full-arch first because that is where remakes hurt. Rate dropped. Then we added the rest." },
    { name: "Dr. M. G••••", practice: "•••• Dental Studio", role: "General practice", place: "Atlanta, GA", stars: 4, text: "AI draft saves the boring fields. I still rewrite the clinical notes. That split feels right." },
    { name: "Dr. T. C••••", practice: "•••• Dental Clinic", role: "Prosthodontics", place: "Daegu", stars: 5, text: "Remake rules are clear enough that staff file them. The doctor does not have to call every time." },
    { name: "Dr. N. C••••", practice: "•••• Dental Care", role: "General practice", place: "Brooklyn, NY", stars: 4, text: "Marketplace is wider than our old domestic-only list. We still pick the same two labs — we just got there faster." },
    { name: "Dr. D. K••••", practice: "•••• Dentistry", role: "General practice", place: "Dallas, TX", stars: 5, text: "Notes and photos stay on the order. We are not hunting threads for a shade change anymore." },
    { name: "Dr. A. S••••", practice: "•••• Family Dental", role: "General practice", place: "Seattle, WA", stars: 4, text: "App is enough between patients. I wish the desktop view had the same status chips, but it works." }
  ],

  youtube: {
    handle: "@heri2go",
    channelId: "UCK_8eWcJRrFT3WnQt0NLZmA",
    channelUrl: "https://www.youtube.com/@heri2go",
    videosUrl: "https://www.youtube.com/@heri2go/videos",
    shortsUrl: "https://www.youtube.com/@heri2go/shorts",
    longform: [
      { id: "UCJt2d7vbgU", title: "Would You Trust a Dental Lab in Korea?", featured: true },
      { id: "9ciL9E7JqYw", title: "How to find the best dental lab (HERi2go)", featured: true },
      { id: "_1rV8cjBi8s", title: "How to Signup (Best DENTAL LAB platform)" },
      { id: "9H0Fely_gRs", title: "Introduction of HERi2go service (Typography)" },
      { id: "yjVcIeLVHmY", title: "HERi2go Typograph (Korean Version)" },
      { id: "8MuRoAZM9N0", title: "Introduction of HERi2go service (Korean Version)" },
      { id: "T22wY5jROx4", title: "Introduction of HERi2go service (Infography)" }
    ],
    shorts: []
  }
};
