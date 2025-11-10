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
  }
];

