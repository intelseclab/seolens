// SEO Lens — i18n (English default, Turkish secondary)

let currentLang = "en";

const TRANSLATIONS = {
  en: {
    // Buttons
    scan:"SCAN", scanning:"SCANNING…", refresh:"REFRESH", save:"SAVE",
    saved:"✓ Saved", analyze:"ANALYZE", clearHistory:"Clear",
    ready:"Ready",

    // Loading
    loadingPage:"Analyzing page...", loadingTech:"Technical checks...",
    loadingPSI:"PageSpeed API...", loadingLinks:"{0} links checking...",

    // Errors
    errNoTab:"Active tab not found.",
    errUnscannable:"This page cannot be scanned. Open a regular web page.",
    errUnknown:"Unknown error.",

    // Score labels
    excellent:"Excellent", good:"Good", average:"Average", poor:"Poor",

    // Category labels
    catTech:"TECHNICAL", catMeta:"META", catContent:"CONTENT", catSpeed:"SPEED",

    // Overview sections
    secErrors:"Errors", secWarnings:"Warnings", secPassed:"Passed",
    quickStats:"Quick Stats",
    lblWords:"WORDS", lblRead:"READ", lblImages:"IMAGES", lblSchema:"SCHEMA",
    lblIntLinks:"INT LINKS", lblExtLinks:"EXT LINKS",
    lblPerf:"PERFORMANCE", lblMobileLCP:"MOBILE LCP", lblMin:"min",
    lblBestPract:"BEST PRACT.",

    // calcScore messages
    scoreTitleMissing:"Page title missing",
    scoreTitleShort:"Title too short — {0} chars (ideal 30–60)",
    scoreTitleLong:"Title too long — {0} chars (ideal 30–60)",
    scoreTitleGood:"Title length is ideal",
    scoreDescMissing:"Meta description missing",
    scoreDescShort:"Description too short — {0} chars",
    scoreDescLong:"Description too long — {0} chars",
    scoreDescGood:"Meta description length is ideal",
    scoreHttpsGood:"HTTPS active",
    scoreHttpsBad:"HTTPS not used",
    scoreCanonicalMissing:"Canonical URL not defined",
    scoreCanonicalExternal:"Canonical points to different domain",
    scoreCanonicalGood:"Canonical URL defined",
    scoreH1Missing:"No H1 heading",
    scoreH1Multiple:"{0} H1 headings — should be only 1",
    scoreH1Good:"Single H1 heading present",
    scoreNoindex:"Page hidden with noindex!",
    scoreIndexable:"Page is indexable",
    scoreLangMissing:"HTML lang attribute missing",
    scoreLangGood:"Language attribute: {0}",
    scoreViewportMissing:"Viewport meta missing",
    scoreViewportGood:"Viewport defined",
    scoreFaviconMissing:"No favicon",
    scoreFaviconGood:"Favicon present",
    scoreAltGood:"All images have alt text",
    scoreAltWarn:"{0} images missing alt text",
    scoreAltBad:"{0} images have no alt text",
    scoreSchemaGood:"{0} schema defined",
    scoreSchemaMissing:"No Schema/JSON-LD",
    scoreRobotsInaccessible:"robots.txt inaccessible",
    scoreRobotsBlocked:"robots.txt is blocking this page",
    scoreRobotsGood:"robots.txt accessible",
    scoreSitemapMissing:"sitemap.xml not found",
    scoreSitemapGood:"sitemap.xml found",
    scoreOGMissing:"Open Graph tags missing",
    scoreOGGood:"Open Graph tags complete",
    scoreOGPartial:"Open Graph incomplete (image/title/desc)",
    scoreContentLow:"Very little content ({0} words)",
    scoreContentWarn:"Insufficient content ({0} words, ideal 600+)",
    scoreContentRich:"Rich content ({0} words)",
    scoreContentOk:"Adequate content ({0} words)",
    scorePSIGood:"PageSpeed performance: {0}/100",
    scorePSIBad:"PageSpeed performance low: {0}/100",
    scorePerfGood:"FCP and TTFB values are good",
    scorePerfWarn:"Performance can be improved",
    scoreXRobotsNoindex:"X-Robots-Tag: {0} (noindex via HTTP header)",

    // SERP
    serpSection:"Google Preview",
    serpNoTitle:"(no title)",
    serpNoDesc:"(no description — add meta description)",
    serpTitlePx:"TITLE ~PX", serpDescPx:"DESC ~PX",
    serpFits:"✓ Fits", serpTruncated:"✕ Truncated",
    serpRich:"Rich Snippet Potential",
    serpAddJSON:"Add JSON-LD for {0}",
    serpSchemaDescs:{
      Article:"News/article snippet", FAQPage:"FAQ accordion",
      Product:"Price & stars", HowTo:"Step-by-step guide",
      Review:"Star rating", Recipe:"Recipe card",
      Event:"Event info", BreadcrumbList:"Breadcrumb URL",
      LocalBusiness:"Business card", VideoObject:"Video preview",
    },

    // Keyword
    kwSection:"Focus Keyword Analysis",
    kwPlaceholder:"Enter your target keyword...",
    kwBtn:"ANALYZE",
    kwHint:'e.g., "seo analysis", "chrome extension"',
    kwTopWords:"Top Words in Content (Top 20)",
    kwFocusScore:'Focus score for "{0}"',
    kwPageTitle:"Page Title", kwMetaDesc:"Meta Description",
    kwH1:"H1 Heading", kwUrl:"URL / Slug", kwAlt:"Image Alt Text",
    kwH2Bonus:"H2 Heading (bonus)", kwH2Found:"Also present in H2",
    kwAddTitle:"Add to title", kwAddDesc:"Add to meta description",
    kwAddH1:"Add to H1 heading", kwAddUrl:"Add to URL (as-keyword-slug)",
    kwAddAlt:"Add to alt text", kwOneImage:"Present in at least one image",
    kwDensity:"Content Density", kwDensityIdeal:"Ideal: 0.5% – 3%",
    kwNotFound:"Not found in content",
    kwFound:"{0}% ({1} times)",
    kwNoData:"No data.", kwPresent:"FOUND", kwAbsent:"MISSING",

    // Technical
    techSecTitle:"Security & Indexation", techCrawlTitle:"Crawlability",
    techPageTitle:"Page Properties", techResourcesTitle:"Page Resources",
    techHttpsOk:"✓ HTTPS", techHttpsFail:"✕ HTTP",
    techBlocked:"BLOCKED", techIndexable:"✓ Indexable",
    techNoindexWarn:"This page will not appear in search results!",
    techAccessible:"✓ Accessible", techNotFound:"✕ Not Found",
    techPresent:"✓ Present", techAbsent:"✕ Absent",
    techSelfCanon:"✓ Self-canonical", techExtCanon:"⚠ External",
    techCanonPresent:"✓ Present", techCanonAbsent:"✕ Absent",
    techRobotsBlocked:"⚠ This page is blocked in robots.txt!",
    techDisallowAll:"⚠ Disallow: / — Full site!",
    techSitemapRef:"Has sitemap reference",
    techSitemapUrls:"Sitemap URLs",
    techRedirectPresent:"Present",
    techHTTPSRedirect:"HTTP→HTTPS redirect",
    techWWWChange:"www redirect",
    techRedirectDetected:"Redirect detected",
    techCompression:"Compression (Gzip/Brotli)",
    techHSTSPresent:"✓ Present", techHSTSAbsent:"✕ Absent",
    techCacheUndefined:"Not defined",
    techServerWarn:"Server technology exposed — security risk",
    techSecHeaders:"{0}/6 security headers present",
    techRedirectTo:"Redirect → {0}",
    techPaginationTitle:"Pagination",
    techPaginSelfCanon:"Self-canonical on paginated page may cause issues",
    techJSSEOTitle:"JavaScript SEO",
    techFrameworkFound:"JS Framework detected",
    techNoscriptPresent:"✓ {0} present",
    techNoscriptAbsent:"✕ Absent",
    techNoscriptWarn:"Content may not display when JS is disabled",
    techSPARisk:"SPA Risk",
    techSPAWarn:"Very little page content — may be JS-rendered, check bot access",
    techBodyLength:"Visible text length",
    techBodyChars:"{0} chars",
    techScriptLabel:"SCRIPT", techStyleLabel:"STYLESHEET",
    techIframeLabel:"IFRAME", techPreloadLabel:"PRELOAD",
    techPreconnLabel:"PRECONNECT", techInlineLabel:"INLINE STYLE",
    techHreflang:"Hreflang ({0} langs)", techHreflangNone:"Hreflang",
    techNone:"None",

    // Meta
    metaBasic:"Basic Meta", metaOG:"Open Graph", metaTwitter:"Twitter Card",
    metaPageTitle:"Page Title", metaDesc:"Meta Description",
    metaCanonical:"Canonical URL", metaRobots:"Robots",
    metaLang:"Language (lang)", metaCharset:"Charset",
    metaViewport:"Viewport", metaHTTPS:"HTTPS", metaKeywords:"Keywords",
    metaRobotsDefault:"(undefined — default index,follow)",
    metaKeywordsNone:"(none)", metaHttpsActive:"✅ Active",
    metaHttpsInactive:"❌ HTTP",
    metaExternal:" ⚠ External domain", metaSelfCanon:" ✓ Self-canonical",
    metaUndefined:"(undefined)",
    metaCharCount:"{0} chars", metaCharRange:"— {0}",

    // Content
    contentSummary:"Content Summary",
    contentSource:"Source: <{0}> (excl. nav/header/footer)",
    contentWords:"WORDS", contentSentences:"SENTENCES",
    contentParagraphs:"PARAGRAPHS", contentMinutes:"MINUTES",
    contentWPS:"WORDS/SENT", content600:"600+ WORDS",
    contentReadability:"Readability",
    contentReadAvg:"Avg. {0} words/sentence (ideal ≤15)",
    contentEasy:"Easy", contentMedium:"Medium", contentHard:"Hard",
    contentKeywords:"Keyword Frequency", contentNoData:"No data.",

    // Headings
    headingsTitle:"Heading Analysis",
    headingsNoH1:"No H1 heading",
    headingsMultiH1:"{0} H1 headings — should be only 1",
    headingsTitleMatch:"H1 matches page title",
    headingsTitleMismatch:"H1 does not match title — recommended",
    headingsOrderSkips:"{0} heading level skips (e.g. H1→H3)",
    headingsTree:"Heading Tree",
    headingsEmpty:"(empty)",
    headingsNone:"No headings found.",

    // Performance
    perfBrowser:"Browser Measurement", perfWeight:"Page Weight",
    perfResTypes:"Resource Types", perfNoData:"Browser data not available",
    perfPSITitle:"PageSpeed Lab (Mobile)",
    perfOpportunities:"Opportunities (PSI)",
    perfGood:"Good", perfImprove:"Improve", perfSlow:"Slow",
    perfFullLoad:"FULL LOAD", perfTransfer:"TRANSFER",
    perfResCount:"RESOURCES", perfRenderBlock:"RENDER BLOCKING",
    perfLargest:"LARGEST", perfSlowing:"Slowing down",
    perfTransferIdeal:"<1500 KB ideal", perfNoDataMsg:"No data.",

    // Images
    imagesTitle:"Image Analysis",
    imagesTotal:"TOTAL", imagesAltOk:"HAS ALT", imagesAltNo:"NO ALT",
    imagesLazy:"LAZY LOAD", imagesDimNo:"W/H MISSING", imagesOver:"2000px+",
    imagesDimWarn:"⚠ Images without width/height can cause CLS issues.",
    imagesList:"Image List", imagesAltEmpty:"(empty)",
    imagesNone:"No images.", imagesDimBadge:"[w/h?]",
    imagesOverBadge:"[large]", imagesNoAlt:"no alt",

    // Links
    linksTitle:"Link Summary",
    linksTotal:"Total", linksInt:"Internal", linksExt:"External",
    linksNofollow:"Nofollow", linksNoAnchor:"No anchor text",
    linksDuplicate:"Duplicate",
    linksBrokenTitle:"Broken Links",
    linksNoIssues:"✓ No issues in {0} links.",
    linksBrokenLimit:"Set a limit in Settings.",
    linksIntTitle:"Internal Links", linksExtTitle:"External Links",
    linksNoText:'<i style="color:var(--text3)">No text</i>',
    linksNone:"None.", linksIssue:"{0} issues",
    linksBadgeInt:"INT", linksBadgeExt:"EXT", linksBadgeNF:"NF",

    // Schema
    schemaTitle:"JSON-LD",
    schemaNotFound:"No schema markup found",
    schemaAddRich:"Add JSON-LD for rich snippets",
    schemaValid:"✓ Valid", schemaInvalid:"✕ Invalid",
    schemaSuggested:"Suggested Types",

    // Social
    socialScore:"Social Score",
    socialFull:"Complete", socialMissing:"Incomplete",
    socialFacebook:"Facebook Preview", socialTwitter:"Twitter Preview",
    socialNoTitle:"(no title)",

    // Accessibility
    a11yTitle:"Accessibility Score",
    a11yGood:"Good", a11yAverage:"Average", a11yNeedsWork:"Needs Improvement",
    a11yAltMissing:"{0} images have no alt attribute",
    a11yAltGood:"All images have alt attribute",
    a11yLabelMissing:"{0} form fields have no label",
    a11yLabelGood:"Form fields have labels",
    a11yBtnNoText:"{0} buttons have no accessible text",
    a11yNoMain:"<main> or role=main not defined",
    a11yMainGood:"<main> landmark present",
    a11yLangMissing:"HTML lang attribute missing",
    a11yLangGood:"HTML lang present",
    a11yNoSkipNav:"No skip navigation link",
    a11ySkipNavGood:"Skip nav link present",
    a11yHeadingSkips:"{0} heading level skips",
    a11yHeadingGood:"Heading order is correct",
    a11yTabIndex:"{0} elements with tabindex>0 (may break keyboard order)",
    a11yNoAlt:"NO ALT", a11yNoLabel:"NO LABEL",
    a11yBtnText:"BTN TEXT", a11yMainLand:"MAIN LAND.",
    a11yIssues:"Issues", a11yWarnings:"Warnings", a11yPassed:"Passed",
    a11yNoIssues:"No issues!", a11yNoWarnings:"No warnings.",

    // History
    historyTitle:"Last {0} Scans",
    historyEmpty:"No History",
    historyEmptyDesc:"Each scan is saved here.",
    historyClear:"Clear",
    historyCurrent:"[current]",
    historyErrors:"{0} errors",
    historyWarnings:"{0} warnings",

    // Tools
    toolsTitle:"SEO Tools",
    toolGTmetrix:"GTmetrix Speed Test",

    // Export
    exportReportTitle:"SEO LENS v2.1 REPORT",
    exportDate:"Date   :", exportURL:"URL    :", exportScore:"Score  :",
    exportPSINo:"  PSI: No API key set",
    exportErrors:"─── ERRORS ────────────────────────",
    exportWarnings:"─── WARNINGS ───────────────────────",
    exportMetaSection:"─── META ────────────────────────────",
    exportContentSection:"─── CONTENT ─────────────────────────",
    exportTechSection:"─── TECHNICAL ───────────────────────",
    exportTitleLabel:"Title      :", exportDescLabel:"Description:",
    exportCanonLabel:"Canonical  :",
    exportHTTPSLabel:"HTTPS      :", exportNoindexLabel:"noindex:",
    exportYes:"YES!", exportNo:"No",
    exportSource:"Source: <{0}> | {1} words | ~{2}min",
    exportRobots:"  robots.txt :", exportSitemap:"  sitemap.xml:",
    exportFavicon:"  Favicon    :", exportHTTPStatus:"  HTTP Status:",
    exportRedirect:"(redirect found)",
    exportExternal:"[EXTERNAL!]", exportPageBlocked:"⚠ PAGE BLOCKED",
    exportFooter:"SEO Lens Chrome Extension",

    // Settings
    settingsPSITitle:"🚀 PageSpeed Insights API",
    settingsPSILabel:"API Key",
    settingsPSIHint:"Get a free key from Google Cloud Console → PageSpeed Insights API.",
    settingsBrokenTitle:"🔗 Broken Link Checker",
    settingsBrokenLabel:"Max external links to check",
    settingsAboutTitle:"ℹ️ About",
    settingsLangTitle:"🌐 Language",
    settingsLangLabel:"Interface language",
    settingsAboutBody:`<b style="color:var(--text)">SEO Lens v2.1</b><br>
          <b style="color:var(--text)">Data sources:</b><br>
          • DOM analysis (live, per scan)<br>
          • Performance API (browser lab data)<br>
          • PageSpeed Insights API (optional, CrUX)<br>
          • robots.txt / sitemap.xml (HTTP fetch)<br>
          • HTTP headers analysis (HEAD request)<br>
          • Broken link checker (HEAD request)`,

    // Static HTML strings
    tabOverview:"Overview", tabSERP:"SERP", tabKeyword:"Keyword",
    tabTechnical:"Technical", tabMeta:"Meta", tabContent:"Content",
    tabHeadings:"Headings", tabPerf:"Speed", tabImages:"Images",
    tabLinks:"Links", tabSchema:"Schema", tabSocial:"Social",
    tabA11y:"A11y", tabHistory:"History", tabTools:"Tools", tabSettings:"Settings",
    emptyTitle:"Start SEO Analysis",
    emptyDesc:"Click the <strong>SCAN</strong> button to analyze the SEO health of the active page.",
    errorTitle:"Scan Failed",
  },

  tr: {
    scan:"TARA", scanning:"TARANIYOR…", refresh:"YENİLE", save:"KAYDET",
    saved:"✓ Kaydedildi", analyze:"ANALİZ", clearHistory:"Temizle",
    ready:"Hazır",

    loadingPage:"Sayfa analiz ediliyor...", loadingTech:"Teknik kontroller...",
    loadingPSI:"PageSpeed API...", loadingLinks:"{0} link kontrol ediliyor...",

    errNoTab:"Aktif sekme bulunamadı.",
    errUnscannable:"Bu sayfa taranamaz. Normal bir web sayfası açın.",
    errUnknown:"Bilinmeyen hata.",

    excellent:"Mükemmel", good:"İyi", average:"Orta", poor:"Zayıf",

    catTech:"TEKNİK", catMeta:"META", catContent:"İÇERİK", catSpeed:"HIZ",

    secErrors:"Hatalar", secWarnings:"Uyarılar", secPassed:"Başarılı",
    quickStats:"Hızlı İstatistik",
    lblWords:"KELİME", lblRead:"OKUMA", lblImages:"GÖRSEL", lblSchema:"SCHEMA",
    lblIntLinks:"İÇ LİNK", lblExtLinks:"DIŞ LİNK",
    lblPerf:"PERFORMANS", lblMobileLCP:"MOBİL LCP", lblMin:"dk",
    lblBestPract:"BEST PRACT.",

    scoreTitleMissing:"Sayfa başlığı eksik",
    scoreTitleShort:"Başlık çok kısa — {0} karakter (ideal 30–60)",
    scoreTitleLong:"Başlık çok uzun — {0} karakter (ideal 30–60)",
    scoreTitleGood:"Başlık uzunluğu ideal",
    scoreDescMissing:"Meta açıklama eksik",
    scoreDescShort:"Açıklama çok kısa — {0} karakter",
    scoreDescLong:"Açıklama çok uzun — {0} karakter",
    scoreDescGood:"Meta açıklama ideal uzunlukta",
    scoreHttpsGood:"HTTPS aktif",
    scoreHttpsBad:"HTTPS kullanılmıyor",
    scoreCanonicalMissing:"Canonical URL tanımlı değil",
    scoreCanonicalExternal:"Canonical farklı domain'e işaret ediyor",
    scoreCanonicalGood:"Canonical URL tanımlı",
    scoreH1Missing:"H1 başlık yok",
    scoreH1Multiple:"{0} adet H1 — sadece 1 olmalı",
    scoreH1Good:"Tek H1 başlık var",
    scoreNoindex:"Sayfa noindex ile gizlenmiş!",
    scoreIndexable:"Sayfa indekslenebilir",
    scoreLangMissing:"HTML lang attribute eksik",
    scoreLangGood:"Dil attribute: {0}",
    scoreViewportMissing:"Viewport meta eksik",
    scoreViewportGood:"Viewport tanımlı",
    scoreFaviconMissing:"Favicon yok",
    scoreFaviconGood:"Favicon var",
    scoreAltGood:"Tüm görsellerde alt text var",
    scoreAltWarn:"{0} görselde alt text eksik",
    scoreAltBad:"{0} görselde alt text yok",
    scoreSchemaGood:"{0} schema tanımlı",
    scoreSchemaMissing:"Schema/JSON-LD yok",
    scoreRobotsInaccessible:"robots.txt erişilemiyor",
    scoreRobotsBlocked:"robots.txt bu sayfayı engelliyor",
    scoreRobotsGood:"robots.txt erişilebilir",
    scoreSitemapMissing:"sitemap.xml bulunamadı",
    scoreSitemapGood:"sitemap.xml mevcut",
    scoreOGMissing:"Open Graph etiketleri eksik",
    scoreOGGood:"Open Graph etiketleri tam",
    scoreOGPartial:"Open Graph eksik (image/title/desc)",
    scoreContentLow:"Çok az içerik ({0} kelime)",
    scoreContentWarn:"Yetersiz içerik ({0} kelime, ideal 600+)",
    scoreContentRich:"Zengin içerik ({0} kelime)",
    scoreContentOk:"Yeterli içerik ({0} kelime)",
    scorePSIGood:"PageSpeed performans: {0}/100",
    scorePSIBad:"PageSpeed performans düşük: {0}/100",
    scorePerfGood:"FCP ve TTFB değerleri iyi",
    scorePerfWarn:"Performans iyileştirilebilir",
    scoreXRobotsNoindex:"X-Robots-Tag: {0} (HTTP header'dan noindex)",

    serpSection:"Google Önizleme",
    serpNoTitle:"(başlık yok)",
    serpNoDesc:"(açıklama tanımlı değil — meta description ekleyin)",
    serpTitlePx:"BAŞLIK ~PX", serpDescPx:"AÇIKLAMA ~PX",
    serpFits:"✓ Sığıyor", serpTruncated:"✕ Kesiliyor",
    serpRich:"Rich Snippet Potansiyeli",
    serpAddJSON:"{0} için JSON-LD ekleyin",
    serpSchemaDescs:{
      Article:"Haber/makale", FAQPage:"SSS açılır liste",
      Product:"Fiyat & yıldız", HowTo:"Adım adım rehber",
      Review:"Yıldız rating", Recipe:"Tarif kartı",
      Event:"Etkinlik bilgisi", BreadcrumbList:"Breadcrumb URL",
      LocalBusiness:"İşletme kartı", VideoObject:"Video önizleme",
    },

    kwSection:"Odak Kelime Analizi",
    kwPlaceholder:"Hedef kelimenizi girin...",
    kwBtn:"ANALİZ",
    kwHint:'Örnek: "seo analizi", "chrome eklenti" vb.',
    kwTopWords:"İçerikteki Kelimeler (Top 20)",
    kwFocusScore:'"{0}" için odak skoru',
    kwPageTitle:"Sayfa Başlığı (Title)", kwMetaDesc:"Meta Açıklama",
    kwH1:"H1 Başlık", kwUrl:"URL / Slug", kwAlt:"Görsel Alt Text",
    kwH2Bonus:"H2 Başlık (bonus)", kwH2Found:"H2'de de geçiyor",
    kwAddTitle:"Başlığa ekleyin", kwAddDesc:"Meta açıklamaya ekleyin",
    kwAddH1:"H1 başlığına ekleyin", kwAddUrl:"URL'ye ekleyin (kelime-seklinde)",
    kwAddAlt:"Alt text'e ekleyin", kwOneImage:"En az bir görselde var",
    kwDensity:"İçerik Yoğunluğu", kwDensityIdeal:"İdeal: %0.5 – %3",
    kwNotFound:"İçerikte bulunamadı",
    kwFound:"%{0} ({1} kez)",
    kwNoData:"Veri yok.", kwPresent:"VAR", kwAbsent:"YOK",

    techSecTitle:"Güvenlik & İndeksleme", techCrawlTitle:"Crawlability",
    techPageTitle:"Sayfa Özellikleri", techResourcesTitle:"Sayfa Kaynakları",
    techHttpsOk:"✓ HTTPS", techHttpsFail:"✕ HTTP",
    techBlocked:"ENGELLENİYOR", techIndexable:"✓ İndekslenebilir",
    techNoindexWarn:"Bu sayfa arama sonuçlarında görünmez!",
    techAccessible:"✓ Erişilebilir", techNotFound:"✕ Bulunamadı",
    techPresent:"✓ Var", techAbsent:"✕ Yok",
    techSelfCanon:"✓ Self-canonical", techExtCanon:"⚠ Harici",
    techCanonPresent:"✓ Var", techCanonAbsent:"✕ Yok",
    techRobotsBlocked:"⚠ Bu sayfa robots.txt'te engellenmiş!",
    techDisallowAll:"⚠ Disallow: / — Tüm site!",
    techSitemapRef:"Sitemap referansı var",
    techSitemapUrls:"Sitemap URL'leri",
    techRedirectPresent:"Var",
    techHTTPSRedirect:"HTTP→HTTPS yönlendirmesi",
    techWWWChange:"www değişikliği",
    techRedirectDetected:"Yönlendirme tespit edildi",
    techCompression:"Sıkıştırma (Gzip/Brotli)",
    techHSTSPresent:"✓ Var", techHSTSAbsent:"✕ Yok",
    techCacheUndefined:"Tanımlı değil",
    techServerWarn:"Sunucu teknolojisi açık — güvenlik riski",
    techSecHeaders:"{0}/6 güvenlik header'ı mevcut",
    techRedirectTo:"Yönlendirme → {0}",
    techPaginationTitle:"Sayfalama (Pagination)",
    techPaginSelfCanon:"Sayfalanmış sayfada self-canonical sorunlu olabilir",
    techJSSEOTitle:"JavaScript SEO",
    techFrameworkFound:"JS Framework tespit edildi",
    techNoscriptPresent:"✓ {0} adet",
    techNoscriptAbsent:"✕ Yok",
    techNoscriptWarn:"JS devre dışıyken içerik gösterilmiyor olabilir",
    techSPARisk:"SPA Riski",
    techSPAWarn:"Sayfa içeriği çok az — JS ile render ediliyor olabilir, bot erişimi kontrol edin",
    techBodyLength:"Görünür metin uzunluğu",
    techBodyChars:"{0} karakter",
    techScriptLabel:"SCRIPT", techStyleLabel:"STİLSHEET",
    techIframeLabel:"IFRAME", techPreloadLabel:"PRELOAD",
    techPreconnLabel:"PRECONNECT", techInlineLabel:"INLINE STYLE",
    techHreflang:"Hreflang ({0} dil)", techHreflangNone:"Hreflang",
    techNone:"Yok",

    metaBasic:"Temel Meta", metaOG:"Open Graph", metaTwitter:"Twitter Card",
    metaPageTitle:"Sayfa Başlığı", metaDesc:"Meta Açıklama",
    metaCanonical:"Canonical URL", metaRobots:"Robots",
    metaLang:"Dil (lang)", metaCharset:"Charset",
    metaViewport:"Viewport", metaHTTPS:"HTTPS", metaKeywords:"Keywords",
    metaRobotsDefault:"(tanımsız — varsayılan index,follow)",
    metaKeywordsNone:"(yok)", metaHttpsActive:"✅ Aktif",
    metaHttpsInactive:"❌ HTTP",
    metaExternal:" ⚠ Harici domain", metaSelfCanon:" ✓ Self-canonical",
    metaUndefined:"(tanımsız)",
    metaCharCount:"{0} karakter", metaCharRange:"— {0}",

    contentSummary:"İçerik Özeti",
    contentSource:"Kaynak: <{0}> (nav/header/footer hariç)",
    contentWords:"KELİME", contentSentences:"CÜMLE",
    contentParagraphs:"PARAGRAF", contentMinutes:"DAKİKA",
    contentWPS:"KEL/CÜMLE", content600:"600+KEL",
    contentReadability:"Okunabilirlik",
    contentReadAvg:"Ort. {0} kelime/cümle (ideal ≤15)",
    contentEasy:"Kolay", contentMedium:"Orta", contentHard:"Zor",
    contentKeywords:"Kelime Sıklığı", contentNoData:"Veri yok.",

    headingsTitle:"Başlık Analizi",
    headingsNoH1:"H1 başlık yok",
    headingsMultiH1:"{0} adet H1 — sadece 1 olmalı",
    headingsTitleMatch:"H1 ile sayfa başlığı uyumlu",
    headingsTitleMismatch:"H1 ile başlık örtüşmüyor — önerilir",
    headingsOrderSkips:"{0} başlık seviye atlaması (H1→H3 gibi)",
    headingsTree:"Başlık Ağacı",
    headingsEmpty:"(boş)",
    headingsNone:"Başlık bulunamadı.",

    perfBrowser:"Tarayıcı Ölçümü", perfWeight:"Sayfa Ağırlığı",
    perfResTypes:"Kaynak Türleri", perfNoData:"Tarayıcı verisi alınamadı",
    perfPSITitle:"PageSpeed Lab (Mobil)",
    perfOpportunities:"Fırsatlar (PSI)",
    perfGood:"İyi", perfImprove:"Geliştir", perfSlow:"Yavaş",
    perfFullLoad:"TAM YÜK", perfTransfer:"TRANSFER",
    perfResCount:"KAYNAK SAYISI", perfRenderBlock:"RENDER BLOCKING",
    perfLargest:"EN BÜYÜK", perfSlowing:"Yavaşlatıyor",
    perfTransferIdeal:"<1500 KB ideal", perfNoDataMsg:"Veri yok.",

    imagesTitle:"Görsel Analizi",
    imagesTotal:"TOPLAM", imagesAltOk:"ALT VAR", imagesAltNo:"ALT EKSİK",
    imagesLazy:"LAZY LOAD", imagesDimNo:"W/H EKSİK", imagesOver:"2000px+",
    imagesDimWarn:"⚠ width/height eksik görseller CLS sorununa yol açar.",
    imagesList:"Görsel Listesi", imagesAltEmpty:"(boş)",
    imagesNone:"Görsel yok.", imagesDimBadge:"[w/h?]",
    imagesOverBadge:"[büyük]", imagesNoAlt:"alt yok",

    linksTitle:"Link Özeti",
    linksTotal:"Toplam", linksInt:"İç", linksExt:"Dış",
    linksNofollow:"Nofollow", linksNoAnchor:"Anchor text yok",
    linksDuplicate:"Tekrar eden",
    linksBrokenTitle:"Broken Link",
    linksNoIssues:"✓ {0} linkte sorun yok.",
    linksBrokenLimit:"Ayarlar sekmesinden limit belirleyin.",
    linksIntTitle:"İç Linkler", linksExtTitle:"Dış Linkler",
    linksNoText:'<i style="color:var(--text3)">Metin yok</i>',
    linksNone:"Yok.", linksIssue:"{0} sorun",
    linksBadgeInt:"İÇ", linksBadgeExt:"DIŞ", linksBadgeNF:"NF",

    schemaTitle:"JSON-LD",
    schemaNotFound:"Schema markup bulunamadı",
    schemaAddRich:"Rich snippet'ler için JSON-LD ekleyin",
    schemaValid:"✓ Geçerli", schemaInvalid:"✕ Hatalı",
    schemaSuggested:"Önerilen Türler",

    socialScore:"Sosyal Skor",
    socialFull:"Tam", socialMissing:"Eksik",
    socialFacebook:"Facebook Önizleme", socialTwitter:"Twitter Önizleme",
    socialNoTitle:"(başlık yok)",

    a11yTitle:"Erişilebilirlik Skoru",
    a11yGood:"İyi", a11yAverage:"Orta", a11yNeedsWork:"Geliştirilmeli",
    a11yAltMissing:"{0} görselde alt attribute yok",
    a11yAltGood:"Tüm görsellerde alt attribute var",
    a11yLabelMissing:"{0} form alanında label yok",
    a11yLabelGood:"Form alanları label'lı",
    a11yBtnNoText:"{0} buton accessible text yok",
    a11yNoMain:"<main> veya role=main tanımlı değil",
    a11yMainGood:"<main> landmark var",
    a11yLangMissing:"HTML lang attribute eksik",
    a11yLangGood:"HTML lang var",
    a11yNoSkipNav:"Skip navigation link yok",
    a11ySkipNavGood:"Skip nav link var",
    a11yHeadingSkips:"{0} başlık seviye atlaması",
    a11yHeadingGood:"Başlık sırası düzgün",
    a11yTabIndex:"{0} elemanda tabindex>0 (klavye sırası bozulabilir)",
    a11yNoAlt:"ALT EKSİK", a11yNoLabel:"LABEL EKSİK",
    a11yBtnText:"BUTON TEXT", a11yMainLand:"MAIN LANDMARK",
    a11yIssues:"Sorunlar", a11yWarnings:"Uyarılar", a11yPassed:"Başarılı",
    a11yNoIssues:"Sorun yok!", a11yNoWarnings:"Uyarı yok.",

    historyTitle:"Son {0} Tarama",
    historyEmpty:"Geçmiş Yok",
    historyEmptyDesc:"Her tarama burada kaydedilir.",
    historyClear:"Temizle",
    historyCurrent:"[şu an]",
    historyErrors:"{0} hata",
    historyWarnings:"{0} uyarı",

    toolsTitle:"SEO Araçları",
    toolGTmetrix:"GTmetrix Hız Testi",

    exportReportTitle:"SEO LENS v2.1 RAPORU",
    exportDate:"Tarih  :", exportURL:"URL    :", exportScore:"Skor   :",
    exportPSINo:"  PSI: API key girilmedi",
    exportErrors:"─── HATALAR ───────────────────────",
    exportWarnings:"─── UYARILAR ──────────────────────",
    exportMetaSection:"─── META ──────────────────────────",
    exportContentSection:"─── İÇERİK ────────────────────────",
    exportTechSection:"─── TEKNİK ────────────────────────",
    exportTitleLabel:"Başlık    :", exportDescLabel:"Açıklama  :",
    exportCanonLabel:"Canonical :",
    exportHTTPSLabel:"HTTPS     :", exportNoindexLabel:"noindex:",
    exportYes:"EVET!", exportNo:"Hayır",
    exportSource:"Kaynak: <{0}> | {1} kelime | ~{2}dk",
    exportRobots:"  robots.txt :", exportSitemap:"  sitemap.xml:",
    exportFavicon:"  Favicon    :", exportHTTPStatus:"  HTTP Durum :",
    exportRedirect:"(yönlendirme var)",
    exportExternal:"[HARİCİ!]", exportPageBlocked:"⚠ SAYFA ENGELLENMİŞ",
    exportFooter:"SEO Lens Chrome Eklentisi",

    settingsPSITitle:"🚀 PageSpeed Insights API",
    settingsPSILabel:"API Key",
    settingsPSIHint:"Google Cloud Console → PageSpeed Insights API'den ücretsiz alın.",
    settingsBrokenTitle:"🔗 Broken Link Checker",
    settingsBrokenLabel:"Kontrol edilecek maksimum dış link",
    settingsAboutTitle:"ℹ️ Hakkında",
    settingsLangTitle:"🌐 Dil",
    settingsLangLabel:"Arayüz dili",
    settingsAboutBody:`<b style="color:var(--text)">SEO Lens v2.1</b><br>
          <b style="color:var(--text)">Veri kaynakları:</b><br>
          • DOM analizi (anlık, her taramada)<br>
          • Performance API (tarayıcı lab verisi)<br>
          • PageSpeed Insights API (opsiyonel, CrUX)<br>
          • robots.txt / sitemap.xml (HTTP fetch)<br>
          • HTTP headers analizi (HEAD isteği)<br>
          • Broken link kontrolü (HEAD isteği)`,

    tabOverview:"Özet", tabSERP:"SERP", tabKeyword:"Kelime",
    tabTechnical:"Teknik", tabMeta:"Meta", tabContent:"İçerik",
    tabHeadings:"Başlık", tabPerf:"Hız", tabImages:"Görsel",
    tabLinks:"Link", tabSchema:"Şema", tabSocial:"Sosyal",
    tabA11y:"A11y", tabHistory:"Geçmiş", tabTools:"Araçlar", tabSettings:"Ayar",
    emptyTitle:"SEO Analizi Başlatın",
    emptyDesc:"Aktif sayfanın SEO sağlığını analiz etmek için <strong>TARA</strong> butonuna tıklayın.",
    errorTitle:"Tarama Başarısız",
  }
};

