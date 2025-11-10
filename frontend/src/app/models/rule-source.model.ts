export interface RuleSource {
  id: string;
  name: string;
  organization: string;
  description: string;
  url: string;
  ruleIds: string[];
}

export const RULE_SOURCES: RuleSource[] = [
  {
    id: 'all',
    name: 'All Sources (Comprehensive)',
    organization: 'Mixed',
    description: 'Validate against all web design and development guidelines from all sources for a complete analysis.',
    url: '',
    ruleIds: [] // Empty means all rules
  },
  {
    id: 'wcag',
    name: 'WCAG 2.1 (Web Content Accessibility Guidelines)',
    organization: 'W3C',
    description: 'International standard for web accessibility covering perceivable, operable, understandable, and robust content.',
    url: 'https://www.w3.org/WAI/WCAG21/quickref/',
    ruleIds: ['wcag-001', 'wcag-002', 'wcag-003', 'wcag-004', 'wcag-005', 'wcag-006']
  },
  {
    id: 'core-web-vitals',
    name: 'Google Core Web Vitals',
    organization: 'Google',
    description: 'Key metrics for measuring user experience: LCP, CLS, FID/INP, and overall page performance.',
    url: 'https://web.dev/vitals/',
    ruleIds: ['cwv-001', 'cwv-002', 'cwv-003', 'perf-001', 'perf-002', 'perf-003']
  },
  {
    id: 'seo',
    name: 'SEO Best Practices',
    organization: 'Google Search Central',
    description: 'Search engine optimization guidelines to improve visibility and rankings in search results.',
    url: 'https://developers.google.com/search/docs',
    ruleIds: ['seo-001', 'seo-002', 'seo-003', 'seo-004', 'seo-005', 'seo-006', 'seo-007']
  },
  {
    id: 'security',
    name: 'Web Security Standards',
    organization: 'OWASP',
    description: 'Critical security practices including HTTPS, CSP, security headers, and input validation.',
    url: 'https://owasp.org/www-project-top-ten/',
    ruleIds: ['sec-001', 'sec-002', 'sec-003', 'sec-004']
  },
  {
    id: 'html-css',
    name: 'HTML & CSS Best Practices',
    organization: 'W3C / MDN',
    description: 'Standards-compliant markup, responsive design, and optimized CSS delivery.',
    url: 'https://www.w3.org/standards/',
    ruleIds: ['html-001', 'html-002', 'html-003', 'css-001', 'css-002', 'css-003']
  },
  {
    id: 'javascript',
    name: 'JavaScript Best Practices',
    organization: 'MDN Web Docs',
    description: 'Modern JavaScript patterns including performance optimization, error handling, and async loading.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    ruleIds: ['js-001', 'js-002', 'js-003']
  },
  {
    id: 'mobile',
    name: 'Mobile Optimization',
    organization: 'Google Web.dev',
    description: 'Touch-friendly interfaces, mobile-first design, and optimization for mobile networks.',
    url: 'https://web.dev/mobile/',
    ruleIds: ['mobile-001', 'mobile-002', 'mobile-003']
  },
  {
    id: 'ux',
    name: 'User Experience Guidelines',
    organization: 'Nielsen Norman Group',
    description: 'Research-based UX principles for navigation, forms, feedback, and overall usability.',
    url: 'https://www.nngroup.com/',
    ruleIds: ['ux-001', 'ux-002', 'ux-003']
  },
  {
    id: 'content',
    name: 'Content Quality Standards',
    organization: 'Google E-A-T',
    description: 'Guidelines for clear, readable content and establishing expertise, authority, and trustworthiness.',
    url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
    ruleIds: ['content-001', 'content-002']
  },
  {
    id: 'airbnb',
    name: 'Airbnb JavaScript Style Guide',
    organization: 'Airbnb',
    description: 'Industry-leading JavaScript style guide covering ES6+, React, naming conventions, and code organization.',
    url: 'https://github.com/airbnb/javascript',
    ruleIds: ['airbnb-001', 'airbnb-002', 'airbnb-003', 'airbnb-004', 'airbnb-005']
  },
  {
    id: 'google-js',
    name: 'Google JavaScript Style Guide',
    organization: 'Google',
    description: 'Google\'s comprehensive JavaScript coding standards for maintainable and consistent code.',
    url: 'https://google.github.io/styleguide/jsguide.html',
    ruleIds: ['googlejs-001', 'googlejs-002', 'googlejs-003', 'googlejs-004']
  },
  {
    id: 'eslint',
    name: 'ESLint Recommended Rules',
    organization: 'ESLint',
    description: 'Core JavaScript linting rules to identify problematic patterns and enforce code quality.',
    url: 'https://eslint.org/docs/latest/rules/',
    ruleIds: ['eslint-001', 'eslint-002', 'eslint-003', 'eslint-004']
  },
  {
    id: 'lighthouse',
    name: 'Google Lighthouse',
    organization: 'Google Chrome',
    description: 'Automated tool for improving quality of web pages: performance, accessibility, PWA, and SEO.',
    url: 'https://developers.google.com/web/tools/lighthouse',
    ruleIds: ['lighthouse-001', 'lighthouse-002', 'lighthouse-003', 'lighthouse-004']
  },
  {
    id: 'pwa',
    name: 'Progressive Web App Standards',
    organization: 'W3C / Google',
    description: 'Standards for building Progressive Web Apps with offline support, installability, and app-like experience.',
    url: 'https://web.dev/progressive-web-apps/',
    ruleIds: ['pwa-001', 'pwa-002', 'pwa-003', 'pwa-004']
  },
  {
    id: 'a11y-project',
    name: 'The A11Y Project',
    organization: 'A11Y Project Community',
    description: 'Community-driven effort to make digital accessibility easier with practical tips and guidelines.',
    url: 'https://www.a11yproject.com/',
    ruleIds: ['a11y-001', 'a11y-002', 'a11y-003']
  },
  {
    id: 'webaim',
    name: 'WebAIM Accessibility Guidelines',
    organization: 'WebAIM',
    description: 'Web accessibility evaluation tools and resources from Utah State University\'s WebAIM organization.',
    url: 'https://webaim.org/',
    ruleIds: ['webaim-001', 'webaim-002', 'webaim-003']
  },
  {
    id: 'schema-org',
    name: 'Schema.org Structured Data',
    organization: 'Schema.org',
    description: 'Structured data vocabulary for marking up web content to help search engines understand context.',
    url: 'https://schema.org/',
    ruleIds: ['schema-001', 'schema-002']
  },
  {
    id: 'opengraph',
    name: 'Open Graph Protocol',
    organization: 'Facebook',
    description: 'Protocol for integrating web pages into the social graph with rich preview cards.',
    url: 'https://ogp.me/',
    ruleIds: ['og-001', 'og-002', 'og-003']
  },
  {
    id: 'http-archive',
    name: 'HTTP Archive Best Practices',
    organization: 'HTTP Archive',
    description: 'Data-driven web performance insights from crawling millions of pages monthly.',
    url: 'https://httparchive.org/',
    ruleIds: ['httparch-001', 'httparch-002']
  },
  {
    id: 'carbon',
    name: 'Carbon Design System',
    organization: 'IBM',
    description: 'IBM\'s design system for creating consistent digital experiences with accessibility built-in.',
    url: 'https://carbondesignsystem.com/',
    ruleIds: ['carbon-001', 'carbon-002']
  },
  {
    id: 'material',
    name: 'Material Design Guidelines',
    organization: 'Google',
    description: 'Google\'s design system for creating intuitive and beautiful user interfaces.',
    url: 'https://material.io/design',
    ruleIds: ['material-001', 'material-002']
  }
];

