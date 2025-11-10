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
    // Fetch the website
    const fetch = require('node-fetch');
    const response = await fetch(siteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WebInspector/1.0; +https://web-inspector.vercel.app)'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const headers = response.headers;

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
          page: siteUrl
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
    case 'html-003':
      const hasCharset = /<meta[^>]+charset=/i.test(html);
      const hasViewport = /<meta[^>]+name=["']viewport["']/i.test(html);
      const hasDescription = /<meta[^>]+name=["']description["']/i.test(html);
      const passed = hasCharset && hasViewport;
      
      return {
        passed,
        details: `Charset: ${hasCharset ? '✓' : '✗'}, Viewport: ${hasViewport ? '✓' : '✗'}, Description: ${hasDescription ? '✓' : '✗'}`,
        recommendation: 'Add essential meta tags: <meta charset="UTF-8"> and <meta name="viewport" content="width=device-width, initial-scale=1">'
      };

    // Title tag
    case 'seo-001':
      const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
      const hasTitle = titleMatch && titleMatch[1].trim().length > 0;
      const titleLength = titleMatch ? titleMatch[1].trim().length : 0;
      const goodLength = titleLength >= 10 && titleLength <= 60;
      
      return {
        passed: hasTitle && goodLength,
        details: hasTitle 
          ? `Title "${titleMatch[1].trim()}" (${titleLength} chars). Optimal: 50-60 chars.`
          : 'Missing or empty page title.',
        recommendation: 'Add a unique, descriptive title between 50-60 characters to every page.'
      };

    // Meta description
    case 'seo-002':
      const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
      const hasDesc = descMatch && descMatch[1].trim().length > 0;
      const descLength = descMatch ? descMatch[1].trim().length : 0;
      const goodDescLength = descLength >= 120 && descLength <= 160;
      
      return {
        passed: hasDesc && goodDescLength,
        details: hasDesc
          ? `Description: "${descMatch[1].trim().substring(0, 100)}..." (${descLength} chars). Optimal: 150-160 chars.`
          : 'Missing meta description.',
        recommendation: 'Add a unique meta description of 150-160 characters to every page.'
      };

    // Alt text for images
    case 'wcag-001':
      const imgTags = html.match(/<img[^>]*>/gi) || [];
      const imgsWithoutAlt = imgTags.filter(img => !/<img[^>]+alt=/i.test(img));
      const passed = imgsWithoutAlt.length === 0 && imgTags.length > 0;
      
      return {
        passed: imgTags.length === 0 || passed,
        details: imgTags.length === 0 
          ? 'No images found on page.'
          : `${imgTags.length} images found, ${imgsWithoutAlt.length} without alt text.`,
        recommendation: 'Add descriptive alt text to all <img> tags. Use alt="" for decorative images.'
      };

    // Semantic HTML
    case 'wcag-004':
      const hasNav = /<nav/i.test(html);
      const hasMain = /<main/i.test(html);
      const hasHeader = /<header/i.test(html);
      const hasFooter = /<footer/i.test(html);
      const semanticCount = [hasNav, hasMain, hasHeader, hasFooter].filter(Boolean).length;
      
      return {
        passed: semanticCount >= 2,
        details: `Found ${semanticCount}/4 key semantic elements: nav(${hasNav}), main(${hasMain}), header(${hasHeader}), footer(${hasFooter})`,
        recommendation: 'Use semantic HTML5 elements like <nav>, <main>, <header>, <footer>, <article>, and <section>.'
      };

    // Security headers
    case 'sec-002':
    case 'sec-003':
      const csp = headers.get('content-security-policy');
      const xContentType = headers.get('x-content-type-options');
      const xFrame = headers.get('x-frame-options');
      const hasSecurityHeaders = !!(csp || xContentType || xFrame);
      
      return {
        passed: hasSecurityHeaders,
        details: `CSP: ${csp ? '✓' : '✗'}, X-Content-Type-Options: ${xContentType ? '✓' : '✗'}, X-Frame-Options: ${xFrame ? '✓' : '✗'}`,
        recommendation: 'Implement security headers: Content-Security-Policy, X-Content-Type-Options: nosniff, X-Frame-Options: DENY'
      };

    // Heading hierarchy
    case 'seo-003':
      const h1Count = (html.match(/<h1/gi) || []).length;
      const hasH1 = h1Count === 1;
      
      return {
        passed: hasH1,
        details: `Found ${h1Count} <h1> tags. Should have exactly one per page.`,
        recommendation: 'Use exactly one <h1> per page for the main heading. Use h2-h6 for subheadings in logical order.'
      };

    // Default case: basic heuristic check
    default:
      // For rules we can't automatically check, assume they need manual review
      return {
        passed: true, // Optimistic: don't flag as violation without checking
        details: 'This rule requires manual inspection or advanced tooling.',
        recommendation: rule.examples?.good?.[0] || 'Follow best practices for this rule.'
      };
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

