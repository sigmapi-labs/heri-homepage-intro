/**
 * Handoff notes for Vue wrap
 * - Keep this object. The Vue app can import the same data.
 * - youtubeMode: "prod" loads @HERIBioInc. "test" is the old MrBeast fixture.
 * - YouTube longform/shorts load live from the channel. Do not ask the vendor
 *   to paste new video IDs after each upload.
 * - Production: put a YouTube Data API v3 key in youtubeApiKey (HTTP referrer
 *   restricted to heri2go.com). Quota is tiny if results are cached.
 * - Until that key exists, rssProxy reads the public channel RSS. Replace the
 *   public proxy before launch if you do not want a third-party dependency.
 * - Channel Talk stays on the live site. This intro HTML does not include it.
 */
window.HERI_INTRO_CONFIG = {
  youtubeMode: "prod",

  /* Empty until Google Cloud key is ready. Vue can inject this from env. */
  youtubeApiKey: "",

  /* Used only when youtubeApiKey is empty. */
  rssProxy: "https://api.allorigins.win/raw?url=",

  youtubeLive: {
    cacheMinutes: 30,
    longformFeatured: 2,
    longformExtra: 0,
    shortsCount: 8
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
    { name: "Dr. Min-seo Park · Seoul", stars: 5, text: "We used to call the lab three times on a single shade. That stopped after the first month." },
    { name: "Dr. Elena Vargas · Los Angeles", stars: 5, text: "Tried two implant cases first. Fit was tight enough that we moved the rest of the schedule over." },
    { name: "James Whitaker, DDS · Houston", stars: 4, text: "Not magic — we still check the draft — but chairside time on new orders is down." },
    { name: "Dr. Soo-jin Kim · Busan", stars: 5, text: "Medit 스캔이 케이스에 바로 붙는 게 제일 크다. 예전엔 그 사이에서 파일이 사라졌다." },
    { name: "Dr. Priya Raman · Boston", stars: 5, text: "One dashboard for Medit and 3Shape. I did not expect that to be the thing that sold the team." },
    { name: "Dr. Marcus Webb · Chicago", stars: 4, text: "Pricing landed where I wanted. A couple of shipping updates lagged; support caught it the same day." },
    { name: "Dr. Hiroshi Tanaka · Tokyo", stars: 5, text: "Notes and photos stay on the order. We are not hunting WhatsApp threads for a shade change anymore." },
    { name: "Dr. Claire Moreau · Montreal", stars: 5, text: "The 7-day promise sounded like marketing. Our first crown came back on day six." },
    { name: "Daniel Okonkwo, BDS · London", stars: 4, text: "App is enough between patients. I wish the desktop view had the same status chips, but it works." },
    { name: "Dr. Sarah Chen · New York", stars: 5, text: "Overseas lab, local turnaround. Patients do not ask where it was milled. They ask when they can come in." },
    { name: "Dr. Jun-ho Lee · Incheon", stars: 5, text: "멸균 포장을 환자에게 그대로 보여준다. 그 한 컷이 상담을 짧게 만든다." },
    { name: "Dr. Rebecca Hale · Toronto", stars: 5, text: "Warranty language is actually readable. We stopped padding every case for a mystery remake." },
    { name: "Dr. Wei Lin · Singapore", stars: 4, text: "Onboarding was an afternoon. The UI looks like 2026, which should not be noteworthy, and yet." },
    { name: "Dr. Carlos Mendes · Miami", stars: 5, text: "We ran full-arch first because that is where remakes hurt. Rate dropped. Then we added the rest." },
    { name: "Anna Bergström, DDS · Stockholm", stars: 5, text: "Tracking is the part patients mention. I did not think a lab portal would show up in recall visits." },
    { name: "Dr. Michael Grant · Atlanta", stars: 4, text: "AI draft saves the boring fields. I still rewrite the clinical notes. That split feels right." },
    { name: "Dr. Hana Al-Farsi · Dubai", stars: 5, text: "One contract surface, labs in more than one country. That was the buying reason, not the brochure." },
    { name: "Dr. Tae-yoon Choi · Daegu", stars: 5, text: "리메이크 기준이 분명해서 스태프가 알아서 올린다. 원장이 매번 통화하지 않아도 된다." },
    { name: "Dr. Olivia Brooks · Sydney", stars: 5, text: "Support answers during clinic hours. That sounds basic until you have waited three days on a shade." },
    { name: "Dr. Nathan Cole · Brooklyn", stars: 4, text: "Marketplace is wider than our old domestic-only list. We still pick the same two labs — we just got there faster." }
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
        { id: "9ciL9E7JqYw", title: "How to find the best dental lab (HERi2go)", featured: true },
        { id: "_1rV8cjBi8s", title: "How to Signup (Best DENTAL LAB platform)", featured: true },
        { id: "9H0Fely_gRs", title: "Introduction of HERi2go service (Typography)" },
        { id: "yjVcIeLVHmY", title: "HERi2go Typograph (Korean Version)" },
        { id: "8MuRoAZM9N0", title: "Introduction of HERi2go service (Korean Version)" },
        { id: "T22wY5jROx4", title: "Introduction of HERi2go service (Infography)" }
      ],
      shorts: []
    }
  }
};
