/**
 * Handoff notes for Vue wrap
 * - Keep this object. The Vue app can import the same data.
 * - youtubeMode: "test" uses MrBeast. Switch to "prod" when HERi Shorts are live.
 * - YouTube longform/shorts load live from the channel. Do not ask the vendor
 *   to paste new video IDs after each upload.
 * - Production: put a YouTube Data API v3 key in youtubeApiKey (HTTP referrer
 *   restricted to heri2go.com). Quota is tiny if results are cached.
 * - Until that key exists, rssProxy reads the public channel RSS. Replace the
 *   public proxy before launch if you do not want a third-party dependency.
 * - Channel Talk stays on the live site. This intro HTML does not include it.
 */
window.HERI_INTRO_CONFIG = {
  youtubeMode: "test",

  /* Empty until Google Cloud key is ready. Vue can inject this from env. */
  youtubeApiKey: "",

  /* Used only when youtubeApiKey is empty. */
  rssProxy: "https://api.allorigins.win/raw?url=",

  youtubeLive: {
    cacheMinutes: 30,
    longformFeatured: 2,
    longformExtra: 3,
    shortsCount: 8
  },

  loginUrl: "https://clinic.heri2go.com/clinic/login",
  signupUrl: "https://clinic.heri2go.com/clinic/public/signup",

  /* Replace with the real company deck when ready. */
  companyDeckUrl: "assets/heri2go-company-intro.pdf",

  appStoreUrl: "https://apps.apple.com/us/app/heri2go-clinic/id6767798415",
  playStoreUrl: "https://play.google.com/store/apps/details?id=com.heri2go.clinic",

  clients: [
    "Seoul Smile Dental",
    "Gangnam Implant Center",
    "NYC Prosthodontics",
    "Pacific Dental Lab",
    "Busan Digital Clinic",
    "LA Crown Studio",
    "Incheon Oral Care",
    "Brooklyn Family Dental",
    "Daegu CAD/CAM Lab",
    "Chicago Esthetic Dentistry"
  ],

  reviews: [
    { name: "Dr. Park, Seoul", stars: 5, text: "Orders land in the lab without extra calls. The 7-day turnaround is real." },
    { name: "Dr. Kim, Busan", stars: 5, text: "Scanner cloud to case creation is the part we used to lose time on." },
    { name: "Dr. Lee, NYC", stars: 5, text: "Translation and lab matching made overseas cases feel local." },
    { name: "Dr. Choi, LA", stars: 4, text: "Pricing is competitive without the usual quality trade-off." },
    { name: "Dr. Jung, Incheon", stars: 5, text: "Plasma-sterile packaging is what we show patients when they ask." },
    { name: "Dr. Han, Chicago", stars: 5, text: "One dashboard for Medit and 3Shape. That alone was worth switching." },
    { name: "Dr. Yoon, Daegu", stars: 5, text: "Warranty process is clear. We stopped hedging on remakes." },
    { name: "Dr. Shin, Brooklyn", stars: 4, text: "Clinic app is enough for chairside status checks between patients." },
    { name: "Dr. Oh, Gangnam", stars: 5, text: "Lab marketplace is broader than our previous domestic-only vendors." },
    { name: "Dr. Kang, Jeju", stars: 5, text: "Case photos and notes stay with the order. No more missing files." },
    { name: "Dr. Im, Daejeon", stars: 5, text: "Staff onboarding took one afternoon. The UI is not a lab portal from 2012." },
    { name: "Dr. Seo, Atlanta", stars: 4, text: "Delivery tracking is the detail patients actually notice." },
    { name: "Dr. Bae, Suwon", stars: 5, text: "We moved implant cases first, then everything else followed." },
    { name: "Dr. Moon, Houston", stars: 5, text: "Quality hold is strict. That is why we stayed after the test case." },
    { name: "Dr. Jang, Gwangju", stars: 5, text: "AI order draft is a starting point we still review — and it saves time." },
    { name: "Dr. Yoo, Boston", stars: 4, text: "Support replies in clinic hours, not three days later." },
    { name: "Dr. Nam, Ulsan", stars: 5, text: "Remake rate dropped after we standardized through HERi2go." },
    { name: "Dr. Kwak, Miami", stars: 5, text: "Global labs, one contract surface. That was the buying reason." },
    { name: "Dr. Ahn, Seongnam", stars: 5, text: "The app QR on the website is how half our doctors installed it." },
    { name: "Dr. Hong, Toronto", stars: 5, text: "Clean communication. No chasing WhatsApp threads for shade changes." }
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
      handle: "@HERIBioInc",
      channelId: "UCK_8eWcJRrFT3WnQt0NLZmA",
      channelUrl: "https://www.youtube.com/@HERIBioInc",
      videosUrl: "https://www.youtube.com/@HERIBioInc/videos",
      shortsUrl: "https://www.youtube.com/@HERIBioInc/shorts",
      longform: [
        { id: "9ciL9E7JqYw", title: "How to find the best dental lab (HERi2go)", featured: true },
        { id: "_1rV8cjBi8s", title: "How to Signup (Best DENTAL LAB platform)", featured: true },
        { id: "2q2BqYCfd20", title: "HERIBio CEO Jaden Yoo Interview with Yonhap News" },
        { id: "9H0Fely_gRs", title: "Introduction of HERi2go service (Typography)" },
        { id: "8MuRoAZM9N0", title: "Introduction of HERi2go service (Korean Version)" }
      ],
      shorts: []
    }
  }
};
