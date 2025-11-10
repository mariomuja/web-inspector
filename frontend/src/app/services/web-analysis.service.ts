import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { WebAnalysisResult, Website } from '../models/website.model';

@Injectable({
  providedIn: 'root'
})
export class WebAnalysisService {
  private readonly apiUrl = '/api';

  private readonly sampleWebsites: Website[] = [
    {
      id: '1',
      name: 'Google',
      url: 'https://www.google.com',
      description: 'Leading search engine with excellent performance and accessibility standards.',
      category: 'Search'
    },
    {
      id: '2',
      name: 'Wikipedia',
      url: 'https://www.wikipedia.org',
      description: 'Free online encyclopedia with strong focus on accessibility and content quality.',
      category: 'Reference'
    },
    {
      id: '3',
      name: 'GitHub',
      url: 'https://github.com',
      description: 'Developer platform for version control and collaboration.',
      category: 'Development'
    },
    {
      id: '4',
      name: 'MDN Web Docs',
      url: 'https://developer.mozilla.org',
      description: 'Comprehensive resource for web developers with excellent documentation standards.',
      category: 'Documentation'
    },
    {
      id: '5',
      name: 'Stack Overflow',
      url: 'https://stackoverflow.com',
      description: 'Question and answer community for programmers.',
      category: 'Q&A'
    },
    {
      id: '6',
      name: 'Amazon',
      url: 'https://www.amazon.com',
      description: 'E-commerce platform with advanced web performance optimization.',
      category: 'E-commerce'
    },
    {
      id: '7',
      name: 'YouTube',
      url: 'https://www.youtube.com',
      description: 'Video sharing platform with sophisticated frontend architecture.',
      category: 'Media'
    },
    {
      id: '8',
      name: 'Reddit',
      url: 'https://www.reddit.com',
      description: 'Social news aggregation and discussion platform.',
      category: 'Social'
    },
    {
      id: '9',
      name: 'Twitter (X)',
      url: 'https://twitter.com',
      description: 'Social media platform for short-form content.',
      category: 'Social'
    },
    {
      id: '10',
      name: 'LinkedIn',
      url: 'https://www.linkedin.com',
      description: 'Professional networking platform.',
      category: 'Professional'
    },
    {
      id: '11',
      name: 'Medium',
      url: 'https://medium.com',
      description: 'Online publishing platform for writers and readers.',
      category: 'Publishing'
    },
    {
      id: '12',
      name: 'Dev.to',
      url: 'https://dev.to',
      description: 'Community platform for software developers.',
      category: 'Development'
    },
    {
      id: '13',
      name: 'CSS-Tricks',
      url: 'https://css-tricks.com',
      description: 'Web design and development blog with tutorials.',
      category: 'Learning'
    },
    {
      id: '14',
      name: 'Smashing Magazine',
      url: 'https://www.smashingmagazine.com',
      description: 'Professional resource for web designers and developers.',
      category: 'Magazine'
    },
    {
      id: '15',
      name: 'A List Apart',
      url: 'https://alistapart.com',
      description: 'Magazine exploring design, development, and meaning of web content.',
      category: 'Magazine'
    },
    {
      id: '16',
      name: 'W3Schools',
      url: 'https://www.w3schools.com',
      description: 'Educational website for learning web technologies.',
      category: 'Education'
    },
    {
      id: '17',
      name: 'CodePen',
      url: 'https://codepen.io',
      description: 'Social development environment for front-end designers and developers.',
      category: 'Development'
    },
    {
      id: '18',
      name: 'Dribbble',
      url: 'https://dribbble.com',
      description: 'Platform for showcasing user-made artwork and design.',
      category: 'Design'
    },
    {
      id: '19',
      name: 'Behance',
      url: 'https://www.behance.net',
      description: 'Platform for showcasing and discovering creative work.',
      category: 'Design'
    },
    {
      id: '20',
      name: 'Hacker News',
      url: 'https://news.ycombinator.com',
      description: 'Social news website focusing on computer science and entrepreneurship.',
      category: 'News'
    },
    {
      id: '21',
      name: 'BBC News',
      url: 'https://www.bbc.com/news',
      description: 'International news website with strong accessibility standards.',
      category: 'News'
    },
    {
      id: '22',
      name: 'The Guardian',
      url: 'https://www.theguardian.com',
      description: 'British daily newspaper with progressive web app.',
      category: 'News'
    },
    {
      id: '23',
      name: 'NPR',
      url: 'https://www.npr.org',
      description: 'American public radio organization with accessible web design.',
      category: 'News'
    },
    {
      id: '24',
      name: 'Vercel',
      url: 'https://vercel.com',
      description: 'Platform for frontend frameworks with excellent performance.',
      category: 'Hosting'
    },
    {
      id: '25',
      name: 'Netlify',
      url: 'https://www.netlify.com',
      description: 'Web development platform for serverless architecture.',
      category: 'Hosting'
    },
    {
      id: '26',
      name: 'DigitalOcean',
      url: 'https://www.digitalocean.com',
      description: 'Cloud infrastructure provider with clean, modern interface.',
      category: 'Cloud'
    },
    {
      id: '27',
      name: 'Stripe',
      url: 'https://stripe.com',
      description: 'Payment processing platform with exemplary developer documentation.',
      category: 'Finance'
    },
    {
      id: '28',
      name: 'Shopify',
      url: 'https://www.shopify.com',
      description: 'E-commerce platform for online stores.',
      category: 'E-commerce'
    },
    {
      id: '29',
      name: 'Figma',
      url: 'https://www.figma.com',
      description: 'Collaborative design tool with web-based interface.',
      category: 'Design'
    },
    {
      id: '30',
      name: 'Notion',
      url: 'https://www.notion.so',
      description: 'All-in-one workspace for notes, tasks, and collaboration.',
      category: 'Productivity'
    }
  ];

  constructor(private http: HttpClient) {}

  getAvailableWebsites(): Observable<Website[]> {
    return of(this.sampleWebsites);
  }

  analyzeWebsite(siteUrl: string, sourceFilter?: string): Observable<WebAnalysisResult> {
    return this.http.post<WebAnalysisResult>(`${this.apiUrl}/analyze`, { 
      siteUrl,
      sourceFilter: sourceFilter || 'all'
    });
  }
}

