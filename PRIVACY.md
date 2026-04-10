# Privacy Policy — SEO Lens

**Last updated:** April 10, 2025
**Extension version:** 2.0.0

---

## Overview

SEO Lens is a Chrome browser extension that analyzes the SEO health of web pages. This document explains what data the extension accesses, how it is used, and what is never collected.

---

## Data We Access

### Page Content (Active Tab Only)
When you click **Scan (TARA)**, the extension reads the following data from the currently active tab:

- Page HTML structure (title, meta tags, headings, links, images, schema markup)
- Page URL and domain
- Browser Performance API metrics (FCP, LCP, CLS, FID — timing data only)

This data is processed **locally in your browser** and is never transmitted to any external server operated by this extension.

---

## Data Stored Locally

The extension stores the following data in `chrome.storage.local` on your device:

| Data | Purpose | Retention |
|---|---|---|
| Scan history (URL + score + date + issue counts) | History tab display | Last 50 scans, stored until manually cleared |
| PageSpeed Insights API key | Optional PSI API calls | Until you delete it in Settings |
| Broken link check limit setting | User preference | Until changed |

All stored data remains **on your device only**. It is never synced, uploaded, or shared.

---

## Network Requests Made by the Extension

The extension makes the following outbound network requests **only during a scan**:

| Request | Destination | Purpose |
|---|---|---|
| `HEAD <page-url>` | The scanned website | Fetch HTTP headers, detect redirects |
| `GET <domain>/robots.txt` | The scanned website | Check crawl rules for the page |
| `GET <domain>/sitemap.xml` | The scanned website | Verify sitemap accessibility |
| `GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed` | Google APIs | PageSpeed Insights score (only if API key is provided) |
| `HEAD <external-link-url>` | External websites linked from the page | Broken link detection (only if enabled in Settings, up to configured limit) |

All requests are initiated by **you** when clicking Scan. No background or periodic requests are made.

---

## Data We Do NOT Collect

- No personal information (name, email, location, etc.)
- No browsing history beyond the current scan
- No cookies or tracking identifiers
- No analytics, telemetry, or crash reporting
- No data is sent to the extension author or any third party
- No account or login is required

---

## Third-Party Services

### Google PageSpeed Insights API
If you choose to enter a PageSpeed Insights API key in Settings, the extension will send the scanned page URL to Google's PageSpeed Insights API (`googleapis.com`) to retrieve performance scores.

- This request is governed by [Google's Privacy Policy](https://policies.google.com/privacy)
- The API key is stored only on your local device
- You can remove the key at any time from the Settings tab

### Google Fonts
The extension UI loads fonts (`DM Sans`, `Space Mono`) from `fonts.googleapis.com` for display purposes. This is a standard browser request subject to [Google's Privacy Policy](https://policies.google.com/privacy).

---

## Permissions Explained

| Permission | Why It's Needed |
|---|---|
| `activeTab` | Read the URL of the current tab to initiate a scan |
| `scripting` | Inject the analysis script into the page to read DOM content |
| `sidePanel` | Display the extension UI in Chrome's side panel |
| `storage` | Save API key, settings, and scan history locally on your device |
| `<all_urls>` | Make HEAD/GET requests to any domain for robots.txt, sitemap, and HTTP header checks |

---

## Children's Privacy

This extension does not knowingly collect any data from users of any age. No personal data is collected or stored.

---

## Changes to This Policy

If this privacy policy is updated, the **Last updated** date at the top of this document will be revised. Significant changes will also be noted in the release changelog.

---

## Contact

If you have questions about this privacy policy or the extension's data practices, please open an issue on GitHub:

**Author:** Faik ÇELİK
**GitHub:** [github.com/faikcelik](https://github.com/faikcelik)
**Website:** websiteanalizi.com

**Developed on behalf of:**
Diyarbakır Yazılım Topluluğu
🌐 [diyarbakiryazilim.org](https://www.diyarbakiryazilim.org/)
