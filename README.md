# 🔍 Web Inspector

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Try_Now!-success?style=for-the-badge)](https://web-inspector.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-mariomuja%2Fweb--inspector-blue?style=flat-square&logo=github)](https://github.com/mariomuja/web-inspector)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-20-red?style=flat-square&logo=angular)](https://angular.io/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com/)

> **🎯 [Try the Live Demo →](https://web-inspector.vercel.app)**  
> Analyze any public website against industry best practices in seconds!

A comprehensive website analysis tool that evaluates public websites against 50+ design and development best practices from WCAG 2.1, Google Core Web Vitals, SEO standards, Security guidelines, and more. Features real-time analysis, multiple export formats, and actionable recommendations.

## 📸 Key Features

### Core Functionality
- **50+ Design & Development Rules**: Validate against WCAG 2.1, Core Web Vitals, SEO, Security, HTML/CSS/JS best practices
- **Real-Time Analysis**: Instant feedback on website quality and compliance
- **Source Selection**: Choose specific standards (WCAG, SEO, Performance) or validate against all
- **30 Pre-configured Websites**: Test against popular sites like Google, GitHub, Wikipedia, etc.
- **Custom URL Support**: Analyze any public website
- **Severity Filtering**: Filter violations by error, warning, or info level
- **Source Filtering**: View recommendations from specific authorities

### Advanced Features
- **Multiple Export Formats**:
  - PDF Document with full styling
  - Markdown for documentation
  - HTML standalone report
  - CSV for spreadsheet analysis
  - JSON for programmatic use
  - GitHub Issues format
  - JIRA Issues format
  - Quality Badge generator

### Technical Analysis Categories
- **Accessibility (WCAG 2.1)**: Alt text, color contrast, keyboard navigation, semantic HTML, ARIA
- **Performance (Core Web Vitals)**: LCP, CLS, FID/INP, page load time, image optimization
- **SEO Best Practices**: Titles, meta descriptions, headings, structured data, sitemaps
- **Security**: HTTPS, CSP, security headers, input validation
- **HTML & CSS**: Valid HTML5, DOCTYPE, meta tags, responsive design
- **JavaScript**: Execution time, render-blocking, error handling
- **Mobile Optimization**: Touch targets, interstitials, network optimization
- **User Experience**: Navigation, forms, loading indicators
- **Content Quality**: Readability, contact information

## 📁 Project Structure

```
web-inspector/
├── frontend/                          # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/           # UI components
│   │   │   │   └── web-inspector.component.*  # Main analysis interface
│   │   │   ├── models/               # TypeScript interfaces
│   │   │   │   ├── website.model.ts
│   │   │   │   └── rule-source.model.ts
│   │   │   ├── services/             # Business logic
│   │   │   │   ├── web-analysis.service.ts
│   │   │   │   ├── export.service.ts
│   │   │   │   └── pdf-export.service.ts
│   │   │   └── app.config.ts         # App configuration
│   │   └── styles.scss               # Global Material theme
│   └── package.json
├── api/                              # Vercel serverless functions
│   ├── analyze.js                    # Main analysis endpoint
│   ├── website-analyzer.js           # Core analysis engine
│   └── web-design-rules.js           # 50+ design rules catalog
└── vercel.json                       # Vercel deployment config
```

## 🔍 Analysis Rules Catalog

### Supported Authoritative Sources
1. **WCAG 2.1 (Web Content Accessibility Guidelines)** - W3C international standard for accessibility
2. **Google Core Web Vitals** - Key metrics for user experience (LCP, CLS, FID/INP)
3. **Google Search Central** - SEO best practices and guidelines
4. **OWASP** - Web security standards and practices
5. **W3C / MDN** - HTML & CSS standards and best practices
6. **MDN Web Docs** - JavaScript best practices
7. **Google Web.dev** - Mobile optimization guidelines
8. **Nielsen Norman Group** - User experience research and principles
9. **Google E-A-T** - Content quality standards

### Rule Categories (50+ Rules)
- **Accessibility (WCAG 2.1)**: 6 rules covering perceivable, operable content
- **Performance (Core Web Vitals)**: 7 rules for speed and responsiveness
- **SEO**: 7 rules for search engine optimization
- **Security**: 4 rules for HTTPS, CSP, headers, validation
- **HTML & CSS**: 6 rules for valid markup and responsive design
- **JavaScript**: 3 rules for performance and error handling
- **Mobile**: 3 rules for mobile-first design
- **UX**: 3 rules for navigation and usability
- **Content**: 2 rules for quality and trust

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 17+
- Git

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/mariomuja/web-inspector.git
cd web-inspector
```

2. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

3. **Install backend dependencies:**
```bash
cd ../api
npm install
```

### Development

1. **Start the frontend development server:**
```bash
cd frontend
npm start
# Access at http://localhost:4200
```

2. **Test serverless functions locally (optional):**
```bash
cd api
npm test
```

### Building for Production

```bash
cd frontend
npm run build -- --configuration=production
```

Build artifacts will be in `frontend/dist/frontend/browser/`

## 🎨 Usage Guide

### Basic Analysis

1. **Select Validation Source**: Choose a standard (WCAG, Core Web Vitals, SEO, etc.) or "All Sources"
2. **Select Website**: Pick from 30 pre-configured websites or enter a custom URL
3. **Click "Analyze Website"**: Wait for real-time analysis (typically 5-10 seconds)
4. **Review Results**: See violations grouped by category with severity indicators
5. **Filter Results**: Use severity and source filters to focus on specific issues
6. **Export Results**: Choose from 8 export formats

### Export Options

- **PDF**: Professional report with styling and formatting
- **Markdown**: Great for GitHub/GitLab documentation
- **HTML**: Standalone webpage with full formatting
- **CSV**: Import into Excel/Google Sheets
- **JSON**: Programmatic access to results
- **GitHub Issues**: Pre-formatted issues for GitHub
- **JIRA**: Ready-to-import JIRA tickets
- **Quality Badge**: Copy badge markdown for README

## 🔒 Security & Privacy

### Data Handling
- **No Server Storage**: All analysis happens in real-time, nothing is stored
- **Client-Side Processing**: Browser connects directly to analyzed websites
- **No Tracking**: No analytics, cookies, or user tracking
- **Open Source**: Full transparency of code and data flow

### Best Practices
- Only analyze publicly accessible websites
- Don't analyze sites with sensitive data
- Results are temporary and not logged

## 🛠️ Development

### Technology Stack
- **Frontend**: Angular 20, TypeScript, Material UI
- **Backend**: Node.js, Vercel Serverless Functions
- **Deployment**: Vercel (frontend + serverless)
- **Dependencies**: jsPDF, node-fetch

### API Endpoint

#### POST /api/analyze
Analyzes a website against design rules.

**Request:**
```json
{
  "siteUrl": "https://example.com",
  "sourceFilter": "all"
}
```

**Response:**
```json
{
  "siteName": "Example Site",
  "siteUrl": "https://example.com",
  "analyzedAt": "2025-11-10T12:00:00Z",
  "overallScore": 75,
  "violations": [...],
  "recommendations": [...],
  "summary": {
    "totalRules": 50,
    "passedRules": 38,
    "failedRules": 8,
    "warningRules": 4
  }
}
```

## 🌐 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import to Vercel**: Connect your GitHub repository
3. **Configure**: Vercel auto-detects settings from `vercel.json`
4. **Deploy**: Automatic deployment on every push to main

### Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS as instructed

## 📊 Performance

- **Analysis Speed**: 5-10 seconds for typical websites
- **Bundle Size**: ~1.2 MB (gzipped: ~220 KB)
- **Serverless Cold Start**: <1 second
- **Concurrent Users**: Unlimited (serverless scaling)

## 🎯 Use Cases

### For Web Developers
- Validate website quality before deployment
- Ensure compliance with industry standards
- Catch common mistakes early
- Generate documentation-ready reports

### For Website Owners
- Evaluate website quality and accessibility
- Improve SEO rankings
- Identify performance bottlenecks
- Ensure WCAG compliance

### For Teams
- Enforce company design standards
- Track quality improvements over time
- Export to JIRA/GitHub for task management
- Generate client reports

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is provided as-is for educational and commercial use.

## 🙏 Acknowledgments

- Built with Angular 20 and Material UI
- Powered by Vercel Serverless Functions
- Design rules inspired by WCAG, Google, OWASP, W3C, and other industry leaders
- PDF generation: jsPDF

## 📞 Support

For questions or issues:
- Check the [GitHub Issues](https://github.com/mariomuja/web-inspector/issues)
- Review the source code for implementation details
- Consult the authoritative sources linked in each violation

---

**Built with ❤️ for better web design**

---

## 💼 Professional Services

Would you like to create feature-rich services & apps in short time without expensive developers working on it for weeks and months? Let me help you. I live in Hamburg.

### 📞 Contact Me

**Germany:** +49 1520 464 14 73

**Italy:** +39 345 345 0098

**Email:** mario.muja@gmail.com

I am looking forward to hearing from you!

