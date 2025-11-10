import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';

import { WebAnalysisService } from '../services/web-analysis.service';
import { PdfExportService } from '../services/pdf-export.service';
import { ExportService } from '../services/export.service';
import { Website, WebAnalysisResult, Violation } from '../models/website.model';
import { RuleSource, RULE_SOURCES } from '../models/rule-source.model';
import { ImpressumDialogComponent } from './impressum-dialog.component';

@Component({
  selector: 'app-web-inspector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDividerModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './web-inspector.component.html',
  styleUrls: ['./web-inspector.component.scss']
})
export class WebInspectorComponent implements OnInit {
  websites = signal<Website[]>([]);
  ruleSources = signal<RuleSource[]>(RULE_SOURCES);
  selectedWebsite = signal<string>('');
  selectedSource = signal<string>('all');
  customUrl = signal<string>('');
  useCustomUrl = signal<boolean>(false);
  isAnalyzing = signal<boolean>(false);
  analysisResult = signal<WebAnalysisResult | null>(null);
  error = signal<string>('');
  
  // Filters
  filterSeverity = signal<string[]>(['error', 'warning', 'info']);
  filterSource = signal<string[]>([]);
  availableSources = signal<string[]>([]);

  constructor(
    private webAnalysisService: WebAnalysisService,
    private pdfExportService: PdfExportService,
    private exportService: ExportService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadWebsites();
  }

  loadWebsites(): void {
    this.webAnalysisService.getAvailableWebsites().subscribe({
      next: (websites) => {
        this.websites.set(websites);
      },
      error: (err) => {
        this.error.set('Failed to load websites');
        console.error('Error loading websites:', err);
      }
    });
  }

  onWebsiteSelectionChange(): void {
    if (this.selectedWebsite()) {
      this.useCustomUrl.set(false);
      this.customUrl.set('');
    }
  }

  onCustomUrlChange(): void {
    if (this.customUrl()) {
      this.useCustomUrl.set(true);
      this.selectedWebsite.set('');
    } else {
      this.useCustomUrl.set(false);
    }
  }

  analyzeWebsite(): void {
    const urlToAnalyze = this.useCustomUrl() ? this.customUrl() : this.selectedWebsite();
    
    if (!urlToAnalyze) {
      this.snackBar.open('Please select a website or enter a custom URL', 'Close', {
        duration: 3000
      });
      return;
    }

    // Validate URL format
    try {
      new URL(urlToAnalyze);
    } catch {
      this.snackBar.open('Please enter a valid URL (e.g., https://example.com)', 'Close', {
        duration: 4000
      });
      return;
    }

    this.isAnalyzing.set(true);
    this.error.set('');
    this.analysisResult.set(null);

    const sourceFilter = this.selectedSource();

    this.webAnalysisService.analyzeWebsite(urlToAnalyze, sourceFilter).subscribe({
      next: (result) => {
        this.analysisResult.set(result);
        this.isAnalyzing.set(false);
        
        // Extract unique sources from violations
        const sources = [...new Set(result.violations.map(v => v.source).filter(s => s))] as string[];
        this.availableSources.set(sources);
        this.filterSource.set(sources); // Initially show all
        
        this.snackBar.open('Analysis completed successfully', 'Close', {
          duration: 3000
        });
      },
      error: (err) => {
        this.error.set('Failed to analyze website: ' + (err.error?.message || err.message));
        this.isAnalyzing.set(false);
        this.snackBar.open('Analysis failed', 'Close', {
          duration: 3000
        });
        console.error('Analysis error:', err);
      }
    });
  }

  async exportToPdf(): Promise<void> {
    const result = this.analysisResult();
    if (!result) return;

    try {
      await this.pdfExportService.exportToPdf(result);
      this.snackBar.open('PDF exported successfully', 'Close', { duration: 3000 });
    } catch (err) {
      this.snackBar.open('Failed to export PDF', 'Close', { duration: 3000 });
      console.error('PDF export error:', err);
    }
  }

  exportToMarkdown(): void {
    const result = this.analysisResult();
    if (!result) return;
    this.exportService.exportToMarkdown(result);
    this.snackBar.open('Markdown exported successfully', 'Close', { duration: 3000 });
  }

