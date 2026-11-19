(function () {
  const config = window.HERI_INTRO_CONFIG;
  const youtube = config.youtube;
  const live = config.youtubeLive || {
    cacheMinutes: 30,
    longformFeatured: 2,
    longformExtra: 3,
    shortsCount: 24,
    shortsVisible: 4,
    shortsRollMs: 5000
  };
  let shortsRollTimer = 0;
  let shortsFadeTimer = 0;
  let shortsResumeTimer = 0;
  let shortsResizeObs = null;
  let shortsInteractAbort = null;

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
    return `heri-yt-${youtube.channelId || youtube.handle}-v6`;
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

  function mapPlaylistItems(playlist) {
    return (playlist.items || [])
      .map((item) => ({
        id: item.snippet?.resourceId?.videoId,
        title: item.snippet?.title || ""
      }))
      .filter((item) => item.id);
  }

  async function fetchPlaylistItems(playlistId, apiKey, maxPages) {
    const items = [];
    let pageToken = "";
    for (let page = 0; page < maxPages; page += 1) {
      const token = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "";
      const playlist = await fetchJson(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(
          playlistId
        )}&key=${encodeURIComponent(apiKey)}${token}`
      );
      items.push(...mapPlaylistItems(playlist));
      pageToken = playlist.nextPageToken || "";
      if (!pageToken) break;
    }
    return items;
  }

  async function fetchRecentFromApi(channelId, apiKey) {
    const suffix = channelId.slice(2);
    const needLong = live.longformFeatured + live.longformExtra;
    const needShort = live.shortsCount;
    const shortsPromise = fetchPlaylistItems(`UUSH${suffix}`, apiKey, 1).catch(() => []);

    const longform = [];
    const shortsFromUploads = [];
    let pageToken = "";
    for (let page = 0; page < 4; page += 1) {
      const token = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "";
      const playlist = await fetchJson(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(
          `UU${suffix}`
        )}&key=${encodeURIComponent(apiKey)}${token}`
      );
      const split = await splitLongAndShort(mapPlaylistItems(playlist));
      longform.push(...split.longform);
      shortsFromUploads.push(...split.shorts);
      pageToken = playlist.nextPageToken || "";
      if (!pageToken) break;
      if (longform.length >= needLong) break;
    }

    const seen = new Set();
    const shorts = [];
    (await shortsPromise).concat(shortsFromUploads).forEach((item) => {
      if (!item.id || seen.has(item.id) || shorts.length >= needShort) return;
      seen.add(item.id);
      shorts.push(item);
    });

    return {
      longform: longform.slice(0, needLong),
      shorts
    };
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
      let split;
      let source;
      if (config.youtubeApiKey) {
        split = await fetchRecentFromApi(youtube.channelId, config.youtubeApiKey);
        source = "api";
      } else {
        const items = await fetchRecentFromRss(youtube.channelId);
        if (!items.length) throw new Error("YouTube feed empty");
        split = await splitLongAndShort(items);
        source = "rss";
      }

      const needLong = live.longformFeatured + live.longformExtra;
      const longs = (split.longform.length ? split.longform : fallbackFeed().longform)
        .slice(0, needLong);
      const data = {
        source,
        longform: longs.map((item, index) => ({
          ...item,
          featured: index < live.longformFeatured
        })),
        shorts: (split.shorts || []).slice(0, live.shortsCount)
      };
      if (!feedHasVideos(data)) throw new Error("YouTube split empty");
      writeCache(data);
      return data;
    } catch (err) {
      console.warn("[HERi intro] YouTube live fetch failed, using fallback IDs.", err);
      return fallbackFeed();
    }
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
      return `<a class="${className}" href="${href}" target="_blank" rel="noopener">${img}<span class="short-card-title" data-full-title="${title}" title="${title}">${title}</span></a>`;
    }
    return `<a class="${className}" href="${href}" target="_blank" rel="noopener"><figure>${img}<figcaption><span class="yt-card-title" data-full-title="${title}" title="${title}">${title}</span></figcaption></figure></a>`;
  }

  function titleLineHeight(el) {
    const styles = getComputedStyle(el);
    const lineHeight = Number.parseFloat(styles.lineHeight);
    if (lineHeight) return lineHeight;
    return Number.parseFloat(styles.fontSize) * 1.35;
  }

  function clampTwoLines(root) {
    const nodes = (root || document).querySelectorAll(".yt-card-title, .short-card-title");
    nodes.forEach((el) => {
      const full = el.getAttribute("data-full-title") || el.textContent;
      el.textContent = full;
      if (el.getBoundingClientRect().width < 24) return;
      const styles = getComputedStyle(el);
      const pad =
        Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
      const max = titleLineHeight(el) * 2 + pad;
      if (!max || el.scrollHeight <= max + 1) return;
      let lo = 0;
      let hi = full.length;
      while (lo < hi) {
        const mid = Math.ceil((lo + hi) / 2);
        el.textContent = `${full.slice(0, mid).trimEnd()}…`;
        if (el.scrollHeight > max + 1) hi = mid - 1;
        else lo = mid;
      }
      el.textContent = `${full.slice(0, Math.max(lo, 1)).trimEnd()}…`;
    });
  }

  function clampTwoLinesSoon(root) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => clampTwoLines(root));
    });
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
    clampTwoLinesSoon(featured);
    clampTwoLinesSoon(more);
  }

  function stopShortsRoll() {
    if (shortsRollTimer) {
      window.clearInterval(shortsRollTimer);
      shortsRollTimer = 0;
    }
    if (shortsFadeTimer) {
      window.clearTimeout(shortsFadeTimer);
      shortsFadeTimer = 0;
    }
    if (shortsResumeTimer) {
      window.clearTimeout(shortsResumeTimer);
      shortsResumeTimer = 0;
    }
    if (shortsResizeObs) {
      shortsResizeObs.disconnect();
      shortsResizeObs = null;
    }
    if (shortsInteractAbort) {
      shortsInteractAbort.abort();
      shortsInteractAbort = null;
    }
  }

  function isMobileShorts() {
    return window.matchMedia("(max-width: 600px)").matches;
  }

  function shortsVisibleCount(total) {
    const visible = isMobileShorts() ? 2 : live.shortsVisible || 4;
    return Math.min(visible, total);
  }

  function shortsRollStep() {
    return isMobileShorts() ? 2 : 1;
  }

  function shortsCardStep(track) {
    const card = track.querySelector(".short-card");
    if (!card) return 0;
    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 12;
    return card.getBoundingClientRect().width + gap;
  }

  function setShortsOffset(track, start, animate) {
    track.classList.toggle("is-sliding", Boolean(animate));
    track.style.transform = `translate3d(${-start * shortsCardStep(track)}px, 0, 0)`;
  }

  function alignShortsStart(value, total) {
    const step = shortsRollStep();
    const max = Math.max(0, total - shortsVisibleCount(total));
    let next = value;
    if (step > 1) next -= ((next % step) + step) % step;
    if (next < 0) return 0;
    if (next > max) return max - (max % step);
    return next;
  }

  function renderShorts(feed) {
    const track = $("#shorts-grid");
    const prevBtn = $("#shorts-prev");
    const nextBtn = $("#shorts-next");
    if (!track) return;
    const viewport = track.closest(".shorts-viewport") || $("#shorts-viewport");
    stopShortsRoll();
    track.classList.remove("is-sliding", "is-fading");
    track.style.transform = "";
    track.style.opacity = "";
    if (viewport) {
      viewport.style.height = "";
      viewport.classList.remove("is-dragging");
    }
    [prevBtn, nextBtn].forEach((btn) => {
      if (!btn) return;
      btn.hidden = true;
      btn.disabled = true;
    });

    const shorts = (feed.shorts || []).slice(0, live.shortsCount);
    if (!shorts.length) {
      track.innerHTML =
        '<p class="empty-note">No Shorts on this channel yet. They will appear here automatically after upload.</p>';
      return;
    }

    track.innerHTML = shorts.map((v) => videoCard(v, "short")).join("");
    let start = 0;
    let wheelAcc = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maxStart = () => Math.max(0, shorts.length - shortsVisibleCount(shorts.length));

    const syncNav = () => {
      const max = maxStart();
      const show = max > 0;
      [prevBtn, nextBtn].forEach((btn) => {
        if (btn) btn.hidden = !show;
      });
      if (prevBtn) prevBtn.disabled = start <= 0;
      if (nextBtn) nextBtn.disabled = start >= max;
    };

    const apply = (animate) => {
      start = alignShortsStart(start, shorts.length);
      setShortsOffset(track, start, animate && !reduceMotion);
      syncNav();
    };

    const stopLoop = () => {
      if (shortsRollTimer) {
        window.clearInterval(shortsRollTimer);
        shortsRollTimer = 0;
      }
      if (shortsFadeTimer) {
        window.clearTimeout(shortsFadeTimer);
        shortsFadeTimer = 0;
      }
    };

    const startLoop = () => {
      stopLoop();
      if (maxStart() <= 0 || reduceMotion) return;
      shortsRollTimer = window.setInterval(() => {
        if (start >= maxStart()) {
          track.classList.remove("is-sliding");
          track.classList.add("is-fading");
          shortsFadeTimer = window.setTimeout(() => {
            start = 0;
            apply(false);
            track.classList.remove("is-fading");
          }, 280);
          return;
        }
        start += shortsRollStep();
        apply(true);
      }, live.shortsRollMs || 5000);
    };

    const scheduleResume = () => {
      stopLoop();
      if (shortsResumeTimer) window.clearTimeout(shortsResumeTimer);
      shortsResumeTimer = window.setTimeout(() => {
        shortsResumeTimer = 0;
        startLoop();
      }, (live.shortsRollMs || 5000) + 800);
    };

    const go = (dir) => {
      start = alignShortsStart(start + dir * shortsRollStep(), shorts.length);
      apply(true);
      scheduleResume();
    };

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        clampTwoLines(track);
        apply(false);
      });
    });

    shortsResizeObs = new ResizeObserver(() => apply(false));
    shortsResizeObs.observe(viewport || track);
    startLoop();

    if (maxStart() <= 0 || !viewport) return;

    shortsInteractAbort = new AbortController();
    const { signal } = shortsInteractAbort;
    let pointerId = null;
    let dragging = false;
    let axisLocked = "";
    let originX = 0;
    let originY = 0;
    let originStart = 0;
    let suppressClick = false;

    const dragTo = (clientX) => {
      const stepPx = shortsCardStep(track);
      if (!stepPx) return;
      const raw = originStart - (clientX - originX) / stepPx;
      const max = maxStart();
      let visual = raw;
      if (visual < 0) visual *= 0.35;
      else if (visual > max) visual = max + (visual - max) * 0.35;
      track.classList.remove("is-sliding");
      track.style.transform = `translate3d(${-visual * stepPx}px, 0, 0)`;
    };

    const endDrag = (clientX) => {
      if (!dragging) return;
      const wasHorizontal = axisLocked === "x";
      dragging = false;
      pointerId = null;
      axisLocked = "";
      viewport.classList.remove("is-dragging");
      if (!wasHorizontal) {
        start = originStart;
        apply(false);
        scheduleResume();
        return;
      }
      const stepPx = shortsCardStep(track);
      const dx = clientX - originX;
      if (Math.abs(dx) > 8) suppressClick = true;
      if (stepPx && Math.abs(dx) > Math.min(40, stepPx * 0.22)) {
        const raw = originStart - dx / stepPx;
        start = alignShortsStart(
          Math.round(raw / shortsRollStep()) * shortsRollStep(),
          shorts.length
        );
      } else {
        start = originStart;
      }
      apply(true);
      scheduleResume();
    };

    viewport.addEventListener(
      "pointerdown",
      (event) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        if (event.target.closest(".btn-shorts-nav")) return;
        pointerId = event.pointerId;
        dragging = true;
        axisLocked = "";
        originX = event.clientX;
        originY = event.clientY;
        originStart = start;
        suppressClick = false;
      },
      { signal }
    );

    viewport.addEventListener(
      "pointermove",
      (event) => {
        if (!dragging || event.pointerId !== pointerId) return;
        const dx = event.clientX - originX;
        const dy = event.clientY - originY;
        if (!axisLocked) {
          if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
          axisLocked = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
          if (axisLocked !== "x") return;
          stopLoop();
          viewport.classList.add("is-dragging");
          track.classList.remove("is-sliding", "is-fading");
          track.style.opacity = "";
          viewport.setPointerCapture?.(event.pointerId);
        }
        if (axisLocked !== "x") return;
        event.preventDefault();
        dragTo(event.clientX);
      },
      { signal }
    );

    viewport.addEventListener("pointerup", (event) => endDrag(event.clientX), { signal });
    viewport.addEventListener("pointercancel", (event) => endDrag(event.clientX), { signal });

    viewport.addEventListener(
      "click",
      (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      },
      { capture: true, signal }
    );

    viewport.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        event.preventDefault();
        wheelAcc += event.deltaX;
        const need = Math.max(28, shortsCardStep(track) * 0.35);
        if (Math.abs(wheelAcc) < need) return;
        const dir = wheelAcc > 0 ? 1 : -1;
        wheelAcc = 0;
        go(dir);
      },
      { passive: false, signal }
    );

    prevBtn?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        go(-1);
      },
      { signal }
    );
    nextBtn?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        go(1);
      },
      { signal }
    );
  }

  function renderReviews() {
    const top = $("#review-track-top");
    const bottom = $("#review-track-bottom");
    if (!top || !bottom) return;

    const cards = (items) =>
      duplicate(items, 2)
        .map((r) => {
          const stars = r.stars
            ? `<div class="stars">${starString(r.stars)}</div>`
            : "";
          const meta = r.practice
            ? `<span class="review-meta">${escapeHtml(r.practice)}</span>`
            : "";
          return `
        <article class="review-card">
          ${stars}
          <p>${escapeHtml(r.text)}</p>
          <b>${escapeHtml(r.name)}</b>
          ${meta}
        </article>`;
        })
        .join("");

    const mid = Math.ceil(config.reviews.length / 2);
    top.innerHTML = cards(config.reviews.slice(0, mid));
    bottom.innerHTML = cards(config.reviews.slice(mid));
  }

  function bindHeroFlow() {
    const flow = $(".hero-flow");
    if (!flow) return;

    const steps = [...flow.querySelectorAll(".hero-flow-step")];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!steps.length || reduceMotion.matches) return;

    let index = 0;
    let timer = 0;

    function activate() {
      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i === index);
      });
      index = (index + 1) % steps.length;
    }

    function start() {
      if (timer || document.hidden) return;
      activate();
      timer = window.setInterval(activate, 1600);
    }

    function stop() {
      window.clearInterval(timer);
      timer = 0;
    }

    start();
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });
  }

  function bindTrustStats() {
    const stats = [...document.querySelectorAll(".trust-stat dt[data-count]")];
    if (!stats.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function formatValue(el, value) {
      const suffix = el.getAttribute("data-suffix") || "";
      const sep = el.getAttribute("data-sep");
      const rounded = Math.round(value);
      const body = sep ? rounded.toLocaleString("en-US") : String(rounded);
      return body + suffix;
    }

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function animateStat(el, delay, onDone) {
      const target = Number(el.getAttribute("data-count"));
      if (!Number.isFinite(target)) return;

      const parent = el.closest(".trust-stat");
      const duration = 1400;
      let start = 0;
      let started = false;

      function frame(now) {
        if (!started) {
          start = now + delay;
          started = true;
        }
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        const value = target * easeOutQuart(t);
        el.textContent = formatValue(el, t === 0 && delay > 0 ? 0 : value);
        if (t < 1) {
          requestAnimationFrame(frame);
          return;
        }
        el.textContent = formatValue(el, target);
        if (parent) parent.classList.add("is-landed");
        if (onDone) onDone();
      }

      el.textContent = formatValue(el, 0);
      requestAnimationFrame(frame);
    }

    function play() {
      let remaining = stats.length;
      const root = $(".trust-stats");

      stats.forEach((el, i) => {
        animateStat(el, i * 140, () => {
          remaining -= 1;
          if (remaining === 0 && root) root.classList.add("is-floating");
        });
      });
    }

    if (reduceMotion.matches) return;

    const root = $(".trust-stats") || stats[0].closest(".trust");
    if (!("IntersectionObserver" in window) || !root) {
      play();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        play();
      },
      { threshold: 0.35 }
    );

    observer.observe(root);
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

    [{ root: $("#reviews"), duration: 32 }].forEach(({ root, duration }) => {
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

  function bindHeroBrochure() {
    const btn = $("#hero-brochure");
    if (!btn) return;
    const files = [config.companyDeckUrl, config.labsDeckUrl].filter(Boolean);
    if (files.length < 2) return;

    btn.addEventListener("click", (event) => {
      event.preventDefault();
      files.forEach((href, index) => {
        window.setTimeout(() => {
          const link = document.createElement("a");
          link.href = href;
          link.download = href.split("/").pop();
          link.rel = "noopener";
          document.body.appendChild(link);
          link.click();
          link.remove();
        }, index * 200);
      });
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
    if (source !== "api") {
      banner.classList.add("is-on");
      banner.textContent = `YouTube feed via ${source}. Set youtubeApiKey for production (no third-party proxy).`;
    }
  }

  renderReviews();
  bindNav();
  bindHeroChat();
  bindHeroBrochure();
  bindHeroVisual();
  bindMarquees();
  bindHeroFlow();
  bindTrustStats();

  const fallback = fallbackFeed();
  renderYoutube(fallback);
  renderShorts(fallback);

  loadYoutubeFeed().then((feed) => {
    renderYoutube(feed);
    renderShorts(feed);
    showTestBanner(feed);
  });
})();