function t(key, ...args) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  let str = dict[key] !== undefined ? dict[key] : (TRANSLATIONS.en[key] !== undefined ? TRANSLATIONS.en[key] : key);
  if (typeof str !== "string") return str; // objects like serpSchemaDescs
  args.forEach((arg, i) => { str = str.replace(new RegExp(`\\{${i}\\}`, "g"), String(arg)); });
  return str;
}

function applyStaticTranslations() {
  // Tabs
  const tabMap = {
    overview:"tabOverview", serp:"tabSERP", keyword:"tabKeyword",
    technical:"tabTechnical", meta:"tabMeta", content:"tabContent",
    headings:"tabHeadings", perf:"tabPerf", images:"tabImages",
    links:"tabLinks", schema:"tabSchema", social:"tabSocial",
    a11y:"tabA11y", history:"tabHistory", tools:"tabTools", settings:"tabSettings",
  };
  document.querySelectorAll(".tab[data-panel]").forEach(btn => {
    const key = tabMap[btn.dataset.panel];
    if (key) {
      const icon = btn.querySelector(".tab-icon")?.outerHTML || "";
      btn.innerHTML = icon + t(key);
    }
  });

  // Scan button (only if not in loading state)
  const scanBtn = document.getElementById("scan-btn");
  if (scanBtn && !scanBtn.classList.contains("loading")) {
    scanBtn.textContent = analysisData ? t("refresh") : t("scan");
  }

  // page-url placeholder
  const pu = document.getElementById("page-url");
  if (pu && pu.textContent === TRANSLATIONS.en.ready || pu && pu.textContent === TRANSLATIONS.tr.ready) {
    pu.textContent = t("ready");
  }

  // Empty state
  const emptyH3 = document.querySelector("#panel-empty .empty-state h3");
  const emptyP  = document.querySelector("#panel-empty .empty-state p");
  if (emptyH3) emptyH3.textContent = t("emptyTitle");
  if (emptyP)  emptyP.innerHTML  = t("emptyDesc");

  // Error state title
  const errH3 = document.querySelector("#panel-error .empty-state h3");
  if (errH3) errH3.textContent = t("errorTitle");

  // Settings panel (re-render)
  renderSettings();
}

