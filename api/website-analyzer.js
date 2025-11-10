const { webDesignRules } = require('./web-design-rules');

async function analyzeWebsite(siteUrl, sourceFilter = 'all') {
  const siteName = extractSiteName(siteUrl);
  const violations = [];
  const summary = {
    totalRules: 0,
    passedRules: 0,
    failedRules: 0,
    warningRules: 0,
    infoRules: 0
  };

  // Filter rules based on source
  let rulesToCheck = webDesignRules;
  if (sourceFilter && sourceFilter !== 'all') {
    // Filter by specific source (e.g., 'wcag', 'seo', 'core-web-vitals')
    rulesToCheck = webDesignRules.filter(rule => 
      rule.id.startsWith(sourceFilter) || 
      rule.source?.toLowerCase().includes(sourceFilter.toLowerCase())
    );
  }

  summary.totalRules = rulesToCheck.length;

  try {
    // Use https module for Node.js compatibility
    const https = require('https');
    const http = require('http');
    const { URL } = require('url');
    
    const urlObj = new URL(siteUrl);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    // Fetch the website
    const result = await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Request timeout after 10 seconds'));
      }, 10000);

      const req = protocol.get(siteUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WebInspector/1.0; +https://web-inspection.vercel.app)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        }
      }, (res) => {
        clearTimeout(timeoutId);

        // Follow redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, siteUrl).href;
          protocol.get(redirectUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; WebInspector/1.0; +https://web-inspection.vercel.app)',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
          }, (redirectRes) => {
            let data = '';
            redirectRes.on('data', chunk => data += chunk);
            redirectRes.on('end', () => resolve({ html: data, headers: redirectRes.headers }));
            redirectRes.on('error', reject);
          }).on('error', reject);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }

        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ html: data, headers: res.headers }));
        res.on('error', reject);
      });

      req.on('error', (err) => {
        clearTimeout(timeoutId);
        reject(err);
      });
      
      req.end();
    });

    const html = result.html;
    const headers = new Map(Object.entries(result.headers));

    // Perform various checks based on rules
    rulesToCheck.forEach(rule => {
      const check = performRuleCheck(rule, html, headers, siteUrl);
      if (!check.passed) {
        violations.push({
          id: rule.id,
          ruleName: rule.name,
          category: rule.category,
          severity: rule.severity,
          description: rule.description,
          details: check.details,
          rationale: rule.rationale,
          impact: rule.impact,
          source: rule.source,
          sourceUrl: rule.sourceUrl,
          recommendation: check.recommendation || `Follow ${rule.source} guidelines: ${rule.examples?.good?.join(', ') || 'See documentation'}`,
          examples: rule.examples?.good || [],
          page: siteUrl,
          codeSnippet: check.codeSnippet,
          lineNumber: check.lineNumber
        });

        if (rule.severity === 'error') summary.failedRules++;
        else if (rule.severity === 'warning') summary.warningRules++;
        else summary.infoRules++;
      } else {
        summary.passedRules++;
      }
    });

    // Calculate overall score (0-100)
    const overallScore = Math.round((summary.passedRules / summary.totalRules) * 100);

    return {
      siteName,
      siteUrl,
      analyzedAt: new Date().toISOString(),
      overallScore,
      violations,
      recommendations: generateRecommendations(violations),
      summary
    };

  } catch (error) {
    // If we can't fetch the site, return basic accessibility/SEO checks that can be inferred
    return {
      siteName,
      siteUrl,
      analyzedAt: new Date().toISOString(),
      overallScore: 0,
      violations: [{
        id: 'connection-error',
        ruleName: 'Website Accessibility Check',
        category: 'Connectivity',
        severity: 'error',
        description: 'Unable to access the website for analysis.',
        details: error.message,
        recommendation: 'Ensure the website is publicly accessible and not behind authentication. Check CORS and firewall settings.',
        page: siteUrl
      }],
      recommendations: ['Ensure website is publicly accessible', 'Check CORS settings', 'Verify SSL certificate'],
      summary: {
        totalRules: rulesToCheck.length,
        passedRules: 0,
        failedRules: 1,
        warningRules: 0,
        infoRules: 0
      }
    };
  }
}

