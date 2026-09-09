(function () {
  const config = window.HERI_INTRO_CONFIG;
  const youtube = config.youtube[config.youtubeMode] || config.youtube.test;
  const live = config.youtubeLive || {
    cacheMinutes: 30,
    longformFeatured: 2,
    longformExtra: 0,
    shortsCount: 8
  };

  const $ = (sel, root = document) => root.querySelector(sel);

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function starString(n) {
    return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
  }

  function duplicate(items, copies) {
    const out = [];
    for (let i = 0; i < copies; i += 1) out.push(...items);
    return out;
  }

  function cacheKey() {
    return `heri-yt-${config.youtubeMode}-${youtube.channelId || youtube.handle}`;
  }

  function feedHasVideos(data) {
    return Boolean(
      (data?.longform && data.longform.length) || (data?.shorts && data.shorts.length)
    );
  }

  function readCache() {
    try {
      const raw = sessionStorage.getItem(cacheKey());
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || Date.now() > parsed.expiresAt) return null;
      if (!feedHasVideos(parsed.data)) return null;
      return parsed.data;
    } catch (err) {
      return null;
    }
  }

  function writeCache(data) {
    try {
      sessionStorage.setItem(
        cacheKey(),
        JSON.stringify({
          expiresAt: Date.now() + live.cacheMinutes * 60 * 1000,
          data
        })
      );
    } catch (err) {
      /* ignore quota */
    }
  }

  function ytThumb(id, kind) {
    if (kind === "short") return `https://i.ytimg.com/vi/${id}/oar2.jpg`;
    return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
  }

  function isVerticalThumb(id) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () =>
        resolve(img.naturalHeight > 400 && img.naturalHeight > img.naturalWidth);
      img.onerror = () => resolve(false);
      img.src = `https://i.ytimg.com/vi/${id}/oar2.jpg`;
    });
  }

  async function fetchWithTimeout(url, timeoutMs) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } finally {
      clearTimeout(timer);
    }
  }

  async function fetchJson(url) {
    const res = await fetchWithTimeout(url, 4000);
    return res.json();
  }

  async function fetchRecentFromApi(channelId, apiKey) {
    const playlistId = `UU${channelId.slice(2)}`;
    const playlist = await fetchJson(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=30&playlistId=${encodeURIComponent(
        playlistId
      )}&key=${encodeURIComponent(apiKey)}`
    );
    return (playlist.items || [])
      .map((item) => ({
        id: item.snippet?.resourceId?.videoId,
        title: item.snippet?.title || ""
      }))
      .filter((item) => item.id);
  }

  function parseRss(xmlText) {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    return [...doc.querySelectorAll("entry")]
      .map((entry) => {
        const id =
          entry.querySelector("videoId, yt\\:videoId")?.textContent ||
          (entry.querySelector("id")?.textContent || "").replace("yt:video:", "");
        const title = entry.querySelector("title")?.textContent || "";
        return { id, title };
      })
      .filter((item) => item.id);
  }

  async function fetchRecentFromRss(channelId) {
    const rss = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(
      channelId
    )}`;
    const proxy = config.rssProxy || "";
    const url = proxy ? `${proxy}${encodeURIComponent(rss)}` : rss;
    const res = await fetchWithTimeout(url, 4000);
    const items = parseRss(await res.text());
    if (!items.length) throw new Error("RSS parsed empty");
    return items;
  }

  async function splitLongAndShort(items) {
    const flags = await Promise.all(items.map((item) => isVerticalThumb(item.id)));
    const longform = [];
    const shorts = [];
    items.forEach((item, index) => {
      if (flags[index]) shorts.push(item);
      else longform.push(item);
    });
    return { longform, shorts };
  }

  function fallbackFeed() {
    return {
      source: "fallback",
      longform: youtube.longform || [],
      shorts: youtube.shorts || []
    };
  }

  async function loadYoutubeFeed() {
    const cached = readCache();
    if (cached) return cached;

    if (!youtube.channelId) return fallbackFeed();

    try {
      let items;
      let source;
      if (config.youtubeApiKey) {
        items = await fetchRecentFromApi(youtube.channelId, config.youtubeApiKey);
        source = "api";
      } else {
        items = await fetchRecentFromRss(youtube.channelId);
        source = "rss";
      }

      if (!items.length) throw new Error("YouTube feed empty");

      const split = await splitLongAndShort(items);
      const data = {
        source,
        longform: split.longform.map((item, index) => ({
          ...item,
          featured: index < live.longformFeatured
        })),
        shorts: split.shorts
      };
      if (!feedHasVideos(data)) throw new Error("YouTube split empty");
      writeCache(data);
      return data;
    } catch (err) {
      console.warn("[HERi intro] YouTube live fetch failed, using fallback IDs.", err);
      return fallbackFeed();
    }
  }

  function rasterSources(src) {
    if (!src || !/\.png$/i.test(src)) {
      return { png: src || "", webp: "", avif: "" };
    }
    return {
      png: src,
      webp: src.replace(/\.png$/i, ".webp"),
      avif: src.replace(/\.png$/i, ".avif")
    };
  }

  function pictureMarkup(src, alt, className, extraImgAttrs) {
    const { png, webp, avif } = rasterSources(src);
    const cls = className ? ` class="${className}"` : "";
    const extra = extraImgAttrs ? ` ${extraImgAttrs}` : "";
    if (!avif && !webp) {
      return `<img${cls} src="${escapeHtml(png)}" alt="${escapeHtml(alt)}"${extra}>`;
    }
    const avifSource = avif
      ? `<source type="image/avif" srcset="${escapeHtml(avif)}">`
      : "";
    const webpSource = webp
      ? `<source type="image/webp" srcset="${escapeHtml(webp)}">`
      : "";
    return `<picture>${avifSource}${webpSource}<img${cls} src="${escapeHtml(png)}" alt="${escapeHtml(alt)}" decoding="async" loading="lazy"${extra}></picture>`;
  }

  function renderClients() {
    const track = $("#client-track");
    if (!track) return;
    const pills = duplicate(config.clients, 2)
      .map((client) => {
        const src = typeof client === "string" ? "" : client.src;
        const alt = typeof client === "string" ? client : client.alt;
        return `<span class="client-pill">${pictureMarkup(src, alt)}</span>`;
      })
      .join("");
    track.innerHTML = pills;
  }

  function videoCard(v, kind) {
    const href =
      kind === "short"
        ? `https://www.youtube.com/shorts/${v.id}`
        : `https://www.youtube.com/watch?v=${v.id}`;
    const className = kind === "short" ? "short-card" : "yt-card";
    const title = escapeHtml(v.title);
    const img = `<img src="${ytThumb(v.id, kind)}" alt="${title}"
      onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${v.id}/hqdefault.jpg'">`;

    if (kind === "short") {
      return `<a class="${className}" href="${href}" target="_blank" rel="noopener">${img}<span>${title}</span></a>`;
    }
    return `<a class="${className}" href="${href}" target="_blank" rel="noopener"><figure>${img}<figcaption>${title}</figcaption></figure></a>`;
  }

  function renderYoutube(feed) {
    const featured = $("#yt-featured");
    const more = $("#yt-more");
    const channelLink = $("#yt-channel-link");
    if (channelLink) {
      channelLink.href = youtube.videosUrl;
      channelLink.textContent = `Open ${youtube.handle} videos`;
    }
    if (!featured || !more) return;

    const longs = feed.longform || [];
    const lead = longs.slice(0, live.longformFeatured);
    const rest = longs.slice(
      live.longformFeatured,
      live.longformFeatured + live.longformExtra
    );

    featured.innerHTML = lead.map((v) => videoCard(v, "long")).join("");
    more.innerHTML = rest.map((v) => videoCard(v, "long")).join("");
  }

  function renderShorts(feed) {
    const grid = $("#shorts-grid");
    const link = $("#shorts-channel-link");
    if (link) {
      link.href = youtube.shortsUrl;
      link.textContent = `Open ${youtube.handle} Shorts`;
    }
    if (!grid) return;

    const shorts = (feed.shorts || []).slice(0, live.shortsCount);
    if (!shorts.length) {
      grid.innerHTML =
        '<p class="empty-note">No Shorts on this channel yet. They will appear here automatically after upload.</p>';
      return;
    }

    grid.innerHTML = shorts.map((v) => videoCard(v, "short")).join("");
  }

  function renderReviews() {
    const top = $("#review-track-top");
    const bottom = $("#review-track-bottom");
    if (!top || !bottom) return;

    const cards = (items) =>
      duplicate(items, 2)
        .map(
          (r) => `
        <article class="review-card">
          <div class="stars">${starString(r.stars)}</div>
          <p>${escapeHtml(r.text)}</p>
          <b>${escapeHtml(r.name)}</b>
          <span class="review-meta">${escapeHtml(r.role)} · ${escapeHtml(r.practice)} · ${escapeHtml(r.place)}</span>
        </article>`
        )
        .join("");

    const mid = Math.ceil(config.reviews.length / 2);
    top.innerHTML = cards(config.reviews.slice(0, mid));
    bottom.innerHTML = cards(config.reviews.slice(mid));
  }

  function bindHeroChat() {
    const btn = $("#hero-chat");
    btn?.addEventListener("click", () => {
      if (typeof window.ChannelIO === "function") {
        window.ChannelIO("showMessenger");
      }
    });
  }

  function bindNav() {
    const header = $(".site-header");
    const burger = $("#hamburger");
    const mobile = $("#mobile-nav");

    window.addEventListener("scroll", () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    });

    burger?.addEventListener("click", () => {
      mobile?.classList.toggle("is-open");
    });

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const id = link.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        mobile?.classList.remove("is-open");
        const offset = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      });
    });
  }

  function showTestBanner(feed) {
    const banner = $(".dev-banner");
    if (!banner) return;
    const source = feed?.source || "fallback";
    if (config.youtubeMode === "test" || source !== "api") {
      banner.classList.add("is-on");
      banner.textContent =
        config.youtubeMode === "test"
          ? `TEST MODE · Live YouTube from ${youtube.handle} (${source}). Set youtubeMode to "prod" and youtubeApiKey before launch.`
          : `YouTube feed via ${source}. Set youtubeApiKey for production (no third-party proxy).`;
    }
  }

  renderClients();
  renderReviews();
  bindNav();
  bindHeroChat();

  const fallback = fallbackFeed();
  renderYoutube(fallback);
  renderShorts(fallback);

  loadYoutubeFeed().then((feed) => {
    renderYoutube(feed);
    renderShorts(feed);
    showTestBanner(feed);
  });
})();