function renderSettings() {
  const el = document.getElementById("panel-settings");
  if (!el) return;
  el.innerHTML = `
    <div class="section">
      <div class="section-header"><h3>${t("settingsLangTitle")}</h3></div>
      <div class="section-body">
        <div class="row"><div class="row-body">
          <div class="row-label">${t("settingsLangLabel")}</div>
          <div style="display:flex;gap:8px;margin-top:6px">
            <button id="lang-en" style="flex:1;padding:8px;border-radius:7px;font-family:var(--mono);font-size:11px;font-weight:700;cursor:pointer;border:2px solid ${currentLang==="en"?"var(--accent)":"var(--border)"};background:${currentLang==="en"?"rgba(0,229,192,0.1)":"var(--bg3)"};color:${currentLang==="en"?"var(--accent)":"var(--text2)"}">🇬🇧 English</button>
            <button id="lang-tr" style="flex:1;padding:8px;border-radius:7px;font-family:var(--mono);font-size:11px;font-weight:700;cursor:pointer;border:2px solid ${currentLang==="tr"?"var(--accent)":"var(--border)"};background:${currentLang==="tr"?"rgba(0,229,192,0.1)":"var(--bg3)"};color:${currentLang==="tr"?"var(--accent)":"var(--text2)"}">🇹🇷 Türkçe</button>
          </div>
        </div></div>
      </div>
    </div>
    <div class="section">
      <div class="section-header"><h3>${t("settingsPSITitle")}</h3></div>
      <div class="section-body">
        <div class="row"><div class="row-body">
          <div class="row-label">${t("settingsPSILabel")}</div>
          <input id="psi-key-input" type="password" placeholder="AIza..." style="width:100%;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:7px 10px;color:var(--text);font-family:var(--mono);font-size:11px;outline:none;margin-top:4px" />
          <div style="font-size:10px;color:var(--text3);margin-top:5px">${t("settingsPSIHint")}</div>
        </div></div>
        <button id="save-psi-key" style="margin-top:10px;width:100%;background:var(--accent);color:#000;border:none;border-radius:7px;padding:8px;font-family:var(--mono);font-size:11px;font-weight:700;cursor:pointer">${t("save")}</button>
        <div id="psi-key-status" style="font-size:11px;color:var(--text3);margin-top:6px;text-align:center"></div>
      </div>
    </div>
    <div class="section">
      <div class="section-header"><h3>${t("settingsBrokenTitle")}</h3></div>
      <div class="section-body">
        <div class="row"><div class="row-body">
          <div class="row-label">${t("settingsBrokenLabel")}</div>
          <select id="link-check-limit" style="width:100%;background:var(--bg3);border:1px solid var(--border2);border-radius:6px;padding:7px 10px;color:var(--text);font-family:var(--mono);font-size:11px;outline:none;margin-top:4px">
            <option value="0">${currentLang==="tr"?"Kapalı":"Off"}</option>
            <option value="10">10 ${currentLang==="tr"?"link":"links"}</option>
            <option value="20" selected>20 ${currentLang==="tr"?"link":"links"}</option>
            <option value="50">50 ${currentLang==="tr"?"link":"links"}</option>
          </select>
        </div></div>
      </div>
    </div>
    <div class="section">
      <div class="section-header"><h3>${t("settingsAboutTitle")}</h3></div>
      <div class="section-body">
        <div style="font-size:11px;color:var(--text2);line-height:1.8">${t("settingsAboutBody")}</div>
      </div>
    </div>`;

  // Restore saved values
  chrome.storage.local.get(["psiKey","linkCheckLimit"]).then(s => {
    if (s.psiKey) { const el = document.getElementById("psi-key-input"); if (el) el.value = s.psiKey; }
    if (s.linkCheckLimit != null) { const el = document.getElementById("link-check-limit"); if (el) el.value = s.linkCheckLimit; }
  });

  document.getElementById("save-psi-key")?.addEventListener("click", saveSettings);
  document.getElementById("lang-en")?.addEventListener("click", () => setLang("en"));
  document.getElementById("lang-tr")?.addEventListener("click", () => setLang("tr"));
}

async function setLang(lang) {
  currentLang = lang;
  await chrome.storage.local.set({ uiLang: lang });
  applyStaticTranslations();
  if (analysisData) renderAll();
}
