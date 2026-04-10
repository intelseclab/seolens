// SEO Lens v2.1

let analysisData = null;
let perfData = null;
let techData = null;
let psiData = null;
let linkResults = null;
let headersData = null;

// ─── INIT ────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("scan-btn").addEventListener("click", runScan);
  document.getElementById("export-btn").addEventListener("click", exportReport);
  document.getElementById("save-psi-key").addEventListener("click", saveSettings);

  document.querySelectorAll(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      switchTab(btn);
      if (btn.dataset.panel === "history") renderHistory();
      if (btn.dataset.panel === "tools" && analysisData) renderTools(analysisData.meta.url);
    });
  });

  document.getElementById("panels").addEventListener("click", e => {
    const h = e.target.closest("[data-toggle-section]");
    if (h) toggleSection(h);
  });

  const stored = await chrome.storage.local.get(["psiKey", "linkCheckLimit"]);
  if (stored.psiKey) document.getElementById("psi-key-input").value = stored.psiKey;
  if (stored.linkCheckLimit != null) document.getElementById("link-check-limit").value = stored.linkCheckLimit;
});

async function saveSettings() {
  const key = document.getElementById("psi-key-input").value.trim();
  const limit = document.getElementById("link-check-limit").value;
  await chrome.storage.local.set({ psiKey: key, linkCheckLimit: parseInt(limit) });
  const st = document.getElementById("psi-key-status");
  st.textContent = "✓ Kaydedildi"; st.style.color = "var(--success)";
  setTimeout(() => { st.textContent = ""; }, 2000);
}

// ─── ENTRY POINT ─────────────────────────────────────────────────────────────

async function runScan() {
  const btn = document.getElementById("scan-btn");
  btn.textContent = "TARANIYOR…"; btn.classList.add("loading"); btn.disabled = true;
  psiData = null; linkResults = null; headersData = null;

  showPanel("loading"); setMsg("Sayfa analiz ediliyor...");
  document.getElementById("score-bar").classList.remove("visible");
  document.getElementById("tabs-bar").style.display = "none";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("Aktif sekme bulunamadı.");
    const url = tab.url || "";
    document.getElementById("page-url").textContent = url.replace(/^https?:\/\//, "").substring(0, 44) || "—";

    if (!url || /^(chrome|chrome-extension|edge|about):/.test(url))
      throw new Error("Bu sayfa taranamaz. Normal bir web sayfası açın.");

    const [seoRes, perfRes] = await Promise.all([
      chrome.scripting.executeScript({ target: { tabId: tab.id }, func: runSEOAnalysis }),
      chrome.scripting.executeScript({ target: { tabId: tab.id }, func: getPerformanceData }),
    ]);
    analysisData = seoRes[0].result;
    perfData = perfRes[0].result;

    setMsg("Teknik kontroller...");
    const [td, hd] = await Promise.all([
      checkTechnicalAsync(analysisData.meta.baseUrl, url),
      new Promise(r => chrome.runtime.sendMessage({ type: "FETCH_HEADERS", url }, res => r(res || {}))),
    ]);
    techData = td;
    headersData = hd;

    const stored = await chrome.storage.local.get(["psiKey", "linkCheckLimit"]);
    if (stored.psiKey) { setMsg("PageSpeed API..."); psiData = await fetchPSI(url, stored.psiKey); }

    const lim = stored.linkCheckLimit ?? 20;
    if (lim > 0) {
      const extLinks = analysisData.links.filter(l => !l.isInternal && l.href.startsWith("http")).slice(0, lim).map(l => l.href);
      if (extLinks.length) {
        setMsg(`${extLinks.length} link kontrol ediliyor...`);
        linkResults = await new Promise(r => chrome.runtime.sendMessage({ type: "CHECK_LINKS", urls: extLinks }, r));
      }
    }

    await saveToHistory(url, calcScore(analysisData, perfData, techData));
    renderAll();
  } catch (err) {
    showError(err.message || "Bilinmeyen hata.");
  } finally {
    btn.textContent = "YENİLE"; btn.classList.remove("loading"); btn.disabled = false;
  }
}

function setMsg(m) { const e = document.getElementById("loading-msg"); if (e) e.textContent = m; }

// ─── PAGE-INJECTED: SEO ───────────────────────────────────────────────────────

function runSEOAnalysis() {
  const data = {};
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // META
  const title = document.title || "";
  const metaDesc = $('meta[name="description"]')?.content || "";
  const canonical = $('link[rel="canonical"]')?.href || "";
  const robots = $('meta[name="robots"]')?.content || "";
  const ogTitle = $('meta[property="og:title"]')?.content || "";
  const ogDesc = $('meta[property="og:description"]')?.content || "";
  const ogImage = $('meta[property="og:image"]')?.content || "";
  const ogType = $('meta[property="og:type"]')?.content || "";
  const ogUrl = $('meta[property="og:url"]')?.content || "";
  const twitterCard = $('meta[name="twitter:card"]')?.content || "";
  const twitterTitle = $('meta[name="twitter:title"]')?.content || "";
  const twitterDesc = $('meta[name="twitter:description"]')?.content || "";
  const twitterImage = $('meta[name="twitter:image"]')?.content || "";
  const viewport = $('meta[name="viewport"]')?.content || "";
  const lang = document.documentElement.lang || "";
  const charset = $('meta[charset]')?.getAttribute("charset") || document.characterSet || "";

  let canonicalIsSelf = false, canonicalIsExternal = false;
  if (canonical) {
    try {
      const cu = new URL(canonical), pu = new URL(location.href);
      canonicalIsSelf = cu.hostname === pu.hostname && cu.pathname === pu.pathname;
      canonicalIsExternal = cu.hostname !== pu.hostname;
    } catch {}
  }

  data.meta = {
    title, titleLength: title.length, metaDesc, metaDescLength: metaDesc.length,
    metaKeywords: $('meta[name="keywords"]')?.content || "",
    canonical, canonicalIsSelf, canonicalIsExternal,
    robots, ogTitle, ogDesc, ogImage, ogType, ogUrl,
    twitterCard, twitterTitle, twitterDesc, twitterImage,
    viewport, lang, charset,
    url: location.href, protocol: location.protocol,
    hasHttps: location.protocol === "https:",
    hostname: location.hostname, baseUrl: location.origin,
  };

  // HEADINGS
  const headings = {};
  for (let i = 1; i <= 6; i++)
    headings[`h${i}`] = $$(`h${i}`).map(el => ({ text: el.innerText.trim().substring(0, 120) }));
  const h1t = headings.h1?.[0]?.text?.toLowerCase() || "";
  const titl = title.toLowerCase();
  headings.h1MatchesTitle = !!(h1t && titl && (h1t.includes(titl.substring(0,20)) || titl.includes(h1t.substring(0,20))));

  // Check heading order skips
  const hOrder = $$("h1,h2,h3,h4,h5,h6").map(h => parseInt(h.tagName[1]));
  headings.orderSkips = hOrder.reduce((n, v, i) => n + (i > 0 && v - hOrder[i-1] > 1 ? 1 : 0), 0);
  data.headings = headings;

  // IMAGES
  data.images = $$("img").map(img => ({
    src: img.src?.substring(0, 200), alt: img.alt || "",
    hasAlt: img.hasAttribute("alt"), altEmpty: img.getAttribute("alt") === "",
    width: img.naturalWidth || img.width, height: img.naturalHeight || img.height,
    hasDimensions: img.hasAttribute("width") && img.hasAttribute("height"),
    loading: img.loading || "", isLargeDisplay: img.naturalWidth > 2000 || img.naturalHeight > 2000,
  }));

  // LINKS
  const host = location.hostname;
  const seen = new Set();
  data.links = $$("a[href]").map(a => {
    const href = a.href || "";
    let h2 = ""; try { h2 = new URL(href).hostname; } catch {}
    const dup = seen.has(href); seen.add(href);
    return {
      href: href.substring(0, 200),
      text: (a.innerText.trim() || a.getAttribute("aria-label") || "").substring(0, 80),
      isInternal: h2 === host || href.startsWith("#") || href.startsWith("/"),
      nofollow: (a.rel || "").includes("nofollow"),
      hasText: !!a.innerText.trim(), isDuplicate: dup, target: a.target || "",
    };
  });

  // SCHEMA
  data.schema = $$('script[type="application/ld+json"]').map(s => {
    try {
      const p = JSON.parse(s.textContent);
      return { valid: true, type: p["@type"] || p?.["@graph"]?.map(g => g["@type"]).join(", ") || "Unknown", raw: JSON.stringify(p, null, 2).substring(0, 600) };
    } catch { return { valid: false, type: "Parse Hatası", raw: s.textContent.substring(0, 200) }; }
  });

  // TECHNICAL
  const rm = robots;
  data.technical = {
    favicon: !!($('link[rel="icon"]') || $('link[rel="shortcut icon"]') || $('link[rel="apple-touch-icon"]')),
    hreflang: $$('link[rel="alternate"][hreflang]').map(l => ({ lang: l.hreflang, href: l.href.substring(0, 100) })),
    noindex: /noindex/i.test(rm), nofollow: /nofollow/i.test(rm),
    ampUrl: $('link[rel="amphtml"]')?.href || "",
    rssFeeds: $$('link[rel="alternate"][type*="rss"],link[rel="alternate"][type*="atom"]').map(l => l.href.substring(0, 100)),
    resourceHints: {
      preload: $$('link[rel="preload"]').length, prefetch: $$('link[rel="prefetch"]').length,
      preconnect: $$('link[rel="preconnect"]').length, dnsPrefetch: $$('link[rel="dns-prefetch"]').length,
    },
    iFrames: $$("iframe").length, scripts: $$("script[src]").length,
    stylesheets: $$('link[rel="stylesheet"]').length, inlineStyles: $$("[style]").length,
    hasViewport: !!viewport, lang, hasHttps: location.protocol === "https:",
  };

  // PAGINATION
  data.pagination = {
    prev: $('link[rel="prev"]')?.href || "",
    next: $('link[rel="next"]')?.href || "",
  };
  data.pagination.hasPagination = !!(data.pagination.prev || data.pagination.next);
  data.pagination.paginatedWithSelfCanonical = data.pagination.hasPagination && canonicalIsSelf;

  // JS SEO
  const frameworks = [];
  if (window.__NEXT_DATA__ || document.getElementById("__NEXT_DATA__")) frameworks.push("Next.js");
  if (window.__NUXT__ || window.$nuxt) frameworks.push("Nuxt.js");
  if (window.angular || $$("[ng-version]").length) frameworks.push("Angular");
  if (window.React || $$("[data-reactroot],[data-reactid]").length) frameworks.push("React");
  if (window.Vue || $$("[data-v-app]").length) frameworks.push("Vue.js");
  if (window.Gatsby) frameworks.push("Gatsby");
  if (window.next) frameworks.push("Next.js");

  const bodyLen = document.body?.innerText?.length || 0;
  data.jsSeo = {
    frameworks,
    hasNoscript: $$("noscript").length > 0,
    noscriptCount: $$("noscript").length,
    bodyTextLength: bodyLen,
    likelySPA: frameworks.length > 0 && bodyLen < 500,
  };

  // ACCESSIBILITY
  const formEls = $$("input:not([type='hidden']),textarea,select");
  const inputsNoLabel = formEls.filter(inp => {
    const id = inp.id;
    return !inp.closest("label") &&
      !(id && document.querySelector(`label[for="${id}"]`)) &&
      !inp.hasAttribute("aria-label") && !inp.hasAttribute("aria-labelledby") && !inp.hasAttribute("title");
  }).length;

  const btnsNoText = $$("button,input[type='button'],input[type='submit'],input[type='reset']")
    .filter(b => !b.innerText?.trim() && !b.getAttribute("aria-label") && !b.getAttribute("title") && !b.getAttribute("value")).length;

  const headingOrderArr = $$("h1,h2,h3,h4,h5,h6").map(h => parseInt(h.tagName[1]));
  let hSkips = 0;
  for (let i = 1; i < headingOrderArr.length; i++)
    if (headingOrderArr[i] - headingOrderArr[i-1] > 1) hSkips++;

  data.accessibility = {
    inputsNoLabel, btnsNoText,
    hasSkipNav: !!$('a[href="#main"],a[href="#content"],a[href="#maincontent"],[class*="skip-nav"],[id*="skip"]'),
    hasMain: !!$("main,[role='main']"),
    hasLang: !!lang,
    imgsNoAlt: $$("img:not([alt])").length,
    headingSkips: hSkips,
    tabIndex: $$("[tabindex]").filter(el => parseInt(el.getAttribute("tabindex")) > 0).length,
  };

  // CONTENT (main area, strip nav/header/footer)
  const contentEl = $("main") || $("article") || $('[role="main"]') ||
    $("#content,#main,.content,.main,.post-content,.entry-content,.article-body") || document.body;
  const cloned = contentEl.cloneNode(true);
  ["nav","header","footer","aside","script","style"].forEach(s => cloned.querySelectorAll(s).forEach(el => el.remove()));
  const bodyText = cloned.innerText?.trim() || "";
  const allWords = bodyText.split(/\s+/).filter(Boolean);
  const wc = allWords.length;
  const sentences = bodyText.split(/[.!?…]+/).filter(s => s.trim().length > 8).length;

  const stop = new Set(["ve","ile","bir","bu","da","de","ki","mi","ya","ne","için","den","dan","ten","tan","ama","fakat","ancak","çünkü","eğer","her","daha","en","çok","az","the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should","that","this","these","those","it","not","no","so","as","if","than","then","when","where","which","who","how","what","all","more","most","some","into","also","just","like","only","very","can","they","them","our","we","you","your","their","its"]);
  const freq = {};
  allWords.forEach(w => {
    const c = w.toLowerCase().replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, "");
    if (c.length > 3 && !stop.has(c)) freq[c] = (freq[c] || 0) + 1;
  });

  data.content = {
    wordCount: wc, sentences, paragraphs: $$("p").length,
    readingTimeMin: Math.max(1, Math.ceil(wc / 200)),
    avgSentenceWords: sentences > 0 ? Math.round(wc / sentences) : 0,
    contentAreaUsed: contentEl.tagName.toLowerCase(),
    topKeywords: Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 20)
      .map(([word, count]) => ({ word, count, density: +((count / Math.max(1,wc)) * 100).toFixed(2) })),
  };

  data.basics = { wordCount: wc, hasHttps: data.meta.hasHttps };
  return data;
}