function performRuleCheck(rule, html, headers, siteUrl) {
  const htmlLower = html.toLowerCase();
  
  // Helper function to extract code snippet with line number
  const extractSnippet = (pattern, context = 2) => {
    const lines = html.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        const start = Math.max(0, i - context);
        const end = Math.min(lines.length, i + context + 1);
        const snippet = lines.slice(start, end).join('\n');
        return {
          snippet: snippet.trim().substring(0, 500), // Limit to 500 chars
          lineNumber: i + 1
        };
      }
    }
    return { snippet: null, lineNumber: null };
  };

  // Specific checks based on rule ID
  switch (rule.id) {
    // HTTPS check
    case 'sec-001':
      return {
        passed: siteUrl.startsWith('https://'),
        details: siteUrl.startsWith('https://') 
          ? 'Site uses HTTPS encryption.'
          : 'Site uses insecure HTTP protocol.',
        recommendation: 'Migrate to HTTPS with a valid SSL certificate. Use services like Let\'s Encrypt for free certificates.'
      };

    // DOCTYPE check
    case 'html-002':
      return {
        passed: /<!doctype\s+html/i.test(html),
        details: /<!doctype\s+html/i.test(html)
          ? 'Document has proper HTML5 DOCTYPE.'
          : 'Missing or incorrect DOCTYPE declaration.',
        recommendation: 'Add <!DOCTYPE html> as the first line of your HTML document.'
      };

    // Meta charset
    case 'html-003': {
      const hasCharset = /<meta[^>]+charset=/i.test(html);
      const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
      const hasDescription = /<meta[^>]+name=["']description["']/i.test(html);
      const passed = hasCharset && hasViewport;
      
      const snippetInfo = !hasViewport ? extractSnippet(/<head/i, 3) : { snippet: null, lineNumber: null };
      
      return {
        passed,
        details: `Charset: ${hasCharset ? '✓' : '✗'}, Viewport: ${hasViewport ? '✓' : '✗'}, Description: ${hasDescription ? '✓' : '✗'}`,
        recommendation: 'Add essential meta tags: <meta charset="UTF-8"> and <meta name="viewport" content="width=device-width, initial-scale=1">',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Title tag
    case 'seo-001': {
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const hasTitle = titleMatch && titleMatch[1].trim().length > 0;
      const titleLength = titleMatch ? titleMatch[1].trim().length : 0;
      const goodLength = titleLength >= 10 && titleLength <= 60;
      
      const snippetInfo = titleMatch ? extractSnippet(/<title>/i, 1) : extractSnippet(/<head/i, 3);
      
      return {
        passed: hasTitle && goodLength,
        details: hasTitle 
          ? `Title "${titleMatch[1].trim()}" (${titleLength} chars). Optimal: 50-60 chars.`
          : 'Missing or empty page title.',
        recommendation: 'Add a unique, descriptive title between 50-60 characters to every page.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Meta description
    case 'seo-002': {
      const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      const hasDesc = descMatch && descMatch[1].trim().length > 0;
      const descLength = descMatch ? descMatch[1].trim().length : 0;
      const goodDescLength = descLength >= 120 && descLength <= 160;
      
      const snippetInfo = descMatch ? extractSnippet(/<meta[^>]+name=["']description["']/i, 1) : extractSnippet(/<head/i, 3);
      
      return {
        passed: hasDesc && goodDescLength,
        details: hasDesc
          ? `Description: "${descMatch[1].trim().substring(0, 100)}..." (${descLength} chars). Optimal: 150-160 chars.`
          : 'Missing meta description.',
        recommendation: 'Add a unique meta description of 150-160 characters to every page.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Alt text for images
    case 'wcag-001': {
      const imgTags = html.match(/<img[^>]*>/gi) || [];
      const imgsWithoutAlt = imgTags.filter(img => !/<img[^>]+alt=/i.test(img));
      const allImagesHaveAlt = imgsWithoutAlt.length === 0 && imgTags.length > 0;
      
      let snippetInfo = { snippet: null, lineNumber: null };
      if (imgsWithoutAlt.length > 0) {
        snippetInfo = extractSnippet(new RegExp(imgsWithoutAlt[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), 1);
      }
      
      return {
        passed: imgTags.length === 0 || allImagesHaveAlt,
        details: imgTags.length === 0 
          ? 'No images found on page.'
          : `${imgTags.length} images found, ${imgsWithoutAlt.length} without alt text.`,
        recommendation: 'Add descriptive alt text to all <img> tags. Use alt="" for decorative images.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Semantic HTML
    case 'wcag-004': {
      const hasNav = /<nav/i.test(html);
      const hasMain = /<main/i.test(html);
      const hasHeader = /<header/i.test(html);
      const hasFooter = /<footer/i.test(html);
      const semanticCount = [hasNav, hasMain, hasHeader, hasFooter].filter(Boolean).length;
      
      const snippetInfo = semanticCount < 2 ? extractSnippet(/<body/i, 5) : { snippet: null, lineNumber: null };
      
      return {
        passed: semanticCount >= 2,
        details: `Found ${semanticCount}/4 key semantic elements: nav(${hasNav}), main(${hasMain}), header(${hasHeader}), footer(${hasFooter})`,
        recommendation: 'Use semantic HTML5 elements like <nav>, <main>, <header>, <footer>, <article>, and <section>.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Security headers (original check - kept for backward compatibility)
    case 'sec-002':
    case 'sec-003': {
      const csp = headers.get('content-security-policy');
      const xContentType = headers.get('x-content-type-options');
      const xFrame = headers.get('x-frame-options');
      const hasSecurityHeaders = !!(csp || xContentType || xFrame);
      
      return {
        passed: hasSecurityHeaders,
        details: `CSP: ${csp ? '✓' : '✗'}, X-Content-Type-Options: ${xContentType ? '✓' : '✗'}, X-Frame-Options: ${xFrame ? '✓' : '✗'}`,
        recommendation: 'Implement security headers: Content-Security-Policy, X-Content-Type-Options: nosniff, X-Frame-Options: DENY'
      };
    }

    // Color contrast (WCAG)
    case 'wcag-002': {
      // Check for light-on-light or dark-on-dark combinations in inline styles
      const lightColors = /#fff|#ffffff|white|#f[0-9a-f]{2,5}|rgb\(25[0-5],\s*25[0-5],\s*25[0-5]\)/gi;
      const darkColors = /#000|#000000|black|#[0-3][0-9a-f]{2,5}|rgb\([0-5]?[0-9],\s*[0-5]?[0-9],\s*[0-5]?[0-9]\)/gi;
      const hasLightBg = (html.match(new RegExp(`background[^:]*:\\s*(${lightColors.source})`, 'gi')) || []).length;
      const hasLightText = (html.match(new RegExp(`color[^:]*:\\s*(${lightColors.source})`, 'gi')) || []).length;
      const suspiciousContrast = hasLightBg > 0 && hasLightText > 0;
      
      const snippetInfo = suspiciousContrast ? extractSnippet(/color[^:]*:\s*(#fff|white)/i, 2) : { snippet: null, lineNumber: null };
      
      return {
        passed: !suspiciousContrast,
        details: suspiciousContrast
          ? 'Potential low-contrast combinations detected in CSS. Use tools like WebAIM contrast checker.'
          : 'No obvious contrast issues detected in inline styles. Use contrast checker tools for thorough verification.',
        recommendation: 'Ensure 4.5:1 contrast ratio for normal text, 3:1 for large text. Test with WebAIM Contrast Checker.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Keyboard accessibility
    case 'wcag-003': {
      const interactiveElements = (html.match(/<(button|a|input|select|textarea)[^>]*>/gi) || []).length;
      const elementsWithTabindex = (html.match(/tabindex=/gi) || []).length;
      const negativeTabindex = (html.match(/tabindex=["']-1["']/gi) || []).length;
      
      const snippetInfo = negativeTabindex > 0 ? extractSnippet(/tabindex=["']-1["']/i, 2) : { snippet: null, lineNumber: null };
      
      return {
        passed: negativeTabindex === 0 || elementsWithTabindex > interactiveElements * 0.5,
        details: `${interactiveElements} interactive elements, ${elementsWithTabindex} with tabindex, ${negativeTabindex} with tabindex=-1`,
        recommendation: 'Ensure all interactive elements are keyboard accessible. Avoid tabindex="-1" on interactive elements.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Structured Data (alternate check)
    case 'seo-004': {
      const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
      const hasMicrodata = /itemscope|itemprop/i.test(html);
      
      const snippetInfo = !(hasJsonLd || hasMicrodata) ? extractSnippet(/<head/i, 6) : extractSnippet(/application\/ld\+json/i, 2);
      
      return {
        passed: hasJsonLd || hasMicrodata,
        details: `Structured data: JSON-LD(${hasJsonLd}), Microdata(${hasMicrodata})`,
        recommendation: 'Implement Schema.org structured data with JSON-LD for rich search results.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // CSS optimization
    case 'css-002': {
      const hasPreload = /<link[^>]+rel=["']preload["'][^>]+as=["'](style|font)["']/i.test(html);
      const inlineStyles = (html.match(/<style[^>]*>/gi) || []).length;
      const externalStyles = (html.match(/<link[^>]+rel=["']stylesheet["']/gi) || []).length;
      
      const snippetInfo = externalStyles > 0 ? extractSnippet(/<link[^>]+rel=["']stylesheet["']/i, 2) : extractSnippet(/<head/i, 5);
      
      return {
        passed: hasPreload || (inlineStyles > 0 && externalStyles > 0),
        details: `Preload: ${hasPreload}, Inline styles: ${inlineStyles}, External: ${externalStyles}`,
        recommendation: 'Inline critical CSS and use <link rel="preload"> for fonts. Defer non-critical CSS.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // JavaScript error handling
    case 'js-003': {
      const hasTryCatch = /try\s*\{[\s\S]*?\}\s*catch/i.test(html);
      const hasErrorHandler = /\.catch\(|onerror|addEventListener\(['"]error['"]|window\.onerror/i.test(html);
      
      const snippetInfo = hasTryCatch ? extractSnippet(/try\s*\{/i, 3) : (hasErrorHandler ? extractSnippet(/\.catch\(|onerror/i, 2) : extractSnippet(/<script/i, 4));
      
      return {
        passed: hasTryCatch || hasErrorHandler,
        details: `Error handling: try/catch(${hasTryCatch}), error handlers(${hasErrorHandler})`,
        recommendation: 'Implement try/catch blocks and global error handlers for graceful error handling.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Mobile network optimization
    case 'mobile-003': {
      const htmlSize = html.length;
      const imageTags = (html.match(/<img[^>]*>/gi) || []).length;
      const scriptTags = (html.match(/<script[^>]*src=/gi) || []).length;
      const estimatedSize = htmlSize + (imageTags * 50000) + (scriptTags * 100000); // Very rough estimate
      return {
        passed: htmlSize < 500000,
        details: `HTML size: ${Math.round(htmlSize/1024)}KB, ${imageTags} images, ${scriptTags} external scripts`,
        recommendation: 'Optimize for mobile: compress images, minify code, lazy load resources. Keep total page under 2MB.'
      };
    }

    // Object destructuring
    case 'airbnb-004': {
      const hasDestructuring = /const\s*\{[^}]+\}\s*=|let\s*\{[^}]+\}\s*=/i.test(html);
      const hasRepetitiveDotAccess = /(\w+)\.(\w+)[^=]*\1\.(\w+)/i.test(html);
      return {
        passed: hasDestructuring || !hasRepetitiveDotAccess,
        details: `Destructuring: ${hasDestructuring ? 'Used' : 'Not detected'}, Repetitive access: ${hasRepetitiveDotAccess ? 'Found' : 'None'}`,
        recommendation: 'Use object destructuring: const { name, age } = user; instead of user.name, user.age repeatedly.'
      };
    }

    // Default parameters
    case 'airbnb-005': {
      const hasDefaultParams = /function\s+\w+\s*\([^)]*=[^)]*\)|=\s*\([^)]*=[^)]*\)\s*=>/i.test(html);
      const hasFallbackPattern = /\|\|/i.test(html);
      return {
        passed: hasDefaultParams || !hasFallbackPattern,
        details: `Default parameters: ${hasDefaultParams ? 'Used' : 'Not found'}, Fallback pattern (||): ${hasFallbackPattern ? 'Used' : 'Not used'}`,
        recommendation: 'Use default parameter syntax: function test(val = 1) { } instead of val = val || 1;'
      };
    }

    // JSDoc comments
    case 'googlejs-002': {
      const hasJsDoc = /\/\*\*[\s\S]*?@(param|return|type)[\s\S]*?\*\//i.test(html);
      const hasFunctions = /function\s+\w+\s*\(|const\s+\w+\s*=\s*\([^)]*\)\s*=>/i.test(html);
      
      const snippetInfo = hasFunctions && !hasJsDoc ? extractSnippet(/function\s+\w+\s*\(/i, 2) : (hasJsDoc ? extractSnippet(/\/\*\*/i, 3) : { snippet: null, lineNumber: null });
      
      return {
        passed: hasJsDoc || !hasFunctions,
        details: `JSDoc: ${hasJsDoc ? 'Found' : 'Not found'}, Functions: ${hasFunctions ? 'Found' : 'None'}`,
        recommendation: 'Document functions with JSDoc comments: /** @param {type} name @return {type} */',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Strict equality
    case 'googlejs-003': {
      const hasLooseEquality = /[^=!]==[^=]|[^!]!=[^=]/i.test(html);
      const hasStrictEquality = /===|!==/i.test(html);
      return {
        passed: !hasLooseEquality || hasStrictEquality,
        details: `Loose equality (==, !=): ${hasLooseEquality ? 'Found' : 'None'}, Strict (===, !==): ${hasStrictEquality ? 'Found' : 'None'}`,
        recommendation: 'Always use === and !== for comparisons to avoid type coercion bugs.'
      };
    }

    // Unused variables
    case 'eslint-001': {
      const varDeclarations = (html.match(/\b(const|let|var)\s+\w+\s*=/gi) || []).length;
      const scriptSize = (html.match(/<script[\s\S]*?<\/script>/gi) || []).reduce((sum, s) => sum + s.length, 0);
      return {
        passed: scriptSize < 10000 || varDeclarations < 50,
        details: `${varDeclarations} variable declarations, ${Math.round(scriptSize/1024)}KB of JavaScript`,
        recommendation: 'Remove unused variables and dead code. Use tree-shaking and code splitting.'
      };
    }

    // Duplicate object keys
    case 'eslint-004': {
      const objectLiterals = html.match(/\{[^{}]*\}/g) || [];
      const hasDuplicates = objectLiterals.some(obj => {
        const keys = obj.match(/(\w+)\s*:/g) || [];
        return new Set(keys).size !== keys.length;
      });
      return {
        passed: !hasDuplicates,
        details: hasDuplicates
          ? 'Potential duplicate keys detected in object literals.'
          : 'No duplicate object keys detected.',
        recommendation: 'Ensure object literals have unique keys. Duplicates cause bugs.'
      };
    }

    // Network payload size
    case 'lighthouse-003': {
      const htmlSize = html.length;
      const resourceCount = (html.match(/<(script|link|img)[^>]*src=|href=/gi) || []).length;
      return {
        passed: htmlSize < 500000,
        details: `HTML size: ${Math.round(htmlSize/1024)}KB, External resources: ${resourceCount}. Estimated total: ~${Math.round((htmlSize + resourceCount * 50000)/1024)}KB`,
        recommendation: 'Keep total network payload under 1.6MB. Minify, compress, and optimize all assets.'
      };
    }

    // Passive event listeners
    case 'lighthouse-004': {
      const hasTouchEvents = /addEventListener\s*\(\s*['"]touch/i.test(html);
      const hasWheelEvents = /addEventListener\s*\(\s*['"]wheel/i.test(html);
      const hasPassive = /\{\s*passive\s*:\s*true\s*\}/i.test(html);
      return {
        passed: !(hasTouchEvents || hasWheelEvents) || hasPassive,
        details: `Touch events: ${hasTouchEvents}, Wheel events: ${hasWheelEvents}, Passive: ${hasPassive}`,
        recommendation: 'Mark touch and wheel event listeners as passive: addEventListener("touchstart", handler, { passive: true });'
      };
    }

    // PWA HTTPS (duplicate of sec-001 but for PWA context)
    case 'pwa-003':
      return {
        passed: siteUrl.startsWith('https://'),
        details: siteUrl.startsWith('https://')
          ? 'Site uses HTTPS (required for PWA).'
          : 'PWA requires HTTPS for service workers and modern APIs.',
        recommendation: 'Migrate to HTTPS. Service workers only work on HTTPS.'
      };

    // Offline fallback
    case 'pwa-004': {
      const hasServiceWorker = /navigator\.serviceWorker/i.test(html);
      const hasOfflinePage = /offline\.html|offline-fallback/i.test(html);
      return {
        passed: hasOfflinePage || hasServiceWorker,
        details: `Service worker: ${hasServiceWorker}, Offline page: ${hasOfflinePage}`,
        recommendation: 'Create offline.html fallback page served by service worker when network is unavailable.'
      };
    }

    // Skip links
    case 'a11y-003': {
      const hasSkipLink = /<a[^>]*href=["']#(main|content|skip)["'][^>]*>(skip|skip to|jump to)/i.test(html);
      const snippetInfo = hasSkipLink ? extractSnippet(/href=["']#(main|content|skip)["']/i, 1) : extractSnippet(/<body/i, 4);
      
      return {
        passed: hasSkipLink,
        details: hasSkipLink
          ? 'Skip navigation link found.'
          : 'No skip link detected.',
        recommendation: 'Add <a href="#main" class="skip-link">Skip to main content</a> at the beginning of the page.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Audio transcripts
    case 'webaim-001': {
      const hasAudio = /<audio[^>]*>/i.test(html);
      const hasVideo = /<video[^>]*>/i.test(html);
      const hasTranscript = /transcript|transkript|текст/i.test(html);
      return {
        passed: !(hasAudio || hasVideo) || hasTranscript,
        details: `Audio: ${hasAudio}, Video: ${hasVideo}, Transcript: ${hasTranscript}`,
        recommendation: 'Provide text transcripts for all audio/video content for accessibility.'
      };
    }

    // Link spacing
    case 'webaim-002': {
      const links = (html.match(/<a[^>]*>/gi) || []).length;
      const buttonsAndLinks = (html.match(/<(a|button)[^>]*>/gi) || []).length;
      const hasPadding = /padding|margin/i.test(html);
      return {
        passed: links < 10 || hasPadding,
        details: `${links} links, ${buttonsAndLinks} interactive elements. Spacing: ${hasPadding ? 'CSS found' : 'Check manually'}`,
        recommendation: 'Ensure sufficient spacing between links and buttons (min 8px) for touch accessibility.'
      };
    }

    // Keyboard testing
    case 'webaim-003': {
      const hasOnClick = /onclick=/i.test(html);
      const hasDivButtons = /<div[^>]*onclick=/i.test(html);
      const hasProperButtons = /<button[^>]*>/i.test(html);
      return {
        passed: !hasDivButtons || hasProperButtons,
        details: `onclick handlers: ${hasOnClick ? 'Found' : 'None'}, <div> as buttons: ${hasDivButtons ? 'Found' : 'None'}, Real buttons: ${hasProperButtons ? 'Found' : 'None'}`,
        recommendation: 'Use semantic <button> elements instead of <div onclick="...">. Test all functionality with keyboard only.'
      };
    }

    // Schema types
    case 'schema-002': {
      const jsonLdScripts = html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
      const hasSpecificType = jsonLdScripts.some(script => 
        /(Article|Product|Recipe|Event|Organization|Person|Review|FAQ|JobPosting|Course)/.test(script)
      );
      return {
        passed: hasSpecificType,
        details: hasSpecificType
          ? 'Found specific Schema.org types (Article, Product, etc.).'
          : 'No specific Schema.org types found. Avoid generic types like Thing.',
        recommendation: 'Use specific Schema.org types: Article, Product, Recipe, Event, Organization, etc.'
      };
    }

    // OG image quality
    case 'og-002': {
      const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
      const imageUrl = ogImage ? ogImage[1] : null;
      const hasOgImageDimensions = /<meta[^>]+property=["']og:image:(width|height)["']/i.test(html);
      return {
        passed: hasOgImageDimensions || !imageUrl,
        details: imageUrl
          ? `OG image: ${imageUrl.substring(0, 50)}... Dimensions specified: ${hasOgImageDimensions}`
          : 'No OG image found.',
        recommendation: 'Use 1200x630px images for og:image. Specify og:image:width and og:image:height.'
      };
    }

    // Third-party scripts
    case 'httparch-001': {
      const scriptSrcs = html.match(/<script[^>]+src=["']([^"']+)["']/gi) || [];
      const thirdPartyScripts = scriptSrcs.filter(src => {
        const url = src.match(/src=["']([^"']+)["']/i)?.[1] || '';
        return !/^\/|^\.\//.test(url) && new URL(siteUrl).hostname !== new URL(url, siteUrl).hostname;
      }).length;
      const asyncThirdParty = scriptSrcs.filter(src => /async|defer/.test(src)).length;
      return {
        passed: thirdPartyScripts === 0 || asyncThirdParty / thirdPartyScripts > 0.8,
        details: `${thirdPartyScripts} third-party scripts, ${asyncThirdParty} loaded async/defer (${Math.round(asyncThirdParty/thirdPartyScripts*100) || 0}%)`,
        recommendation: 'Load third-party scripts asynchronously. Consider self-hosting critical dependencies.'
      };
    }

    // HTTP requests
    case 'httparch-002': {
      const images = (html.match(/<img[^>]*>/gi) || []).length;
      const scripts = (html.match(/<script[^>]*src=/gi) || []).length;
      const styles = (html.match(/<link[^>]+rel=["']stylesheet["']/gi) || []).length;
      const fonts = (html.match(/<link[^>]+rel=["']preload["'][^>]+as=["']font["']/gi) || []).length;
      const totalRequests = images + scripts + styles + fonts;
      return {
        passed: totalRequests < 50,
        details: `Total HTTP requests: ${totalRequests} (images: ${images}, scripts: ${scripts}, styles: ${styles}, fonts: ${fonts})`,
        recommendation: 'Reduce HTTP requests: bundle JS/CSS, sprite images, inline critical resources. Target <50 requests.'
      };
    }

    // Spacing scale
    case 'carbon-001': {
      const spacingValues = html.match(/padding|margin:\s*(\d+)px/gi) || [];
      const irregularSpacing = spacingValues.filter(s => {
        const val = parseInt(s.match(/(\d+)/)?.[1] || '0');
        return val % 8 !== 0 && val > 8;
      }).length;
      return {
        passed: irregularSpacing < spacingValues.length * 0.3,
        details: `${spacingValues.length} spacing declarations, ${irregularSpacing} not on 8px scale`,
        recommendation: 'Use consistent spacing scale: 8px, 16px, 24px, 32px, etc. (8px base unit).'
      };
    }

    // Color contrast (Carbon)
    case 'carbon-002': {
      // Same as wcag-002 but from Carbon Design perspective
      const hasContrast = /contrast|color-contrast/i.test(html);
      return {
        passed: hasContrast,
        details: 'Contrast considerations in CSS: ' + (hasContrast ? 'Found' : 'Not evident'),
        recommendation: 'Follow Carbon Design System color contrast guidelines. Ensure 4.5:1 ratio for text.'
      };
    }

    // Elevation/shadows (Material)
    case 'material-001': {
      const hasShadow = /box-shadow:/i.test(html);
      const shadowCount = (html.match(/box-shadow:/gi) || []).length;
      const hasElevation = /elevation|shadow-/i.test(html);
      return {
        passed: hasShadow || hasElevation,
        details: `${shadowCount} box-shadow declarations found. Elevation system: ${hasElevation ? 'Detected' : 'Not detected'}`,
        recommendation: 'Use consistent elevation system: Cards at elevation 1 (0-2px shadow), Dialogs at elevation 24.'
      };
    }

    // Ripple effect (Material)
    case 'material-002': {
      const hasRipple = /ripple|wave|touch-feedback/i.test(html);
      const hasButtons = /<button[^>]*>/i.test(html);
      return {
        passed: !hasButtons || hasRipple,
        details: `Buttons: ${hasButtons ? 'Found' : 'None'}, Ripple effects: ${hasRipple ? 'Detected' : 'Not detected'}`,
        recommendation: 'Add ripple/wave effects to buttons for touch feedback (Material Design pattern).'
      };
    }

    // Heading hierarchy
    case 'seo-003': {
      const h1Count = (html.match(/<h1/gi) || []).length;
      const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
      const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
      const skipsLevels = h3Count > 0 && h2Count === 0;
      
      const snippetInfo = h1Count !== 1 ? extractSnippet(/<h1/i, 2) : (skipsLevels ? extractSnippet(/<h3/i, 2) : { snippet: null, lineNumber: null });
      
      return {
        passed: h1Count === 1 && !skipsLevels,
        details: `Headings: ${h1Count} <h1>, ${h2Count} <h2>, ${h3Count} <h3>. ${skipsLevels ? 'Skips heading levels!' : ''}`,
        recommendation: 'Use exactly one <h1> per page. Maintain logical hierarchy: h1→h2→h3, never skip levels.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // JavaScript - Console statements
    case 'eslint-002': {
      const hasConsole = /console\.(log|error|warn|info|debug)\(/i.test(html);
      const snippetInfo = hasConsole ? extractSnippet(/console\.(log|error|warn|info|debug)\(/i, 2) : { snippet: null, lineNumber: null };
      return {
        passed: !hasConsole,
        details: hasConsole 
          ? 'Found console statements in JavaScript code. Should be removed for production.'
          : 'No console statements detected in inline scripts.',
        recommendation: 'Remove all console.log, console.error, and similar statements from production code. Use proper logging libraries instead.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // JavaScript - Debugger statements
    case 'eslint-003': {
      const hasDebugger = /\bdebugger\s*;/i.test(html);
      const snippetInfo = hasDebugger ? extractSnippet(/\bdebugger\s*;/i, 2) : { snippet: null, lineNumber: null };
      return {
        passed: !hasDebugger,
        details: hasDebugger
          ? 'Found debugger statements in JavaScript code.'
          : 'No debugger statements found.',
        recommendation: 'Remove all debugger; statements from production code.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // JavaScript - Use strict
    case 'googlejs-001': {
      const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
      const inlineScripts = scriptTags.filter(s => !/<script[^>]+src=/i.test(s));
      const hasSemicolons = inlineScripts.some(s => /;/.test(s));
      return {
        passed: inlineScripts.length === 0 || hasSemicolons,
        details: inlineScripts.length === 0 
          ? 'No inline scripts found to check.'
          : `Found ${inlineScripts.length} inline scripts. Ensure semicolons are used.`,
        recommendation: 'Always use semicolons to terminate JavaScript statements.'
      };
    }

    // JavaScript - Global variables
    case 'googlejs-004': {
      const hasGlobalVar = /\bvar\s+\w+\s*=/i.test(html);
      return {
        passed: !hasGlobalVar,
        details: hasGlobalVar
          ? 'Found var declarations which create global variables. Use const/let instead.'
          : 'No global var declarations detected.',
        recommendation: 'Avoid var. Use const for constants and let for variables. Use modules or IIFEs to avoid global pollution.'
      };
    }

    // Render-blocking resources
    case 'js-002':
    case 'perf-003':
    case 'lighthouse-002': {
      const blockingScripts = html.match(/<script(?![^>]*\b(?:defer|async)\b)[^>]*src=["'][^"']+["'][^>]*>/gi) || [];
      const blockingStyles = html.match(/<link[^>]+rel=["']stylesheet["'](?![^>]*\bmedia=["']print["'])[^>]*>/gi) || [];
      const totalBlocking = blockingScripts.length + blockingStyles.length;
      
      let snippetInfo = { snippet: null, lineNumber: null };
      if (blockingScripts.length > 0) {
        const firstScript = blockingScripts[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        snippetInfo = extractSnippet(new RegExp(firstScript, 'i'), 2);
      } else if (blockingStyles.length > 0) {
        snippetInfo = extractSnippet(/<link[^>]+rel=["']stylesheet["']/i, 2);
      }
      
      return {
        passed: totalBlocking === 0,
        details: `Found ${blockingScripts.length} render-blocking scripts and ${blockingStyles.length} render-blocking stylesheets.`,
        recommendation: 'Add defer or async attributes to <script> tags. Use media="print" or load CSS asynchronously for non-critical styles.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Images optimization
    case 'perf-002':
    case 'lighthouse-001': {
      const imgTags = html.match(/<img[^>]*>/gi) || [];
      const hasWebP = /<source[^>]+type=["']image\/webp["']/i.test(html);
      const hasAVIF = /<source[^>]+type=["']image\/avif["']/i.test(html);
      const hasLazyLoad = imgTags.some(img => /loading=["']lazy["']/i.test(img));
      
      const snippetInfo = imgTags.length > 0 ? extractSnippet(/<img[^>]*>/i, 2) : { snippet: null, lineNumber: null };
      
      return {
        passed: (hasWebP || hasAVIF) && hasLazyLoad,
        details: `Images: ${imgTags.length}, WebP: ${hasWebP ? 'Yes' : 'No'}, AVIF: ${hasAVIF ? 'No' : 'No'}, Lazy Loading: ${hasLazyLoad ? 'Yes' : 'No'}`,
        recommendation: 'Use <picture> with WebP/AVIF formats. Add loading="lazy" to below-fold images.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Meta tags - SEO
    case 'seo-006': {
      const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
      const snippetInfo = hasCanonical ? extractSnippet(/<link[^>]+rel=["']canonical["']/i, 1) : extractSnippet(/<head/i, 5);
      
      return {
        passed: hasCanonical,
        details: hasCanonical
          ? 'Canonical URL is specified.'
          : 'Missing canonical URL link.',
        recommendation: 'Add <link rel="canonical" href="https://yoursite.com/page"> to avoid duplicate content issues.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Structured data
    case 'schema-001': {
      const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["'][^>]*>/i.test(html);
      const snippetInfo = hasJsonLd ? extractSnippet(/application\/ld\+json/i, 3) : extractSnippet(/<head/i, 6);
      
      return {
        passed: hasJsonLd,
        details: hasJsonLd
          ? 'Found JSON-LD structured data.'
          : 'No structured data (JSON-LD) found.',
        recommendation: 'Add Schema.org structured data using JSON-LD format for better search engine understanding.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Open Graph
    case 'og-001': {
      const hasOgTitle = /<meta[^>]+property=["']og:title["']/i.test(html);
      const hasOgDesc = /<meta[^>]+property=["']og:description["']/i.test(html);
      const hasOgImage = /<meta[^>]+property=["']og:image["']/i.test(html);
      const hasOgUrl = /<meta[^>]+property=["']og:url["']/i.test(html);
      const ogCount = [hasOgTitle, hasOgDesc, hasOgImage, hasOgUrl].filter(Boolean).length;
      
      const snippetInfo = ogCount < 3 ? extractSnippet(/<head/i, 5) : extractSnippet(/property=["']og:/i, 2);
      
      return {
        passed: ogCount >= 3,
        details: `Open Graph tags: title(${hasOgTitle}), description(${hasOgDesc}), image(${hasOgImage}), url(${hasOgUrl})`,
        recommendation: 'Add all 4 essential Open Graph meta tags: og:title, og:description, og:image, og:url.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Twitter Cards
    case 'og-003': {
      const hasTwitterCard = /<meta[^>]+name=["']twitter:card["']/i.test(html);
      const hasTwitterTitle = /<meta[^>]+name=["']twitter:title["']/i.test(html);
      const hasTwitterDesc = /<meta[^>]+name=["']twitter:description["']/i.test(html);
      
      const snippetInfo = !(hasTwitterCard && hasTwitterTitle) ? extractSnippet(/<head/i, 5) : extractSnippet(/name=["']twitter:/i, 2);
      
      return {
        passed: hasTwitterCard && hasTwitterTitle,
        details: `Twitter Card: ${hasTwitterCard ? 'Yes' : 'No'}, Title: ${hasTwitterTitle ? 'Yes' : 'No'}, Description: ${hasTwitterDesc ? 'Yes' : 'No'}`,
        recommendation: 'Add Twitter Card meta tags for better tweet previews.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // PWA Manifest
    case 'pwa-001': {
      const hasManifest = /<link[^>]+rel=["']manifest["']/i.test(html);
      const snippetInfo = hasManifest ? extractSnippet(/<link[^>]+rel=["']manifest["']/i, 1) : extractSnippet(/<head/i, 5);
      
      return {
        passed: hasManifest,
        details: hasManifest
          ? 'Web app manifest link found.'
          : 'No web app manifest detected.',
        recommendation: 'Add <link rel="manifest" href="/manifest.json"> for PWA installability.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Service Worker
    case 'pwa-002': {
      const hasServiceWorker = /navigator\.serviceWorker\.register/i.test(html);
      const snippetInfo = hasServiceWorker ? extractSnippet(/navigator\.serviceWorker/i, 3) : extractSnippet(/<script/i, 3);
      
      return {
        passed: hasServiceWorker,
        details: hasServiceWorker
          ? 'Service worker registration found in JavaScript.'
          : 'No service worker registration detected.',
        recommendation: 'Register a service worker for offline support and caching.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // ARIA labels
    case 'wcag-006': {
      const hasAriaLabel = /aria-label=/i.test(html);
      const hasAriaLabelledBy = /aria-labelledby=/i.test(html);
      const hasAriaDescribedBy = /aria-describedby=/i.test(html);
      const ariaCount = [hasAriaLabel, hasAriaLabelledBy, hasAriaDescribedBy].filter(Boolean).length;
      
      const snippetInfo = ariaCount === 0 ? extractSnippet(/<(div|button|span|a)[^>]*role=/i, 2) : extractSnippet(/aria-label=/i, 1);
      
      return {
        passed: ariaCount > 0,
        details: `ARIA attributes found: aria-label(${hasAriaLabel}), aria-labelledby(${hasAriaLabelledBy}), aria-describedby(${hasAriaDescribedBy})`,
        recommendation: 'Use ARIA labels to enhance accessibility of custom widgets and dynamic content.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Focus indicators
    case 'wcag-005': {
      const removesOutline = /:focus\s*\{\s*outline\s*:\s*none/i.test(html);
      const snippetInfo = removesOutline ? extractSnippet(/:focus\s*\{/i, 2) : { snippet: null, lineNumber: null };
      
      return {
        passed: !removesOutline,
        details: removesOutline
          ? 'CSS removes focus outline without providing alternative.'
          : 'Focus styles appear to be preserved.',
        recommendation: 'Never use :focus { outline: none; } without providing a visible alternative focus indicator.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Language attribute
    case 'html-002': {
      const hasLang = /<html[^>]+lang=/i.test(html);
      return {
        passed: hasLang,
        details: hasLang
          ? 'HTML lang attribute is present.'
          : 'Missing lang attribute on <html> tag.',
        recommendation: 'Add lang="en" (or appropriate language code) to <html> tag.'
      };
    }

    // Valid HTML
    case 'html-001': {
      const hasUnclosedTags = /<(div|p|span|a|button)[^>]*>(?![\s\S]*<\/\1>)/i.test(html.substring(0, 5000));
      const hasObsoleteTags = /<(font|center|marquee|blink)/i.test(html);
      
      const snippetInfo = hasObsoleteTags ? extractSnippet(/<(font|center|marquee|blink)/i, 2) : (hasUnclosedTags ? extractSnippet(/<html/i, 4) : { snippet: null, lineNumber: null });
      
      return {
        passed: !hasUnclosedTags && !hasObsoleteTags,
        details: hasObsoleteTags 
          ? 'Found obsolete HTML tags (font, center, marquee, etc.).'
          : 'No obvious HTML validation errors detected.',
        recommendation: 'Use W3C HTML Validator to check for all validation errors. Remove obsolete tags.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Responsive design
    case 'css-003': {
      const hasMediaQuery = /@media/i.test(html);
      const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
      
      const snippetInfo = !hasMediaQuery ? extractSnippet(/<style/i, 4) : (!hasViewport ? extractSnippet(/<head/i, 3) : extractSnippet(/@media/i, 2));
      
      return {
        passed: hasMediaQuery && hasViewport,
        details: `Media queries: ${hasMediaQuery ? 'Yes' : 'No'}, Viewport meta: ${hasViewport ? 'Yes' : 'No'}`,
        recommendation: 'Implement responsive design with @media queries and viewport meta tag.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // External CSS
    case 'css-001': {
      const inlineStyles = (html.match(/<style[^>]*>/gi) || []).length;
      const externalStyles = (html.match(/<link[^>]+rel=["']stylesheet["']/gi) || []).length;
      const inlineStyleAttrs = (html.match(/\sstyle=/gi) || []).length;
      
      const snippetInfo = inlineStyleAttrs >= 10 ? extractSnippet(/\sstyle=/i, 2) : (inlineStyles > 1 ? extractSnippet(/<style/i, 2) : { snippet: null, lineNumber: null });
      
      return {
        passed: externalStyles > 0 && inlineStyles <= 1 && inlineStyleAttrs < 10,
        details: `External: ${externalStyles}, Inline <style>: ${inlineStyles}, Inline style= attributes: ${inlineStyleAttrs}`,
        recommendation: 'Use external CSS files for better caching and maintainability. Inline only critical CSS.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Form labels
    case 'a11y-002': {
      const inputs = (html.match(/<input[^>]*>/gi) || []).length;
      const labels = (html.match(/<label[^>]*>/gi) || []).length;
      const inputsWithLabels = (html.match(/<label[^>]*for=["'][^"']+["'][^>]*>/gi) || []).length;
      
      const snippetInfo = inputs > 0 && inputsWithLabels < inputs * 0.8 ? extractSnippet(/<input[^>]*>/i, 2) : { snippet: null, lineNumber: null };
      
      return {
        passed: inputs === 0 || inputsWithLabels >= inputs * 0.8,
        details: `${inputs} inputs found, ${inputsWithLabels} with associated labels (${Math.round(inputsWithLabels/inputs*100) || 0}%)`,
        recommendation: 'Every form input must have an associated <label> element with for="id" attribute.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Link text
    case 'a11y-001': {
      const genericLinks = (html.match(/<a[^>]*>(\s*)(click here|here|more|read more|link)(\s*)<\/a>/gi) || []).length;
      const totalLinks = (html.match(/<a[^>]*href=/gi) || []).length;
      
      const snippetInfo = genericLinks > 0 ? extractSnippet(/<a[^>]*>(click here|here|more|read more)/i, 1) : { snippet: null, lineNumber: null };
      
      return {
        passed: genericLinks === 0,
        details: `${totalLinks} links found, ${genericLinks} with generic text like "click here" or "more"`,
        recommendation: 'Use descriptive link text that makes sense out of context. Avoid "click here", "read more", etc.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Touch targets
    case 'mobile-001': {
      // Look for small buttons or links
      const smallButtons = html.match(/font-size:\s*([0-9]+)px/gi) || [];
      const verySmallFonts = smallButtons.filter(s => {
        const size = parseInt(s.match(/([0-9]+)/)[1]);
        return size < 14;
      }).length;
      return {
        passed: verySmallFonts < 5,
        details: verySmallFonts > 0
          ? `Found ${verySmallFonts} elements with very small font sizes (<14px) which may indicate small touch targets.`
          : 'Touch target sizes appear adequate.',
        recommendation: 'Ensure all interactive elements are at least 48x48 CSS pixels with 8px spacing.'
      };
    }

    // Intrusive interstitials
    case 'mobile-002': {
      const hasPopup = /(modal|popup|overlay|interstitial)/i.test(html);
      const hasDisplayNone = /display:\s*none/i.test(html);
      return {
        passed: !hasPopup || hasDisplayNone,
        details: hasPopup
          ? 'Potential modal/popup detected. Ensure it\'s not intrusive on mobile.'
          : 'No obvious intrusive interstitials detected.',
        recommendation: 'Avoid full-screen popups on mobile. Use dismissible banners instead.'
      };
    }

    // Canonical URL
    case 'seo-006': {
      const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
      return {
        passed: hasCanonical,
        details: hasCanonical
          ? 'Canonical URL link is present.'
          : 'Missing canonical URL.',
        recommendation: 'Add <link rel="canonical" href="..."> to prevent duplicate content issues.'
      };
    }

    // Sitemap
    case 'seo-005': {
      // Check robots.txt or common sitemap locations (can't verify here, but check for reference)
      const mentionsSitemap = /sitemap/i.test(html);
      const snippetInfo = mentionsSitemap ? extractSnippet(/sitemap/i, 2) : extractSnippet(/<footer|<body/i, 4);
      
      return {
        passed: mentionsSitemap,
        details: mentionsSitemap
          ? 'Sitemap referenced in page.'
          : 'No sitemap reference found. Check /sitemap.xml manually.',
        recommendation: 'Create an XML sitemap at /sitemap.xml and reference it in robots.txt.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Heading hierarchy
    case 'seo-003': {
      const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
      const h2Count = (html.match(/<h2[^>]*>/gi) || []).length;
      const h3Count = (html.match(/<h3[^>]*>/gi) || []).length;
      const skipsLevels = h3Count > 0 && h2Count === 0;
      return {
        passed: h1Count === 1 && !skipsLevels,
        details: `Headings: ${h1Count} <h1>, ${h2Count} <h2>, ${h3Count} <h3>. ${skipsLevels ? 'Skips heading levels!' : ''}`,
        recommendation: 'Use exactly one <h1> per page. Maintain logical hierarchy: h1→h2→h3, never skip levels.'
      };
    }

    // URL structure
    case 'seo-007': {
      const urlObj = new URL(siteUrl);
      const pathname = urlObj.pathname;
      const hasQueryParams = urlObj.search.length > 0;
      const hasUnderscores = /_/.test(pathname);
      const hasCamelCase = /[A-Z]/.test(pathname);
      return {
        passed: !hasUnderscores && !hasCamelCase && pathname.length < 100,
        details: `URL: ${pathname}. Underscores: ${hasUnderscores}, CamelCase: ${hasCamelCase}, Length: ${pathname.length}`,
        recommendation: 'Use hyphens (kebab-case) in URLs. Keep URLs under 100 characters. Avoid underscores and camelCase.'
      };
    }

    // Content Security Policy
    case 'sec-002': {
      const csp = headers.get('content-security-policy');
      return {
        passed: !!csp,
        details: csp
          ? `CSP header present: ${csp.substring(0, 100)}...`
          : 'Missing Content-Security-Policy header.',
        recommendation: 'Implement Content-Security-Policy header to prevent XSS attacks.'
      };
    }

    // Security headers
    case 'sec-003': {
      const xContentType = headers.get('x-content-type-options');
      const xFrame = headers.get('x-frame-options');
      const referrerPolicy = headers.get('referrer-policy');
      const securityHeaderCount = [xContentType, xFrame, referrerPolicy].filter(Boolean).length;
      return {
        passed: securityHeaderCount >= 2,
        details: `Security headers: X-Content-Type(${!!xContentType}), X-Frame(${!!xFrame}), Referrer-Policy(${!!referrerPolicy})`,
        recommendation: 'Add security headers: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Referrer-Policy: strict-origin.'
      };
    }

    // Input validation indicators
    case 'sec-004': {
      const hasForms = /<form[^>]*>/i.test(html);
      const hasValidation = /required|pattern=|minlength=|maxlength=/i.test(html);
      return {
        passed: !hasForms || hasValidation,
        details: hasForms
          ? `Forms found. Client-side validation: ${hasValidation ? 'Yes' : 'No'}`
          : 'No forms found on page.',
        recommendation: 'Implement both client-side (HTML5) and server-side input validation for all forms.'
      };
    }

    // Airbnb - const/let
    case 'airbnb-001': {
      const hasVar = /\bvar\s+/i.test(html);
      const hasConst = /\bconst\s+/i.test(html);
      const hasLet = /\blet\s+/i.test(html);
      
      const snippetInfo = hasVar ? extractSnippet(/\bvar\s+/i, 2) : { snippet: null, lineNumber: null };
      
      return {
        passed: !hasVar && (hasConst || hasLet),
        details: `JavaScript declarations: var(${hasVar}), const(${hasConst}), let(${hasLet})`,
        recommendation: 'Use const for non-reassigned variables, let for reassignable ones. Never use var.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Arrow functions
    case 'airbnb-002': {
      const hasArrowFn = /=>\s*\{|=>\s*[^{]/i.test(html);
      const hasFunctionKeyword = /function\s*\(/i.test(html);
      
      const snippetInfo = hasFunctionKeyword && !hasArrowFn ? extractSnippet(/function\s*\(/i, 2) : (hasArrowFn ? extractSnippet(/=>/i, 1) : { snippet: null, lineNumber: null });
      
      return {
        passed: hasArrowFn || !hasFunctionKeyword,
        details: `Arrow functions: ${hasArrowFn ? 'Used' : 'Not found'}, function keyword: ${hasFunctionKeyword ? 'Used' : 'Not used'}`,
        recommendation: 'Prefer arrow functions for callbacks and anonymous functions.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Template literals
    case 'airbnb-003': {
      const hasTemplateLiterals = /`[^`]*\$\{[^}]+\}[^`]*`/i.test(html);
      const hasStringConcat = /["'][^"']*["']\s*\+\s*["'][^"']*["']/i.test(html);
      return {
        passed: hasTemplateLiterals || !hasStringConcat,
        details: `Template literals: ${hasTemplateLiterals ? 'Used' : 'Not used'}, String concatenation: ${hasStringConcat ? 'Used' : 'Not used'}`,
        recommendation: 'Use template literals (`Hello ${name}`) instead of string concatenation.'
      };
    }

    // Lazy loading
    case 'perf-001':
    case 'cwv-001': {
      const images = (html.match(/<img[^>]*>/gi) || []).length;
      const lazyImages = (html.match(/<img[^>]*loading=["']lazy["']/gi) || []).length;
      const scriptsDefer = (html.match(/<script[^>]*defer/gi) || []).length;
      const scriptsAsync = (html.match(/<script[^>]*async/gi) || []).length;
      return {
        passed: (lazyImages / images > 0.5 || images < 5) && (scriptsDefer + scriptsAsync) > 0,
        details: `${lazyImages}/${images} images lazy-loaded, ${scriptsDefer} deferred scripts, ${scriptsAsync} async scripts`,
        recommendation: 'Use loading="lazy" for below-fold images. Add defer/async to scripts to improve LCP.'
      };
    }

    // Layout shift
    case 'cwv-002': {
      const imgsWithDimensions = (html.match(/<img[^>]+(width=|height=)[^>]*>/gi) || []).length;
      const totalImages = (html.match(/<img[^>]*>/gi) || []).length;
      const imgsWithoutDimensions = html.match(/<img(?![^>]+(width=|height=))[^>]*>/gi) || [];
      
      const snippetInfo = imgsWithoutDimensions.length > 0 ? extractSnippet(new RegExp(imgsWithoutDimensions[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), 1) : { snippet: null, lineNumber: null };
      
      return {
        passed: totalImages === 0 || imgsWithDimensions / totalImages > 0.8,
        details: `${imgsWithDimensions}/${totalImages} images have width/height attributes (${Math.round(imgsWithDimensions/totalImages*100) || 0}%)`,
        recommendation: 'Add width and height attributes to all images to prevent layout shifts (CLS).',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // JavaScript execution
    case 'js-001':
    case 'cwv-003': {
      const scriptTags = (html.match(/<script[^>]*>/gi) || []).length;
      const inlineScripts = (html.match(/<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/gi) || []).length;
      const externalScripts = scriptTags - inlineScripts;
      
      const snippetInfo = scriptTags >= 15 ? extractSnippet(/<script/i, 3) : { snippet: null, lineNumber: null };
      
      return {
        passed: scriptTags < 15 && inlineScripts < 5,
        details: `Total scripts: ${scriptTags} (${externalScripts} external, ${inlineScripts} inline)`,
        recommendation: 'Minimize JavaScript: bundle files, remove unused code, use code splitting, lazy load non-critical scripts.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Loading indicators
    case 'ux-003': {
      const hasSpinner = /(spinner|loading|loader)/i.test(html);
      return {
        passed: hasSpinner,
        details: hasSpinner
          ? 'Loading indicators found in HTML/CSS.'
          : 'No loading indicators detected.',
        recommendation: 'Provide visual feedback during async operations with spinners, progress bars, or skeleton screens.'
      };
    }

    // Navigation
    case 'ux-001': {
      const hasNav = /<nav[^>]*>/i.test(html);
      const navLinks = hasNav ? (html.match(/<nav[\s\S]*?<\/nav>/i)?.[0]?.match(/<a[^>]*>/gi) || []).length : 0;
      const snippetInfo = hasNav ? extractSnippet(/<nav/i, 3) : extractSnippet(/<body/i, 5);
      
      return {
        passed: hasNav && navLinks >= 3,
        details: hasNav
          ? `Navigation found with ${navLinks} links.`
          : 'No <nav> element found.',
        recommendation: 'Include clear, consistent navigation with <nav> element containing main site links.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Form usability
    case 'ux-002': {
      const forms = (html.match(/<form[^>]*>/gi) || []).length;
      const labels = (html.match(/<label[^>]*>/gi) || []).length;
      const inputs = (html.match(/<input[^>]*>/gi) || []).length;
      const hasPlaceholders = /placeholder=/i.test(html);
      
      const snippetInfo = forms > 0 ? extractSnippet(/<form/i, 3) : { snippet: null, lineNumber: null };
      
      return {
        passed: forms === 0 || (labels > 0 && hasPlaceholders),
        details: `${forms} forms, ${inputs} inputs, ${labels} labels, Placeholders: ${hasPlaceholders}`,
        recommendation: 'Use clear labels, appropriate input types, placeholders, and validation for all forms.',
        codeSnippet: snippetInfo.snippet,
        lineNumber: snippetInfo.lineNumber
      };
    }

    // Readable content
    case 'content-001': {
      const textLength = html.replace(/<[^>]+>/g, '').trim().length;
      const avgWordLength = textLength / (html.split(/\s+/).length || 1);
      return {
        passed: avgWordLength < 6 && textLength > 100,
        details: `Content length: ${textLength} chars, Average word length: ${Math.round(avgWordLength)} chars`,
        recommendation: 'Write clear, concise content at 8th-grade reading level. Use short sentences and simple words.'
      };
    }

    // Contact information
    case 'content-002': {
      const hasEmail = /mailto:|@/i.test(html);
      const hasPhone = /tel:|phone|telefon/i.test(html);
      const hasContact = /(contact|kontakt|impressum)/i.test(html);
      return {
        passed: (hasEmail || hasPhone) && hasContact,
        details: `Email: ${hasEmail}, Phone: ${hasPhone}, Contact page: ${hasContact}`,
        recommendation: 'Provide clear contact information: email, phone, and/or contact form.'
      };
    }

    // Default case: more thorough analysis for uncategorized rules
    default: {
      // Instead of auto-passing, do basic pattern matching
      const categoryLower = rule.category.toLowerCase();
      
      // JavaScript-related rules
      if (categoryLower.includes('javascript')) {
        const scriptCount = (html.match(/<script/gi) || []).length;
        return {
          passed: scriptCount < 20,
          details: `JavaScript analysis: ${scriptCount} script tags found. Manual review recommended for: ${rule.name}`,
          recommendation: rule.examples?.good?.[0] || `Follow ${rule.source} guidelines for best practices.`
        };
      }
      
      // Performance-related rules
      if (categoryLower.includes('performance')) {
        const totalSize = html.length;
        return {
          passed: totalSize < 500000,
          details: `Page size: ${Math.round(totalSize/1024)}KB. Manual performance testing recommended for: ${rule.name}`,
          recommendation: rule.examples?.good?.[0] || 'Optimize page size, minimize resources, enable compression.'
        };
      }
      
      // Accessibility-related rules
      if (categoryLower.includes('accessibility')) {
        const hasAria = /aria-/i.test(html);
        const hasAlt = /alt=/i.test(html);
        return {
          passed: hasAria || hasAlt,
          details: `Accessibility features: ARIA(${hasAria}), Alt text(${hasAlt}). Manual testing recommended for: ${rule.name}`,
          recommendation: rule.examples?.good?.[0] || 'Follow WCAG 2.1 guidelines for accessibility.'
        };
      }
      
      // For truly unimplementable rules, mark as needing manual review
      return {
        passed: false,
        details: `This rule requires manual inspection or advanced tooling: ${rule.name}`,
        recommendation: rule.examples?.good?.[0] || `Follow ${rule.source} guidelines. Manual review needed.`
      };
    }
  }
}

function extractSiteName(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'Unknown Site';
  }
}

function generateRecommendations(violations) {
  const recommendations = [];
  const categories = {};

  violations.forEach(v => {
    if (!categories[v.category]) {
      categories[v.category] = [];
    }
    categories[v.category].push(v);
  });

  Object.entries(categories).forEach(([category, issues]) => {
    if (issues.length > 0) {
      recommendations.push(`Fix ${issues.length} ${category} issue(s)`);
    }
  });

  return recommendations.slice(0, 5); // Top 5 recommendations
}

module.exports = { analyzeWebsite };

