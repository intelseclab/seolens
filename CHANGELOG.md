# Changelog

All notable changes to SEOLens will be documented in this file.

---

## [Unreleased] - 2026-04-11

### Added
- **Bilingual language support:** The extension now supports two languages — **English (EN)** and **Turkish (TR)**.
- A new `i18n.js` module was introduced to manage all UI translations centrally.
- Language detection is handled automatically based on browser/system settings.

### Changed
- **Global default language is set to English (EN).** All UI labels, messages, and tooltips now render in English by default.
- `sidepanel.html` updated to use dynamic i18n keys instead of hardcoded text.
- `sidepanel.js` updated to apply translations at runtime via the i18n module.

### Fixed
- Resolved a **Content Security Policy (CSP) violation** that was triggered by inline script usage in the side panel.

---

## [1.0.0] - Initial Release

- First public release of SEOLens Chrome Extension.
- Core SEO analysis features: meta tags, headings, link audit, keyword density.
- Side panel UI for real-time page inspection.
