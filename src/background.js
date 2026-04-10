// SEO Lens - Background Service Worker

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_HEADERS") {
    fetchHeaders(message.url).then(sendResponse);
    return true;
  }
  if (message.type === "CHECK_LINKS") {
    checkLinks(message.urls).then(sendResponse);
    return true;
  }
});

// ─── HTTP HEADERS + REDIRECT ──────────────────────────────────────────────────

async function fetchHeaders(url) {
  const result = { status: 0, finalUrl: url, redirected: false, headers: {}, error: null };
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    result.status    = res.status;
    result.ok        = res.ok;
    result.finalUrl  = res.url;
    result.redirected = res.redirected || res.url !== url;

    // Güvenlik & SEO için önemli header'lar
    const wantedHeaders = [
      "content-type", "content-encoding", "cache-control", "expires",
      "last-modified", "etag", "server", "x-powered-by",
      "x-robots-tag", "x-frame-options", "x-content-type-options",
      "strict-transport-security", "content-security-policy",
      "referrer-policy", "permissions-policy", "alt-svc", "link",
    ];
    wantedHeaders.forEach(h => {
      const val = res.headers.get(h);
      if (val) result.headers[h] = val;
    });

    // Yönlendirme türünü tespit et
    if (result.redirected) {
      result.httpsRedirect = url.startsWith("http://") && result.finalUrl.startsWith("https://");
      result.wwwChange =
        (url.includes("://www.") && !result.finalUrl.includes("://www.")) ||
        (!url.includes("://www.") && result.finalUrl.includes("://www."));
      result.trailingSlash =
        url.replace(/^https?:\/\/[^/]+/, "") !== result.finalUrl.replace(/^https?:\/\/[^/]+/, "");
    }
  } catch (e) {
    result.error = e.name === "TimeoutError" ? "Zaman aşımı (8s)" : e.message;
  }
  return result;
}

// ─── BROKEN LINK CHECKER ─────────────────────────────────────────────────────

async function checkLinks(urls) {
  const results = {};
  await Promise.all(
    urls.map(async (url) => {
      try {
        if (!url || !url.startsWith("http")) {
          results[url] = { status: 0, ok: false, error: "Geçersiz URL" };
          return;
        }
        const res = await fetch(url, {
          method: "HEAD",
          redirect: "follow",
          signal: AbortSignal.timeout(7000),
        });
        results[url] = { status: res.status, ok: res.status >= 200 && res.status < 400 };
      } catch (e) {
        results[url] = {
          status: 0,
          ok: false,
          error: e.name === "TimeoutError" ? "Zaman aşımı" : "Bağlantı hatası",
        };
      }
    })
  );
  return results;
}
