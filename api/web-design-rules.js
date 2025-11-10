// Comprehensive Web Design and Code Best Practices Catalog
// Based on WCAG, Google Core Web Vitals, SEO, W3C, MDN, and industry standards

const webDesignRules = [
  // ============= ACCESSIBILITY (WCAG 2.1) =============
  {
    id: 'wcag-001',
    name: 'Provide Text Alternatives for Non-Text Content',
    category: 'Accessibility (WCAG 2.1)',
    severity: 'error',
    description: 'All images, icons, and non-text content must have descriptive alt text.',
    rationale: 'Screen readers rely on alt text to describe images to visually impaired users.',
    impact: 'Missing alt text makes content inaccessible to blind users and fails WCAG Level A compliance.',
    source: 'WCAG 2.1 Success Criterion 1.1.1',
    sourceUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/non-text-content',
    examples: {
      good: ['<img src="logo.png" alt="Company Logo">', '<button aria-label="Close dialog">×</button>'],
      bad: ['<img src="photo.jpg">', '<img src="icon.png" alt="">']
    }
  },
  {
    id: 'wcag-002',
    name: 'Ensure Sufficient Color Contrast',
    category: 'Accessibility (WCAG 2.1)',
    severity: 'error',
    description: 'Text must have a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text.',
    rationale: 'Low contrast makes text difficult to read for users with visual impairments or in bright light.',
    impact: 'Insufficient contrast fails WCAG AA compliance and excludes users with low vision.',
    source: 'WCAG 2.1 Success Criterion 1.4.3',
    sourceUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum',
    examples: {
      good: ['Black text on white background (21:1)', 'Dark gray #595959 on white (7:1)'],
      bad: ['Light gray #aaa on white (2.3:1)', 'Yellow text on white background']
    }
  },
  {
    id: 'wcag-003',
    name: 'Make All Functionality Keyboard Accessible',
    category: 'Accessibility (WCAG 2.1)',
    severity: 'error',
    description: 'All interactive elements must be accessible via keyboard (Tab, Enter, Space, Arrows).',
    rationale: 'Many users cannot use a mouse due to motor disabilities and rely solely on keyboard navigation.',
    impact: 'Keyboard-inaccessible interfaces exclude users with motor disabilities and power users.',
    source: 'WCAG 2.1 Success Criterion 2.1.1',
    sourceUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard',
    examples: {
      good: ['<button>, <a>, <input> elements', 'tabindex="0" for custom widgets', 'Focus indicators visible'],
      bad: ['<div onclick="..."> without keyboard handler', 'tabindex="-1" on interactive elements']
    }
  },
  {
    id: 'wcag-004',
    name: 'Use Semantic HTML Elements',
    category: 'Accessibility (WCAG 2.1)',
    severity: 'warning',
    description: 'Use proper HTML5 semantic elements (<nav>, <main>, <article>, <header>, <footer>, etc.).',
    rationale: 'Semantic HTML provides structure that assistive technologies use to navigate content.',
    impact: 'Generic <div> soup makes it difficult for screen reader users to understand page structure.',
    source: 'WCAG 2.1 Success Criterion 1.3.1',
    sourceUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships',
    examples: {
      good: ['<nav>, <main>, <article>, <aside>', '<h1>-<h6> hierarchy', '<button> for actions'],
      bad: ['<div class="header">', '<span class="button">', 'Skipping heading levels']
    }
  },
  {
    id: 'wcag-005',
    name: 'Provide Clear Focus Indicators',
    category: 'Accessibility (WCAG 2.1)',
    severity: 'warning',
    description: 'Interactive elements must have visible focus indicators when navigated via keyboard.',
    rationale: 'Users need to see which element currently has keyboard focus.',
    impact: 'Invisible focus makes keyboard navigation impossible for sighted keyboard users.',
    source: 'WCAG 2.1 Success Criterion 2.4.7',
    sourceUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-visible',
    examples: {
      good: [':focus { outline: 2px solid blue; }', 'Custom focus ring with box-shadow'],
      bad: [':focus { outline: none; } without alternative', 'Removing default focus styles']
    }
  },
  {
    id: 'wcag-006',
    name: 'Use ARIA Labels and Roles Appropriately',
    category: 'Accessibility (WCAG 2.1)',
    severity: 'warning',
    description: 'Use ARIA attributes to enhance accessibility of custom widgets and dynamic content.',
    rationale: 'ARIA provides semantic information for custom components that HTML alone cannot convey.',
    impact: 'Missing ARIA makes custom widgets unusable with assistive technologies.',
    source: 'WCAG 2.1 Success Criterion 4.1.2',
    sourceUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value',
    examples: {
      good: ['role="dialog"', 'aria-label="Menu"', 'aria-expanded="true"', 'aria-live="polite"'],
      bad: ['Overusing ARIA on semantic HTML', 'Incorrect role assignments', 'Missing required ARIA']
    }
  },

  // ============= PERFORMANCE (CORE WEB VITALS) =============
  {
    id: 'cwv-001',
    name: 'Optimize Largest Contentful Paint (LCP)',
    category: 'Performance (Core Web Vitals)',
    severity: 'error',
    description: 'Largest Contentful Paint should occur within 2.5 seconds of page load.',
    rationale: 'LCP measures loading performance and directly impacts user experience and SEO rankings.',
    impact: 'Slow LCP leads to high bounce rates and poor Google search rankings.',
    source: 'Google Core Web Vitals - LCP',
    sourceUrl: 'https://web.dev/lcp/',
    examples: {
      good: ['Optimize images with WebP/AVIF', 'Preload critical resources', 'Use CDN', 'Lazy load below-fold'],
      bad: ['Large unoptimized images', 'Render-blocking resources', 'Slow server response']
    }
  },
  {
    id: 'cwv-002',
    name: 'Minimize Cumulative Layout Shift (CLS)',
    category: 'Performance (Core Web Vitals)',
    severity: 'error',
    description: 'Cumulative Layout Shift should be less than 0.1 to avoid visual instability.',
    rationale: 'Layout shifts frustrate users and cause accidental clicks on wrong elements.',
    impact: 'High CLS damages user experience, accessibility, and SEO rankings.',
    source: 'Google Core Web Vitals - CLS',
    sourceUrl: 'https://web.dev/cls/',
    examples: {
      good: ['Reserve space for images (width/height)', 'Fixed dimensions for ads', 'Transform instead of layout properties'],
      bad: ['Images without dimensions', 'Inserting content above existing', 'Dynamically sized ads']
    }
  },
  {
    id: 'cwv-003',
    name: 'Optimize First Input Delay (FID) / Interaction to Next Paint (INP)',
    category: 'Performance (Core Web Vitals)',
    severity: 'warning',
    description: 'First Input Delay should be less than 100ms; INP should be less than 200ms.',
    rationale: 'Users expect immediate response to interactions. Delays feel sluggish and unresponsive.',
    impact: 'Slow interactivity frustrates users and damages conversion rates.',
    source: 'Google Core Web Vitals - FID/INP',
    sourceUrl: 'https://web.dev/fid/',
    examples: {
      good: ['Code splitting', 'Break up long tasks', 'Use web workers', 'Optimize JavaScript execution'],
      bad: ['Heavy JavaScript on main thread', 'Blocking the main thread', 'Synchronous operations']
    }
  },
  {
    id: 'perf-001',
    name: 'Minimize Page Load Time',
    category: 'Performance (Core Web Vitals)',
    severity: 'warning',
    description: 'Total page load time should be under 3 seconds on fast 3G networks.',
    rationale: 'Page speed is a critical ranking factor and directly affects user retention.',
    impact: 'Slow pages have 32% higher bounce rates and lower conversion rates.',
    source: 'Google PageSpeed Insights',
    sourceUrl: 'https://pagespeed.web.dev/',
    examples: {
      good: ['Minify CSS/JS', 'Compress images', 'Enable browser caching', 'Use HTTP/2'],
      bad: ['Unminified resources', 'No compression', 'Render-blocking scripts']
    }
  },
  {
    id: 'perf-002',
    name: 'Optimize Images for Web',
    category: 'Performance (Core Web Vitals)',
    severity: 'warning',
    description: 'Use modern image formats (WebP, AVIF), appropriate dimensions, and lazy loading.',
    rationale: 'Images typically account for 50-80% of page weight. Optimization dramatically improves load times.',
    impact: 'Large images waste bandwidth, slow down pages, and increase costs for users on mobile data.',
    source: 'Google Web Fundamentals',
    sourceUrl: 'https://web.dev/uses-optimized-images/',
    examples: {
      good: ['<picture> with WebP/AVIF', 'Responsive images with srcset', 'loading="lazy"', 'Proper dimensions'],
      bad: ['5MB camera photos', 'Using full-res images for thumbnails', 'No lazy loading']
    }
  },
  {
    id: 'perf-003',
    name: 'Minimize Render-Blocking Resources',
    category: 'Performance (Core Web Vitals)',
    severity: 'warning',
    description: 'Defer or async load non-critical JavaScript and CSS to avoid blocking initial render.',
    rationale: 'Render-blocking resources delay First Contentful Paint and Largest Contentful Paint.',
    impact: 'Users see blank screens longer, increasing perceived load time and bounce rates.',
    source: 'Google Web.dev',
    sourceUrl: 'https://web.dev/render-blocking-resources/',
    examples: {
      good: ['<script defer>', '<script async>', 'Inline critical CSS', 'Preload key resources'],
      bad: ['<script> in <head> without defer/async', 'Large CSS files blocking render']
    }
  },

  // ============= SEO (SEARCH ENGINE OPTIMIZATION) =============
  {
    id: 'seo-001',
    name: 'Use Descriptive Page Titles',
    category: 'SEO (Search Engine Optimization)',
    severity: 'error',
    description: 'Every page must have a unique, descriptive <title> tag (50-60 characters optimal).',
    rationale: 'Page titles are the first thing users see in search results and browser tabs.',
    impact: 'Missing or generic titles hurt click-through rates and search rankings.',
    source: 'Google Search Central',
    sourceUrl: 'https://developers.google.com/search/docs/appearance/title-link',
    examples: {
      good: ['<title>Web Inspector - Analyze Websites | Mario Muja</title>', 'Unique per page'],
      bad: ['<title>Home</title>', '<title>Page</title>', 'Same title on every page']
    }
  },
  {
    id: 'seo-002',
    name: 'Provide Meta Descriptions',
    category: 'SEO (Search Engine Optimization)',
    severity: 'warning',
    description: 'Every page should have a unique meta description (150-160 characters optimal).',
    rationale: 'Meta descriptions appear in search results and influence click-through rates.',
    impact: 'Missing descriptions mean Google generates them automatically, often poorly.',
    source: 'Google Search Central',
    sourceUrl: 'https://developers.google.com/search/docs/appearance/snippet',
    examples: {
      good: ['<meta name="description" content="Analyze websites against WCAG, SEO, and Core Web Vitals">'],
      bad: ['No meta description', 'Duplicate descriptions', 'Keyword-stuffed descriptions']
    }
  },
  {
    id: 'seo-003',
    name: 'Use Proper Heading Hierarchy',
    category: 'SEO (Search Engine Optimization)',
    severity: 'warning',
    description: 'Use a single <h1> per page and maintain logical heading hierarchy (h1→h2→h3...).',
    rationale: 'Search engines use headings to understand content structure and importance.',
    impact: 'Poor heading structure confuses search engines and reduces ranking potential.',
    source: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements',
    examples: {
      good: ['One <h1> per page', 'Logical nesting: h1→h2→h3', 'Descriptive heading text'],
      bad: ['Multiple <h1> tags', 'Skipping levels (h1→h4)', 'Using headings for styling only']
    }
  },
  {
    id: 'seo-004',
    name: 'Implement Structured Data (Schema.org)',
    category: 'SEO (Search Engine Optimization)',
    severity: 'info',
    description: 'Use JSON-LD structured data to help search engines understand your content.',
    rationale: 'Structured data enables rich snippets, knowledge panels, and better search understanding.',
    impact: 'Missing structured data means missed opportunities for enhanced search appearances.',
    source: 'Schema.org',
    sourceUrl: 'https://schema.org/',
    examples: {
      good: ['JSON-LD for Organization, Article, Product', 'BreadcrumbList for navigation'],
      bad: ['No structured data', 'Invalid JSON-LD syntax', 'Irrelevant schema types']
    }
  },
  {
    id: 'seo-005',
    name: 'Create XML Sitemap',
    category: 'SEO (Search Engine Optimization)',
    severity: 'info',
    description: 'Provide an XML sitemap listing all important pages for search engine crawlers.',
    rationale: 'Sitemaps help search engines discover and index all your content efficiently.',
    impact: 'Without a sitemap, some pages may not be discovered or indexed.',
    source: 'Google Search Central',
    sourceUrl: 'https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview',
    examples: {
      good: ['/sitemap.xml', 'robots.txt with Sitemap: directive', 'Submit to Google Search Console'],
      bad: ['No sitemap', 'Outdated sitemap', 'Sitemap not referenced in robots.txt']
    }
  },
  {
    id: 'seo-006',
    name: 'Use Canonical URLs',
    category: 'SEO (Search Engine Optimization)',
    severity: 'warning',
    description: 'Specify canonical URLs to avoid duplicate content issues.',
    rationale: 'Duplicate content dilutes ranking signals and confuses search engines.',
    impact: 'Without canonicals, search engines may index wrong versions or split ranking signals.',
    source: 'Google Search Central',
    sourceUrl: 'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls',
    examples: {
      good: ['<link rel="canonical" href="https://example.com/page">', 'Self-referencing canonicals'],
      bad: ['Multiple versions without canonical', 'HTTP and HTTPS versions both indexed']
    }
  },
  {
    id: 'seo-007',
    name: 'Optimize URLs for Readability',
    category: 'SEO (Search Engine Optimization)',
    severity: 'info',
    description: 'Use descriptive, keyword-rich URLs with hyphens separating words.',
    rationale: 'Clean URLs improve user experience and help search engines understand page content.',
    impact: 'Cryptic URLs reduce click-through rates and provide no SEO benefit.',
    source: 'Google Search Central',
    sourceUrl: 'https://developers.google.com/search/docs/crawling-indexing/url-structure',
    examples: {
      good: ['/blog/web-design-best-practices', '/products/laptop-stand'],
      bad: ['/page?id=12345', '/p123', '/index.php?cat=5&item=99']
    }
  },

  // ============= SECURITY =============
  {
    id: 'sec-001',
    name: 'Serve Site Over HTTPS',
    category: 'Security',
    severity: 'error',
    description: 'All pages must be served over HTTPS with valid SSL/TLS certificates.',
    rationale: 'HTTPS encrypts data in transit, protecting user privacy and preventing man-in-the-middle attacks.',
    impact: 'HTTP sites are marked "Not Secure" by browsers and penalized by search engines.',
    source: 'OWASP Top 10',
    sourceUrl: 'https://owasp.org/www-project-top-ten/',
    examples: {
      good: ['https:// URLs', 'Valid SSL certificate', 'Redirect HTTP to HTTPS'],
      bad: ['http:// URLs', 'Mixed content (HTTPS page loading HTTP resources)', 'Expired certificates']
    }
  },
  {
    id: 'sec-002',
    name: 'Implement Content Security Policy (CSP)',
    category: 'Security',
    severity: 'warning',
    description: 'Use Content-Security-Policy header to prevent XSS and other injection attacks.',
    rationale: 'CSP limits which resources can be loaded, significantly reducing XSS attack surface.',
    impact: 'Without CSP, sites are vulnerable to cross-site scripting and data injection.',
    source: 'MDN Web Security',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP',
    examples: {
      good: ['Content-Security-Policy: default-src \'self\'', 'Strict CSP policies'],
      bad: ['No CSP header', 'CSP with unsafe-inline or unsafe-eval']
    }
  },
  {
    id: 'sec-003',
    name: 'Set Security Headers',
    category: 'Security',
    severity: 'warning',
    description: 'Include security headers: X-Content-Type-Options, X-Frame-Options, Referrer-Policy.',
    rationale: 'Security headers protect against clickjacking, MIME sniffing, and information leakage.',
    impact: 'Missing headers leave sites vulnerable to common web attacks.',
    source: 'OWASP Secure Headers Project',
    sourceUrl: 'https://owasp.org/www-project-secure-headers/',
    examples: {
      good: ['X-Content-Type-Options: nosniff', 'X-Frame-Options: DENY', 'Referrer-Policy: strict-origin'],
      bad: ['No security headers', 'Permissive policies']
    }
  },
  {
    id: 'sec-004',
    name: 'Validate and Sanitize User Input',
    category: 'Security',
    severity: 'error',
    description: 'All user input must be validated on the server and sanitized before use or display.',
    rationale: 'User input is the primary attack vector for XSS, SQL injection, and other exploits.',
    impact: 'Unvalidated input can compromise site security and user data.',
    source: 'OWASP Input Validation',
    sourceUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html',
    examples: {
      good: ['Server-side validation', 'Parameterized queries', 'Output encoding', 'Input sanitization'],
      bad: ['Client-side-only validation', 'String concatenation in SQL', 'Displaying raw user input']
    }
  },

  // ============= HTML & CSS BEST PRACTICES =============
  {
    id: 'html-001',
    name: 'Use Valid HTML5',
    category: 'HTML Best Practices',
    severity: 'warning',
    description: 'HTML should validate against W3C HTML5 standards with no errors.',
    rationale: 'Valid HTML ensures consistent rendering across browsers and assistive technologies.',
    impact: 'Invalid HTML can cause rendering issues, accessibility problems, and SEO penalties.',
    source: 'W3C HTML5 Specification',
    sourceUrl: 'https://www.w3.org/TR/html52/',
    examples: {
      good: ['Properly closed tags', 'Valid nesting', 'Correct attribute usage'],
      bad: ['Unclosed tags', 'Invalid nesting (div inside p)', 'Obsolete elements (font, center)']
    }
  },
  {
    id: 'html-002',
    name: 'Include DOCTYPE and Language Declaration',
    category: 'HTML Best Practices',
    severity: 'error',
    description: 'Every HTML document must start with <!DOCTYPE html> and specify language with <html lang="en">.',
    rationale: 'DOCTYPE ensures standards mode rendering; lang attribute helps screen readers and search engines.',
    impact: 'Missing DOCTYPE triggers quirks mode with inconsistent rendering; missing lang confuses assistive tech.',
    source: 'W3C HTML5 Specification',
    sourceUrl: 'https://www.w3.org/TR/html52/syntax.html#the-doctype',
    examples: {
      good: ['<!DOCTYPE html>', '<html lang="en">', '<html lang="de">'],
      bad: ['No DOCTYPE', 'Old DOCTYPE (HTML4/XHTML)', '<html> without lang']
    }
  },
  {
    id: 'html-003',
    name: 'Include Essential Meta Tags',
    category: 'HTML Best Practices',
    severity: 'error',
    description: 'Include charset, viewport, and description meta tags in <head>.',
    rationale: 'Meta tags ensure correct rendering, mobile responsiveness, and SEO.',
    impact: 'Missing meta tags cause encoding issues, poor mobile experience, and reduced search visibility.',
    source: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta',
    examples: {
      good: ['<meta charset="UTF-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">'],
      bad: ['No charset declaration', 'No viewport meta tag', 'User-scalable=no (accessibility issue)']
    }
  },
  {
    id: 'css-001',
    name: 'Use External CSS Files',
    category: 'CSS Best Practices',
    severity: 'info',
    description: 'Prefer external stylesheets over inline styles for maintainability and caching.',
    rationale: 'External CSS can be cached, minified, and maintained separately from HTML.',
    impact: 'Inline styles bloat HTML, prevent caching, and make maintenance difficult.',
    source: 'Google Web Fundamentals',
    sourceUrl: 'https://web.dev/extract-critical-css/',
    examples: {
      good: ['<link rel="stylesheet" href="styles.css">', 'Inline only critical CSS'],
      bad: ['<style> tags in body', 'Excessive inline styles', 'Style attributes everywhere']
    }
  },
  {
    id: 'css-002',
    name: 'Optimize CSS Delivery',
    category: 'CSS Best Practices',
    severity: 'warning',
    description: 'Inline critical CSS and defer non-critical CSS to improve First Contentful Paint.',
    rationale: 'CSS is render-blocking. Optimizing delivery significantly improves perceived performance.',
    impact: 'Render-blocking CSS delays page rendering and frustrates users.',
    source: 'Google Web.dev',
    sourceUrl: 'https://web.dev/defer-non-critical-css/',
    examples: {
      good: ['Inline critical CSS in <head>', '<link rel="preload"> for fonts', 'Defer non-critical CSS'],
      bad: ['Large CSS file blocking render', 'No CSS optimization']
    }
  },
  {
    id: 'css-003',
    name: 'Use Responsive Design',
    category: 'CSS Best Practices',
    severity: 'error',
    description: 'Implement responsive design with media queries, flexible layouts, and flexible images.',
    rationale: '60%+ of traffic is mobile. Non-responsive sites provide poor mobile experience.',
    impact: 'Non-responsive sites are unusable on mobile, hurting mobile rankings and conversions.',
    source: 'Google Mobile-Friendly Test',
    sourceUrl: 'https://search.google.com/test/mobile-friendly',
    examples: {
      good: ['@media queries', 'Flexbox/Grid', 'Relative units (%, em, rem)', 'max-width on images'],
      bad: ['Fixed pixel widths', 'No media queries', 'Horizontal scrolling on mobile']
    }
  },

  // ============= JAVASCRIPT BEST PRACTICES =============
  {
    id: 'js-001',
    name: 'Minimize JavaScript Execution Time',
    category: 'JavaScript Best Practices',
    severity: 'warning',
    description: 'Keep JavaScript execution under 2 seconds on mobile devices.',
    rationale: 'Heavy JavaScript blocks the main thread, delaying interactivity and increasing INP.',
    impact: 'Long-running scripts cause janky scrolling, slow interactions, and poor Core Web Vitals scores.',
    source: 'Google Lighthouse',
    sourceUrl: 'https://developer.chrome.com/docs/lighthouse/performance/bootup-time/',
    examples: {
      good: ['Code splitting', 'Tree shaking', 'Lazy loading', 'Web workers for heavy tasks'],
      bad: ['Large bundles', 'Blocking operations', 'No code splitting']
    }
  },
  {
    id: 'js-002',
    name: 'Avoid Render-Blocking JavaScript',
    category: 'JavaScript Best Practices',
    severity: 'warning',
    description: 'Use defer or async attributes on script tags to avoid blocking HTML parsing.',
    rationale: 'Synchronous scripts block HTML parsing and delay First Contentful Paint.',
    impact: 'Blocking scripts make pages feel slow and hurt Core Web Vitals scores.',
    source: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script',
    examples: {
      good: ['<script defer src="app.js">', '<script async src="analytics.js">'],
      bad: ['<script> in <head> without defer/async', 'document.write()']
    }
  },
  {
    id: 'js-003',
    name: 'Handle Errors Gracefully',
    category: 'JavaScript Best Practices',
    severity: 'warning',
    description: 'Implement error handling and fallbacks for all JavaScript functionality.',
    rationale: 'JavaScript errors can break entire pages. Graceful degradation ensures functionality.',
    impact: 'Unhandled errors make features unusable and frustrate users.',
    source: 'MDN Web Docs',
    sourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling',
    examples: {
      good: ['try/catch blocks', 'window.onerror handler', 'Fallback content', 'Progressive enhancement'],
      bad: ['No error handling', 'Features requiring JS with no fallback']
    }
  },

  // ============= MOBILE OPTIMIZATION =============
  {
    id: 'mobile-001',
    name: 'Optimize for Touch Interactions',
    category: 'Mobile Optimization',
    severity: 'warning',
    description: 'Touch targets should be at least 48x48 CSS pixels with sufficient spacing.',
    rationale: 'Small touch targets are difficult to tap accurately, especially for users with motor impairments.',
    impact: 'Small targets cause mis-taps, frustration, and accessibility failures.',
    source: 'Google Web.dev',
    sourceUrl: 'https://web.dev/accessible-tap-targets/',
    examples: {
      good: ['Buttons min 48x48px', '8px spacing between targets', 'Large hit areas'],
      bad: ['Tiny buttons (<40px)', 'Links too close together', 'Small touch areas']
    }
  },
  {
    id: 'mobile-002',
    name: 'Avoid Intrusive Interstitials',
    category: 'Mobile Optimization',
    severity: 'warning',
    description: 'Don\'t show intrusive popups or interstitials on mobile that cover main content.',
    rationale: 'Intrusive interstitials frustrate mobile users and are penalized by Google.',
    impact: 'Intrusive popups hurt mobile rankings and increase bounce rates.',
    source: 'Google Search Central',
    sourceUrl: 'https://developers.google.com/search/blog/2016/08/helping-users-easily-access-content-on',
    examples: {
      good: ['Banner notifications', 'Dismissible overlays', 'Age verification when legally required'],
      bad: ['Full-screen app install prompts', 'Newsletter popups on page load', 'Ads covering content']
    }
  },
  {
    id: 'mobile-003',
    name: 'Optimize for Mobile Networks',
    category: 'Mobile Optimization',
    severity: 'warning',
    description: 'Total page size should be under 2MB; aim for under 1MB for optimal mobile experience.',
    rationale: 'Mobile users often have slower connections and limited data plans.',
    impact: 'Large pages cost users money, take long to load, and increase bounce rates.',
    source: 'Google Web.dev',
    sourceUrl: 'https://web.dev/total-byte-weight/',
    examples: {
      good: ['Compressed assets', 'Lazy loading', 'Adaptive serving', 'Efficient formats'],
      bad: ['Unoptimized images', 'Large videos auto-playing', 'Excessive resources']
    }
  },

  // ============= USER EXPERIENCE =============
  {
    id: 'ux-001',
    name: 'Provide Clear Navigation',
    category: 'User Experience',
    severity: 'warning',
    description: 'Include clear, consistent navigation that helps users find content.',
    rationale: 'Good navigation reduces bounce rates and improves user satisfaction.',
    impact: 'Poor navigation frustrates users and reduces conversions.',
    source: 'Nielsen Norman Group',
    sourceUrl: 'https://www.nngroup.com/articles/navigation-is-the-foundation/',
    examples: {
      good: ['Consistent menu location', 'Breadcrumbs', 'Search functionality', 'Clear labels'],
      bad: ['Hidden navigation', 'Inconsistent menus', 'No search', 'Vague labels']
    }
  },
  {
    id: 'ux-002',
    name: 'Optimize Form Usability',
    category: 'User Experience',
    severity: 'warning',
    description: 'Forms should have clear labels, appropriate input types, validation, and error messages.',
    rationale: 'Well-designed forms increase completion rates and reduce user frustration.',
    impact: 'Poor forms have high abandonment rates and reduce conversions.',
    source: 'Baymard Institute',
    sourceUrl: 'https://baymard.com/blog/checkout-usability',
    examples: {
      good: ['<label> for each input', 'type="email"', 'Inline validation', 'Clear error messages'],
      bad: ['No labels', 'Generic type="text"', 'Unclear errors', 'CAPTCHA on every form']
    }
  },
  {
    id: 'ux-003',
    name: 'Include Loading Indicators',
    category: 'User Experience',
    severity: 'info',
    description: 'Show loading states for async operations to provide feedback to users.',
    rationale: 'Users need feedback that the system is working to avoid confusion.',
    impact: 'No loading indicators make users think the site is broken.',
    source: 'Material Design Guidelines',
    sourceUrl: 'https://material.io/design/communication/loading-indicators.html',
    examples: {
      good: ['Spinners for loading', 'Progress bars', 'Skeleton screens', 'Disabled buttons during submit'],
      bad: ['No feedback', 'Button clickable multiple times', 'Silent failures']
    }
  },

  // ============= CONTENT QUALITY =============
  {
    id: 'content-001',
    name: 'Write Clear, Readable Content',
    category: 'Content Quality',
    severity: 'info',
    description: 'Content should be written at 8th-grade reading level with clear language.',
    rationale: 'Clear content is more accessible, engaging, and easier to understand.',
    impact: 'Complex language excludes users and reduces engagement.',
    source: 'Nielsen Norman Group',
    sourceUrl: 'https://www.nngroup.com/articles/writing-for-lower-literacy-users/',
    examples: {
      good: ['Short sentences', 'Simple words', 'Clear headings', 'Bullet points'],
      bad: ['Jargon', 'Long paragraphs', 'Complex sentences', 'Walls of text']
    }
  },
  {
    id: 'content-002',
    name: 'Provide Contact Information',
    category: 'Content Quality',
    severity: 'info',
    description: 'Include clear contact information and methods to reach support.',
    rationale: 'Users need ways to get help or ask questions to build trust.',
    impact: 'No contact info reduces trust and credibility.',
    source: 'E-A-T Guidelines (Google)',
    sourceUrl: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
    examples: {
      good: ['Email address', 'Contact form', 'Phone number', 'Physical address', 'Support hours'],
      bad: ['No contact info', 'Only social media', 'Generic form with no response']
    }
  }
];

module.exports = { webDesignRules };

