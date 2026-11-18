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
    { name: "Dr. Joon Choe, DDS", practice: "DTLA Dental & Orthodontics · Veneers by Sgreen Dental Lab", stars: 5, text: "The veneers were beautifully attached!" },
    { name: "••••", stars: 0, text: "インプラントのクラウンを2本ずつ装着しました。調整なしでぴったり合いました。" },
    { name: "Dr. Steve Choi, DMD, MPH", practice: "Community Smile Dental Center · Caso de 9 unidades de E&E Lab", stars: 5, text: "¡A mi paciente le encantó el resultado!" },
    { name: "Bruce ••••", stars: 0, text: "I’m planning to send a night guard case and a crown case this evening." },
    { name: "Dr. James Sung", practice: "Livewell Dental · 義歯製作　Shin Dental Lab", stars: 5, text: "HERi2goさん、ありがとうございます。" },
    { name: "Dra. Sara ••••", stars: 0, text: "Me gustó tanto el resultado que le saqué una foto antes de la entrega del viernes." },
    { name: "Dr. Steve Choi, DMD, MPH", practice: "Smiles Dental Center · Crown by E&E Dental Lab", stars: 5, text: "So natural, you can’t tell which one is the crown." },
    { name: "••••", stars: 0, text: "フィードバックも連絡も早いです。" },
    { name: "••••", stars: 0, text: "Good lab work at a competitive price." },
    { name: "Bruce ••••", stars: 0, text: "La ayuda que recibí con las dos férulas me da confianza para seguir enviando casos a D-Lab." },
    { name: "Dr. Joon Choe, DDS", practice: "修復物製作 Sgreen Lab", stars: 5, text: "装着のときは、まったくストレスを感じませんでした。" },
    { name: "Dr. Sara ••••", stars: 0, text: "The thin layer of feldspathic porcelain looks so natural and gives the teeth depth." },
    { name: "••••", stars: 0, text: "Las seis coronas sobre implantes encajaron bien." },
    { name: "••••", stars: 0, text: "I’ve found that E&E Lab consistently makes high-quality restorations." },
    { name: "••••", stars: 0, text: "今お願いしている歯科技工所に満足しています。" },
    { name: "Bruce ••••", stars: 0, text: "The first night guard didn’t fit. The remakes fit well, and my patient was happy to receive two." },
    { name: "••••", stars: 0, text: "Terminamos el caso y todo salió muy bien." },
    { name: "Dr. Sara ••••", stars: 0, text: "Thank you for following up and checking in on the case." },
    { name: "••••", stars: 0, text: "WhatsApp communication, crown pricing, quality of work, friendly and professional staff." }
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