// ─── PAGE-INJECTED: PERFORMANCE ──────────────────────────────────────────────

function getPerformanceData() {
  const nav = performance.getEntriesByType("navigation")[0];
  const paint = performance.getEntriesByType("paint");
  const res = performance.getEntriesByType("resource");
  const fcp = paint.find(p => p.name === "first-contentful-paint");

  let lcp = null;
  try { const e = performance.getEntriesByType("largest-contentful-paint"); if (e.length) lcp = e[e.length-1].startTime; } catch {}

  let cls = null;
  try { const e = performance.getEntriesByType("layout-shift"); if (e.length) cls = +e.reduce((s,x) => s + (x.hadRecentInput ? 0 : x.value), 0).toFixed(4); } catch {}

  let fid = null;
  try { const e = performance.getEntriesByType("first-input"); if (e.length) fid = Math.round(e[0].processingStart - e[0].startTime); } catch {}

  const types = {}; let largestRes = null, largestSz = 0;
  res.forEach(r => {
    const t = r.initiatorType || "other"; types[t] = (types[t] || 0) + 1;
    if ((r.transferSize||0) > largestSz) { largestSz = r.transferSize; largestRes = { name: r.name.split("/").pop().substring(0,50), size: Math.round(r.transferSize/1024) }; }
  });

  return {
    domLoad: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : null,
    fullLoad: nav ? Math.round(nav.loadEventEnd - nav.startTime) : null,
    ttfb: nav ? Math.round(nav.responseStart - nav.startTime) : null,
    fcp: fcp ? Math.round(fcp.startTime) : null,
    lcp: lcp ? Math.round(lcp) : null, cls, fid,
    totalTransferKB: Math.round(res.reduce((s,r) => s + (r.transferSize||0), 0) / 1024),
    totalResources: res.length, resourceBreakdown: types, largestResource: largestRes,
    renderBlocking: res.filter(r => (r.initiatorType==="link"||r.initiatorType==="script") && r.renderBlockingStatus==="blocking").length,
  };
}

// ─── ASYNC HELPERS ───────────────────────────────────────────────────────────

async function checkTechnicalAsync(baseUrl, pageUrl) {
  const result = { robotsTxt: null, sitemapXml: null };
  try {
    const r = await fetch(baseUrl + "/robots.txt", { signal: AbortSignal.timeout(6000) });
    if (r.ok) {
      const text = await r.text();
      let pageDisallowed = false;
      try {
        const pn = new URL(pageUrl).pathname;
        let inAll = false;
        for (const line of text.split("\n")) {
          const l = line.trim();
          if (/^User-agent:\s*\*/i.test(l)) inAll = true;
          else if (/^User-agent:/i.test(l)) inAll = false;
          if (inAll && /^Disallow:/i.test(l)) {
            const p = l.replace(/^Disallow:\s*/i,"").trim();
            if (p === "/" || (p.length > 0 && pn.startsWith(p))) { pageDisallowed = true; break; }
          }
        }
      } catch {}
      result.robotsTxt = {
        accessible: true, status: r.status, pageDisallowed,
        isDisallowAll: /^Disallow:\s*\/\s*$/m.test(text),
        hasSitemap: /sitemap:/i.test(text),
        sitemapUrls: (text.match(/Sitemap:\s*(\S+)/gi)||[]).map(s=>s.split(/\s+/)[1]).filter(Boolean).slice(0,3),
      };
    } else {
      result.robotsTxt = { accessible: false, status: r.status };
    }
  } catch { result.robotsTxt = { accessible: false, status: 0 }; }

  const sUrls = result.robotsTxt?.sitemapUrls?.length ? result.robotsTxt.sitemapUrls : [baseUrl+"/sitemap.xml", baseUrl+"/sitemap_index.xml"];
  for (const su of sUrls.slice(0,2)) {
    try {
      const r = await fetch(su, { signal: AbortSignal.timeout(5000), method: "HEAD" });
      if (r.ok) { result.sitemapXml = { accessible: true, status: r.status, url: su }; break; }
    } catch {}
  }
  if (!result.sitemapXml) result.sitemapXml = { accessible: false };
  return result;
}

