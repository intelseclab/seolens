# SEO Lens — Page Analysis Extension

A powerful Chrome extension that instantly analyzes the SEO health of any webpage directly from the browser side panel. Built as an open-source tool for developers, content creators, and SEO professionals.

![Version](https://img.shields.io/badge/version-2.0.0-00e5c0?style=flat-square)
![Manifest](https://img.shields.io/badge/manifest-v3-7c6aff?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## Features

### Core Analysis
| Module | What It Checks |
|---|---|
| **Meta Tags** | Title length, meta description, canonical URL, Open Graph, Twitter Card |
| **Headings** | H1–H6 hierarchy, order skips, H1 count, title match |
| **Content** | Word count, reading time, readability score, keyword density |
| **Images** | Alt text, dimensions, large display warnings |
| **Links** | Internal / external breakdown, nofollow, broken link checker |
| **Schema** | JSON-LD detection, type identification, validation |
| **Social** | OG image, OG title/desc, Twitter card preview |

### Advanced Modules
| Module | Details |
|---|---|
| **SERP Preview** | Google-style mockup with pixel-accurate title/description width bars |
| **Focus Keyword** | Checks keyword presence in title, meta, H1, URL, and image alt |
| **HTTP Headers** | Status code, redirect chain, HSTS, X-Frame-Options, gzip, server info |
| **Core Web Vitals** | FCP, LCP, CLS, FID/INP via Performance API + optional PageSpeed Insights API |
| **JS SEO Detection** | Framework detection (Next.js, Nuxt, Angular, React, Vue, Gatsby), SPA check |
| **Accessibility** | Missing labels, buttons without text, skip navigation, landmark roles, heading skips |
| **Pagination** | `rel="prev"` / `rel="next"` detection, paginated + self-canonical warning |
| **Technical SEO** | robots.txt, sitemap.xml, favicon, hreflang, noindex, AMP, resource hints |
| **Scan History** | Stores last 50 scans locally with score, date, and issue counts |
| **Tool Links** | 14 direct links: PageSpeed, Search Console, Rich Results, W3C, GTmetrix, and more |

---

## Screenshots

> Side panel opens on the right side of Chrome — no popup, no new tab.

```
┌─────────────────────────────────┐
│  🔍 SEO LENS          ⬇  TARA  │
│─────────────────────────────────│
│  Score: 78/100  ●  İYİ         │
│  Teknik:82  Meta:91  İçerik:70 │
│─────────────────────────────────│
│  📊 │ 🔍 │ 🔑 │ ⚙️ │ 🏷️ │ ... │  ← scrollable tabs
│─────────────────────────────────│
│  Panel content...               │
└─────────────────────────────────┘
```

---

## Installation

### Load Unpacked (Developer Mode)

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked**
5. Select the root folder of this project
6. The **SEO Lens** icon will appear in your toolbar

### First Use

1. Navigate to any website
2. Click the **SEO Lens** icon in the toolbar
3. Click **TARA** (Scan) in the side panel
4. Browse the 16 analysis tabs

---

## Optional: PageSpeed Insights API

For real-world Core Web Vitals (CrUX field data) and PSI scores:

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → Enable **PageSpeed Insights API**
2. Create an API key
3. In the extension → **Ayar** (Settings) tab → paste the key → **KAYDET**

Without an API key the extension still works using the browser's Performance API (lab data).

---

## Project Structure

```
seo-extension/
├── manifest.json          # Chrome Extension Manifest V3
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── src/
    ├── background.js      # Service worker — side panel opener, HTTP HEAD requests
    ├── sidepanel.html     # UI layout, 16 tabs, all styles
    └── sidepanel.js       # All analysis logic, rendering, scoring
```

---

## Technical Details

- **Manifest Version:** 3 (MV3)
- **UI:** Side Panel API (`chrome.sidePanel`) — no popup
- **Page Analysis:** `chrome.scripting.executeScript` — runs self-contained functions in page context
- **HTTP Checks:** Background service worker performs `fetch` HEAD requests (bypasses CORS)
- **Storage:** `chrome.storage.local` for API key, settings, scan history
- **CSP Compliant:** Zero inline event handlers — all events wired via `addEventListener`
- **Scoring:** Normalized weighted system across Technical, Meta, Content, and Performance categories

### Permissions Used

| Permission | Reason |
|---|---|
| `activeTab` | Read the active tab's URL |
| `scripting` | Inject analysis function into page context |
| `sidePanel` | Open the side panel UI |
| `storage` | Save API key, settings, and scan history |
| `<all_urls>` | Fetch robots.txt, sitemap.xml, and HTTP headers from any domain |

---

## Analysis Modules In Detail

### Scoring System
The overall score (0–100) is calculated from weighted category scores:

| Category | Weight | Inputs |
|---|---|---|
| Technical | 30% | robots.txt, sitemap, HTTPS, noindex, canonical, HTTP headers |
| Meta | 25% | title, description, OG tags, Twitter card |
| Content | 25% | word count, H1, images alt, readability |
| Performance | 20% | FCP, LCP, CLS, PSI score (if available) |

### robots.txt Parsing
The extension fetches and parses `robots.txt` at scan time, walks User-agent blocks (matching `*` and the browser's user agent), and checks whether the current page path is disallowed.

### Broken Link Checker
Configurable limit (0 / 10 / 20 / 50 links). Runs parallel `HEAD` requests via the background service worker. Results displayed in the **Link** tab with HTTP status codes.

---

## Contributing

Contributions are welcome! Feel free to:

- Open an issue for bugs or feature requests
- Submit a pull request with improvements
- Translate the UI to other languages (currently Turkish + English labels)

```bash
# Clone the repo
git clone https://github.com/faikcelik/seolens.git

# Load in Chrome (no build step required — pure HTML/CSS/JS)
# chrome://extensions/ → Load unpacked → select folder
```

---

## License

MIT License — free to use, modify, and distribute. See [LICENSE](LICENSE) for details.

---

## Author

**Faik ÇELİK**
GitHub: [@faikcelik](https://github.com/faikcelik)
Website: websiteanalizi.com
---

## Developed on Behalf of

**Diyarbakır Yazılım Topluluğu**
*(Diyarbakır Software Community)*
🌐 [diyarbakiryazilim.org](https://www.diyarbakiryazilim.org/)

> This project was developed as an open-source contribution to the local software community of Diyarbakır, Türkiye — with the goal of making professional SEO analysis tools accessible to everyone.