  exportToHtml(): void {
    const result = this.analysisResult();
    if (!result) return;
    this.exportService.exportToHtml(result);
    this.snackBar.open('HTML exported successfully', 'Close', { duration: 3000 });
  }

  exportToCsv(): void {
    const result = this.analysisResult();
    if (!result) return;
    this.exportService.exportToCsv(result);
    this.snackBar.open('CSV exported successfully', 'Close', { duration: 3000 });
  }

  exportToJson(): void {
    const result = this.analysisResult();
    if (!result) return;
    this.exportService.exportToJson(result);
    this.snackBar.open('JSON exported successfully', 'Close', { duration: 3000 });
  }

  exportToGitHub(): void {
    const result = this.analysisResult();
    if (!result) return;
    this.exportService.exportToGitHubIssues(result);
    this.snackBar.open('GitHub issues format exported', 'Close', { duration: 3000 });
  }

  exportToJira(): void {
    const result = this.analysisResult();
    if (!result) return;
    this.exportService.exportToJira(result);
    this.snackBar.open('JIRA format exported successfully', 'Close', { duration: 3000 });
  }

  copyBadgeMarkdown(): void {
    const result = this.analysisResult();
    if (!result) return;
    
    const badgeUrl = this.exportService.generateBadgeUrl(result);
    const markdown = `![Website Quality](${badgeUrl})`;
    
    navigator.clipboard.writeText(markdown).then(() => {
      this.snackBar.open('Badge markdown copied to clipboard!', 'Close', { duration: 3000 });
    });
  }

  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'error':
        return 'warn';
      case 'warning':
        return 'accent';
      case 'info':
        return 'primary';
      default:
        return '';
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  }

  getFilteredViolations(): Violation[] {
    const result = this.analysisResult();
    if (!result || !result.violations) {
      return [];
    }

    return result.violations.filter(v => {
      const severityMatch = this.filterSeverity().includes(v.severity);
      const sourceMatch = this.filterSource().length === 0 || 
                         (v.source && this.filterSource().includes(v.source));
      return severityMatch && sourceMatch;
    });
  }

  getViolationsByCategory(): { [key: string]: Violation[] } {
    const filtered = this.getFilteredViolations();

    return filtered.reduce((acc, violation) => {
      if (!acc[violation.category]) {
        acc[violation.category] = [];
      }
      acc[violation.category].push(violation);
      return acc;
    }, {} as { [key: string]: Violation[] });
  }

  getCategoryKeys(): string[] {
    return Object.keys(this.getViolationsByCategory());
  }

  toggleSeverityFilter(severity: string): void {
    const current = this.filterSeverity();
    if (current.includes(severity)) {
      this.filterSeverity.set(current.filter(s => s !== severity));
    } else {
      this.filterSeverity.set([...current, severity]);
    }
  }

  toggleSourceFilter(source: string): void {
    const current = this.filterSource();
    if (current.includes(source)) {
      this.filterSource.set(current.filter(s => s !== source));
    } else {
      this.filterSource.set([...current, source]);
    }
  }

  getWebsiteIcon(categoryOrUrl: string): string {
    const category = categoryOrUrl.toLowerCase();
    const iconMap: { [key: string]: string } = {
      'search': 'search',
      'reference': 'menu_book',
      'development': 'code',
      'documentation': 'description',
      'q&a': 'question_answer',
      'e-commerce': 'shopping_cart',
      'media': 'play_circle',
      'social': 'people',
      'professional': 'work',
      'publishing': 'article',
      'learning': 'school',
      'magazine': 'article',
      'education': 'school',
      'design': 'palette',
      'news': 'newspaper',
      'hosting': 'cloud',
      'cloud': 'cloud_queue',
      'finance': 'account_balance',
      'productivity': 'task',
      'default': 'language'
    };
    return iconMap[category] || iconMap['default'];
  }

  getSelectedSourceDisplay(): string {
    const source = this.ruleSources().find(s => s.id === this.selectedSource());
    if (!source) return 'Select validation source...';
    
    // Format: "Name - Organization"
    return `${source.name} - ${source.organization}`;
  }

  openImpressum(): void {
    this.dialog.open(ImpressumDialogComponent, {
      width: '700px',
      maxHeight: '90vh'
    });
  }
}