async function fetchPSI(url, apiKey) {
  try {
    const ep = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=mobile&category=performance&category=seo&category=best-practices`;
    const res = await fetch(ep, { signal: AbortSignal.timeout(30000) });
    if (!res.ok) { const e = await res.json(); return { error: e?.error?.message || `HTTP ${res.status}` }; }
    const d = await res.json();
    const cats = d.lighthouseResult?.categories || {};
    const aud = d.lighthouseResult?.audits || {};
    const fwv = d.loadingExperience?.metrics || {};
    return {
      scores: {
        performance: Math.round((cats.performance?.score||0)*100),
        seo: Math.round((cats.seo?.score||0)*100),
        bestPractices: Math.round((cats["best-practices"]?.score||0)*100),
      },
      metrics: {
        fcp: aud["first-contentful-paint"]?.displayValue,
        lcp: aud["largest-contentful-paint"]?.displayValue,
        tbt: aud["total-blocking-time"]?.displayValue,
        cls: aud["cumulative-layout-shift"]?.displayValue,
        si: aud["speed-index"]?.displayValue,
        tti: aud["interactive"]?.displayValue,
        fcpScore: aud["first-contentful-paint"]?.score,
        lcpScore: aud["largest-contentful-paint"]?.score,
      },
      fieldData: fwv.LARGEST_CONTENTFUL_PAINT_MS ? {
        lcpMs: fwv.LARGEST_CONTENTFUL_PAINT_MS?.percentile,
        lcpCategory: fwv.LARGEST_CONTENTFUL_PAINT_MS?.category,
        fidMs: fwv.FIRST_INPUT_DELAY_MS?.percentile,
        fidCategory: fwv.FIRST_INPUT_DELAY_MS?.category,
        clsCategory: fwv.CUMULATIVE_LAYOUT_SHIFT_SCORE?.category,
      } : null,
      opportunities: Object.values(aud)
        .filter(a => a.details?.type==="opportunity" && a.score!==null && a.score<0.9)
        .sort((a,b) => a.score-b.score).slice(0,8)
        .map(a => ({ title: a.title, score: a.score, displayValue: a.displayValue||"" })),
    };
  } catch (e) { return { error: e.message }; }
}

async function saveToHistory(url, score) {
  const { scanHistory = [] } = await chrome.storage.local.get("scanHistory");
  scanHistory.unshift({ url, score: score.pct, label: score.label, timestamp: Date.now(), issues: score.issues.length, warnings: score.warnings.length });
  await chrome.storage.local.set({ scanHistory: scanHistory.slice(0, 30) });
}

// ─── ROUTING ─────────────────────────────────────────────────────────────────

function showPanel(n) { document.querySelectorAll(".panel").forEach(p => p.classList.remove("active")); document.getElementById(`panel-${n}`)?.classList.add("active"); }
function showError(m) { document.getElementById("error-msg").textContent = m; showPanel("error"); document.getElementById("score-bar").classList.remove("visible"); document.getElementById("tabs-bar").style.display = "none"; }
function switchTab(btn) { document.querySelectorAll(".tab").forEach(t => t.classList.remove("active")); btn.classList.add("active"); showPanel(btn.dataset.panel); }

// ─── RENDER ALL ──────────────────────────────────────────────────────────────

function renderAll() {
  const d = analysisData;
  const score = calcScore(d, perfData, techData);
  const cats = calcCategoryScores(d, perfData, techData);
  renderScore(score, cats);
  renderOverview(d, score);
  renderSERP(d.meta);
  renderKeyword();
  renderTechnical(d.technical, techData, headersData, d.pagination, d.jsSeo);
  renderMeta(d.meta);
  renderContent(d.content);
  renderHeadings(d.headings);
  renderPerformance(perfData, psiData);
  renderImages(d.images);
  renderLinks(d.links, linkResults);
  renderSchema(d.schema);
  renderSocial(d.meta);
  renderAccessibility(d.accessibility);
  renderTools(d.meta.url);
  document.getElementById("score-bar").classList.add("visible");
  document.getElementById("tabs-bar").style.display = "flex";
  showPanel("overview");
}

// ─── SCORING ─────────────────────────────────────────────────────────────────

function calcScore(d, perf, tech) {
  let pts = 0; const issues = [], warnings = [], goods = [];
  const m = d.meta;
  const add = (p, type, msg) => { pts += p; (type==="good"?goods:type==="warn"?warnings:issues).push(msg); };

  if (!m.title) add(0,"issue","Sayfa başlığı eksik");
  else if (m.titleLength<30) add(5,"warn",`Başlık çok kısa — ${m.titleLength} karakter (ideal 30–60)`);
  else if (m.titleLength>60) add(6,"warn",`Başlık çok uzun — ${m.titleLength} karakter (ideal 30–60)`);
  else add(10,"good","Başlık uzunluğu ideal");

  if (!m.metaDesc) add(0,"issue","Meta açıklama eksik");
  else if (m.metaDescLength<70) add(5,"warn",`Açıklama çok kısa — ${m.metaDescLength} karakter`);
  else if (m.metaDescLength>160) add(6,"warn",`Açıklama çok uzun — ${m.metaDescLength} karakter`);
  else add(10,"good","Meta açıklama ideal uzunlukta");

  m.hasHttps ? add(8,"good","HTTPS aktif") : add(0,"issue","HTTPS kullanılmıyor");
  !m.canonical ? add(0,"warn","Canonical URL tanımlı değil") : m.canonicalIsExternal ? add(3,"warn","Canonical farklı domain'e işaret ediyor") : add(7,"good","Canonical URL tanımlı");

  const h1c = d.headings.h1?.length||0;
  if (!h1c) add(0,"issue","H1 başlık yok");
  else if (h1c>1) add(4,"warn",`${h1c} adet H1 — sadece 1 olmalı`);
  else add(8,"good","Tek H1 başlık var");

  d.technical?.noindex ? add(0,"issue","Sayfa noindex ile gizlenmiş!") : add(7,"good","Sayfa indekslenebilir");
  !m.lang ? add(0,"warn","HTML lang attribute eksik") : add(4,"good",`Dil attribute: ${m.lang}`);
  !m.viewport ? add(0,"warn","Viewport meta eksik") : add(3,"good","Viewport tanımlı");
  !d.technical?.favicon ? add(0,"warn","Favicon yok") : add(3,"good","Favicon var");

  const imgs = d.images||[], noAlt = imgs.filter(i=>!i.alt).length;
  if (imgs.length>0) {
    if (noAlt===0) add(7,"good","Tüm görsellerde alt text var");
    else if (noAlt<=2) add(4,"warn",`${noAlt} görselde alt text eksik`);
    else add(2,"issue",`${noAlt} görselde alt text yok`);
  }

  !(d.schema||[]).length ? add(0,"warn","Schema/JSON-LD yok") : add(5,"good",`${d.schema.length} schema tanımlı`);
  !tech?.robotsTxt?.accessible ? add(2,"warn","robots.txt erişilemiyor") : tech.robotsTxt.pageDisallowed ? add(0,"issue","robots.txt bu sayfayı engelliyor") : add(5,"good","robots.txt erişilebilir");
  !tech?.sitemapXml?.accessible ? add(0,"warn","sitemap.xml bulunamadı") : add(5,"good","sitemap.xml mevcut");
  !m.ogTitle&&!m.ogDesc ? add(0,"warn","Open Graph etiketleri eksik") : (m.ogTitle&&m.ogDesc&&m.ogImage) ? add(5,"good","Open Graph etiketleri tam") : add(3,"warn","Open Graph eksik (image/title/desc)");

  const wc = d.content?.wordCount||0;
  if (wc<100) add(0,"issue",`Çok az içerik (${wc} kelime)`);
  else if (wc<300) add(3,"warn",`Yetersiz içerik (${wc} kelime, ideal 600+)`);
  else if (wc>=600) add(6,"good",`Zengin içerik (${wc} kelime)`);
  else add(4,"good",`Yeterli içerik (${wc} kelime)`);

  if (psiData&&!psiData.error) {
    const p = psiData.scores.performance;
    p>=90?add(6,"good",`PageSpeed performans: ${p}/100`):p>=50?add(3,"warn",`PageSpeed performans: ${p}/100`):add(1,"issue",`PageSpeed performans düşük: ${p}/100`);
  } else if (perf) {
    const ok = (perf.fcp!=null&&perf.fcp<1800)&&(perf.ttfb!=null&&perf.ttfb<600);
    ok?add(6,"good","FCP ve TTFB değerleri iyi"):add(3,"warn","Performans iyileştirilebilir");
  }

  const headersXRobots = headersData?.headers?.["x-robots-tag"];
  if (headersXRobots && /noindex/i.test(headersXRobots)) add(0,"issue",`X-Robots-Tag: ${headersXRobots} (HTTP header'dan noindex)`);

  const pct = Math.min(100, Math.max(0, Math.round(pts)));
  let label, color;
  if (pct>=80){label="Mükemmel";color="#00e5c0";}else if(pct>=60){label="İyi";color="#00e5c0";}else if(pct>=40){label="Orta";color="#ffd166";}else{label="Zayıf";color="#ff6b6b";}
  return { pct, label, color, issues, warnings, goods };
}

function calcCategoryScores(d, perf, tech) {
  const m = d.meta;
  let tPts=0, mPts=0, cPts=0, pPts=0;

  if(m.hasHttps)tPts+=25; if(m.viewport)tPts+=12; if(m.lang)tPts+=10;
  if(m.canonical&&!m.canonicalIsExternal)tPts+=15; if(d.technical?.favicon)tPts+=8;
  if(!d.technical?.noindex)tPts+=15; if(tech?.robotsTxt?.accessible&&!tech.robotsTxt.pageDisallowed)tPts+=8; if(tech?.sitemapXml?.accessible)tPts+=7;

  if(m.title)mPts+=(m.titleLength>=30&&m.titleLength<=60)?30:15;
  if(m.metaDesc)mPts+=(m.metaDescLength>=70&&m.metaDescLength<=160)?30:15;
  if(m.ogTitle&&m.ogDesc&&m.ogImage)mPts+=20; else if(m.ogTitle||m.ogDesc)mPts+=10;
  if(m.twitterCard)mPts+=10; if(m.canonical)mPts+=10;

  const h1c=d.headings.h1?.length||0, wc=d.content?.wordCount||0;
  if(h1c===1)cPts+=20; else if(h1c>1)cPts+=5;
  if(wc>=1000)cPts+=30; else if(wc>=600)cPts+=25; else if(wc>=300)cPts+=15;
  if((d.schema||[]).length>0)cPts+=20;
  const imgs=d.images||[], noAlt=imgs.filter(i=>!i.alt).length;
  cPts+=imgs.length>0?(noAlt===0?20:noAlt<=2?10:0):10;
  if(d.content?.paragraphs>=5)cPts+=10;

  if(psiData&&!psiData.error){pPts=psiData.scores.performance;}
  else if(perf){
    if(perf.fcp!=null)pPts+=perf.fcp<1800?30:perf.fcp<3000?15:5;
    if(perf.lcp!=null)pPts+=perf.lcp<2500?30:perf.lcp<4000?15:5;
    if(perf.ttfb!=null)pPts+=perf.ttfb<600?20:perf.ttfb<1500?10:0;
    if(perf.cls!=null)pPts+=perf.cls<0.1?20:perf.cls<0.25?10:0;
  } else pPts=50;

  const cl = v => Math.min(100,Math.max(0,Math.round(v)));
  const co = v => v>=70?"#00e5c0":v>=40?"#ffd166":"#ff6b6b";
  return [
    {label:"TEKNİK",val:cl(tPts),color:co(tPts)},
    {label:"META",val:cl(mPts),color:co(mPts)},
    {label:"İÇERİK",val:cl(cPts),color:co(cPts)},
    {label:"HIZ",val:cl(pPts),color:co(pPts)},
  ];
}

function renderScore(score, cats) {
  const deg = Math.round(score.pct*3.6);
  document.getElementById("score-circle").style.background = `conic-gradient(${score.color} ${deg}deg,#1a1e28 ${deg}deg)`;
  document.getElementById("score-num").textContent = score.pct;
  document.getElementById("score-label").textContent = `${score.label} SEO`;
  document.getElementById("score-tags").innerHTML = [
    ...score.issues.slice(0,2).map(t=>`<span class="tag bad">✕ ${esc(t)}</span>`),
    ...score.warnings.slice(0,1).map(t=>`<span class="tag warn">⚠ ${esc(t)}</span>`),
    ...score.goods.slice(0,2).map(t=>`<span class="tag good">✓ ${esc(t)}</span>`),
  ].join("");
  document.getElementById("cat-grid").innerHTML = cats.map(c=>`<div class="cat-item"><div class="ci-val" style="color:${c.color}">${c.val}</div><div class="ci-label">${c.label}</div></div>`).join("");
}

// ─── OVERVIEW ────────────────────────────────────────────────────────────────

function renderOverview(d, score) {
  const el = document.getElementById("panel-overview");
  const rows = (arr, icon) => arr.map(i=>`<div class="issue-item"><span class="issue-icon">${icon}</span><div class="issue-body"><div class="issue-title">${esc(i)}</div></div></div>`).join("") || `<p style="color:var(--text3);font-size:12px;padding:4px 0">—</p>`;

  const psiBlock = psiData && !psiData.error ? `
    <div class="section">
      <div class="section-header"><h3>🚀 PageSpeed Insights</h3></div>
      <div class="section-body">
        <div class="metric-grid">
          ${["performance","seo","bestPractices"].map((k,i)=>{const v=psiData.scores[k],c=v>=90?"good":v>=50?"warn":"bad",co=v>=90?"#00e5c0":v>=50?"#ffd166":"#ff6b6b",lb=["PERFORMANS","SEO","BEST PRACT."][i];return`<div class="metric-card ${c}"><div class="m-label">${lb}</div><div class="m-val" style="color:${co}">${v}</div></div>`}).join("")}
          <div class="metric-card"><div class="m-label">MOBİL LCP</div><div class="m-val" style="font-size:14px">${psiData.metrics.lcp||"—"}</div></div>
        </div>
        ${psiData.fieldData?`<div style="margin-top:8px;padding:8px;background:var(--bg3);border-radius:6px;border:1px solid var(--border);font-size:11px;color:var(--text2)">🌍 <b>CrUX:</b> LCP ${psiData.fieldData.lcpMs}ms (${psiData.fieldData.lcpCategory}) &nbsp;|&nbsp; CLS ${psiData.fieldData.clsCategory}</div>`:""}
      </div>
    </div>` : "";

  el.innerHTML = `${psiBlock}
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>🔴 Hatalar</h3><span class="badge" style="background:rgba(255,107,107,0.1);color:#ff6b6b">${score.issues.length}</span><span class="chevron">▼</span></div><div class="section-body">${rows(score.issues,"🔴")}</div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>🟡 Uyarılar</h3><span class="badge" style="background:rgba(255,209,102,0.1);color:#ffd166">${score.warnings.length}</span><span class="chevron">▼</span></div><div class="section-body">${rows(score.warnings,"🟡")}</div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>🟢 Başarılı</h3><span class="badge" style="background:rgba(0,229,192,0.1);color:#00e5c0">${score.goods.length}</span><span class="chevron">▼</span></div><div class="section-body">${rows(score.goods.slice(0,8),"🟢")}</div></div>
    <div class="section"><div class="section-header"><h3>📊 Hızlı İstatistik</h3></div><div class="section-body"><div class="metric-grid">
      <div class="metric-card"><div class="m-label">KELİME</div><div class="m-val">${d.content?.wordCount||0}</div></div>
      <div class="metric-card"><div class="m-label">OKUMA</div><div class="m-val">${d.content?.readingTimeMin||1}<span class="m-unit">dk</span></div></div>
      <div class="metric-card"><div class="m-label">GÖRSEL</div><div class="m-val">${d.images.length}</div></div>
      <div class="metric-card"><div class="m-label">SCHEMA</div><div class="m-val">${d.schema.length}</div></div>
      <div class="metric-card"><div class="m-label">İÇ LİNK</div><div class="m-val">${d.links.filter(l=>l.isInternal).length}</div></div>
      <div class="metric-card"><div class="m-label">DIŞ LİNK</div><div class="m-val">${d.links.filter(l=>!l.isInternal).length}</div></div>
    </div></div></div>`;
}

// ─── SERP PREVIEW ────────────────────────────────────────────────────────────

function renderSERP(m) {
  const el = document.getElementById("panel-serp");
  const url = m.url || "";
  const title = m.title || "(başlık yok)";
  const desc = m.metaDesc || m.ogDesc || "(açıklama tanımlı değil — meta description ekleyin)";

  // Pixel tahmini (ortalama 9.5px/karakter @ 20px font)
  const tPx = Math.round(title.length * 9.5);
  const dPx = Math.round(desc.length * 7.5);
  const T_MAX = 580, D_MAX = 920;

  let breadcrumb = url;
  try { const u = new URL(url); breadcrumb = [u.hostname, ...u.pathname.split("/").filter(Boolean).slice(0,3)].join(" › "); } catch {}

  const schemas = analysisData?.schema || [];
  const richTypes = ["Article","FAQPage","Product","HowTo","Review","Recipe","Event","BreadcrumbList","LocalBusiness","VideoObject"];
  const richRows = richTypes.map(t => {
    const has = schemas.some(s => s.type?.includes(t));
    const descs = {Article:"Haber/makale",FAQPage:"SSS açılır liste",Product:"Fiyat & yıldız",HowTo:"Adım adım rehber",Review:"Yıldız rating",Recipe:"Tarif kartı",Event:"Etkinlik bilgisi",BreadcrumbList:"Breadcrumb URL",LocalBusiness:"İşletme kartı",VideoObject:"Video önizleme"};
    return `<div class="row"><div class="row-body"><div class="row-label">${t}</div><div class="row-value ${has?"success":"missing"}">${has?"✓ Aktif":"○ "+esc(descs[t])+" için JSON-LD ekleyin"}</div></div></div>`;
  }).join("");

  el.innerHTML = `
    <div class="section">
      <div class="section-header"><h3>🔍 Google Önizleme</h3></div>
      <div class="section-body">
        <div class="serp-mockup">
          <div class="serp-url-bar">
            <div class="serp-favicon"></div>
            <div>
              <div class="serp-domain">${esc(breadcrumb.split("›")[0]?.trim()||"")}</div>
              <div class="serp-crumb">${esc(breadcrumb)}</div>
            </div>
          </div>
          <div class="serp-title ${tPx>T_MAX?"truncated":""}">${esc(title.substring(0,tPx>T_MAX?55:100))}${tPx>T_MAX?"...":""}</div>
          <div class="serp-desc">${esc(desc.substring(0,155))}${dPx>D_MAX?"...":""}</div>
        </div>
        <div class="metric-grid" style="margin-top:10px">
          <div class="metric-card ${tPx<=T_MAX?"good":"bad"}">
            <div class="m-label">BAŞLIK ~PX</div>
            <div class="m-val" style="font-size:15px">~${tPx}</div>
            <div class="m-status" style="color:${tPx<=T_MAX?"#00e5c0":"#ff6b6b"}">${tPx<=T_MAX?"✓ Sığıyor":"✕ Kesiliyor"} · max ~580px</div>
          </div>
          <div class="metric-card ${dPx<=D_MAX?"good":"bad"}">
            <div class="m-label">AÇIKLAMA ~PX</div>
            <div class="m-val" style="font-size:15px">~${dPx}</div>
            <div class="m-status" style="color:${dPx<=D_MAX?"#00e5c0":"#ff6b6b"}">${dPx<=D_MAX?"✓ Sığıyor":"✕ Kesiliyor"} · max ~920px</div>
          </div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-header" data-toggle-section="1"><h3>✨ Rich Snippet Potansiyeli</h3><span class="chevron">▼</span></div>
      <div class="section-body">${richRows}</div>
    </div>`;
}

// ─── FOCUS KEYWORD ───────────────────────────────────────────────────────────

function renderKeyword() {
  const el = document.getElementById("panel-keyword");
  el.innerHTML = `
    <div class="section">
      <div class="section-header"><h3>🔑 Odak Kelime Analizi</h3></div>
      <div class="section-body">
        <div style="display:flex;gap:6px;margin-bottom:4px">
          <input id="kw-input" type="text" placeholder="Hedef kelimenizi girin..." style="flex:1;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:8px 10px;color:var(--text);font-family:var(--sans);font-size:12px;outline:none" />
          <button id="kw-btn" style="background:var(--accent);color:#000;border:none;border-radius:6px;padding:8px 12px;font-family:var(--mono);font-size:11px;font-weight:700;cursor:pointer">ANALİZ</button>
        </div>
        <div style="font-size:10px;color:var(--text3);margin-bottom:10px">Örnek: "seo analizi", "chrome eklenti" vb.</div>
        <div id="kw-result"></div>
      </div>
    </div>
    <div class="section">
      <div class="section-header" data-toggle-section="1"><h3>📊 İçerikteki Kelimeler (Top 20)</h3><span class="chevron">▼</span></div>
      <div class="section-body">
        ${(analysisData?.content?.topKeywords||[]).map((kw,i)=>{
          const max = analysisData.content.topKeywords[0]?.count||1;
          return `<div class="kw-item"><span class="kw-rank">${i+1}</span><span class="kw-word">${esc(kw.word)}</span><div class="kw-bar-wrap"><div class="kw-bar"><div class="kw-bar-fill" style="width:${(kw.count/max)*100}%"></div></div></div><span class="kw-meta">${kw.count}× %${kw.density}</span></div>`;
        }).join("") || '<p style="color:var(--text3);font-size:12px">Veri yok.</p>'}
      </div>
    </div>`;

  const analyze = () => {
    const kw = document.getElementById("kw-input").value.trim().toLowerCase();
    if (!kw) return;
    const m = analysisData.meta, c = analysisData.content, h = analysisData.headings;
    const inTitle = m.title.toLowerCase().includes(kw);
    const inDesc = m.metaDesc.toLowerCase().includes(kw);
    const inH1 = (h.h1||[]).some(x=>x.text.toLowerCase().includes(kw));
    const inH2 = (h.h2||[]).some(x=>x.text.toLowerCase().includes(kw));
    const inUrl = m.url.toLowerCase().includes(kw.replace(/\s+/g,"-")) || m.url.toLowerCase().includes(encodeURIComponent(kw));
    const inAlt = analysisData.images.some(i=>i.alt.toLowerCase().includes(kw));
    const kwEntry = c.topKeywords.find(k=>k.word===kw||kw.split(" ").some(w=>k.word===w));
    const density = kwEntry?.density||0;
    const score = [inTitle,inDesc,inH1,inUrl,inAlt].filter(Boolean).length;
    const sc = score>=4?"#00e5c0":score>=2?"#ffd166":"#ff6b6b";

    const chk = (icon, label, ok, sub="") => `<div class="kw-check-row"><span class="kw-check-icon">${ok?"✅":"❌"}</span><div style="flex:1"><div class="kw-check-label">${label}</div>${sub?`<div class="kw-check-sub">${esc(sub)}</div>`:""}</div><span class="tc-badge ${ok?"ok":"fail"}">${ok?"VAR":"YOK"}</span></div>`;

    document.getElementById("kw-result").innerHTML = `
      <div style="text-align:center;padding:12px 0;margin-bottom:8px;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
        <div style="font-size:30px;font-weight:700;font-family:var(--mono);color:${sc}">${score}/5</div>
        <div style="font-size:11px;color:var(--text2);margin-top:3px">"<b>${esc(kw)}</b>" için odak skoru</div>
      </div>
      ${chk("","Sayfa Başlığı (Title)",inTitle,inTitle?m.title.substring(0,60):"Başlığa ekleyin")}
      ${chk("","Meta Açıklama",inDesc,inDesc?"":"Meta açıklamaya ekleyin")}
      ${chk("","H1 Başlık",inH1,inH1?"":(h.h1||[])[0]?.text?.substring(0,50)||"H1 başlığına ekleyin")}
      ${chk("","URL / Slug",inUrl,inUrl?"":"URL'ye ekleyin (kelime-seklinde)")}
      ${chk("","Görsel Alt Text",inAlt,inAlt?"En az bir görselde var":"Alt text'e ekleyin")}
      ${inH2?chk("","H2 Başlık (bonus)",true,"H2'de de geçiyor"):""}
      <div class="row" style="margin-top:6px"><div class="row-body">
        <div class="row-label">İçerik Yoğunluğu</div>
        <div class="row-value ${density>0&&density<=3?"success":density>3?"warn":"missing"}">${density>0?`%${density} (${kwEntry?.count||0} kez)`:"İçerikte bulunamadı"}</div>
        ${density>0?'<div style="font-size:10px;color:var(--text3)">İdeal: %0.5 – %3</div>':""}
      </div></div>`;
  };

  document.getElementById("kw-btn").addEventListener("click", analyze);
  document.getElementById("kw-input").addEventListener("keydown", e => { if (e.key==="Enter") analyze(); });
}

// ─── TECHNICAL ───────────────────────────────────────────────────────────────

function renderTechnical(technical, tech, headers, pagination, jsSeo) {
  const el = document.getElementById("panel-technical");
  const chk = (icon, label, ok, badge, sub="") => `<div class="tech-check"><span class="tc-icon">${icon}</span><div style="flex:1"><div class="tc-label">${label}</div>${sub?`<div class="tc-sub">${esc(sub)}</div>`:""}</div><span class="tc-badge ${ok===true?"ok":ok===false?"fail":ok==="warn"?"warn":"info"}">${esc(String(badge))}</span></div>`;

  // HTTP Headers block
  let headersBlock = "";
  if (headers && !headers.error) {
    const statusCls = headers.status>=200&&headers.status<300?"ok":headers.status>=300&&headers.status<400?"warn":"fail";
    const hEntries = Object.entries(headers.headers||{});
    const secHeaders = ["strict-transport-security","x-frame-options","x-content-type-options","content-security-policy","referrer-policy","permissions-policy"];
    const secPresent = secHeaders.filter(h=>headers.headers[h]);
    const xRobots = headers.headers["x-robots-tag"];

    headersBlock = `
      <div class="section">
        <div class="section-header"><h3>🌐 HTTP Response</h3></div>
        <div class="section-body">
          ${chk("📡","HTTP Status",headers.status>=200&&headers.status<400,`${headers.status}`,headers.finalUrl!==analysisData?.meta?.url?`Yönlendirme → ${headers.finalUrl?.substring(0,60)}`:"")}
          ${headers.redirected?chk("↪️","Yönlendirme","warn","Var",headers.httpsRedirect?"HTTP→HTTPS yönlendirmesi":headers.wwwChange?"www değişikliği":"Yönlendirme tespit edildi"):""}
          ${xRobots?chk("🤖","X-Robots-Tag",/noindex/i.test(xRobots)?false:"warn",xRobots):""}
          ${headers.headers["content-encoding"]?chk("📦","Sıkıştırma (Gzip/Brotli)",true,headers.headers["content-encoding"]):""}
          ${chk("🔒","HSTS",!!headers.headers["strict-transport-security"],headers.headers["strict-transport-security"]?"✓ Var":"✕ Yok")}
          ${chk("🛡️","X-Frame-Options",!!headers.headers["x-frame-options"],headers.headers["x-frame-options"]||"Yok")}
          ${chk("🔑","Cache-Control",headers.headers["cache-control"]?"info":"info",headers.headers["cache-control"]||"Tanımlı değil")}
          ${headers.headers["server"]?chk("🖥️","Server",headers.headers["x-powered-by"]?"warn":"info",`${headers.headers["server"]}${headers.headers["x-powered-by"]?" / "+headers.headers["x-powered-by"]:""}`,headers.headers["x-powered-by"]?"Sunucu teknolojisi açık — güvenlik riski":""):""}
          <div style="margin-top:6px;font-size:10px;color:var(--text3);font-family:var(--mono)">${secPresent.length}/6 güvenlik header'ı mevcut</div>
        </div>
      </div>`;
  }

  // Pagination block
  let paginationBlock = "";
  if (pagination?.hasPagination) {
    paginationBlock = `
      <div class="section">
        <div class="section-header"><h3>📄 Sayfalama (Pagination)</h3></div>
        <div class="section-body">
          ${pagination.prev?chk("◀","rel=prev",true,pagination.prev.substring(0,50)):""}
          ${pagination.next?chk("▶","rel=next",true,pagination.next.substring(0,50)):""}
          ${pagination.paginatedWithSelfCanonical?chk("⚠️","Canonical","warn","Self-canonical","Sayfalanmış sayfada self-canonical sorunlu olabilir"):""}
        </div>
      </div>`;
  }

  // JS SEO block
  let jsSeoBlock = "";
  if (jsSeo) {
    jsSeoBlock = `
      <div class="section">
        <div class="section-header" data-toggle-section="1"><h3>⚡ JavaScript SEO</h3><span class="chevron">▼</span></div>
        <div class="section-body">
          ${jsSeo.frameworks.length>0?chk("🏗️","JS Framework tespit edildi","info",jsSeo.frameworks.join(", ")):""}
          ${chk("📄","Noscript tag",jsSeo.hasNoscript,jsSeo.hasNoscript?`✓ ${jsSeo.noscriptCount} adet`:"✕ Yok",!jsSeo.hasNoscript&&jsSeo.frameworks.length>0?"JS devre dışıyken içerik gösterilmiyor olabilir":"")}
          ${jsSeo.likelySPA?chk("⚠️","SPA Riski","warn","Dikkat","Sayfa içeriği çok az — JS ile render ediliyor olabilir, bot erişimi kontrol edin"):""}
          ${chk("📝","Görünür metin uzunluğu","info",`${jsSeo.bodyTextLength} karakter`)}
        </div>
      </div>`;
  }

  const robots = tech?.robotsTxt, sitemap = tech?.sitemapXml;
  el.innerHTML = `
    <div class="section">
      <div class="section-header"><h3>🔒 Güvenlik & İndeksleme</h3></div>
      <div class="section-body">
        ${chk("🔒","HTTPS",technical.hasHttps,technical.hasHttps?"✓ HTTPS":"✕ HTTP")}
        ${chk("🤖","Noindex",!technical.noindex,technical.noindex?"ENGELLENIYOR":"✓ İndekslenebilir",technical.noindex?"Bu sayfa arama sonuçlarında görünmez!":"")}
        ${chk("🚫","Nofollow (meta)",!technical.nofollow,technical.nofollow?"Var":"✓ Yok")}
      </div>
    </div>
    <div class="section">
      <div class="section-header"><h3>🕷️ Crawlability</h3></div>
      <div class="section-body">
        ${chk("📄","robots.txt",!robots?"info":robots.accessible?(!robots.pageDisallowed):false,!robots?"?":robots.accessible?"✓ Erişilebilir":`✕ HTTP ${robots.status}`,robots?.pageDisallowed?"⚠ Bu sayfa robots.txt'te engellenmiş!":robots?.isDisallowAll?"⚠ Disallow: / — Tüm site!":robots?.hasSitemap?"Sitemap referansı var":"")}
        ${chk("🗺️","sitemap.xml",!sitemap?"info":sitemap.accessible,!sitemap?"?":sitemap.accessible?"✓ Mevcut":"✕ Bulunamadı",sitemap?.accessible?sitemap.url?.replace(/^https?:\/\/[^/]+/,"")||"":"")}
        ${robots?.sitemapUrls?.length>0?`<div class="tech-check"><span class="tc-icon">🔗</span><div style="flex:1"><div class="tc-label">Sitemap URL'leri</div>${robots.sitemapUrls.map(u=>`<div class="tc-sub">${esc(u.substring(0,70))}</div>`).join("")}</div></div>`:""}
      </div>
    </div>
    <div class="section">
      <div class="section-header"><h3>🌐 Sayfa Özellikleri</h3></div>
      <div class="section-body">
        ${chk("❤️","Favicon",technical.favicon,technical.favicon?"✓ Var":"✕ Yok")}
        ${chk("📱","Viewport",technical.hasViewport,technical.hasViewport?"✓ Tanımlı":"✕ Eksik")}
        ${chk("🗣️","HTML lang",!!technical.lang,technical.lang?`✓ ${technical.lang}`:"✕ Eksik")}
        ${chk("🔗","Canonical",!!analysisData?.meta?.canonical,analysisData?.meta?.canonicalIsSelf?"✓ Self-canonical":analysisData?.meta?.canonicalIsExternal?"⚠ Harici":analysisData?.meta?.canonical?"✓ Var":"✕ Yok")}
        ${chk("⚡","AMP",technical.ampUrl?"info":"info",technical.ampUrl?"✓ Var":"Yok")}
        ${technical.hreflang?.length>0?`<div class="tech-check"><span class="tc-icon">🌍</span><div style="flex:1"><div class="tc-label">Hreflang (${technical.hreflang.length} dil)</div><div style="margin-top:4px;display:flex;flex-wrap:wrap">${technical.hreflang.map(h=>`<span class="hreflang-item">${esc(h.lang)}</span>`).join("")}</div></div></div>`:chk("🌍","Hreflang","info","Yok")}
      </div>
    </div>
    ${headersBlock}
    ${paginationBlock}
    ${jsSeoBlock}
    <div class="section">
      <div class="section-header" data-toggle-section="1"><h3>📦 Sayfa Kaynakları</h3><span class="chevron">▼</span></div>
      <div class="section-body">
        <div class="metric-grid">
          <div class="metric-card"><div class="m-label">SCRIPT</div><div class="m-val">${technical.scripts}</div></div>
          <div class="metric-card"><div class="m-label">STİLSHEET</div><div class="m-val">${technical.stylesheets}</div></div>
          <div class="metric-card ${technical.iFrames>0?"warn":""}"><div class="m-label">IFRAME</div><div class="m-val">${technical.iFrames}</div></div>
          <div class="metric-card"><div class="m-label">PRELOAD</div><div class="m-val">${technical.resourceHints?.preload||0}</div></div>
          <div class="metric-card"><div class="m-label">PRECONNECT</div><div class="m-val">${technical.resourceHints?.preconnect||0}</div></div>
          <div class="metric-card ${technical.inlineStyles>50?"warn":""}"><div class="m-label">INLINE STYLE</div><div class="m-val">${technical.inlineStyles}</div></div>
        </div>
      </div>
    </div>`;
}

// ─── META ────────────────────────────────────────────────────────────────────

function renderMeta(m) {
  const el = document.getElementById("panel-meta");
  const tc = (len,min,max) => len>=min&&len<=max?"success":len===0?"danger":"warn";
  const cn = m.canonicalIsExternal?" ⚠ Harici domain":m.canonicalIsSelf?" ✓ Self-canonical":"";
  el.innerHTML = `
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>🏷️ Temel Meta</h3><span class="chevron">▼</span></div><div class="section-body">
      ${mRow("Sayfa Başlığı",m.title,tc(m.titleLength,30,60),m.titleLength,60,"30–60 karakter")}
      ${mRow("Meta Açıklama",m.metaDesc,tc(m.metaDescLength,70,160),m.metaDescLength,160,"70–160 karakter")}
      ${mRow("Canonical URL",m.canonical?(m.canonical+cn):"",m.canonical?(m.canonicalIsExternal?"warn":"success"):"missing")}
      ${mRow("Robots",m.robots||"(tanımsız — varsayılan index,follow)",m.robots?"":"missing")}
      ${mRow("Dil (lang)",m.lang,m.lang?"success":"danger")}
      ${mRow("Charset",m.charset,m.charset?"success":"missing")}
      ${mRow("Viewport",m.viewport,m.viewport?"success":"danger")}
      ${mRow("HTTPS",m.hasHttps?"✅ Aktif":"❌ HTTP",m.hasHttps?"success":"danger")}
      ${mRow("Keywords",m.metaKeywords||"(yok)",m.metaKeywords?"":"missing")}
    </div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>📘 Open Graph</h3><span class="chevron">▼</span></div><div class="section-body">
      ${mRow("og:title",m.ogTitle)} ${mRow("og:description",m.ogDesc)} ${mRow("og:image",m.ogImage)} ${mRow("og:type",m.ogType)} ${mRow("og:url",m.ogUrl)}
    </div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>🐦 Twitter Card</h3><span class="chevron">▼</span></div><div class="section-body">
      ${mRow("twitter:card",m.twitterCard)} ${mRow("twitter:title",m.twitterTitle)} ${mRow("twitter:description",m.twitterDesc)} ${mRow("twitter:image",m.twitterImage)}
    </div></div>`;
}

function mRow(label, value, cls="", len=0, max=0, hint="") {
  const empty = !value||value==="(yok)";
  const bar = max>0&&len>0?`<div class="char-bar"><div class="char-bar-fill" style="width:${Math.min(100,(len/max)*100)}%;background:${len<=max?"#00e5c0":"#ff6b6b"}"></div></div><span style="font-size:10px;color:var(--text3)">${len} karakter${hint?` — ${hint}`:""}</span>`:"";
  return `<div class="row"><div class="row-body"><div class="row-label">${label}</div><div class="row-value ${empty?"missing":cls}">${empty?"(tanımsız)":esc(value.substring(0,200))}</div>${bar}</div></div>`;
}

// ─── CONTENT ─────────────────────────────────────────────────────────────────

function renderContent(c) {
  const el = document.getElementById("panel-content");
  const max = c.topKeywords[0]?.count||1;
  const rs = Math.min(100,c.avgSentenceWords<=12?95:c.avgSentenceWords<=17?80:c.avgSentenceWords<=22?60:c.avgSentenceWords<=28?40:25);
  const rc = rs>=80?"#00e5c0":rs>=60?"#ffd166":"#ff6b6b";
  const wc = c.wordCount; const wco = wc>=600?"#00e5c0":wc>=300?"#ffd166":"#ff6b6b";
  el.innerHTML = `
    <div class="section"><div class="section-header"><h3>📊 İçerik Özeti</h3></div><div class="section-body">
      <div style="font-size:10px;color:var(--text3);font-family:var(--mono);margin-bottom:6px">Kaynak: &lt;${c.contentAreaUsed}&gt; (nav/header/footer hariç)</div>
      <div class="content-grid">
        <div class="content-stat"><div class="cs-val" style="color:${wco}">${wc}</div><div class="cs-label">KELİME</div></div>
        <div class="content-stat"><div class="cs-val">${c.sentences}</div><div class="cs-label">CÜMLE</div></div>
        <div class="content-stat"><div class="cs-val">${c.paragraphs}</div><div class="cs-label">PARAGRAF</div></div>
        <div class="content-stat"><div class="cs-val">${c.readingTimeMin}</div><div class="cs-label">DAKİKA</div></div>
        <div class="content-stat"><div class="cs-val">${c.avgSentenceWords}</div><div class="cs-label">KEL/CÜMLE</div></div>
        <div class="content-stat"><div class="cs-val" style="color:${wco}">${wc>=600?"✓":wc>=300?"~":"✗"}</div><div class="cs-label">600+KEL</div></div>
      </div>
    </div></div>
    <div class="section"><div class="section-header"><h3>📖 Okunabilirlik</h3></div><div class="section-body">
      <div class="row"><div class="row-body">
        <div class="row-label">Ort. ${c.avgSentenceWords} kelime/cümle (ideal ≤15)</div>
        <div class="readability-bar"><div class="readability-fill" style="width:${rs}%"></div></div>
        <span style="font-size:11px;color:${rc};font-family:var(--mono);font-weight:700">${rs>=80?"Kolay":rs>=60?"Orta":"Zor"} Okunabilirlik</span>
      </div></div>
    </div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>🔑 Kelime Sıklığı</h3><span class="badge" style="background:var(--bg3);color:var(--text2)">${c.topKeywords.length}</span><span class="chevron">▼</span></div><div class="section-body">
      ${c.topKeywords.map((k,i)=>`<div class="kw-item"><span class="kw-rank">${i+1}</span><span class="kw-word">${esc(k.word)}</span><div class="kw-bar-wrap"><div class="kw-bar"><div class="kw-bar-fill" style="width:${(k.count/max)*100}%"></div></div></div><span class="kw-meta">${k.count}× %${k.density}</span></div>`).join("")||'<p style="color:var(--text3);font-size:12px">Veri yok.</p>'}
    </div></div>`;
}

// ─── HEADINGS ────────────────────────────────────────────────────────────────

function renderHeadings(h) {
  const el = document.getElementById("panel-headings");
  const h1c = h.h1?.length||0;
  let warns = "";
  if (!h1c) warns+=`<div class="issue-item"><span class="issue-icon">🔴</span><div class="issue-body"><div class="issue-title">H1 başlık yok</div></div></div>`;
  else if (h1c>1) warns+=`<div class="issue-item"><span class="issue-icon">🟡</span><div class="issue-body"><div class="issue-title">${h1c} adet H1 — sadece 1 olmalı</div></div></div>`;
  if (h.h1MatchesTitle) warns+=`<div class="issue-item"><span class="issue-icon">🟢</span><div class="issue-body"><div class="issue-title">H1 ile sayfa başlığı uyumlu</div></div></div>`;
  else if (h1c>0) warns+=`<div class="issue-item"><span class="issue-icon">🟡</span><div class="issue-body"><div class="issue-title">H1 ile başlık örtüşmüyor — önerilir</div></div></div>`;
  if (h.orderSkips>0) warns+=`<div class="issue-item"><span class="issue-icon">🟡</span><div class="issue-body"><div class="issue-title">${h.orderSkips} başlık seviye atlaması (H1→H3 gibi)</div></div></div>`;

  let rows="";
  for(let i=1;i<=6;i++) (h[`h${i}`]||[]).forEach(item=>{rows+=`<div class="heading-item" style="padding-left:${(i-1)*10}px"><span class="h-tag h${i}">H${i}</span><span class="h-text">${esc(item.text)||"<i style='color:var(--text3)'>(boş)</i>"}</span></div>`;});
  const tot=[1,2,3,4,5,6].reduce((s,i)=>s+(h[`h${i}`]?.length||0),0);

  el.innerHTML = `
    <div class="section"><div class="section-header"><h3>📝 Başlık Analizi</h3></div><div class="section-body">
      ${warns}
      <div class="metric-grid">${[1,2,3,4,5,6].map(i=>`<div class="metric-card ${i===1&&(h[`h${i}`]?.length||0)===1?"good":i===1?"bad":""}"><div class="m-label">H${i}</div><div class="m-val">${h[`h${i}`]?.length||0}</div></div>`).join("")}</div>
    </div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>🗂️ Başlık Ağacı</h3><span class="badge" style="background:var(--bg3);color:var(--text2)">${tot}</span><span class="chevron">▼</span></div>
    <div class="section-body">${rows||'<p style="color:var(--text3);font-size:12px">Başlık bulunamadı.</p>'}</div></div>`;
}

// ─── PERFORMANCE ─────────────────────────────────────────────────────────────

function renderPerformance(perf, psi) {
  const el = document.getElementById("panel-perf");
  const gr = (v,g,m) => v==null?"":v<=g?"good":v<=m?"warn":"bad";
  const co = c => c==="good"?"#00e5c0":c==="warn"?"#ffd166":c==="bad"?"#ff6b6b":"var(--text2)";
  const lb = c => c==="good"?"İyi":c==="warn"?"Geliştir":c==="bad"?"Yavaş":"—";
  const fmt = ms => ms==null?"—":ms>=1000?(ms/1000).toFixed(1):ms;
  const u = ms => ms==null?"":ms>=1000?"s":"ms";

  let psiBlock = "";
  if (psi&&!psi.error) {
    const metricCard=(label,val,score)=>{const c=score==null?"":score>=0.9?"good":score>=0.5?"warn":"bad";return`<div class="metric-card ${c}"><div class="m-label">${label}</div><div class="m-val" style="font-size:14px">${val||"—"}</div><div class="m-status" style="color:${co(c)}">${lb(c)}</div></div>`;};
    psiBlock=`<div class="section"><div class="section-header"><h3>🚀 PageSpeed Lab (Mobil)</h3></div><div class="section-body">
      <div class="metric-grid">${metricCard("FCP",psi.metrics.fcp,psi.metrics.fcpScore)}${metricCard("LCP",psi.metrics.lcp,psi.metrics.lcpScore)}${metricCard("TBT",psi.metrics.tbt,null)}${metricCard("CLS",psi.metrics.cls,null)}${metricCard("Speed Index",psi.metrics.si,null)}${metricCard("TTI",psi.metrics.tti,null)}</div>
      ${psi.fieldData?`<div style="margin-top:8px;padding:8px;background:var(--bg3);border-radius:6px;border:1px solid var(--border);font-size:11px;color:var(--text2)">🌍 CrUX: LCP ${psi.fieldData.lcpMs}ms (${psi.fieldData.lcpCategory})</div>`:""}
    </div></div>
    ${psi.opportunities?.length?`<div class="section"><div class="section-header" data-toggle-section="1"><h3>💡 Fırsatlar (PSI)</h3><span class="chevron">▼</span></div><div class="section-body">${psi.opportunities.map(o=>`<div class="issue-item"><span class="issue-icon">${o.score<0.5?"🔴":"🟡"}</span><div class="issue-body"><div class="issue-title">${esc(o.title)}</div>${o.displayValue?`<div class="issue-desc">${esc(o.displayValue)}</div>`:""}</div></div>`).join("")}</div></div>`:""}`;
  }

  if (!perf) { el.innerHTML = psiBlock+`<div class="empty-state"><div class="icon">⚡</div><h3>Tarayıcı verisi alınamadı</h3></div>`; return; }

  const fcpC=gr(perf.fcp,1800,3000),lcpC=gr(perf.lcp,2500,4000),ttfbC=gr(perf.ttfb,600,1500),domC=gr(perf.domLoad,1500,3000);
  const clsC=perf.cls==null?"":perf.cls<=0.1?"good":perf.cls<=0.25?"warn":"bad";
  const resTypes=Object.entries(perf.resourceBreakdown||{}).sort((a,b)=>b[1]-a[1]);
  const maxR=Math.max(...Object.values(perf.resourceBreakdown||{}),1);

  el.innerHTML = psiBlock+`
    <div class="section"><div class="section-header"><h3>⚡ Tarayıcı Ölçümü</h3></div><div class="section-body">
      <div class="metric-grid">
        <div class="metric-card ${fcpC}"><div class="m-label">FCP</div><div class="m-val">${fmt(perf.fcp)}<span class="m-unit">${u(perf.fcp)}</span></div><div class="m-status" style="color:${co(fcpC)}">${lb(fcpC)} · &lt;1.8s</div></div>
        <div class="metric-card ${lcpC}"><div class="m-label">LCP</div><div class="m-val">${fmt(perf.lcp)}<span class="m-unit">${u(perf.lcp)}</span></div><div class="m-status" style="color:${co(lcpC)}">${lb(lcpC)} · &lt;2.5s</div></div>
        <div class="metric-card ${ttfbC}"><div class="m-label">TTFB</div><div class="m-val">${fmt(perf.ttfb)}<span class="m-unit">${u(perf.ttfb)}</span></div><div class="m-status" style="color:${co(ttfbC)}">${lb(ttfbC)} · &lt;600ms</div></div>
        <div class="metric-card ${clsC}"><div class="m-label">CLS</div><div class="m-val" style="font-size:15px">${perf.cls??"-"}</div><div class="m-status" style="color:${co(clsC)}">${clsC?lb(clsC):"—"} · &lt;0.1</div></div>
        <div class="metric-card ${domC}"><div class="m-label">DOM</div><div class="m-val">${fmt(perf.domLoad)}<span class="m-unit">${u(perf.domLoad)}</span></div><div class="m-status" style="color:${co(domC)}">${lb(domC)}</div></div>
        <div class="metric-card"><div class="m-label">TAM YÜK</div><div class="m-val">${fmt(perf.fullLoad)}<span class="m-unit">${u(perf.fullLoad)}</span></div></div>
      </div>
    </div></div>
    <div class="section"><div class="section-header"><h3>📦 Sayfa Ağırlığı</h3></div><div class="section-body">
      <div class="metric-grid">
        <div class="metric-card ${perf.totalTransferKB>3000?"bad":perf.totalTransferKB>1500?"warn":"good"}"><div class="m-label">TRANSFER</div><div class="m-val">${perf.totalTransferKB}<span class="m-unit">KB</span></div><div class="m-status" style="color:${co(perf.totalTransferKB>3000?"bad":perf.totalTransferKB>1500?"warn":"good")}">&lt;1500 KB ideal</div></div>
        <div class="metric-card"><div class="m-label">KAYNAK SAYISI</div><div class="m-val">${perf.totalResources}</div></div>
        ${perf.renderBlocking>0?`<div class="metric-card bad"><div class="m-label">RENDER BLOCKING</div><div class="m-val">${perf.renderBlocking}</div><div class="m-status" style="color:#ff6b6b">Yavaşlatıyor</div></div>`:""}
        ${perf.largestResource?`<div class="metric-card"><div class="m-label">EN BÜYÜK</div><div class="m-val" style="font-size:11px">${esc(perf.largestResource.name)}</div><div class="m-status" style="color:var(--text3)">${perf.largestResource.size}KB</div></div>`:""}
      </div>
    </div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>🔢 Kaynak Türleri</h3><span class="chevron">▼</span></div><div class="section-body">
      ${resTypes.map(([t,c])=>`<div class="res-item"><span class="res-type">${t}</span><div class="res-bar-wrap"><div class="perf-bar"><div class="perf-bar-fill" style="width:${(c/maxR)*100}%;background:var(--accent2)"></div></div></div><span class="res-count">${c}</span></div>`).join("")||'<p style="color:var(--text3);font-size:12px">Veri yok.</p>'}
    </div></div>`;
}

// ─── IMAGES ──────────────────────────────────────────────────────────────────

function renderImages(images) {
  const el = document.getElementById("panel-images");
  const tot=images.length, withAlt=images.filter(i=>i.alt).length, lazy=images.filter(i=>i.loading==="lazy").length;
  const noDim=images.filter(i=>!i.hasDimensions).length, oversized=images.filter(i=>i.isLargeDisplay).length;

  el.innerHTML = `
    <div class="section"><div class="section-header"><h3>🖼️ Görsel Analizi</h3></div><div class="section-body">
      <div class="metric-grid">
        <div class="metric-card"><div class="m-label">TOPLAM</div><div class="m-val">${tot}</div></div>
        <div class="metric-card ${withAlt===tot?"good":"bad"}"><div class="m-label">ALT VAR</div><div class="m-val">${withAlt}</div></div>
        <div class="metric-card ${(tot-withAlt)===0?"good":"bad"}"><div class="m-label">ALT EKSİK</div><div class="m-val">${tot-withAlt}</div></div>
        <div class="metric-card ${lazy>0?"good":""}"><div class="m-label">LAZY LOAD</div><div class="m-val">${lazy}</div></div>
        <div class="metric-card ${noDim===0?"good":"warn"}"><div class="m-label">W/H EKSİK</div><div class="m-val">${noDim}</div></div>
        ${oversized>0?`<div class="metric-card bad"><div class="m-label">2000px+</div><div class="m-val">${oversized}</div></div>`:""}
      </div>
      ${noDim>0?'<div style="font-size:10px;color:var(--warn);margin-top:6px">⚠ width/height eksik görseller CLS sorununa yol açar.</div>':""}
    </div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>📋 Görsel Listesi</h3><span class="badge" style="background:var(--bg3);color:var(--text2)">${Math.min(tot,60)}/${tot}</span><span class="chevron">▼</span></div><div class="section-body">
      ${images.slice(0,60).map(img=>{
        const st=!img.hasAlt?"🔴":img.altEmpty?"🟡":"🟢";
        const at=!img.hasAlt?"alt yok":img.altEmpty?"(boş)":img.alt;
        const fn=img.src?.split("/").pop()?.split("?")[0]?.substring(0,40)||"?";
        const dw=!img.hasDimensions?` <span style="color:var(--warn);font-size:9px">[w/h?]</span>`:"";
        const ow=img.isLargeDisplay?` <span style="color:var(--danger);font-size:9px">[büyük]</span>`:"";
        return `<div class="img-item"><span class="img-status">${st}</span><div class="img-info"><div class="img-src">${esc(fn)}${dw}${ow}</div><div class="img-alt ${!img.alt?"empty":""}">${esc(at)}</div></div></div>`;
      }).join("")||'<p style="color:var(--text3);font-size:12px">Görsel yok.</p>'}
    </div></div>`;
}

// ─── LINKS ───────────────────────────────────────────────────────────────────

function renderLinks(links, broken) {
  const el = document.getElementById("panel-links");
  const int=links.filter(l=>l.isInternal), ext=links.filter(l=>!l.isInternal);
  const nof=links.filter(l=>l.nofollow), noT=links.filter(l=>!l.hasText), dup=links.filter(l=>l.isDuplicate);

  let brokenBlock = broken
    ? (() => {
        const bad=Object.entries(broken).filter(([,r])=>!r.ok);
        return `<div class="section"><div class="section-header" data-toggle-section="1"><h3>🔍 Broken Link</h3><span class="badge" style="background:${bad.length?"rgba(255,107,107,0.1)":"rgba(0,229,192,0.1)"};color:${bad.length?"#ff6b6b":"#00e5c0"}">${bad.length} sorun</span><span class="chevron">▼</span></div><div class="section-body">
          ${bad.length===0?`<p style="color:var(--success);font-size:12px">✓ ${Object.keys(broken).length} linkte sorun yok.</p>`:bad.map(([url,r])=>`<div class="issue-item"><span class="issue-icon">🔴</span><div class="issue-body"><div class="issue-title">${r.error||`HTTP ${r.status}`}</div><div class="issue-desc" style="word-break:break-all">${esc(url.substring(0,80))}</div></div></div>`).join("")}
        </div></div>`;
      })()
    : `<div class="section"><div class="section-header"><h3>🔍 Broken Link</h3></div><div class="section-body"><p style="font-size:11px;color:var(--text3)">Ayarlar sekmesinden limit belirleyin.</p></div></div>`;

  const lRow = l => `<div class="link-item"><span class="link-badge ${l.nofollow?"nf":l.isInternal?"int":"ext"}">${l.nofollow?"NF":l.isInternal?"İÇ":"DIŞ"}</span><div style="flex:1;min-width:0"><div class="link-text">${esc(l.text)||'<i style="color:var(--text3)">Metin yok</i>'}</div><div class="link-url">${esc(l.href?.substring(0,65))}</div></div>${broken&&broken[l.href]?`<span class="tc-badge ${broken[l.href].ok?"ok":"fail"}">${broken[l.href].ok?"✓":broken[l.href].status||"✕"}</span>`:""}</div>`;

  el.innerHTML = `
    <div class="section"><div class="section-header"><h3>🔗 Link Özeti</h3></div><div class="section-body">
      <div class="link-stats">
        <div class="link-stat"><div class="ls-val">${links.length}</div><div class="ls-label">Toplam</div></div>
        <div class="link-stat"><div class="ls-val" style="color:var(--success)">${int.length}</div><div class="ls-label">İç</div></div>
        <div class="link-stat"><div class="ls-val" style="color:var(--accent2)">${ext.length}</div><div class="ls-label">Dış</div></div>
      </div>
      ${nof.length>0?`<div class="row"><div class="row-body"><div class="row-label">Nofollow</div><div class="row-value warn">${nof.length}</div></div></div>`:""}
      ${noT.length>0?`<div class="row"><div class="row-body"><div class="row-label">Anchor text yok</div><div class="row-value danger">${noT.length}</div></div></div>`:""}
      ${dup.length>0?`<div class="row"><div class="row-body"><div class="row-label">Tekrar eden</div><div class="row-value warn">${dup.length}</div></div></div>`:""}
    </div></div>
    ${brokenBlock}
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>📎 İç Linkler</h3><span class="badge" style="background:rgba(0,229,192,0.1);color:var(--success)">${int.length}</span><span class="chevron">▼</span></div><div class="section-body">${int.slice(0,40).map(lRow).join("")||'<p style="color:var(--text3);font-size:12px">Yok.</p>'}</div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>🌐 Dış Linkler</h3><span class="badge" style="background:rgba(124,106,255,0.1);color:var(--accent2)">${ext.length}</span><span class="chevron">▼</span></div><div class="section-body">${ext.slice(0,40).map(lRow).join("")||'<p style="color:var(--text3);font-size:12px">Yok.</p>'}</div></div>`;
}

// ─── SCHEMA ──────────────────────────────────────────────────────────────────

function renderSchema(schemas) {
  const el = document.getElementById("panel-schema");
  el.innerHTML = `
    <div class="section"><div class="section-header"><h3>🧩 JSON-LD</h3></div><div class="section-body">
      ${schemas.length===0?`<div class="issue-item"><span class="issue-icon">🟡</span><div class="issue-body"><div class="issue-title">Schema markup bulunamadı</div><div class="issue-desc">Rich snippet'ler için JSON-LD ekleyin</div></div></div>`:
      `<div style="margin-bottom:8px"><span class="tag good">✓ ${schemas.length} schema</span></div>`+schemas.map(s=>`<div class="schema-item"><div class="schema-type">{} ${esc(s.type)}</div><span class="schema-valid ${s.valid?"good":"bad"}">${s.valid?"✓ Geçerli":"✕ Hatalı"}</span><pre class="schema-raw">${esc(s.raw)}</pre></div>`).join("")}
    </div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>💡 Önerilen Türler</h3><span class="chevron">▼</span></div><div class="section-body">
      ${["Organization","WebSite","BreadcrumbList","Article","Product","FAQPage","LocalBusiness","Person","Event","Recipe","HowTo","Review","NewsArticle"].map(t=>{const h=schemas.some(s=>s.type?.includes(t));return`<div class="row"><div class="row-body"><div class="row-value ${h?"success":"missing"}">${h?"✓":"○"} ${t}</div></div></div>`;}).join("")}
    </div></div>`;
}

// ─── SOCIAL ──────────────────────────────────────────────────────────────────

function renderSocial(m) {
  const el = document.getElementById("panel-social");
  const domain = m.hostname || "";
  const imgTag = (src, fb) => src ? `<img src="${esc(src)}" alt="" style="width:100%;height:100%;object-fit:cover" onerror="this.parentElement.innerHTML='<span class=sp-image-empty>${fb}</span>'">` : `<span class="sp-image-empty">${fb}</span>`;
  const s1=[m.ogTitle,m.ogDesc,m.ogImage,m.ogType].filter(Boolean).length;
  const s2=[m.twitterCard,m.twitterTitle||m.ogTitle,m.twitterImage||m.ogImage].filter(Boolean).length;

  el.innerHTML = `
    <div class="section"><div class="section-header"><h3>📊 Sosyal Skor</h3></div><div class="section-body">
      <div class="metric-grid">
        <div class="metric-card ${s1===4?"good":s1>=2?"warn":"bad"}"><div class="m-label">OPEN GRAPH</div><div class="m-val">${s1}<span class="m-unit">/4</span></div><div class="m-status" style="color:${s1===4?"#00e5c0":s1>=2?"#ffd166":"#ff6b6b"}">${s1===4?"Tam":"Eksik"}</div></div>
        <div class="metric-card ${s2===3?"good":s2>=1?"warn":"bad"}"><div class="m-label">TWITTER</div><div class="m-val">${s2}<span class="m-unit">/3</span></div><div class="m-status" style="color:${s2===3?"#00e5c0":s2>=1?"#ffd166":"#ff6b6b"}">${s2===3?"Tam":"Eksik"}</div></div>
      </div>
    </div></div>
    <div class="section"><div class="section-header"><h3>📘 Facebook Önizleme</h3></div><div class="section-body">
      <div class="sp-card"><div class="sp-image">${imgTag(m.ogImage,"🖼️")}</div><div class="sp-body"><div class="sp-domain">${esc(domain.toUpperCase())}</div><div class="sp-title">${esc((m.ogTitle||m.title||"(başlık yok)").substring(0,90))}</div><div class="sp-desc">${esc((m.ogDesc||m.metaDesc||"").substring(0,150))}</div></div></div>
      ${mRow("og:title",m.ogTitle)} ${mRow("og:description",m.ogDesc)} ${mRow("og:image",m.ogImage)} ${mRow("og:type",m.ogType)}
    </div></div>
    <div class="section"><div class="section-header"><h3>🐦 Twitter Önizleme</h3></div><div class="section-body">
      <div class="sp-card"><div class="sp-image">${imgTag(m.twitterImage||m.ogImage,"🐦")}</div><div class="sp-body"><div class="sp-title">${esc((m.twitterTitle||m.ogTitle||m.title||"").substring(0,90))}</div><div class="sp-desc">${esc((m.twitterDesc||m.ogDesc||m.metaDesc||"").substring(0,140))}</div><div class="sp-domain" style="margin-top:5px;font-size:10px;color:var(--text3)">🐦 ${esc(domain)}</div></div></div>
      ${mRow("twitter:card",m.twitterCard)} ${mRow("twitter:title",m.twitterTitle)} ${mRow("twitter:description",m.twitterDesc)} ${mRow("twitter:image",m.twitterImage)}
    </div></div>`;
}

// ─── ACCESSIBILITY ───────────────────────────────────────────────────────────

function renderAccessibility(a) {
  const el = document.getElementById("panel-a11y");
  const issues = [], warnings = [], goods = [];
  if (a.imgsNoAlt>0) issues.push(`${a.imgsNoAlt} görselde alt attribute yok`);
  else goods.push("Tüm görsellerde alt attribute var");
  if (a.inputsNoLabel>0) issues.push(`${a.inputsNoLabel} form alanında label yok`);
  else goods.push("Form alanları label'lı");
  if (a.btnsNoText>0) warnings.push(`${a.btnsNoText} buton accessible text yok`);
  if (!a.hasMain) warnings.push("<main> veya role=main tanımlı değil");
  else goods.push("<main> landmark var");
  if (!a.hasLang) issues.push("HTML lang attribute eksik");
  else goods.push("HTML lang var");
  if (!a.hasSkipNav) warnings.push("Skip navigation link yok");
  else goods.push("Skip nav link var");
  if (a.headingSkips>0) warnings.push(`${a.headingSkips} başlık seviye atlaması`);
  else goods.push("Başlık sırası düzgün");
  if (a.tabIndex>0) warnings.push(`${a.tabIndex} elemanda tabindex>0 (klavye sırası bozulabilir)`);

  const score = Math.max(0, 100 - issues.length*15 - warnings.length*8);
  const deg = Math.round(score*3.6);
  const sc = score>=80?"#00e5c0":score>=50?"#ffd166":"#ff6b6b";

  const rows = (arr,icon) => arr.map(i=>`<div class="issue-item"><span class="issue-icon">${icon}</span><div class="issue-body"><div class="issue-title">${esc(i)}</div></div></div>`).join("");

  el.innerHTML = `
    <div class="section"><div class="section-header"><h3>♿ Erişilebilirlik Skoru</h3></div><div class="section-body">
      <div style="text-align:center;padding:10px 0">
        <div class="a11y-score-circle" style="background:conic-gradient(${sc} ${deg}deg,var(--bg3) ${deg}deg)"><span class="a11y-score-num" style="color:${sc}">${score}</span></div>
        <div style="font-size:11px;color:var(--text2)">${score>=80?"İyi":"score>=50?Orta:Geliştirilmeli"}</div>
      </div>
      <div class="metric-grid">
        <div class="metric-card ${a.imgsNoAlt===0?"good":"bad"}"><div class="m-label">ALT EKSİK</div><div class="m-val">${a.imgsNoAlt}</div></div>
        <div class="metric-card ${a.inputsNoLabel===0?"good":"bad"}"><div class="m-label">LABEL EKSİK</div><div class="m-val">${a.inputsNoLabel}</div></div>
        <div class="metric-card ${a.btnsNoText===0?"good":"warn"}"><div class="m-label">BUTON TEXT</div><div class="m-val">${a.btnsNoText===0?"✓":"✗"}</div></div>
        <div class="metric-card ${a.hasMain?"good":"warn"}"><div class="m-label">MAIN LANDMARK</div><div class="m-val">${a.hasMain?"✓":"✗"}</div></div>
      </div>
    </div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>🔴 Sorunlar</h3><span class="badge" style="background:rgba(255,107,107,0.1);color:#ff6b6b">${issues.length}</span><span class="chevron">▼</span></div><div class="section-body">${rows(issues,"🔴")||'<p style="color:var(--text3);font-size:12px">Sorun yok!</p>'}</div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>🟡 Uyarılar</h3><span class="badge" style="background:rgba(255,209,102,0.1);color:#ffd166">${warnings.length}</span><span class="chevron">▼</span></div><div class="section-body">${rows(warnings,"🟡")||'<p style="color:var(--text3);font-size:12px">Uyarı yok.</p>'}</div></div>
    <div class="section"><div class="section-header" data-toggle-section="1"><h3>🟢 Başarılı</h3><span class="chevron">▼</span></div><div class="section-body">${rows(goods,"🟢")}</div></div>`;
}

// ─── HISTORY ─────────────────────────────────────────────────────────────────

async function renderHistory() {
  const el = document.getElementById("panel-history");
  const { scanHistory = [] } = await chrome.storage.local.get("scanHistory");

  if (!scanHistory.length) {
    el.innerHTML = `<div class="empty-state"><div class="icon">📜</div><h3>Geçmiş Yok</h3><p>Her tarama burada kaydedilir.</p></div>`;
    return;
  }

  const rows = scanHistory.map((item, i) => {
    const co = item.score>=80?"#00e5c0":item.score>=60?"#00e5c0":item.score>=40?"#ffd166":"#ff6b6b";
    const deg = Math.round(item.score*3.6);
    let domain = item.url; try { domain = new URL(item.url).hostname; } catch {}
    const dt = new Date(item.timestamp).toLocaleString("tr-TR");
    const isCur = i===0 && analysisData?.meta?.url===item.url;
    return `<div class="history-item">
      <div class="history-score" style="background:conic-gradient(${co} ${deg}deg,var(--bg3) ${deg}deg)">
        <div class="history-score-inner" style="color:${co}">${item.score}</div>
      </div>
      <div class="history-info">
        <div class="history-url">${esc(domain)}${isCur?' <span style="color:var(--accent);font-size:9px">[şu an]</span>':""}</div>
        <div class="history-date">${dt}</div>
      </div>
      <div class="history-counts">
        <div style="font-size:10px;color:var(--danger)">${item.issues} hata</div>
        <div style="font-size:10px;color:var(--warn)">${item.warnings} uyarı</div>
      </div>
    </div>`;
  }).join("");

  el.innerHTML = `
    <div class="section">
      <div class="section-header">
        <h3>📜 Son ${scanHistory.length} Tarama</h3>
        <button id="clear-hist" style="margin-left:auto;background:rgba(255,107,107,0.1);border:none;color:#ff6b6b;border-radius:4px;padding:2px 8px;font-size:10px;font-family:var(--mono);cursor:pointer">Temizle</button>
      </div>
      <div class="section-body">${rows}</div>
    </div>`;

  document.getElementById("clear-hist")?.addEventListener("click", async () => {
    await chrome.storage.local.remove("scanHistory");
    renderHistory();
  });
}

// ─── TOOLS ───────────────────────────────────────────────────────────────────

function renderTools(url) {
  const el = document.getElementById("panel-tools");
  const enc = encodeURIComponent(url||"");
  const tools = [
    {name:"Google PageSpeed Insights",icon:"🚀",url:`https://pagespeed.web.dev/analysis?url=${enc}`},
    {name:"Google Rich Results Test",icon:"🧪",url:`https://search.google.com/test/rich-results?url=${enc}`},
    {name:"Google Mobile-Friendly Test",icon:"📱",url:`https://search.google.com/test/mobile-friendly?url=${enc}`},
    {name:"Google Search Console",icon:"📊",url:`https://search.google.com/search-console/inspect?resource_id=${enc}`},
    {name:"Facebook Sharing Debugger",icon:"📘",url:`https://developers.facebook.com/tools/debug/?q=${enc}`},
    {name:"Twitter Card Validator",icon:"🐦",url:"https://cards-dev.twitter.com/validator"},
    {name:"Schema.org Validator",icon:"🧩",url:`https://validator.schema.org/#url=${enc}`},
    {name:"W3C HTML Validator",icon:"✅",url:`https://validator.w3.org/nu/?doc=${enc}`},
    {name:"GTmetrix Hız Testi",icon:"⚡",url:`https://gtmetrix.com/?url=${enc}`},
    {name:"Ahrefs SEO Checker",icon:"🔗",url:`https://ahrefs.com/seo-checker?input=${enc}`},
    {name:"Screaming Frog",icon:"🐸",url:"https://www.screamingfrog.co.uk/seo-spider/"},
    {name:"SSL Checker",icon:"🔒",url:`https://www.ssllabs.com/ssltest/analyze.html?d=${enc}`},
    {name:"DNS Lookup",icon:"🌐",url:`https://toolbox.googleapps.com/apps/dig/#A/${enc}`},
    {name:"Wayback Machine",icon:"📁",url:`https://web.archive.org/web/*/${url||""}`},
  ];

  el.innerHTML = `
    <div class="section"><div class="section-header"><h3>🛠️ SEO Araçları</h3></div><div class="section-body">
      ${url?`<div style="font-size:10px;color:var(--text3);font-family:var(--mono);margin-bottom:8px;word-break:break-all">${esc(url.substring(0,60))}</div>`:""}
      ${tools.map(t=>`<div class="tool-item" data-url="${esc(t.url)}"><span style="font-size:15px">${t.icon}</span><span class="tool-name">${esc(t.name)}</span><span class="tool-arrow">→</span></div>`).join("")}
    </div></div>`;

  el.querySelectorAll(".tool-item").forEach(item => {
    item.addEventListener("click", () => chrome.tabs.create({ url: item.dataset.url, active: true }));
  });
}

