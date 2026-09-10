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
    return `heri-yt-${config.youtubeMode}-${youtube.channelId || youtube.handle}-v3`;
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

  async function fetchJson(url, timeoutMs = 6000) {
    const res = await fetchWithTimeout(url, timeoutMs);
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

  function itemsFromRss2Json(data) {
    return (data?.items || [])
      .map((item) => {
        const fromGuid = String(item.guid || "").replace(/^yt:video:/, "");
        const fromLink = (String(item.link || "").match(/[?&]v=([^&]+)/) || [])[1];
        return { id: fromGuid || fromLink || "", title: item.title || "" };
      })
      .filter((item) => item.id);
  }

  async function fetchRecentFromRss(channelId) {
    const rss = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(
      channelId
    )}`;
    const jsonEndpoint = config.rssJson || "";
    if (jsonEndpoint) {
      try {
        const data = await fetchJson(
          `${jsonEndpoint}${encodeURIComponent(rss)}`,
          8000
        );
        const items = itemsFromRss2Json(data);
        if (items.length) return items;
      } catch (err) {
        console.warn("[HERi intro] rss2json failed, trying XML proxy.", err);
      }
    }

    const proxy = config.rssProxy || "";
    const xmlUrl = proxy ? `${proxy}${encodeURIComponent(rss)}` : rss;
    const res = await fetchWithTimeout(xmlUrl, 8000);
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

  function bindHeroVisual() {
    const stage = $("#hero-visual");
    const tilt = $("#hero-visual-tilt");
    if (!stage || !tilt) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (reduceMotion.matches || !finePointer.matches) return;

    let rect = null;
    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function measure() {
      rect = stage.getBoundingClientRect();
    }

    function tick() {
      raf = 0;
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      if (Math.abs(targetX - currentX) < 0.04) currentX = targetX;
      if (Math.abs(targetY - currentY) < 0.04) currentY = targetY;

      tilt.style.transform = `rotateX(${currentY.toFixed(3)}deg) rotateY(${currentX.toFixed(3)}deg)`;

      if (currentX !== targetX || currentY !== targetY) {
        raf = requestAnimationFrame(tick);
      }
    }

    function requestTick() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    stage.addEventListener("mouseenter", measure);

    stage.addEventListener("mousemove", (event) => {
      if (!rect) measure();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 12;
      targetY = -(y * 12);
      requestTick();
    });

    stage.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
      requestTick();
    });

    window.addEventListener("resize", measure, { passive: true });
    window.addEventListener("scroll", measure, { passive: true });
  }

  function bindMarquees() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    [
      { root: $(".clients"), duration: 55 },
      { root: $("#reviews"), duration: 32 }
    ].forEach(({ root, duration }) => {
      if (!root) return;

      root.querySelectorAll(".marquee").forEach((marquee) => {
        const track = marquee.querySelector(".marquee-track");
        if (!track) return;

        const state = { hovering: false };
        const driver = driveMarquee(track, duration, () => state.hovering);
        if (!driver || !finePointer.matches) return;

        marquee.addEventListener("pointerenter", () => {
          state.hovering = true;
          marquee.classList.add("is-paused");
          driver.kick();
        });

        marquee.addEventListener("pointerleave", () => {
          state.hovering = false;
          marquee.classList.remove("is-paused");
          driver.kick();
        });
      });
    });
  }

  function driveMarquee(track, duration, isHovering) {
    const marquee = track.closest(".marquee");
    if (!marquee) return null;

    const dir = marquee.classList.contains("marquee--reverse") ? 1 : -1;
    let half = 0;
    let offset = 0;
    let velocity = 0;
    let raf = 0;
    let last = 0;

    function measure() {
      half = track.scrollWidth / 2;
    }

    function cruise() {
      return half > 0 ? half / (duration * 1000) : 0;
    }

    function wrap(value) {
      if (half <= 0) return 0;
      let next = value;
      while (next <= -half) next += half;
      while (next > 0) next -= half;
      return next;
    }

    function apply() {
      track.style.transform = `translate3d(${offset.toFixed(3)}px, 0, 0)`;
    }

    function tick(now) {
      const dt = last ? Math.min(now - last, 40) : 16;
      last = now;

      const target = isHovering() ? 0 : cruise();
      const tau = isHovering() ? 170 : 300;
      velocity += (target - velocity) * (1 - Math.exp(-dt / tau));
      if (Math.abs(target - velocity) < 0.0008) velocity = target;

      offset = wrap(offset + dir * velocity * dt);
      apply();

      if (velocity !== target || velocity !== 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      raf = 0;
      last = 0;
    }

    function kick() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    measure();
    offset = wrap(dir > 0 ? -half : 0);
    apply();
    marquee.classList.add("is-driven");

    const observer = new ResizeObserver(() => {
      const progress = half > 0 ? Math.abs(offset) / half : 0;
      measure();
      offset = wrap(dir > 0 ? -half * (1 - progress) : -half * progress);
      apply();
    });
    observer.observe(track);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        return;
      }
      kick();
    });

    kick();
    return { kick };
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
  bindHeroVisual();
  bindMarquees();

  const fallback = fallbackFeed();
  renderYoutube(fallback);
  renderShorts(fallback);

  loadYoutubeFeed().then((feed) => {
    renderYoutube(feed);
    renderShorts(feed);
    showTestBanner(feed);
  });
})();
