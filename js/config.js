/**
 * Handoff notes for Vue wrap
 * - Keep this object. The Vue app can import the same data.
 * - youtubeMode: "prod" loads @HERIBioInc. "test" is the old MrBeast fixture.
 * - YouTube longform/shorts load live from the channel. Do not ask the vendor
 *   to paste new video IDs after each upload.
 * - Production: put a YouTube Data API v3 key in youtubeApiKey (HTTP referrer
 *   restricted to heri2go.com). Quota is tiny if results are cached.
 * - Until that key exists, the page reads the public channel RSS via rssJson
 *   (rss2json). rssProxy is a XML fallback. Replace both before launch if you
 *   do not want a third-party dependency.
 * - Channel Talk stays on the live site. This intro HTML does not include it.
 */
window.HERI_INTRO_CONFIG = {
  youtubeMode: "prod",

  youtubeApiKey: "AIzaSyAosasgexPNin_0KpjwZ4mfkKdYfL4-8EE",

  /* Used only when youtubeApiKey is empty. */
  rssJson: "https://api.rss2json.com/v1/api.json?rss_url=",
  rssProxy: "https://api.allorigins.win/raw?url=",

  youtubeLive: {
    cacheMinutes: 30,
    longformFeatured: 2,
    longformExtra: 0,
    shortsCount: 4
  },

  loginUrl: "https://clinic.heri2go.com/clinic/login",
  signupUrl: "https://clinic.heri2go.com/clinic/public/signup",

  /* Replace with the real company deck when ready. */
  companyDeckUrl: "assets/heri2go-company-intro.pdf",

  appStoreUrl: "https://apps.apple.com/us/app/heri2go-clinic/id6767798415",
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.heri2go.clinic",

  clients: [
    { src: "assets/images/logos/clients/bright-harbor-dental.png", alt: "Bright Harbor Dental" },
    { src: "assets/images/logos/clients/northstar-family-dental.png", alt: "NorthStar Family Dental" },
    { src: "assets/images/logos/clients/pearl-street-dentistry.png", alt: "Pearl Street Dentistry" },
    { src: "assets/images/logos/clients/riverstone-dental-care.png", alt: "Riverstone Dental Care" },
    { src: "assets/images/logos/clients/skyline-dental-studio.png", alt: "Skyline Dental Studio" },
    { src: "assets/images/logos/clients/clover-dental-studio.png", alt: "Clover Dental Studio" },
    { src: "assets/images/logos/clients/blue-canyon-dental.png", alt: "Blue Canyon Dental" },
    { src: "assets/images/logos/clients/willow-and-white-dental.png", alt: "Willow & White Dental" },
    { src: "assets/images/logos/clients/summit-point-dental.png", alt: "Summit Point Dental" },
    { src: "assets/images/logos/clients/lakeside-smiles.png", alt: "Lakeside Smiles" },
    { src: "assets/images/logos/clients/anchor-implant-center.png", alt: "Anchor Implant Center" },
    { src: "assets/images/logos/clients/osseo-dental-implants.png", alt: "Osseo Dental Implants" },
    { src: "assets/images/logos/clients/allbridge-dental-studio.png", alt: "Allbridge Dental Studio" },
    { src: "assets/images/logos/clients/heritage-denture-clinic.png", alt: "Heritage Denture Clinic" },
    { src: "assets/images/logos/clients/anchor-implant-center-wide.png", alt: "Anchor Implant Center" },
    { src: "assets/images/logos/clients/titanium-smile-institute.png", alt: "Titanium Smile Institute" },
    { src: "assets/images/logos/clients/allbridge-dental-studio-wide.png", alt: "Allbridge Dental Studio" },
    { src: "assets/images/logos/clients/heritage-denture-clinic-seal.png", alt: "Heritage Denture Clinic" },
    { src: "assets/images/logos/clients/silver-arch-prosthodontics.png", alt: "Silver Arch Prosthodontics" },
    { src: "assets/images/logos/clients/renew-bite-implant-center.png", alt: "Renew Bite Implant Center" },
    { src: "assets/images/logos/clients/foundation-fixed-teeth.png", alt: "Foundation Fixed Teeth" },
    { src: "assets/images/logos/clients/smileset-denture-lab.png", alt: "Smileset Denture Lab" },
    { src: "assets/images/logos/clients/prime-abutment-dental.png", alt: "Prime Abutment Dental" }
  ],

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
    test: {
      handle: "@MrBeast",
      channelId: "UCX6OQ3DkcsbYNE6H8uQQuVA",
      channelUrl: "https://www.youtube.com/@MrBeast",
      videosUrl: "https://www.youtube.com/@MrBeast/videos",
      shortsUrl: "https://www.youtube.com/@MrBeast/shorts",
      longform: [
        { id: "Qtl8lJwbd4g", title: "Escape 100 Cops, Win $500,000", featured: true },
        { id: "Af6i6ChAVTw", title: "Last To Leave Mansion, Keeps It", featured: true },
        { id: "lVylRtlPOIE", title: "I Granted 100 Kids Their Biggest Wish!" },
        { id: "iYlODtkyw_I", title: "Survive 30 Days Chained To A Stranger, Win $250,000" },
        { id: "__fmDj0ZJ1Q", title: "50 YouTube Legends Fight For $1,000,000" }
      ],
      shorts: [
        { id: "5mU6SRS2Bxo", title: "World’s Largest Tennis Match" },
        { id: "LiH-P4rSkLI", title: "Can You Pass This Classroom Quiz?" },
        { id: "f7y2XikE7sY", title: "Paying For Food With My Car" },
        { id: "Df5Y-2ndQyU", title: "Read My Book, You Could Win $1,000,000" },
        { id: "egvLKQe6I4I", title: "Don't Pop the Balloon" },
        { id: "LgbyEFILLJI", title: "$1 vs $10,000 Cake" },
        { id: "YA_kX8hu1gg", title: "This Plane Takes Off in 12 Seconds" },
        { id: "XCGVurja73c", title: "I Raced The Fastest Man On Earth" }
      ]
    },
    prod: {
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
  }
};