// ─── EXPORT ──────────────────────────────────────────────────────────────────

function exportReport() {
  if (!analysisData) return;
  const m = analysisData.meta;
  const score = calcScore(analysisData, perfData, techData);
  const psiLine = psiData&&!psiData.error ? `  PSI Perf: ${psiData.scores.performance} | SEO: ${psiData.scores.seo} | BP: ${psiData.scores.bestPractices}` : "  PSI: API key girilmedi";
  const lines = [
    "═══════════════════════════════════",
    "      SEO LENS v2.1 RAPORU",
    "═══════════════════════════════════",
    `Tarih  : ${new Date().toLocaleString("tr-TR")}`,
    `URL    : ${m.url}`,
    `Skor   : ${score.pct}/100 (${score.label})`,
    psiLine,
    "",
    "─── HATALAR ───────────────────────",
    ...score.issues.map(i=>`  ✕ ${i}`),
    "",
    "─── UYARILAR ──────────────────────",
    ...score.warnings.map(i=>`  ⚠ ${i}`),
    "",
    "─── META ──────────────────────────",
    `  Başlık    : ${m.title} (${m.titleLength}kr)`,
    `  Açıklama  : ${m.metaDesc?.substring(0,80)} (${m.metaDescLength}kr)`,
    `  Canonical : ${m.canonical||"(yok)"}${m.canonicalIsSelf?" [self]":m.canonicalIsExternal?" [HARİCİ!]":""}`,
    `  HTTPS     : ${m.hasHttps?"✓":"✗"} | noindex: ${analysisData.technical?.noindex?"EVET!":"Hayır"}`,
    "",
    "─── İÇERİK ────────────────────────",
    `  Kaynak: <${analysisData.content?.contentAreaUsed}> | ${analysisData.content?.wordCount} kelime | ~${analysisData.content?.readingTimeMin}dk`,
    "",
    "─── TEKNİK ────────────────────────",
    `  robots.txt : ${techData?.robotsTxt?.accessible?"✓":"✗"}${techData?.robotsTxt?.pageDisallowed?" ⚠ SAYFA ENGELLENMİŞ":""}`,
    `  sitemap.xml: ${techData?.sitemapXml?.accessible?"✓":"✗"}`,
    `  Favicon    : ${analysisData.technical?.favicon?"✓":"✗"}`,
    `  HTTP Durum : ${headersData?.status||"?"}${headersData?.redirected?" (yönlendirme var)":""}`,
    "",
    "═══════════════════════════════════",
    "SEO Lens Chrome Eklentisi",
  ].join("\n");

  navigator.clipboard.writeText(lines).then(() => {
    const btn = document.getElementById("export-btn");
    btn.textContent = "✓";
    setTimeout(() => { btn.textContent = "⬇"; }, 2000);
  }).catch(() => {});
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function esc(str) {
  if (!str) return "";
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function toggleSection(h) { h.closest(".section").classList.toggle("collapsed"); }
